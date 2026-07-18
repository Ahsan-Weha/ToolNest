/**
 * ToolNest — Split PDF Tool
 * Extracts pages or ranges from a PDF using pdf-lib, downloads as PDF or ZIP.
 */
(function () {
    'use strict';

    let currentFile = null;
    let pdfDoc      = null;   // PDFLib document
    let pageCount   = 0;

    const dropzone  = document.getElementById('split-dropzone');
    const fileInput = document.getElementById('split-input');
    const fileInfo  = document.getElementById('split-file-info');
    const fileName  = document.getElementById('split-filename');
    const fileSize  = document.getElementById('split-filesize');
    const pageInfo  = document.getElementById('split-pagecount');
    const rangeInp  = document.getElementById('split-range');
    const splitBtn  = document.getElementById('split-btn');
    const clearBtn  = document.getElementById('split-clear');
    const modeAll   = document.getElementById('mode-all');
    const modeRange = document.getElementById('mode-range');
    const rangeRow  = document.getElementById('range-row');
    const successEl = document.getElementById('split-success');

    PDFUtils.wireDropzone('split-dropzone', 'split-input', handleFiles);

    async function handleFiles(fl) {
        const f = fl[0];
        const err = PDFUtils.validatePDF(f, 100);
        if (err) { TN.toast.error(err); return; }

        currentFile = f;
        PDFUtils.showLoader('tool-loader');
        try {
            const buf = await PDFUtils.readFileAsBuffer(f);
            const { PDFDocument } = PDFLib;
            pdfDoc    = await PDFDocument.load(buf);
            pageCount = pdfDoc.getPageCount();

            dropzone.style.display = 'none';
            fileInfo.style.display = '';
            fileName.textContent = f.name;
            fileSize.textContent = PDFUtils.formatBytes(f.size);
            pageInfo.textContent = `${pageCount} page${pageCount !== 1 ? 's' : ''}`;
            splitBtn.disabled = false;
            successEl.style.display = 'none';
        } catch (e) {
            TN.toast.error('Could not read PDF. Is it password-protected?');
            currentFile = null;
        } finally {
            PDFUtils.hideLoader('tool-loader');
        }
    }

    // Mode toggle
    [modeAll, modeRange].forEach(r => {
        r.addEventListener('change', () => {
            rangeRow.style.display = modeRange.checked ? '' : 'none';
        });
    });

    clearBtn.addEventListener('click', () => {
        currentFile = null; pdfDoc = null; pageCount = 0;
        dropzone.style.display = ''; fileInfo.style.display = 'none';
        splitBtn.disabled = true; successEl.style.display = 'none';
        PDFUtils.hideProgress('progress-container');
        TN.toast.info('Cleared.');
    });

    splitBtn.addEventListener('click', async () => {
        if (!pdfDoc) return;

        const pages = modeRange.checked ? parseRange(rangeInp.value, pageCount) : null;
        if (modeRange.checked && (!pages || pages.length === 0)) {
            TN.toast.warning('Enter a valid page range, e.g. 1-3, 5, 7-9');
            return;
        }

        splitBtn.disabled = true;
        PDFUtils.showLoader('tool-loader');
        PDFUtils.showProgress('progress-container', 'progress-bar', 10);
        successEl.style.display = 'none';

        try {
            if (modeAll.checked) {
                // Each page becomes its own PDF — zip them
                await splitAllPages();
            } else {
                // Extract the specified range as one PDF
                await extractRange(pages);
            }
            PDFUtils.showProgress('progress-container', 'progress-bar', 100);
            successEl.style.display = 'flex';
            TN.toast.success('Split complete!');
        } catch (e) {
            console.error('[split-pdf]', e);
            TN.toast.error('Split failed: ' + (e.message || 'Unknown error'));
        } finally {
            PDFUtils.hideLoader('tool-loader');
            splitBtn.disabled = false;
        }
    });

    async function splitAllPages() {
        const { PDFDocument } = PDFLib;
        const JSZip = window.JSZip;
        const zip = new JSZip();
        const baseName = currentFile.name.replace(/\.pdf$/i, '');

        for (let i = 0; i < pageCount; i++) {
            PDFUtils.showProgress('progress-container', 'progress-bar', 10 + Math.round((i / pageCount) * 85));
            const newDoc = await PDFDocument.create();
            const [copied] = await newDoc.copyPages(pdfDoc, [i]);
            newDoc.addPage(copied);
            const bytes = await newDoc.save();
            zip.file(`${baseName}_page_${i + 1}.pdf`, bytes);
        }

        PDFUtils.showProgress('progress-container', 'progress-bar', 98);
        const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 3 } });
        PDFUtils.downloadBlob(blob, `${baseName}_split.zip`);
    }

    async function extractRange(pages) {
        const { PDFDocument } = PDFLib;
        const newDoc = await PDFDocument.create();
        const indices = pages.map(p => p - 1); // 0-based
        const copied = await newDoc.copyPages(pdfDoc, indices);
        copied.forEach(p => newDoc.addPage(p));
        const bytes = await newDoc.save();
        const baseName = currentFile.name.replace(/\.pdf$/i, '');
        PDFUtils.downloadBytes(bytes, `${baseName}_extracted.pdf`);
    }

    function parseRange(str, max) {
        const parts = str.split(',').map(s => s.trim()).filter(Boolean);
        const pages = new Set();
        for (const part of parts) {
            if (part.includes('-')) {
                const [a, b] = part.split('-').map(Number);
                if (isNaN(a) || isNaN(b) || a < 1 || b > max || a > b) return null;
                for (let i = a; i <= b; i++) pages.add(i);
            } else {
                const n = Number(part);
                if (isNaN(n) || n < 1 || n > max) return null;
                pages.add(n);
            }
        }
        return pages.size > 0 ? Array.from(pages).sort((a, b) => a - b) : null;
    }

    document.querySelectorAll('.faq-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const acc = btn.closest('.faq-accordion');
            const isOpen = acc.classList.contains('active');
            document.querySelectorAll('.faq-accordion').forEach(a => a.classList.remove('active'));
            if (!isOpen) acc.classList.add('active');
        });
    });
})();

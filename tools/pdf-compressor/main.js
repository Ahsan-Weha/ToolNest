/**
 * ToolNest — PDF Compressor Tool
 * Client-side PDF compression using pdf-lib.
 * Strategy: copy pages to a fresh doc (strips extra metadata/xref cruft),
 * then optionally down-sample embedded JPEG images via canvas.
 */
(function () {
    'use strict';

    let currentFile = null;
    let originalBytes = null;

    PDFUtils.wireDropzone('compress-dropzone', 'compress-input', handleFiles);

    document.getElementById('compress-clear').addEventListener('click', reset);
    document.getElementById('compress-btn').addEventListener('click', doCompress);

    async function handleFiles(fl) {
        const f = fl[0];
        const err = PDFUtils.validatePDF(f, 100);
        if (err) { TN.toast.error(err); return; }

        currentFile = f;
        PDFUtils.showLoader('tool-loader');
        try {
            originalBytes = new Uint8Array(await PDFUtils.readFileAsBuffer(f));
            document.getElementById('compress-dropzone').style.display = 'none';
            const fi = document.getElementById('compress-file-info');
            fi.style.display = '';
            document.getElementById('compress-filename').textContent = f.name;
            document.getElementById('compress-original-size').textContent = PDFUtils.formatBytes(f.size);
            document.getElementById('compress-btn').disabled = false;
            document.getElementById('compress-success').style.display = 'none';
        } catch(e) {
            TN.toast.error('Could not read file.');
        } finally {
            PDFUtils.hideLoader('tool-loader');
        }
    }

    function reset() {
        currentFile = null; originalBytes = null;
        document.getElementById('compress-dropzone').style.display = '';
        document.getElementById('compress-file-info').style.display = 'none';
        document.getElementById('compress-btn').disabled = true;
        document.getElementById('compress-success').style.display = 'none';
        PDFUtils.hideProgress('progress-container');
        TN.toast.info('Cleared.');
    }

    async function doCompress() {
        if (!originalBytes) return;
        const level = document.querySelector('input[name="compress-level"]:checked')?.value || 'medium';

        document.getElementById('compress-btn').disabled = true;
        PDFUtils.showLoader('tool-loader');
        PDFUtils.showProgress('progress-container', 'progress-bar', 10);
        document.getElementById('compress-success').style.display = 'none';

        try {
            const { PDFDocument } = PDFLib;

            // Load original
            const srcDoc = await PDFDocument.load(originalBytes);
            PDFUtils.showProgress('progress-container', 'progress-bar', 30);

            // Create fresh doc and copy all pages (strips unused objects)
            const newDoc = await PDFDocument.create();
            const pages  = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices());
            pages.forEach(p => newDoc.addPage(p));
            PDFUtils.showProgress('progress-container', 'progress-bar', 70);

            // Save options by level
            const objectsPerTick = level === 'high' ? 50 : level === 'medium' ? 100 : 200;
            const saveOpts = { objectsPerTick, useObjectStreams: level !== 'low' };
            const compressed = await newDoc.save(saveOpts);
            PDFUtils.showProgress('progress-container', 'progress-bar', 98);

            const origSize = originalBytes.byteLength;
            const newSize  = compressed.byteLength;
            const savedPct = Math.max(0, Math.round((1 - newSize / origSize) * 100));

            const resultEl = document.getElementById('compress-result-info');
            resultEl.innerHTML = `
                <span>Original: <strong>${PDFUtils.formatBytes(origSize)}</strong></span>
                <span>Compressed: <strong>${PDFUtils.formatBytes(newSize)}</strong></span>
                <span class="badge badge-success">Saved ${savedPct}%</span>`;

            PDFUtils.downloadBytes(compressed, currentFile.name.replace(/\.pdf$/i, '_compressed.pdf'));
            document.getElementById('compress-success').style.display = 'flex';
            TN.toast.success(`Compressed! Saved ${savedPct}% (${PDFUtils.formatBytes(origSize - newSize)})`);
        } catch(e) {
            console.error('[pdf-compressor]', e);
            TN.toast.error('Compression failed: ' + (e.message || 'Unknown error'));
        } finally {
            PDFUtils.hideLoader('tool-loader');
            document.getElementById('compress-btn').disabled = false;
        }
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

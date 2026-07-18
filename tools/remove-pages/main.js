/**
 * ToolNest — Remove PDF Pages Tool
 * Lets users select page checkboxes to delete, then saves the remaining pages.
 */
(function () {
    'use strict';

    let currentFile = null;
    let pdfDoc      = null;
    let pageCount   = 0;
    const toRemove  = new Set();

    PDFUtils.wireDropzone('removepg-dropzone', 'removepg-input', handleFiles);
    document.getElementById('removepg-clear').addEventListener('click', reset);
    document.getElementById('removepg-btn').addEventListener('click', doRemove);

    async function handleFiles(fl) {
        const f = fl[0];
        const err = PDFUtils.validatePDF(f, 100);
        if (err) { TN.toast.error(err); return; }

        currentFile = f;
        PDFUtils.showLoader('tool-loader');
        try {
            const { PDFDocument } = PDFLib;
            const buf = await PDFUtils.readFileAsBuffer(f);
            pdfDoc    = await PDFDocument.load(buf, { ignoreEncryption: true });
            pageCount = pdfDoc.getPageCount();
            toRemove.clear();

            document.getElementById('removepg-dropzone').style.display = 'none';
            document.getElementById('removepg-file-info').style.display = '';
            document.getElementById('removepg-filename').textContent = f.name;
            document.getElementById('removepg-pagecount').textContent = `${pageCount} pages`;
            document.getElementById('removepg-btn').disabled = false;
            document.getElementById('removepg-success').style.display = 'none';
            renderPageGrid();
        } catch(e) {
            TN.toast.error('Could not load PDF.');
        } finally {
            PDFUtils.hideLoader('tool-loader');
        }
    }

    function renderPageGrid() {
        const grid = document.getElementById('removepg-page-grid');
        grid.innerHTML = '';
        for (let i = 0; i < pageCount; i++) {
            const checked = toRemove.has(i);
            const cell = document.createElement('label');
            cell.className = `page-check-cell ${checked ? 'selected' : ''}`;
            cell.title = `Page ${i + 1}`;
            cell.innerHTML = `
                <input type="checkbox" ${checked ? 'checked' : ''} data-idx="${i}" style="position:absolute;opacity:0;pointer-events:none">
                <div class="page-check-thumb">
                    <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
                        <rect width="60" height="80" rx="4" fill="var(--bg-input)"/>
                        <rect x="10" y="15" width="40" height="4" rx="2" fill="var(--border-color-hover)"/>
                        <rect x="10" y="24" width="30" height="3" rx="1.5" fill="var(--border-color)"/>
                        <rect x="10" y="31" width="35" height="3" rx="1.5" fill="var(--border-color)"/>
                        <rect x="10" y="38" width="25" height="3" rx="1.5" fill="var(--border-color)"/>
                    </svg>
                    ${checked ? '<div class="page-check-overlay"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" width="24" height="24"><path d="M18 6L6 18M6 6l12 12"/></svg></div>' : ''}
                </div>
                <span class="text-xs text-muted" style="margin-top:4px">Page ${i+1}</span>`;
            cell.addEventListener('click', () => {
                const idx = i;
                if (toRemove.has(idx)) toRemove.delete(idx);
                else toRemove.add(idx);
                renderPageGrid();
                updateCounter();
            });
            grid.appendChild(cell);
        }
    }

    function updateCounter() {
        const c = document.getElementById('removepg-counter');
        if (c) c.textContent = toRemove.size > 0 ? `${toRemove.size} page${toRemove.size !== 1 ? 's' : ''} selected for removal` : '';
        document.getElementById('removepg-btn').disabled = toRemove.size === 0;
    }

    function reset() {
        currentFile = null; pdfDoc = null; pageCount = 0; toRemove.clear();
        document.getElementById('removepg-dropzone').style.display = '';
        document.getElementById('removepg-file-info').style.display = 'none';
        document.getElementById('removepg-page-grid').innerHTML = '';
        document.getElementById('removepg-btn').disabled = true;
        document.getElementById('removepg-success').style.display = 'none';
        PDFUtils.hideProgress('progress-container');
        TN.toast.info('Cleared.');
    }

    async function doRemove() {
        if (!pdfDoc || toRemove.size === 0) return;
        if (toRemove.size >= pageCount) {
            TN.toast.warning('Cannot remove all pages. Keep at least one.');
            return;
        }

        document.getElementById('removepg-btn').disabled = true;
        PDFUtils.showLoader('tool-loader');
        PDFUtils.showProgress('progress-container', 'progress-bar', 20);
        document.getElementById('removepg-success').style.display = 'none';

        try {
            const { PDFDocument } = PDFLib;
            const buf = await PDFUtils.readFileAsBuffer(currentFile);
            const src = await PDFDocument.load(buf, { ignoreEncryption: true });
            const newDoc = await PDFDocument.create();

            const keepIndices = [];
            for (let i = 0; i < pageCount; i++) {
                if (!toRemove.has(i)) keepIndices.push(i);
            }

            PDFUtils.showProgress('progress-container', 'progress-bar', 50);
            const copied = await newDoc.copyPages(src, keepIndices);
            copied.forEach(p => newDoc.addPage(p));
            PDFUtils.showProgress('progress-container', 'progress-bar', 90);
            const bytes = await newDoc.save();
            PDFUtils.showProgress('progress-container', 'progress-bar', 100);
            PDFUtils.downloadBytes(bytes, currentFile.name.replace(/\.pdf$/i, '_trimmed.pdf'));
            document.getElementById('removepg-success').style.display = 'flex';
            document.getElementById('removepg-result-info').textContent =
                `Removed ${toRemove.size} page${toRemove.size !== 1 ? 's' : ''}. ${keepIndices.length} pages remain.`;
            TN.toast.success(`Removed ${toRemove.size} page${toRemove.size !== 1 ? 's' : ''}!`);
        } catch(e) {
            console.error('[remove-pages]', e);
            TN.toast.error('Failed: ' + (e.message || 'Unknown error'));
        } finally {
            PDFUtils.hideLoader('tool-loader');
            document.getElementById('removepg-btn').disabled = false;
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

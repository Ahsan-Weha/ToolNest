/**
 * ToolNest — Rotate PDF Tool
 * Rotates individual or all pages using pdf-lib.
 */
(function () {
    'use strict';

    let currentFile = null;
    let pdfDoc      = null;
    let pageCount   = 0;
    const pageSelections = {}; // { pageIndex: degrees }

    PDFUtils.wireDropzone('rotate-dropzone', 'rotate-input', handleFiles);
    document.getElementById('rotate-clear').addEventListener('click', reset);
    document.getElementById('rotate-btn').addEventListener('click', doRotate);
    document.getElementById('rotate-all-btn').addEventListener('click', rotateAll);

    async function handleFiles(fl) {
        const f = fl[0];
        const err = PDFUtils.validatePDF(f, 100);
        if (err) { TN.toast.error(err); return; }

        currentFile = f;
        PDFUtils.showLoader('tool-loader');
        try {
            const { PDFDocument } = PDFLib;
            const buf = await PDFUtils.readFileAsBuffer(f);
            pdfDoc = await PDFDocument.load(buf);
            pageCount = pdfDoc.getPageCount();

            document.getElementById('rotate-dropzone').style.display = 'none';
            document.getElementById('rotate-file-info').style.display = '';
            document.getElementById('rotate-filename').textContent = f.name;
            document.getElementById('rotate-pagecount').textContent = `${pageCount} page${pageCount !== 1 ? 's' : ''}`;
            document.getElementById('rotate-btn').disabled = false;
            document.getElementById('rotate-all-btn').disabled = false;
            document.getElementById('rotate-success').style.display = 'none';
            renderPageList();
        } catch(e) {
            TN.toast.error('Could not load PDF. May be encrypted.');
        } finally {
            PDFUtils.hideLoader('tool-loader');
        }
    }

    function renderPageList() {
        const container = document.getElementById('page-rotation-list');
        container.innerHTML = '';
        for (let i = 0; i < pageCount; i++) {
            const deg = pageSelections[i] || 0;
            const p = pdfDoc.getPage(i);
            const currentRot = p.getRotation().angle;
            const div = document.createElement('div');
            div.className = 'page-rot-item';
            div.innerHTML = `
                <span class="text-sm">Page ${i + 1}</span>
                <span class="text-xs text-muted">Current: ${currentRot}°</span>
                <div class="flex gap-05">
                    <button class="btn btn-secondary btn-sm" onclick="RotatePDF.setPage(${i},90)" title="+90°">+90°</button>
                    <button class="btn btn-secondary btn-sm" onclick="RotatePDF.setPage(${i},180)" title="180°">180°</button>
                    <button class="btn btn-secondary btn-sm" onclick="RotatePDF.setPage(${i},-90)" title="-90°">−90°</button>
                    <button class="btn btn-ghost btn-sm" onclick="RotatePDF.setPage(${i},0)">Reset</button>
                </div>
                <span class="badge ${deg !== 0 ? 'badge-primary' : 'badge-secondary'}" id="rot-badge-${i}">${deg !== 0 ? 'Δ' + (deg > 0 ? '+' : '') + deg + '°' : 'No change'}</span>`;
            container.appendChild(div);
        }
    }

    window.RotatePDF = {
        setPage(idx, deg) {
            pageSelections[idx] = deg;
            const badge = document.getElementById(`rot-badge-${idx}`);
            if (badge) {
                badge.textContent = deg !== 0 ? 'Δ' + (deg > 0 ? '+' : '') + deg + '°' : 'No change';
                badge.className = `badge ${deg !== 0 ? 'badge-primary' : 'badge-secondary'}`;
            }
        }
    };

    function rotateAll() {
        const deg = parseInt(document.getElementById('rotate-all-deg').value, 10);
        for (let i = 0; i < pageCount; i++) pageSelections[i] = deg;
        renderPageList();
        TN.toast.info(`All pages set to ${deg > 0 ? '+' : ''}${deg}°`);
    }

    function reset() {
        currentFile = null; pdfDoc = null; pageCount = 0;
        Object.keys(pageSelections).forEach(k => delete pageSelections[k]);
        document.getElementById('rotate-dropzone').style.display = '';
        document.getElementById('rotate-file-info').style.display = 'none';
        document.getElementById('rotate-btn').disabled = true;
        document.getElementById('rotate-all-btn').disabled = true;
        document.getElementById('rotate-success').style.display = 'none';
        document.getElementById('page-rotation-list').innerHTML = '';
        PDFUtils.hideProgress('progress-container');
        TN.toast.info('Cleared.');
    }

    async function doRotate() {
        if (!pdfDoc) return;

        document.getElementById('rotate-btn').disabled = true;
        PDFUtils.showLoader('tool-loader');
        PDFUtils.showProgress('progress-container', 'progress-bar', 10);
        document.getElementById('rotate-success').style.display = 'none';

        try {
            const { PDFDocument, degrees } = PDFLib;
            const buf = await PDFUtils.readFileAsBuffer(currentFile);
            const doc = await PDFDocument.load(buf);

            for (let i = 0; i < doc.getPageCount(); i++) {
                const delta = pageSelections[i] || 0;
                if (delta === 0) continue;
                const page = doc.getPage(i);
                const cur  = page.getRotation().angle;
                page.setRotation(degrees((cur + delta + 360) % 360));
            }

            PDFUtils.showProgress('progress-container', 'progress-bar', 90);
            const bytes = await doc.save();
            PDFUtils.showProgress('progress-container', 'progress-bar', 100);
            PDFUtils.downloadBytes(bytes, currentFile.name.replace(/\.pdf$/i, '_rotated.pdf'));
            document.getElementById('rotate-success').style.display = 'flex';
            TN.toast.success('Rotation applied!');
        } catch(e) {
            console.error('[rotate-pdf]', e);
            TN.toast.error('Rotation failed: ' + (e.message || 'Unknown error'));
        } finally {
            PDFUtils.hideLoader('tool-loader');
            document.getElementById('rotate-btn').disabled = false;
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

/**
 * ToolNest — Merge PDF Tool
 * Combines multiple PDF files into one document using pdf-lib.
 */
(function () {
    'use strict';

    // ── State ────────────────────────────────────────────────────────────────
    let files = []; // Array of File objects

    // ── DOM refs ─────────────────────────────────────────────────────────────
    const dropzone   = document.getElementById('merge-dropzone');
    const fileInput  = document.getElementById('merge-input');
    const fileList   = document.getElementById('file-list');
    const mergeBtn   = document.getElementById('merge-btn');
    const clearBtn   = document.getElementById('merge-clear');
    const successEl  = document.getElementById('merge-success');

    // ── Dropzone wiring ──────────────────────────────────────────────────────
    PDFUtils.wireDropzone('merge-dropzone', 'merge-input', handleFiles);

    function handleFiles(fileList_) {
        Array.from(fileList_).forEach(f => {
            const err = PDFUtils.validatePDF(f, 100);
            if (err) { TN.toast.error(err); return; }
            // Dedupe by name+size
            if (!files.find(x => x.name === f.name && x.size === f.size)) {
                files.push(f);
            }
        });
        renderList();
    }

    // ── Render file queue ────────────────────────────────────────────────────
    function renderList() {
        successEl.style.display = 'none';
        PDFUtils.hideProgress('progress-container');

        if (files.length === 0) {
            fileList.style.display = 'none';
            dropzone.style.display = '';
            mergeBtn.disabled = true;
            return;
        }

        dropzone.style.display = 'none';
        fileList.style.display = 'flex';
        mergeBtn.disabled = false;

        fileList.innerHTML = files.map((f, i) => `
            <div class="file-item" data-idx="${i}">
                <svg style="flex-shrink:0;color:var(--primary);width:1.2rem;height:1.2rem" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span class="file-item-name" title="${f.name}">${f.name}</span>
                <span class="file-item-size">${PDFUtils.formatBytes(f.size)}</span>
                <div class="flex gap-05">
                    <button class="file-item-btn" title="Move up" onclick="MergePDF.move(${i},-1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 15l7-7 7 7"/></svg></button>
                    <button class="file-item-btn" title="Move down" onclick="MergePDF.move(${i},1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 9l-7 7-7-7"/></svg></button>
                    <button class="file-item-btn" title="Remove" onclick="MergePDF.remove(${i})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                </div>
            </div>
        `).join('') + `
            <button class="btn btn-ghost btn-sm" style="align-self:flex-start;margin-top:var(--spacing-1)" onclick="document.getElementById('merge-input').click()">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Add more PDFs
            </button>`;
    }

    // ── Move / remove ─────────────────────────────────────────────────────────
    window.MergePDF = {
        move(idx, dir) {
            const newIdx = idx + dir;
            if (newIdx < 0 || newIdx >= files.length) return;
            [files[idx], files[newIdx]] = [files[newIdx], files[idx]];
            renderList();
        },
        remove(idx) {
            files.splice(idx, 1);
            renderList();
        }
    };

    // ── Clear ─────────────────────────────────────────────────────────────────
    clearBtn.addEventListener('click', () => {
        files = [];
        renderList();
        successEl.style.display = 'none';
        TN.toast.info('File list cleared.');
    });

    // ── Merge ─────────────────────────────────────────────────────────────────
    mergeBtn.addEventListener('click', async () => {
        if (files.length < 1) { TN.toast.warning('Add at least one PDF to merge.'); return; }

        mergeBtn.disabled = true;
        PDFUtils.showLoader('tool-loader');
        successEl.style.display = 'none';
        PDFUtils.showProgress('progress-container', 'progress-bar', 5);

        try {
            const { PDFDocument } = PDFLib;
            const merged = await PDFDocument.create();

            for (let i = 0; i < files.length; i++) {
                const pct = 5 + Math.round(((i) / files.length) * 90);
                PDFUtils.showProgress('progress-container', 'progress-bar', pct);

                const buf   = await PDFUtils.readFileAsBuffer(files[i]);
                let srcDoc;
                try {
                    srcDoc = await PDFDocument.load(buf, { ignoreEncryption: false });
                } catch (e) {
                    TN.toast.error(`"${files[i].name}" is password-protected. Please unlock it first.`);
                    continue;
                }
                const pageIdxs = srcDoc.getPageIndices();
                const copied   = await merged.copyPages(srcDoc, pageIdxs);
                copied.forEach(p => merged.addPage(p));
            }

            PDFUtils.showProgress('progress-container', 'progress-bar', 98);
            const pdfBytes = await merged.save();
            PDFUtils.showProgress('progress-container', 'progress-bar', 100);

            const firstName = files[0].name.replace(/\.pdf$/i, '');
            PDFUtils.downloadBytes(pdfBytes, `${firstName}-merged.pdf`);

            successEl.style.display = 'flex';
            TN.toast.success('PDFs merged successfully!');
        } catch (err) {
            console.error('[merge-pdf]', err);
            TN.toast.error('Merge failed: ' + (err.message || 'Unknown error'));
        } finally {
            PDFUtils.hideLoader('tool-loader');
            mergeBtn.disabled = false;
        }
    });

    // ── FAQ accordion ─────────────────────────────────────────────────────────
    document.querySelectorAll('.faq-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const acc = btn.closest('.faq-accordion');
            const isOpen = acc.classList.contains('active');
            document.querySelectorAll('.faq-accordion').forEach(a => a.classList.remove('active'));
            if (!isOpen) acc.classList.add('active');
            btn.setAttribute('aria-expanded', !isOpen);
        });
    });
})();

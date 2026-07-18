/**
 * ToolNest — JPG to PDF Tool
 * Embeds multiple images into a PDF document using pdf-lib.
 */
(function () {
    'use strict';

    let images = []; // Array of { file, dataUrl }

    PDFUtils.wireDropzone('jpgtopdf-dropzone', 'jpgtopdf-input', handleFiles);
    document.getElementById('jpgtopdf-clear').addEventListener('click', reset);
    document.getElementById('jpgtopdf-btn').addEventListener('click', doConvert);

    async function handleFiles(fl) {
        for (const f of Array.from(fl)) {
            const err = PDFUtils.validateImage(f, 50);
            if (err) { TN.toast.error(`${f.name}: ${err}`); continue; }
            if (images.find(x => x.file.name === f.name && x.file.size === f.size)) continue;
            const dataUrl = await PDFUtils.readFileAsDataURL(f);
            images.push({ file: f, dataUrl });
        }
        renderList();
    }

    function renderList() {
        document.getElementById('jpgtopdf-success').style.display = 'none';
        if (images.length === 0) {
            document.getElementById('jpgtopdf-dropzone').style.display = '';
            document.getElementById('jpgtopdf-list').style.display = 'none';
            document.getElementById('jpgtopdf-btn').disabled = true;
            return;
        }
        document.getElementById('jpgtopdf-dropzone').style.display = 'none';
        document.getElementById('jpgtopdf-list').style.display = 'flex';
        document.getElementById('jpgtopdf-btn').disabled = false;

        const container = document.getElementById('jpgtopdf-list');
        container.innerHTML = images.map((img, i) => `
            <div class="file-item" style="align-items:center">
                <img src="${img.dataUrl}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;flex-shrink:0">
                <span class="file-item-name" title="${img.file.name}">${img.file.name}</span>
                <span class="file-item-size">${PDFUtils.formatBytes(img.file.size)}</span>
                <div class="flex gap-05">
                    <button class="file-item-btn" title="Move up" onclick="JPGtoPDF.move(${i},-1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 15l7-7 7 7"/></svg></button>
                    <button class="file-item-btn" title="Move down" onclick="JPGtoPDF.move(${i},1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 9l-7 7-7-7"/></svg></button>
                    <button class="file-item-btn" title="Remove" onclick="JPGtoPDF.remove(${i})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                </div>
            </div>`).join('') + `
            <button class="btn btn-ghost btn-sm" style="align-self:flex-start" onclick="document.getElementById('jpgtopdf-input').click()">+ Add more images</button>`;
    }

    window.JPGtoPDF = {
        move(idx, dir) {
            const ni = idx + dir;
            if (ni < 0 || ni >= images.length) return;
            [images[idx], images[ni]] = [images[ni], images[idx]];
            renderList();
        },
        remove(idx) {
            images.splice(idx, 1);
            renderList();
        }
    };

    function reset() {
        images = [];
        renderList();
        document.getElementById('jpgtopdf-success').style.display = 'none';
        TN.toast.info('Cleared.');
    }

    async function doConvert() {
        if (images.length === 0) return;

        const pageSize   = document.getElementById('page-size').value;
        const orientation = document.getElementById('orientation').value;
        const margin     = parseInt(document.getElementById('margin').value, 10) || 0;

        document.getElementById('jpgtopdf-btn').disabled = true;
        PDFUtils.showLoader('tool-loader');
        PDFUtils.showProgress('progress-container', 'progress-bar', 5);
        document.getElementById('jpgtopdf-success').style.display = 'none';

        try {
            const { PDFDocument, PageSizes } = PDFLib;
            const pdfDoc = await PDFDocument.create();

            const PAGE_DIMS = {
                a4:     [595.28, 841.89],
                letter: [612, 792],
                fit:    null
            };

            for (let i = 0; i < images.length; i++) {
                PDFUtils.showProgress('progress-container', 'progress-bar', 5 + Math.round((i / images.length) * 90));
                const { file, dataUrl } = images[i];

                const base64 = dataUrl.split(',')[1];
                const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
                const isPng  = file.type === 'image/png';
                const isWebp = file.type === 'image/webp';

                let embeddedImage;
                const binaryStr = atob(base64);
                const bytes = Uint8Array.from(binaryStr, c => c.charCodeAt(0));

                if (isJpeg) {
                    embeddedImage = await pdfDoc.embedJpg(bytes);
                } else if (isPng) {
                    embeddedImage = await pdfDoc.embedPng(bytes);
                } else if (isWebp) {
                    // Convert WebP to PNG via canvas
                    const canvas = document.createElement('canvas');
                    const img = new Image();
                    await new Promise(res => { img.onload = res; img.src = dataUrl; });
                    canvas.width = img.width; canvas.height = img.height;
                    canvas.getContext('2d').drawImage(img, 0, 0);
                    const pngDataUrl = canvas.toDataURL('image/png');
                    const pngBase64  = pngDataUrl.split(',')[1];
                    const pngBytes   = Uint8Array.from(atob(pngBase64), c => c.charCodeAt(0));
                    embeddedImage = await pdfDoc.embedPng(pngBytes);
                } else {
                    TN.toast.warning(`Skipping unsupported format: ${file.name}`);
                    continue;
                }

                const imgW = embeddedImage.width;
                const imgH = embeddedImage.height;

                let [pgW, pgH] = pageSize === 'fit' ? [imgW + margin * 2, imgH + margin * 2] : PAGE_DIMS[pageSize];
                if (orientation === 'landscape') [pgW, pgH] = [pgH, pgW];

                const page = pdfDoc.addPage([pgW, pgH]);
                const availW = pgW - margin * 2;
                const availH = pgH - margin * 2;
                const scale  = Math.min(availW / imgW, availH / imgH);
                const drawW  = imgW * scale;
                const drawH  = imgH * scale;
                const x = margin + (availW - drawW) / 2;
                const y = margin + (availH - drawH) / 2;
                page.drawImage(embeddedImage, { x, y, width: drawW, height: drawH });
            }

            PDFUtils.showProgress('progress-container', 'progress-bar', 98);
            const pdfBytes = await pdfDoc.save();
            PDFUtils.showProgress('progress-container', 'progress-bar', 100);
            PDFUtils.downloadBytes(pdfBytes, `images_to_pdf_${Date.now()}.pdf`);
            document.getElementById('jpgtopdf-success').style.display = 'flex';
            TN.toast.success(`PDF created with ${images.length} page${images.length !== 1 ? 's' : ''}!`);
        } catch(e) {
            console.error('[jpg-to-pdf]', e);
            TN.toast.error('Conversion failed: ' + (e.message || 'Unknown error'));
        } finally {
            PDFUtils.hideLoader('tool-loader');
            document.getElementById('jpgtopdf-btn').disabled = false;
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

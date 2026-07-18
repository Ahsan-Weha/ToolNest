/**
 * ToolNest — Add Watermark to PDF Tool
 * Draws text watermarks diagonally across all pages using pdf-lib.
 */
(function () {
    'use strict';

    let currentFile = null;

    PDFUtils.wireDropzone('watermark-dropzone', 'watermark-input', handleFiles);
    document.getElementById('watermark-clear').addEventListener('click', reset);
    document.getElementById('watermark-btn').addEventListener('click', doWatermark);

    // Live preview update
    ['watermark-text','watermark-size','watermark-opacity','watermark-color'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updatePreview);
    });

    function updatePreview() {
        const text    = document.getElementById('watermark-text').value || 'CONFIDENTIAL';
        const size    = document.getElementById('watermark-size').value || 48;
        const opacity = document.getElementById('watermark-opacity').value || 30;
        const color   = document.getElementById('watermark-color').value || '#ffffff';
        const prev    = document.getElementById('watermark-preview-text');
        if (prev) {
            prev.textContent = text;
            prev.style.fontSize = Math.min(size, 60) + 'px';
            prev.style.color = color;
            prev.style.opacity = (opacity / 100).toFixed(2);
        }
    }

    async function handleFiles(fl) {
        const f = fl[0];
        const err = PDFUtils.validatePDF(f, 100);
        if (err) { TN.toast.error(err); return; }

        currentFile = f;
        document.getElementById('watermark-dropzone').style.display = 'none';
        document.getElementById('watermark-file-info').style.display = '';
        document.getElementById('watermark-filename').textContent = f.name;
        document.getElementById('watermark-filesize').textContent = PDFUtils.formatBytes(f.size);
        document.getElementById('watermark-btn').disabled = false;
        document.getElementById('watermark-success').style.display = 'none';
    }

    function reset() {
        currentFile = null;
        document.getElementById('watermark-dropzone').style.display = '';
        document.getElementById('watermark-file-info').style.display = 'none';
        document.getElementById('watermark-btn').disabled = true;
        document.getElementById('watermark-success').style.display = 'none';
        PDFUtils.hideProgress('progress-container');
        TN.toast.info('Cleared.');
    }

    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1,3),16)/255;
        const g = parseInt(hex.slice(3,5),16)/255;
        const b = parseInt(hex.slice(5,7),16)/255;
        return { r, g, b };
    }

    async function doWatermark() {
        if (!currentFile) return;

        const text    = document.getElementById('watermark-text').value.trim() || 'CONFIDENTIAL';
        const fontSize = parseInt(document.getElementById('watermark-size').value, 10) || 48;
        const opacity  = parseFloat(document.getElementById('watermark-opacity').value) / 100 || 0.3;
        const colorHex = document.getElementById('watermark-color').value || '#ffffff';
        const angle    = parseInt(document.getElementById('watermark-angle').value, 10) || -45;

        document.getElementById('watermark-btn').disabled = true;
        PDFUtils.showLoader('tool-loader');
        PDFUtils.showProgress('progress-container', 'progress-bar', 10);
        document.getElementById('watermark-success').style.display = 'none';

        try {
            const { PDFDocument, rgb, degrees, StandardFonts } = PDFLib;
            const buf    = await PDFUtils.readFileAsBuffer(currentFile);
            const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
            const font   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const { r, g, b } = hexToRgb(colorHex);
            const pages = pdfDoc.getPages();
            const total = pages.length;

            for (let i = 0; i < total; i++) {
                PDFUtils.showProgress('progress-container', 'progress-bar', 10 + Math.round((i / total) * 85));
                const page = pages[i];
                const { width, height } = page.getSize();
                // Draw watermark centered on page
                const textWidth = font.widthOfTextAtSize(text, fontSize);
                page.drawText(text, {
                    x: (width - textWidth) / 2,
                    y: height / 2,
                    size: fontSize,
                    font,
                    color: rgb(r, g, b),
                    opacity,
                    rotate: degrees(angle),
                });
            }

            PDFUtils.showProgress('progress-container', 'progress-bar', 98);
            const bytes = await pdfDoc.save();
            PDFUtils.showProgress('progress-container', 'progress-bar', 100);
            PDFUtils.downloadBytes(bytes, currentFile.name.replace(/\.pdf$/i, '_watermarked.pdf'));
            document.getElementById('watermark-success').style.display = 'flex';
            TN.toast.success('Watermark applied to all pages!');
        } catch(e) {
            console.error('[add-watermark]', e);
            TN.toast.error('Failed: ' + (e.message || 'Unknown error'));
        } finally {
            PDFUtils.hideLoader('tool-loader');
            document.getElementById('watermark-btn').disabled = false;
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

    // Init preview
    updatePreview();
})();

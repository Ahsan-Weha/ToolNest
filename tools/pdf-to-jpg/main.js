/**
 * ToolNest — PDF to JPG Tool
 * Renders each PDF page to a JPEG image using pdfjs-dist,
 * then packages them all into a ZIP with JSZip.
 */
(function () {
    'use strict';

    let currentFile = null;

    // Configure pdf.js worker
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
    }

    PDFUtils.wireDropzone('pdftojpg-dropzone', 'pdftojpg-input', handleFiles);
    document.getElementById('pdftojpg-clear').addEventListener('click', reset);
    document.getElementById('pdftojpg-btn').addEventListener('click', doConvert);

    async function handleFiles(fl) {
        const f = fl[0];
        const err = PDFUtils.validatePDF(f, 100);
        if (err) { TN.toast.error(err); return; }

        currentFile = f;
        document.getElementById('pdftojpg-dropzone').style.display = 'none';
        document.getElementById('pdftojpg-file-info').style.display = '';
        document.getElementById('pdftojpg-filename').textContent = f.name;
        document.getElementById('pdftojpg-filesize').textContent = PDFUtils.formatBytes(f.size);
        document.getElementById('pdftojpg-btn').disabled = false;
        document.getElementById('pdftojpg-success').style.display = 'none';
    }

    function reset() {
        currentFile = null;
        document.getElementById('pdftojpg-dropzone').style.display = '';
        document.getElementById('pdftojpg-file-info').style.display = 'none';
        document.getElementById('pdftojpg-btn').disabled = true;
        document.getElementById('pdftojpg-success').style.display = 'none';
        PDFUtils.hideProgress('progress-container');
        TN.toast.info('Cleared.');
    }

    async function doConvert() {
        if (!currentFile) return;
        if (typeof pdfjsLib === 'undefined') {
            TN.toast.error('PDF.js library not loaded. Please check your internet connection.');
            return;
        }

        const scale = parseFloat(document.getElementById('dpi-select').value) || 1.5;
        const fmt   = document.getElementById('format-select').value || 'jpeg';
        const quality = fmt === 'jpeg' ? 0.92 : 1.0;

        document.getElementById('pdftojpg-btn').disabled = true;
        PDFUtils.showLoader('tool-loader');
        PDFUtils.showProgress('progress-container', 'progress-bar', 5);
        document.getElementById('pdftojpg-success').style.display = 'none';

        try {
            const buf    = await PDFUtils.readFileAsBuffer(currentFile);
            const typedArr = new Uint8Array(buf);
            const pdf    = await pdfjsLib.getDocument({ data: typedArr }).promise;
            const total  = pdf.numPages;
            const zip    = new JSZip();
            const baseName = currentFile.name.replace(/\.pdf$/i, '');

            for (let i = 1; i <= total; i++) {
                PDFUtils.showProgress('progress-container', 'progress-bar', 5 + Math.round((i / total) * 88));
                const page     = await pdf.getPage(i);
                const viewport = page.getViewport({ scale });
                const canvas   = document.createElement('canvas');
                canvas.width   = viewport.width;
                canvas.height  = viewport.height;
                const ctx = canvas.getContext('2d');
                await page.render({ canvasContext: ctx, viewport }).promise;
                const dataUrl = canvas.toDataURL(`image/${fmt}`, quality);
                const base64  = dataUrl.split(',')[1];
                zip.file(`${baseName}_page_${String(i).padStart(3, '0')}.${fmt === 'jpeg' ? 'jpg' : 'png'}`, base64, { base64: true });
            }

            PDFUtils.showProgress('progress-container', 'progress-bar', 97);
            const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 3 } });
            PDFUtils.showProgress('progress-container', 'progress-bar', 100);

            PDFUtils.downloadBlob(blob, `${baseName}_images.zip`);
            document.getElementById('pdftojpg-success').style.display = 'flex';
            document.getElementById('pdftojpg-result-info').textContent = `Converted ${total} page${total !== 1 ? 's' : ''} to ${fmt.toUpperCase()}.`;
            TN.toast.success(`Converted ${total} pages!`);
        } catch(e) {
            console.error('[pdf-to-jpg]', e);
            TN.toast.error('Conversion failed: ' + (e.message || 'Unknown error'));
        } finally {
            PDFUtils.hideLoader('tool-loader');
            document.getElementById('pdftojpg-btn').disabled = false;
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

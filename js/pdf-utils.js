/**
 * ToolNest — Shared PDF Utilities
 * Common helpers reused across all PDF tool pages.
 * Each tool page loads this AFTER app.js but BEFORE its own main.js.
 */
window.PDFUtils = (function () {

    /* -------------------------------------------------------------------------
       FORMAT HELPERS
    -------------------------------------------------------------------------- */
    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    /* -------------------------------------------------------------------------
       PROGRESS BAR
    -------------------------------------------------------------------------- */
    function showProgress(containerId, barId, percent) {
        const c = document.getElementById(containerId);
        const b = document.getElementById(barId);
        if (!c || !b) return;
        c.style.display = 'block';
        b.style.width = Math.min(100, percent) + '%';
    }

    function hideProgress(containerId) {
        const c = document.getElementById(containerId);
        if (c) c.style.display = 'none';
    }

    /* -------------------------------------------------------------------------
       DROPZONE WIRING
       Attaches drag-over visual states and click-to-browse to a dropzone element.
       onFiles(FileList) is called when files are chosen.
    -------------------------------------------------------------------------- */
    function wireDropzone(dropzoneId, inputId, onFiles, opts) {
        opts = opts || {};
        const zone = document.getElementById(dropzoneId);
        const inp  = document.getElementById(inputId);
        if (!zone || !inp) return;

        zone.addEventListener('click', () => inp.click());

        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });

        ['dragleave', 'dragend'].forEach(ev => {
            zone.addEventListener(ev, () => zone.classList.remove('dragover'));
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            const files = e.dataTransfer?.files;
            if (files?.length) onFiles(files);
        });

        inp.addEventListener('change', () => {
            if (inp.files?.length) onFiles(inp.files);
            inp.value = '';
        });
    }

    /* -------------------------------------------------------------------------
       FILE VALIDATION
    -------------------------------------------------------------------------- */
    function validatePDF(file, maxMB) {
        maxMB = maxMB || 100;
        if (!file) return 'No file selected.';
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            return 'Please upload a valid PDF file.';
        }
        if (file.size > maxMB * 1024 * 1024) {
            return `File size exceeds ${maxMB} MB limit. Please use a smaller PDF.`;
        }
        return null; // OK
    }

    function validateImage(file, maxMB) {
        maxMB = maxMB || 50;
        if (!file) return 'No file selected.';
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.type)) {
            return 'Please upload a JPG, PNG, or WebP image file.';
        }
        if (file.size > maxMB * 1024 * 1024) {
            return `File size exceeds ${maxMB} MB limit.`;
        }
        return null;
    }

    /* -------------------------------------------------------------------------
       DOWNLOAD TRIGGER
    -------------------------------------------------------------------------- */
    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 1000);
    }

    function downloadBytes(uint8Array, filename, mimeType) {
        mimeType = mimeType || 'application/pdf';
        const blob = new Blob([uint8Array], { type: mimeType });
        downloadBlob(blob, filename);
    }

    /* -------------------------------------------------------------------------
       READ FILE AS ARRAY BUFFER
    -------------------------------------------------------------------------- */
    function readFileAsBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload  = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file.'));
            reader.readAsArrayBuffer(file);
        });
    }

    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload  = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file.'));
            reader.readAsDataURL(file);
        });
    }

    /* -------------------------------------------------------------------------
       LOADING OVERLAY (uses template.css .tool-loading-overlay / loader-ring)
    -------------------------------------------------------------------------- */
    function showLoader(id) {
        id = id || 'tool-loader';
        const el = document.getElementById(id);
        if (el) el.style.display = 'flex';
    }

    function hideLoader(id) {
        id = id || 'tool-loader';
        const el = document.getElementById(id);
        if (el) el.style.display = '';
    }

    /* -------------------------------------------------------------------------
       SUCCESS ALERT
    -------------------------------------------------------------------------- */
    function showSuccess(alertId, msg) {
        const el = document.getElementById(alertId);
        if (!el) return;
        el.style.display = 'flex';
        if (msg) {
            const title = el.querySelector('.alert-title');
            if (title) title.textContent = msg;
        }
    }

    function hideSuccess(alertId) {
        const el = document.getElementById(alertId);
        if (el) el.style.display = 'none';
    }

    /* -------------------------------------------------------------------------
       THUMBNAIL GENERATOR (uses pdfjs-dist if available)
    -------------------------------------------------------------------------- */
    async function renderPageThumbnail(pdfDoc, pageNum, scale) {
        scale = scale || 0.3;
        const page     = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas   = document.createElement('canvas');
        canvas.width   = viewport.width;
        canvas.height  = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        return canvas;
    }

    /* -------------------------------------------------------------------------
       EXPORTED API
    -------------------------------------------------------------------------- */
    return {
        formatBytes,
        showProgress,
        hideProgress,
        wireDropzone,
        validatePDF,
        validateImage,
        downloadBlob,
        downloadBytes,
        readFileAsBuffer,
        readFileAsDataURL,
        showLoader,
        hideLoader,
        showSuccess,
        hideSuccess,
        renderPageThumbnail,
    };
})();

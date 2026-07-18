(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const dropzone = document.getElementById('file-dropzone');
        const fileInput = document.getElementById('file-input');
        const previewWrap = document.getElementById('file-preview-wrap');
        const filePreview = document.getElementById('file-preview');
        const convPlaceholder = document.getElementById('conv-placeholder');
        const convResults = document.getElementById('conv-results');
        const outFilename = document.getElementById('out-filename');
        const outDims = document.getElementById('out-dims');
        const origSizeEl = document.getElementById('orig-size');
        const btnDownload = document.getElementById('btn-download-png');
        const resetBtn = document.getElementById('tool-reset');

        let currentFile = null;
        let currentPngBlob = null;

        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
        dropzone.addEventListener('drop', e => {
            e.preventDefault(); dropzone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'image/webp') handleFile(file);
            else showToast('Please drop a WebP file', 'error');
        });
        fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });

        function handleFile(file) {
            currentFile = file;
            const url = URL.createObjectURL(file);
            filePreview.src = url;
            previewWrap.style.display = '';

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
                canvas.getContext('2d').drawImage(img, 0, 0);
                canvas.toBlob(blob => {
                    currentPngBlob = blob;
                    const pngName = file.name.replace(/\.webp$/i, '.png');
                    outFilename.textContent = pngName;
                    outDims.textContent = `${img.naturalWidth} × ${img.naturalHeight}px`;
                    origSizeEl.textContent = formatBytes(file.size);
                    convPlaceholder.style.display = 'none';
                    convResults.style.display = '';
                    btnDownload.disabled = false; btnDownload.style.opacity = '';
                }, 'image/png');
            };
            img.src = url;
        }

        btnDownload.addEventListener('click', () => {
            if (!currentPngBlob) return;
            const name = currentFile.name.replace(/\.webp$/i, '.png');
            const url = URL.createObjectURL(currentPngBlob);
            const a = document.createElement('a');
            a.href = url; a.download = name; a.click();
            URL.revokeObjectURL(url);
            showToast('PNG downloaded!');
        });

        resetBtn.addEventListener('click', () => {
            fileInput.value = '';
            filePreview.src = '';
            previewWrap.style.display = 'none';
            convPlaceholder.style.display = '';
            convResults.style.display = 'none';
            btnDownload.disabled = true; btnDownload.style.opacity = '0.5';
            currentFile = null; currentPngBlob = null;
            showToast('Reset completed.');
        });

        function formatBytes(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / 1048576).toFixed(2) + ' MB';
        }

        function showToast(msg, type = 'success') {
            if (window.TN && window.TN.toast) window.TN.toast.show(msg, type);
        }
    });
})();

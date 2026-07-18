(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const dropzone = document.getElementById('file-dropzone');
        const fileInput = document.getElementById('file-input');
        const qualitySlider = document.getElementById('quality-slider');
        const qualityLabel = document.getElementById('quality-label');
        const previewWrap = document.getElementById('file-preview-wrap');
        const filePreview = document.getElementById('file-preview');
        const convPlaceholder = document.getElementById('conv-placeholder');
        const convResults = document.getElementById('conv-results');
        const origSizeEl = document.getElementById('orig-size');
        const webpSizeEl = document.getElementById('webp-size');
        const sizeReductionEl = document.getElementById('size-reduction');
        const btnDownload = document.getElementById('btn-download-webp');
        const resetBtn = document.getElementById('tool-reset');

        let currentWebpBlob = null;
        let currentFile = null;

        // Dropzone interactions
        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
        dropzone.addEventListener('drop', e => {
            e.preventDefault(); dropzone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'image/png') handleFile(file);
            else showToast('Please drop a PNG file', 'error');
        });
        fileInput.addEventListener('change', () => {
            if (fileInput.files[0]) handleFile(fileInput.files[0]);
        });

        qualitySlider.addEventListener('input', () => {
            qualityLabel.textContent = qualitySlider.value + '%';
            if (currentFile) convertFile(currentFile);
        });

        function handleFile(file) {
            currentFile = file;
            const objUrl = URL.createObjectURL(file);
            filePreview.src = objUrl;
            previewWrap.style.display = '';
            convertFile(file);
        }

        function convertFile(file) {
            const quality = parseInt(qualitySlider.value) / 100;
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob(function (blob) {
                        currentWebpBlob = blob;
                        origSizeEl.textContent = formatBytes(file.size);
                        webpSizeEl.textContent = formatBytes(blob.size);
                        const reduction = ((1 - blob.size / file.size) * 100).toFixed(1);
                        sizeReductionEl.textContent = reduction > 0 ? `−${reduction}%` : `+${Math.abs(reduction)}%`;
                        sizeReductionEl.style.color = reduction > 0 ? 'var(--success)' : 'var(--danger)';
                        convPlaceholder.style.display = 'none';
                        convResults.style.display = '';
                        btnDownload.disabled = false;
                        btnDownload.style.opacity = '';
                    }, 'image/webp', quality);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        btnDownload.addEventListener('click', () => {
            if (!currentWebpBlob) return;
            const name = (currentFile.name || 'image').replace(/\.[^.]+$/, '') + '.webp';
            const url = URL.createObjectURL(currentWebpBlob);
            const a = document.createElement('a');
            a.href = url; a.download = name; a.click();
            URL.revokeObjectURL(url);
            showToast('WebP downloaded!');
        });

        resetBtn.addEventListener('click', () => {
            fileInput.value = '';
            filePreview.src = '';
            previewWrap.style.display = 'none';
            convPlaceholder.style.display = '';
            convResults.style.display = 'none';
            btnDownload.disabled = true; btnDownload.style.opacity = '0.5';
            currentWebpBlob = null; currentFile = null;
            qualitySlider.value = 85; qualityLabel.textContent = '85%';
            showToast('Reset completed.');
        });

        function formatBytes(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }

        function showToast(msg, type = 'success') {
            if (window.TN && window.TN.toast) window.TN.toast.show(msg, type);
        }
    });
})();

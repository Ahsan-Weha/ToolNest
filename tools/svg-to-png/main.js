(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const dropzone = document.getElementById('file-dropzone');
        const fileInput = document.getElementById('file-input');
        const svgCodeInput = document.getElementById('svg-code-input');
        const scaleSlider = document.getElementById('scale-slider');
        const scaleLabel = document.getElementById('scale-label');
        const previewArea = document.getElementById('preview-area');
        const pngDims = document.getElementById('png-dims');
        const btnConvert = document.getElementById('btn-convert-download');
        const resetBtn = document.getElementById('tool-reset');

        let currentSVG = null;

        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
        dropzone.addEventListener('drop', e => {
            e.preventDefault(); dropzone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && (file.type === 'image/svg+xml' || file.name.endsWith('.svg'))) readFile(file);
            else showToast('Please drop an SVG file', 'error');
        });
        fileInput.addEventListener('change', () => { if (fileInput.files[0]) readFile(fileInput.files[0]); });

        function readFile(file) {
            const reader = new FileReader();
            reader.onload = e => {
                currentSVG = e.target.result;
                svgCodeInput.value = currentSVG;
                renderPreview();
            };
            reader.readAsText(file);
        }

        svgCodeInput.addEventListener('input', () => {
            currentSVG = svgCodeInput.value.trim();
            if (currentSVG) renderPreview();
        });

        scaleSlider.addEventListener('input', () => {
            scaleLabel.textContent = scaleSlider.value + '×';
            if (currentSVG) renderPreview();
        });

        function renderPreview() {
            const scale = parseFloat(scaleSlider.value);
            const svgBlob = new Blob([currentSVG], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            const img = new Image();
            img.onload = () => {
                const w = (img.naturalWidth || 300) * scale;
                const h = (img.naturalHeight || 200) * scale;
                pngDims.textContent = `${w} × ${h}px`;
                previewArea.innerHTML = '';
                const prevImg = new Image();
                prevImg.src = url;
                prevImg.style.maxWidth = '100%';
                prevImg.style.maxHeight = '260px';
                prevImg.style.borderRadius = 'var(--radius-sm)';
                previewArea.appendChild(prevImg);
                btnConvert.disabled = false;
                btnConvert.style.opacity = '';
            };
            img.onerror = () => {
                previewArea.innerHTML = '<p style="color:var(--danger);">Invalid SVG. Please check your markup.</p>';
            };
            img.src = url;
        }

        btnConvert.addEventListener('click', () => {
            if (!currentSVG) return;
            const scale = parseFloat(scaleSlider.value);
            const svgBlob = new Blob([currentSVG], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            const img = new Image();
            img.onload = () => {
                const w = (img.naturalWidth || 300) * scale;
                const h = (img.naturalHeight || 200) * scale;
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                URL.revokeObjectURL(url);
                canvas.toBlob(blob => {
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = 'converted.png';
                    a.click();
                    showToast('PNG downloaded!');
                }, 'image/png');
            };
            img.src = url;
        });

        resetBtn.addEventListener('click', () => {
            fileInput.value = '';
            svgCodeInput.value = '';
            previewArea.innerHTML = '<p class="text-muted text-sm">Upload an SVG to see the PNG preview.</p>';
            pngDims.textContent = '';
            btnConvert.disabled = true; btnConvert.style.opacity = '0.5';
            currentSVG = null;
            scaleSlider.value = 2; scaleLabel.textContent = '2×';
            showToast('Reset completed.');
        });

        function showToast(msg, type = 'success') {
            if (window.TN && window.TN.toast) window.TN.toast.show(msg, type);
        }
    });
})();

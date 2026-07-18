/**
 * WebP Converter Controller - ToolNest
 * Supports: PNG/JPG → WebP, WebP → PNG/JPG
 */
(function () {
    'use strict';

    let originalImg = null;
    let originalFile = null;
    let convertedBlob = null;

    // DOM elements
    const dropzone = document.getElementById('file-dropzone');
    const fileInput = document.getElementById('file-input');
    const fileDetails = document.getElementById('selected-file-details');
    const resetBtn = document.getElementById('tool-reset');
    const previewSection = document.getElementById('image-preview-section');
    const controlsSection = document.getElementById('converter-controls');

    const origCanvas = document.getElementById('canvas-original');
    const procCanvas = document.getElementById('canvas-processed');

    const origFormatTitle = document.getElementById('original-format-title');
    const procFormatTitle = document.getElementById('processed-format-title');
    const origSizeDisplay = document.getElementById('original-size-display');
    const procSizeDisplay = document.getElementById('processed-size-display');

    const formatSelect = document.getElementById('export-format');
    const bgColorGroup = document.getElementById('bg-color-group');
    const bgColorPicker = document.getElementById('bg-color');
    const colorHexVal = document.getElementById('color-hex-val');
    const qualityGroup = document.getElementById('quality-group');
    const qualitySlider = document.getElementById('export-quality');
    const qualityVal = document.getElementById('export-quality-val');

    const clearBtn = document.getElementById('clear-btn');
    const downloadBtn = document.getElementById('download-image-btn');
    const loader = document.getElementById('tool-loader');

    // MIME → extension and label maps
    const FORMAT_LABELS = {
        'image/webp': 'WebP',
        'image/png': 'PNG',
        'image/jpeg': 'JPG'
    };

    const FORMAT_EXT = {
        'image/webp': '.webp',
        'image/png': '.png',
        'image/jpeg': '.jpg'
    };

    document.addEventListener('DOMContentLoaded', () => {
        initDragAndDrop();
        initControls();
    });

    function initDragAndDrop() {
        if (!dropzone || !fileInput) return;

        dropzone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) processFile(fileInput.files[0]);
        });

        ['dragenter', 'dragover'].forEach(e => {
            dropzone.addEventListener(e, (ev) => { ev.preventDefault(); ev.stopPropagation(); dropzone.classList.add('dragover'); });
        });
        ['dragleave', 'drop'].forEach(e => {
            dropzone.addEventListener(e, (ev) => { ev.preventDefault(); ev.stopPropagation(); dropzone.classList.remove('dragover'); });
        });
        dropzone.addEventListener('drop', (e) => {
            if (e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]);
        });
    }

    function processFile(file) {
        if (!file.type.startsWith('image/')) { TN.toast.error('Not a valid image file!'); return; }

        // Only accept WebP, PNG, JPG/JPEG
        const validTypes = ['image/webp', 'image/png', 'image/jpeg'];
        if (!validTypes.includes(file.type)) {
            TN.toast.error('Please select a PNG, JPG, or WebP image.');
            return;
        }

        showLoading(true);
        originalFile = file;

        const reader = new FileReader();
        reader.onerror = () => { TN.toast.error('Failed to read file.'); showLoading(false); };
        reader.onload = (e) => {
            originalImg = new Image();
            originalImg.onerror = () => { TN.toast.error('Failed to load image.'); showLoading(false); };
            originalImg.onload = () => {
                // Draw original to left canvas
                drawToCanvas(origCanvas, originalImg, false, '#ffffff');
                origSizeDisplay.textContent = `File Size: ${formatBytes(file.size)}`;
                origFormatTitle.textContent = `Original ${FORMAT_LABELS[file.type] || 'Image'}`;

                // Populate format dropdown based on input type
                populateOutputFormats(file.type);

                // Update UI state
                fileDetails.style.display = 'block';
                fileDetails.querySelector('.file-name').textContent = file.name;
                fileDetails.querySelector('.file-size').textContent = formatBytes(file.size);

                previewSection.style.display = 'block';
                controlsSection.style.display = 'block';
                dropzone.style.display = 'none';

                convertImage();
            };
            originalImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function populateOutputFormats(inputMime) {
        formatSelect.innerHTML = '';

        const allFormats = {
            'image/webp': 'WebP (Optimized, Lossy)',
            'image/png': 'PNG (Lossless, Transparent)',
            'image/jpeg': 'JPG (Compressed, No Transparency)'
        };

        // Exclude the input format itself
        Object.entries(allFormats).forEach(([mime, label]) => {
            if (mime !== inputMime) {
                const opt = document.createElement('option');
                opt.value = mime;
                opt.textContent = label;
                formatSelect.appendChild(opt);
            }
        });
    }

    function drawToCanvas(canvas, img, fillBg, bgColor) {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, img.width, img.height);

        if (fillBg) {
            ctx.fillStyle = bgColor || '#ffffff';
            ctx.fillRect(0, 0, img.width, img.height);
        }

        ctx.drawImage(img, 0, 0, img.width, img.height);
    }

    function convertImage() {
        if (!originalImg) return;
        showLoading(true);

        const targetMime = formatSelect.value;
        const quality = parseInt(qualitySlider.value) / 100;
        const needsBg = targetMime === 'image/jpeg';

        // Show/hide bg color picker
        bgColorGroup.style.display = needsBg ? 'block' : 'none';

        // PNG is lossless, hide quality for PNG
        const isPNG = targetMime === 'image/png';
        qualityGroup.style.opacity = isPNG ? '0.3' : '1';
        qualitySlider.disabled = isPNG;

        // Update labels
        procFormatTitle.textContent = `Converted ${FORMAT_LABELS[targetMime] || 'Image'}`;

        // Draw to processed canvas
        drawToCanvas(procCanvas, originalImg, needsBg, bgColorPicker ? bgColorPicker.value : '#ffffff');

        // Blob encode
        procCanvas.toBlob((blob) => {
            if (!blob) { TN.toast.error('Conversion failed.'); showLoading(false); return; }
            convertedBlob = blob;
            procSizeDisplay.textContent = `File Size: ${formatBytes(blob.size)}`;
            showLoading(false);
        }, targetMime, isPNG ? undefined : quality);
    }

    function initControls() {
        if (formatSelect) formatSelect.addEventListener('change', convertImage);

        if (bgColorPicker) {
            bgColorPicker.addEventListener('input', () => {
                colorHexVal.textContent = bgColorPicker.value;
            });
            bgColorPicker.addEventListener('change', convertImage);
        }

        if (qualitySlider) {
            qualitySlider.addEventListener('input', () => {
                qualityVal.textContent = qualitySlider.value + '%';
            });
            qualitySlider.addEventListener('change', convertImage);
        }

        const resetAction = () => {
            originalImg = null;
            originalFile = null;
            convertedBlob = null;
            fileInput.value = '';

            fileDetails.style.display = 'none';
            previewSection.style.display = 'none';
            controlsSection.style.display = 'none';
            dropzone.style.display = 'flex';

            clearCanvas(origCanvas);
            clearCanvas(procCanvas);
            TN.toast.info('Cleared');
        };

        if (resetBtn) resetBtn.addEventListener('click', resetAction);
        if (clearBtn) clearBtn.addEventListener('click', resetAction);

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                if (!convertedBlob) { TN.toast.error('No converted image available.'); return; }
                const targetMime = formatSelect.value;
                const ext = FORMAT_EXT[targetMime] || '.webp';
                const baseName = originalFile.name.substring(0, originalFile.name.lastIndexOf('.')) || 'image';

                const link = document.createElement('a');
                link.href = URL.createObjectURL(convertedBlob);
                link.download = `${baseName}${ext}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                TN.toast.success('Image downloaded!');
            });
        }
    }

    function clearCanvas(canvas) {
        canvas.width = 150;
        canvas.height = 150;
        canvas.getContext('2d').clearRect(0, 0, 150, 150);
    }

    function showLoading(show) {
        if (loader) loader.style.display = show ? 'flex' : 'none';
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
})();

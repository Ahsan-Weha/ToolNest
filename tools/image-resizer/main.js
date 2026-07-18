/**
 * ToolNest — Image Resizer Controller
 * Resize, convert format, and adjust quality entirely client-side.
 */

// ── State ──────────────────────────────────────────────────────────────────
let originalImage = null;
let originalWidth  = 0;
let originalHeight = 0;
let originalRatio  = 1;
let maintainRatio  = true;
let processedBlob  = null;

// ── DOM refs ───────────────────────────────────────────────────────────────
const dropzone     = document.getElementById('file-dropzone');
const fileInput    = document.getElementById('file-input');
const fileDetails  = document.getElementById('selected-file-details');
const resetBtn     = document.getElementById('tool-reset');

const widthInput   = document.getElementById('resize-width');
const heightInput  = document.getElementById('resize-height');
const lockBtn      = document.getElementById('lock-ratio-btn');
const formatSelect = document.getElementById('export-format');
const qualitySlider = document.getElementById('export-quality');
const qualityVal   = document.getElementById('export-quality-val');
const processBtn   = document.getElementById('process-image-btn');

const origCanvas   = document.getElementById('canvas-original');
const procCanvas   = document.getElementById('canvas-processed');
const downloadBtn  = document.getElementById('download-image-btn');
const imagePreviewSection = document.getElementById('image-preview-section');

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initFileHandling();
    initResizeControls();
    initActionButtons();
});

// ── 1. File upload & loading ───────────────────────────────────────────────
function initFileHandling() {
    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) loadFile(fileInput.files[0]);
    });

    ['dragenter', 'dragover'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
            e.preventDefault(); e.stopPropagation();
            dropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
            e.preventDefault(); e.stopPropagation();
            dropzone.classList.remove('dragover');
        }, false);
    });

    dropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) loadFile(files[0]);
    });
}

function loadFile(file) {
    if (!file.type.startsWith('image/')) {
        TN.toast.error('Selected file is not an image!');
        return;
    }

    TN.loader.show(document.getElementById('tool-interface'));

    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage = new Image();
        originalImage.onload = () => {
            originalWidth  = originalImage.width;
            originalHeight = originalImage.height;
            originalRatio  = originalWidth / originalHeight;

            widthInput.value  = originalWidth;
            heightInput.value = originalHeight;

            drawCanvas(origCanvas, originalImage, originalWidth, originalHeight);
            drawCanvas(procCanvas, originalImage, originalWidth, originalHeight);

            fileDetails.style.display = 'block';
            fileDetails.querySelector('.file-name').textContent = file.name;
            fileDetails.querySelector('.file-size').textContent = formatBytes(file.size);

            imagePreviewSection.style.display = 'block';
            imagePreviewSection.classList.add('anim-fade-in');

            TN.loader.hide(document.getElementById('tool-interface'));
            TN.toast.success('Image loaded successfully');

            generateProcessedOutput();
        };
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function drawCanvas(canvas, img, w, h) {
    canvas.width  = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
}

// ── 2. Resize controls ─────────────────────────────────────────────────────
function initResizeControls() {
    if (!widthInput || !heightInput || !lockBtn) return;

    lockBtn.addEventListener('click', () => {
        maintainRatio = !maintainRatio;
        lockBtn.classList.toggle('locked', maintainRatio);
        lockBtn.setAttribute('title', maintainRatio ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked');
        const lockIcon = lockBtn.querySelector('svg');
        lockIcon.style.color = maintainRatio ? 'var(--primary)' : 'var(--text-muted)';
    });

    widthInput.addEventListener('input', () => {
        if (!originalImage) return;
        const w = parseInt(widthInput.value);
        if (isNaN(w) || w <= 0) return;
        if (maintainRatio) heightInput.value = Math.round(w / originalRatio);
    });

    heightInput.addEventListener('input', () => {
        if (!originalImage) return;
        const h = parseInt(heightInput.value);
        if (isNaN(h) || h <= 0) return;
        if (maintainRatio) widthInput.value = Math.round(h * originalRatio);
    });

    if (qualitySlider && qualityVal) {
        qualitySlider.addEventListener('input', () => {
            qualityVal.textContent = qualitySlider.value + '%';
        });
    }

    if (formatSelect && qualitySlider) {
        formatSelect.addEventListener('change', () => {
            const isLossless = formatSelect.value === 'image/png';
            qualitySlider.disabled = isLossless;
            qualityVal.style.opacity = isLossless ? '0.4' : '1';
        });
    }
}

// ── 3. Action buttons ──────────────────────────────────────────────────────
function initActionButtons() {
    // Resize & Process
    if (processBtn) {
        processBtn.addEventListener('click', () => {
            if (!originalImage) {
                TN.toast.warning('Please select an image first.');
                return;
            }

            TN.loader.show(document.getElementById('tool-interface'));

            setTimeout(() => {
                const targetW = parseInt(widthInput.value);
                const targetH = parseInt(heightInput.value);

                if (isNaN(targetW) || targetW <= 0 || isNaN(targetH) || targetH <= 0) {
                    TN.toast.error('Invalid resize dimensions!');
                    TN.loader.hide(document.getElementById('tool-interface'));
                    return;
                }

                drawCanvas(procCanvas, originalImage, targetW, targetH);
                generateProcessedOutput();
                TN.loader.hide(document.getElementById('tool-interface'));
                TN.toast.success('Image resized successfully!');
            }, 100);
        });
    }

    // Reset
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            originalImage = null;
            originalWidth = originalHeight = 0;
            originalRatio = 1;
            processedBlob = null;

            if (fileInput) fileInput.value = '';
            if (fileDetails) fileDetails.style.display = 'none';
            if (imagePreviewSection) imagePreviewSection.style.display = 'none';

            [origCanvas, procCanvas].forEach(canvas => {
                canvas.width  = 150;
                canvas.height = 150;
                canvas.getContext('2d').clearRect(0, 0, 150, 150);
            });

            if (widthInput)  widthInput.value  = '';
            if (heightInput) heightInput.value = '';

            TN.toast.info('Cleared.');
        });
    }

    // Download
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (!processedBlob) {
                TN.toast.warning('No output generated yet!');
                return;
            }

            const format    = formatSelect.value;
            const extension = format === 'image/webp' ? '.webp' : (format === 'image/jpeg' ? '.jpg' : '.png');
            const link      = document.createElement('a');
            link.href       = URL.createObjectURL(processedBlob);
            link.download   = `toolnest-resized-${Date.now()}${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            TN.toast.success('Downloading…');
        });
    }
}

// ── 4. Output generation ───────────────────────────────────────────────────
function generateProcessedOutput() {
    const format  = formatSelect.value;
    const quality = parseFloat(qualitySlider.value) / 100;

    procCanvas.toBlob((blob) => {
        processedBlob = blob;
        const sizeEl = document.getElementById('processed-size-display');
        if (sizeEl && blob) sizeEl.textContent = `Output: ${formatBytes(blob.size)}`;
    }, format, quality);
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k     = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i     = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

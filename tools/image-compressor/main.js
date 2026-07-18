/**
 * Compress Image Controller - ToolNest
 */
(function () {
    'use strict';

    let originalImg = null;
    let originalFile = null;
    let compressedBlob = null;

    // DOM elements
    const dropzone = document.getElementById('file-dropzone');
    const fileInput = document.getElementById('file-input');
    const fileDetails = document.getElementById('selected-file-details');
    const resetBtn = document.getElementById('tool-reset');
    const previewSection = document.getElementById('image-preview-section');
    const controlsSection = document.getElementById('compressor-controls');
    
    const origCanvas = document.getElementById('canvas-original');
    const procCanvas = document.getElementById('canvas-processed');
    
    const origSizeDisplay = document.getElementById('original-size-display');
    const procSizeDisplay = document.getElementById('processed-size-display');
    
    const formatSelect = document.getElementById('export-format');
    const qualitySlider = document.getElementById('export-quality');
    const qualityVal = document.getElementById('export-quality-val');
    
    const clearBtn = document.getElementById('clear-btn');
    const downloadBtn = document.getElementById('download-image-btn');
    const loader = document.getElementById('tool-loader');

    // Initialize UI
    document.addEventListener('DOMContentLoaded', () => {
        initDragAndDrop();
        initControls();
    });

    function initDragAndDrop() {
        if (!dropzone || !fileInput) return;

        dropzone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                processFile(fileInput.files[0]);
            }
        });

        // Drag events
        ['dragenter', 'dragover'].forEach(name => {
            dropzone.addEventListener(name, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(name => {
            dropzone.addEventListener(name, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('dragover');
            });
        });

        dropzone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                processFile(files[0]);
            }
        });
    }

    function processFile(file) {
        if (!file.type.startsWith('image/')) {
            TN.toast.error('Selected file is not an image!');
            return;
        }

        showLoading(true);
        originalFile = file;

        const reader = new FileReader();
        reader.onerror = () => {
            TN.toast.error('Failed to read image file.');
            showLoading(false);
        };
        reader.onload = (e) => {
            originalImg = new Image();
            originalImg.onerror = () => {
                TN.toast.error('Failed to load image.');
                showLoading(false);
            };
            originalImg.onload = () => {
                // Setup original canvas
                drawCanvas(origCanvas, originalImg, originalImg.width, originalImg.height);
                origSizeDisplay.textContent = `File Size: ${formatBytes(file.size)}`;

                // Update UI state
                fileDetails.style.display = 'block';
                fileDetails.querySelector('.file-name').textContent = file.name;
                fileDetails.querySelector('.file-size').textContent = formatBytes(file.size);
                
                previewSection.style.display = 'block';
                controlsSection.style.display = 'block';
                dropzone.style.display = 'none';

                // Initial compression
                compressImage();
            };
            originalImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function drawCanvas(canvas, img, w, h) {
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
    }

    function compressImage() {
        if (!originalImg) return;
        showLoading(true);

        const format = formatSelect.value;
        const quality = parseInt(qualitySlider.value) / 100;

        // Draw fresh to processed canvas
        drawCanvas(procCanvas, originalImg, originalImg.width, originalImg.height);

        // Convert to blob at target quality
        procCanvas.toBlob((blob) => {
            if (!blob) {
                TN.toast.error('Compression failed.');
                showLoading(false);
                return;
            }

            compressedBlob = blob;

            // Render details
            const reduction = ((originalFile.size - blob.size) / originalFile.size * 100).toFixed(0);
            const savedText = reduction > 0 ? `Saved ${reduction}%` : `Size: +${Math.abs(reduction)}%`;
            procSizeDisplay.textContent = `File Size: ${formatBytes(blob.size)} (${savedText})`;

            showLoading(false);
        }, format, quality);
    }

    function initControls() {
        if (qualitySlider) {
            qualitySlider.addEventListener('input', () => {
                qualityVal.textContent = qualitySlider.value + '%';
            });
            qualitySlider.addEventListener('change', compressImage);
        }

        if (formatSelect) {
            formatSelect.addEventListener('change', () => {
                const format = formatSelect.value;
                const isPNG = format === 'image/png';
                // PNG is lossless, hide quality settings
                const qualityGroup = document.getElementById('quality-group');
                if (qualityGroup) {
                    qualityGroup.style.opacity = isPNG ? '0.3' : '1';
                    qualitySlider.disabled = isPNG;
                }
                compressImage();
            });
        }

        // Reset click
        const resetAction = () => {
            originalImg = null;
            originalFile = null;
            compressedBlob = null;
            fileInput.value = '';
            
            fileDetails.style.display = 'none';
            previewSection.style.display = 'none';
            controlsSection.style.display = 'none';
            dropzone.style.display = 'flex';

            origCanvas.width = 150;
            origCanvas.height = 150;
            origCanvas.getContext('2d').clearRect(0, 0, 150, 150);

            procCanvas.width = 150;
            procCanvas.height = 150;
            procCanvas.getContext('2d').clearRect(0, 0, 150, 150);
            
            TN.toast.info('Cleared');
        };

        if (resetBtn) resetBtn.addEventListener('click', resetAction);
        if (clearBtn) clearBtn.addEventListener('click', resetAction);

        // Download click
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                if (!compressedBlob) {
                    TN.toast.error('No compressed image available.');
                    return;
                }

                const extMap = {
                    'image/jpeg': '.jpg',
                    'image/png': '.png',
                    'image/webp': '.webp'
                };
                const ext = extMap[formatSelect.value] || '.jpg';
                const originalName = originalFile.name.substring(0, originalFile.name.lastIndexOf('.')) || 'image';
                
                const link = document.createElement('a');
                link.href = URL.createObjectURL(compressedBlob);
                link.download = `${originalName}-compressed${ext}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                TN.toast.success('Image downloaded!');
            });
        }
    }

    function showLoading(show) {
        if (loader) {
            loader.style.display = show ? 'flex' : 'none';
        }
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
})();

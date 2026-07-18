/**
 * PNG to JPG Controller - ToolNest
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
    
    const origSizeDisplay = document.getElementById('original-size-display');
    const procSizeDisplay = document.getElementById('processed-size-display');
    
    const bgColorPicker = document.getElementById('bg-color');
    const colorHexVal = document.getElementById('color-hex-val');
    const qualitySlider = document.getElementById('export-quality');
    const qualityVal = document.getElementById('export-quality-val');
    
    const clearBtn = document.getElementById('clear-btn');
    const downloadBtn = document.getElementById('download-image-btn');
    const loader = document.getElementById('tool-loader');

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
        
        // Strict PNG validation
        if (file.type !== 'image/png' && !file.name.endsWith('.png')) {
            TN.toast.error('Please select a PNG file.');
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
                drawCanvas(origCanvas, originalImg, originalImg.width, originalImg.height, false);
                origSizeDisplay.textContent = `File Size: ${formatBytes(file.size)}`;

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

    function drawCanvas(canvas, img, w, h, fillBackground) {
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, w, h);
        
        if (fillBackground) {
            ctx.fillStyle = bgColorPicker.value || '#ffffff';
            ctx.fillRect(0, 0, w, h);
        }
        
        ctx.drawImage(img, 0, 0, w, h);
    }

    function convertImage() {
        if (!originalImg) return;
        showLoading(true);

        const quality = parseInt(qualitySlider.value) / 100;

        // Draw PNG on processed canvas with solid background
        drawCanvas(procCanvas, originalImg, originalImg.width, originalImg.height, true);

        // Convert to JPG blob
        procCanvas.toBlob((blob) => {
            if (!blob) {
                TN.toast.error('Conversion failed.');
                showLoading(false);
                return;
            }

            convertedBlob = blob;
            procSizeDisplay.textContent = `File Size: ${formatBytes(blob.size)}`;
            showLoading(false);
        }, 'image/jpeg', quality);
    }

    function initControls() {
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

        // Reset actions
        const resetAction = () => {
            originalImg = null;
            originalFile = null;
            convertedBlob = null;
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
                if (!convertedBlob) {
                    TN.toast.error('No converted image available.');
                    return;
                }

                const originalName = originalFile.name.substring(0, originalFile.name.lastIndexOf('.')) || 'image';
                
                const link = document.createElement('a');
                link.href = URL.createObjectURL(convertedBlob);
                link.download = `${originalName}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                TN.toast.success('JPG image downloaded!');
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

/**
 * Rotate Image Controller - ToolNest
 */
(function () {
    'use strict';

    let originalImg = null;
    let originalFile = null;
    let rotatedBlob = null;

    // Rotation state
    let angle = 0; // 0, 90, 180, 270
    let flipH = false;
    let flipV = false;

    // DOM elements
    const dropzone = document.getElementById('file-dropzone');
    const fileInput = document.getElementById('file-input');
    const fileDetails = document.getElementById('selected-file-details');
    const resetBtn = document.getElementById('tool-reset');
    const previewSection = document.getElementById('image-preview-section');
    const controlsSection = document.getElementById('rotate-controls');
    
    const origCanvas = document.getElementById('canvas-original');
    const procCanvas = document.getElementById('canvas-processed');
    
    const origSizeDisplay = document.getElementById('original-size-display');
    const procSizeDisplay = document.getElementById('processed-size-display');
    
    const clearBtn = document.getElementById('clear-btn');
    const downloadBtn = document.getElementById('download-image-btn');
    const loader = document.getElementById('tool-loader');

    // Rotation actions
    const btnRot90CW = document.getElementById('rot-90-cw');
    const btnRot90CCW = document.getElementById('rot-90-ccw');
    const btnRot180 = document.getElementById('rot-180');
    const btnFlipH = document.getElementById('flip-h');
    const btnFlipV = document.getElementById('flip-v');

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
                origSizeDisplay.textContent = `Dimensions: ${originalImg.width} × ${originalImg.height}`;

                // Reset rotation states
                angle = 0;
                flipH = false;
                flipV = false;

                // Update UI state
                fileDetails.style.display = 'block';
                fileDetails.querySelector('.file-name').textContent = file.name;
                fileDetails.querySelector('.file-size').textContent = formatBytes(file.size);
                
                previewSection.style.display = 'block';
                controlsSection.style.display = 'block';
                dropzone.style.display = 'none';

                renderTransformed();
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

    function renderTransformed() {
        if (!originalImg) return;
        showLoading(true);

        const isSwapped = (angle / 90) % 2 !== 0;
        const targetW = isSwapped ? originalImg.height : originalImg.width;
        const targetH = isSwapped ? originalImg.width : originalImg.height;

        procCanvas.width = targetW;
        procCanvas.height = targetH;
        
        const ctx = procCanvas.getContext('2d');
        ctx.clearRect(0, 0, targetW, targetH);
        
        ctx.save();
        // Move rotation point to center of destination canvas
        ctx.translate(targetW / 2, targetH / 2);
        
        // Rotate
        ctx.rotate((angle * Math.PI) / 180);
        
        // Mirror flips
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        
        // Draw image offset centered
        ctx.drawImage(originalImg, -originalImg.width / 2, -originalImg.height / 2);
        
        ctx.restore();

        // Display updated dimensions
        procSizeDisplay.textContent = `Dimensions: ${targetW} × ${targetH}`;

        // Create download blob
        procCanvas.toBlob((blob) => {
            rotatedBlob = blob;
            showLoading(false);
        }, originalFile.type);
    }

    function initControls() {
        if (btnRot90CW) {
            btnRot90CW.addEventListener('click', () => {
                angle = (angle + 90) % 360;
                renderTransformed();
                TN.toast.success('Rotated 90° CW');
            });
        }
        if (btnRot90CCW) {
            btnRot90CCW.addEventListener('click', () => {
                angle = (angle - 90 + 360) % 360;
                renderTransformed();
                TN.toast.success('Rotated 90° CCW');
            });
        }
        if (btnRot180) {
            btnRot180.addEventListener('click', () => {
                angle = (angle + 180) % 360;
                renderTransformed();
                TN.toast.success('Rotated 180°');
            });
        }
        if (btnFlipH) {
            btnFlipH.addEventListener('click', () => {
                flipH = !flipH;
                renderTransformed();
                TN.toast.success(flipH ? 'Mirrored horizontally' : 'Horizontal mirror removed');
            });
        }
        if (btnFlipV) {
            btnFlipV.addEventListener('click', () => {
                flipV = !flipV;
                renderTransformed();
                TN.toast.success(flipV ? 'Flipped vertically' : 'Vertical flip removed');
            });
        }

        // Reset click
        const resetAction = () => {
            originalImg = null;
            originalFile = null;
            rotatedBlob = null;
            fileInput.value = '';
            angle = 0;
            flipH = false;
            flipV = false;
            
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
                if (!rotatedBlob) {
                    TN.toast.error('No transformed image available.');
                    return;
                }

                const ext = originalFile.name.substring(originalFile.name.lastIndexOf('.')) || '.png';
                const originalName = originalFile.name.substring(0, originalFile.name.lastIndexOf('.')) || 'image';
                
                const link = document.createElement('a');
                link.href = URL.createObjectURL(rotatedBlob);
                link.download = `${originalName}-rotated${ext}`;
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

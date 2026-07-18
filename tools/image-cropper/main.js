/**
 * Crop Image Controller - ToolNest
 */
(function () {
    'use strict';

    let originalImg = null;
    let originalFile = null;
    let croppedBlob = null;
    let aspectRatio = null; // null for free crop, otherwise number (w/h)

    // DOM elements
    const dropzone = document.getElementById('file-dropzone');
    const fileInput = document.getElementById('file-input');
    const fileDetails = document.getElementById('selected-file-details');
    const resetBtn = document.getElementById('tool-reset');
    const previewSection = document.getElementById('image-preview-section');
    const controlsSection = document.getElementById('cropper-controls');
    
    const cropperContainer = document.getElementById('cropper-container');
    const cropperImg = document.getElementById('cropper-img');
    const cropBox = document.getElementById('crop-box');
    const procCanvas = document.getElementById('canvas-processed');
    
    const cropResDisplay = document.getElementById('crop-resolution-display');
    const procSizeDisplay = document.getElementById('processed-size-display');
    
    const formatSelect = document.getElementById('export-format');
    const qualitySlider = document.getElementById('export-quality');
    const qualityVal = document.getElementById('export-quality-val');
    const qualityGroup = document.getElementById('quality-group');
    
    const clearBtn = document.getElementById('clear-btn');
    const applyCropBtn = document.getElementById('apply-crop-btn');
    const downloadBtn = document.getElementById('download-image-btn');
    const loader = document.getElementById('tool-loader');

    // Cropper drag state variables
    let isDragging = false;
    let isResizing = false;
    let resizeHandle = '';
    let startX, startY;
    let startLeft, startTop, startWidth, startHeight;

    document.addEventListener('DOMContentLoaded', () => {
        initDragAndDrop();
        initCropperDrag();
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
                // Render image to crop container
                cropperImg.src = e.target.result;
                
                // Wait for image render to calculate actual dimensions
                cropperImg.onload = () => {
                    setupCropper();
                    
                    // Update UI state
                    fileDetails.style.display = 'block';
                    fileDetails.querySelector('.file-name').textContent = file.name;
                    fileDetails.querySelector('.file-size').textContent = formatBytes(file.size);
                    
                    previewSection.style.display = 'block';
                    controlsSection.style.display = 'block';
                    dropzone.style.display = 'none';

                    showLoading(false);
                    TN.toast.success('Image loaded. Drag corners to crop.');
                };
            };
            originalImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function setupCropper() {
        const cw = cropperImg.clientWidth;
        const ch = cropperImg.clientHeight;

        cropperContainer.style.width = cw + 'px';
        cropperContainer.style.height = ch + 'px';

        // Set initial crop box size (80% and centered)
        let w = cw * 0.8;
        let h = ch * 0.8;
        
        if (aspectRatio) {
            if (w / h > aspectRatio) {
                w = h * aspectRatio;
            } else {
                h = w / aspectRatio;
            }
        }

        cropBox.style.width = Math.round(w) + 'px';
        cropBox.style.height = Math.round(h) + 'px';
        cropBox.style.left = Math.round((cw - w) / 2) + 'px';
        cropBox.style.top = Math.round((ch - h) / 2) + 'px';

        updateCropStats();
    }

    function initCropperDrag() {
        // Drag start
        cropBox.addEventListener('mousedown', startDrag);
        cropBox.addEventListener('touchstart', startDrag, { passive: false });

        document.addEventListener('mousemove', moveDrag);
        document.addEventListener('touchmove', moveDrag, { passive: false });

        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);

        function startDrag(e) {
            if (!originalImg) return;
            const target = e.target;
            const isHandle = target.classList.contains('crop-handle');
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);

            if (isHandle) {
                isResizing = true;
                resizeHandle = target.getAttribute('data-handle');
            } else {
                isDragging = true;
            }

            startX = clientX;
            startY = clientY;

            startLeft = parseInt(cropBox.style.left) || 0;
            startTop = parseInt(cropBox.style.top) || 0;
            startWidth = parseInt(cropBox.style.width) || 100;
            startHeight = parseInt(cropBox.style.height) || 100;

            e.preventDefault();
        }

        function moveDrag(e) {
            if (!isDragging && !isResizing) return;

            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);

            const dx = clientX - startX;
            const dy = clientY - startY;

            const cw = cropperImg.clientWidth;
            const ch = cropperImg.clientHeight;

            if (isDragging) {
                let left = startLeft + dx;
                let top = startTop + dy;

                // Boundaries
                left = Math.max(0, Math.min(cw - startWidth, left));
                top = Math.max(0, Math.min(ch - startHeight, top));

                cropBox.style.left = left + 'px';
                cropBox.style.top = top + 'px';
            }

            if (isResizing) {
                let left = startLeft;
                let top = startTop;
                let width = startWidth;
                let height = startHeight;

                if (resizeHandle.includes('e')) {
                    width = startWidth + dx;
                    width = Math.max(20, Math.min(cw - startLeft, width));
                }
                if (resizeHandle.includes('s')) {
                    height = startHeight + dy;
                    height = Math.max(20, Math.min(ch - startTop, height));
                }
                if (resizeHandle.includes('w')) {
                    width = startWidth - dx;
                    if (width >= 20 && startLeft + dx >= 0) {
                        left = startLeft + dx;
                    } else {
                        width = startWidth + startLeft;
                        left = 0;
                    }
                }
                if (resizeHandle.includes('n')) {
                    height = startHeight - dy;
                    if (height >= 20 && startTop + dy >= 0) {
                        top = startTop + dy;
                    } else {
                        height = startHeight + startTop;
                        top = 0;
                    }
                }

                // Apply aspect ratio forcing if locked
                if (aspectRatio) {
                    if (resizeHandle === 'se' || resizeHandle === 'ne' || resizeHandle === 'e') {
                        height = width / aspectRatio;
                    } else if (resizeHandle === 'sw' || resizeHandle === 'nw' || resizeHandle === 'w') {
                        height = width / aspectRatio;
                    } else if (resizeHandle === 's' || resizeHandle === 'n') {
                        width = height * aspectRatio;
                    }

                    // Enforce borders under aspect ratio lock
                    if (left + width > cw) {
                        width = cw - left;
                        height = width / aspectRatio;
                    }
                    if (top + height > ch) {
                        height = ch - top;
                        width = height * aspectRatio;
                    }
                }

                cropBox.style.left = Math.round(left) + 'px';
                cropBox.style.top = Math.round(top) + 'px';
                cropBox.style.width = Math.round(width) + 'px';
                cropBox.style.height = Math.round(height) + 'px';
            }

            updateCropStats();
            e.preventDefault();
        }

        function endDrag() {
            isDragging = false;
            isResizing = false;
            resizeHandle = '';
        }
    }

    function updateCropStats() {
        const clientW = cropperImg.clientWidth;
        const clientH = cropperImg.clientHeight;
        if (!originalImg || clientW === 0 || clientH === 0) return;

        const boxL = parseInt(cropBox.style.left) || 0;
        const boxT = parseInt(cropBox.style.top) || 0;
        const boxW = parseInt(cropBox.style.width) || 100;
        const boxH = parseInt(cropBox.style.height) || 100;

        const scaleX = originalImg.width / clientW;
        const scaleY = originalImg.height / clientH;

        const realW = Math.round(boxW * scaleX);
        const realH = Math.round(boxH * scaleY);

        cropResDisplay.textContent = `Crop Area: ${realW} × ${realH} px`;
    }

    function doCrop() {
        if (!originalImg) return;
        showLoading(true);

        const clientW = cropperImg.clientWidth;
        const clientH = cropperImg.clientHeight;

        const boxL = parseInt(cropBox.style.left) || 0;
        const boxT = parseInt(cropBox.style.top) || 0;
        const boxW = parseInt(cropBox.style.width) || 100;
        const boxH = parseInt(cropBox.style.height) || 100;

        const scaleX = originalImg.width / clientW;
        const scaleY = originalImg.height / clientH;

        const realX = Math.round(boxL * scaleX);
        const realY = Math.round(boxT * scaleY);
        const realW = Math.round(boxW * scaleX);
        const realH = Math.round(boxH * scaleY);

        procCanvas.width = realW;
        procCanvas.height = realH;
        const ctx = procCanvas.getContext('2d');
        ctx.clearRect(0, 0, realW, realH);

        // Draw cropped portion
        ctx.drawImage(originalImg, realX, realY, realW, realH, 0, 0, realW, realH);

        // Generate output blob
        const format = formatSelect.value;
        const quality = parseInt(qualitySlider.value) / 100;

        procCanvas.toBlob((blob) => {
            if (!blob) {
                TN.toast.error('Failed to crop image.');
                showLoading(false);
                return;
            }

            croppedBlob = blob;
            procSizeDisplay.textContent = `File Size: ${formatBytes(blob.size)}`;
            downloadBtn.disabled = false;
            showLoading(false);
            TN.toast.success('Crop applied! Ready to download.');
        }, format, quality);
    }

    function initControls() {
        // Wire aspect ratio button chips
        const chips = document.querySelectorAll('.ratio-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                const ratioVal = chip.getAttribute('data-ratio');
                if (ratioVal === 'free') {
                    aspectRatio = null;
                } else {
                    aspectRatio = parseFloat(ratioVal);
                }
                
                if (originalImg) setupCropper();
            });
        });

        // Format listener
        if (formatSelect) {
            formatSelect.addEventListener('change', () => {
                const isLossy = formatSelect.value !== 'image/png';
                qualityGroup.style.display = isLossy ? 'block' : 'none';
                if (croppedBlob) doCrop(); // re-compress if cropped output exists
            });
        }

        // Quality slider
        if (qualitySlider) {
            qualitySlider.addEventListener('input', () => {
                qualityVal.textContent = qualitySlider.value + '%';
            });
            qualitySlider.addEventListener('change', () => {
                if (croppedBlob) doCrop();
            });
        }

        // Apply crop click
        if (applyCropBtn) {
            applyCropBtn.addEventListener('click', doCrop);
        }

        // Download click
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                if (!croppedBlob) return;

                const extMap = {
                    'image/jpeg': '.jpg',
                    'image/png': '.png',
                    'image/webp': '.webp'
                };
                const ext = extMap[formatSelect.value] || '.png';
                const baseName = originalFile.name.substring(0, originalFile.name.lastIndexOf('.')) || 'image';

                const link = document.createElement('a');
                link.href = URL.createObjectURL(croppedBlob);
                link.download = `${baseName}-cropped${ext}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                TN.toast.success('Downloaded cropped image!');
            });
        }

        // Clear resets
        const resetAction = () => {
            originalImg = null;
            originalFile = null;
            croppedBlob = null;
            fileInput.value = '';
            
            fileDetails.style.display = 'none';
            previewSection.style.display = 'none';
            controlsSection.style.display = 'none';
            dropzone.style.display = 'flex';

            cropperImg.src = '';
            downloadBtn.disabled = true;

            procCanvas.width = 150;
            procCanvas.height = 150;
            procCanvas.getContext('2d').clearRect(0, 0, 150, 150);
            procSizeDisplay.textContent = 'Click Crop to generate';
            
            TN.toast.info('Cleared');
        };

        if (resetBtn) resetBtn.addEventListener('click', resetAction);
        if (clearBtn) clearBtn.addEventListener('click', resetAction);
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

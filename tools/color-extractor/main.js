(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        // UI Elements
        const dropzone = document.getElementById('file-dropzone');
        const fileInput = document.getElementById('file-input');
        const selectedFileDetails = document.getElementById('selected-file-details');
        const fileNameSpan = selectedFileDetails.querySelector('.file-name');
        const fileSizeSpan = selectedFileDetails.querySelector('.file-size');
        const imagePreview = document.getElementById('image-preview');

        const selectSize = document.getElementById('palette-size');
        const instructions = document.getElementById('palette-instructions');
        const swatchesGrid = document.getElementById('swatches-grid');

        const btnCopy = document.getElementById('btn-copy-palette');
        const btnDownload = document.getElementById('btn-download-palette');
        const resetBtn = document.getElementById('tool-reset');

        // State
        let loadedImage = null;
        let extractedColors = [];

        // Drag & Drop Setup
        dropzone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('dragover');
            }, false);
        });

        dropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });

        // File Handler
        function handleFile(file) {
            if (!file.type.startsWith('image/')) {
                showToast('Please upload a valid image file', 'error');
                return;
            }

            // Display details
            fileNameSpan.textContent = file.name;
            fileSizeSpan.textContent = formatBytes(file.size);
            selectedFileDetails.style.display = 'block';
            dropzone.style.display = 'none';

            // Preview loader
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreview.src = e.target.result;
                const img = new Image();
                img.src = e.target.result;
                img.onload = function () {
                    loadedImage = img;
                    runExtraction();
                };
            };
            reader.readAsDataURL(file);
        }

        // Palette Size Selector listener
        selectSize.addEventListener('change', () => {
            if (loadedImage) {
                runExtraction();
            }
        });

        // Copy button
        btnCopy.addEventListener('click', () => {
            if (extractedColors.length === 0) return;
            const text = JSON.stringify(extractedColors);
            navigator.clipboard.writeText(text).then(() => {
                showToast('Copied colors list (JSON array)');
            }).catch(() => {
                showToast('Copy failed.', 'error');
            });
        });

        // Download button
        btnDownload.addEventListener('click', () => {
            if (extractedColors.length === 0) return;
            let cssContent = `/* Extracted Color Palette from ToolNest */\n:root {\n`;
            extractedColors.forEach((color, idx) => {
                cssContent += `  --color-${idx + 1}: ${color.toLowerCase()};\n`;
            });
            cssContent += `}\n`;

            const blob = new Blob([cssContent], { type: 'text/css' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'extracted-palette.css';
            a.click();
            URL.revokeObjectURL(url);
            showToast('CSS variables downloaded');
        });

        // Reset
        resetBtn.addEventListener('click', () => {
            loadedImage = null;
            extractedColors = [];
            fileInput.value = '';
            imagePreview.src = '';
            selectedFileDetails.style.display = 'none';
            dropzone.style.display = 'flex';
            selectSize.value = '5';

            instructions.style.display = 'flex';
            swatchesGrid.style.display = 'none';
            swatchesGrid.innerHTML = '';

            btnCopy.disabled = true;
            btnCopy.style.opacity = '0.5';
            btnCopy.style.cursor = 'not-allowed';
            btnDownload.disabled = true;
            btnDownload.style.opacity = '0.5';
            btnDownload.style.cursor = 'not-allowed';

            showToast('Reset completed.');
        });

        // Main Extraction Engine
        function runExtraction() {
            if (!loadedImage) return;

            const size = parseInt(selectSize.value);
            const colors = extractPalette(loadedImage, size);
            extractedColors = colors;

            // Render swatches
            instructions.style.display = 'none';
            swatchesGrid.style.display = 'grid';
            swatchesGrid.innerHTML = '';

            colors.forEach((color) => {
                const swatchCard = document.createElement('div');
                swatchCard.className = 'card card-interactive';
                swatchCard.style.padding = 'var(--spacing-1)';
                swatchCard.style.cursor = 'pointer';
                swatchCard.style.display = 'flex';
                swatchCard.style.alignItems = 'center';
                swatchCard.style.gap = 'var(--spacing-15)';

                swatchCard.innerHTML = `
                    <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background-color: ${color}; flex-shrink: 0;"></div>
                    <div style="flex-grow: 1;">
                        <div class="text-sm font-mono weight-bold">${color.toUpperCase()}</div>
                    </div>
                    <button class="btn btn-ghost btn-xs swatch-copy-btn" style="padding: 4px 8px;">Copy</button>
                `;

                // Individual swatch click-to-copy
                const copyAction = () => {
                    navigator.clipboard.writeText(color).then(() => {
                        showToast(`Copied ${color}`);
                    }).catch(() => {
                        showToast('Copy failed.', 'error');
                    });
                };

                swatchCard.addEventListener('click', copyAction);
                swatchCard.querySelector('.swatch-copy-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    copyAction();
                });

                swatchesGrid.appendChild(swatchCard);
            });

            // Enable action buttons
            btnCopy.disabled = false;
            btnCopy.style.opacity = '1';
            btnCopy.style.cursor = 'pointer';
            btnDownload.disabled = false;
            btnDownload.style.opacity = '1';
            btnDownload.style.cursor = 'pointer';

            showToast('Color palette extracted successfully');
        }

        // Color extraction algorithm (Quantization via 3D Grid)
        function extractPalette(imgElement, numColors) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 100;
            canvas.height = 100;
            ctx.drawImage(imgElement, 0, 0, 100, 100);
            
            let imgData;
            try {
                imgData = ctx.getImageData(0, 0, 100, 100).data;
            } catch (_) {
                // Return dummy colors if cross-origin image blocks getImageData
                return ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'].slice(0, numColors);
            }

            const buckets = {};
            // Sample pixels to build grid frequencies
            for (let i = 0; i < imgData.length; i += 16) {
                const r = imgData[i];
                const g = imgData[i+1];
                const b = imgData[i+2];
                const a = imgData[i+3];

                if (a < 128) continue; // skip highly transparent pixels

                // Quantize to group close colors (bucket spacing of 24)
                const qR = Math.round(r / 24) * 24;
                const qG = Math.round(g / 24) * 24;
                const qB = Math.round(b / 24) * 24;
                const key = `${qR},${qG},${qB}`;

                if (!buckets[key]) {
                    buckets[key] = { r: 0, g: 0, b: 0, count: 0 };
                }
                buckets[key].r += r;
                buckets[key].g += g;
                buckets[key].b += b;
                buckets[key].count++;
            }

            // Sort buckets by popularity
            const sortedBuckets = Object.values(buckets).sort((a, b) => b.count - a.count);
            const palette = [];
            const limit = Math.min(numColors, sortedBuckets.length);

            for (let i = 0; i < limit; i++) {
                const bucket = sortedBuckets[i];
                const avgR = Math.round(bucket.r / bucket.count);
                const avgG = Math.round(bucket.g / bucket.count);
                const avgB = Math.round(bucket.b / bucket.count);
                palette.push(rgbToHex(avgR, avgG, avgB));
            }

            // Fill fallback colors if image is uniform/blank
            while (palette.length < numColors) {
                palette.push(generateRandomColor());
            }

            return palette;
        }

        // Helpers
        function rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }

        function generateRandomColor() {
            const hex = Math.floor(Math.random() * 16777215).toString(16);
            return '#' + hex.padStart(6, '0');
        }

        function formatBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function showToast(message, type = 'success') {
            if (window.TN && window.TN.toast) {
                window.TN.toast.show(message, type);
            } else {
                console.log(type + ": " + message);
            }
        }
    });
})();

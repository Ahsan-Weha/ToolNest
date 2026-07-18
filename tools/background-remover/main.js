/**
 * Background Remover Controller - ToolNest
 *
 * Current Implementation: Chroma-key color distance (local, instant)
 *   - Click on canvas to pick a background color
 *   - Adjust tolerance threshold
 *   - Pixels within threshold distance are made transparent
 *
 * AI API Integration Placeholder:
 * To connect a real AI background removal API (e.g. Remove.bg, Clipdrop,
 * Stability AI, or PhotoRoom), implement `callAIRemoveBackgroundAPI()` below.
 * The function receives the original image Blob and must resolve with a
 * transparent PNG Blob of the subject.
 *
 * Steps to connect:
 *   1. Set AI_API_ENABLED = true
 *   2. Set AI_API_ENDPOINT to your backend/proxy URL
 *   3. Implement the API call in callAIRemoveBackgroundAPI()
 *   4. Enable the <option value="ai"> in index.html's #removal-method select
 */
(function () {
    'use strict';

    // =========================================================================
    // AI API Configuration
    // =========================================================================
    const AI_API_ENABLED = false;
    const AI_API_ENDPOINT = 'https://your-api-endpoint.example.com/remove-bg';

    /**
     * AI Background Removal Placeholder
     * @param {Blob} imageBlob - Original image
     * @returns {Promise<Blob>} - Transparent PNG blob with background removed
     */
    async function callAIRemoveBackgroundAPI(imageBlob) {
        // --- IMPLEMENT YOUR AI API CALL HERE ---
        // Example using Remove.bg API:
        //
        // const formData = new FormData();
        // formData.append('image_file', imageBlob, 'input.png');
        // formData.append('size', 'auto');
        //
        // const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        //     method: 'POST',
        //     headers: { 'X-Api-Key': 'YOUR_REMOVE_BG_API_KEY' },
        //     body: formData
        // });
        //
        // if (!response.ok) throw new Error(`API error: ${response.status}`);
        // return await response.blob(); // Returns transparent PNG
        // ----------------------------------------

        throw new Error('AI API not configured. Implement callAIRemoveBackgroundAPI().');
    }
    // =========================================================================

    let originalImg = null;
    let originalFile = null;
    let resultBlob = null;
    let pickedColor = { r: 255, g: 255, b: 255 }; // Default white
    let isPickerActive = false;

    // DOM elements
    const dropzone = document.getElementById('file-dropzone');
    const fileInput = document.getElementById('file-input');
    const fileDetails = document.getElementById('selected-file-details');
    const resetBtn = document.getElementById('tool-reset');
    const previewSection = document.getElementById('image-preview-section');
    const controlsSection = document.getElementById('remover-controls');

    const origCanvas = document.getElementById('canvas-original');
    const procCanvas = document.getElementById('canvas-processed');
    const origCanvasWrapper = document.getElementById('orig-canvas-wrapper');

    const origSizeDisplay = document.getElementById('original-size-display');
    const procSizeDisplay = document.getElementById('processed-size-display');

    const methodSelect = document.getElementById('removal-method');
    const chromaControls = document.getElementById('chroma-controls');
    const pickColorBtn = document.getElementById('pick-color-btn');
    const colorSwatch = document.getElementById('selected-color-swatch');
    const colorHintEl = document.getElementById('color-hint');
    const pickedColorHex = document.getElementById('picked-color-hex');
    const thresholdSlider = document.getElementById('threshold-slider');
    const thresholdVal = document.getElementById('threshold-val');
    const applyBtn = document.getElementById('apply-removal-btn');

    const clearBtn = document.getElementById('clear-btn');
    const downloadBtn = document.getElementById('download-image-btn');
    const loader = document.getElementById('tool-loader');

    document.addEventListener('DOMContentLoaded', () => {
        initDragAndDrop();
        initControls();

        if (AI_API_ENABLED) {
            const aiOption = methodSelect.querySelector('option[value="ai"]');
            if (aiOption) {
                aiOption.disabled = false;
                aiOption.textContent = 'AI Matting (API Connected)';
            }
        }
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

        showLoading(true);
        originalFile = file;

        const reader = new FileReader();
        reader.onerror = () => { TN.toast.error('Failed to read file.'); showLoading(false); };
        reader.onload = (e) => {
            originalImg = new Image();
            originalImg.onerror = () => { TN.toast.error('Failed to load image.'); showLoading(false); };
            originalImg.onload = () => {
                origCanvas.width = originalImg.width;
                origCanvas.height = originalImg.height;
                origCanvas.getContext('2d').drawImage(originalImg, 0, 0);

                origSizeDisplay.textContent = `${originalImg.width}×${originalImg.height} — Click canvas to pick color`;

                fileDetails.style.display = 'block';
                fileDetails.querySelector('.file-name').textContent = file.name;
                fileDetails.querySelector('.file-size').textContent = formatBytes(file.size);

                previewSection.style.display = 'block';
                controlsSection.style.display = 'block';
                dropzone.style.display = 'none';

                showLoading(false);
                TN.toast.success('Image loaded! Pick a background color to remove.');
            };
            originalImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function removeBackground() {
        if (!originalImg) return;

        const method = methodSelect ? methodSelect.value : 'chroma';

        if (method === 'ai' && AI_API_ENABLED) {
            removeWithAI();
        } else {
            removeWithChromaKey();
        }
    }

    function removeWithChromaKey() {
        showLoading(true);

        const threshold = parseInt(thresholdSlider.value);

        // Draw to processing canvas
        procCanvas.width = originalImg.width;
        procCanvas.height = originalImg.height;
        const ctx = procCanvas.getContext('2d');
        ctx.drawImage(originalImg, 0, 0);

        const imageData = ctx.getImageData(0, 0, procCanvas.width, procCanvas.height);
        const data = imageData.data;

        const tr = pickedColor.r;
        const tg = pickedColor.g;
        const tb = pickedColor.b;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Euclidean color distance in RGB space
            const dist = Math.sqrt(
                (r - tr) ** 2 +
                (g - tg) ** 2 +
                (b - tb) ** 2
            );

            if (dist <= threshold * 2.22) { // Scale threshold to 0–255 range
                data[i + 3] = 0; // Make pixel transparent
            }
        }

        ctx.putImageData(imageData, 0, 0);

        procCanvas.toBlob((blob) => {
            resultBlob = blob;
            procSizeDisplay.textContent = `Size: ${formatBytes(blob.size)} (Transparent PNG)`;
            downloadBtn.disabled = false;
            showLoading(false);
            TN.toast.success('Background removed! Download ready.');
        }, 'image/png');
    }

    async function removeWithAI() {
        showLoading(true);
        TN.toast.info('Sending to AI API...');

        try {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = originalImg.width;
            tempCanvas.height = originalImg.height;
            tempCanvas.getContext('2d').drawImage(originalImg, 0, 0);
            const inputBlob = await new Promise(res => tempCanvas.toBlob(res, 'image/png'));

            const aiBlob = await callAIRemoveBackgroundAPI(inputBlob);

            const resultImg = new Image();
            resultImg.onload = () => {
                procCanvas.width = resultImg.width;
                procCanvas.height = resultImg.height;
                procCanvas.getContext('2d').drawImage(resultImg, 0, 0);
                resultBlob = aiBlob;
                procSizeDisplay.textContent = `Size: ${formatBytes(aiBlob.size)} (AI Removed)`;
                downloadBtn.disabled = false;
                showLoading(false);
                TN.toast.success('AI background removal complete!');
            };
            resultImg.src = URL.createObjectURL(aiBlob);
        } catch (err) {
            TN.toast.error(`AI failed: ${err.message}. Falling back to chroma-key.`);
            methodSelect.value = 'chroma';
            removeWithChromaKey();
        }
    }

    function initControls() {
        // Method toggle
        if (methodSelect) {
            methodSelect.addEventListener('change', () => {
                const method = methodSelect.value;
                chromaControls.style.display = method === 'chroma' ? 'block' : 'none';
            });
        }

        // Color picker toggle
        if (pickColorBtn) {
            pickColorBtn.addEventListener('click', () => {
                isPickerActive = !isPickerActive;
                origCanvas.classList.toggle('picker-active', isPickerActive);
                pickColorBtn.textContent = isPickerActive ? '❌ Cancel Pick' : '🎯 Pick from Image';
                colorHintEl.textContent = isPickerActive
                    ? 'Now click on the background color in the left image'
                    : 'Click the canvas to pick a color';
            });
        }

        // Canvas click picks color
        if (origCanvas) {
            origCanvas.addEventListener('click', (e) => {
                if (!isPickerActive || !originalImg) return;

                const rect = origCanvas.getBoundingClientRect();
                const scaleX = origCanvas.width / rect.width;
                const scaleY = origCanvas.height / rect.height;

                const x = Math.round((e.clientX - rect.left) * scaleX);
                const y = Math.round((e.clientY - rect.top) * scaleY);

                const ctx = origCanvas.getContext('2d');
                const pixel = ctx.getImageData(x, y, 1, 1).data;

                pickedColor = { r: pixel[0], g: pixel[1], b: pixel[2] };

                const hex = `#${toHex(pixel[0])}${toHex(pixel[1])}${toHex(pixel[2])}`;
                if (colorSwatch) colorSwatch.style.background = hex;
                if (pickedColorHex) pickedColorHex.textContent = hex;

                // Deactivate picker
                isPickerActive = false;
                origCanvas.classList.remove('picker-active');
                pickColorBtn.textContent = '🎯 Pick from Image';
                colorHintEl.textContent = 'Color picked! Adjust tolerance, then click Remove.';

                TN.toast.success(`Color picked: ${hex}`);
            });
        }

        // Threshold slider
        if (thresholdSlider) {
            thresholdSlider.addEventListener('input', () => {
                thresholdVal.textContent = thresholdSlider.value;
            });
        }

        // Apply removal button
        if (applyBtn) applyBtn.addEventListener('click', removeBackground);

        const resetAction = () => {
            originalImg = null;
            originalFile = null;
            resultBlob = null;
            fileInput.value = '';
            isPickerActive = false;
            pickedColor = { r: 255, g: 255, b: 255 };

            fileDetails.style.display = 'none';
            previewSection.style.display = 'none';
            controlsSection.style.display = 'none';
            dropzone.style.display = 'flex';

            clearCanvas(origCanvas);
            clearCanvas(procCanvas);
            downloadBtn.disabled = true;
            if (colorSwatch) colorSwatch.style.background = '#ffffff';
            if (pickedColorHex) pickedColorHex.textContent = '#ffffff';
            TN.toast.info('Cleared');
        };

        if (resetBtn) resetBtn.addEventListener('click', resetAction);
        if (clearBtn) clearBtn.addEventListener('click', resetAction);

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                if (!resultBlob) { TN.toast.error('Nothing to download yet.'); return; }

                const baseName = originalFile.name.substring(0, originalFile.name.lastIndexOf('.')) || 'image';
                const link = document.createElement('a');
                link.href = URL.createObjectURL(resultBlob);
                link.download = `${baseName}-no-bg.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                TN.toast.success('Transparent PNG downloaded!');
            });
        }
    }

    function toHex(val) {
        return val.toString(16).padStart(2, '0');
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

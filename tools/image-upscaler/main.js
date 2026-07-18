/**
 * Image Upscaler Controller - ToolNest
 *
 * Current Implementation: Canvas-based bilinear resampling (local, instant)
 *
 * AI API Integration Placeholder:
 * To connect a real AI super-resolution API (e.g. Real-ESRGAN via Replicate,
 * Upscale.media, Stability AI, or any other), implement the `callAIUpscaleAPI()`
 * function below. The function receives a Blob of the original image and the
 * desired scale factor, and must resolve with a Blob of the upscaled result.
 *
 * Steps to connect:
 *   1. Set AI_API_ENABLED = true
 *   2. Set AI_API_ENDPOINT to your backend or proxy URL
 *   3. Implement the API call in callAIUpscaleAPI()
 *   4. Enable the <option value="ai"> in index.html's #upscale-method select
 */
(function () {
    'use strict';

    // =========================================================================
    // AI API Configuration — Edit this block to connect a real API
    // =========================================================================
    const AI_API_ENABLED = false; // Set to true once API is configured
    const AI_API_ENDPOINT = 'https://your-api-endpoint.example.com/upscale'; // Replace with real URL

    /**
     * AI Upscale Placeholder
     * @param {Blob} imageBlob - Original image blob
     * @param {number} scale - Desired upscale factor (e.g. 2, 4)
     * @returns {Promise<Blob>} - Upscaled image blob
     */
    async function callAIUpscaleAPI(imageBlob, scale) {
        // --- IMPLEMENT YOUR AI API CALL HERE ---
        // Example using FormData:
        //
        // const formData = new FormData();
        // formData.append('image', imageBlob, 'input.png');
        // formData.append('scale', scale.toString());
        //
        // const response = await fetch(AI_API_ENDPOINT, {
        //     method: 'POST',
        //     headers: { 'Authorization': `Bearer YOUR_API_KEY` },
        //     body: formData
        // });
        //
        // if (!response.ok) throw new Error(`API error: ${response.status}`);
        // return await response.blob();
        // ----------------------------------------

        // Placeholder — rejects until implemented
        throw new Error('AI API not configured. Set AI_API_ENABLED = true and implement callAIUpscaleAPI().');
    }
    // =========================================================================

    let originalImg = null;
    let originalFile = null;
    let upscaledBlob = null;
    let currentScale = 2;

    // DOM elements
    const dropzone = document.getElementById('file-dropzone');
    const fileInput = document.getElementById('file-input');
    const fileDetails = document.getElementById('selected-file-details');
    const resetBtn = document.getElementById('tool-reset');
    const previewSection = document.getElementById('image-preview-section');
    const controlsSection = document.getElementById('upscaler-controls');

    const origCanvas = document.getElementById('canvas-original');
    const procCanvas = document.getElementById('canvas-processed');

    const origSizeDisplay = document.getElementById('original-size-display');
    const procSizeDisplay = document.getElementById('processed-size-display');

    const methodSelect = document.getElementById('upscale-method');
    const clearBtn = document.getElementById('clear-btn');
    const downloadBtn = document.getElementById('download-image-btn');
    const loader = document.getElementById('tool-loader');

    document.addEventListener('DOMContentLoaded', () => {
        initDragAndDrop();
        initScaleChips();
        initControls();

        // Enable AI option if API is configured
        if (AI_API_ENABLED) {
            const aiOption = methodSelect.querySelector('option[value="ai"]');
            if (aiOption) {
                aiOption.disabled = false;
                aiOption.textContent = 'AI Super-Resolution (Powered by API)';
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

    function initScaleChips() {
        const chips = document.querySelectorAll('.scale-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                currentScale = parseFloat(chip.getAttribute('data-scale'));
                if (originalImg) upscaleImage();
            });
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
                // Draw original
                origCanvas.width = originalImg.width;
                origCanvas.height = originalImg.height;
                origCanvas.getContext('2d').drawImage(originalImg, 0, 0);
                origSizeDisplay.textContent = `${originalImg.width}×${originalImg.height} — ${formatBytes(file.size)}`;

                fileDetails.style.display = 'block';
                fileDetails.querySelector('.file-name').textContent = file.name;
                fileDetails.querySelector('.file-size').textContent = formatBytes(file.size);

                previewSection.style.display = 'block';
                controlsSection.style.display = 'block';
                dropzone.style.display = 'none';

                upscaleImage();
            };
            originalImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    async function upscaleImage() {
        if (!originalImg) return;
        showLoading(true);

        const method = methodSelect ? methodSelect.value : 'canvas';

        try {
            if (method === 'ai' && AI_API_ENABLED) {
                // Get original as PNG blob
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = originalImg.width;
                tempCanvas.height = originalImg.height;
                tempCanvas.getContext('2d').drawImage(originalImg, 0, 0);

                const inputBlob = await new Promise(res => tempCanvas.toBlob(res, 'image/png'));

                TN.toast.info('Sending to AI API...');
                const resultBlob = await callAIUpscaleAPI(inputBlob, currentScale);

                // Draw AI result to canvas
                const aiImg = new Image();
                aiImg.onload = () => {
                    procCanvas.width = aiImg.width;
                    procCanvas.height = aiImg.height;
                    procCanvas.getContext('2d').drawImage(aiImg, 0, 0);
                    upscaledBlob = resultBlob;
                    procSizeDisplay.textContent = `${aiImg.width}×${aiImg.height} — ${formatBytes(resultBlob.size)} (AI)`;
                    showLoading(false);
                    TN.toast.success('AI upscaling complete!');
                };
                aiImg.src = URL.createObjectURL(resultBlob);

            } else {
                // Canvas bilinear upscaling (local)
                canvasUpscale();
            }
        } catch (err) {
            TN.toast.error(`Upscaling failed: ${err.message}`);
            // Fall back to canvas
            canvasUpscale();
        }
    }

    function canvasUpscale() {
        const newW = Math.round(originalImg.width * currentScale);
        const newH = Math.round(originalImg.height * currentScale);

        procCanvas.width = newW;
        procCanvas.height = newH;

        const ctx = procCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(originalImg, 0, 0, newW, newH);

        procCanvas.toBlob((blob) => {
            upscaledBlob = blob;
            procSizeDisplay.textContent = `${newW}×${newH} — ${formatBytes(blob.size)} (Canvas ${currentScale}×)`;
            showLoading(false);
        }, originalFile.type || 'image/png');
    }

    function initControls() {
        if (methodSelect) methodSelect.addEventListener('change', () => { if (originalImg) upscaleImage(); });

        const resetAction = () => {
            originalImg = null;
            originalFile = null;
            upscaledBlob = null;
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
                if (!upscaledBlob) { TN.toast.error('Nothing to download.'); return; }
                const ext = originalFile.name.substring(originalFile.name.lastIndexOf('.')) || '.png';
                const baseName = originalFile.name.substring(0, originalFile.name.lastIndexOf('.')) || 'image';

                const link = document.createElement('a');
                link.href = URL.createObjectURL(upscaledBlob);
                link.download = `${baseName}-${currentScale}x${ext}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                TN.toast.success('Upscaled image downloaded!');
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

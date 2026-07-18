/**
 * SVG Converter Controller - ToolNest
 * Converts SVG (file or pasted code) to PNG, JPG, or WebP at custom scale
 */
(function () {
    'use strict';

    let svgContent = null;      // Raw SVG string
    let originalFile = null;
    let convertedBlob = null;
    let inputMode = 'file';     // 'file' | 'code'

    // DOM elements
    const dropzone = document.getElementById('file-dropzone');
    const fileInput = document.getElementById('file-input');
    const fileDetails = document.getElementById('selected-file-details');
    const resetBtn = document.getElementById('tool-reset');
    const previewSection = document.getElementById('image-preview-section');
    const controlsSection = document.getElementById('converter-controls');

    const svgInlinePreview = document.getElementById('svg-inline-preview');
    const procCanvas = document.getElementById('canvas-processed');

    const origSizeDisplay = document.getElementById('original-size-display');
    const procSizeDisplay = document.getElementById('processed-size-display');

    const formatSelect = document.getElementById('export-format');
    const scaleSelect = document.getElementById('render-scale');
    const qualitySlider = document.getElementById('export-quality');
    const qualityVal = document.getElementById('export-quality-val');
    const qualityGroup = document.getElementById('quality-group');

    const tabFile = document.getElementById('tab-file');
    const tabCode = document.getElementById('tab-code');
    const modeFile = document.getElementById('mode-file');
    const modeCode = document.getElementById('mode-code');
    const svgCodeInput = document.getElementById('svg-code-input');
    const renderCodeBtn = document.getElementById('render-code-btn');

    const clearBtn = document.getElementById('clear-btn');
    const reRenderBtn = document.getElementById('re-render-btn');
    const downloadBtn = document.getElementById('download-image-btn');
    const loader = document.getElementById('tool-loader');

    document.addEventListener('DOMContentLoaded', () => {
        initTabs();
        initDragAndDrop();
        initControls();
    });

    function initTabs() {
        tabFile.addEventListener('click', () => {
            inputMode = 'file';
            tabFile.classList.add('active');
            tabCode.classList.remove('active');
            modeFile.style.display = 'block';
            modeCode.style.display = 'none';
        });

        tabCode.addEventListener('click', () => {
            inputMode = 'code';
            tabCode.classList.add('active');
            tabFile.classList.remove('active');
            modeFile.style.display = 'none';
            modeCode.style.display = 'block';
        });

        if (renderCodeBtn) {
            renderCodeBtn.addEventListener('click', () => {
                const code = svgCodeInput.value.trim();
                if (!code || !code.includes('<svg')) {
                    TN.toast.error('Please paste valid SVG code containing <svg>');
                    return;
                }
                svgContent = code;
                originalFile = null;
                loadAndRender('pasted-svg.svg');
            });
        }
    }

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
        const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
        if (!isSvg) { TN.toast.error('Please upload an SVG file (.svg)'); return; }

        showLoading(true);
        originalFile = file;

        const reader = new FileReader();
        reader.onerror = () => { TN.toast.error('Failed to read file.'); showLoading(false); };
        reader.onload = (e) => {
            svgContent = e.target.result;
            loadAndRender(file.name);
        };
        reader.readAsText(file);
    }

    function loadAndRender(fileName) {
        showLoading(true);

        // Show inline SVG preview
        svgInlinePreview.innerHTML = '';
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
        const svgEl = svgDoc.querySelector('svg');

        if (!svgEl) {
            TN.toast.error('Invalid SVG — no <svg> element found.');
            showLoading(false);
            return;
        }

        // Inline it to preview
        const cloned = svgEl.cloneNode(true);
        cloned.style.maxWidth = '100%';
        cloned.style.maxHeight = '280px';
        svgInlinePreview.appendChild(cloned);

        // Update metadata
        const w = svgEl.getAttribute('width') || svgEl.viewBox?.baseVal?.width || '(auto)';
        const h = svgEl.getAttribute('height') || svgEl.viewBox?.baseVal?.height || '(auto)';
        origSizeDisplay.textContent = `Vector: ${w}×${h}`;

        // Update UI visibility
        fileDetails.style.display = 'block';
        fileDetails.querySelector('.file-name').textContent = fileName;
        fileDetails.querySelector('.file-size').textContent = 'SVG Vector';

        previewSection.style.display = 'block';
        controlsSection.style.display = 'block';
        dropzone.style.display = 'none';

        renderToCanvas();
    }

    function renderToCanvas() {
        if (!svgContent) return;
        showLoading(true);

        const scale = parseFloat(scaleSelect.value) || 2;
        const format = formatSelect.value;
        const quality = parseInt(qualitySlider.value) / 100;
        const isPNG = format === 'image/png';

        // Update quality group opacity
        qualityGroup.style.opacity = isPNG ? '0.3' : '1';
        qualitySlider.disabled = isPNG;

        // Get natural SVG dimensions
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
        const svgEl = svgDoc.querySelector('svg');

        if (!svgEl) { TN.toast.error('Invalid SVG content.'); showLoading(false); return; }

        let svgW = parseFloat(svgEl.getAttribute('width')) || 0;
        let svgH = parseFloat(svgEl.getAttribute('height')) || 0;

        // Fall back to viewBox if width/height are missing
        const vb = svgEl.getAttribute('viewBox');
        if ((!svgW || !svgH) && vb) {
            const parts = vb.split(/[\s,]+/);
            if (parts.length === 4) {
                svgW = parseFloat(parts[2]);
                svgH = parseFloat(parts[3]);
            }
        }

        if (!svgW || !svgH) {
            svgW = 512;
            svgH = 512;
        }

        const canvasW = Math.round(svgW * scale);
        const canvasH = Math.round(svgH * scale);

        // Encode SVG to a data URL
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            procCanvas.width = canvasW;
            procCanvas.height = canvasH;
            const ctx = procCanvas.getContext('2d');
            ctx.clearRect(0, 0, canvasW, canvasH);

            if (format === 'image/jpeg') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvasW, canvasH);
            }

            ctx.drawImage(img, 0, 0, canvasW, canvasH);
            URL.revokeObjectURL(url);

            procCanvas.toBlob((blob) => {
                if (!blob) { TN.toast.error('Rendering failed.'); showLoading(false); return; }
                convertedBlob = blob;
                procSizeDisplay.textContent = `Size: ${canvasW}×${canvasH} — ${formatBytes(blob.size)}`;
                showLoading(false);
            }, format, isPNG ? undefined : quality);
        };

        img.onerror = () => {
            TN.toast.error('Failed to render SVG. It may contain external resources.');
            URL.revokeObjectURL(url);
            showLoading(false);
        };

        img.src = url;
    }

    function initControls() {
        if (formatSelect) formatSelect.addEventListener('change', renderToCanvas);
        if (scaleSelect) scaleSelect.addEventListener('change', renderToCanvas);
        if (qualitySlider) {
            qualitySlider.addEventListener('input', () => { qualityVal.textContent = qualitySlider.value + '%'; });
            qualitySlider.addEventListener('change', renderToCanvas);
        }

        if (reRenderBtn) reRenderBtn.addEventListener('click', renderToCanvas);

        const resetAction = () => {
            svgContent = null;
            originalFile = null;
            convertedBlob = null;
            fileInput.value = '';
            if (svgCodeInput) svgCodeInput.value = '';

            fileDetails.style.display = 'none';
            previewSection.style.display = 'none';
            controlsSection.style.display = 'none';
            dropzone.style.display = 'flex';
            svgInlinePreview.innerHTML = '';

            procCanvas.width = 150;
            procCanvas.height = 150;
            procCanvas.getContext('2d').clearRect(0, 0, 150, 150);
            TN.toast.info('Cleared');
        };

        if (resetBtn) resetBtn.addEventListener('click', resetAction);
        if (clearBtn) clearBtn.addEventListener('click', resetAction);

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                if (!convertedBlob) { TN.toast.error('Nothing to download yet.'); return; }

                const extMap = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' };
                const ext = extMap[formatSelect.value] || '.png';
                const baseName = originalFile ? originalFile.name.replace(/\.svg$/i, '') : 'svg-image';

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

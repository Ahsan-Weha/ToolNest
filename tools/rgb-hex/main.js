(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        // UI Elements
        const numRed = document.getElementById('num-red');
        const sliderRed = document.getElementById('slider-red');
        const numGreen = document.getElementById('num-green');
        const sliderGreen = document.getElementById('slider-green');
        const numBlue = document.getElementById('num-blue');
        const sliderBlue = document.getElementById('slider-blue');
        const numAlpha = document.getElementById('num-alpha');
        const sliderAlpha = document.getElementById('slider-alpha');

        const previewSwatch = document.getElementById('color-preview-swatch');
        const outputHex6 = document.getElementById('output-hex6');
        const outputHex8 = document.getElementById('output-hex8');
        const outputHexShort = document.getElementById('output-hex-short');
        const btnCopyShort = document.getElementById('btn-copy-short');

        const resetBtn = document.getElementById('tool-reset');

        const DEFAULT_R = 99;
        const DEFAULT_G = 102;
        const DEFAULT_B = 241;
        const DEFAULT_A = 1.0;

        let isUpdating = false;

        // Channel configuration mapping
        const channels = [
            { num: numRed, slider: sliderRed, min: 0, max: 255, step: 1 },
            { num: numGreen, slider: sliderGreen, min: 0, max: 255, step: 1 },
            { num: numBlue, slider: sliderBlue, min: 0, max: 255, step: 1 }
        ];

        // Bind standard RGB channels
        channels.forEach(ch => {
            ch.num.addEventListener('input', () => {
                if (isUpdating) return;
                let val = parseInt(ch.num.value);
                if (isNaN(val)) val = ch.min;
                if (val < ch.min) val = ch.min;
                if (val > ch.max) val = ch.max;
                ch.num.value = val;
                ch.slider.value = val;
                updateHex();
            });

            ch.slider.addEventListener('input', () => {
                if (isUpdating) return;
                ch.num.value = ch.slider.value;
                updateHex();
            });
        });

        // Bind Alpha channels
        numAlpha.addEventListener('input', () => {
            if (isUpdating) return;
            let val = parseFloat(numAlpha.value);
            if (isNaN(val)) val = 0.0;
            if (val < 0.0) val = 0.0;
            if (val > 1.0) val = 1.0;
            numAlpha.value = val;
            sliderAlpha.value = Math.round(val * 100);
            updateHex();
        });

        sliderAlpha.addEventListener('input', () => {
            if (isUpdating) return;
            numAlpha.value = (sliderAlpha.value / 100).toFixed(2);
            updateHex();
        });

        // Copy events
        document.querySelectorAll('.copy-btn-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.disabled || btn.classList.contains('disabled')) return;
                const targetId = btn.getAttribute('data-target');
                const targetInput = document.getElementById(targetId);
                if (targetInput && targetInput.value && targetInput.value !== 'N/A') {
                    navigator.clipboard.writeText(targetInput.value).then(() => {
                        showToast('Copied to clipboard!');
                    }).catch(() => {
                        showToast('Copy failed.', 'error');
                    });
                }
            });
        });

        // Reset
        resetBtn.addEventListener('click', () => {
            isUpdating = true;
            numRed.value = DEFAULT_R;
            sliderRed.value = DEFAULT_R;
            numGreen.value = DEFAULT_G;
            sliderGreen.value = DEFAULT_G;
            numBlue.value = DEFAULT_B;
            sliderBlue.value = DEFAULT_B;
            numAlpha.value = DEFAULT_A.toFixed(1);
            sliderAlpha.value = Math.round(DEFAULT_A * 100);
            isUpdating = false;

            updateHex();
            showToast('Reset completed.');
        });

        // Main Conversion Engine
        function updateHex() {
            const r = parseInt(numRed.value);
            const g = parseInt(numGreen.value);
            const b = parseInt(numBlue.value);
            const a = parseFloat(numAlpha.value);

            // Compute Hex channels
            const rHex = toHex(r);
            const gHex = toHex(g);
            const bHex = toHex(b);

            // Alpha to hex byte
            const aByte = Math.round(a * 255);
            const aHex = toHex(aByte);

            const hex6 = `#${rHex}${gHex}${bHex}`.toLowerCase();
            const hex8 = `#${rHex}${gHex}${bHex}${aHex}`.toLowerCase();

            // Swatch background update
            previewSwatch.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;

            // Populate text values
            outputHex6.value = hex6;
            outputHex8.value = hex8;

            // Check if shorthand is possible
            const shortHex = getShorthand(rHex, gHex, bHex, aHex, a);
            if (shortHex) {
                outputHexShort.value = shortHex;
                btnCopyShort.disabled = false;
                btnCopyShort.classList.remove('disabled');
            } else {
                outputHexShort.value = 'N/A';
                btnCopyShort.disabled = true;
                btnCopyShort.classList.add('disabled');
            }
        }

        // Decimal to padded Hex string
        function toHex(val) {
            let hex = val.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }

        // Shorthand evaluation
        function getShorthand(r, g, b, aHex, a) {
            const isRedShort = r[0] === r[1];
            const isGreenShort = g[0] === g[1];
            const isBlueShort = b[0] === b[1];

            if (isRedShort && isGreenShort && isBlueShort) {
                if (a === 1.0) {
                    return `#${r[0]}${g[0]}${b[0]}`;
                } else if (aHex[0] === aHex[1]) {
                    return `#${r[0]}${g[0]}${b[0]}${aHex[0]}`;
                }
            }
            return null;
        }

        // Toast Helper
        function showToast(message, type = 'success') {
            if (window.TN && window.TN.toast) {
                window.TN.toast.show(message, type);
            } else {
                console.log(type + ": " + message);
            }
        }

        // Initial run
        updateHex();
    });
})();

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        // UI Elements
        const inputHex = document.getElementById('input-hex');
        const sliderAlpha = document.getElementById('slider-alpha');
        const labelAlpha = document.getElementById('label-alpha');
        const previewSwatch = document.getElementById('color-preview-swatch');

        const outputRgb = document.getElementById('output-rgb');
        const outputRgba = document.getElementById('output-rgba');
        const outputRawRgb = document.getElementById('output-raw-rgb');
        const outputRawRgba = document.getElementById('output-raw-rgba');

        const errorAlert = document.getElementById('hex-error-alert');
        const errorMessage = document.getElementById('hex-error-message');
        const resetBtn = document.getElementById('tool-reset');

        const DEFAULT_COLOR = '#6366f1';
        let isInternalUpdate = false;

        // Input listener for HEX text
        inputHex.addEventListener('input', () => {
            if (isInternalUpdate) return;
            processConversion(false);
        });

        // Change listener for HEX text (triggers toast error if invalid on blur/enter)
        inputHex.addEventListener('change', () => {
            processConversion(true);
        });

        // Input/Change listeners for Alpha slider
        sliderAlpha.addEventListener('input', () => {
            const alphaVal = (sliderAlpha.value / 100).toFixed(2);
            labelAlpha.textContent = `${alphaVal} (${sliderAlpha.value}%)`;
            processConversion(false);
        });

        // Copy buttons setup
        document.querySelectorAll('.copy-btn-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const targetInput = document.getElementById(targetId);
                if (targetInput && targetInput.value) {
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
            inputHex.value = DEFAULT_COLOR;
            sliderAlpha.value = 100;
            labelAlpha.textContent = '1.00 (100%)';
            processConversion(false);
            showToast('Reset completed.');
        });

        // Main parser and updater
        function processConversion(showAlert = false) {
            let hex = inputHex.value.trim();
            if (!hex.startsWith('#')) {
                hex = '#' + hex;
            }

            const validation = parseHex(hex);
            if (!validation.success) {
                // Show visual error feedback
                errorAlert.style.display = 'flex';
                errorMessage.textContent = `Invalid HEX format: ${validation.error}`;
                if (showAlert) {
                    showToast('Invalid HEX format', 'error');
                }
                return;
            }

            // Hide error alert
            errorAlert.style.display = 'none';

            let { r, g, b, a } = validation.channels;

            // If the HEX code contains an embedded alpha channel, sync the slider
            if (validation.hasAlpha) {
                isInternalUpdate = true;
                const alphaPct = Math.round(a * 100);
                sliderAlpha.value = alphaPct;
                labelAlpha.textContent = `${a.toFixed(2)} (${alphaPct}%)`;
                isInternalUpdate = false;
            } else {
                // Otherwise use the alpha value from the slider
                a = parseFloat((sliderAlpha.value / 100).toFixed(2));
            }

            // Update Swatch Preview
            previewSwatch.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;

            // Populate output fields
            outputRgb.value = `rgb(${r}, ${g}, ${b})`;
            outputRgba.value = `rgba(${r}, ${g}, ${b}, ${a})`;
            outputRawRgb.value = `${r}, ${g}, ${b}`;
            outputRawRgba.value = `${r}, ${g}, ${b}, ${a}`;
        }

        // Parsing logic
        function parseHex(hex) {
            // Strip #
            let c = hex.substring(1);

            // Valid regex patterns
            const valid = /^[0-9A-F]{3}$/i.test(c) ||
                          /^[0-9A-F]{4}$/i.test(c) ||
                          /^[0-9A-F]{6}$/i.test(c) ||
                          /^[0-9A-F]{8}$/i.test(c);

            if (!valid) {
                return { success: false, error: 'Must be 3, 4, 6, or 8 hexadecimal digits.' };
            }

            let r, g, b, a = 1.0;
            let hasAlpha = false;

            if (c.length === 3) {
                r = parseInt(c[0] + c[0], 16);
                g = parseInt(c[1] + c[1], 16);
                b = parseInt(c[2] + c[2], 16);
            } else if (c.length === 4) {
                r = parseInt(c[0] + c[0], 16);
                g = parseInt(c[1] + c[1], 16);
                b = parseInt(c[2] + c[2], 16);
                a = parseInt(c[3] + c[3], 16) / 255;
                hasAlpha = true;
            } else if (c.length === 6) {
                r = parseInt(c.substring(0, 2), 16);
                g = parseInt(c.substring(2, 4), 16);
                b = parseInt(c.substring(4, 6), 16);
            } else if (c.length === 8) {
                r = parseInt(c.substring(0, 2), 16);
                g = parseInt(c.substring(2, 4), 16);
                b = parseInt(c.substring(4, 6), 16);
                a = parseInt(c.substring(6, 8), 16) / 255;
                hasAlpha = true;
            }

            return {
                success: true,
                hasAlpha: hasAlpha,
                channels: { r, g, b, a }
            };
        }

        // Toast Helper
        function showToast(message, type = 'success') {
            if (window.TN && window.TN.toast) {
                window.TN.toast.show(message, type);
            } else {
                console.log(type + ": " + message);
            }
        }

        // Trigger initial conversion
        processConversion(false);
    });
})();

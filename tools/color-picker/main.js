(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        // UI Elements
        const colorPreviewBox = document.getElementById('color-preview-box');
        const nativeColorPicker = document.getElementById('native-color-picker');
        const triggerPickerBtn = document.getElementById('trigger-picker-btn');
        const eyedropperBtn = document.getElementById('eyedropper-btn');

        const sliderHue = document.getElementById('slider-hue');
        const sliderSat = document.getElementById('slider-sat');
        const sliderLight = document.getElementById('slider-light');

        const labelHue = document.getElementById('label-hue');
        const labelSat = document.getElementById('label-sat');
        const labelLight = document.getElementById('label-light');

        const valHex = document.getElementById('val-hex');
        const valRgb = document.getElementById('val-rgb');
        const valHsl = document.getElementById('val-hsl');
        const valCmyk = document.getElementById('val-cmyk');

        const clearHistoryBtn = document.getElementById('clear-history-btn');
        const historyContainer = document.getElementById('history-container');
        const resetBtn = document.getElementById('tool-reset');

        const DEFAULT_COLOR = '#6366f1';
        let currentHex = DEFAULT_COLOR;

        // Verify Eyedropper support
        if (!window.EyeDropper) {
            eyedropperBtn.style.opacity = '0.5';
            eyedropperBtn.title = 'Eyedropper not supported in this browser';
            eyedropperBtn.addEventListener('click', () => {
                showToast('Eyedropper API is not supported by your browser.', 'error');
            });
        } else {
            eyedropperBtn.addEventListener('click', async () => {
                const eyeDropper = new window.EyeDropper();
                try {
                    const result = await eyeDropper.open();
                    updateColor(result.sRGBHex, true);
                    showToast('Color picked successfully!');
                } catch (err) {
                    console.log('Eyedropper closed or failed:', err);
                }
            });
        }

        // Setup triggers
        triggerPickerBtn.addEventListener('click', () => nativeColorPicker.click());
        nativeColorPicker.addEventListener('input', (e) => updateColor(e.target.value, false));
        nativeColorPicker.addEventListener('change', (e) => updateColor(e.target.value, true));

        // Slider Event Listeners
        [sliderHue, sliderSat, sliderLight].forEach(slider => {
            slider.addEventListener('input', () => {
                const h = parseInt(sliderHue.value);
                const s = parseInt(sliderSat.value);
                const l = parseInt(sliderLight.value);
                const hex = hslToHex(h, s, l);
                updateColor(hex, false);
            });
            slider.addEventListener('change', () => {
                const h = parseInt(sliderHue.value);
                const s = parseInt(sliderSat.value);
                const l = parseInt(sliderLight.value);
                const hex = hslToHex(h, s, l);
                updateColor(hex, true);
            });
        });

        // HEX Input change listener
        valHex.addEventListener('input', (e) => {
            let hex = e.target.value.trim();
            if (!hex.startsWith('#')) hex = '#' + hex;
            if (isValidHex(hex)) {
                updateColor(hex, false);
            }
        });
        valHex.addEventListener('change', (e) => {
            let hex = e.target.value.trim();
            if (!hex.startsWith('#')) hex = '#' + hex;
            if (isValidHex(hex)) {
                updateColor(hex, true);
            } else {
                updateColor(currentHex, false);
                showToast('Invalid HEX format', 'error');
            }
        });

        // Copy buttons
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
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                updateColor(DEFAULT_COLOR, true);
                showToast('Configurations reset');
            });
        }

        // History Management
        clearHistoryBtn.addEventListener('click', () => {
            localStorage.removeItem('tn-color-picker-history');
            renderHistory();
            showToast('History cleared');
        });

        function getHistory() {
            try {
                return JSON.parse(localStorage.getItem('tn-color-picker-history')) || [];
            } catch {
                return [];
            }
        }

        function saveToHistory(hex) {
            let history = getHistory();
            // Remove duplicates
            history = history.filter(c => c.toLowerCase() !== hex.toLowerCase());
            // Add to front
            history.unshift(hex);
            // Cap at 14 swatches
            if (history.length > 14) history = history.slice(0, 14);
            localStorage.setItem('tn-color-picker-history', JSON.stringify(history));
            renderHistory();
        }

        function renderHistory() {
            const history = getHistory();
            historyContainer.innerHTML = '';
            if (history.length === 0) {
                historyContainer.innerHTML = '<span class="text-muted text-xs">No colors picked yet</span>';
                return;
            }
            history.forEach(hex => {
                const swatch = document.createElement('div');
                swatch.style.width = '2rem';
                swatch.style.height = '2rem';
                swatch.style.borderRadius = 'var(--radius-sm)';
                swatch.style.backgroundColor = hex;
                swatch.style.border = '1px solid var(--border-color)';
                swatch.style.cursor = 'pointer';
                swatch.title = hex;
                swatch.className = 'card-interactive';
                swatch.addEventListener('click', () => {
                    updateColor(hex, true);
                });
                historyContainer.appendChild(swatch);
            });
        }

        // Color Update Engine
        function updateColor(hex, writeHistory = false) {
            currentHex = hex;

            // Update UI elements
            colorPreviewBox.style.backgroundColor = hex;
            nativeColorPicker.value = hex;
            valHex.value = hex;

            // Conversions
            const rgb = hexToRgb(hex);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

            // Update values text
            valRgb.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            valHsl.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
            valCmyk.value = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

            // Sync range inputs and labels
            sliderHue.value = hsl.h;
            sliderSat.value = hsl.s;
            sliderLight.value = hsl.l;

            labelHue.textContent = `${hsl.h}°`;
            labelSat.textContent = `${hsl.s}%`;
            labelLight.textContent = `${hsl.l}%`;

            // Adjust text readability inside the preview swatch box
            const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            const textCol = brightness > 125 ? '#000000' : '#ffffff';
            triggerPickerBtn.style.color = textCol;
            triggerPickerBtn.style.borderColor = brightness > 125 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)';
            triggerPickerBtn.style.background = brightness > 125 ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

            if (writeHistory) {
                saveToHistory(hex);
            }
        }

        // Toast Helper
        function showToast(message, type = 'success') {
            if (window.TN && window.TN.toast) {
                window.TN.toast.show(message, type);
            } else {
                console.log(type + ": " + message);
            }
        }

        // Color Math Utilities
        function isValidHex(hex) {
            return /^#[0-9A-F]{6}$/i.test(hex) || /^#[0-9A-F]{3}$/i.test(hex);
        }

        // Expand shorthand HEX (#RGB to #RRGGBB)
        function normalizeHex(hex) {
            let c = hex.substring(1);
            if (c.length === 3) {
                c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
            }
            return "#" + c;
        }

        function hexToRgb(hex) {
            const normalized = normalizeHex(hex);
            const num = parseInt(normalized.substring(1), 16);
            return {
                r: (num >> 16) & 255,
                g: (num >> 8) & 255,
                b: num & 255
            };
        }

        function rgbToHsl(r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0; // achromatic
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }

            return {
                h: Math.round(h * 360),
                s: Math.round(s * 100),
                l: Math.round(l * 100)
            };
        }

        function hslToHex(h, s, l) {
            s /= 100;
            l /= 100;
            let c = (1 - Math.abs(2 * l - 1)) * s;
            let x = c * (1 - Math.abs((h / 60) % 2 - 1));
            let m = l - c / 2;
            let r = 0, g = 0, b = 0;

            if (0 <= h && h < 60) {
                r = c; g = x; b = 0;
            } else if (60 <= h && h < 120) {
                r = x; g = c; b = 0;
            } else if (120 <= h && h < 180) {
                r = 0; g = c; b = x;
            } else if (180 <= h && h < 240) {
                r = 0; g = x; b = c;
            } else if (240 <= h && h < 300) {
                r = x; g = 0; b = c;
            } else if (300 <= h && h <= 360) {
                r = c; g = 0; b = x;
            }

            const rInt = Math.round((r + m) * 255);
            const gInt = Math.round((g + m) * 255);
            const bInt = Math.round((b + m) * 255);

            return "#" + ((1 << 24) + (rInt << 16) + (gInt << 8) + bInt).toString(16).slice(1);
        }

        function rgbToCmyk(r, g, b) {
            let rNorm = r / 255;
            let gNorm = g / 255;
            let bNorm = b / 255;

            let k = 1 - Math.max(rNorm, gNorm, bNorm);
            if (k === 1) {
                return { c: 0, m: 0, y: 0, k: 100 };
            }
            let c = (1 - rNorm - k) / (1 - k);
            let m = (1 - gNorm - k) / (1 - k);
            let y = (1 - bNorm - k) / (1 - k);

            return {
                c: Math.round(c * 100),
                m: Math.round(m * 100),
                y: Math.round(y * 100),
                k: Math.round(k * 100)
            };
        }

        // Initialize state
        updateColor(DEFAULT_COLOR, false);
        renderHistory();
    });
})();

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        // UI Elements
        const baseColorNative = document.getElementById('base-color-native');
        const baseColorHex = document.getElementById('base-color-hex');
        const selectRule = document.getElementById('select-rule');
        const btnGenerate = document.getElementById('btn-generate-palette');

        const paletteGrid = document.getElementById('palette-grid');
        const lockBtns = document.querySelectorAll('.btn-circle-lock');
        const hexSpans = document.querySelectorAll('.palette-hex');

        const exportFormat = document.getElementById('export-format');
        const btnExportCopy = document.getElementById('btn-export-copy');
        const btnExportDownload = document.getElementById('btn-export-download');

        const resetBtn = document.getElementById('tool-reset');

        const DEFAULT_SEED = '#6366f1';

        // State variables
        let colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];
        let locked = [false, false, false, false, false];

        // Bind locks clicks
        lockBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.getAttribute('data-index'));
                locked[idx] = !locked[idx];
                
                // Visual lock toggle
                btn.classList.toggle('locked', locked[idx]);
                // Toggle locked SVG icon
                if (locked[idx]) {
                    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`;
                    btn.title = 'Unlock color';
                } else {
                    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`;
                    btn.title = 'Lock color';
                }
            });
        });

        // Copy individual swatch HEX when clicked
        hexSpans.forEach(span => {
            span.addEventListener('click', (e) => {
                e.stopPropagation();
                const colorText = span.textContent;
                navigator.clipboard.writeText(colorText).then(() => {
                    showToast(`Copied ${colorText} to clipboard!`);
                }).catch(() => {
                    showToast('Copy failed.', 'error');
                });
            });
        });

        // Seed Color change listeners
        baseColorNative.addEventListener('input', (e) => {
            baseColorHex.value = e.target.value.toUpperCase();
            generatePalette();
        });
        baseColorHex.addEventListener('input', (e) => {
            const hexVal = e.target.value.trim();
            if (isValidHex(hexVal)) {
                baseColorNative.value = hexVal;
                generatePalette();
            }
        });

        // Generate button trigger
        btnGenerate.addEventListener('click', () => {
            generatePalette();
        });

        // Keydown spacebar trigger
        window.addEventListener('keydown', (e) => {
            // Check if user is typing in form fields
            const tag = e.target.tagName.toLowerCase();
            if (tag === 'input' || tag === 'select' || tag === 'textarea') {
                return;
            }
            if (e.code === 'Space') {
                e.preventDefault();
                generatePalette();
            }
        });

        // Export copy button
        btnExportCopy.addEventListener('click', () => {
            const format = exportFormat.value;
            const text = formatPalette(format);
            navigator.clipboard.writeText(text).then(() => {
                showToast('Palette values copied to clipboard!');
            }).catch(() => {
                showToast('Copy failed.', 'error');
            });
        });

        // Export download button
        btnExportDownload.addEventListener('click', () => {
            const text = formatPalette('css-vars-root');
            const blob = new Blob([text], { type: 'text/css' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'palette.css';
            a.click();
            URL.revokeObjectURL(url);
            showToast('CSS variables file downloaded');
        });

        // Reset
        resetBtn.addEventListener('click', () => {
            baseColorNative.value = DEFAULT_SEED;
            baseColorHex.value = DEFAULT_SEED.toUpperCase();
            selectRule.value = 'random';
            locked = [false, false, false, false, false];
            lockBtns.forEach(btn => {
                btn.classList.remove('locked');
                btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`;
                btn.title = 'Lock color';
            });
            generatePalette();
            showToast('Palette generator reset completed.');
        });

        // Core Palette Generator Engine
        function generatePalette() {
            const seedHex = baseColorNative.value;
            const rule = selectRule.value;
            const newColors = [...colors];

            if (rule === 'random') {
                // Fully random color generation for unlocked items
                for (let i = 0; i < 5; i++) {
                    if (!locked[i]) {
                        newColors[i] = generateRandomColor();
                    }
                }
            } else {
                // Calculate colors based on harmony offsets
                const rgb = hexToRgb(seedHex);
                const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                let calculated = [];

                switch (rule) {
                    case 'monochromatic':
                        // Vary lightness channel
                        calculated = [
                            { h: hsl.h, s: hsl.s, l: Math.max(10, hsl.l - 30) },
                            { h: hsl.h, s: hsl.s, l: Math.max(20, hsl.l - 15) },
                            { h: hsl.h, s: hsl.s, l: hsl.l },
                            { h: hsl.h, s: Math.max(10, hsl.s - 15), l: Math.min(90, hsl.l + 15) },
                            { h: hsl.h, s: Math.max(10, hsl.s - 30), l: Math.min(95, hsl.l + 30) }
                        ];
                        break;
                    case 'analogous':
                        // Hue angles adjacent: -30°, -15°, 0°, +15°, +30°
                        calculated = [
                            { h: (hsl.h - 30 + 360) % 360, s: hsl.s, l: hsl.l },
                            { h: (hsl.h - 15 + 360) % 360, s: hsl.s, l: hsl.l },
                            { h: hsl.h, s: hsl.s, l: hsl.l },
                            { h: (hsl.h + 15) % 360, s: hsl.s, l: hsl.l },
                            { h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l }
                        ];
                        break;
                    case 'complementary':
                        // Seed, seed shade, complement, complement shades
                        calculated = [
                            { h: hsl.h, s: hsl.s, l: Math.max(20, hsl.l - 15) },
                            { h: hsl.h, s: hsl.s, l: hsl.l },
                            { h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l },
                            { h: (hsl.h + 180) % 360, s: hsl.s, l: Math.min(80, hsl.l + 15) },
                            { h: (hsl.h + 180) % 360, s: Math.max(10, hsl.s - 20), l: Math.min(90, hsl.l + 25) }
                        ];
                        break;
                    case 'triadic':
                        // Base (0°), offset (120°), offset (240°) and shades
                        calculated = [
                            { h: hsl.h, s: hsl.s, l: Math.max(20, hsl.l - 10) },
                            { h: hsl.h, s: hsl.s, l: hsl.l },
                            { h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l },
                            { h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l },
                            { h: (hsl.h + 240) % 360, s: hsl.s, l: Math.min(80, hsl.l + 15) }
                        ];
                        break;
                    case 'tetradic':
                        // Base (0°), offset (90°), offset (180°), offset (270°) and 1 shade
                        calculated = [
                            { h: hsl.h, s: hsl.s, l: hsl.l },
                            { h: (hsl.h + 90) % 360, s: hsl.s, l: hsl.l },
                            { h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l },
                            { h: (hsl.h + 270) % 360, s: hsl.s, l: hsl.l },
                            { h: (hsl.h + 270) % 360, s: hsl.s, l: Math.max(20, hsl.l - 15) }
                        ];
                        break;
                }

                // Map calculation results back to HSL HEX format (if index not locked)
                for (let i = 0; i < 5; i++) {
                    if (!locked[i]) {
                        newColors[i] = hslToHex(calculated[i].h, calculated[i].s, calculated[i].l);
                    }
                }
            }

            // Sync colors state
            colors = newColors;
            renderPalette();
        }

        // Apply colors list to swatches UI
        function renderPalette() {
            colors.forEach((col, idx) => {
                const column = paletteGrid.children[idx];
                column.style.backgroundColor = col;

                const hexSpan = column.querySelector('.palette-hex');
                hexSpan.textContent = col.toUpperCase();

                // Compute color luminance to determine text readability contrast color
                const rgb = hexToRgb(col);
                const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
                const contrastColor = brightness > 125 ? '#000000' : '#ffffff';

                hexSpan.style.color = contrastColor;
                hexSpan.style.borderColor = brightness > 125 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)';
                hexSpan.style.background = brightness > 125 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';

                const lockBtn = column.querySelector('.btn-circle-lock');
                lockBtn.style.color = contrastColor;
                lockBtn.style.background = brightness > 125 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
                lockBtn.style.borderColor = brightness > 125 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)';

                if (locked[idx]) {
                    lockBtn.style.background = 'var(--primary)';
                    lockBtn.style.borderColor = 'var(--primary-glow)';
                    lockBtn.style.color = '#ffffff';
                }
            });
        }

        // Formats exporting logic
        function formatPalette(format) {
            let out = '';
            switch (format) {
                case 'css-vars':
                    out = colors.map((col, idx) => `--color-${idx + 1}: ${col.toLowerCase()};`).join('\n');
                    break;
                case 'css-vars-root':
                    out = `/* CSS Variables Palette generated on ToolNest */\n:root {\n` +
                          colors.map((col, idx) => `    --color-${idx + 1}: ${col.toLowerCase()};`).join('\n') +
                          `\n}\n`;
                    break;
                case 'scss':
                    out = colors.map((col, idx) => `$color-${idx + 1}: ${col.toLowerCase()};`).join('\n');
                    break;
                case 'json':
                    out = JSON.stringify(colors.map(col => col.toLowerCase()));
                    break;
            }
            return out;
        }

        // Helper randomizer
        function generateRandomColor() {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

        // Color format validations
        function isValidHex(hex) {
            return /^#[0-9A-F]{6}$/i.test(hex) || /^#[0-9A-F]{3}$/i.test(hex);
        }

        function hexToRgb(hex) {
            let c = hex.substring(1);
            if (c.length === 3) {
                c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
            }
            const num = parseInt(c, 16);
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
                h = s = 0;
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

        function showToast(message, type = 'success') {
            if (window.TN && window.TN.toast) {
                window.TN.toast.show(message, type);
            } else {
                console.log(type + ": " + message);
            }
        }

        // Trigger initial color render
        renderPalette();
    });
})();

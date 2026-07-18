(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const rangeH = document.getElementById('hsl-h');
        const rangeS = document.getElementById('hsl-s');
        const rangeL = document.getElementById('hsl-l');
        const numH = document.getElementById('num-h');
        const numS = document.getElementById('num-s');
        const numL = document.getElementById('num-l');

        const hexInput = document.getElementById('hex-input');
        const swatchBox = document.getElementById('color-swatch');
        const outRGB = document.getElementById('out-rgb');
        const outHSL = document.getElementById('out-hsl');
        const outHEX = document.getElementById('out-hex');
        const outCMYK = document.getElementById('out-cmyk');
        const resetBtn = document.getElementById('tool-reset');

        // Sync range <-> number inputs
        function syncRange(range, num) {
            range.addEventListener('input', () => { num.value = range.value; updateFromHSL(); });
            num.addEventListener('input', () => {
                let v = parseInt(num.value);
                if (isNaN(v)) return;
                v = Math.max(parseInt(range.min), Math.min(parseInt(range.max), v));
                range.value = v; num.value = v;
                updateFromHSL();
            });
        }

        syncRange(rangeH, numH);
        syncRange(rangeS, numS);
        syncRange(rangeL, numL);

        hexInput.addEventListener('input', () => {
            const hex = hexInput.value.trim();
            if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                const { h, s, l } = hexToHSL(hex);
                rangeH.value = numH.value = Math.round(h);
                rangeS.value = numS.value = Math.round(s);
                rangeL.value = numL.value = Math.round(l);
                updateOutputs(parseInt(h), parseInt(s), parseInt(l), hex);
            }
        });

        document.querySelectorAll('.copy-out-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-copy');
                const el = document.getElementById(targetId);
                if (el) {
                    navigator.clipboard.writeText(el.textContent.trim()).then(() => {
                        showToast('Copied!');
                    }).catch(() => showToast('Copy failed', 'error'));
                }
            });
        });

        resetBtn.addEventListener('click', () => {
            rangeH.value = numH.value = 220;
            rangeS.value = numS.value = 80;
            rangeL.value = numL.value = 60;
            updateFromHSL();
            showToast('Reset completed.');
        });

        function updateFromHSL() {
            const h = parseInt(rangeH.value);
            const s = parseInt(rangeS.value);
            const l = parseInt(rangeL.value);
            const hex = hslToHex(h, s, l);
            hexInput.value = hex.toUpperCase();
            updateOutputs(h, s, l, hex);
        }

        function updateOutputs(h, s, l, hex) {
            const rgb = hexToRgb(hex);
            swatchBox.style.backgroundColor = hex;
            outHEX.textContent = hex.toUpperCase();
            outHSL.textContent = `hsl(${h}, ${s}%, ${l}%)`;
            outRGB.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

            // CMYK conversion
            const r1 = rgb.r / 255, g1 = rgb.g / 255, b1 = rgb.b / 255;
            const k = 1 - Math.max(r1, g1, b1);
            if (k === 1) {
                outCMYK.textContent = `cmyk(0%, 0%, 0%, 100%)`;
            } else {
                const c = Math.round(((1 - r1 - k) / (1 - k)) * 100);
                const m = Math.round(((1 - g1 - k) / (1 - k)) * 100);
                const y = Math.round(((1 - b1 - k) / (1 - k)) * 100);
                outCMYK.textContent = `cmyk(${c}%, ${m}%, ${y}%, ${Math.round(k * 100)}%)`;
            }

            // Update gradient on hue range
            rangeH.style.background = `linear-gradient(to right, hsl(0,${s}%,${l}%), hsl(60,${s}%,${l}%), hsl(120,${s}%,${l}%), hsl(180,${s}%,${l}%), hsl(240,${s}%,${l}%), hsl(300,${s}%,${l}%), hsl(360,${s}%,${l}%))`;
        }

        function hslToHex(h, s, l) {
            s /= 100; l /= 100;
            const a = s * Math.min(l, 1 - l);
            const f = n => {
                const k = (n + h / 30) % 12;
                const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                return Math.round(255 * color).toString(16).padStart(2, '0');
            };
            return `#${f(0)}${f(8)}${f(4)}`;
        }

        function hexToHSL(hex) {
            const { r, g, b } = hexToRgb(hex);
            const r1 = r / 255, g1 = g / 255, b1 = b / 255;
            const max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1);
            let h, s, l = (max + min) / 2;
            if (max === min) { h = s = 0; }
            else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r1: h = ((g1 - b1) / d + (g1 < b1 ? 6 : 0)) / 6; break;
                    case g1: h = ((b1 - r1) / d + 2) / 6; break;
                    case b1: h = ((r1 - g1) / d + 4) / 6; break;
                }
            }
            return { h: h * 360, s: s * 100, l: l * 100 };
        }

        function hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
        }

        function showToast(message, type = 'success') {
            if (window.TN && window.TN.toast) window.TN.toast.show(message, type);
        }

        updateFromHSL();
    });
})();

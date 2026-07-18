(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const textColorInput = document.getElementById('text-color-input');
        const textColorPicker = document.getElementById('text-color-picker');
        const bgColorInput = document.getElementById('bg-color-input');
        const bgColorPicker = document.getElementById('bg-color-picker');
        const previewCard = document.getElementById('contrast-preview');
        const previewHeading = document.getElementById('preview-heading');
        const previewBody = document.getElementById('preview-body');
        const ratioDisplay = document.getElementById('contrast-ratio');
        const aaLargeEl = document.getElementById('aa-large');
        const aaSmallEl = document.getElementById('aa-small');
        const aaaLargeEl = document.getElementById('aaa-large');
        const aaaSmallEl = document.getElementById('aaa-small');
        const resetBtn = document.getElementById('tool-reset');
        const btnSwap = document.getElementById('btn-swap-colors');
        const btnCopy = document.getElementById('btn-copy-result');

        // Sync inputs and pickers
        function syncInputFromPicker(picker, input) {
            picker.addEventListener('input', () => {
                input.value = picker.value.toUpperCase();
                recalculate();
            });
        }

        function syncPickerFromInput(input, picker) {
            input.addEventListener('input', () => {
                const val = input.value.trim();
                if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                    picker.value = val;
                    recalculate();
                }
            });
        }

        syncInputFromPicker(textColorPicker, textColorInput);
        syncInputFromPicker(bgColorPicker, bgColorInput);
        syncPickerFromInput(textColorInput, textColorPicker);
        syncPickerFromInput(bgColorInput, bgColorPicker);

        btnSwap.addEventListener('click', () => {
            const tempVal = textColorInput.value;
            textColorInput.value = bgColorInput.value;
            bgColorInput.value = tempVal;
            textColorPicker.value = textColorInput.value;
            bgColorPicker.value = bgColorInput.value;
            recalculate();
        });

        btnCopy.addEventListener('click', () => {
            const ratio = ratioDisplay.textContent;
            const text = `Text: ${textColorInput.value} | BG: ${bgColorInput.value} | Ratio: ${ratio}`;
            navigator.clipboard.writeText(text).then(() => {
                showToast('Result copied!');
            }).catch(() => showToast('Copy failed', 'error'));
        });

        resetBtn.addEventListener('click', () => {
            textColorInput.value = '#FFFFFF';
            bgColorInput.value = '#1F2937';
            textColorPicker.value = '#ffffff';
            bgColorPicker.value = '#1f2937';
            recalculate();
            showToast('Reset completed.');
        });

        function hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        function sRGB(c) {
            c = c / 255;
            return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        }

        function luminance(r, g, b) {
            return 0.2126 * sRGB(r) + 0.7152 * sRGB(g) + 0.0722 * sRGB(b);
        }

        function contrastRatio(l1, l2) {
            const lighter = Math.max(l1, l2);
            const darker = Math.min(l1, l2);
            return (lighter + 0.05) / (darker + 0.05);
        }

        function badge(passes, label) {
            const color = passes ? 'var(--success)' : 'var(--danger)';
            const icon = passes ? '✓ Pass' : '✗ Fail';
            return `<span style="font-size:var(--text-xs); font-weight:bold; color:${color};">${icon}</span>`;
        }

        function recalculate() {
            const textHex = textColorInput.value.trim();
            const bgHex = bgColorInput.value.trim();
            const textRgb = hexToRgb(textHex);
            const bgRgb = hexToRgb(bgHex);
            if (!textRgb || !bgRgb) return;

            const lText = luminance(textRgb.r, textRgb.g, textRgb.b);
            const lBg = luminance(bgRgb.r, bgRgb.g, bgRgb.b);
            const ratio = contrastRatio(lText, lBg);
            const ratioRounded = ratio.toFixed(2);

            ratioDisplay.textContent = ratioRounded + ':1';

            // WCAG thresholds
            const aaLarge = ratio >= 3;    // AA Large Text (18pt bold / 24pt)
            const aaSmall = ratio >= 4.5;  // AA Normal Text
            const aaaLarge = ratio >= 4.5; // AAA Large Text
            const aaaSmall = ratio >= 7;   // AAA Normal Text

            aaLargeEl.innerHTML = badge(aaLarge);
            aaSmallEl.innerHTML = badge(aaSmall);
            aaaLargeEl.innerHTML = badge(aaaLarge);
            aaaSmallEl.innerHTML = badge(aaaSmall);

            // Color the ratio badge
            let ratioColor = 'var(--danger)';
            if (ratio >= 7) ratioColor = 'var(--success)';
            else if (ratio >= 4.5) ratioColor = 'var(--primary)';
            else if (ratio >= 3) ratioColor = 'var(--warning)';
            ratioDisplay.style.color = ratioColor;

            // Live preview
            previewCard.style.backgroundColor = bgHex;
            previewCard.style.color = textHex;
            previewHeading.style.color = textHex;
            previewBody.style.color = textHex;
        }

        function showToast(message, type = 'success') {
            if (window.TN && window.TN.toast) window.TN.toast.show(message, type);
        }

        // Initial run
        recalculate();
    });
})();

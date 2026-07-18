(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const inputArea = document.getElementById('codec-input');
        const outputArea = document.getElementById('codec-output');
        const inputLabel = document.getElementById('input-label');
        const outputLabel = document.getElementById('output-label');
        const btnCopy = document.getElementById('btn-copy-output');
        const btnDownload = document.getElementById('btn-download-output');
        const resetBtn = document.getElementById('tool-reset');

        let currentMode = 'encode';

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => { b.classList.remove('btn-primary', 'active'); b.classList.add('btn-ghost'); });
                btn.classList.add('btn-primary', 'active'); btn.classList.remove('btn-ghost');
                currentMode = btn.getAttribute('data-tab');
                if (currentMode === 'encode') {
                    inputLabel.textContent = 'Plain Text / HTML Input';
                    outputLabel.textContent = 'Encoded HTML Entities';
                } else {
                    inputLabel.textContent = 'HTML Entities Input';
                    outputLabel.textContent = 'Decoded Plain Text';
                }
                process();
            });
        });

        inputArea.addEventListener('input', process);

        function process() {
            const input = inputArea.value;
            if (!input.trim()) { outputArea.value = ''; return; }
            outputArea.value = currentMode === 'encode' ? encodeHTML(input) : decodeHTML(input);
        }

        function encodeHTML(str) {
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/\//g, '&#x2F;')
                .replace(/`/g, '&#x60;')
                .replace(/=/g, '&#x3D;');
        }

        function decodeHTML(str) {
            const txt = document.createElement('textarea');
            txt.innerHTML = str;
            return txt.value;
        }

        btnCopy.addEventListener('click', () => {
            const text = outputArea.value;
            if (!text) { showToast('Nothing to copy', 'error'); return; }
            navigator.clipboard.writeText(text).then(() => showToast('Output copied!')).catch(() => showToast('Copy failed', 'error'));
        });

        btnDownload.addEventListener('click', () => {
            const text = outputArea.value;
            if (!text) { showToast('Nothing to download', 'error'); return; }
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${currentMode}d-html.txt`; a.click();
            URL.revokeObjectURL(url);
            showToast('File downloaded!');
        });

        resetBtn.addEventListener('click', () => {
            inputArea.value = ''; outputArea.value = '';
            showToast('Reset completed.');
        });

        function showToast(msg, type = 'success') {
            if (window.TN && window.TN.toast) window.TN.toast.show(msg, type);
        }
    });
})();

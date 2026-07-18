(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const qtyInput = document.getElementById('qty-input');
        const qtyMinus = document.getElementById('qty-minus');
        const qtyPlus = document.getElementById('qty-plus');

        const optCase = document.getElementById('opt-case');
        const optHyphens = document.getElementById('opt-hyphens');
        const optBraces = document.getElementById('opt-braces');

        const outputText = document.getElementById('output-text');
        const btnGenerate = document.getElementById('btn-generate');

        const clearBtn = document.getElementById('clear-btn');
        const resetBtn = document.getElementById('reset-btn');
        const copyBtn = document.getElementById('copy-btn');
        const downloadBtn = document.getElementById('download-btn');

        function generateUUIDv4() {
            const bytes = new Uint8Array(16);
            if (window.crypto && window.crypto.getRandomValues) {
                window.crypto.getRandomValues(bytes);
            } else {
                // Fallback if crypto is not supported
                for (let i = 0; i < 16; i++) {
                    bytes[i] = Math.floor(Math.random() * 256);
                }
            }

            // Set version 4
            bytes[6] = (bytes[6] & 0x0f) | 0x40;
            // Set variant
            bytes[8] = (bytes[8] & 0x3f) | 0x80;

            const hex = [];
            for (let i = 0; i < 16; i++) {
                hex.push(bytes[i].toString(16).padStart(2, '0'));
            }

            const useHyphens = optHyphens.checked;
            const useBraces = optBraces.checked;
            const useUpper = optCase.value === 'upper';

            let uuid = '';
            if (useHyphens) {
                uuid = [
                    hex.slice(0, 4).join(''),
                    hex.slice(4, 6).join(''),
                    hex.slice(6, 8).join(''),
                    hex.slice(8, 10).join(''),
                    hex.slice(10, 16).join('')
                ].join('-');
            } else {
                uuid = hex.join('');
            }

            if (useUpper) {
                uuid = uuid.toUpperCase();
            } else {
                uuid = uuid.toLowerCase();
            }

            if (useBraces) {
                uuid = `{${uuid}}`;
            }

            return uuid;
        }

        function runGeneration() {
            let qty = parseInt(qtyInput.value, 10);
            if (isNaN(qty) || qty < 1) qty = 1;
            if (qty > 500) qty = 500;
            qtyInput.value = qty;

            const uuids = [];
            for (let i = 0; i < qty; i++) {
                uuids.push(generateUUIDv4());
            }

            outputText.value = uuids.join('\n');
        }

        // Quantity handlers
        qtyMinus.addEventListener('click', function () {
            const val = parseInt(qtyInput.value, 10) || 1;
            qtyInput.value = Math.max(1, val - 1);
            runGeneration();
        });

        qtyPlus.addEventListener('click', function () {
            const val = parseInt(qtyInput.value, 10) || 1;
            qtyInput.value = Math.min(500, val + 1);
            runGeneration();
        });

        qtyInput.addEventListener('input', function () {
            let val = parseInt(qtyInput.value, 10);
            if (isNaN(val) || val < 1) val = 1;
            if (val > 500) val = 500;
            qtyInput.value = val;
            runGeneration();
        });

        // Config change listeners to live-regenerate or update format
        optCase.addEventListener('change', runGeneration);
        optHyphens.addEventListener('change', runGeneration);
        optBraces.addEventListener('change', runGeneration);

        btnGenerate.addEventListener('click', function () {
            runGeneration();
            if (window.TN && window.TN.toast) {
                window.TN.toast.success('Generated new batch of UUIDs.');
            }
        });

        clearBtn.addEventListener('click', function () {
            outputText.value = '';
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Cleared.');
            }
        });

        resetBtn.addEventListener('click', function () {
            qtyInput.value = '5';
            optCase.value = 'lower';
            optHyphens.checked = true;
            optBraces.checked = false;
            runGeneration();
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Settings reset.');
            }
        });

        copyBtn.addEventListener('click', function () {
            if (!outputText.value) {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Nothing to copy. Generate UUIDs first.');
                }
                return;
            }
            navigator.clipboard.writeText(outputText.value).then(function () {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.success('Copied all UUIDs to clipboard!');
                }
            }).catch(function () {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Copy failed.');
                }
            });
        });

        downloadBtn.addEventListener('click', function () {
            if (!outputText.value) {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Nothing to download. Generate UUIDs first.');
                }
                return;
            }
            const blob = new Blob([outputText.value], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'uuids.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            if (window.TN && window.TN.toast) {
                window.TN.toast.success('Downloaded uuids.txt');
            }
        });

        // Generate on load
        runGeneration();
    });
})();

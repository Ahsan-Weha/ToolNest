(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const pwdOutput = document.getElementById('pwd-output');
        const btnRegenerate = document.getElementById('btn-regenerate');
        const btnCopy = document.getElementById('btn-copy');
        const strengthLabel = document.getElementById('strength-label');
        const entropyLabel = document.getElementById('entropy-label');
        const strengthFill = document.getElementById('strength-fill');
        const pwdLength = document.getElementById('pwd-length');
        const lengthVal = document.getElementById('length-val');
        const bulkCount = document.getElementById('bulk-count');
        const bulkDisplaySection = document.getElementById('bulk-display-section');
        const bulkOutput = document.getElementById('bulk-output');
        const btnCopyBulk = document.getElementById('btn-copy-bulk');

        // Checkboxes
        const optUpper = document.getElementById('opt-upper');
        const optLower = document.getElementById('opt-lower');
        const optNumber = document.getElementById('opt-number');
        const optSymbol = document.getElementById('opt-symbol');
        const optExcludeSimilar = document.getElementById('opt-exclude-similar');

        // Pools
        const CHAR_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const CHAR_LOWER = 'abcdefghijklmnopqrstuvwxyz';
        const CHAR_NUMBER = '0123456789';
        const CHAR_SYMBOL = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const SIMILAR_CHARS = /[il1Io0O]/g;

        function getSecureRandomInt(max) {
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            return array[0] % max;
        }

        function generatePasswordString(length, pool) {
            let pwd = '';
            for (let i = 0; i < length; i++) {
                pwd += pool[getSecureRandomInt(pool.length)];
            }
            return pwd;
        }

        function calculateEntropy(length, poolSize) {
            if (poolSize <= 0) return 0;
            return length * Math.log2(poolSize);
        }

        function updateStrengthBar(entropy) {
            let width = '0%';
            let color = '';
            let label = '';

            if (entropy === 0) {
                label = 'None';
            } else if (entropy < 40) {
                width = '25%';
                color = 'var(--error)';
                label = 'Very Weak ⚠️';
            } else if (entropy < 60) {
                width = '50%';
                color = '#f97316'; // orange
                label = 'Weak';
            } else if (entropy < 80) {
                width = '75%';
                color = '#eab308'; // yellow
                label = 'Medium';
            } else {
                width = '100%';
                color = '#22c55e'; // green
                label = 'Strong';
            }

            strengthFill.style.width = width;
            strengthFill.style.backgroundColor = color;
            strengthLabel.textContent = label;
            strengthLabel.style.color = color;
            entropyLabel.textContent = `${Math.round(entropy)} bits of entropy`;
        }

        function generate() {
            let pool = '';
            if (optUpper.checked) pool += CHAR_UPPER;
            if (optLower.checked) pool += CHAR_LOWER;
            if (optNumber.checked) pool += CHAR_NUMBER;
            if (optSymbol.checked) pool += CHAR_SYMBOL;

            if (optExcludeSimilar.checked) {
                pool = pool.replace(SIMILAR_CHARS, '');
            }

            if (pool.length === 0) {
                pwdOutput.textContent = 'Select at least one set';
                pwdOutput.style.color = 'var(--error)';
                updateStrengthBar(0);
                bulkDisplaySection.style.display = 'none';
                return;
            }
            pwdOutput.style.color = '';

            const length = parseInt(pwdLength.value);
            const count = parseInt(bulkCount.value);

            if (count === 1) {
                bulkDisplaySection.style.display = 'none';
                const password = generatePasswordString(length, pool);
                pwdOutput.textContent = password;

                const entropy = calculateEntropy(length, pool.length);
                updateStrengthBar(entropy);
            } else {
                bulkDisplaySection.style.display = 'block';
                const passwords = [];
                for (let i = 0; i < count; i++) {
                    passwords.push(generatePasswordString(length, pool));
                }
                pwdOutput.textContent = passwords[0];
                bulkOutput.value = passwords.join('\n');

                const entropy = calculateEntropy(length, pool.length);
                updateStrengthBar(entropy);
            }
        }

        // Event listeners for parameters
        pwdLength.addEventListener('input', () => {
            lengthVal.textContent = pwdLength.value;
            generate();
        });
        [optUpper, optLower, optNumber, optSymbol, optExcludeSimilar, bulkCount].forEach(el => {
            el.addEventListener('change', generate);
        });

        btnRegenerate.addEventListener('click', generate);

        // Copy functionality
        btnCopy.addEventListener('click', function () {
            const pwd = pwdOutput.textContent;
            if (pwd && pwd !== '—' && pwd !== 'Select at least one set') {
                navigator.clipboard.writeText(pwd).then(() => {
                    if (typeof TN !== 'undefined' && TN.toast) {
                        TN.toast.success('Password copied to clipboard!');
                    }
                });
            }
        });

        btnCopyBulk.addEventListener('click', function () {
            const batch = bulkOutput.value;
            if (batch) {
                navigator.clipboard.writeText(batch).then(() => {
                    if (typeof TN !== 'undefined' && TN.toast) {
                        TN.toast.success('Batch copied to clipboard!');
                    }
                });
            }
        });

        // Initial generation
        generate();
    });
})();

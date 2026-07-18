(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const inputText = document.getElementById('input-text');
        const outputText = document.getElementById('output-text');
        const optIndent = document.getElementById('opt-indent');

        const alertValid = document.getElementById('alert-valid');
        const alertInvalid = document.getElementById('alert-invalid');
        const errorMessage = document.getElementById('error-message');

        const btnFormat = document.getElementById('btn-format');
        const btnMinify = document.getElementById('btn-minify');
        const btnValidate = document.getElementById('btn-validate');

        const loadSampleBtn = document.getElementById('load-sample-btn');
        const clearBtn = document.getElementById('clear-btn');
        const resetBtn = document.getElementById('reset-btn');
        const copyBtn = document.getElementById('copy-btn');
        const downloadBtn = document.getElementById('download-btn');

        const SAMPLE_JSON = `{
  "name": "ToolNest",
  "version": "1.0.0",
  "description": "Premium client-side developer utility suites.",
  "features": [
    "Offline compatibility",
    "Zero data logging",
    "High performance algorithms"
  ],
  "author": {
    "name": "Antigravity",
    "role": "Lead Architect"
  },
  "active": true,
  "theme": "dark",
  "rating": 5
}`;

        // Clear alert states
        function clearAlerts() {
            alertValid.style.display = 'none';
            alertInvalid.style.display = 'none';
        }

        // Parse index position from standard JSON parse errors
        function getErrorLocation(rawText, errorMsg) {
            // Examples: "Unexpected token } in JSON at position 134", "Expected ',' or '}' after property value in JSON at position 52"
            const posMatch = errorMsg.match(/position\s+(\d+)/i);
            if (posMatch && posMatch[1]) {
                const pos = parseInt(posMatch[1], 10);
                const lines = rawText.substring(0, pos).split('\n');
                const line = lines.length;
                const col = lines[lines.length - 1].length + 1;
                return `Line ${line}, Column ${col}`;
            }
            return null;
        }

        function validateJSON(silent = false) {
            const rawVal = inputText.value.trim();
            if (!rawVal) {
                clearAlerts();
                if (!silent && window.TN && window.TN.toast) {
                    window.TN.toast.warning('Please enter JSON content first.');
                }
                return null;
            }

            try {
                const parsed = JSON.parse(rawVal);
                if (!silent) {
                    alertValid.style.display = 'flex';
                    alertInvalid.style.display = 'none';
                }
                return parsed;
            } catch (e) {
                if (!silent) {
                    alertValid.style.display = 'none';
                    alertInvalid.style.display = 'block';
                    const loc = getErrorLocation(rawVal, e.message);
                    errorMessage.textContent = loc ? `${e.message} (at ${loc})` : e.message;
                }
                return false;
            }
        }

        function formatJSON() {
            const parsed = validateJSON(false);
            if (parsed === null || parsed === false) return;

            const indentVal = optIndent.value;
            let formatted = '';
            if (indentVal === 'tabs') {
                formatted = JSON.stringify(parsed, null, '\t');
            } else {
                formatted = JSON.stringify(parsed, null, parseInt(indentVal, 10));
            }
            outputText.value = formatted;
            if (window.TN && window.TN.toast) {
                window.TN.toast.success('JSON formatted successfully.');
            }
        }

        function minifyJSON() {
            const parsed = validateJSON(false);
            if (parsed === null || parsed === false) return;

            const minified = JSON.stringify(parsed);
            outputText.value = minified;
            if (window.TN && window.TN.toast) {
                window.TN.toast.success('JSON minified successfully.');
            }
        }

        // Live format as user types/interacts (Debounced slightly for performance)
        let timer;
        inputText.addEventListener('input', function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                validateJSON(true);
            }, 300);
        });

        // Controls click events
        btnFormat.addEventListener('click', formatJSON);
        btnMinify.addEventListener('click', minifyJSON);
        btnValidate.addEventListener('click', function () {
            const result = validateJSON(false);
            if (result !== null && result !== false) {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.success('JSON is valid!');
                }
            } else if (result === false) {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Invalid JSON structure. See error details.');
                }
            }
        });

        loadSampleBtn.addEventListener('click', function () {
            inputText.value = SAMPLE_JSON;
            validateJSON(true);
            formatJSON();
        });

        clearBtn.addEventListener('click', function () {
            inputText.value = '';
            outputText.value = '';
            clearAlerts();
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Cleared.');
            }
        });

        resetBtn.addEventListener('click', function () {
            inputText.value = '';
            outputText.value = '';
            optIndent.value = '4';
            clearAlerts();
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Settings reset.');
            }
        });

        copyBtn.addEventListener('click', function () {
            if (!outputText.value) {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Nothing to copy. Format JSON first.');
                }
                return;
            }
            navigator.clipboard.writeText(outputText.value).then(function () {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.success('Copied output to clipboard!');
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
                    window.TN.toast.error('Nothing to download. Format JSON first.');
                }
                return;
            }
            const blob = new Blob([outputText.value], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'formatted.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            if (window.TN && window.TN.toast) {
                window.TN.toast.success('Downloaded formatted.json');
            }
        });
    });
})();

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const inputText = document.getElementById('input-text');
        const outputText = document.getElementById('output-text');
        const titleInput = document.getElementById('title-input');
        const titleOutput = document.getElementById('title-output');

        const radiosMode = document.getElementsByName('codec-mode');
        const optUrlSafe = document.getElementById('opt-url-safe');

        const btnProcess = document.getElementById('btn-process');

        const loadSampleBtn = document.getElementById('load-sample-btn');
        const clearBtn = document.getElementById('clear-btn');
        const resetBtn = document.getElementById('reset-btn');
        const copyBtn = document.getElementById('copy-btn');
        const downloadBtn = document.getElementById('download-btn');

        const SAMPLE_TEXT = `Welcome to ToolNest! 🚀
This is a secure, private client-side utility suite.
Supported symbols: UTF-8 characters (日本語, Español, Français, Deutsch, 🐍).`;

        const SAMPLE_BASE64 = `V2VsY29tZSB0byBUb29sTmVzdCEg🚀ClRoaXMgaXMgYSBzZWN1cmUsIHByaXZhdGUgY2xpZW50LXNpZGUgdXRpbGl0eSBzdWl0ZS4KU3VwcG9ydGVkIHN5bWJvbHM6IFVURi04IGNoYXJhY3RlcnMgKOaXpeacrOiqnuC4lCwgRXNwYcOxb2wsIEZyYW7Dp2FpcywgRGV1dHNjaCwg🐍KS4=`;

        function getSelectedMode() {
            for (let i = 0; i < radiosMode.length; i++) {
                if (radiosMode[i].checked) {
                    return radiosMode[i].value;
                }
            }
            return 'encode';
        }

        function updateLabels() {
            const mode = getSelectedMode();
            if (mode === 'encode') {
                titleInput.textContent = 'Plain Text Input';
                titleOutput.textContent = 'Base64 Output';
            } else {
                titleInput.textContent = 'Base64 Input';
                titleOutput.textContent = 'Decoded Plain Text Output';
            }
        }

        function encodeUnicode(str) {
            return btoa(unescape(encodeURIComponent(str)));
        }

        function decodeUnicode(str) {
            return decodeURIComponent(escape(atob(str)));
        }

        function toUrlSafe(str) {
            return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }

        function fromUrlSafe(str) {
            let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) {
                base64 += '=';
            }
            return base64;
        }

        function processCodec() {
            const rawVal = inputText.value;
            if (!rawVal) {
                outputText.value = '';
                return;
            }

            const mode = getSelectedMode();
            const urlSafe = optUrlSafe.checked;

            try {
                if (mode === 'encode') {
                    let encoded = encodeUnicode(rawVal);
                    if (urlSafe) {
                        encoded = toUrlSafe(encoded);
                    }
                    outputText.value = encoded;
                } else {
                    let cleanedInput = rawVal.trim();
                    if (urlSafe) {
                        cleanedInput = fromUrlSafe(cleanedInput);
                    }
                    // Validate base64 structure
                    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
                    if (!base64Regex.test(cleanedInput)) {
                        throw new Error('Input contains characters that are not valid Base64.');
                    }
                    const decoded = decodeUnicode(cleanedInput);
                    outputText.value = decoded;
                }
            } catch (e) {
                outputText.value = '';
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error(`Processing error: ${e.message}`);
                }
            }
        }

        // Change mode listeners
        radiosMode.forEach(radio => {
            radio.addEventListener('change', function () {
                updateLabels();
                processCodec();
            });
        });

        optUrlSafe.addEventListener('change', processCodec);
        inputText.addEventListener('input', processCodec);

        btnProcess.addEventListener('click', function () {
            processCodec();
            if (inputText.value && window.TN && window.TN.toast) {
                window.TN.toast.success('Successfully processed.');
            }
        });

        loadSampleBtn.addEventListener('click', function () {
            const mode = getSelectedMode();
            if (mode === 'encode') {
                inputText.value = SAMPLE_TEXT;
            } else {
                inputText.value = SAMPLE_BASE64;
            }
            processCodec();
            if (window.TN && window.TN.toast) {
                window.TN.toast.success('Sample loaded.');
            }
        });

        clearBtn.addEventListener('click', function () {
            inputText.value = '';
            outputText.value = '';
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Cleared.');
            }
        });

        resetBtn.addEventListener('click', function () {
            inputText.value = '';
            outputText.value = '';
            radiosMode[0].checked = true;
            optUrlSafe.checked = false;
            updateLabels();
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Settings reset.');
            }
        });

        copyBtn.addEventListener('click', function () {
            if (!outputText.value) {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Nothing to copy. Process input first.');
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
                    window.TN.toast.error('Nothing to download. Process input first.');
                }
                return;
            }
            const mode = getSelectedMode();
            const blob = new Blob([outputText.value], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = mode === 'encode' ? 'base64.txt' : 'decoded.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            if (window.TN && window.TN.toast) {
                window.TN.toast.success(`Downloaded output file.`);
            }
        });

        // Initialize label states
        updateLabels();
    });
})();

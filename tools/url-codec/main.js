(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const inputText = document.getElementById('input-text');
        const outputText = document.getElementById('output-text');
        const titleInput = document.getElementById('title-input');
        const titleOutput = document.getElementById('title-output');

        const radiosMode = document.getElementsByName('codec-mode');
        const optEncodeLevel = document.getElementById('opt-encode-level');
        const encodeOptionsContainer = document.getElementById('encode-options-container');

        const btnProcess = document.getElementById('btn-process');

        const loadSampleBtn = document.getElementById('load-sample-btn');
        const clearBtn = document.getElementById('clear-btn');
        const resetBtn = document.getElementById('reset-btn');
        const copyBtn = document.getElementById('copy-btn');
        const downloadBtn = document.getElementById('download-btn');

        const SAMPLE_TEXT = `https://toolnest.com/search?query=private offline tools & categories=developer & symbols=🚀`;
        const SAMPLE_ENCODED = `https%3A%2F%2Ftoolnest.com%2Fsearch%3Fquery%3Dprivate%20offline%20tools%20%26%20categories%3Ddeveloper%20%26%20symbols%3D%F0%9F%9A%80`;

        function getSelectedMode() {
            for (let i = 0; i < radiosMode.length; i++) {
                if (radiosMode[i].checked) {
                    return radiosMode[i].value;
                }
            }
            return 'encode';
        }

        function updateUIStates() {
            const mode = getSelectedMode();
            if (mode === 'encode') {
                titleInput.textContent = 'Raw Text / URL Input';
                titleOutput.textContent = 'URL Encoded Output';
                encodeOptionsContainer.style.display = 'flex';
            } else {
                titleInput.textContent = 'URL Encoded Input';
                titleOutput.textContent = 'Decoded URL Output';
                encodeOptionsContainer.style.display = 'none';
            }
        }

        function processURL() {
            const rawVal = inputText.value;
            if (!rawVal) {
                outputText.value = '';
                return;
            }

            const mode = getSelectedMode();
            try {
                if (mode === 'encode') {
                    const level = optEncodeLevel.value;
                    if (level === 'all') {
                        outputText.value = encodeURIComponent(rawVal);
                    } else {
                        outputText.value = encodeURI(rawVal);
                    }
                } else {
                    // Try decoding using decodeURIComponent, fallback to decodeURI if needed
                    outputText.value = decodeURIComponent(rawVal.replace(/\+/g, '%20'));
                }
            } catch (e) {
                outputText.value = '';
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error(`Malformed URI: ${e.message}`);
                }
            }
        }

        radiosMode.forEach(radio => {
            radio.addEventListener('change', function () {
                updateUIStates();
                processURL();
            });
        });

        optEncodeLevel.addEventListener('change', processURL);
        inputText.addEventListener('input', processURL);

        btnProcess.addEventListener('click', function () {
            processURL();
            if (inputText.value && window.TN && window.TN.toast) {
                window.TN.toast.success('Processed URL successfully.');
            }
        });

        loadSampleBtn.addEventListener('click', function () {
            const mode = getSelectedMode();
            if (mode === 'encode') {
                inputText.value = SAMPLE_TEXT;
            } else {
                inputText.value = SAMPLE_ENCODED;
            }
            processURL();
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
            optEncodeLevel.value = 'all';
            updateUIStates();
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
                    window.TN.toast.success('Copied URL output to clipboard!');
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
            const blob = new Blob([outputText.value], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'url_output.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            if (window.TN && window.TN.toast) {
                window.TN.toast.success('Downloaded URL output.');
            }
        });

        // Initialize UI states
        updateUIStates();
    });
})();

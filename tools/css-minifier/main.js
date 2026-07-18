(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const inputText = document.getElementById('input-text');
        const outputText = document.getElementById('output-text');

        const statOrigSize = document.getElementById('stat-orig-size');
        const statMinSize = document.getElementById('stat-min-size');
        const statSavings = document.getElementById('stat-savings');

        const btnMinify = document.getElementById('btn-minify');

        const loadSampleBtn = document.getElementById('load-sample-btn');
        const clearBtn = document.getElementById('clear-btn');
        const resetBtn = document.getElementById('reset-btn');
        const copyBtn = document.getElementById('copy-btn');
        const downloadBtn = document.getElementById('download-btn');

        const SAMPLE_CSS = `/* ToolNest Main Theme stylesheet rules */
body {
    background-color: #0f172a;
    color: #f8fafc;
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
}

.card-glass {
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    border-radius: 12px;
    padding: 24px;
    transition: all 0.3s ease;
}

.card-glass:hover {
    border-color: rgba(6, 182, 212, 0.4);
    box-shadow: 0 10px 25px -5px rgba(6, 182, 212, 0.15);
}
`;

        function formatBytes(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function performMinification() {
            const rawVal = inputText.value.trim();
            if (!rawVal) {
                outputText.value = '';
                statOrigSize.textContent = '0 B';
                statMinSize.textContent = '0 B';
                statSavings.textContent = '0%';
                return;
            }

            const origLen = rawVal.length;

            // CSS Minifier logic
            let minified = rawVal;
            // Remove comments
            minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
            // Replace multiple spaces/tabs/newlines around selectors and punctuations
            minified = minified.replace(/\s*([\{\};:,])\s*/g, '$1');
            // Remove trailing semicolon in CSS block
            minified = minified.replace(/;}/g, '}');
            // Remove remaining consecutive spaces
            minified = minified.replace(/\s+/g, ' ');
            // Trim
            minified = minified.trim();

            const minLen = minified.length;
            const diff = origLen - minLen;
            const pct = origLen > 0 ? Math.max(0, Math.round((diff / origLen) * 100)) : 0;

            outputText.value = minified;
            statOrigSize.textContent = formatBytes(origLen);
            statMinSize.textContent = formatBytes(minLen);
            statSavings.textContent = `${pct}%`;
        }

        // Action listeners
        btnMinify.addEventListener('click', function () {
            performMinification();
            if (inputText.value.trim() && window.TN && window.TN.toast) {
                window.TN.toast.success('CSS minified successfully.');
            }
        });

        // Instant validation on input
        inputText.addEventListener('input', performMinification);

        loadSampleBtn.addEventListener('click', function () {
            inputText.value = SAMPLE_CSS;
            performMinification();
            if (window.TN && window.TN.toast) {
                window.TN.toast.success('Sample loaded.');
            }
        });

        clearBtn.addEventListener('click', function () {
            inputText.value = '';
            outputText.value = '';
            performMinification();
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Cleared.');
            }
        });

        resetBtn.addEventListener('click', function () {
            inputText.value = '';
            outputText.value = '';
            performMinification();
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Settings reset.');
            }
        });

        copyBtn.addEventListener('click', function () {
            if (!outputText.value) {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Nothing to copy. Minify CSS first.');
                }
                return;
            }
            navigator.clipboard.writeText(outputText.value).then(function () {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.success('Copied compressed CSS to clipboard!');
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
                    window.TN.toast.error('Nothing to download. Minify CSS first.');
                }
                return;
            }
            const blob = new Blob([outputText.value], { type: 'text/css' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'style.min.css';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            if (window.TN && window.TN.toast) {
                window.TN.toast.success('Downloaded style.min.css');
            }
        });
    });
})();

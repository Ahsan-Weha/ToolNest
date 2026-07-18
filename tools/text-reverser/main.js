(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const inputText = document.getElementById('input-text');
        const outputText = document.getElementById('output-text');
        const activeModeBadge = document.getElementById('active-mode-badge');
        const modeButtons = document.querySelectorAll('.mode-btn');
        const loadSampleBtn = document.getElementById('load-sample-btn');
        const clearBtn = document.getElementById('clear-btn');
        const resetBtn = document.getElementById('reset-btn');
        const copyBtn = document.getElementById('copy-btn');

        let currentMode = null;

        const MODE_LABELS = {
            'chars': 'Reverse Characters',
            'words': 'Reverse Words',
            'lines': 'Reverse Lines',
            'words-each-line': 'Reverse Words Per Line',
        };

        const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog.\nThis is the second line of text.\nAnd here is the third line.`;

        function reverseChars(str) {
            // Proper Unicode-aware character reversal
            return [...str].reverse().join('');
        }

        function applyMode(text, mode) {
            if (!text) return '';
            switch (mode) {
                case 'chars':
                    return reverseChars(text);
                case 'words':
                    return text.split(/\s+/).reverse().join(' ');
                case 'lines':
                    return text.split('\n').reverse().join('\n');
                case 'words-each-line':
                    return text.split('\n').map(line =>
                        line.split(' ').reverse().join(' ')
                    ).join('\n');
                default:
                    return text;
            }
        }

        function render() {
            const text = inputText.value || '';
            if (!currentMode || !text) {
                outputText.value = text;
                activeModeBadge.textContent = 'No Mode';
                return;
            }
            outputText.value = applyMode(text, currentMode);
            activeModeBadge.textContent = MODE_LABELS[currentMode] || currentMode;
        }

        modeButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                const mode = btn.getAttribute('data-mode');
                if (currentMode === mode) {
                    currentMode = null;
                    btn.classList.remove('active-mode');
                } else {
                    modeButtons.forEach(b => b.classList.remove('active-mode'));
                    currentMode = mode;
                    btn.classList.add('active-mode');
                }
                render();
            });
        });

        inputText.addEventListener('input', render);

        loadSampleBtn.addEventListener('click', function () {
            inputText.value = SAMPLE_TEXT;
            render();
            if (window.TN && window.TN.toast) window.TN.toast.success('Sample loaded.');
        });

        clearBtn.addEventListener('click', function () {
            inputText.value = '';
            render();
            if (window.TN && window.TN.toast) window.TN.toast.info('Cleared.');
        });

        resetBtn.addEventListener('click', function () {
            inputText.value = '';
            currentMode = null;
            modeButtons.forEach(b => b.classList.remove('active-mode'));
            render();
            if (window.TN && window.TN.toast) window.TN.toast.info('Reset.');
        });

        copyBtn.addEventListener('click', function () {
            if (!outputText.value) {
                if (window.TN && window.TN.toast) window.TN.toast.error('Nothing to copy.');
                return;
            }
            navigator.clipboard.writeText(outputText.value).then(function () {
                if (window.TN && window.TN.toast) window.TN.toast.success('Reversed text copied!');
            }).catch(function () {
                if (window.TN && window.TN.toast) window.TN.toast.error('Copy failed.');
            });
        });

        render();
    });
})();

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const inputText = document.getElementById('input-text');
        const outputText = document.getElementById('output-text');
        const activeModeBadge = document.getElementById('active-mode-badge');

        const statOrigLines = document.getElementById('stat-orig-lines');
        const statUniqueLines = document.getElementById('stat-unique-lines');
        const statRemovedLines = document.getElementById('stat-removed-lines');

        const optCaseSensitive = document.getElementById('opt-case-sensitive');
        const optTrimWhitespace = document.getElementById('opt-trim-whitespace');
        const optIgnoreEmpty = document.getElementById('opt-ignore-empty');

        const loadSampleBtn = document.getElementById('load-sample-btn');
        const clearBtn = document.getElementById('clear-btn');
        const resetBtn = document.getElementById('reset-btn');
        const copyBtn = document.getElementById('copy-btn');

        const SAMPLE_TEXT = `apple
Banana
apple
Orange
banana
Orange
Trim test   
Trim test
  Trim test

apple`;

        function processLines() {
            const text = inputText.value || '';
            if (text === '') {
                outputText.value = '';
                statOrigLines.textContent = '0';
                statUniqueLines.textContent = '0';
                statRemovedLines.textContent = '0 (0%)';
                activeModeBadge.textContent = '0 lines';
                return;
            }

            const lines = text.split('\n');
            const caseSensitive = optCaseSensitive.checked;
            const trimWhitespace = optTrimWhitespace.checked;
            const ignoreEmpty = optIgnoreEmpty.checked;

            const seen = new Set();
            const result = [];
            let totalCount = 0;

            for (let i = 0; i < lines.length; i++) {
                let originalLine = lines[i];
                let lineToCompare = originalLine;

                if (trimWhitespace) {
                    lineToCompare = lineToCompare.trim();
                }

                if (ignoreEmpty && lineToCompare === '') {
                    continue;
                }

                totalCount++;

                let matchKey = lineToCompare;
                if (!caseSensitive) {
                    matchKey = lineToCompare.toLowerCase();
                }

                if (!seen.has(matchKey)) {
                    seen.add(matchKey);
                    // Push the line as it was parsed (trimmed if option active, otherwise original)
                    result.push(trimWhitespace ? originalLine.trim() : originalLine);
                }
            }

            const uniqueCount = result.length;
            const removedCount = totalCount - uniqueCount;
            const pct = totalCount > 0 ? Math.round((removedCount / totalCount) * 100) : 0;

            outputText.value = result.join('\n');
            statOrigLines.textContent = totalCount;
            statUniqueLines.textContent = uniqueCount;
            statRemovedLines.textContent = `${removedCount} (${pct}%)`;
            activeModeBadge.textContent = `${uniqueCount} lines`;
        }

        // Event listeners for instant updates
        inputText.addEventListener('input', processLines);
        optCaseSensitive.addEventListener('change', processLines);
        optTrimWhitespace.addEventListener('change', processLines);
        optIgnoreEmpty.addEventListener('change', processLines);

        loadSampleBtn.addEventListener('click', function () {
            inputText.value = SAMPLE_TEXT;
            processLines();
            if (window.TN && window.TN.toast) {
                window.TN.toast.success('Sample list loaded.');
            }
        });

        clearBtn.addEventListener('click', function () {
            inputText.value = '';
            processLines();
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Input cleared.');
            }
        });

        resetBtn.addEventListener('click', function () {
            inputText.value = '';
            optCaseSensitive.checked = true;
            optTrimWhitespace.checked = true;
            optIgnoreEmpty.checked = true;
            processLines();
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Settings reset.');
            }
        });

        copyBtn.addEventListener('click', function () {
            if (!outputText.value) {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Nothing to copy.');
                }
                return;
            }
            navigator.clipboard.writeText(outputText.value).then(function () {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.success('Deduplicated output copied!');
                }
            }).catch(function () {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Copy failed.');
                }
            });
        });

        // Initialize
        processLines();
    });
})();

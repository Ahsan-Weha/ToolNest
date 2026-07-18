(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const inputText = document.getElementById('input-text');
        const outputText = document.getElementById('output-text');

        const statOrigSize = document.getElementById('stat-orig-size');
        const statCleanSize = document.getElementById('stat-clean-size');
        const statSavedSize = document.getElementById('stat-saved-size');

        const optShrinkSpaces = document.getElementById('opt-shrink-spaces');
        const optTrimLines = document.getElementById('opt-trim-lines');
        const optRemoveEmpty = document.getElementById('opt-remove-empty');
        const optTabsToSpaces = document.getElementById('opt-tabs-to-spaces');
        const optStripTabs = document.getElementById('opt-strip-tabs');

        const loadSampleBtn = document.getElementById('load-sample-btn');
        const clearBtn = document.getElementById('clear-btn');
        const resetBtn = document.getElementById('reset-btn');
        const copyBtn = document.getElementById('copy-btn');

        const SAMPLE_TEXT = `This is   a sample    text   containing    too   many   spaces.
\tThis line starts with a tab character.
This is another line with trailing whitespace.   

This is a line after a completely empty line.

\t  \tMixed tabs   and   spaces.`;

        function cleanText() {
            let text = inputText.value || '';
            const origLen = text.length;

            if (text === '') {
                outputText.value = '';
                statOrigSize.textContent = '0 chars';
                statCleanSize.textContent = '0 chars';
                statSavedSize.textContent = '0 (0%)';
                return;
            }

            // Convert Tabs to Spaces or Strip Tabs
            if (optStripTabs.checked) {
                text = text.replace(/\t/g, '');
            } else if (optTabsToSpaces.checked) {
                text = text.replace(/\t/g, '    ');
            }

            let lines = text.split('\n');

            const trimLines = optTrimLines.checked;
            const removeEmpty = optRemoveEmpty.checked;
            const shrinkSpaces = optShrinkSpaces.checked;

            const processedLines = [];

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];

                if (trimLines) {
                    line = line.trim();
                }

                if (shrinkSpaces) {
                    // Shrink multiple spaces into a single space
                    line = line.replace(/ +/g, ' ');
                }

                if (removeEmpty && line.trim() === '') {
                    continue;
                }

                processedLines.push(line);
            }

            const cleanedText = processedLines.join('\n');
            const cleanedLen = cleanedText.length;
            const savedLen = origLen - cleanedLen;
            const pct = origLen > 0 ? Math.max(0, Math.round((savedLen / origLen) * 100)) : 0;

            outputText.value = cleanedText;
            statOrigSize.textContent = `${origLen} chars`;
            statCleanSize.textContent = `${cleanedLen} chars`;
            statSavedSize.textContent = `${savedLen > 0 ? savedLen : 0} (${pct}%)`;
        }

        // Event listeners for instant updates
        inputText.addEventListener('input', cleanText);
        optShrinkSpaces.addEventListener('change', cleanText);
        optTrimLines.addEventListener('change', cleanText);
        optRemoveEmpty.addEventListener('change', cleanText);
        
        optTabsToSpaces.addEventListener('change', function () {
            if (optTabsToSpaces.checked) {
                optStripTabs.checked = false;
            }
            cleanText();
        });

        optStripTabs.addEventListener('change', function () {
            if (optStripTabs.checked) {
                optTabsToSpaces.checked = false;
            }
            cleanText();
        });

        loadSampleBtn.addEventListener('click', function () {
            inputText.value = SAMPLE_TEXT;
            cleanText();
            if (window.TN && window.TN.toast) {
                window.TN.toast.success('Sample text loaded.');
            }
        });

        clearBtn.addEventListener('click', function () {
            inputText.value = '';
            cleanText();
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Input cleared.');
            }
        });

        resetBtn.addEventListener('click', function () {
            inputText.value = '';
            optShrinkSpaces.checked = true;
            optTrimLines.checked = true;
            optRemoveEmpty.checked = true;
            optTabsToSpaces.checked = false;
            optStripTabs.checked = false;
            cleanText();
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
                    window.TN.toast.success('Cleaned text copied to clipboard!');
                }
            }).catch(function () {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Copy failed.');
                }
            });
        });

        // Initialize
        cleanText();
    });
})();

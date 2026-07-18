(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const inputText = document.getElementById('input-text');
        const statWords = document.getElementById('stat-words');
        const statCharsWithSpaces = document.getElementById('stat-chars-with-spaces');
        const statCharsNoSpaces = document.getElementById('stat-chars-no-spaces');
        const statSentences = document.getElementById('stat-sentences');
        const statParagraphs = document.getElementById('stat-paragraphs');
        const statLines = document.getElementById('stat-lines');
        const statReadTime = document.getElementById('stat-read-time');
        const statSpeakTime = document.getElementById('stat-speak-time');

        const loadSampleBtn = document.getElementById('load-sample-btn');
        const clearBtn = document.getElementById('clear-btn');
        const resetBtn = document.getElementById('reset-btn');
        const copyBtn = document.getElementById('copy-btn');

        const SAMPLE_TEXT = `ToolNest is a premium suite of browser-native utilities designed for designers, developers, and content writers. All operations happen in-browser client-side, ensuring complete data privacy and ultra-fast processing speeds.

Whether you are compressing PDFs, optimizing images, checking contrast standards, or generating Lorem Ipsum blocks, ToolNest performs calculations locally inside your browser memory. No data is ever transmitted to any cloud servers!`;

        function updateStats() {
            const text = inputText.value || '';

            // Word count
            const wordsArray = text.trim().split(/\s+/).filter(w => w.length > 0);
            const wordCount = wordsArray.length;
            statWords.textContent = wordCount;

            // Characters count
            statCharsWithSpaces.textContent = text.length;
            statCharsNoSpaces.textContent = text.replace(/\s/g, '').length;

            // Sentence count
            const sentenceCount = text.split(/[.!?]+(\s|$)/).filter(Boolean).filter(s => s.trim().length > 0).length;
            statSentences.textContent = sentenceCount;

            // Paragraph count
            const paragraphCount = text.split(/\n\s*\n+/).filter(p => p.trim().length > 0).length;
            statParagraphs.textContent = paragraphCount;

            // Line count
            const lineCount = text.length > 0 ? text.split('\n').length : 0;
            statLines.textContent = lineCount;

            // Reading time (200 WPM)
            const readMinutes = Math.floor(wordCount / 200);
            const readSeconds = Math.round((wordCount % 200) / 200 * 60);
            statReadTime.textContent = `${readMinutes}m ${readSeconds}s`;

            // Speaking time (130 WPM)
            const speakMinutes = Math.floor(wordCount / 130);
            const speakSeconds = Math.round((wordCount % 130) / 130 * 60);
            statSpeakTime.textContent = `${speakMinutes}m ${speakSeconds}s`;
        }

        function clearInput() {
            inputText.value = '';
            updateStats();
        }

        inputText.addEventListener('input', updateStats);

        loadSampleBtn.addEventListener('click', function () {
            inputText.value = SAMPLE_TEXT;
            updateStats();
            if (window.TN && window.TN.toast) {
                window.TN.toast.success('Sample text loaded successfully.');
            }
        });

        clearBtn.addEventListener('click', function () {
            clearInput();
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Input cleared.');
            }
        });

        resetBtn.addEventListener('click', function () {
            clearInput();
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Calculator reset.');
            }
        });

        copyBtn.addEventListener('click', function () {
            if (!inputText.value) {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Nothing to copy.');
                }
                return;
            }
            navigator.clipboard.writeText(inputText.value).then(function () {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.success('Input text copied to clipboard.');
                }
            }).catch(function () {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Failed to copy text.');
                }
            });
        });

        // Initialize empty stats
        updateStats();
    });
})();

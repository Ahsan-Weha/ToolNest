(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const inputText = document.getElementById('input-text');
        const charLimitInput = document.getElementById('char-limit');
        
        const statCharsTotal = document.getElementById('stat-chars-total');
        const statCharsNoSpaces = document.getElementById('stat-chars-no-spaces');
        const statSpaces = document.getElementById('stat-spaces');
        const statWords = document.getElementById('stat-words');
        const statSentences = document.getElementById('stat-sentences');
        const statLines = document.getElementById('stat-lines');

        const meterBarWrapper = document.getElementById('meter-bar-wrapper');
        const meterBar = document.getElementById('meter-bar');
        const meterLimitLabel = document.getElementById('meter-limit-label');
        const meterPercentageLabel = document.getElementById('meter-percentage-label');

        const loadSampleBtn = document.getElementById('load-sample-btn');
        const clearBtn = document.getElementById('clear-btn');
        const resetBtn = document.getElementById('reset-btn');
        const copyBtn = document.getElementById('copy-btn');
        const presetBtns = document.querySelectorAll('.preset-btn');

        const SAMPLE_TEXT = `This is a sample text inside ToolNest's Character Counter. Use this utility to check character limits for various social media networks and messaging platforms.

Features:
1. Real-time characters and words count
2. Set custom limits with a visual bar
3. Copy, clear, and reset inputs instantly`;

        function updateStats() {
            const text = inputText.value || '';
            const totalChars = text.length;

            // Stats computations
            statCharsTotal.textContent = totalChars;
            statCharsNoSpaces.textContent = text.replace(/\s/g, '').length;
            statSpaces.textContent = (text.match(/\s/g) || []).length;
            statWords.textContent = text.trim().split(/\s+/).filter(w => w.length > 0).length;
            statSentences.textContent = text.split(/[.!?]+(\s|$)/).filter(Boolean).filter(s => s.trim().length > 0).length;
            statLines.textContent = totalChars > 0 ? text.split('\n').length : 0;

            // Character limit bar computations
            const limit = parseInt(charLimitInput.value, 10);
            if (limit && limit > 0) {
                meterBarWrapper.style.display = 'block';
                const percentage = Math.min((totalChars / limit) * 100, 100);
                meterBar.style.width = `${percentage}%`;
                
                // Color adjustments based on limits
                if (totalChars > limit) {
                    meterBar.style.backgroundColor = 'var(--error, #ef4444)';
                } else if (percentage >= 80) {
                    meterBar.style.backgroundColor = 'var(--warning, #f59e0b)';
                } else {
                    meterBar.style.backgroundColor = 'var(--primary, #6366f1)';
                }

                meterLimitLabel.textContent = `Limit: ${limit} characters (${limit - totalChars} remaining)`;
                meterPercentageLabel.textContent = `${Math.round((totalChars / limit) * 100)}% used`;
            } else {
                meterBarWrapper.style.display = 'none';
            }
        }

        function clearInput() {
            inputText.value = '';
            updateStats();
        }

        inputText.addEventListener('input', updateStats);
        charLimitInput.addEventListener('input', function () {
            // Remove active preset buttons if they don't match the new custom input value
            presetBtns.forEach(btn => btn.classList.remove('active'));
            updateStats();
        });

        presetBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                presetBtns.forEach(b => b.classList.remove('active'));
                
                if (btn.id === 'preset-custom') {
                    charLimitInput.value = '';
                    charLimitInput.focus();
                } else {
                    btn.classList.add('active');
                    charLimitInput.value = btn.getAttribute('data-limit');
                }
                updateStats();
            });
        });

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
            charLimitInput.value = '';
            presetBtns.forEach(btn => btn.classList.remove('active'));
            updateStats();
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Tool reset.');
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

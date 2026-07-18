(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const inputText = document.getElementById('input-text');
        const outputText = document.getElementById('output-text');
        const activeSortBadge = document.getElementById('active-sort-badge');

        const statTotal = document.getElementById('stat-total');
        const statNonempty = document.getElementById('stat-nonempty');
        const statShortest = document.getElementById('stat-shortest');
        const statLongest = document.getElementById('stat-longest');

        const optCaseInsensitive = document.getElementById('opt-case-insensitive');
        const optRemoveEmpty = document.getElementById('opt-remove-empty');

        const sortButtons = document.querySelectorAll('.sort-btn');

        const loadSampleBtn = document.getElementById('load-sample-btn');
        const clearBtn = document.getElementById('clear-btn');
        const resetBtn = document.getElementById('reset-btn');
        const copyBtn = document.getElementById('copy-btn');

        let currentSort = null;

        const SORT_LABELS = {
            'az': 'A → Z',
            'za': 'Z → A',
            'num-asc': 'Numeric ↑',
            'num-desc': 'Numeric ↓',
            'len-asc': 'Shortest First',
            'len-desc': 'Longest First',
            'shuffle': 'Shuffle',
            'reverse': 'Reverse Order',
        };

        const SAMPLE_TEXT = `Banana\nApple\nMango\nCherry\nGrape\nPineapple\nOrange\nStrawberry\nWatermelon\nBlueberry`;

        function getLines() {
            const raw = (inputText.value || '').split('\n');
            const removeEmpty = optRemoveEmpty.checked;
            return removeEmpty ? raw.filter(l => l.trim() !== '') : raw;
        }

        function applySort(lines, sortKey) {
            const ci = optCaseInsensitive.checked;
            const arr = [...lines];
            switch (sortKey) {
                case 'az':
                    arr.sort((a, b) => ci
                        ? a.toLowerCase().localeCompare(b.toLowerCase())
                        : a.localeCompare(b));
                    break;
                case 'za':
                    arr.sort((a, b) => ci
                        ? b.toLowerCase().localeCompare(a.toLowerCase())
                        : b.localeCompare(a));
                    break;
                case 'num-asc':
                    arr.sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0));
                    break;
                case 'num-desc':
                    arr.sort((a, b) => (parseFloat(b) || 0) - (parseFloat(a) || 0));
                    break;
                case 'len-asc':
                    arr.sort((a, b) => a.length - b.length);
                    break;
                case 'len-desc':
                    arr.sort((a, b) => b.length - a.length);
                    break;
                case 'shuffle':
                    for (let i = arr.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [arr[i], arr[j]] = [arr[j], arr[i]];
                    }
                    break;
                case 'reverse':
                    arr.reverse();
                    break;
                default:
                    return lines;
            }
            return arr;
        }

        function updateStats(lines) {
            const raw = (inputText.value || '').split('\n');
            statTotal.textContent = raw.length;
            statNonempty.textContent = raw.filter(l => l.trim() !== '').length;
            if (lines.length === 0) {
                statShortest.textContent = '—';
                statLongest.textContent = '—';
            } else {
                const lens = lines.map(l => l.length);
                statShortest.textContent = Math.min(...lens);
                statLongest.textContent = Math.max(...lens);
            }
        }

        function render() {
            const lines = getLines();
            updateStats(lines);

            if (!currentSort) {
                outputText.value = lines.join('\n');
                activeSortBadge.textContent = 'No Sort';
                return;
            }

            const sorted = applySort(lines, currentSort);
            outputText.value = sorted.join('\n');
            activeSortBadge.textContent = SORT_LABELS[currentSort] || currentSort;
        }

        sortButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                const sortKey = btn.getAttribute('data-sort');
                // Shuffle always re-runs even if same button
                if (currentSort === sortKey && sortKey !== 'shuffle') {
                    currentSort = null;
                    btn.classList.remove('active-sort');
                } else {
                    sortButtons.forEach(b => b.classList.remove('active-sort'));
                    currentSort = sortKey;
                    btn.classList.add('active-sort');
                }
                render();
            });
        });

        inputText.addEventListener('input', render);
        optCaseInsensitive.addEventListener('change', render);
        optRemoveEmpty.addEventListener('change', render);

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
            optCaseInsensitive.checked = true;
            optRemoveEmpty.checked = true;
            currentSort = null;
            sortButtons.forEach(b => b.classList.remove('active-sort'));
            render();
            if (window.TN && window.TN.toast) window.TN.toast.info('Reset.');
        });

        copyBtn.addEventListener('click', function () {
            if (!outputText.value) {
                if (window.TN && window.TN.toast) window.TN.toast.error('Nothing to copy.');
                return;
            }
            navigator.clipboard.writeText(outputText.value).then(function () {
                if (window.TN && window.TN.toast) window.TN.toast.success('Sorted output copied!');
            }).catch(function () {
                if (window.TN && window.TN.toast) window.TN.toast.error('Copy failed.');
            });
        });

        render();
    });
})();

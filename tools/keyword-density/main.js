(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        // UI Elements
        const textareaContent = document.getElementById('density-content');
        const selectType = document.getElementById('density-type');
        const rangeMinLen = document.getElementById('density-min-len');
        const labelMinLen = document.getElementById('label-min-len');
        const checkboxStopwords = document.getElementById('density-ignore-stopwords');
        const inputSearch = document.getElementById('density-search');

        const tableBody = document.getElementById('density-table-body');
        const btnCopy = document.getElementById('btn-copy-csv');
        const btnDownload = document.getElementById('btn-download-csv');
        const resetBtn = document.getElementById('tool-reset');

        // Stop words list (English common words)
        const stopWords = new Set([
            'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
            'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
            'can', 'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during',
            'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hes',
            'her', 'here', 'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into',
            'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on',
            'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shant', 'she',
            'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 'thats', 'the', 'their', 'theirs',
            'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those',
            'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent',
            'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom', 'why', 'whys',
            'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves'
        ]);

        let analysisData = [];

        // Event listeners
        textareaContent.addEventListener('input', runAnalysis);
        selectType.addEventListener('change', runAnalysis);
        checkboxStopwords.addEventListener('change', runAnalysis);
        inputSearch.addEventListener('input', renderReportTable);

        rangeMinLen.addEventListener('input', (e) => {
            labelMinLen.textContent = `${e.target.value} chars`;
            runAnalysis();
        });

        // Copy CSV
        btnCopy.addEventListener('click', () => {
            const csvText = getCsvData();
            if (!csvText) {
                showToast('No analysis data to copy', 'error');
                return;
            }
            navigator.clipboard.writeText(csvText).then(() => {
                showToast('Report copied in CSV format');
            }).catch(() => {
                showToast('Copy failed.', 'error');
            });
        });

        // Download CSV
        btnDownload.addEventListener('click', () => {
            const csvText = getCsvData();
            if (!csvText) {
                showToast('No analysis data to download', 'error');
                return;
            }
            const blob = new Blob([csvText], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'keyword-density-report.csv';
            a.click();
            URL.revokeObjectURL(url);
            showToast('CSV file downloaded');
        });

        // Reset
        resetBtn.addEventListener('click', () => {
            textareaContent.value = '';
            selectType.value = '1';
            rangeMinLen.value = '3';
            labelMinLen.textContent = '3 chars';
            checkboxStopwords.checked = true;
            inputSearch.value = '';
            analysisData = [];

            renderReportTable();
            showToast('Reset completed.');
        });

        // Core Analyzer Engine
        function runAnalysis() {
            const text = textareaContent.value.trim();
            if (!text) {
                analysisData = [];
                renderReportTable();
                return;
            }

            const minLen = parseInt(rangeMinLen.value);
            const ignoreStopwords = checkboxStopwords.checked;
            const groupSize = parseInt(selectType.value);

            // Clean punctuation and tokenize words
            // Replace common linebreaks, punctuation and convert to lowercase
            const cleanText = text.toLowerCase()
                .replace(/<\/?[^>]+(>|$)/g, "") // strip HTML
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, " ") // replace punctuation with spaces
                .replace(/\s+/g, " "); // collapse double whitespace

            const rawWords = cleanText.split(' ').filter(word => word.length > 0);

            // Filter words based on options
            const filteredWords = rawWords.filter(word => {
                if (word.length < minLen) return false;
                if (ignoreStopwords && stopWords.has(word)) return false;
                return true;
            });

            if (filteredWords.length === 0) {
                analysisData = [];
                renderReportTable();
                return;
            }

            // Group into N-Grams
            const nGrams = [];
            for (let i = 0; i <= filteredWords.length - groupSize; i++) {
                const phrase = [];
                for (let k = 0; k < groupSize; k++) {
                    phrase.push(filteredWords[i + k]);
                }
                nGrams.push(phrase.join(' '));
            }

            // Count occurrences
            const frequencyMap = {};
            nGrams.forEach(gram => {
                frequencyMap[gram] = (frequencyMap[gram] || 0) + 1;
            });

            // Map to final sorted objects array
            const totalGrams = nGrams.length;
            analysisData = Object.keys(frequencyMap).map(gram => {
                const count = frequencyMap[gram];
                const density = parseFloat(((count / totalGrams) * 100).toFixed(2));
                return { phrase: gram, count, density };
            });

            // Sort descending by count, then density
            analysisData.sort((a, b) => b.count - a.count);

            renderReportTable();
        }

        // Render Results UI
        function renderReportTable() {
            tableBody.innerHTML = '';
            const searchVal = inputSearch.value.trim().toLowerCase();

            // Filter by search text
            const displayData = searchVal
                ? analysisData.filter(item => item.phrase.includes(searchVal))
                : analysisData;

            if (displayData.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; color: var(--text-muted); padding: var(--spacing-3);">
                            ${textareaContent.value.trim() ? 'No matching keywords found.' : 'Paste text on the left and start typing to analyze keyword density.'}
                        </td>
                    </tr>
                `;
                return;
            }

            displayData.forEach((item, idx) => {
                const row = document.createElement('tr');
                row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';

                // Calculate warning level status
                let statusText = 'Normal';
                let badgeClass = 'badge-success';
                let styleColor = '#55ff55';

                if (item.density >= 2.0 && item.density < 3.0) {
                    statusText = 'Warning';
                    badgeClass = 'badge-warning';
                    styleColor = '#ffaa00';
                } else if (item.density >= 3.0) {
                    statusText = 'Stuffing Risk';
                    badgeClass = 'badge-danger';
                    styleColor = '#ff5555';
                }

                row.innerHTML = `
                    <td style="padding: 8px var(--spacing-15); color: var(--text-muted); font-weight: bold;">${idx + 1}</td>
                    <td style="padding: 8px var(--spacing-15); font-weight: 500;">${escapeHtml(item.phrase)}</td>
                    <td style="padding: 8px var(--spacing-15); text-align: center;">${item.count}</td>
                    <td style="padding: 8px var(--spacing-15); text-align: center;">
                        <div class="flex items-center justify-center gap-05">
                            <span>${item.density}%</span>
                            <div style="width: 40px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; display: inline-block;">
                                <div style="width: ${Math.min(100, item.density * 20)}%; height: 100%; background: ${styleColor};"></div>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 8px var(--spacing-15);">
                        <span class="badge ${badgeClass}" style="font-size: 0.6rem; padding: 2px 6px;">${statusText}</span>
                    </td>
                `;

                tableBody.appendChild(row);
            });
        }

        // CSV compiler utility
        function getCsvData() {
            if (analysisData.length === 0) return null;
            let csv = 'Rank,Keyword/Phrase,Count,Density (%)\n';
            analysisData.forEach((item, idx) => {
                // escape quotes
                const escapedPhrase = item.phrase.replace(/"/g, '""');
                csv += `${idx + 1},"${escapedPhrase}",${item.count},${item.density}\n`;
            });
            return csv;
        }

        // Helpers
        function escapeHtml(text) {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function showToast(message, type = 'success') {
            if (window.TN && window.TN.toast) {
                window.TN.toast.show(message, type);
            } else {
                console.log(type + ": " + message);
            }
        }
    });
})();

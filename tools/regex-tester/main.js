(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const patternInput = document.getElementById('regex-pattern');
        const testString = document.getElementById('test-string');
        const flagG = document.getElementById('flag-g');
        const flagI = document.getElementById('flag-i');
        const flagM = document.getElementById('flag-m');
        const flagS = document.getElementById('flag-s');
        const regexError = document.getElementById('regex-error');
        const matchCount = document.getElementById('match-count');
        const matchResults = document.getElementById('match-results');
        const highlightLayer = document.getElementById('highlight-layer');
        const btnCopy = document.getElementById('btn-copy-matches');
        const resetBtn = document.getElementById('tool-reset');

        let lastMatches = [];

        function getFlags() {
            let f = '';
            if (flagG.checked) f += 'g';
            if (flagI.checked) f += 'i';
            if (flagM.checked) f += 'm';
            if (flagS.checked) f += 's';
            return f;
        }

        function buildRegex() {
            const pat = patternInput.value;
            if (!pat) return null;
            try {
                const flags = getFlags();
                const re = new RegExp(pat, flags);
                regexError.style.display = 'none';
                return re;
            } catch (e) {
                regexError.textContent = '⚠ Invalid regex: ' + e.message;
                regexError.style.display = '';
                return null;
            }
        }

        function escapeHTML(str) {
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }

        function run() {
            const re = buildRegex();
            const text = testString.value;

            if (!re || !text) {
                matchCount.textContent = '0 matches';
                matchResults.innerHTML = '<p class="text-muted text-sm">Enter a pattern and test string to see matches.</p>';
                highlightLayer.innerHTML = escapeHTML(text);
                lastMatches = [];
                return;
            }

            // Find all matches
            const matches = [];
            let m;
            if (flagG.checked) {
                const reGlobal = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
                while ((m = reGlobal.exec(text)) !== null) {
                    matches.push(m);
                    if (m.index === reGlobal.lastIndex) reGlobal.lastIndex++;
                }
            } else {
                m = re.exec(text);
                if (m) matches.push(m);
            }

            lastMatches = matches;
            matchCount.textContent = `${matches.length} match${matches.length !== 1 ? 'es' : ''}`;

            // Build highlighted text
            if (matches.length === 0) {
                highlightLayer.innerHTML = escapeHTML(text);
                matchResults.innerHTML = '<p class="text-muted text-sm">No matches found.</p>';
                return;
            }

            // Highlight in textarea overlay
            let highlighted = '';
            let lastIdx = 0;
            matches.forEach(match => {
                highlighted += escapeHTML(text.substring(lastIdx, match.index));
                highlighted += `<mark style="background:rgba(139,92,246,0.35);border-radius:2px;color:inherit;">${escapeHTML(match[0])}</mark>`;
                lastIdx = match.index + match[0].length;
            });
            highlighted += escapeHTML(text.substring(lastIdx));
            highlightLayer.innerHTML = highlighted;

            // Match results list
            let html = '';
            matches.forEach((match, i) => {
                html += `<div style="padding:var(--spacing-1) 0;border-bottom:1px solid var(--border-color);">`;
                html += `<div class="flex justify-between items-center mb-025"><span class="text-xs text-muted uppercase">Match ${i + 1}</span><span class="text-xs text-muted">Index: ${match.index}</span></div>`;
                html += `<code style="font-size:var(--text-sm);background:rgba(139,92,246,0.15);padding:2px 6px;border-radius:3px;">${escapeHTML(match[0])}</code>`;
                if (match.length > 1) {
                    const groups = match.slice(1);
                    groups.forEach((g, gi) => {
                        html += `<div class="text-xs text-muted mt-025">Group ${gi + 1}: <code style="background:rgba(255,255,255,0.05);padding:1px 4px;border-radius:2px;">${g !== undefined ? escapeHTML(g) : 'undefined'}</code></div>`;
                    });
                }
                html += `</div>`;
            });
            matchResults.innerHTML = html;
        }

        patternInput.addEventListener('input', run);
        testString.addEventListener('input', run);
        [flagG, flagI, flagM, flagS].forEach(f => f.addEventListener('change', run));

        // Sync scroll between textarea and highlight layer
        testString.addEventListener('scroll', () => {
            highlightLayer.scrollTop = testString.scrollTop;
            highlightLayer.scrollLeft = testString.scrollLeft;
        });

        btnCopy.addEventListener('click', () => {
            if (!lastMatches.length) { showToast('No matches to copy', 'error'); return; }
            const text = lastMatches.map((m, i) => `Match ${i + 1}: "${m[0]}" at index ${m.index}`).join('\n');
            navigator.clipboard.writeText(text).then(() => showToast('Matches copied!')).catch(() => showToast('Copy failed', 'error'));
        });

        resetBtn.addEventListener('click', () => {
            patternInput.value = ''; testString.value = '';
            flagG.checked = true; flagI.checked = false; flagM.checked = false; flagS.checked = false;
            regexError.style.display = 'none';
            highlightLayer.innerHTML = '';
            matchCount.textContent = '0 matches';
            matchResults.innerHTML = '<p class="text-muted text-sm">Enter a pattern and test string to see matches.</p>';
            lastMatches = [];
            showToast('Reset completed.');
        });

        function showToast(msg, type = 'success') {
            if (window.TN && window.TN.toast) window.TN.toast.show(msg, type);
        }
    });
})();

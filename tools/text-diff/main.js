(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const original = document.getElementById('text-original');
        const modified = document.getElementById('text-modified');
        const diffOutput = document.getElementById('diff-output');
        const diffStats = document.getElementById('diff-stats');
        const statAdded = document.getElementById('stat-added');
        const statRemoved = document.getElementById('stat-removed');
        const statSame = document.getElementById('stat-same');
        const diffMeta = document.getElementById('diff-meta');
        const btnCopy = document.getElementById('btn-copy-diff');
        const btnDownload = document.getElementById('btn-download-diff');
        const resetBtn = document.getElementById('tool-reset');

        original.addEventListener('input', runDiff);
        modified.addEventListener('input', runDiff);

        // ── Myers shortest edit script (line-level) ──────────────────
        function lcs(a, b) {
            const m = a.length, n = b.length;
            const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
            for (let i = 1; i <= m; i++) {
                for (let j = 1; j <= n; j++) {
                    dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
            // Backtrack
            const result = [];
            let i = m, j = n;
            while (i > 0 && j > 0) {
                if (a[i - 1] === b[j - 1]) { result.unshift({ type: 'same', value: a[i - 1] }); i--; j--; }
                else if (dp[i - 1][j] > dp[i][j - 1]) { result.unshift({ type: 'removed', value: a[i - 1] }); i--; }
                else { result.unshift({ type: 'added', value: b[j] - 1}); j--; }
            }
            while (i > 0) { result.unshift({ type: 'removed', value: a[i - 1] }); i--; }
            while (j > 0) { result.unshift({ type: 'added', value: b[j - 1] }); j--; }
            return result;
        }

        function computeDiff(textA, textB) {
            const linesA = textA.split('\n');
            const linesB = textB.split('\n');
            const m = linesA.length, n = linesB.length;

            // Simple Needleman-Wunsch style line diff
            const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
            for (let i = 0; i <= m; i++) dp[i][0] = i;
            for (let j = 0; j <= n; j++) dp[0][j] = j;
            for (let i = 1; i <= m; i++) {
                for (let j = 1; j <= n; j++) {
                    if (linesA[i - 1] === linesB[j - 1]) {
                        dp[i][j] = dp[i - 1][j - 1];
                    } else {
                        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
                    }
                }
            }

            // Backtrack
            const diff = [];
            let i = m, j = n;
            while (i > 0 || j > 0) {
                if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
                    diff.unshift({ type: 'same', line: linesA[i - 1] });
                    i--; j--;
                } else if (j > 0 && (i === 0 || dp[i][j - 1] <= dp[i - 1][j])) {
                    diff.unshift({ type: 'added', line: linesB[j - 1] });
                    j--;
                } else {
                    diff.unshift({ type: 'removed', line: linesA[i - 1] });
                    i--;
                }
            }
            return diff;
        }

        function runDiff() {
            const textA = original.value;
            const textB = modified.value;

            if (!textA && !textB) {
                diffOutput.innerHTML = '<p class="text-muted text-sm">Start typing in both boxes to see live differences highlighted.</p>';
                diffStats.style.removeProperty('display');
                diffStats.style.display = 'none';
                diffMeta.textContent = '';
                return;
            }

            const diff = computeDiff(textA, textB);
            let added = 0, removed = 0, same = 0;
            let html = '';

            diff.forEach((item, idx) => {
                const escaped = escapeHTML(item.line);
                if (item.type === 'added') {
                    added++;
                    html += `<div style="background:rgba(34,197,94,0.12);border-left:3px solid var(--success);padding:1px 8px;"><span style="color:var(--success);user-select:none;margin-right:6px;">+</span>${escaped}</div>`;
                } else if (item.type === 'removed') {
                    removed++;
                    html += `<div style="background:rgba(239,68,68,0.12);border-left:3px solid var(--danger);padding:1px 8px;"><span style="color:var(--danger);user-select:none;margin-right:6px;">−</span>${escaped}</div>`;
                } else {
                    same++;
                    html += `<div style="padding:1px 8px;color:var(--text-muted);"><span style="user-select:none;margin-right:6px;opacity:0.4;"> </span>${escaped}</div>`;
                }
            });

            diffOutput.innerHTML = html || '<p class="text-muted text-sm">No differences found.</p>';
            statAdded.textContent = '+' + added;
            statRemoved.textContent = '−' + removed;
            statSame.textContent = same;
            diffStats.style.display = 'flex';
            diffMeta.textContent = `${added} added, ${removed} removed, ${same} unchanged`;
        }

        function diffToPlainText() {
            const diff = computeDiff(original.value, modified.value);
            return diff.map(d => {
                const prefix = d.type === 'added' ? '+' : d.type === 'removed' ? '-' : ' ';
                return `${prefix} ${d.line}`;
            }).join('\n');
        }

        btnCopy.addEventListener('click', () => {
            const text = diffToPlainText();
            if (!text) { showToast('Nothing to copy', 'error'); return; }
            navigator.clipboard.writeText(text).then(() => showToast('Diff copied!')).catch(() => showToast('Copy failed', 'error'));
        });

        btnDownload.addEventListener('click', () => {
            const text = diffToPlainText();
            if (!text) { showToast('Nothing to download', 'error'); return; }
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'diff.patch'; a.click();
            URL.revokeObjectURL(url);
            showToast('Diff downloaded!');
        });

        resetBtn.addEventListener('click', () => {
            original.value = ''; modified.value = '';
            diffOutput.innerHTML = '<p class="text-muted text-sm">Start typing in both boxes to see live differences highlighted.</p>';
            diffStats.style.display = 'none';
            diffMeta.textContent = '';
            showToast('Reset completed.');
        });

        function escapeHTML(str) {
            return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        }

        function showToast(msg, type = 'success') {
            if (window.TN && window.TN.toast) window.TN.toast.show(msg, type);
        }
    });
})();

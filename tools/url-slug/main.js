(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const slugInput = document.getElementById('slug-input');
        const slugOutput = document.getElementById('slug-output');
        const btnCopy = document.getElementById('btn-copy-slug');
        const btnSave = document.getElementById('btn-save-history');
        const btnClearHistory = document.getElementById('btn-clear-history');
        const historySection = document.getElementById('slug-history-section');
        const historyContainer = document.getElementById('slug-history');
        const optStopWords = document.getElementById('opt-stopwords');
        const optTruncate = document.getElementById('opt-truncate');
        const resetBtn = document.getElementById('tool-reset');

        let separator = '-';
        let caseMode = 'lower';
        let history = [];

        // Common English stop words
        const stopWords = new Set([
            'a','an','the','and','or','but','in','on','at','to','for','of','with',
            'by','from','as','is','was','are','were','be','been','being','have','has',
            'had','do','does','did','will','would','could','should','may','might',
            'shall','can','this','that','these','those','it','its','i','we','you',
            'he','she','they','my','your','his','her','our','their','what','which',
            'who','how','when','where','why','all','any','both','each','few','more',
            'most','other','some','such','no','not','only','same','so','than','too',
            'very','just','about','above','after','before','between','into','through',
            'up','out','if','then','there'
        ]);

        // Separator buttons
        document.querySelectorAll('.sep-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.sep-btn').forEach(b => { b.classList.remove('btn-primary', 'active'); b.classList.add('btn-ghost'); });
                btn.classList.add('btn-primary', 'active'); btn.classList.remove('btn-ghost');
                separator = btn.getAttribute('data-sep');
                generate();
            });
        });

        // Case buttons
        document.querySelectorAll('.case-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.case-btn').forEach(b => { b.classList.remove('btn-primary', 'active'); b.classList.add('btn-ghost'); });
                btn.classList.add('btn-primary', 'active'); btn.classList.remove('btn-ghost');
                caseMode = btn.getAttribute('data-case');
                generate();
            });
        });

        slugInput.addEventListener('input', generate);
        optStopWords.addEventListener('change', generate);
        optTruncate.addEventListener('change', generate);

        function generate() {
            const raw = slugInput.value;
            if (!raw.trim()) { slugOutput.textContent = ''; return; }

            let slug = raw
                // Normalize accented chars
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                // Lowercase first for comparison
                .toLowerCase()
                // Remove everything that's not alphanumeric or whitespace
                .replace(/[^a-z0-9\s]/g, ' ')
                .trim();

            // Split into words
            let words = slug.split(/\s+/).filter(Boolean);

            // Remove stop words
            if (optStopWords.checked && words.length > 1) {
                const filtered = words.filter(w => !stopWords.has(w));
                if (filtered.length > 0) words = filtered;
            }

            slug = words.join(separator);

            // Apply case
            slug = caseMode === 'upper' ? slug.toUpperCase() : slug.toLowerCase();

            // Truncate
            if (optTruncate.checked && slug.length > 60) {
                slug = slug.substring(0, 60).replace(new RegExp('[' + separator + ']+$'), '');
            }

            slugOutput.textContent = slug;
        }

        btnCopy.addEventListener('click', () => {
            const slug = slugOutput.textContent;
            if (!slug) { showToast('Nothing to copy', 'error'); return; }
            navigator.clipboard.writeText(slug).then(() => showToast('Slug copied!')).catch(() => showToast('Copy failed', 'error'));
        });

        btnSave.addEventListener('click', () => {
            const slug = slugOutput.textContent;
            if (!slug) { showToast('No slug to save', 'error'); return; }
            if (history.includes(slug)) { showToast('Already in history', 'error'); return; }
            history.unshift(slug);
            if (history.length > 10) history.pop();
            renderHistory();
            showToast('Saved to history!');
        });

        btnClearHistory.addEventListener('click', () => {
            history = [];
            renderHistory();
            showToast('History cleared.');
        });

        function renderHistory() {
            if (!history.length) {
                historySection.style.display = 'none';
                return;
            }
            historySection.style.display = '';
            historyContainer.innerHTML = history.map(slug => `
                <div class="flex justify-between items-center" style="padding:var(--spacing-05) var(--spacing-1);background:rgba(255,255,255,0.02);border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                    <code style="font-size:var(--text-xs);font-family:var(--font-mono);">${escapeHTML(slug)}</code>
                    <button class="btn btn-ghost btn-xs hist-copy" data-slug="${escapeHTML(slug)}">Copy</button>
                </div>
            `).join('');
            historyContainer.querySelectorAll('.hist-copy').forEach(btn => {
                btn.addEventListener('click', () => {
                    navigator.clipboard.writeText(btn.getAttribute('data-slug')).then(() => showToast('Copied!')).catch(() => showToast('Failed', 'error'));
                });
            });
        }

        resetBtn.addEventListener('click', () => {
            slugInput.value = '';
            slugOutput.textContent = '';
            showToast('Reset completed.');
        });

        function escapeHTML(str) {
            return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        }

        function showToast(msg, type = 'success') {
            if (window.TN && window.TN.toast) window.TN.toast.show(msg, type);
        }

        generate();
    });
})();

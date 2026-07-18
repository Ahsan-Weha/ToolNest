(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        // ── DOM References ──────────────────────────────────────────────
        const inputs = {
            title:      document.getElementById('meta-title'),
            desc:       document.getElementById('meta-description-input'),
            keywords:   document.getElementById('meta-keywords'),
            author:     document.getElementById('meta-author'),
            canonical:  document.getElementById('meta-canonical'),
            robots:     document.getElementById('meta-robots'),
            ogTitle:    document.getElementById('og-title'),
            ogDesc:     document.getElementById('og-desc'),
            ogImage:    document.getElementById('og-image'),
            ogUrl:      document.getElementById('og-url'),
            ogType:     document.getElementById('og-type'),
            ogSitename: document.getElementById('og-sitename'),
            twCard:     document.getElementById('tw-card'),
            twTitle:    document.getElementById('tw-title'),
            twDesc:     document.getElementById('tw-desc'),
            twImage:    document.getElementById('tw-image'),
            twSite:     document.getElementById('tw-site'),
        };

        const outputMeta    = document.getElementById('output-meta');
        const counterTitle  = document.getElementById('counter-title');
        const counterDesc   = document.getElementById('counter-desc');
        const warnTitle     = document.getElementById('warn-title');
        const warnDesc      = document.getElementById('warn-desc');
        const btnCopy       = document.getElementById('btn-copy-meta');
        const btnDownload   = document.getElementById('btn-download-meta');
        const resetBtn      = document.getElementById('tool-reset');
        const tabBtns       = document.querySelectorAll('.tab-btn');
        const tabPanels     = document.querySelectorAll('.tab-panel');

        // ── Tab Switcher ────────────────────────────────────────────────
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                tabBtns.forEach(b => {
                    b.classList.remove('active', 'btn-primary');
                    b.classList.add('btn-ghost');
                });
                btn.classList.add('active', 'btn-primary');
                btn.classList.remove('btn-ghost');
                tabPanels.forEach(p => p.style.display = 'none');
                const panel = document.getElementById('tab-' + tab);
                if (panel) panel.style.display = 'block';
                generateTags();
            });
        });

        // ── Live listeners ──────────────────────────────────────────────
        Object.values(inputs).forEach(el => {
            if (!el) return;
            el.addEventListener('input', generateTags);
            el.addEventListener('change', generateTags);
        });

        // ── Character counters ──────────────────────────────────────────
        function updateCounters() {
            const tLen = (inputs.title.value || '').length;
            const dLen = (inputs.desc.value || '').length;

            counterTitle.textContent = `${tLen} / 60`;
            counterTitle.style.color = tLen > 60 ? 'var(--danger)' : 'var(--text-muted)';
            warnTitle.style.display = tLen > 60 ? 'block' : 'none';

            counterDesc.textContent = `${dLen} / 160`;
            counterDesc.style.color = dLen > 160 ? 'var(--danger)' : 'var(--text-muted)';
            warnDesc.style.display = dLen > 160 ? 'block' : 'none';
        }

        inputs.title.addEventListener('input', updateCounters);
        inputs.desc.addEventListener('input', updateCounters);

        // ── Tag Generator ───────────────────────────────────────────────
        function generateTags() {
            const lines = [];
            const v = k => (inputs[k] ? inputs[k].value.trim() : '');
            const tag = (name, content) => content ? `<meta name="${name}" content="${esc(content)}">` : null;
            const prop = (property, content) => content ? `<meta property="${property}" content="${esc(content)}">` : null;
            const twTag = (name, content) => content ? `<meta name="${name}" content="${esc(content)}">` : null;
            const esc = str => str.replace(/"/g, '&quot;');

            lines.push('<!-- ═══ Basic SEO Meta Tags ═══ -->');
            if (v('title'))     lines.push(`<title>${v('title')}</title>`);
            if (v('desc'))      lines.push(tag('description', v('desc')));
            if (v('keywords'))  lines.push(tag('keywords', v('keywords')));
            if (v('author'))    lines.push(tag('author', v('author')));
            lines.push(tag('robots', v('robots') || 'index, follow'));
            if (v('canonical')) lines.push(`<link rel="canonical" href="${v('canonical')}">`);

            // Open Graph
            const hasOg = v('ogTitle') || v('ogDesc') || v('ogImage') || v('ogUrl') || v('ogSitename');
            if (hasOg) {
                lines.push('');
                lines.push('<!-- ═══ Open Graph Tags ═══ -->');
                if (v('ogTitle'))    lines.push(prop('og:title', v('ogTitle')));
                if (v('ogDesc'))     lines.push(prop('og:description', v('ogDesc')));
                if (v('ogImage'))    lines.push(prop('og:image', v('ogImage')));
                if (v('ogUrl'))      lines.push(prop('og:url', v('ogUrl')));
                lines.push(prop('og:type', v('ogType') || 'website'));
                if (v('ogSitename')) lines.push(prop('og:site_name', v('ogSitename')));
            }

            // Twitter Card
            const hasTw = v('twTitle') || v('twDesc') || v('twImage') || v('twSite');
            if (hasTw) {
                lines.push('');
                lines.push('<!-- ═══ Twitter Card Tags ═══ -->');
                lines.push(twTag('twitter:card', v('twCard') || 'summary_large_image'));
                if (v('twTitle')) lines.push(twTag('twitter:title', v('twTitle')));
                if (v('twDesc'))  lines.push(twTag('twitter:description', v('twDesc')));
                if (v('twImage')) lines.push(twTag('twitter:image', v('twImage')));
                if (v('twSite'))  lines.push(twTag('twitter:site', v('twSite')));
            }

            // Filter nulls and join
            outputMeta.value = lines.filter(Boolean).join('\n');
        }

        // ── Copy ────────────────────────────────────────────────────────
        btnCopy.addEventListener('click', () => {
            const text = outputMeta.value;
            if (!text.trim()) { toast('Nothing to copy — fill in the fields first.', 'error'); return; }
            navigator.clipboard.writeText(text).then(() => toast('Meta tags copied!')).catch(() => toast('Copy failed.', 'error'));
        });

        // ── Download ────────────────────────────────────────────────────
        btnDownload.addEventListener('click', () => {
            const text = outputMeta.value;
            if (!text.trim()) { toast('Nothing to download — fill in the fields first.', 'error'); return; }
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'meta-tags.txt'; a.click();
            URL.revokeObjectURL(url);
            toast('meta-tags.txt downloaded!');
        });

        // ── Reset ───────────────────────────────────────────────────────
        resetBtn.addEventListener('click', () => {
            Object.values(inputs).forEach(el => { if (el) el.value = (el.tagName === 'SELECT' ? el.options[0].value : ''); });
            outputMeta.value = '';
            counterTitle.textContent = '0 / 60';
            counterDesc.textContent = '0 / 160';
            warnTitle.style.display = 'none';
            warnDesc.style.display = 'none';
            toast('Reset completed.');
        });

        // ── Toast helper ────────────────────────────────────────────────
        function toast(msg, type = 'success') {
            if (window.TN && window.TN.toast) window.TN.toast.show(msg, type);
        }

        // Initial render
        generateTags();
    });
})();

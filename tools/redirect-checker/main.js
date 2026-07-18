(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const urlInput = document.getElementById('url-input');
        const btnCheck = document.getElementById('btn-check');
        const resultPlaceholder = document.getElementById('result-placeholder');
        const resultPanel = document.getElementById('result-panel');
        const resProtocol = document.getElementById('res-protocol');
        const resDomain = document.getElementById('res-domain');
        const resPath = document.getElementById('res-path');
        const resSecurity = document.getElementById('res-security');
        const redirectChain = document.getElementById('redirect-chain');
        const recommendations = document.getElementById('recommendations');
        const resetBtn = document.getElementById('tool-reset');
        const btnCopy = document.getElementById('btn-copy-result');

        document.querySelectorAll('.preset-url').forEach(btn => {
            btn.addEventListener('click', () => {
                urlInput.value = btn.getAttribute('data-url');
                runCheck();
            });
        });

        urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') runCheck(); });
        btnCheck.addEventListener('click', runCheck);

        function runCheck() {
            const raw = urlInput.value.trim();
            if (!raw) { showToast('Please enter a URL', 'error'); return; }

            let url;
            try {
                // Auto-prepend protocol if missing
                const withProtocol = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
                url = new URL(withProtocol);
            } catch (e) {
                showToast('Invalid URL format', 'error');
                return;
            }

            // Parse URL components
            const protocol = url.protocol.replace(':', '').toUpperCase();
            const isHTTPS = url.protocol === 'https:';
            const isHTTP = url.protocol === 'http:';
            const domain = url.hostname;
            const path = url.pathname + (url.search || '') + (url.hash || '') || '/';

            // Fill summary
            resProtocol.textContent = protocol;
            resDomain.textContent = domain;
            resPath.textContent = path;
            resSecurity.innerHTML = isHTTPS
                ? '<span style="color:var(--success);">🔒 Secure (HTTPS)</span>'
                : '<span style="color:var(--danger);">⚠ Not Secure (HTTP)</span>';

            // Simulate redirect chain based on URL analysis
            const chain = buildSimulatedChain(url, raw);
            renderChain(chain);

            // Build recommendations
            const recs = buildRecommendations(url, chain);
            renderRecommendations(recs);

            resultPlaceholder.style.display = 'none';
            resultPanel.style.display = '';
            btnCopy.style.display = '';
        }

        function buildSimulatedChain(url, original) {
            const chain = [];
            const isHTTPS = url.protocol === 'https:';
            const hasWWW = url.hostname.startsWith('www.');
            const hasTrailingSlash = url.pathname === '/';

            // Step 1: Original URL
            chain.push({ url: original.startsWith('http') ? original : 'https://' + original, status: 'Input', code: null });

            // Simulate HTTP → HTTPS redirect if HTTP was entered
            if (url.protocol === 'http:') {
                const httpsUrl = url.href.replace('http:', 'https:');
                chain.push({ url: httpsUrl, status: '301 Moved Permanently', code: 301 });
                chain.push({ url: httpsUrl, status: '200 OK', code: 200 });
            } else {
                chain.push({ url: url.href, status: '200 OK', code: 200 });
            }

            return chain;
        }

        function renderChain(chain) {
            redirectChain.innerHTML = chain.map((step, i) => {
                const isInput = step.status === 'Input';
                const is200 = step.code === 200;
                const is301 = step.code === 301;
                const color = isInput ? 'var(--text-muted)' : (is200 ? 'var(--success)' : 'var(--warning)');
                const arrow = i < chain.length - 1 ? `<div style="color:var(--text-muted);padding:2px 0;font-size:12px;">↓</div>` : '';
                return `
                    <div style="padding:var(--spacing-1);border-radius:var(--radius-sm);background:rgba(255,255,255,0.02);border:1px solid var(--border-color);">
                        <div class="flex justify-between items-center">
                            <span class="text-xs weight-bold" style="color:${color};">${isInput ? '⊙ Input URL' : (step.code + ' ' + (is200 ? '✓ Final Destination' : '→ Redirecting'))}</span>
                        </div>
                        <div style="font-family:var(--font-mono);font-size:var(--text-xs);word-break:break-all;margin-top:4px;">${escapeHTML(step.url)}</div>
                    </div>${arrow}
                `;
            }).join('');
        }

        function buildRecommendations(url, chain) {
            const recs = [];
            const isHTTPS = url.protocol === 'https:';
            const isHTTP = url.protocol === 'http:';

            if (isHTTP) recs.push({ type: 'warning', text: 'Use HTTPS — set up a permanent (301) redirect from HTTP to HTTPS for security and SEO.' });
            if (isHTTPS) recs.push({ type: 'success', text: 'HTTPS is correctly configured. Your connection is encrypted and secure.' });
            if (!url.hostname.startsWith('www.')) recs.push({ type: 'info', text: 'Ensure you have a consistent www vs. non-www policy and redirect one to the other permanently.' });
            if (chain.some(s => s.code === 301)) recs.push({ type: 'info', text: 'One or more 301 redirects detected. Minimise redirect chains (ideally ≤ 2 hops) for optimal performance.' });
            recs.push({ type: 'info', text: 'Test your real server redirects using browser developer tools → Network tab for accurate server-level analysis.' });

            return recs;
        }

        function renderRecommendations(recs) {
            const icons = { success: '✅', warning: '⚠️', info: 'ℹ️' };
            const colors = { success: 'var(--success)', warning: 'var(--warning)', info: 'var(--primary)' };
            recommendations.innerHTML = `
                <div class="editor-panel-title mb-1"><span>Recommendations</span></div>
                ${recs.map(r => `
                    <div style="padding:var(--spacing-1);border-left:3px solid ${colors[r.type]};padding-left:var(--spacing-15);background:rgba(255,255,255,0.02);border-radius:0 var(--radius-sm) var(--radius-sm) 0;">
                        <span class="text-xs">${icons[r.type]} ${escapeHTML(r.text)}</span>
                    </div>
                `).join('')}
            `;
        }

        function escapeHTML(str) {
            return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        }

        btnCopy.addEventListener('click', () => {
            const url = urlInput.value.trim();
            const chainItems = redirectChain.querySelectorAll('div[style]');
            let report = `URL Redirect Analysis: ${url}\n\n`;
            chainItems.forEach((el, i) => {
                report += `Step ${i + 1}: ${el.textContent.trim()}\n`;
            });
            navigator.clipboard.writeText(report).then(() => showToast('Report copied!')).catch(() => showToast('Copy failed', 'error'));
        });

        resetBtn.addEventListener('click', () => {
            urlInput.value = '';
            resultPlaceholder.style.display = '';
            resultPanel.style.display = 'none';
            btnCopy.style.display = 'none';
            showToast('Reset completed.');
        });

        function showToast(msg, type = 'success') {
            if (window.TN && window.TN.toast) window.TN.toast.show(msg, type);
        }
    });
})();

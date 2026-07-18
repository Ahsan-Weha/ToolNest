(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        // UI Elements
        const tabSingleBtn = document.getElementById('tab-single-btn');
        const tabBatchBtn = document.getElementById('tab-batch-btn');
        const panelSingle = document.getElementById('panel-single');
        const panelBatch = document.getElementById('panel-batch');

        const inputUrl = document.getElementById('sitemap-url-input');
        const inputLastmod = document.getElementById('sitemap-lastmod');
        const selectChangefreq = document.getElementById('sitemap-changefreq');
        const selectPriority = document.getElementById('sitemap-priority');
        const btnAddUrl = document.getElementById('btn-add-url');

        const textareaBatch = document.getElementById('sitemap-batch-input');
        const selectBatchFreq = document.getElementById('sitemap-batch-freq');
        const selectBatchPriority = document.getElementById('sitemap-batch-priority');
        const btnAddBatch = document.getElementById('btn-add-batch');

        const countSpan = document.getElementById('sitemap-count');
        const tableBody = document.getElementById('sitemap-table-body');
        const btnClearList = document.getElementById('btn-clear-list');

        const textareaOutput = document.getElementById('output-sitemap');
        const btnDownload = document.getElementById('btn-download-sitemap');
        const resetBtn = document.getElementById('tool-reset');

        // State
        let urlsList = [];

        // Set default lastmod date to today
        const today = new Date().toISOString().split('T')[0];
        inputLastmod.value = today;

        // Tab Switching
        tabSingleBtn.addEventListener('click', () => {
            tabSingleBtn.classList.add('active', 'btn-primary');
            tabSingleBtn.classList.remove('btn-ghost');
            tabBatchBtn.classList.remove('active', 'btn-primary');
            tabBatchBtn.classList.add('btn-ghost');

            panelSingle.style.display = 'flex';
            panelBatch.style.display = 'none';
        });

        tabBatchBtn.addEventListener('click', () => {
            tabBatchBtn.classList.add('active', 'btn-primary');
            tabBatchBtn.classList.remove('btn-ghost');
            tabSingleBtn.classList.remove('active', 'btn-primary');
            tabSingleBtn.classList.add('btn-ghost');

            panelBatch.style.display = 'flex';
            panelSingle.style.display = 'none';
        });

        // Add Single URL
        btnAddUrl.addEventListener('click', () => {
            const urlVal = inputUrl.value.trim();
            const lastmod = inputLastmod.value;
            const changefreq = selectChangefreq.value;
            const priority = parseFloat(selectPriority.value).toFixed(1);

            if (!urlVal) {
                showToast('Please enter a URL', 'error');
                return;
            }

            if (!isValidUrl(urlVal)) {
                showToast('Please enter a valid absolute URL (e.g. https://yourdomain.com/)', 'error');
                return;
            }

            if (urlsList.some(item => item.url.toLowerCase() === urlVal.toLowerCase())) {
                showToast('This URL has already been added', 'warning');
                return;
            }

            urlsList.push({ url: urlVal, lastmod, changefreq, priority });
            renderUrlsTable();
            generateSitemapXml();
            showToast('URL added');

            // Clear single input
            inputUrl.value = '';
        });

        // Add Batch URLs
        btnAddBatch.addEventListener('click', () => {
            const batchText = textareaBatch.value.trim();
            if (!batchText) {
                showToast('Please enter a list of URLs', 'error');
                return;
            }

            const lines = batchText.split('\n');
            const defaultFreq = selectBatchFreq.value;
            const defaultPriority = parseFloat(selectBatchPriority.value).toFixed(1);
            let importedCount = 0;
            let skippedCount = 0;

            lines.forEach(line => {
                const urlVal = line.trim();
                if (!urlVal) return;

                if (!isValidUrl(urlVal)) {
                    skippedCount++;
                    return;
                }

                if (urlsList.some(item => item.url.toLowerCase() === urlVal.toLowerCase())) {
                    skippedCount++;
                    return;
                }

                urlsList.push({
                    url: urlVal,
                    lastmod: today,
                    changefreq: defaultFreq,
                    priority: defaultPriority
                });
                importedCount++;
            });

            renderUrlsTable();
            generateSitemapXml();
            textareaBatch.value = '';

            if (importedCount > 0) {
                showToast(`Successfully imported ${importedCount} URLs. Skipped ${skippedCount} invalid/duplicate items.`);
            } else {
                showToast('No valid or unique URLs found in the batch input.', 'error');
            }
        });

        // Clear List
        btnClearList.addEventListener('click', () => {
            if (urlsList.length === 0) return;
            urlsList = [];
            renderUrlsTable();
            generateSitemapXml();
            showToast('Sitemap URL list cleared');
        });

        // Copy buttons setup
        document.querySelectorAll('.copy-btn-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const targetInput = document.getElementById(targetId);
                if (targetInput && targetInput.value) {
                    navigator.clipboard.writeText(targetInput.value).then(() => {
                        showToast('Copied to clipboard!');
                    }).catch(() => {
                        showToast('Copy failed.', 'error');
                    });
                }
            });
        });

        // Download
        btnDownload.addEventListener('click', () => {
            const content = textareaOutput.value;
            if (!content) {
                showToast('Nothing to download', 'error');
                return;
            }
            const blob = new Blob([content], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sitemap.xml';
            a.click();
            URL.revokeObjectURL(url);
            showToast('sitemap.xml downloaded');
        });

        // Reset
        resetBtn.addEventListener('click', () => {
            urlsList = [];
            inputUrl.value = '';
            inputLastmod.value = today;
            selectChangefreq.value = 'weekly';
            selectPriority.value = '0.8';
            textareaBatch.value = '';
            selectBatchFreq.value = 'weekly';
            selectBatchPriority.value = '0.5';

            renderUrlsTable();
            generateSitemapXml();
            showToast('Reset completed.');
        });

        // URL validation helper
        function isValidUrl(string) {
            try {
                const url = new URL(string);
                return url.protocol === 'http:' || url.protocol === 'https:';
            } catch (_) {
                return false;
            }
        }

        // Render sitemap listing table
        function renderUrlsTable() {
            tableBody.innerHTML = '';
            countSpan.textContent = urlsList.length;

            if (urlsList.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; color: var(--text-muted); padding: var(--spacing-2);">
                            No URLs added yet. Start by entering one above.
                        </td>
                    </tr>
                `;
                return;
            }

            urlsList.forEach((item, idx) => {
                const row = document.createElement('tr');
                row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';

                // Truncate long URLs for display
                const maxDisplayLen = 42;
                const displayUrl = item.url.length > maxDisplayLen 
                    ? item.url.substring(0, maxDisplayLen) + '...' 
                    : item.url;

                row.innerHTML = `
                    <td style="padding: 6px var(--spacing-1); font-family: monospace;" title="${item.url}">${displayUrl}</td>
                    <td style="padding: 6px var(--spacing-1); text-align: center;">${item.priority}</td>
                    <td style="padding: 6px var(--spacing-1); text-align: center;">${item.changefreq}</td>
                    <td style="padding: 6px var(--spacing-1); text-align: center;">
                        <button class="btn btn-ghost btn-xs text-danger delete-url-row" data-index="${idx}" style="padding: 2px 6px;">Delete</button>
                    </td>
                `;

                row.querySelector('.delete-url-row').addEventListener('click', (e) => {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    urlsList.splice(index, 1);
                    renderUrlsTable();
                    generateSitemapXml();
                    showToast('URL removed');
                });

                tableBody.appendChild(row);
            });
        }

        // Generate Sitemap XML Output
        function generateSitemapXml() {
            let output = '<?xml version="1.0" encoding="UTF-8"?>\n';
            output += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

            urlsList.forEach(item => {
                // Escape XML entities
                const escapedUrl = item.url
                    .replace(/&/g, '&amp;')
                    .replace(/'/g, '&apos;')
                    .replace(/"/g, '&quot;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');

                output += '  <url>\n';
                output += `    <loc>${escapedUrl}</loc>\n`;
                if (item.lastmod) {
                    output += `    <lastmod>${item.lastmod}</lastmod>\n`;
                }
                output += `    <changefreq>${item.changefreq}</changefreq>\n`;
                output += `    <priority>${item.priority}</priority>\n`;
                output += '  </url>\n';
            });

            output += '</urlset>';
            textareaOutput.value = output;
        }

        // Toast Helper
        function showToast(message, type = 'success') {
            if (window.TN && window.TN.toast) {
                window.TN.toast.show(message, type);
            } else {
                console.log(type + ": " + message);
            }
        }

        // Run initial setup
        renderUrlsTable();
        generateSitemapXml();
    });
})();

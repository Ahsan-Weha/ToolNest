(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        // UI Elements
        const selectPreset = document.getElementById('robots-preset');
        const inputSitemap = document.getElementById('robots-sitemap');
        const selectDelay = document.getElementById('robots-delay');

        const selectUa = document.getElementById('rule-ua');
        const selectAction = document.getElementById('rule-action');
        const inputPath = document.getElementById('rule-path');
        const btnAddRule = document.getElementById('btn-add-rule');
        const activeRulesList = document.getElementById('active-rules-list');

        const textareaOutput = document.getElementById('output-robots');
        const btnDownload = document.getElementById('btn-download-robots');
        const resetBtn = document.getElementById('tool-reset');

        // State
        let customRules = [];

        // Rule builder fields disabling logic
        function checkPresetState() {
            const isCustom = selectPreset.value === 'custom';
            selectUa.disabled = !isCustom;
            selectAction.disabled = !isCustom;
            inputPath.disabled = !isCustom;
            btnAddRule.disabled = !isCustom;

            if (!isCustom) {
                activeRulesList.style.opacity = '0.5';
                activeRulesList.style.pointerEvents = 'none';
            } else {
                activeRulesList.style.opacity = '1';
                activeRulesList.style.pointerEvents = 'auto';
            }
        }

        // Event listeners
        selectPreset.addEventListener('change', () => {
            checkPresetState();
            generateRobotsTxt();
        });

        inputSitemap.addEventListener('input', generateRobotsTxt);
        selectDelay.addEventListener('change', generateRobotsTxt);

        btnAddRule.addEventListener('click', () => {
            const ua = selectUa.value;
            const action = selectAction.value;
            let path = inputPath.value.trim();

            if (!path) {
                path = '/';
            }

            // Simple validation: path must start with / or *
            if (!path.startsWith('/') && !path.startsWith('*')) {
                showToast('Path must begin with "/" or "*"', 'error');
                return;
            }

            // Check if rule already exists
            const exists = customRules.some(r => r.ua === ua && r.action === action && r.path === path);
            if (exists) {
                showToast('This rule already exists', 'warning');
                return;
            }

            customRules.push({ ua, action, path });
            renderRulesList();
            generateRobotsTxt();
            showToast('Rule added successfully');
            inputPath.value = '/'; // Reset path input
        });

        // Copy buttons
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
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'robots.txt';
            a.click();
            URL.revokeObjectURL(url);
            showToast('robots.txt downloaded');
        });

        // Reset
        resetBtn.addEventListener('click', () => {
            selectPreset.value = 'allow-all';
            inputSitemap.value = '';
            selectDelay.value = '';
            selectUa.value = '*';
            selectAction.value = 'Disallow';
            inputPath.value = '/';
            customRules = [];
            checkPresetState();
            renderRulesList();
            generateRobotsTxt();
            showToast('Reset completed.');
        });

        // Render custom rules list
        function renderRulesList() {
            activeRulesList.innerHTML = '';
            if (customRules.length === 0) {
                activeRulesList.innerHTML = '<span class="text-muted text-xs">No custom rules added yet. Standard preset is active.</span>';
                return;
            }

            customRules.forEach((rule, idx) => {
                const item = document.createElement('div');
                item.className = 'flex justify-between items-center text-sm';
                item.style.padding = 'var(--spacing-1) 0';
                item.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
                item.innerHTML = `
                    <span><strong>User-agent: ${rule.ua}</strong> | ${rule.action}: ${rule.path}</span>
                    <button class="btn btn-ghost btn-xs text-danger remove-rule-btn" data-index="${idx}" style="padding: 2px 6px;">Delete</button>
                `;
                
                item.querySelector('.remove-rule-btn').addEventListener('click', (e) => {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    customRules.splice(index, 1);
                    renderRulesList();
                    generateRobotsTxt();
                    showToast('Rule removed');
                });
                
                activeRulesList.appendChild(item);
            });
        }

        // Generator Engine
        function generateRobotsTxt() {
            const preset = selectPreset.value;
            const sitemap = inputSitemap.value.trim();
            const delay = selectDelay.value;
            let output = '# Robots.txt generated via ToolNest\n';

            if (preset === 'allow-all') {
                output += 'User-agent: *\n';
                output += 'Disallow:\n';
                if (delay) {
                    output += `Crawl-delay: ${delay}\n`;
                }
            } else if (preset === 'disallow-all') {
                output += 'User-agent: *\n';
                output += 'Disallow: /\n';
            } else if (preset === 'custom') {
                if (customRules.length === 0) {
                    output += 'User-agent: *\n';
                    output += 'Disallow:\n';
                    if (delay) {
                        output += `Crawl-delay: ${delay}\n`;
                    }
                } else {
                    // Group rules by user-agent
                    const grouped = {};
                    customRules.forEach(rule => {
                        if (!grouped[rule.ua]) {
                            grouped[rule.ua] = [];
                        }
                        grouped[rule.ua].push(rule);
                    });

                    // Print groups
                    Object.keys(grouped).forEach(ua => {
                        output += `\nUser-agent: ${ua}\n`;
                        grouped[ua].forEach(r => {
                            output += `${r.action}: ${r.path}\n`;
                        });
                        // Add crawl delay to * agent if selected and not already specified
                        if (ua === '*' && delay) {
                            output += `Crawl-delay: ${delay}\n`;
                        }
                    });
                }
            }

            // Append sitemap
            if (sitemap) {
                output += `\nSitemap: ${sitemap}\n`;
            }

            textareaOutput.value = output.trim();
        }

        // Toast Helper
        function showToast(message, type = 'success') {
            if (window.TN && window.TN.toast) {
                window.TN.toast.show(message, type);
            } else {
                console.log(type + ": " + message);
            }
        }

        // Initial setup
        checkPresetState();
        generateRobotsTxt();
    });
})();

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        // UI Inputs
        const inputTitle = document.getElementById('og-title-input');
        const inputDesc = document.getElementById('og-desc-input');
        const inputUrl = document.getElementById('og-url-input');
        const inputImage = document.getElementById('og-image-input');
        const inputSitename = document.getElementById('og-sitename-input');
        const selectType = document.getElementById('og-type-input');
        const selectTwCard = document.getElementById('og-tw-card');
        const inputTwHandle = document.getElementById('og-tw-handle');

        // Tab buttons
        const btnFbTab = document.getElementById('preview-fb-btn');
        const btnTwTab = document.getElementById('preview-tw-btn');
        const btnHtmlTab = document.getElementById('preview-html-btn');

        // Preview panels
        const panelFb = document.getElementById('panel-fb-preview');
        const panelTw = document.getElementById('panel-tw-preview');
        const panelHtml = document.getElementById('panel-html-code');

        // Preview contents
        const fbImageEmpty = document.getElementById('fb-image-empty');
        const fbImageFill = document.getElementById('fb-image-fill');
        const fbDomain = document.getElementById('fb-domain');
        const fbTitle = document.getElementById('fb-title');
        const fbDesc = document.getElementById('fb-desc');

        const twImageEmpty = document.getElementById('tw-image-empty');
        const twImageFill = document.getElementById('tw-image-fill');
        const twDomain = document.getElementById('tw-domain');
        const twTitle = document.getElementById('tw-title');
        const twDesc = document.getElementById('tw-desc');

        const textareaOutput = document.getElementById('output-og');
        const btnDownload = document.getElementById('btn-download-og');
        const resetBtn = document.getElementById('tool-reset');

        // Input listeners
        const formInputs = [inputTitle, inputDesc, inputUrl, inputImage, inputSitename, selectType, selectTwCard, inputTwHandle];
        formInputs.forEach(input => {
            input.addEventListener('input', runUpdate);
            input.addEventListener('change', runUpdate);
        });

        // Tab Switchers
        btnFbTab.addEventListener('click', () => {
            setActiveTab(btnFbTab, panelFb);
        });

        btnTwTab.addEventListener('click', () => {
            setActiveTab(btnTwTab, panelTw);
        });

        btnHtmlTab.addEventListener('click', () => {
            setActiveTab(btnHtmlTab, panelHtml);
        });

        function setActiveTab(activeBtn, activePanel) {
            [btnFbTab, btnTwTab, btnHtmlTab].forEach(btn => {
                btn.classList.remove('active', 'btn-primary');
                btn.classList.add('btn-ghost');
            });
            activeBtn.classList.add('active', 'btn-primary');
            activeBtn.classList.remove('btn-ghost');

            panelFb.style.display = 'none';
            panelTw.style.display = 'none';
            panelHtml.style.display = 'none';
            
            // If HTML preview, make sure it is flex-grow or block
            activePanel.style.display = 'block';
        }

        // Copy setup
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
            a.download = 'open-graph-tags.txt';
            a.click();
            URL.revokeObjectURL(url);
            showToast('open-graph-tags.txt downloaded');
        });

        // Reset
        resetBtn.addEventListener('click', () => {
            inputTitle.value = '';
            inputDesc.value = '';
            inputUrl.value = '';
            inputImage.value = '';
            inputSitename.value = '';
            selectType.value = 'website';
            selectTwCard.value = 'summary_large_image';
            inputTwHandle.value = '';

            runUpdate();
            showToast('Reset completed.');
        });

        // Main update scheduler
        function runUpdate() {
            const titleVal = inputTitle.value.trim();
            const descVal = inputDesc.value.trim();
            const urlVal = inputUrl.value.trim();
            const imageVal = inputImage.value.trim();
            const sitenameVal = inputSitename.value.trim();
            const typeVal = selectType.value;
            const twCardVal = selectTwCard.value;
            const twHandleVal = inputTwHandle.value.trim();

            // 1. Domain parser
            let domain = 'YOURDOMAIN.COM';
            if (urlVal) {
                try {
                    const parsedUrl = new URL(urlVal);
                    domain = parsedUrl.hostname.toUpperCase();
                } catch (_) {
                    domain = 'INVALID-URL.COM';
                }
            }

            // 2. Facebook Preview Updates
            fbDomain.textContent = domain;
            fbTitle.textContent = titleVal || 'Title display placeholder';
            fbDesc.textContent = descVal || 'Description preview displays here when input is filled.';
            if (imageVal && isValidImageUrl(imageVal)) {
                fbImageEmpty.style.display = 'none';
                fbImageFill.style.display = 'block';
                fbImageFill.style.backgroundImage = `url('${imageVal}')`;
            } else {
                fbImageEmpty.style.display = 'flex';
                fbImageFill.style.display = 'none';
            }

            // 3. Twitter Preview Updates
            twDomain.textContent = domain.toLowerCase();
            twTitle.textContent = titleVal || 'Title display placeholder';
            twDesc.textContent = descVal || 'Description preview displays here when input is filled.';
            if (imageVal && isValidImageUrl(imageVal)) {
                twImageEmpty.style.display = 'none';
                twImageFill.style.display = 'block';
                twImageFill.style.backgroundImage = `url('${imageVal}')`;
            } else {
                twImageEmpty.style.display = 'flex';
                twImageFill.style.display = 'none';
            }

            // 4. HTML Meta Block Generator
            let output = '<!-- Open Graph Meta Tags (Facebook, LinkedIn, etc.) -->\n';
            output += `<meta property="og:type" content="${escapeHtml(typeVal)}">\n`;
            if (titleVal) output += `<meta property="og:title" content="${escapeHtml(titleVal)}">\n`;
            if (descVal) output += `<meta property="og:description" content="${escapeHtml(descVal)}">\n`;
            if (urlVal) output += `<meta property="og:url" content="${escapeHtml(urlVal)}">\n`;
            if (imageVal) output += `<meta property="og:image" content="${escapeHtml(imageVal)}">\n`;
            if (sitenameVal) output += `<meta property="og:site_name" content="${escapeHtml(sitenameVal)}">\n`;

            output += '\n<!-- Twitter Card Meta Tags -->\n';
            output += `<meta name="twitter:card" content="${escapeHtml(twCardVal)}">\n`;
            if (titleVal) output += `<meta name="twitter:title" content="${escapeHtml(titleVal)}">\n`;
            if (descVal) output += `<meta name="twitter:description" content="${escapeHtml(descVal)}">\n`;
            if (imageVal) output += `<meta name="twitter:image" content="${escapeHtml(imageVal)}">\n`;
            if (twHandleVal) {
                const cleanHandle = twHandleVal.startsWith('@') ? twHandleVal : '@' + twHandleVal;
                output += `<meta name="twitter:site" content="${escapeHtml(cleanHandle)}">\n`;
                output += `<meta name="twitter:creator" content="${escapeHtml(cleanHandle)}">\n`;
            }

            textareaOutput.value = output.trim();
        }

        // Helper Image URL validation
        function isValidImageUrl(string) {
            try {
                const url = new URL(string);
                return url.protocol === 'http:' || url.protocol === 'https:';
            } catch (_) {
                return false;
            }
        }

        // HTML escaping
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

        // Initial setup run
        runUpdate();
    });
})();

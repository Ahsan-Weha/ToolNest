(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const xmlInput = document.getElementById('xml-input');
        const xmlOutput = document.getElementById('xml-output');
        const indentSize = document.getElementById('indent-size');
        const outputLabel = document.getElementById('output-label');
        const validationBadge = document.getElementById('validation-badge');
        const xmlError = document.getElementById('xml-error');
        const xmlErrorMsg = document.getElementById('xml-error-msg');
        const btnCopy = document.getElementById('btn-copy-output');
        const btnDownload = document.getElementById('btn-download-xml');
        const resetBtn = document.getElementById('tool-reset');

        let currentMode = 'format';

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('btn-primary', 'active'); b.classList.add('btn-ghost'); });
                btn.classList.add('btn-primary', 'active'); btn.classList.remove('btn-ghost');
                currentMode = btn.getAttribute('data-tab');
                const labels = { format: 'Formatted XML', minify: 'Minified XML', validate: 'Validation Result' };
                outputLabel.textContent = labels[currentMode];
                process();
            });
        });

        xmlInput.addEventListener('input', process);
        indentSize.addEventListener('change', process);

        function getIndent() {
            const val = indentSize.value;
            return val === 'tab' ? '\t' : ' '.repeat(parseInt(val));
        }

        function parseXML(str) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(str, 'application/xml');
            const err = doc.querySelector('parsererror');
            if (err) throw new Error(err.textContent.replace(/\s+/g, ' ').trim().substring(0, 200));
            return doc;
        }

        function formatXML(str, indent) {
            // Serialize via DOMParser + XMLSerializer for clean pretty-print
            const doc = parseXML(str);
            return prettyPrint(doc.documentElement, 0, indent);
        }

        function prettyPrint(node, level, indent) {
            const pad = indent.repeat(level);
            let out = '';

            if (node.nodeType === Node.TEXT_NODE) {
                const txt = node.textContent.trim();
                return txt ? pad + txt + '\n' : '';
            }

            if (node.nodeType !== Node.ELEMENT_NODE) return '';

            // Build opening tag
            let tag = `<${node.tagName}`;
            for (const attr of node.attributes) {
                tag += ` ${attr.name}="${attr.value}"`;
            }

            const children = Array.from(node.childNodes);
            const hasElementChildren = children.some(c => c.nodeType === Node.ELEMENT_NODE);
            const textContent = children.filter(c => c.nodeType === Node.TEXT_NODE).map(c => c.textContent.trim()).join('').trim();

            if (children.length === 0) {
                out += `${pad}${tag}/>\n`;
            } else if (!hasElementChildren && textContent) {
                out += `${pad}${tag}>${textContent}</${node.tagName}>\n`;
            } else {
                out += `${pad}${tag}>\n`;
                children.forEach(child => {
                    out += prettyPrint(child, level + 1, indent);
                });
                out += `${pad}</${node.tagName}>\n`;
            }

            return out;
        }

        function minifyXML(str) {
            const doc = parseXML(str);
            return new XMLSerializer().serializeToString(doc)
                .replace(/>\s+</g, '><')
                .replace(/\s+/g, ' ')
                .trim();
        }

        function process() {
            const input = xmlInput.value.trim();
            if (!input) {
                xmlOutput.value = '';
                xmlError.style.display = 'none';
                validationBadge.style.display = 'none';
                return;
            }

            xmlError.style.display = 'none';
            validationBadge.style.display = 'none';

            try {
                if (currentMode === 'format') {
                    xmlOutput.value = formatXML(input, getIndent());
                } else if (currentMode === 'minify') {
                    xmlOutput.value = minifyXML(input);
                } else if (currentMode === 'validate') {
                    parseXML(input); // throws on error
                    xmlOutput.value = '✅ XML is valid!\n\nNo parsing errors found.';
                    validationBadge.style.display = '';
                    validationBadge.style.color = 'var(--success)';
                    validationBadge.textContent = '✓ Valid';
                }
            } catch (e) {
                xmlError.style.display = '';
                xmlErrorMsg.textContent = e.message;
                xmlOutput.value = '';
                if (currentMode === 'validate') {
                    validationBadge.style.display = '';
                    validationBadge.style.color = 'var(--danger)';
                    validationBadge.textContent = '✗ Invalid';
                    xmlOutput.value = '❌ XML is invalid!\n\n' + e.message;
                }
            }
        }

        btnCopy.addEventListener('click', () => {
            const text = xmlOutput.value;
            if (!text) { showToast('Nothing to copy', 'error'); return; }
            navigator.clipboard.writeText(text).then(() => showToast('Copied!')).catch(() => showToast('Copy failed', 'error'));
        });

        btnDownload.addEventListener('click', () => {
            const text = xmlOutput.value;
            if (!text) { showToast('Nothing to download', 'error'); return; }
            const blob = new Blob([text], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'output.xml'; a.click();
            URL.revokeObjectURL(url);
            showToast('Downloaded!');
        });

        resetBtn.addEventListener('click', () => {
            xmlInput.value = ''; xmlOutput.value = '';
            xmlError.style.display = 'none';
            validationBadge.style.display = 'none';
            showToast('Reset completed.');
        });

        function showToast(msg, type = 'success') {
            if (window.TN && window.TN.toast) window.TN.toast.show(msg, type);
        }
    });
})();

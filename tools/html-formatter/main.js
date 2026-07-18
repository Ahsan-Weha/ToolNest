(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const inputText = document.getElementById('input-text');
        const outputText = document.getElementById('output-text');
        const optIndent = document.getElementById('opt-indent');

        const alertValid = document.getElementById('alert-valid');
        const alertInvalid = document.getElementById('alert-invalid');
        const errorMessage = document.getElementById('error-message');

        const btnFormat = document.getElementById('btn-format');

        const loadSampleBtn = document.getElementById('load-sample-btn');
        const clearBtn = document.getElementById('clear-btn');
        const resetBtn = document.getElementById('reset-btn');
        const copyBtn = document.getElementById('copy-btn');
        const downloadBtn = document.getElementById('download-btn');

        const SAMPLE_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>My Sample Page</title><style>body { background-color: #000; color: #fff; } h1 { color: #00bcd4; }</style></head><body><!-- Main Header --><div><h1>Welcome to ToolNest</h1><p>Enjoy these private browser-based tool utilities.<br>No server uploads required.</p><input type="text" placeholder="Enter text..."><img src="logo.png" alt="Logo" /></div><script>console.log("Welcome to HTML Formatter!");</script></body></html>`;

        function getIndent(level, indentStr) {
            let str = '';
            for (let i = 0; i < level; i++) {
                str += indentStr;
            }
            return str;
        }

        function beautifyHTML(html, indentStr) {
            let result = '';
            let indentLevel = 0;
            // Split by tag boundaries
            const tokens = html.split(/(<[^>]+>)/g);
            const stack = [];
            const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
            
            let inScriptOrStyle = null; 
            const warnings = [];

            for (let i = 0; i < tokens.length; i++) {
                let token = tokens[i];
                if (token === undefined) continue;

                if (inScriptOrStyle) {
                    if (token.toLowerCase().trim() === `</${inScriptOrStyle}>`) {
                        indentLevel = Math.max(0, indentLevel - 1);
                        result += '\n' + getIndent(indentLevel, indentStr) + token.trim();
                        inScriptOrStyle = null;
                        stack.pop();
                    } else {
                        // Keep text content of script/style blocks
                        const lines = token.split('\n');
                        for (let j = 0; j < lines.length; j++) {
                            const trimmedLine = lines[j].trim();
                            if (trimmedLine) {
                                result += '\n' + getIndent(indentLevel, indentStr) + trimmedLine;
                            }
                        }
                    }
                    continue;
                }

                token = token.trim();
                if (!token) continue;

                if (token.startsWith('<!--')) {
                    result += '\n' + getIndent(indentLevel, indentStr) + token;
                } else if (token.startsWith('</')) {
                    const match = token.match(/<\/([a-zA-Z0-9:-]+)/);
                    const tagName = match ? match[1].toLowerCase() : '';
                    indentLevel = Math.max(0, indentLevel - 1);
                    result += '\n' + getIndent(indentLevel, indentStr) + token;
                    
                    if (stack.length > 0) {
                        const popped = stack.pop();
                        if (popped !== tagName) {
                            warnings.push(`Mismatched closing tag: expected </${popped}>, found </${tagName}>`);
                        }
                    } else {
                        warnings.push(`Unexpected closing tag </${tagName}> without open tag`);
                    }
                } else if (token.startsWith('<')) {
                    const isSelfClosing = token.endsWith('/>') || token.endsWith('/ >');
                    const match = token.match(/<([a-zA-Z0-9:-]+)/);
                    const tagName = match ? match[1].toLowerCase() : '';
                    
                    result += '\n' + getIndent(indentLevel, indentStr) + token;

                    // If it is a standard opening tag (and not void, self-closing or declaration)
                    if (!isSelfClosing && !voidTags.has(tagName) && !token.startsWith('<!') && !token.startsWith('<?')) {
                        stack.push(tagName);
                        indentLevel++;
                        if (tagName === 'script' || tagName === 'style') {
                            inScriptOrStyle = tagName;
                        }
                    }
                } else {
                    // Plain text
                    result += '\n' + getIndent(indentLevel, indentStr) + token;
                }
            }
            
            if (stack.length > 0) {
                warnings.push(`Unclosed tags remaining: ${stack.map(t => `<${t}>`).join(', ')}`);
            }

            return { formatted: result.trim(), warnings: warnings };
        }

        function processHTML() {
            const rawVal = inputText.value.trim();
            if (!rawVal) {
                alertValid.style.display = 'none';
                alertInvalid.style.display = 'none';
                outputText.value = '';
                return;
            }

            const indentVal = optIndent.value;
            let indentStr = '  ';
            if (indentVal === '4') {
                indentStr = '    ';
            } else if (indentVal === 'tabs') {
                indentStr = '\t';
            }

            const result = beautifyHTML(rawVal, indentStr);
            outputText.value = result.formatted;

            if (result.warnings.length > 0) {
                alertValid.style.display = 'none';
                alertInvalid.style.display = 'block';
                errorMessage.innerHTML = result.warnings.map(w => `• ${w}`).join('<br>');
            } else {
                alertValid.style.display = 'flex';
                alertInvalid.style.display = 'none';
            }
        }

        btnFormat.addEventListener('click', function () {
            processHTML();
            if (inputText.value.trim() && window.TN && window.TN.toast) {
                window.TN.toast.success('HTML formatted.');
            }
        });

        optIndent.addEventListener('change', processHTML);

        loadSampleBtn.addEventListener('click', function () {
            inputText.value = SAMPLE_HTML;
            processHTML();
            if (window.TN && window.TN.toast) {
                window.TN.toast.success('Sample loaded.');
            }
        });

        clearBtn.addEventListener('click', function () {
            inputText.value = '';
            outputText.value = '';
            alertValid.style.display = 'none';
            alertInvalid.style.display = 'none';
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Cleared.');
            }
        });

        resetBtn.addEventListener('click', function () {
            inputText.value = '';
            outputText.value = '';
            optIndent.value = '2';
            alertValid.style.display = 'none';
            alertInvalid.style.display = 'none';
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Settings reset.');
            }
        });

        copyBtn.addEventListener('click', function () {
            if (!outputText.value) {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Nothing to copy. Format HTML first.');
                }
                return;
            }
            navigator.clipboard.writeText(outputText.value).then(function () {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.success('Copied output to clipboard!');
                }
            }).catch(function () {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Copy failed.');
                }
            });
        });

        downloadBtn.addEventListener('click', function () {
            if (!outputText.value) {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Nothing to download. Format HTML first.');
                }
                return;
            }
            const blob = new Blob([outputText.value], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'index.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            if (window.TN && window.TN.toast) {
                window.TN.toast.success('Downloaded index.html');
            }
        });
    });
})();

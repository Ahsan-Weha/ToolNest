(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const inputArea = document.getElementById('yaml-input');
        const outputArea = document.getElementById('yaml-output');
        const inputLabel = document.getElementById('input-label');
        const outputLabel = document.getElementById('output-label');
        const jsonIndent = document.getElementById('json-indent');
        const convError = document.getElementById('conv-error');
        const convErrorMsg = document.getElementById('conv-error-msg');
        const btnCopy = document.getElementById('btn-copy-output');
        const btnDownload = document.getElementById('btn-download-output');
        const resetBtn = document.getElementById('tool-reset');

        let currentMode = 'yaml2json';

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('btn-primary', 'active'); b.classList.add('btn-ghost'); });
                btn.classList.add('btn-primary', 'active'); btn.classList.remove('btn-ghost');
                currentMode = btn.getAttribute('data-tab');
                if (currentMode === 'yaml2json') {
                    inputLabel.textContent = 'YAML Input';
                    outputLabel.textContent = 'JSON Output';
                    inputArea.placeholder = 'name: John Doe\nage: 30\nhobbies:\n  - coding\n  - reading';
                } else {
                    inputLabel.textContent = 'JSON Input';
                    outputLabel.textContent = 'YAML Output';
                    inputArea.placeholder = '{\n  "name": "John Doe",\n  "age": 30,\n  "hobbies": ["coding", "reading"]\n}';
                }
                inputArea.value = '';
                outputArea.value = '';
                convError.style.display = 'none';
            });
        });

        inputArea.addEventListener('input', process);
        jsonIndent.addEventListener('change', process);

        // ── Minimal YAML parser (covers most common YAML patterns) ──────────────
        function parseYAML(text) {
            const lines = text.split('\n');
            return parseBlock(lines, 0, -1).value;
        }

        function parseBlock(lines, startLine, parentIndent) {
            let i = startLine;
            let result = null;
            let isList = null;

            while (i < lines.length) {
                const raw = lines[i];
                const trimmed = raw.trimEnd();
                if (trimmed === '' || trimmed.trimStart().startsWith('#')) { i++; continue; }

                const indent = raw.length - raw.trimStart().length;
                if (indent <= parentIndent) break;

                const content = raw.trim();

                // List item
                if (content.startsWith('- ')) {
                    if (isList === null) isList = true;
                    if (!result) result = [];
                    const rest = content.slice(2).trim();
                    if (rest) {
                        result.push(parseScalar(rest));
                    } else {
                        const sub = parseBlock(lines, i + 1, indent);
                        result.push(sub.value);
                        i = sub.nextLine;
                        continue;
                    }
                } else if (content.includes(':')) {
                    // Key-value
                    if (isList === null) isList = false;
                    if (!result) result = {};
                    const colonIdx = content.indexOf(':');
                    const key = content.slice(0, colonIdx).trim().replace(/^["']|["']$/g, '');
                    const rest = content.slice(colonIdx + 1).trim();
                    if (rest) {
                        result[key] = parseScalar(rest);
                    } else {
                        // Check next line
                        let nextI = i + 1;
                        while (nextI < lines.length && (lines[nextI].trim() === '' || lines[nextI].trim().startsWith('#'))) nextI++;
                        if (nextI < lines.length) {
                            const nextIndent = lines[nextI].length - lines[nextI].trimStart().length;
                            if (nextIndent > indent) {
                                const sub = parseBlock(lines, nextI, indent);
                                result[key] = sub.value;
                                i = sub.nextLine;
                                continue;
                            }
                        }
                        result[key] = null;
                    }
                }
                i++;
            }

            return { value: result === null ? null : result, nextLine: i };
        }

        function parseScalar(str) {
            if (str === 'null' || str === '~') return null;
            if (str === 'true') return true;
            if (str === 'false') return false;
            if (!isNaN(str) && str !== '') return Number(str);
            // Strip quotes
            if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
                return str.slice(1, -1);
            }
            return str;
        }

        // ── Simple JSON → YAML serializer ─────────────────────────────────────
        function jsonToYAML(obj, level) {
            level = level || 0;
            const indent = '  '.repeat(level);
            if (obj === null) return 'null';
            if (typeof obj === 'boolean' || typeof obj === 'number') return String(obj);
            if (typeof obj === 'string') {
                // Quote if contains special chars
                if (/[:,#\[\]{}&*!|>'"@`]/.test(obj) || obj.trim() !== obj || obj === '' || obj === 'null' || obj === 'true' || obj === 'false' || !isNaN(obj)) {
                    return `"${obj.replace(/"/g, '\\"')}"`;
                }
                return obj;
            }
            if (Array.isArray(obj)) {
                if (obj.length === 0) return '[]';
                return '\n' + obj.map(item => {
                    const val = jsonToYAML(item, level + 1);
                    return `${indent}- ${val.startsWith('\n') ? val.trimStart() : val}`;
                }).join('\n');
            }
            if (typeof obj === 'object') {
                const keys = Object.keys(obj);
                if (keys.length === 0) return '{}';
                return (level > 0 ? '\n' : '') + keys.map(k => {
                    const val = jsonToYAML(obj[k], level + 1);
                    const valStr = val.startsWith('\n') ? val : ` ${val}`;
                    return `${indent}${k}:${valStr}`;
                }).join('\n');
            }
            return String(obj);
        }

        function process() {
            const input = inputArea.value.trim();
            convError.style.display = 'none';
            if (!input) { outputArea.value = ''; return; }

            const indent = parseInt(jsonIndent.value);

            try {
                if (currentMode === 'yaml2json') {
                    const obj = parseYAML(input);
                    outputArea.value = JSON.stringify(obj, null, indent);
                } else {
                    const obj = JSON.parse(input);
                    const yaml = jsonToYAML(obj, 0);
                    outputArea.value = yaml.startsWith('\n') ? yaml.slice(1) : yaml;
                }
            } catch (e) {
                convError.style.display = '';
                convErrorMsg.textContent = e.message;
                outputArea.value = '';
            }
        }

        btnCopy.addEventListener('click', () => {
            const text = outputArea.value;
            if (!text) { showToast('Nothing to copy', 'error'); return; }
            navigator.clipboard.writeText(text).then(() => showToast('Copied!')).catch(() => showToast('Copy failed', 'error'));
        });

        btnDownload.addEventListener('click', () => {
            const text = outputArea.value;
            if (!text) { showToast('Nothing to download', 'error'); return; }
            const ext = currentMode === 'yaml2json' ? '.json' : '.yaml';
            const type = currentMode === 'yaml2json' ? 'application/json' : 'text/yaml';
            const blob = new Blob([text], { type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `output${ext}`; a.click();
            URL.revokeObjectURL(url);
            showToast('Downloaded!');
        });

        resetBtn.addEventListener('click', () => {
            inputArea.value = ''; outputArea.value = '';
            convError.style.display = 'none';
            showToast('Reset completed.');
        });

        function showToast(msg, type = 'success') {
            if (window.TN && window.TN.toast) window.TN.toast.show(msg, type);
        }
    });
})();

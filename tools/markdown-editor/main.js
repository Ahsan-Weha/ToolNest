(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const editor = document.getElementById('md-editor');
        const preview = document.getElementById('md-preview');
        const wordCountEl = document.getElementById('word-count');
        const btnCopyHTML = document.getElementById('btn-copy-html');
        const btnDownloadHTML = document.getElementById('btn-download-html');
        const btnDownloadMD = document.getElementById('btn-download-md');
        const resetBtn = document.getElementById('tool-reset');
        const btnTogglePreview = document.getElementById('btn-toggle-preview');
        const toolbarBtns = document.querySelectorAll('.md-tool-btn');

        let previewVisible = true;

        // Toolbar actions
        const snippets = {
            bold: ['**', '**', 'bold text'],
            italic: ['_', '_', 'italic text'],
            heading: ['# ', '', 'Heading'],
            link: ['[', '](https://example.com)', 'link text'],
            code: ['`', '`', 'code'],
            ul: ['- ', '', 'List item'],
            ol: ['1. ', '', 'List item'],
            blockquote: ['> ', '', 'Quote text'],
            hr: ['\n\n---\n\n', '', ''],
        };

        toolbarBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                const snip = snippets[action];
                if (!snip) return;
                const [before, after, placeholder] = snip;
                const start = editor.selectionStart;
                const end = editor.selectionEnd;
                const selected = editor.value.substring(start, end) || placeholder;
                const replacement = before + selected + after;
                editor.value = editor.value.substring(0, start) + replacement + editor.value.substring(end);
                const newPos = start + before.length + selected.length + after.length;
                editor.setSelectionRange(newPos, newPos);
                editor.focus();
                renderPreview();
            });
        });

        btnTogglePreview.addEventListener('click', () => {
            previewVisible = !previewVisible;
            const previewPane = preview.parentElement;
            previewPane.style.display = previewVisible ? '' : 'none';
            btnTogglePreview.textContent = previewVisible ? 'Toggle Preview' : 'Show Preview';
        });

        editor.addEventListener('input', renderPreview);

        // Keyboard shortcuts
        editor.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); simulateToolbar('bold'); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); simulateToolbar('italic'); }
        });

        function simulateToolbar(action) {
            document.querySelector(`.md-tool-btn[data-action="${action}"]`).click();
        }

        function renderPreview() {
            const md = editor.value;
            preview.innerHTML = parseMarkdown(md);
            // Word count
            const words = md.trim().split(/\s+/).filter(w => w.length > 0);
            wordCountEl.textContent = `${words.length} word${words.length !== 1 ? 's' : ''}`;
        }

        function parseMarkdown(md) {
            let html = md
                // Escape for security first, but we need to render HTML later so we process line-by-line
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            // Block elements — process line by line
            const lines = html.split('\n');
            const result = [];
            let inUL = false, inOL = false, inCode = false, inBlockquote = false;

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];

                // Code blocks
                if (line.startsWith('```') || line.startsWith('&#x60;&#x60;&#x60;')) {
                    inCode = !inCode;
                    result.push(inCode ? '<pre><code>' : '</code></pre>');
                    continue;
                }
                if (inCode) { result.push(line); continue; }

                // Headings
                if (/^######\s/.test(line)) { result.push(`<h6>${line.replace(/^######\s/, '')}</h6>`); continue; }
                if (/^#####\s/.test(line)) { result.push(`<h5>${line.replace(/^#####\s/, '')}</h5>`); continue; }
                if (/^####\s/.test(line)) { result.push(`<h4>${line.replace(/^####\s/, '')}</h4>`); continue; }
                if (/^###\s/.test(line)) { result.push(`<h3>${line.replace(/^###\s/, '')}</h3>`); continue; }
                if (/^##\s/.test(line)) { result.push(`<h2>${line.replace(/^##\s/, '')}</h2>`); continue; }
                if (/^#\s/.test(line)) { result.push(`<h1>${line.replace(/^#\s/, '')}</h1>`); continue; }

                // HR
                if (/^---+$|^\*\*\*+$|^___+$/.test(line.trim())) { result.push('<hr>'); continue; }

                // Blockquote
                if (line.startsWith('&gt; ') || line.startsWith('&gt;')) {
                    const text = line.replace(/^&gt;\s?/, '');
                    result.push(`<blockquote style="border-left:4px solid var(--primary);padding-left:var(--spacing-2);color:var(--text-muted);margin:var(--spacing-1) 0;">${applyInline(text)}</blockquote>`);
                    continue;
                }

                // UL
                if (/^[-*+]\s/.test(line)) {
                    if (!inUL) { result.push('<ul>'); inUL = true; }
                    result.push(`<li>${applyInline(line.replace(/^[-*+]\s/, ''))}</li>`);
                    continue;
                } else if (inUL) { result.push('</ul>'); inUL = false; }

                // OL
                if (/^\d+\.\s/.test(line)) {
                    if (!inOL) { result.push('<ol>'); inOL = true; }
                    result.push(`<li>${applyInline(line.replace(/^\d+\.\s/, ''))}</li>`);
                    continue;
                } else if (inOL) { result.push('</ol>'); inOL = false; }

                // Blank line → paragraph break
                if (line.trim() === '') { result.push('<br>'); continue; }

                result.push(`<p>${applyInline(line)}</p>`);
            }

            if (inUL) result.push('</ul>');
            if (inOL) result.push('</ol>');

            return result.join('\n');
        }

        function applyInline(text) {
            return text
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/__(.+?)__/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/_(.+?)_/g, '<em>$1</em>')
                .replace(/`(.+?)`/g, '<code style="background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:3px;font-family:monospace;">$1</code>')
                .replace(/~~(.+?)~~/g, '<del>$1</del>')
                .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--primary);">$1</a>')
                .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" style="max-width:100%;">');
        }

        btnCopyHTML.addEventListener('click', () => {
            const html = preview.innerHTML;
            if (!html) { showToast('Nothing to copy', 'error'); return; }
            navigator.clipboard.writeText(html).then(() => showToast('HTML copied!')).catch(() => showToast('Copy failed', 'error'));
        });

        btnDownloadHTML.addEventListener('click', () => {
            const html = `<!DOCTYPE html>\n<html>\n<body>\n${preview.innerHTML}\n</body>\n</html>`;
            download(html, 'document.html', 'text/html');
        });

        btnDownloadMD.addEventListener('click', () => {
            download(editor.value, 'document.md', 'text/markdown');
        });

        function download(content, filename, type) {
            if (!content) { showToast('Nothing to download', 'error'); return; }
            const blob = new Blob([content], { type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = filename; a.click();
            URL.revokeObjectURL(url);
            showToast(`${filename} downloaded!`);
        }

        resetBtn.addEventListener('click', () => {
            editor.value = '';
            preview.innerHTML = '';
            wordCountEl.textContent = '0 words';
            showToast('Reset completed.');
        });

        function showToast(msg, type = 'success') {
            if (window.TN && window.TN.toast) window.TN.toast.show(msg, type);
        }
    });
})();

/**
 * ToolNest — Protect PDF Tool
 * Adds user password encryption to a PDF using pdf-lib.
 * Note: pdf-lib supports user password (open restriction) via its encrypt API.
 */
(function () {
    'use strict';

    let currentFile = null;

    PDFUtils.wireDropzone('protect-dropzone', 'protect-input', handleFiles);
    document.getElementById('protect-clear').addEventListener('click', reset);
    document.getElementById('protect-btn').addEventListener('click', doProtect);

    // Toggle password visibility
    document.getElementById('toggle-pass-1').addEventListener('click', () => toggleVis('protect-password'));
    document.getElementById('toggle-pass-2').addEventListener('click', () => toggleVis('protect-password-confirm'));
    function toggleVis(id) {
        const inp = document.getElementById(id);
        inp.type = inp.type === 'password' ? 'text' : 'password';
    }

    async function handleFiles(fl) {
        const f = fl[0];
        const err = PDFUtils.validatePDF(f, 100);
        if (err) { TN.toast.error(err); return; }

        currentFile = f;
        document.getElementById('protect-dropzone').style.display = 'none';
        document.getElementById('protect-file-info').style.display = '';
        document.getElementById('protect-filename').textContent = f.name;
        document.getElementById('protect-filesize').textContent = PDFUtils.formatBytes(f.size);
        document.getElementById('protect-btn').disabled = false;
        document.getElementById('protect-success').style.display = 'none';
    }

    function reset() {
        currentFile = null;
        document.getElementById('protect-dropzone').style.display = '';
        document.getElementById('protect-file-info').style.display = 'none';
        document.getElementById('protect-btn').disabled = true;
        document.getElementById('protect-success').style.display = 'none';
        document.getElementById('protect-password').value = '';
        document.getElementById('protect-password-confirm').value = '';
        PDFUtils.hideProgress('progress-container');
        TN.toast.info('Cleared.');
    }

    async function doProtect() {
        if (!currentFile) return;

        const pass  = document.getElementById('protect-password').value;
        const pass2 = document.getElementById('protect-password-confirm').value;

        if (!pass || pass.length < 4) {
            TN.toast.warning('Password must be at least 4 characters.');
            return;
        }
        if (pass !== pass2) {
            TN.toast.warning('Passwords do not match.');
            return;
        }

        document.getElementById('protect-btn').disabled = true;
        PDFUtils.showLoader('tool-loader');
        PDFUtils.showProgress('progress-container', 'progress-bar', 10);
        document.getElementById('protect-success').style.display = 'none';

        try {
            const buf = await PDFUtils.readFileAsBuffer(currentFile);
            PDFUtils.showProgress('progress-container', 'progress-bar', 50);

            // Use the PDFEncryptLite library to encrypt the PDF bytes with password
            const bytes = await PDFEncryptLite.encryptPDF(new Uint8Array(buf), pass);

            PDFUtils.showProgress('progress-container', 'progress-bar', 100);
            PDFUtils.downloadBytes(bytes, currentFile.name.replace(/\.pdf$/i, '_protected.pdf'));
            document.getElementById('protect-success').style.display = 'flex';
            TN.toast.success('PDF protected!');
        } catch(e) {
            console.error('[protect-pdf]', e);
            TN.toast.error('Protection failed: ' + (e.message || 'Unknown error'));
        } finally {
            PDFUtils.hideLoader('tool-loader');
            document.getElementById('protect-btn').disabled = false;
        }
    }

    document.querySelectorAll('.faq-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const acc = btn.closest('.faq-accordion');
            const isOpen = acc.classList.contains('active');
            document.querySelectorAll('.faq-accordion').forEach(a => a.classList.remove('active'));
            if (!isOpen) acc.classList.add('active');
        });
    });
})();

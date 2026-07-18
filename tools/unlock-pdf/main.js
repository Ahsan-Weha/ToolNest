/**
 * ToolNest — Unlock PDF Tool
 * Client-side RC4 decryption using PDFEncryptLite.decryptPDF.
 * Zero backend — all processing happens in the browser.
 */
(function () {
    'use strict';

    let currentFile = null;

    PDFUtils.wireDropzone('unlock-dropzone', 'unlock-input', handleFiles);
    document.getElementById('unlock-clear').addEventListener('click', reset);
    document.getElementById('unlock-btn').addEventListener('click', doUnlock);

    // Collapse/expand FAQs
    document.querySelectorAll('.faq-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const acc = btn.closest('.faq-accordion');
            const isOpen = acc.classList.contains('active');
            document.querySelectorAll('.faq-accordion').forEach(a => a.classList.remove('active'));
            if (!isOpen) acc.classList.add('active');
        });
    });

    async function handleFiles(fl) {
        const f = fl[0];
        const err = PDFUtils.validatePDF(f, 100);
        if (err) { TN.toast.error(err); return; }

        currentFile = f;
        document.getElementById('unlock-dropzone').style.display = 'none';
        document.getElementById('unlock-file-info').style.display = '';
        document.getElementById('unlock-filename').textContent = f.name;
        document.getElementById('unlock-filesize').textContent = PDFUtils.formatBytes(f.size);
        document.getElementById('unlock-btn').disabled = false;
        document.getElementById('unlock-success').style.display = 'none';
        document.getElementById('unlock-error').style.display = 'none';
    }

    function reset() {
        currentFile = null;
        document.getElementById('unlock-dropzone').style.display = '';
        document.getElementById('unlock-file-info').style.display = 'none';
        document.getElementById('unlock-btn').disabled = true;
        document.getElementById('unlock-success').style.display = 'none';
        document.getElementById('unlock-error').style.display = 'none';
        document.getElementById('unlock-password').value = '';
        PDFUtils.hideProgress('progress-container');
        TN.toast.info('Cleared.');
    }

    async function doUnlock() {
        if (!currentFile) return;

        const password = document.getElementById('unlock-password').value;

        document.getElementById('unlock-btn').disabled = true;
        PDFUtils.showLoader('tool-loader');
        PDFUtils.showProgress('progress-container', 'progress-bar', 10);
        document.getElementById('unlock-success').style.display = 'none';
        document.getElementById('unlock-error').style.display = 'none';

        try {
            const buf = await PDFUtils.readFileAsBuffer(currentFile);
            PDFUtils.showProgress('progress-container', 'progress-bar', 40);

            // Use PDFEncryptLite.decryptPDF (RC4 symmetric — fully client-side)
            let decryptedBytes;
            try {
                decryptedBytes = await PDFEncryptLite.decryptPDF(new Uint8Array(buf), password);
            } catch (e) {
                const msg = e.message || '';
                if (msg.startsWith('PasswordError:')) {
                    document.getElementById('unlock-error').style.display = 'flex';
                    TN.toast.error('Incorrect password — please try again.');
                    return;
                }
                if (msg.includes('Unsupported PDF encryption')) {
                    document.getElementById('unlock-error').style.display = 'flex';
                    TN.toast.error(msg);
                    return;
                }
                throw e;
            }

            PDFUtils.showProgress('progress-container', 'progress-bar', 100);
            PDFUtils.downloadBytes(
                decryptedBytes,
                currentFile.name.replace(/\.pdf$/i, '_unlocked.pdf')
            );
            document.getElementById('unlock-success').style.display = 'flex';
            TN.toast.success('PDF unlocked successfully!');

        } catch (e) {
            console.error('[unlock-pdf]', e);
            TN.toast.error('Unlock failed: ' + (e.message || 'Unknown error'));
        } finally {
            PDFUtils.hideLoader('tool-loader');
            document.getElementById('unlock-btn').disabled = false;
        }
    }
})();

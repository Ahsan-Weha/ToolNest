(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const tabs = document.querySelectorAll('.hash-tab');
        const panels = document.querySelectorAll('.tab-panel');
        const textInput = document.getElementById('text-input');
        const fileInput = document.getElementById('file-input');
        const dropzone = document.getElementById('file-dropzone');
        const selectedFileBar = document.getElementById('selected-file-bar');
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');
        const btnRemoveFile = document.getElementById('btn-remove-file');
        const resetBtn = document.getElementById('reset-btn');
        const hashingLoader = document.getElementById('hashing-loader');

        const hashHex = document.getElementById('hash-hex');
        const hashBase64 = document.getElementById('hash-base64');
        const copyButtons = document.querySelectorAll('.hash-copy-btn');

        let activeTab = 'text';

        // Tab Switching
        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                this.classList.add('active');
                activeTab = this.dataset.tab;
                document.getElementById('tab-' + activeTab).classList.add('active');
                resetAll();
            });
        });

        // ── Hashing Helper Functions ──
        async function calculateSHA256(arrayBuffer) {
            const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            const base64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
            return { hex, base64 };
        }

        function formatBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // Live update for text hashing
        textInput.addEventListener('input', async function () {
            const text = textInput.value;
            // Empty string hash is standard constant values
            if (text === '') {
                hashHex.textContent = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
                hashBase64.textContent = '47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=';
                return;
            }

            try {
                const encoder = new TextEncoder();
                const buffer = encoder.encode(text);
                const { hex, base64 } = await calculateSHA256(buffer);
                hashHex.textContent = hex;
                hashBase64.textContent = base64;
            } catch (e) {
                hashHex.textContent = 'Error';
                hashBase64.textContent = 'Error';
            }
        });

        // ── Drag and Drop Functions ──
        if (dropzone) {
            dropzone.addEventListener('click', () => fileInput.click());

            fileInput.addEventListener('change', () => {
                if (fileInput.files.length > 0) {
                    processFile(fileInput.files[0]);
                }
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                dropzone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.classList.add('dragover');
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropzone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.classList.remove('dragover');
                }, false);
            });

            dropzone.addEventListener('drop', (e) => {
                const dt = e.dataTransfer;
                const files = dt.files;
                if (files.length > 0) {
                    processFile(files[0]);
                }
            });
        }

        async function processFile(file) {
            dropzone.style.display = 'none';
            selectedFileBar.style.display = 'flex';
            fileName.textContent = file.name;
            fileSize.textContent = formatBytes(file.size);
            hashingLoader.style.display = 'flex';

            hashHex.textContent = 'Calculating...';
            hashBase64.textContent = 'Calculating...';

            const reader = new FileReader();
            reader.onload = async function (e) {
                const buffer = e.target.result;
                try {
                    const { hex, base64 } = await calculateSHA256(buffer);
                    hashHex.textContent = hex;
                    hashBase64.textContent = base64;
                } catch (err) {
                    hashHex.textContent = 'Calculation Error';
                    hashBase64.textContent = 'Calculation Error';
                } finally {
                    hashingLoader.style.display = 'none';
                }
            };
            reader.onerror = function () {
                hashHex.textContent = 'Read Error';
                hashBase64.textContent = 'Read Error';
                hashingLoader.style.display = 'none';
            };
            reader.readAsArrayBuffer(file);
        }

        btnRemoveFile.addEventListener('click', function () {
            resetFileSelector();
        });

        function resetFileSelector() {
            fileInput.value = '';
            dropzone.style.display = 'flex';
            selectedFileBar.style.display = 'none';
            hashHex.textContent = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
            hashBase64.textContent = '47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=';
            hashingLoader.style.display = 'none';
        }

        function resetAll() {
            textInput.value = '';
            resetFileSelector();
        }

        resetBtn.addEventListener('click', resetAll);

        // Copy functionality
        copyButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                const targetId = this.dataset.copyTarget;
                const text = document.getElementById(targetId).textContent;
                if (text && text !== 'Calculating...' && text !== 'Error') {
                    navigator.clipboard.writeText(text).then(() => {
                        if (typeof TN !== 'undefined' && TN.toast) {
                            TN.toast.success('Copied hash representation to clipboard!');
                        }
                    });
                }
            });
        });
    });
})();

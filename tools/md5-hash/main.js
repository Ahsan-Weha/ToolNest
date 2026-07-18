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

        // ── Pure JS MD5 Implementation ──
        function md5(bytes) {
            let words = [];
            let i;
            let byteLength = bytes.length;
            
            for (i = 0; i < byteLength; i++) {
                words[i >> 2] |= (bytes[i] & 0xFF) << ((i % 4) * 8);
            }
            
            // Padding
            words[byteLength >> 2] |= 0x80 << ((byteLength % 4) * 8);
            let wlen = ((byteLength + 8) >> 6) + 1;
            words[wlen * 16 - 2] = byteLength * 8; // length in bits (low 32)
            words[wlen * 16 - 1] = 0; // length in bits (high 32)
            
            let a = 1732584193;
            let b = -271733879;
            let c = -1732584194;
            let d = 271733878;
            
            let S11 = 7, S12 = 12, S13 = 17, S14 = 22;
            let S21 = 5, S22 = 9,  S23 = 14, S24 = 20;
            let S31 = 4, S32 = 11, S33 = 16, S34 = 23;
            let S41 = 6, S42 = 10, S43 = 15, S44 = 21;
            
            function F(x, y, z) { return (x & y) | (~x & z); }
            function G(x, y, z) { return (x & z) | (y & ~z); }
            function H(x, y, z) { return x ^ y ^ z; }
            function I(x, y, z) { return y ^ (x | ~z); }
            
            function rotl(num, cnt) {
                return (num << cnt) | (num >>> (32 - cnt));
            }
            
            function FF(a, b, c, d, x, s, ac) {
                a = (a + F(b, c, d) + x + ac) | 0;
                return (rotl(a, s) + b) | 0;
            }
            
            function GG(a, b, c, d, x, s, ac) {
                a = (a + G(b, c, d) + x + ac) | 0;
                return (rotl(a, s) + b) | 0;
            }
            
            function HH(a, b, c, d, x, s, ac) {
                a = (a + H(b, c, d) + x + ac) | 0;
                return (rotl(a, s) + b) | 0;
            }
            
            function II(a, b, c, d, x, s, ac) {
                a = (a + I(b, c, d) + x + ac) | 0;
                return (rotl(a, s) + b) | 0;
            }
            
            for (i = 0; i < words.length; i += 16) {
                let aa = a, bb = b, cc = c, dd = d;
                
                a = FF(a, b, c, d, words[i+0], S11, -680876936);
                d = FF(d, a, b, c, words[i+1], S12, -389564586);
                c = FF(c, d, a, b, words[i+2], S13, 606105819);
                b = FF(b, c, d, a, words[i+3], S14, -1044525330);
                a = FF(a, b, c, d, words[i+4], S11, -176418897);
                d = FF(d, a, b, c, words[i+5], S12, 1200080426);
                c = FF(c, d, a, b, words[i+6], S13, -1473231341);
                b = FF(b, c, d, a, words[i+7], S14, -45705983);
                a = FF(a, b, c, d, words[i+8], S11, 1770035416);
                d = FF(d, a, b, c, words[i+9], S12, -1958414417);
                c = FF(c, d, a, b, words[i+10], S13, -42063);
                b = FF(b, c, d, a, words[i+11], S14, -1990404162);
                a = FF(a, b, c, d, words[i+12], S11, 1804603682);
                d = FF(d, a, b, c, words[i+13], S12, -40341101);
                c = FF(c, d, a, b, words[i+14], S13, -1502002290);
                b = FF(b, c, d, a, words[i+15], S14, 1236535329);
                
                a = GG(a, b, c, d, words[i+1], S21, -165796510);
                d = GG(d, a, b, c, words[i+6], S22, -1069501632);
                c = GG(c, d, a, b, words[i+11], S23, 643717713);
                b = GG(b, c, d, a, words[i+0], S24, -373897302);
                a = GG(a, b, c, d, words[i+5], S21, -701558691);
                d = GG(d, a, b, c, words[i+10], S22, 38016083);
                c = GG(c, d, a, b, words[i+15], S23, -660478335);
                b = GG(b, c, d, a, words[i+4], S24, -405537848);
                a = GG(a, b, c, d, words[i+9], S21, 568446438);
                d = GG(d, a, b, c, words[i+14], S22, -1019803690);
                c = GG(c, d, a, b, words[i+3], S23, -187363961);
                b = GG(b, c, d, a, words[i+8], S24, 1163531501);
                a = GG(a, b, c, d, words[i+13], S21, -1444681467);
                d = GG(d, a, b, c, words[i+2], S22, -51403784);
                c = GG(c, d, a, b, words[i+7], S23, 1735328473);
                b = GG(b, c, d, a, words[i+12], S24, -1926607734);
                
                a = HH(a, b, c, d, words[i+5], S31, -378558);
                d = HH(d, a, b, c, words[i+8], S32, -2022574463);
                c = HH(c, d, a, b, words[i+11], S33, 1839030562);
                b = HH(b, c, d, a, words[i+14], S34, -35309556);
                a = HH(a, b, c, d, words[i+1], S31, -1530992060);
                d = HH(d, a, b, c, words[i+4], S32, 1272893353);
                c = HH(c, d, a, b, words[i+7], S33, -155497632);
                b = HH(b, c, d, a, words[i+10], S34, -1094730640);
                a = HH(a, b, c, d, words[i+13], S31, 681279174);
                d = HH(d, a, b, c, words[i+0], S32, -358537222);
                c = HH(c, d, a, b, words[i+3], S33, -722521979);
                b = HH(b, c, d, a, words[i+6], S34, 76029189);
                a = HH(a, b, c, d, words[i+9], S31, -640364487);
                d = HH(d, a, b, c, words[i+12], S32, -421815835);
                c = HH(c, d, a, b, words[i+15], S33, 530742520);
                b = HH(b, c, d, a, words[i+2], S34, -995338651);
                
                a = II(a, b, c, d, words[i+0], S41, -198630844);
                d = II(d, a, b, c, words[i+7], S42, 1126891415);
                c = II(c, d, a, b, words[i+14], S43, -1416354905);
                b = II(b, c, d, a, words[i+5], S44, -57434055);
                a = II(a, b, c, d, words[i+12], S41, 1700485571);
                d = II(d, a, b, c, words[i+3], S42, -1894986606);
                c = II(c, d, a, b, words[i+10], S43, -1051523);
                b = II(b, c, d, a, words[i+1], S44, -2054922799);
                a = II(a, b, c, d, words[i+8], S41, 1873313359);
                d = II(d, a, b, c, words[i+15], S42, -30611744);
                c = II(c, d, a, b, words[i+6], S43, -1560198380);
                b = II(b, c, d, a, words[i+13], S44, 1309151649);
                a = II(a, b, c, d, words[i+4], S41, -145523070);
                d = II(d, a, b, c, words[i+11], S42, -1120210379);
                c = II(c, d, a, b, words[i+2], S43, 718535338);
                b = II(b, c, d, a, words[i+9], S44, -343485551);
                
                a = (a + aa) | 0;
                b = (b + bb) | 0;
                c = (c + cc) | 0;
                d = (d + dd) | 0;
            }
            
            // Format to hex string
            let hexStr = '';
            let rawBytes = new Uint8Array(16);
            let finalWords = [a, b, c, d];
            for (i = 0; i < 16; i++) {
                let byteVal = (finalWords[i >> 2] >>> ((i % 4) * 8)) & 0xFF;
                rawBytes[i] = byteVal;
                hexStr += byteVal.toString(16).padStart(2, '0');
            }
            
            // Base64 encoding
            let base64Str = btoa(String.fromCharCode.apply(null, rawBytes));
            
            return { hex: hexStr, base64: base64Str };
        }

        function formatBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // Live update for text hashing
        textInput.addEventListener('input', function () {
            const text = textInput.value;
            // Empty string MD5 constant
            if (text === '') {
                hashHex.textContent = 'd41d8cd98f00b204e9800998ecf8427e';
                hashBase64.textContent = '1B2M2Y8AsgTpgAmY7PhCfg==';
                return;
            }

            try {
                const encoder = new TextEncoder();
                const buffer = encoder.encode(text);
                const { hex, base64 } = md5(buffer);
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
            reader.onload = function (e) {
                const buffer = e.target.result;
                try {
                    const bytes = new Uint8Array(buffer);
                    const { hex, base64 } = md5(bytes);
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
            hashHex.textContent = 'd41d8cd98f00b204e9800998ecf8427e';
            hashBase64.textContent = '1B2M2Y8AsgTpgAmY7PhCfg==';
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

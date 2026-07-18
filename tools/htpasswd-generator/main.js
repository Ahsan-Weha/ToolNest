(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const usernameInput = document.getElementById('ht-username');
        const passwordInput = document.getElementById('ht-password');
        const algoSelect = document.getElementById('ht-algorithm');
        const btnGenerate = document.getElementById('btn-generate');
        const resetBtn = document.getElementById('reset-btn');
        const errorMsg = document.getElementById('error-msg');
        const resultsSection = document.getElementById('results-section');
        const htOutput = document.getElementById('ht-output');
        const btnCopy = document.getElementById('btn-copy');

        // ── Helper: Pure JS MD5 ──
        function md5(bytes) {
            let words = [];
            let i;
            let byteLength = bytes.length;
            for (i = 0; i < byteLength; i++) {
                words[i >> 2] |= (bytes[i] & 0xFF) << ((i % 4) * 8);
            }
            words[byteLength >> 2] |= 0x80 << ((byteLength % 4) * 8);
            let wlen = ((byteLength + 8) >> 6) + 1;
            words[wlen * 16 - 2] = byteLength * 8;
            words[wlen * 16 - 1] = 0;
            
            let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
            let S11 = 7, S12 = 12, S13 = 17, S14 = 22;
            let S21 = 5, S22 = 9,  S23 = 14, S24 = 20;
            let S31 = 4, S32 = 11, S33 = 16, S34 = 23;
            let S41 = 6, S42 = 10, S43 = 15, S44 = 21;
            
            function F(x, y, z) { return (x & y) | (~x & z); }
            function G(x, y, z) { return (x & z) | (y & ~z); }
            function H(x, y, z) { return x ^ y ^ z; }
            function I(x, y, z) { return y ^ (x | ~z); }
            function rotl(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)); }
            
            function FF(a, b, c, d, x, s, ac) { return (rotl((a + F(b, c, d) + x + ac) | 0, s) + b) | 0; }
            function GG(a, b, c, d, x, s, ac) { return (rotl((a + G(b, c, d) + x + ac) | 0, s) + b) | 0; }
            function HH(a, b, c, d, x, s, ac) { return (rotl((a + H(b, c, d) + x + ac) | 0, s) + b) | 0; }
            function II(a, b, c, d, x, s, ac) { return (rotl((a + I(b, c, d) + x + ac) | 0, s) + b) | 0; }
            
            for (i = 0; i < words.length; i += 16) {
                let aa = a, bb = b, cc = c, dd = d;
                a = FF(a, b, c, d, words[i+0], S11, -680876936); d = FF(d, a, b, c, words[i+1], S12, -389564586); c = FF(c, d, a, b, words[i+2], S13, 606105819); b = FF(b, c, d, a, words[i+3], S14, -1044525330);
                a = FF(a, b, c, d, words[i+4], S11, -176418897); d = FF(d, a, b, c, words[i+5], S12, 1200080426); c = FF(c, d, a, b, words[i+6], S13, -1473231341); b = FF(b, c, d, a, words[i+7], S14, -45705983);
                a = FF(a, b, c, d, words[i+8], S11, 1770035416); d = FF(d, a, b, c, words[i+9], S12, -1958414417); c = FF(c, d, a, b, words[i+10], S13, -42063); b = FF(b, c, d, a, words[i+11], S14, -1990404162);
                a = FF(a, b, c, d, words[i+12], S11, 1804603682); d = FF(d, a, b, c, words[i+13], S12, -40341101); c = FF(c, d, a, b, words[i+14], S13, -1502002290); b = FF(b, c, d, a, words[i+15], S14, 1236535329);
                
                a = GG(a, b, c, d, words[i+1], S21, -165796510); d = GG(d, a, b, c, words[i+6], S22, -1069501632); c = GG(c, d, a, b, words[i+11], S23, 643717713); b = GG(b, c, d, a, words[i+0], S24, -373897302);
                a = GG(a, b, c, d, words[i+5], S21, -701558691); d = GG(d, a, b, c, words[i+10], S22, 38016083); c = GG(c, d, a, b, words[i+15], S23, -660478335); b = GG(b, c, d, a, words[i+4], S24, -405537848);
                a = GG(a, b, c, d, words[i+9], S21, 568446438); d = GG(d, a, b, c, words[i+14], S22, -1019803690); c = GG(c, d, a, b, words[i+3], S23, -187363961); b = GG(b, c, d, a, words[i+8], S24, 1163531501);
                a = GG(a, b, c, d, words[i+13], S21, -1444681467); d = GG(d, a, b, c, words[i+2], S22, -51403784); c = GG(c, d, a, b, words[i+7], S23, 1735328473); b = GG(b, c, d, a, words[i+12], S24, -1926607734);
                
                a = HH(a, b, c, d, words[i+5], S31, -378558); d = HH(d, a, b, c, words[i+8], S32, -2022574463); c = HH(c, d, a, b, words[i+11], S33, 1839030562); b = HH(b, c, d, a, words[i+14], S34, -35309556);
                a = HH(a, b, c, d, words[i+1], S31, -1530992060); d = HH(d, a, b, c, words[i+4], S32, 1272893353); c = HH(c, d, a, b, words[i+7], S33, -155497632); b = HH(b, c, d, a, words[i+10], S34, -1094730640);
                a = HH(a, b, c, d, words[i+13], S31, 681279174); d = HH(d, a, b, c, words[i+0], S32, -358537222); c = HH(c, d, a, b, words[i+3], S33, -722521979); b = HH(b, c, d, a, words[i+6], S34, 76029189);
                a = HH(a, b, c, d, words[i+9], S31, -640364487); d = HH(d, a, b, c, words[i+12], S32, -421815835); c = HH(c, d, a, b, words[i+15], S33, 530742520); b = HH(b, c, d, a, words[i+2], S34, -995338651);
                
                a = II(a, b, c, d, words[i+0], S41, -198630844); d = II(d, a, b, c, words[i+7], S42, 1126891415); c = II(c, d, a, b, words[i+14], S43, -1416354905); b = II(b, c, d, a, words[i+5], S44, -57434055);
                a = II(a, b, c, d, words[i+12], S41, 1700485571); d = II(d, a, b, c, words[i+3], S42, -1894986606); c = II(c, d, a, b, words[i+10], S43, -1051523); b = II(b, c, d, a, words[i+1], S44, -2054922799);
                a = II(a, b, c, d, words[i+8], S41, 1873313359); d = II(d, a, b, c, words[i+15], S42, -30611744); c = II(c, d, a, b, words[i+6], S43, -1560198380); b = II(b, c, d, a, words[i+13], S44, 1309151649);
                a = II(a, b, c, d, words[i+4], S41, -145523070); d = II(d, a, b, c, words[i+11], S42, -1120210379); c = II(c, d, a, b, words[i+2], S43, 718535338); b = II(b, c, d, a, words[i+9], S44, -343485551);
                
                a = (a + aa) | 0; b = (b + bb) | 0; c = (c + cc) | 0; d = (d + dd) | 0;
            }
            
            let rawBytes = new Uint8Array(16);
            let finalWords = [a, b, c, d];
            for (i = 0; i < 16; i++) {
                rawBytes[i] = (finalWords[i >> 2] >>> ((i % 4) * 8)) & 0xFF;
            }
            return rawBytes;
        }

        // ── Helper: MD5 Apache APR1 Crypt ──
        const APR1_CHARS = "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        function to64(v, n) {
            let s = '';
            while (--n >= 0) {
                s += APR1_CHARS.charAt(v & 0x3f);
                v >>>= 6;
            }
            return s;
        }

        function apr1Crypt(password, salt) {
            const encoder = new TextEncoder();
            const pwBytes = encoder.encode(password);
            const saltBytes = encoder.encode(salt);

            // Initial hash: password + salt + password
            let ctxBytes = new Uint8Array(pwBytes.length + saltBytes.length + pwBytes.length);
            ctxBytes.set(pwBytes, 0);
            ctxBytes.set(saltBytes, pwBytes.length);
            ctxBytes.set(pwBytes, pwBytes.length + saltBytes.length);

            let alternate = md5(ctxBytes);

            // intermediate hash calculations
            let interBytes = new Uint8Array(pwBytes.length + saltBytes.length + 8 + alternate.length);
            interBytes.set(pwBytes, 0);
            interBytes.set(saltBytes, pwBytes.length);
            // $apr1$ prefix bytes
            const prefix = encoder.encode('$apr1$');
            interBytes.set(prefix, pwBytes.length + saltBytes.length);

            let l = pwBytes.length;
            let offset = pwBytes.length + saltBytes.length + prefix.length;
            
            // alternate bytes copying
            for (let i = l; i > 0; i -= 16) {
                let chunk = i > 16 ? 16 : i;
                interBytes.set(alternate.subarray(0, chunk), offset);
                offset += chunk;
            }

            // binary addition depending on length bits
            for (let i = l; i > 0; i >>= 1) {
                if (i & 1) {
                    interBytes[offset++] = 0;
                } else {
                    interBytes[offset++] = pwBytes[0];
                }
            }

            // Compute actual context MD5
            let finalCtx = interBytes.subarray(0, offset);
            let finalHash = md5(finalCtx);

            // 1000 rounds of MD5 iterations
            for (let i = 0; i < 1000; i++) {
                let loopBytes = [];
                if (i & 1) {
                    loopBytes.push(...pwBytes);
                } else {
                    loopBytes.push(...finalHash);
                }
                if (i % 3) {
                    loopBytes.push(...saltBytes);
                }
                if (i % 7) {
                    loopBytes.push(...pwBytes);
                }
                if (i & 1) {
                    loopBytes.push(...finalHash);
                } else {
                    loopBytes.push(...pwBytes);
                }
                finalHash = md5(new Uint8Array(loopBytes));
            }

            // Format representation
            let output = "$apr1$" + salt + "$";
            let l0 = (finalHash[0] << 16) | (finalHash[6] << 8) | finalHash[12];
            let l1 = (finalHash[1] << 16) | (finalHash[7] << 8) | finalHash[13];
            let l2 = (finalHash[2] << 16) | (finalHash[8] << 8) | finalHash[14];
            let l3 = (finalHash[3] << 16) | (finalHash[9] << 8) | finalHash[15];
            let l4 = (finalHash[4] << 16) | (finalHash[10] << 8) | finalHash[5];
            let l5 = finalHash[11];

            output += to64(l0, 4);
            output += to64(l1, 4);
            output += to64(l2, 4);
            output += to64(l3, 4);
            output += to64(l4, 4);
            output += to64(l5, 2);

            return output;
        }

        function generateSalt() {
            let s = '';
            for (let i = 0; i < 8; i++) {
                s += APR1_CHARS.charAt(Math.floor(Math.random() * 64));
            }
            return s;
        }

        // ── Helper: SHA-1 Hash ──
        async function sha1Crypt(password) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-1', data);
            const base64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
            return `{SHA}${base64}`;
        }

        async function generate() {
            errorMsg.style.display = 'none';
            const user = usernameInput.value.trim();
            const pass = passwordInput.value;
            const algo = algoSelect.value;

            if (!user) {
                errorMsg.textContent = 'Please enter a username.';
                errorMsg.style.display = 'block';
                resultsSection.style.display = 'none';
                return;
            }

            // basic check to prevent ':' in username
            if (user.includes(':')) {
                errorMsg.textContent = 'Username cannot contain colons (:).';
                errorMsg.style.display = 'block';
                resultsSection.style.display = 'none';
                return;
            }

            let hash = '';
            if (algo === 'plain') {
                hash = pass;
            } else if (algo === 'sha1') {
                hash = await sha1Crypt(pass);
            } else if (algo === 'apr1') {
                const salt = generateSalt();
                hash = apr1Crypt(pass, salt);
            }

            htOutput.textContent = `${user}:${hash}`;
            resultsSection.style.display = 'block';
        }

        btnGenerate.addEventListener('click', generate);

        resetBtn.addEventListener('click', function () {
            usernameInput.value = 'admin';
            passwordInput.value = 'secret123';
            algoSelect.value = 'sha1';
            resultsSection.style.display = 'none';
            errorMsg.style.display = 'none';
        });

        btnCopy.addEventListener('click', function () {
            const line = htOutput.textContent;
            if (line && line !== '—') {
                navigator.clipboard.writeText(line).then(() => {
                    if (typeof TN !== 'undefined' && TN.toast) {
                        TN.toast.success('htpasswd line copied to clipboard!');
                    }
                });
            }
        });

        // Run initial load
        generate();
    });
})();

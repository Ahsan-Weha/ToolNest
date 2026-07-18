(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const encodedJwt = document.getElementById('encoded-jwt');
        const resetBtn = document.getElementById('reset-btn');
        const demoBtn = document.getElementById('demo-btn');
        const errorMsg = document.getElementById('error-msg');
        const decodedSections = document.getElementById('decoded-sections');
        const metaSection = document.getElementById('meta-section');
        
        const jwtHeader = document.getElementById('jwt-header');
        const jwtPayload = document.getElementById('jwt-payload');
        const copyButtons = document.querySelectorAll('.copy-block-btn');

        const DEMO_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjI1MTYyMzkwMjIsImFkbWluIjp0cnVlLCJyb2xlcyI6WyJ1c2VyIiwiYWRtaW4iXX0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

        function showError(msg) {
            errorMsg.textContent = msg;
            errorMsg.style.display = 'block';
            decodedSections.style.display = 'none';
        }

        function hideError() {
            errorMsg.style.display = 'none';
        }

        function base64UrlDecode(str) {
            try {
                let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
                while (base64.length % 4) {
                    base64 += '=';
                }
                const binaryString = atob(base64);
                // Correctly handle multi-byte characters
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const decoder = new TextDecoder('utf-8');
                return JSON.parse(decoder.decode(bytes));
            } catch (e) {
                throw new Error('Failed to base64url decode section.');
            }
        }

        function formatDate(epoch) {
            if (!epoch) return 'N/A';
            const date = new Date(epoch * 1000);
            return date.toLocaleString();
        }

        function buildMetaPills(payload) {
            metaSection.innerHTML = '';
            const now = Math.floor(Date.now() / 1000);

            // 1. Expiration check
            if (payload.exp) {
                const expDate = payload.exp;
                const isExpired = expDate < now;
                const diff = expDate - now;

                const pill = document.createElement('span');
                pill.className = 'meta-pill';
                
                if (isExpired) {
                    pill.style.background = 'rgba(239, 68, 68, 0.15)';
                    pill.style.color = 'var(--error)';
                    pill.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                    pill.textContent = 'Expired Token';
                } else {
                    pill.style.background = 'rgba(34, 197, 94, 0.15)';
                    pill.style.color = '#22c55e';
                    pill.style.border = '1px solid rgba(34, 197, 94, 0.3)';
                    
                    const hours = Math.floor(diff / 3600);
                    const minutes = Math.floor((diff % 3600) / 60);
                    if (hours > 24) {
                        pill.textContent = `Valid (Expires in ${Math.round(hours / 24)} days)`;
                    } else if (hours > 0) {
                        pill.textContent = `Valid (Expires in ${hours}h ${minutes}m)`;
                    } else {
                        pill.textContent = `Valid (Expires in ${minutes}m)`;
                    }
                }
                metaSection.appendChild(pill);

                // Add formatted expiration date pill
                const expPill = document.createElement('span');
                expPill.className = 'meta-pill';
                expPill.style.background = 'var(--bg-main)';
                expPill.style.border = '1px solid var(--border-color)';
                expPill.style.color = 'var(--text-muted)';
                expPill.textContent = `Expires: ${formatDate(expDate)}`;
                metaSection.appendChild(expPill);
            }

            // 2. Issued At check
            if (payload.iat) {
                const iatPill = document.createElement('span');
                iatPill.className = 'meta-pill';
                iatPill.style.background = 'var(--bg-main)';
                iatPill.style.border = '1px solid var(--border-color)';
                iatPill.style.color = 'var(--text-muted)';
                iatPill.textContent = `Issued: ${formatDate(payload.iat)}`;
                metaSection.appendChild(iatPill);
            }

            // 3. Subject check
            if (payload.sub) {
                const subPill = document.createElement('span');
                subPill.className = 'meta-pill';
                subPill.style.background = 'var(--bg-main)';
                subPill.style.border = '1px solid var(--border-color)';
                subPill.style.color = 'var(--primary)';
                subPill.textContent = `Subject: ${payload.sub}`;
                metaSection.appendChild(subPill);
            }
        }

        function decode() {
            hideError();
            const token = encodedJwt.value.trim();

            if (!token) {
                decodedSections.style.display = 'none';
                return;
            }

            const parts = token.split('.');
            if (parts.length !== 3) {
                showError('Invalid token format. A JWT must consist of three parts separated by dots.');
                return;
            }

            try {
                const headerObj = base64UrlDecode(parts[0]);
                const payloadObj = base64UrlDecode(parts[1]);

                jwtHeader.textContent = JSON.stringify(headerObj, null, 4);
                jwtPayload.textContent = JSON.stringify(payloadObj, null, 4);

                buildMetaPills(payloadObj);

                decodedSections.style.display = 'block';
            } catch (err) {
                showError(`Error decoding token claims: ${err.message}`);
            }
        }

        encodedJwt.addEventListener('input', decode);

        demoBtn.addEventListener('click', function () {
            encodedJwt.value = DEMO_TOKEN;
            decode();
        });

        resetBtn.addEventListener('click', function () {
            encodedJwt.value = '';
            decodedSections.style.display = 'none';
            hideError();
        });

        // Copy functionality
        copyButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                const targetId = this.dataset.copyTarget;
                const text = document.getElementById(targetId).textContent;
                if (text) {
                    navigator.clipboard.writeText(text).then(() => {
                        if (typeof TN !== 'undefined' && TN.toast) {
                            TN.toast.success('Copied JSON block to clipboard!');
                        }
                    });
                }
            });
        });
    });
})();

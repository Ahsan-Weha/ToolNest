(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const strengthPwd = document.getElementById('strength-pwd');
        const btnToggleVisibility = document.getElementById('btn-toggle-visibility');
        const eyeOpenPath = document.getElementById('eye-open-path');
        const eyeClosedPath = document.getElementById('eye-closed-path');

        const strengthLabel = document.getElementById('strength-label');
        const entropyLabel = document.getElementById('entropy-label');
        const strengthFill = document.getElementById('strength-fill');
        const feedbackMsg = document.getElementById('feedback-msg');

        // Checklists
        const checkLength = document.getElementById('check-length');
        const checkUpper = document.getElementById('check-upper');
        const checkLower = document.getElementById('check-lower');
        const checkNumber = document.getElementById('check-number');
        const checkSymbol = document.getElementById('check-symbol');
        const checkVariety = document.getElementById('check-variety');

        // Crack stats
        const crackFast = document.getElementById('crack-fast');
        const crackSlow = document.getElementById('crack-slow');
        const crackOnline = document.getElementById('crack-online');
        const crackDictionary = document.getElementById('crack-dictionary');

        const COMMON_PASSWORDS = [
            '123456', 'password', '123456789', 'qwerty', '12345678', '111111', 
            '1234567', 'letmein', '123123', 'admin', 'welcome', 'login', 'security'
        ];

        // Toggle visibility
        let visible = false;
        btnToggleVisibility.addEventListener('click', function () {
            visible = !visible;
            strengthPwd.type = visible ? 'text' : 'password';
            if (visible) {
                // Closed eye look
                eyeOpenPath.setAttribute('d', 'M2 2l20 20M15 12a3 3 0 11-6 0 3 3 0 016 0z');
            } else {
                // Open eye look
                eyeOpenPath.setAttribute('d', 'M15 12a3 3 0 11-6 0 3 3 0 016 0z');
            }
        });

        function getPoolDetails(val) {
            let size = 0;
            let checks = {
                lower: false,
                upper: false,
                number: false,
                symbol: false,
                length: false,
                variety: false
            };

            if (val.length >= 8) checks.length = true;
            if (/[a-z]/.test(val)) { size += 26; checks.lower = true; }
            if (/[A-Z]/.test(val)) { size += 26; checks.upper = true; }
            if (/\d/.test(val)) { size += 10; checks.number = true; }
            if (/[^A-Za-z0-9]/.test(val)) { size += 33; checks.symbol = true; }

            // Variety check: no triple repeating chars like "aaa"
            if (val.length > 0 && !/(.)\1\1/.test(val)) {
                checks.variety = true;
            }

            return { size, checks };
        }

        function formatCrackTime(seconds) {
            if (seconds < 1) return 'Instantly';
            const minutes = seconds / 60;
            if (minutes < 1) return `${Math.round(seconds)} seconds`;
            const hours = minutes / 60;
            if (hours < 1) return `${Math.round(minutes)} minutes`;
            const days = hours / 24;
            if (days < 1) return `${Math.round(hours)} hours`;
            const years = days / 365;
            if (years < 1) return `${Math.round(days)} days`;
            
            if (years >= 1e9) return `${(years / 1e9).toFixed(1)}B years`;
            if (years >= 1e6) return `${(years / 1e6).toFixed(1)}M years`;
            return `${Math.round(years).toLocaleString()} years`;
        }

        function analyze() {
            const val = strengthPwd.value;
            if (!val) {
                // Clear state
                strengthLabel.textContent = 'Empty';
                strengthLabel.style.color = '';
                entropyLabel.textContent = '0 bits of entropy';
                strengthFill.style.width = '0%';
                feedbackMsg.textContent = 'Enter a password to begin analysis.';

                [checkLength, checkUpper, checkLower, checkNumber, checkSymbol, checkVariety].forEach(el => {
                    el.classList.remove('valid');
                });

                [crackFast, crackSlow, crackOnline, crackDictionary].forEach(el => {
                    el.textContent = '—';
                });
                return;
            }

            const { size, checks } = getPoolDetails(val);

            // Update checklists
            checkLength.classList.toggle('valid', checks.length);
            checkLower.classList.toggle('valid', checks.lower);
            checkUpper.classList.toggle('valid', checks.upper);
            checkNumber.classList.toggle('valid', checks.number);
            checkSymbol.classList.toggle('valid', checks.symbol);
            checkVariety.classList.toggle('valid', checks.variety);

            // Calculate entropy
            const L = val.length;
            const entropy = L * Math.log2(size || 1);

            // Update indicators
            entropyLabel.textContent = `${Math.round(entropy)} bits of entropy`;

            // Crack times based on entropy attempts
            const attempts = Math.pow(2, entropy);
            
            // MD5 GPU cluster (10 billion guesses/sec)
            const timeFast = attempts / 1e10;
            // Bcrypt hashing (10,000 guesses/sec)
            const timeSlow = attempts / 1e4;
            // Online interface (10 guesses/sec)
            const timeOnline = attempts / 10;

            crackFast.textContent = formatCrackTime(timeFast);
            crackSlow.textContent = formatCrackTime(timeSlow);
            crackOnline.textContent = formatCrackTime(timeOnline);

            // Dictionary Check
            const isCommon = COMMON_PASSWORDS.includes(val.toLowerCase());
            crackDictionary.textContent = isCommon ? 'Yes (Highly Insecure)' : 'No Match';
            crackDictionary.style.color = isCommon ? 'var(--error)' : '#22c55e';

            // Strength bar coloring & labels
            let width = '0%';
            let color = '';
            let label = '';
            let feedback = '';

            if (isCommon) {
                width = '10%';
                color = 'var(--error)';
                label = 'Compromised ❌';
                feedback = 'This password is in list of most common credentials. Do not use.';
            } else if (entropy < 40) {
                width = '25%';
                color = 'var(--error)';
                label = 'Very Weak ⚠️';
                feedback = 'Add length and use different character sets to increase safety.';
            } else if (entropy < 60) {
                width = '50%';
                color = '#f97316';
                label = 'Weak';
                feedback = 'A decent password, but could easily be cracked. Use a passphrase.';
            } else if (entropy < 80) {
                width = '75%';
                color = '#eab308';
                label = 'Medium';
                feedback = 'Highly secure against online brute-forcing. Good for general accounts.';
            } else {
                width = '100%';
                color = '#22c55e';
                label = 'Strong';
                feedback = 'Superb protection! Virtually uncrackable with current computer limits.';
            }

            strengthFill.style.width = width;
            strengthFill.style.backgroundColor = color;
            strengthLabel.textContent = label;
            strengthLabel.style.color = color;
            feedbackMsg.textContent = feedback;
        }

        strengthPwd.addEventListener('input', analyze);

        // Run initially
        analyze();
    });
})();

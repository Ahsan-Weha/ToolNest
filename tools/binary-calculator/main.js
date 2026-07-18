(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const bitWidthSelect = document.getElementById('bit-width');
        const signedTypeSelect = document.getElementById('signed-type');
        const inputBaseSelect = document.getElementById('input-base');
        const valAInput = document.getElementById('val-a');
        const valBInput = document.getElementById('val-b');
        const opButtons = document.querySelectorAll('#operation-container button');
        const btnCalculate = document.getElementById('btn-calculate');
        const resetBtn = document.getElementById('reset-btn');
        const errorMsg = document.getElementById('error-msg');
        const resultsSection = document.getElementById('results-section');

        const resBin = document.getElementById('res-bin');
        const resDec = document.getElementById('res-dec');
        const resHex = document.getElementById('res-hex');
        const resOct = document.getElementById('res-oct');
        const copyButtons = document.querySelectorAll('.base-copy-btn');

        let currentOp = '+';

        // Set placeholder base-specific guidance
        function updatePlaceholders() {
            const base = parseInt(inputBaseSelect.value);
            let ph = '';
            if (base === 2) ph = 'e.g. 1010';
            else if (base === 8) ph = 'e.g. 12';
            else if (base === 10) ph = 'e.g. 10';
            else if (base === 16) ph = 'e.g. A';
            
            valAInput.placeholder = ph;
            valBInput.placeholder = ph;
            document.getElementById('label-val-a').textContent = `Value A (${inputBaseSelect.selectedOptions[0].text.split(' ')[0]})`;
            document.getElementById('label-val-b').textContent = `Value B (${inputBaseSelect.selectedOptions[0].text.split(' ')[0]})`;
        }

        inputBaseSelect.addEventListener('change', () => {
            updatePlaceholders();
            autoCalculate();
        });

        // Set active operation button
        opButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                opButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentOp = this.dataset.op;

                // Disable Value B input for NOT operation
                if (currentOp === 'not') {
                    valBInput.disabled = true;
                    valBInput.style.opacity = '0.5';
                } else {
                    valBInput.disabled = false;
                    valBInput.style.opacity = '1';
                }
                autoCalculate();
            });
        });

        function showError(msg) {
            errorMsg.textContent = msg;
            errorMsg.style.display = 'block';
            resultsSection.style.display = 'none';
        }

        function hideError() {
            errorMsg.style.display = 'none';
        }

        // Validate characters based on base
        function isValidForBase(str, base) {
            // strip sign for validation
            const cleanStr = str.replace(/^[+-]/, '');
            if (cleanStr === '') return false;
            
            if (base === 2) return /^[01]+$/.test(cleanStr);
            if (base === 8) return /^[0-7]+$/.test(cleanStr);
            if (base === 10) return /^[0-9]+$/.test(cleanStr);
            if (base === 16) return /^[0-9A-Fa-f]+$/.test(cleanStr);
            return false;
        }

        // Parse to BigInt
        function parseVal(str, base, width, isSigned) {
            str = str.trim();
            if (!isValidForBase(str, base)) {
                throw new Error(`Invalid characters for selected base.`);
            }

            let val;
            if (base === 10) {
                // decimal parsing allows sign directly
                val = BigInt(str);
            } else {
                // non-decimal parsing, handle potential sign
                const isNegative = str.startsWith('-');
                const clean = str.replace(/^[+-]/, '');
                val = BigInt(`0x${parseInt(clean, base).toString(16)}`);
                if (isNegative) val = -val;
            }

            // Mask/clamp to selected word width
            const mask = (1n << BigInt(width)) - 1n;
            val = val & mask;

            if (isSigned) {
                const maxVal = 1n << (BigInt(width) - 1n);
                if (val >= maxVal) {
                    val = val - (1n << BigInt(width));
                }
            }
            return val;
        }

        // Format to string
        function formatResult(val, base, width, isSigned) {
            const mask = (1n << BigInt(width)) - 1n;
            // Get unsigned representation
            const uval = val & mask;

            if (base === 2) {
                let binStr = uval.toString(2);
                // Pad to multiple of 4 or the full width
                const targetLen = Math.min(width, Math.ceil(binStr.length / 4) * 4);
                binStr = binStr.padStart(targetLen, '0');
                // Group by 4 bits
                return binStr.match(/.{1,4}/g).join(' ');
            }
            if (base === 8) {
                return uval.toString(8);
            }
            if (base === 16) {
                return uval.toString(16).toUpperCase();
            }
            if (base === 10) {
                if (isSigned) {
                    const maxVal = 1n << (BigInt(width) - 1n);
                    let sval = uval;
                    if (uval >= maxVal) {
                        sval = uval - (1n << BigInt(width));
                    }
                    return sval.toString(10);
                } else {
                    return uval.toString(10);
                }
            }
            return '';
        }

        function calculate() {
            hideError();
            const width = parseInt(bitWidthSelect.value);
            const isSigned = signedTypeSelect.value === 'signed';
            const base = parseInt(inputBaseSelect.value);

            const strA = valAInput.value;
            const strB = valBInput.value;

            if (!strA) { showError('Please enter Value A.'); return; }
            if (currentOp !== 'not' && !strB) { showError('Please enter Value B.'); return; }

            let a, b;
            try {
                a = parseVal(strA, base, width, isSigned);
            } catch (e) {
                showError(`Value A: ${e.message}`);
                return;
            }

            if (currentOp !== 'not') {
                try {
                    b = parseVal(strB, base, width, isSigned);
                } catch (e) {
                    showError(`Value B: ${e.message}`);
                    return;
                }
            }

            let result = 0n;
            const mask = (1n << BigInt(width)) - 1n;

            try {
                switch (currentOp) {
                    case '+':
                        result = a + b;
                        break;
                    case '-':
                        result = a - b;
                        break;
                    case '*':
                        result = a * b;
                        break;
                    case '/':
                        if (b === 0n) { showError('Division by zero is undefined.'); return; }
                        result = a / b;
                        break;
                    case 'and':
                        result = a & b;
                        break;
                    case 'or':
                        result = a | b;
                        break;
                    case 'xor':
                        result = a ^ b;
                        break;
                    case 'not':
                        result = ~a;
                        break;
                    case 'shl':
                        result = a << b;
                        break;
                    case 'shr':
                        // If signed, perform arithmetic shift right; if unsigned, perform logical shift right.
                        if (isSigned) {
                            result = a >> b;
                        } else {
                            // logical right shift on unsigned equivalent
                            const uA = a & mask;
                            result = uA >> b;
                        }
                        break;
                    default:
                        showError('Unknown operation.');
                        return;
                }
            } catch (e) {
                showError(`Calculation error: ${e.message}`);
                return;
            }

            // Apply word size mask to get final result
            result = result & mask;

            // Format to different bases
            resBin.textContent = formatResult(result, 2, width, isSigned);
            resDec.textContent = formatResult(result, 10, width, isSigned);
            resHex.textContent = formatResult(result, 16, width, isSigned);
            resOct.textContent = formatResult(result, 8, width, isSigned);

            resultsSection.style.display = 'block';
        }

        function autoCalculate() {
            if (valAInput.value && (currentOp === 'not' || valBInput.value)) {
                calculate();
            }
        }

        btnCalculate.addEventListener('click', calculate);
        valAInput.addEventListener('input', autoCalculate);
        valBInput.addEventListener('input', autoCalculate);
        bitWidthSelect.addEventListener('change', autoCalculate);
        signedTypeSelect.addEventListener('change', autoCalculate);

        // Copy functionality
        copyButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                const targetId = this.dataset.copyTarget;
                const text = document.getElementById(targetId).textContent.replace(/\s+/g, '');
                if (text && text !== '—') {
                    navigator.clipboard.writeText(text).then(() => {
                        if (typeof TN !== 'undefined' && TN.toast) {
                            TN.toast.success('Copied representation to clipboard!');
                        }
                    });
                }
            });
        });

        // Reset
        resetBtn.addEventListener('click', function () {
            valAInput.value = '1010';
            valBInput.value = '0101';
            bitWidthSelect.value = '32';
            signedTypeSelect.value = 'unsigned';
            inputBaseSelect.value = '2';
            currentOp = '+';
            opButtons.forEach(b => b.classList.toggle('active', b.dataset.op === '+'));
            valBInput.disabled = false;
            valBInput.style.opacity = '1';
            updatePlaceholders();
            hideError();
            calculate();
        });

        // Init
        updatePlaceholders();
        calculate();
    });
})();

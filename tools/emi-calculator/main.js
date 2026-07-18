(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const principalInput = document.getElementById('emi-principal');
        const principalRange = document.getElementById('emi-principal-range');
        const rateInput = document.getElementById('emi-rate');
        const rateRange = document.getElementById('emi-rate-range');
        const tenureInput = document.getElementById('emi-tenure');
        const tenureRange = document.getElementById('emi-tenure-range');
        const tenureUnit = document.getElementById('emi-tenure-unit');
        const currencySelect = document.getElementById('emi-currency');
        const btnCalculate = document.getElementById('btn-calculate');
        const resetBtn = document.getElementById('reset-btn');
        const errorMsg = document.getElementById('error-msg');
        const resultsSection = document.getElementById('results-section');
        const toggleAmort = document.getElementById('toggle-amort');
        const amortSection = document.getElementById('amort-section');
        const amortBody = document.getElementById('amort-body');

        // Sync sliders
        principalRange.addEventListener('input', () => { principalInput.value = principalRange.value; autoCalc(); });
        principalInput.addEventListener('input', () => { principalRange.value = Math.min(principalInput.value, 10000000); autoCalc(); });
        rateRange.addEventListener('input', () => { rateInput.value = rateRange.value; autoCalc(); });
        rateInput.addEventListener('input', () => { rateRange.value = Math.min(rateInput.value, 30); autoCalc(); });
        tenureRange.addEventListener('input', () => { tenureInput.value = tenureRange.value; autoCalc(); });
        tenureInput.addEventListener('input', () => { tenureRange.value = Math.min(tenureInput.value, 30); autoCalc(); });
        [tenureUnit, currencySelect].forEach(el => el.addEventListener('change', autoCalc));

        let amortVisible = false;
        toggleAmort.addEventListener('click', function () {
            amortVisible = !amortVisible;
            amortSection.style.display = amortVisible ? 'block' : 'none';
            toggleAmort.textContent = amortVisible ? 'Hide Schedule' : 'Show Schedule';
        });

        function fmt(n, sym) {
            return sym + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        }

        function fmtFull(n, sym) {
            return sym + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        function showError(msg) {
            errorMsg.textContent = msg;
            errorMsg.style.display = 'block';
            resultsSection.style.display = 'none';
        }

        function hideError() {
            errorMsg.style.display = 'none';
        }

        function updateDonut(principalAmt, interestAmt) {
            const total = principalAmt + interestAmt;
            const CIRCUM = 2 * Math.PI * 55; // ≈ 345.6
            const principalDash = (principalAmt / total) * CIRCUM;
            const interestDash = (interestAmt / total) * CIRCUM;

            const donutPrincipal = document.getElementById('donut-principal');
            const donutInterest = document.getElementById('donut-interest');

            donutPrincipal.style.strokeDasharray = `${principalDash.toFixed(2)} ${CIRCUM.toFixed(2)}`;
            donutInterest.style.strokeDasharray = `${interestDash.toFixed(2)} ${CIRCUM.toFixed(2)}`;
            donutInterest.style.strokeDashoffset = `-${principalDash.toFixed(2)}`;
        }

        function calculate() {
            hideError();
            const P = parseFloat(principalInput.value);
            const annualRate = parseFloat(rateInput.value);
            const tenureVal = parseFloat(tenureInput.value);
            const isYears = tenureUnit.value === 'years';
            const sym = currencySelect.value;

            if (isNaN(P) || P <= 0) { showError('Please enter a valid principal amount.'); return; }
            if (isNaN(annualRate) || annualRate <= 0) { showError('Please enter a valid interest rate.'); return; }
            if (isNaN(tenureVal) || tenureVal <= 0) { showError('Please enter a valid tenure.'); return; }

            const n = isYears ? Math.round(tenureVal * 12) : Math.round(tenureVal);
            const r = annualRate / 100 / 12;

            let emi;
            if (r === 0) {
                emi = P / n;
            } else {
                emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            }

            const totalAmount = emi * n;
            const totalInterest = totalAmount - P;

            // Stats
            document.getElementById('stat-emi').textContent = fmtFull(emi, sym);
            document.getElementById('stat-total-amount').textContent = fmt(totalAmount, sym);
            document.getElementById('stat-total-interest').textContent = fmt(totalInterest, sym);
            document.getElementById('stat-emi-principal').textContent = fmt(P, sym);
            document.getElementById('donut-emi-label').textContent = fmt(emi, sym);
            document.getElementById('legend-principal').textContent = `${fmt(P, sym)} (${(P / totalAmount * 100).toFixed(1)}%)`;
            document.getElementById('legend-interest').textContent = `${fmt(totalInterest, sym)} (${(totalInterest / totalAmount * 100).toFixed(1)}%)`;

            updateDonut(P, totalInterest);

            // Year-wise amortization
            amortBody.innerHTML = '';
            let balance = P;
            const years = Math.ceil(n / 12);

            for (let year = 1; year <= years; year++) {
                const startMonth = (year - 1) * 12 + 1;
                const endMonth = Math.min(year * 12, n);
                let yearPrincipal = 0;
                let yearInterest = 0;

                for (let m = startMonth; m <= endMonth; m++) {
                    const interestPayment = balance * r;
                    const principalPayment = Math.min(emi - interestPayment, balance);
                    yearInterest += interestPayment;
                    yearPrincipal += principalPayment;
                    balance -= principalPayment;
                    if (balance < 0.01) balance = 0;
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>Year ${year}</td>
                    <td style="color:#22c55e">${fmt(yearPrincipal, sym)}</td>
                    <td style="color:var(--error)">${fmt(yearInterest, sym)}</td>
                    <td>${fmt(yearPrincipal + yearInterest, sym)}</td>
                    <td style="font-weight:var(--weight-semibold)">${fmt(Math.max(0, balance), sym)}</td>
                `;
                amortBody.appendChild(tr);
            }

            resultsSection.style.display = 'block';
        }

        function autoCalc() {
            calculate();
        }

        btnCalculate.addEventListener('click', calculate);

        resetBtn.addEventListener('click', function () {
            principalInput.value = '500000';
            principalRange.value = '500000';
            rateInput.value = '10.5';
            rateRange.value = '10.5';
            tenureInput.value = '5';
            tenureRange.value = '5';
            tenureUnit.value = 'years';
            currencySelect.value = '₹';
            hideError();
            calculate();
        });

        // Initial calculation
        calculate();
    });
})();

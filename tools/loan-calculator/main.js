(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const loanAmountInput = document.getElementById('loan-amount');
        const loanAmountRange = document.getElementById('loan-amount-range');
        const interestRateInput = document.getElementById('interest-rate');
        const rateRange = document.getElementById('rate-range');
        const loanTermInput = document.getElementById('loan-term');
        const termRange = document.getElementById('term-range');
        const termUnit = document.getElementById('term-unit');
        const startDateInput = document.getElementById('start-date');
        const btnCalculate = document.getElementById('btn-calculate');
        const resetBtn = document.getElementById('reset-btn');
        const errorMsg = document.getElementById('error-msg');
        const resultsSection = document.getElementById('results-section');
        const toggleAmort = document.getElementById('toggle-amort');
        const amortSection = document.getElementById('amort-section');
        const amortBody = document.getElementById('amort-body');

        // Set default start date to current month
        const now = new Date();
        startDateInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        // Sync sliders <-> inputs
        loanAmountRange.addEventListener('input', () => { loanAmountInput.value = loanAmountRange.value; autoCalc(); });
        loanAmountInput.addEventListener('input', () => { loanAmountRange.value = loanAmountInput.value; autoCalc(); });
        rateRange.addEventListener('input', () => { interestRateInput.value = rateRange.value; autoCalc(); });
        interestRateInput.addEventListener('input', () => { rateRange.value = interestRateInput.value; autoCalc(); });
        termRange.addEventListener('input', () => { loanTermInput.value = termRange.value; autoCalc(); });
        loanTermInput.addEventListener('input', () => { termRange.value = loanTermInput.value; autoCalc(); });
        termUnit.addEventListener('change', autoCalc);
        startDateInput.addEventListener('change', autoCalc);

        // Amortization toggle
        let amortVisible = false;
        toggleAmort.addEventListener('click', function () {
            amortVisible = !amortVisible;
            amortSection.style.display = amortVisible ? 'block' : 'none';
            toggleAmort.textContent = amortVisible ? 'Hide Table' : 'Show Table';
        });

        function fmtCurrency(n) {
            return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        function showError(msg) {
            errorMsg.textContent = msg;
            errorMsg.style.display = 'block';
            resultsSection.style.display = 'none';
        }

        function hideError() {
            errorMsg.style.display = 'none';
        }

        function addMonths(dateStr, months) {
            const [year, month] = dateStr.split('-').map(Number);
            const d = new Date(year, month - 1 + months, 1);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        }

        function formatMonthLabel(dateStr) {
            const [year, month] = dateStr.split('-').map(Number);
            const d = new Date(year, month - 1, 1);
            return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        }

        function calculate() {
            hideError();
            const P = parseFloat(loanAmountInput.value);
            const annualRate = parseFloat(interestRateInput.value);
            const termVal = parseFloat(loanTermInput.value);
            const isYears = termUnit.value === 'years';

            if (isNaN(P) || P <= 0) { showError('Please enter a valid loan amount.'); return; }
            if (isNaN(annualRate) || annualRate < 0) { showError('Please enter a valid interest rate.'); return; }
            if (isNaN(termVal) || termVal <= 0) { showError('Please enter a valid loan term.'); return; }

            const n = isYears ? Math.round(termVal * 12) : Math.round(termVal); // total months
            const r = annualRate / 100 / 12; // monthly rate

            let monthlyPayment;
            if (r === 0) {
                monthlyPayment = P / n;
            } else {
                monthlyPayment = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            }

            const totalPayment = monthlyPayment * n;
            const totalInterest = totalPayment - P;
            const principalPct = (P / totalPayment * 100);
            const interestPct = 100 - principalPct;

            // Update stats
            document.getElementById('stat-monthly').textContent = fmtCurrency(monthlyPayment);
            document.getElementById('stat-total').textContent = fmtCurrency(totalPayment);
            document.getElementById('stat-interest').textContent = fmtCurrency(totalInterest);
            document.getElementById('stat-principal').textContent = fmtCurrency(P);
            document.getElementById('pct-principal').textContent = `(${principalPct.toFixed(1)}%)`;
            document.getElementById('pct-interest').textContent = `(${interestPct.toFixed(1)}%)`;
            document.getElementById('bar-principal').style.width = principalPct.toFixed(2) + '%';

            // Payoff date
            const startDate = startDateInput.value || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const payoffDate = addMonths(startDate, n);
            document.getElementById('payoff-date-section').innerHTML =
                `Loan starts <strong>${formatMonthLabel(startDate)}</strong> — fully paid off by <strong style="color:var(--primary)">${formatMonthLabel(payoffDate)}</strong> (${n} monthly payments)`;

            // Build amortization table
            amortBody.innerHTML = '';
            let balance = P;
            for (let i = 1; i <= n; i++) {
                const interestPayment = balance * r;
                const principalPayment = monthlyPayment - interestPayment;
                balance -= principalPayment;
                if (balance < 0.005) balance = 0;

                const tr = document.createElement('tr');
                const monthLabel = formatMonthLabel(addMonths(startDate, i - 1));
                tr.innerHTML = `
                    <td style="color:var(--text-muted)">${i}</td>
                    <td>${monthLabel}</td>
                    <td>${fmtCurrency(monthlyPayment)}</td>
                    <td style="color:#22c55e">${fmtCurrency(principalPayment)}</td>
                    <td style="color:var(--error)">${fmtCurrency(interestPayment)}</td>
                    <td style="font-weight:var(--weight-semibold)">${fmtCurrency(balance)}</td>
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
            loanAmountInput.value = '250000';
            loanAmountRange.value = '250000';
            interestRateInput.value = '6.5';
            rateRange.value = '6.5';
            loanTermInput.value = '30';
            termRange.value = '30';
            termUnit.value = 'years';
            startDateInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            hideError();
            calculate();
        });

        // Initial calculation
        calculate();
    });
})();

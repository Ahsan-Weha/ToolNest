(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        /* ── Percentage Calc 1: X% of Y ── */
        const c1x = document.getElementById('c1-x');
        const c1y = document.getElementById('c1-y');
        const c1res = document.getElementById('c1-result');

        /* ── Percentage Calc 2: X is what % of Y ── */
        const c2x = document.getElementById('c2-x');
        const c2y = document.getElementById('c2-y');
        const c2res = document.getElementById('c2-result');

        /* ── Percentage Calc 3: % Change ── */
        const c3x = document.getElementById('c3-x');
        const c3y = document.getElementById('c3-y');
        const c3res = document.getElementById('c3-result');

        /* ── Percentage Calc 4: Increase/Decrease ── */
        const c4y = document.getElementById('c4-y');
        const c4op = document.getElementById('c4-op');
        const c4x = document.getElementById('c4-x');
        const c4res = document.getElementById('c4-result');

        /* ── Percentage Calc 5: Discount ── */
        const c5price = document.getElementById('c5-price');
        const c5disc = document.getElementById('c5-disc');
        const c5res = document.getElementById('c5-result');

        /* ── Percentage Calc 6: Number from % ── */
        const c6pct = document.getElementById('c6-pct');
        const c6num = document.getElementById('c6-result-num');
        const c6res = document.getElementById('c6-result');

        const resetBtn = document.getElementById('reset-btn');

        function fmt(n) {
            // Format number nicely - up to 6 sig figs, remove trailing zeros
            if (!isFinite(n)) return 'Error';
            const abs = Math.abs(n);
            if (abs === 0) return '0';
            const digits = abs >= 1000 ? 2 : abs >= 10 ? 4 : 6;
            return parseFloat(n.toFixed(digits)).toLocaleString();
        }

        function setResult(el, value, label) {
            if (value === null || !isFinite(value)) {
                el.textContent = 'Invalid input';
                el.style.color = 'var(--error)';
            } else {
                el.innerHTML = `<span style="font-size:1.1rem; font-weight:var(--weight-bold); color:var(--primary);">${fmt(value)}</span>${label ? ' <span class="text-muted text-xs">' + label + '</span>' : ''}`;
                el.style.color = '';
            }
        }

        function resetResult(el) {
            el.textContent = 'Enter values above';
            el.style.color = '';
        }

        // Calc 1
        function calc1() {
            const x = parseFloat(c1x.value);
            const y = parseFloat(c1y.value);
            if (isNaN(x) || isNaN(y)) { resetResult(c1res); return; }
            setResult(c1res, (x / 100) * y);
        }

        // Calc 2
        function calc2() {
            const x = parseFloat(c2x.value);
            const y = parseFloat(c2y.value);
            if (isNaN(x) || isNaN(y) || y === 0) { resetResult(c2res); return; }
            setResult(c2res, (x / y) * 100, '%');
        }

        // Calc 3
        function calc3() {
            const from = parseFloat(c3x.value);
            const to = parseFloat(c3y.value);
            if (isNaN(from) || isNaN(to) || from === 0) { resetResult(c3res); return; }
            const change = ((to - from) / Math.abs(from)) * 100;
            const isIncrease = change >= 0;
            c3res.innerHTML = `<span style="font-size:1.1rem; font-weight:var(--weight-bold); color:${isIncrease ? 'var(--success, #22c55e)' : 'var(--error)'};">${isIncrease ? '+' : ''}${fmt(change)}%</span> <span class="text-muted text-xs">${isIncrease ? 'increase' : 'decrease'}</span>`;
            c3res.style.color = '';
        }

        // Calc 4
        function calc4() {
            const y = parseFloat(c4y.value);
            const x = parseFloat(c4x.value);
            const op = c4op.value;
            if (isNaN(y) || isNaN(x)) { resetResult(c4res); return; }
            const result = op === 'inc' ? y + (y * x / 100) : y - (y * x / 100);
            setResult(c4res, result);
        }

        // Calc 5
        function calc5() {
            const price = parseFloat(c5price.value);
            const disc = parseFloat(c5disc.value);
            if (isNaN(price) || isNaN(disc)) { resetResult(c5res); return; }
            if (disc < 0 || disc > 100) { c5res.textContent = 'Discount must be 0–100%'; c5res.style.color = 'var(--error)'; return; }
            const discAmount = price * disc / 100;
            const finalPrice = price - discAmount;
            c5res.innerHTML = `<span style="font-size:1.1rem; font-weight:var(--weight-bold); color:var(--primary);">${fmt(finalPrice)}</span> <span class="text-muted text-xs">saved ${fmt(discAmount)}</span>`;
            c5res.style.color = '';
        }

        // Calc 6
        function calc6() {
            const pct = parseFloat(c6pct.value);
            const num = parseFloat(c6num.value);
            if (isNaN(pct) || isNaN(num) || pct === 0) { resetResult(c6res); return; }
            setResult(c6res, (num / pct) * 100);
        }

        // Wire up all inputs
        [c1x, c1y].forEach(el => el.addEventListener('input', calc1));
        [c2x, c2y].forEach(el => el.addEventListener('input', calc2));
        [c3x, c3y].forEach(el => el.addEventListener('input', calc3));
        [c4y, c4x, c4op].forEach(el => el.addEventListener('input', calc4));
        c4op.addEventListener('change', calc4);
        [c5price, c5disc].forEach(el => el.addEventListener('input', calc5));
        [c6pct, c6num].forEach(el => el.addEventListener('input', calc6));

        // Reset
        if (resetBtn) {
            resetBtn.addEventListener('click', function () {
                document.querySelectorAll('#tool-interface input[type="number"]').forEach(el => el.value = '');
                [c1res, c2res, c3res, c4res, c5res, c6res].forEach(resetResult);
            });
        }
    });
})();

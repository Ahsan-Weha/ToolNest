(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        // ── Tab Switching ──
        const tabs = document.querySelectorAll('.calc-tab');
        const panels = document.querySelectorAll('.tab-panel');
        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                this.classList.add('active');
                const panelId = 'tab-' + this.dataset.tab;
                document.getElementById(panelId).classList.add('active');
            });
        });

        // ═══════════════════════════════════════
        // TAB 1: Add / Subtract Time Durations
        // ═══════════════════════════════════════
        const durationRows = document.getElementById('duration-rows');
        const addRowBtn = document.getElementById('add-row-btn');
        const clearRowsBtn = document.getElementById('clear-rows-btn');
        const addResult = document.getElementById('add-result');
        const addResultValue = document.getElementById('add-result-value');
        const addResultBreakdown = document.getElementById('add-result-breakdown');
        const addError = document.getElementById('add-error');

        let rowCount = 0;

        function addDurationRow(h = 0, m = 0, s = 0, op = '+') {
            rowCount++;
            const row = document.createElement('div');
            row.className = 'duration-row';
            row.dataset.id = rowCount;
            row.innerHTML = `
                <select class="input row-op" style="width:auto;padding:4px 8px;height:auto;" ${rowCount === 1 ? 'disabled style="opacity:0.5;width:auto;padding:4px 8px;height:auto;"' : ''}>
                    <option value="+" ${op === '+' ? 'selected' : ''}>+</option>
                    <option value="-" ${op === '-' ? 'selected' : ''}>−</option>
                </select>
                <div>
                    <input type="number" class="input row-h" placeholder="h" value="${h}" min="0" step="1" style="text-align:center;">
                    <span class="text-xs text-muted" style="display:block;text-align:center;margin-top:2px;">hours</span>
                </div>
                <div>
                    <input type="number" class="input row-m" placeholder="m" value="${m}" min="0" max="59" step="1" style="text-align:center;">
                    <span class="text-xs text-muted" style="display:block;text-align:center;margin-top:2px;">minutes</span>
                </div>
                <div>
                    <input type="number" class="input row-s" placeholder="s" value="${s}" min="0" max="59" step="1" style="text-align:center;">
                    <span class="text-xs text-muted" style="display:block;text-align:center;margin-top:2px;">seconds</span>
                </div>
                ${rowCount > 1 ? `<button class="btn btn-ghost btn-sm remove-row-btn" aria-label="Remove" style="padding:4px 8px;color:var(--error);">✕</button>` : '<div></div>'}
            `;
            row.querySelectorAll('input, select').forEach(el => el.addEventListener('input', calcAddSubtract));
            row.querySelectorAll('select').forEach(el => el.addEventListener('change', calcAddSubtract));
            const removeBtn = row.querySelector('.remove-row-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => { row.remove(); calcAddSubtract(); });
            }
            durationRows.appendChild(row);
            calcAddSubtract();
        }

        function calcAddSubtract() {
            addError.style.display = 'none';
            const rows = durationRows.querySelectorAll('.duration-row');
            if (rows.length === 0) { addResult.style.display = 'none'; return; }

            let totalSeconds = 0;
            let valid = true;
            const parts = [];

            rows.forEach((row, i) => {
                const op = i === 0 ? '+' : (row.querySelector('.row-op').value || '+');
                const h = parseFloat(row.querySelector('.row-h').value) || 0;
                const m = parseFloat(row.querySelector('.row-m').value) || 0;
                const s = parseFloat(row.querySelector('.row-s').value) || 0;

                if (h < 0 || m < 0 || s < 0) { valid = false; return; }

                const rowSeconds = h * 3600 + m * 60 + s;
                if (op === '+') totalSeconds += rowSeconds;
                else totalSeconds -= rowSeconds;

                parts.push(`${op === '+' ? '+' : '−'} ${h}h ${m}m ${s}s`);
            });

            if (!valid) {
                addError.textContent = 'Time values cannot be negative.';
                addError.style.display = 'block';
                addResult.style.display = 'none';
                return;
            }

            const negative = totalSeconds < 0;
            const abs = Math.abs(totalSeconds);
            const rh = Math.floor(abs / 3600);
            const rm = Math.floor((abs % 3600) / 60);
            const rs = Math.floor(abs % 60);

            addResultValue.textContent = `${negative ? '−' : ''}${rh}h ${rm}m ${rs}s`;
            addResultBreakdown.textContent = `= ${negative ? '−' : ''}${Math.abs(Math.round(totalSeconds)).toLocaleString()} seconds total`;
            addResult.style.display = 'block';
        }

        addRowBtn.addEventListener('click', () => addDurationRow());
        clearRowsBtn.addEventListener('click', () => {
            durationRows.innerHTML = '';
            rowCount = 0;
            addResult.style.display = 'none';
            addDurationRow(1, 30, 0);
            addDurationRow(0, 45, 30, '+');
        });

        // Init with 2 rows
        addDurationRow(1, 30, 0);
        addDurationRow(0, 45, 30, '+');


        // ═══════════════════════════════════════
        // TAB 2: Date/Time Difference
        // ═══════════════════════════════════════
        const diffStart = document.getElementById('diff-start');
        const diffEnd = document.getElementById('diff-end');
        const diffCalcBtn = document.getElementById('diff-calc-btn');
        const diffResetBtn = document.getElementById('diff-reset-btn');
        const diffNowBtn = document.getElementById('diff-now-btn');
        const diffError = document.getElementById('diff-error');
        const diffResult = document.getElementById('diff-result');

        function toLocalDatetimeString(d) {
            const pad = n => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }

        // Set default: start = yesterday, end = now
        const now = new Date();
        const yesterday = new Date(now - 86400000);
        diffStart.value = toLocalDatetimeString(yesterday);
        diffEnd.value = toLocalDatetimeString(now);

        diffNowBtn.addEventListener('click', () => {
            diffEnd.value = toLocalDatetimeString(new Date());
        });

        function calcDifference() {
            diffError.style.display = 'none';
            if (!diffStart.value || !diffEnd.value) {
                diffError.textContent = 'Please enter both start and end date/time.';
                diffError.style.display = 'block';
                diffResult.style.display = 'none';
                return;
            }

            const start = new Date(diffStart.value);
            const end = new Date(diffEnd.value);

            if (isNaN(start) || isNaN(end)) {
                diffError.textContent = 'Invalid date/time format.';
                diffError.style.display = 'block';
                diffResult.style.display = 'none';
                return;
            }

            const earlier = start <= end ? start : end;
            const later = start <= end ? end : start;
            const negative = start > end;

            const diffMs = later - earlier;
            const totalSeconds = Math.floor(diffMs / 1000);
            const totalMinutes = Math.floor(diffMs / 60000);
            const totalHours = Math.floor(diffMs / 3600000);
            const totalDays = Math.floor(diffMs / 86400000);
            const totalWeeks = Math.floor(totalDays / 7);

            // Workdays estimate (Mon-Fri)
            let workdays = 0;
            const cursor = new Date(earlier);
            while (cursor < later) {
                const dow = cursor.getDay();
                if (dow !== 0 && dow !== 6) workdays++;
                cursor.setDate(cursor.getDate() + 1);
            }

            // Years/months breakdown
            let years = later.getFullYear() - earlier.getFullYear();
            let months = later.getMonth() - earlier.getMonth();
            if (months < 0) { years--; months += 12; }

            const d = later.getDate() - earlier.getDate();
            const remainingDays = d < 0 ? totalDays - Math.floor((months > 0 ? months : 0) * 30.44) : d;

            const h = Math.floor((diffMs % 86400000) / 3600000);
            const m = Math.floor((diffMs % 3600000) / 60000);
            const s = Math.floor((diffMs % 60000) / 1000);

            document.getElementById('diff-result-main').textContent =
                `${negative ? '−' : ''}${years > 0 ? years + 'y ' : ''}${months > 0 ? months + 'mo ' : ''}${totalDays % 365}d ${h}h ${m}m ${s}s`;
            document.getElementById('diff-years').textContent = years.toLocaleString();
            document.getElementById('diff-months').textContent = (years * 12 + months).toLocaleString();
            document.getElementById('diff-days').textContent = totalDays.toLocaleString();
            document.getElementById('diff-hours').textContent = totalHours.toLocaleString();
            document.getElementById('diff-minutes').textContent = totalMinutes.toLocaleString();
            document.getElementById('diff-seconds').textContent = totalSeconds.toLocaleString();
            document.getElementById('diff-weeks').textContent = totalWeeks.toLocaleString();
            document.getElementById('diff-workdays').textContent = workdays.toLocaleString();

            diffResult.style.display = 'block';
        }

        diffCalcBtn.addEventListener('click', calcDifference);
        [diffStart, diffEnd].forEach(el => el.addEventListener('change', () => {
            if (diffStart.value && diffEnd.value) calcDifference();
        }));

        diffResetBtn.addEventListener('click', () => {
            const n = new Date();
            diffStart.value = toLocalDatetimeString(new Date(n - 86400000));
            diffEnd.value = toLocalDatetimeString(n);
            diffResult.style.display = 'none';
            diffError.style.display = 'none';
        });

        // Auto-calculate on load
        calcDifference();


        // ═══════════════════════════════════════
        // TAB 3: Time Conversion
        // ═══════════════════════════════════════
        const convAmount = document.getElementById('conv-amount');
        const convUnit = document.getElementById('conv-unit');

        // Conversion factors to seconds
        const TO_SECONDS = {
            seconds: 1,
            minutes: 60,
            hours: 3600,
            days: 86400,
            weeks: 604800,
            months: 2629746,   // avg month (365.25/12 days)
            years: 31557600    // avg year (365.25 days)
        };

        function calcConversion() {
            const val = parseFloat(convAmount.value);
            const unit = convUnit.value;
            if (isNaN(val) || val < 0) return;

            const totalSeconds = val * TO_SECONDS[unit];
            const fmt = n => {
                if (n >= 1e12) return (n / 1e12).toFixed(3) + 'T';
                if (n >= 1e9) return (n / 1e9).toFixed(3) + 'B';
                if (n >= 1e6) return (n / 1e6).toFixed(3) + 'M';
                if (n >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
                return parseFloat(n.toFixed(6)).toString();
            };

            document.getElementById('cv-milliseconds').textContent = fmt(totalSeconds * 1000);
            document.getElementById('cv-seconds').textContent = fmt(totalSeconds);
            document.getElementById('cv-minutes').textContent = fmt(totalSeconds / 60);
            document.getElementById('cv-hours').textContent = fmt(totalSeconds / 3600);
            document.getElementById('cv-days').textContent = fmt(totalSeconds / 86400);
            document.getElementById('cv-weeks').textContent = fmt(totalSeconds / 604800);
            document.getElementById('cv-months').textContent = fmt(totalSeconds / TO_SECONDS.months);
            document.getElementById('cv-years').textContent = fmt(totalSeconds / TO_SECONDS.years);
        }

        convAmount.addEventListener('input', calcConversion);
        convUnit.addEventListener('change', calcConversion);

        // Initial calculation
        calcConversion();
    });
})();

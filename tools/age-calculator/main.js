(function () {
    'use strict';
    document.addEventListener('DOMContentLoaded', function () {
        const dobInput = document.getElementById('dob-input');
        const targetDateInput = document.getElementById('target-date-input');
        const btnCalculate = document.getElementById('btn-calculate');
        const resetBtn = document.getElementById('reset-btn');
        const resultsSection = document.getElementById('results-section');
        const primaryResult = document.getElementById('primary-result');
        const birthdayNote = document.getElementById('birthday-note');
        const statMonths = document.getElementById('stat-months');
        const statWeeks = document.getElementById('stat-weeks');
        const statDays = document.getElementById('stat-days');
        const statNextBirthday = document.getElementById('stat-next-birthday');
        const errorMsg = document.getElementById('error-msg');

        // Set today's date as default for target date
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        targetDateInput.value = todayStr;

        function showError(msg) {
            errorMsg.textContent = msg;
            errorMsg.style.display = 'block';
            resultsSection.style.display = 'none';
        }

        function hideError() {
            errorMsg.style.display = 'none';
        }

        function formatNumber(n) {
            return n.toLocaleString();
        }

        function calculate() {
            hideError();
            const dobVal = dobInput.value;
            const targetVal = targetDateInput.value;

            if (!dobVal) { showError('Please enter a date of birth.'); return; }
            if (!targetVal) { showError('Please enter a target date.'); return; }

            const dob = new Date(dobVal + 'T00:00:00');
            const target = new Date(targetVal + 'T00:00:00');

            if (dob >= target) { showError('Date of birth must be before the target date.'); return; }

            // Exact years, months, days
            let years = target.getFullYear() - dob.getFullYear();
            let months = target.getMonth() - dob.getMonth();
            let days = target.getDate() - dob.getDate();

            if (days < 0) {
                months--;
                // Days in previous month of target
                const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
                days += prevMonth.getDate();
            }
            if (months < 0) {
                years--;
                months += 12;
            }

            primaryResult.textContent = `${years} years, ${months} months, ${days} days`;

            // Total stats
            const msPerDay = 1000 * 60 * 60 * 24;
            const totalDays = Math.floor((target - dob) / msPerDay);
            const totalWeeks = Math.floor(totalDays / 7);
            const totalMonths = years * 12 + months;

            statDays.textContent = formatNumber(totalDays);
            statWeeks.textContent = formatNumber(totalWeeks);
            statMonths.textContent = formatNumber(totalMonths);

            // Next birthday
            let nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
            if (nextBirthday <= today) {
                nextBirthday = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
            }
            const daysToNextBirthday = Math.ceil((nextBirthday - today) / msPerDay);
            statNextBirthday.textContent = daysToNextBirthday === 0 ? '🎂 Today!' : formatNumber(daysToNextBirthday);

            birthdayNote.textContent = daysToNextBirthday === 0
                ? '🎉 Happy Birthday!'
                : `Next birthday in ${daysToNextBirthday} day${daysToNextBirthday === 1 ? '' : 's'}`;

            resultsSection.style.display = 'block';
        }

        btnCalculate.addEventListener('click', calculate);

        resetBtn.addEventListener('click', function () {
            dobInput.value = '';
            targetDateInput.value = todayStr;
            resultsSection.style.display = 'none';
            hideError();
        });

        // Allow auto-calculate on date change
        dobInput.addEventListener('change', function () { if (dobInput.value && targetDateInput.value) calculate(); });
        targetDateInput.addEventListener('change', function () { if (dobInput.value && targetDateInput.value) calculate(); });
    });
})();

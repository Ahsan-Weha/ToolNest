(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        let currentUnit = 'metric';

        const tabMetric = document.getElementById('tab-metric');
        const tabImperial = document.getElementById('tab-imperial');
        const metricInputs = document.getElementById('metric-inputs');
        const imperialInputs = document.getElementById('imperial-inputs');
        const weightKg = document.getElementById('weight-kg');
        const heightCm = document.getElementById('height-cm');
        const weightLbs = document.getElementById('weight-lbs');
        const heightFt = document.getElementById('height-ft');
        const heightIn = document.getElementById('height-in');
        const btnCalculate = document.getElementById('btn-calculate');
        const resetBtn = document.getElementById('reset-btn');
        const errorMsg = document.getElementById('error-msg');
        const resultsSection = document.getElementById('results-section');
        const bmiValue = document.getElementById('bmi-value');
        const bmiCategory = document.getElementById('bmi-category');
        const bmiNote = document.getElementById('bmi-note');
        const bmiNeedle = document.getElementById('bmi-needle');
        const healthyRangeSection = document.getElementById('healthy-range-section');
        const healthyRange = document.getElementById('healthy-range');

        // Unit toggle
        [tabMetric, tabImperial].forEach(tab => {
            tab.addEventListener('click', function () {
                currentUnit = this.dataset.unit;
                tabMetric.classList.toggle('active', currentUnit === 'metric');
                tabImperial.classList.toggle('active', currentUnit === 'imperial');
                metricInputs.style.display = currentUnit === 'metric' ? '' : 'none';
                imperialInputs.style.display = currentUnit === 'imperial' ? '' : 'none';
                resultsSection.style.display = 'none';
                hideError();
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

        function getBMICategory(bmi) {
            if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6', note: 'You may be underweight. Consider consulting a healthcare provider.' };
            if (bmi < 25)   return { label: 'Normal Weight', color: '#22c55e', note: 'Your weight is in the healthy range. Keep it up!' };
            if (bmi < 30)   return { label: 'Overweight', color: '#eab308', note: 'You are slightly above the healthy weight range.' };
            if (bmi < 35)   return { label: 'Obese (Class I)', color: '#ef4444', note: 'Health risks increase significantly at this BMI.' };
            if (bmi < 40)   return { label: 'Obese (Class II)', color: '#dc2626', note: 'Serious health risks. Please consult a healthcare provider.' };
            return { label: 'Obese (Class III)', color: '#7f1d1d', note: 'Severe health risks. Medical consultation is strongly advised.' };
        }

        // Needle rotation: map BMI 10–40+ to -90° to +90° arc
        function bmiToAngle(bmi) {
            // Map BMI range 10-45 to -90 to +90 degrees
            const minBMI = 10, maxBMI = 45;
            const clamped = Math.max(minBMI, Math.min(maxBMI, bmi));
            return ((clamped - minBMI) / (maxBMI - minBMI)) * 180 - 90;
        }

        function animateNeedle(bmi) {
            const angle = bmiToAngle(bmi);
            bmiNeedle.style.transform = `rotate(${angle}deg)`;
        }

        function calculate() {
            hideError();
            let weightKgVal, heightMVal;

            if (currentUnit === 'metric') {
                weightKgVal = parseFloat(weightKg.value);
                const hcm = parseFloat(heightCm.value);
                if (isNaN(weightKgVal) || weightKgVal <= 0) { showError('Please enter a valid weight in kg.'); return; }
                if (isNaN(hcm) || hcm <= 0) { showError('Please enter a valid height in cm.'); return; }
                heightMVal = hcm / 100;
            } else {
                const lbs = parseFloat(weightLbs.value);
                const ft = parseFloat(heightFt.value) || 0;
                const inch = parseFloat(heightIn.value) || 0;
                if (isNaN(lbs) || lbs <= 0) { showError('Please enter a valid weight in lbs.'); return; }
                if (ft <= 0 && inch <= 0) { showError('Please enter a valid height.'); return; }
                weightKgVal = lbs * 0.453592;
                heightMVal = (ft * 12 + inch) * 0.0254;
            }

            if (heightMVal < 0.5 || heightMVal > 3) { showError('Height seems out of range. Please check your input.'); return; }
            if (weightKgVal < 1 || weightKgVal > 500) { showError('Weight seems out of range. Please check your input.'); return; }

            const bmi = weightKgVal / (heightMVal * heightMVal);
            const cat = getBMICategory(bmi);

            bmiValue.textContent = bmi.toFixed(1);
            bmiCategory.textContent = cat.label;
            bmiCategory.style.color = cat.color;
            bmiNote.textContent = cat.note;
            animateNeedle(bmi);

            // Healthy weight range for this height
            const minHealthyKg = 18.5 * heightMVal * heightMVal;
            const maxHealthyKg = 24.9 * heightMVal * heightMVal;
            if (currentUnit === 'metric') {
                healthyRange.textContent = `${minHealthyKg.toFixed(1)} kg – ${maxHealthyKg.toFixed(1)} kg`;
            } else {
                const minLbs = (minHealthyKg / 0.453592).toFixed(1);
                const maxLbs = (maxHealthyKg / 0.453592).toFixed(1);
                healthyRange.textContent = `${minLbs} lbs – ${maxLbs} lbs`;
            }
            healthyRangeSection.style.display = 'block';
            resultsSection.style.display = 'block';
        }

        // Auto calculate on input
        [weightKg, heightCm, weightLbs, heightFt, heightIn].forEach(el => {
            el.addEventListener('input', function () {
                if (resultsSection.style.display !== 'none') calculate();
            });
        });

        btnCalculate.addEventListener('click', calculate);

        resetBtn.addEventListener('click', function () {
            [weightKg, heightCm, weightLbs, heightFt, heightIn].forEach(el => el.value = '');
            resultsSection.style.display = 'none';
            healthyRangeSection.style.display = 'none';
            hideError();
            // Reset needle
            if (bmiNeedle) bmiNeedle.style.transform = 'rotate(-90deg)';
        });

        // Init needle position
        if (bmiNeedle) bmiNeedle.style.transform = 'rotate(-90deg)';
    });
})();

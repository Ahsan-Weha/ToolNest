(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const scaleSelect = document.getElementById('opt-scale');
        const addCourseBtn = document.getElementById('add-course-btn');
        const coursesContainer = document.getElementById('courses-container');
        const btnCalculate = document.getElementById('btn-calculate');
        const resetBtn = document.getElementById('reset-btn');
        const resultsSection = document.getElementById('results-section');
        const gpaResult = document.getElementById('gpa-result');
        const gpaLabel = document.getElementById('gpa-label');
        const gpaCredits = document.getElementById('gpa-credits');
        const errorMsg = document.getElementById('error-msg');

        // Grade lookup tables
        const gradePoints4 = {
            'A+': 4.0, 'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0, 'F': 0.0
        };
        const gradePoints5 = {
            'A+': 5.0, 'A': 5.0, 'A-': 4.7,
            'B+': 4.3, 'B': 4.0, 'B-': 3.7,
            'C+': 3.3, 'C': 3.0, 'C-': 2.7,
            'D+': 2.3, 'D': 2.0, 'F': 0.0
        };

        let courseCount = 0;

        function getGradeOptions(scale) {
            const grades = scale === '5.0' ? gradePoints5 : gradePoints4;
            return Object.keys(grades).map(g => `<option value="${g}">${g} (${grades[g].toFixed(1)})</option>`).join('');
        }

        function addCourse(courseName = '', credits = 3, grade = 'A') {
            courseCount++;
            const row = document.createElement('div');
            row.className = 'course-row';
            row.dataset.id = courseCount;
            row.style.cssText = 'display:grid; grid-template-columns: 1fr auto auto auto; gap: 8px; align-items: center; padding: var(--spacing-15); background: var(--bg-main); border-radius: var(--radius-sm); border: 1px solid var(--border-color);';
            row.innerHTML = `
                <input type="text" class="input course-name" placeholder="Course Name (optional)" value="${courseName}" style="min-width:0;">
                <input type="number" class="input course-credits" placeholder="Credits" value="${credits}" min="0.5" max="20" step="0.5" style="width:80px;">
                <select class="input course-grade" style="width:auto; padding:6px 8px; height:auto;">
                    ${getGradeOptions(scaleSelect.value)}
                </select>
                <button class="btn btn-ghost btn-sm remove-course-btn" aria-label="Remove course" style="padding:6px; color: var(--error);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            `;
            // Set grade
            const gradeSelect = row.querySelector('.course-grade');
            if (grade && gradeSelect.querySelector(`option[value="${grade}"]`)) {
                gradeSelect.value = grade;
            }
            // Remove button
            row.querySelector('.remove-course-btn').addEventListener('click', function () {
                row.remove();
                autoCalculate();
            });
            // Auto-calculate on change
            row.querySelectorAll('input, select').forEach(el => {
                el.addEventListener('input', autoCalculate);
                el.addEventListener('change', autoCalculate);
            });
            coursesContainer.appendChild(row);
            autoCalculate();
        }

        function updateGradeOptions() {
            coursesContainer.querySelectorAll('.course-grade').forEach(sel => {
                const currentVal = sel.value;
                sel.innerHTML = getGradeOptions(scaleSelect.value);
                if (sel.querySelector(`option[value="${currentVal}"]`)) {
                    sel.value = currentVal;
                }
            });
            autoCalculate();
        }

        function showError(msg) {
            errorMsg.textContent = msg;
            errorMsg.style.display = 'block';
            resultsSection.style.display = 'none';
        }

        function hideError() {
            errorMsg.style.display = 'none';
        }

        function getGradeLabel(gpa, scale) {
            const maxScale = parseFloat(scale);
            const ratio = gpa / maxScale;
            if (ratio >= 0.925) return '🏆 Outstanding';
            if (ratio >= 0.825) return '⭐ Excellent';
            if (ratio >= 0.725) return '✅ Good Standing';
            if (ratio >= 0.625) return '📘 Satisfactory';
            if (ratio >= 0.5) return '⚠️ Needs Improvement';
            return '❌ Below Passing';
        }

        function calculate() {
            hideError();
            const scale = scaleSelect.value;
            const gradePoints = scale === '5.0' ? gradePoints5 : gradePoints4;
            const rows = coursesContainer.querySelectorAll('.course-row');

            if (rows.length === 0) {
                showError('Please add at least one course.');
                return;
            }

            let totalPoints = 0;
            let totalCredits = 0;
            let valid = true;

            rows.forEach((row, i) => {
                const creditsEl = row.querySelector('.course-credits');
                const gradeEl = row.querySelector('.course-grade');
                const credits = parseFloat(creditsEl.value);
                const grade = gradeEl.value;

                if (isNaN(credits) || credits <= 0) {
                    creditsEl.style.borderColor = 'var(--error)';
                    valid = false;
                } else {
                    creditsEl.style.borderColor = '';
                }

                if (valid) {
                    const points = gradePoints[grade] !== undefined ? gradePoints[grade] : 0;
                    totalPoints += points * credits;
                    totalCredits += credits;
                }
            });

            if (!valid) {
                showError('Please enter valid credit hours for all courses (must be > 0).');
                return;
            }

            if (totalCredits === 0) {
                showError('Total credit hours cannot be zero.');
                return;
            }

            const gpa = totalPoints / totalCredits;
            gpaResult.textContent = gpa.toFixed(2);
            gpaLabel.textContent = getGradeLabel(gpa, scale);
            gpaCredits.textContent = totalCredits % 1 === 0 ? totalCredits : totalCredits.toFixed(1);
            resultsSection.style.display = 'block';
        }

        function autoCalculate() {
            const rows = coursesContainer.querySelectorAll('.course-row');
            if (rows.length > 0) calculate();
        }

        // Init with 3 default courses
        addCourse('Mathematics', 3, 'A');
        addCourse('Physics', 3, 'B+');
        addCourse('English', 2, 'A-');

        addCourseBtn.addEventListener('click', function () {
            addCourse('', 3, 'A');
        });

        btnCalculate.addEventListener('click', calculate);

        scaleSelect.addEventListener('change', updateGradeOptions);

        resetBtn.addEventListener('click', function () {
            coursesContainer.innerHTML = '';
            courseCount = 0;
            resultsSection.style.display = 'none';
            hideError();
            addCourse('Mathematics', 3, 'A');
            addCourse('Physics', 3, 'B+');
            addCourse('English', 2, 'A-');
        });
    });
})();

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const inputText = document.getElementById('input-text');
        const outputText = document.getElementById('output-text');
        const activeModeBadge = document.getElementById('active-mode-badge');
        
        const loadSampleBtn = document.getElementById('load-sample-btn');
        const clearBtn = document.getElementById('clear-btn');
        const resetBtn = document.getElementById('reset-btn');
        const copyBtn = document.getElementById('copy-btn');
        const caseBtns = document.querySelectorAll('[data-mode]');

        let currentMode = 'upper'; // Default mode

        const SAMPLE_TEXT = `hello world! welcome to toolnest's case converter.
this is a sample sentence showing how the tool functions.
feel free to click on different buttons below to change my case structure instantly.`;

        // Helper conversion functions
        const minorWords = /^(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v\.?|via|vs\.?)$/i;
        
        function toTitleCase(str) {
            return str.toLowerCase().replace(/[a-zA-Z0-9'\u00C0-\u00FF]+/g, function(word, index, full) {
                if (index > 0 && index + word.length !== full.length &&
                    word.search(minorWords) > -1 &&
                    full.charAt(index - 2) !== ":" &&
                    (full.charAt(index + word.length) !== '-' || full.charAt(index - 1) === '-') &&
                    full.charAt(index - 1).search(/[^\s-]/) < 0) {
                    return word.toLowerCase();
                }
                return word.charAt(0).toUpperCase() + word.substr(1);
            });
        }

        function toSentenceCase(str) {
            return str.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g, function(match, p1, p2) {
                return p1 + p2.toUpperCase();
            });
        }

        function toCapitalizedCase(str) {
            return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        }

        function toCamelCase(str) {
            return str.toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
                .replace(/[^a-zA-Z0-9]/g, '')
                .replace(/^(.)/, l => l.toLowerCase());
        }

        function toSnakeCase(str) {
            return str.toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, '');
        }

        function toKebabCase(str) {
            return str.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
        }

        function toAlternatingCase(str) {
            return str.split('').map((char, index) => {
                return index % 2 === 0 ? char.toLowerCase() : char.toUpperCase();
            }).join('');
        }

        function runConversion() {
            const val = inputText.value || '';
            let converted = '';

            switch (currentMode) {
                case 'upper':
                    converted = val.toUpperCase();
                    activeModeBadge.textContent = 'UPPERCASE';
                    break;
                case 'lower':
                    converted = val.toLowerCase();
                    activeModeBadge.textContent = 'lowercase';
                    break;
                case 'title':
                    converted = toTitleCase(val);
                    activeModeBadge.textContent = 'Title Case';
                    break;
                case 'sentence':
                    converted = toSentenceCase(val);
                    activeModeBadge.textContent = 'Sentence case';
                    break;
                case 'capitalized':
                    converted = toCapitalizedCase(val);
                    activeModeBadge.textContent = 'Capitalized Case';
                    break;
                case 'camel':
                    converted = toCamelCase(val);
                    activeModeBadge.textContent = 'camelCase';
                    break;
                case 'snake':
                    converted = toSnakeCase(val);
                    activeModeBadge.textContent = 'snake_case';
                    break;
                case 'kebab':
                    converted = toKebabCase(val);
                    activeModeBadge.textContent = 'kebab-case';
                    break;
                case 'alternating':
                    converted = toAlternatingCase(val);
                    activeModeBadge.textContent = 'Alternating Case';
                    break;
                default:
                    converted = val;
                    activeModeBadge.textContent = 'No Conversion';
            }

            outputText.value = converted;
        }

        inputText.addEventListener('input', runConversion);

        caseBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                caseBtns.forEach(b => b.classList.remove('active', 'btn-primary'));
                caseBtns.forEach(b => b.classList.add('btn-secondary'));
                
                btn.classList.remove('btn-secondary');
                btn.classList.add('btn-primary', 'active');
                
                currentMode = btn.getAttribute('data-mode');
                runConversion();
            });
        });

        loadSampleBtn.addEventListener('click', function () {
            inputText.value = SAMPLE_TEXT;
            runConversion();
            if (window.TN && window.TN.toast) {
                window.TN.toast.success('Sample text loaded.');
            }
        });

        clearBtn.addEventListener('click', function () {
            inputText.value = '';
            runConversion();
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Input cleared.');
            }
        });

        resetBtn.addEventListener('click', function () {
            inputText.value = '';
            currentMode = 'upper';
            caseBtns.forEach(b => {
                b.classList.remove('active', 'btn-primary');
                b.classList.add('btn-secondary');
            });
            const defaultBtn = document.querySelector('[data-mode="upper"]');
            if (defaultBtn) {
                defaultBtn.classList.remove('btn-secondary');
                defaultBtn.classList.add('btn-primary', 'active');
            }
            runConversion();
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Reset completed.');
            }
        });

        copyBtn.addEventListener('click', function () {
            if (!outputText.value) {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Nothing to copy.');
                }
                return;
            }
            navigator.clipboard.writeText(outputText.value).then(function () {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.success('Converted output copied!');
                }
            }).catch(function () {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Copy failed.');
                }
            });
        });

        // Trigger default initial conversion
        const defaultBtn = document.querySelector('[data-mode="upper"]');
        if (defaultBtn) {
            defaultBtn.classList.remove('btn-secondary');
            defaultBtn.classList.add('btn-primary', 'active');
        }
        runConversion();
    });
})();

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        // --- Lorem ipsum word bank ---
        const LOREM_WORDS = [
            'lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do',
            'eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim',
            'ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi',
            'aliquip','ex','ea','commodo','consequat','duis','aute','irure','in','reprehenderit',
            'voluptate','velit','esse','cillum','fugiat','nulla','pariatur','excepteur','sint',
            'occaecat','cupidatat','non','proident','sunt','culpa','qui','officia','deserunt',
            'mollit','anim','id','est','laborum','at','vero','eos','accusamus','accusantium',
            'doloremque','laudantium','totam','rem','aperiam','eaque','ipsa','quae','ab','illo',
            'inventore','veritatis','quasi','architecto','beatae','vitae','dicta','explicabo',
            'nemo','ipsam','voluptatem','quia','voluptas','aspernatur','odit','fugit','modi',
            'tempora','incidunt','magnam','aliquam','quaerat','minima','nostrum','exercitationem',
            'ullam','corporis','suscipit','laboriosam','nisi','aliquid','ex','ea','commodi',
            'consequatur','quis','autem','vel','eum','iure','reprehenderit','qui','voluptatem',
            'sequi','nesciunt','neque','porro','quisquam','dolorem','adipisci','velit','numquam',
            'eius','modi','tempora','incidunt','quaerat','rerum','facilis','dolores','distinctio',
            'nam','libero','tempore','cum','soluta','nobis','eligendi','cumque','nihil',
            'impedit','quo','minus','placeat','facere','possimus','assumenda','repellendus',
            'temporibus','autem','quibusdam','officiis','debitis','rerum','necessitatibus',
            'saepe','eveniet','voluptates','repudiandae','molestiae','itaque','earum','rerum',
        ];

        const LOREM_START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

        // Controls
        const outputText = document.getElementById('output-text');
        const generateBtn = document.getElementById('generate-btn');
        const copyBtn = document.getElementById('copy-btn');
        const resetBtn = document.getElementById('reset-btn');
        const qtyInput = document.getElementById('qty-input');
        const qtyMinus = document.getElementById('qty-minus');
        const qtyPlus = document.getElementById('qty-plus');
        const optStartLorem = document.getElementById('opt-start-lorem');
        const typeTabs = document.querySelectorAll('.type-tab');

        const statWords = document.getElementById('stat-words');
        const statSentences = document.getElementById('stat-sentences');
        const statParagraphs = document.getElementById('stat-paragraphs');
        const statChars = document.getElementById('stat-chars');

        let currentType = 'paragraphs';

        // --- Helpers ---
        function randomWord() {
            return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
        }

        function randomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        function generateSentence(forceCapitalize) {
            const wordCount = randomInt(6, 18);
            const words = [];
            for (let i = 0; i < wordCount; i++) {
                words.push(randomWord());
            }
            const sentence = words.join(' ');
            return (forceCapitalize ? capitalize(sentence) : sentence) + '.';
        }

        function generateParagraph(startLorem, isFirst) {
            const sentCount = randomInt(3, 6);
            const sentences = [];
            for (let i = 0; i < sentCount; i++) {
                sentences.push(generateSentence(true));
            }
            let para = sentences.join(' ');
            if (isFirst && startLorem) {
                // Prepend the classic opening
                para = LOREM_START + ' ' + sentences.slice(1).join(' ');
            }
            return para;
        }

        function generateWords(count, startLorem) {
            const words = [];
            for (let i = 0; i < count; i++) {
                words.push(randomWord());
            }
            let text = words.join(' ');
            if (startLorem) {
                const loremWords = LOREM_START.replace(/[.,]/g, '').toLowerCase().split(' ');
                const merged = [...loremWords, ...words].slice(0, count);
                text = merged.join(' ');
            }
            return capitalize(text) + '.';
        }

        function generateSentences(count, startLorem) {
            const sentences = [];
            for (let i = 0; i < count; i++) {
                sentences.push(generateSentence(true));
            }
            let text = sentences.join(' ');
            if (startLorem) {
                text = LOREM_START + ' ' + sentences.slice(1).join(' ');
            }
            return text;
        }

        function generateBullets(count, startLorem) {
            const lines = [];
            for (let i = 0; i < count; i++) {
                const wordCount = randomInt(4, 10);
                const words = [];
                for (let j = 0; j < wordCount; j++) {
                    words.push(randomWord());
                }
                let line = capitalize(words.join(' '));
                lines.push('• ' + line);
            }
            if (startLorem) {
                lines[0] = '• Lorem ipsum dolor sit amet, consectetur adipiscing elit';
            }
            return lines.join('\n');
        }

        function countStats(text) {
            if (!text) {
                statWords.textContent = 0;
                statSentences.textContent = 0;
                statParagraphs.textContent = 0;
                statChars.textContent = 0;
                return;
            }
            const wordCount = text.trim().split(/\s+/).filter(w => w).length;
            const sentCount = (text.match(/[.!?]+/g) || []).length;
            const paraCount = text.split(/\n\n+/).filter(p => p.trim()).length || 1;
            statWords.textContent = wordCount;
            statSentences.textContent = sentCount;
            statParagraphs.textContent = paraCount;
            statChars.textContent = text.length;
        }

        function generate() {
            const qty = Math.max(1, Math.min(100, parseInt(qtyInput.value, 10) || 3));
            qtyInput.value = qty;
            const startLorem = optStartLorem.checked;
            let result = '';

            switch (currentType) {
                case 'paragraphs': {
                    const paras = [];
                    for (let i = 0; i < qty; i++) {
                        paras.push(generateParagraph(startLorem, i === 0));
                    }
                    result = paras.join('\n\n');
                    break;
                }
                case 'sentences':
                    result = generateSentences(qty, startLorem);
                    break;
                case 'words':
                    result = generateWords(qty, startLorem);
                    break;
                case 'bullets':
                    result = generateBullets(qty, startLorem);
                    break;
            }

            outputText.value = result;
            countStats(result);
        }

        // Type tab switching
        typeTabs.forEach(tab => {
            tab.addEventListener('click', function () {
                typeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentType = tab.getAttribute('data-type');
            });
        });

        // Quantity controls
        qtyMinus.addEventListener('click', function () {
            const val = parseInt(qtyInput.value, 10) || 1;
            qtyInput.value = Math.max(1, val - 1);
        });

        qtyPlus.addEventListener('click', function () {
            const val = parseInt(qtyInput.value, 10) || 1;
            qtyInput.value = Math.min(100, val + 1);
        });

        qtyInput.addEventListener('input', function () {
            let val = parseInt(qtyInput.value, 10);
            if (isNaN(val) || val < 1) val = 1;
            if (val > 100) val = 100;
            qtyInput.value = val;
        });

        generateBtn.addEventListener('click', function () {
            generate();
        });

        copyBtn.addEventListener('click', function () {
            if (!outputText.value) {
                if (window.TN && window.TN.toast) window.TN.toast.error('Nothing to copy. Generate text first.');
                return;
            }
            navigator.clipboard.writeText(outputText.value).then(function () {
                if (window.TN && window.TN.toast) window.TN.toast.success('Copied to clipboard!');
            }).catch(function () {
                if (window.TN && window.TN.toast) window.TN.toast.error('Copy failed.');
            });
        });

        resetBtn.addEventListener('click', function () {
            outputText.value = '';
            qtyInput.value = 3;
            optStartLorem.checked = true;
            currentType = 'paragraphs';
            typeTabs.forEach(t => t.classList.remove('active'));
            typeTabs[0].classList.add('active');
            countStats('');
            if (window.TN && window.TN.toast) window.TN.toast.info('Reset.');
        });

        // Auto-generate on load
        generate();
    });
})();

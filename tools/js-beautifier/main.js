(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const inputText = document.getElementById('input-text');
        const outputText = document.getElementById('output-text');
        const optIndent = document.getElementById('opt-indent');
        const optBraces = document.getElementById('opt-braces');

        const btnBeautify = document.getElementById('btn-beautify');

        const loadSampleBtn = document.getElementById('load-sample-btn');
        const clearBtn = document.getElementById('clear-btn');
        const resetBtn = document.getElementById('reset-btn');
        const copyBtn = document.getElementById('copy-btn');
        const downloadBtn = document.getElementById('download-btn');

        const SAMPLE_JS = `// Sample Minified Javascript Code
function calculateSum(a,b){if(a>0&&b>0){let sum=a+b;console.log("Sum is: "+sum);return sum;}else{console.warn("Invalid parameters");return 0;}}
const myObject={name:"ToolNest",version:1,features:["private","offline"]};
for(let i=0;i<10;i++){calculateSum(i,i*2);}`;

        function beautifyJS(js, indentStr, braceStyle) {
            let result = '';
            let indentLevel = 0;
            
            let inString = false;
            let stringChar = '';
            let inSingleComment = false;
            let inMultiComment = false;
            let inForLoop = 0; 
            
            let temp = '';
            
            function getIndent(level) {
                let s = '';
                for (let idx = 0; idx < level; idx++) s += indentStr;
                return s;
            }
            
            const clean = js.trim();
            
            for (let i = 0; i < clean.length; i++) {
                const char = clean[i];
                const next = clean[i + 1];
                
                // Handle comments
                if (!inString && !inSingleComment && !inMultiComment) {
                    if (char === '/' && next === '/') {
                        inSingleComment = true;
                        temp += '//';
                        i++;
                        continue;
                    }
                    if (char === '/' && next === '*') {
                        inMultiComment = true;
                        temp += '/*';
                        i++;
                        continue;
                    }
                }
                
                if (inSingleComment) {
                    temp += char;
                    if (char === '\n') {
                        inSingleComment = false;
                        result += getIndent(indentLevel) + temp.trim() + '\n';
                        temp = '';
                    }
                    continue;
                }
                
                if (inMultiComment) {
                    temp += char;
                    if (char === '*' && next === '/') {
                        inMultiComment = false;
                        temp += '/';
                        result += getIndent(indentLevel) + temp.trim() + '\n';
                        temp = '';
                        i++;
                    }
                    continue;
                }
                
                // Handle strings
                if (!inString) {
                    if (char === '"' || char === "'" || char === '`') {
                        inString = true;
                        stringChar = char;
                        temp += char;
                        continue;
                    }
                } else {
                    temp += char;
                    if (char === stringChar && clean[i - 1] !== '\\') {
                        inString = false;
                    }
                    continue;
                }
                
                // Braces and semicolons
                if (char === '(') {
                    if (temp.trim().endsWith('for')) {
                        inForLoop++;
                    }
                    temp += char;
                } else if (char === ')') {
                    if (inForLoop > 0) inForLoop--;
                    temp += char;
                } else if (char === '{') {
                    const trimmed = temp.trim();
                    if (braceStyle === 'expand') {
                        result += (trimmed ? getIndent(indentLevel) + trimmed + '\n' : '') + getIndent(indentLevel) + '{\n';
                    } else {
                        result += (trimmed ? getIndent(indentLevel) + trimmed + ' {' : getIndent(indentLevel) + '{') + '\n';
                    }
                    indentLevel++;
                    temp = '';
                } else if (char === '}') {
                    const trimmed = temp.trim();
                    if (trimmed) {
                        result += getIndent(indentLevel) + trimmed + '\n';
                    }
                    indentLevel = Math.max(0, indentLevel - 1);
                    result += getIndent(indentLevel) + '}\n';
                    temp = '';
                } else if (char === ';') {
                    temp += char;
                    if (inForLoop === 0) {
                        result += getIndent(indentLevel) + temp.trim() + '\n';
                        temp = '';
                    }
                } else if (char === '\n' || char === '\r') {
                    if (temp.trim()) {
                        if (!temp.endsWith(' ')) temp += ' ';
                    }
                } else {
                    temp += char;
                }
            }
            
            if (temp.trim()) {
                result += getIndent(indentLevel) + temp.trim();
            }
            
            return result.split('\n')
                .map(line => line.trimRight())
                .filter((line, index, arr) => {
                    if (!line.trim() && index > 0 && !arr[index - 1].trim()) return false;
                    return true;
                })
                .join('\n');
        }

        function processBeautify() {
            const rawVal = inputText.value.trim();
            if (!rawVal) {
                outputText.value = '';
                return;
            }

            const indentVal = optIndent.value;
            let indentStr = '    ';
            if (indentVal === '2') {
                indentStr = '  ';
            } else if (indentVal === 'tabs') {
                indentStr = '\t';
            }

            const braceVal = optBraces.value;

            const formatted = beautifyJS(rawVal, indentStr, braceVal);
            outputText.value = formatted;
        }

        btnBeautify.addEventListener('click', function () {
            processBeautify();
            if (inputText.value.trim() && window.TN && window.TN.toast) {
                window.TN.toast.success('Javascript beautified successfully.');
            }
        });

        optIndent.addEventListener('change', processBeautify);
        optBraces.addEventListener('change', processBeautify);

        loadSampleBtn.addEventListener('click', function () {
            inputText.value = SAMPLE_JS;
            processBeautify();
            if (window.TN && window.TN.toast) {
                window.TN.toast.success('Sample loaded.');
            }
        });

        clearBtn.addEventListener('click', function () {
            inputText.value = '';
            outputText.value = '';
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Cleared.');
            }
        });

        resetBtn.addEventListener('click', function () {
            inputText.value = '';
            outputText.value = '';
            optIndent.value = '4';
            optBraces.value = 'collapse';
            if (window.TN && window.TN.toast) {
                window.TN.toast.info('Settings reset.');
            }
        });

        copyBtn.addEventListener('click', function () {
            if (!outputText.value) {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Nothing to copy. Beautify Javascript first.');
                }
                return;
            }
            navigator.clipboard.writeText(outputText.value).then(function () {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.success('Copied beautified script to clipboard!');
                }
            }).catch(function () {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Copy failed.');
                }
            });
        });

        downloadBtn.addEventListener('click', function () {
            if (!outputText.value) {
                if (window.TN && window.TN.toast) {
                    window.TN.toast.error('Nothing to download. Beautify Javascript first.');
                }
                return;
            }
            const blob = new Blob([outputText.value], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'beautified.js';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            if (window.TN && window.TN.toast) {
                window.TN.toast.success('Downloaded beautified.js');
            }
        });
    });
})();

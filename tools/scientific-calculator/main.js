(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const calcExpr = document.getElementById('calc-expr');
        const calcDisplay = document.getElementById('calc-display');
        const modeDeg = document.getElementById('mode-deg');
        const modeRad = document.getElementById('mode-rad');
        const memoryIndicator = document.getElementById('memory-indicator');
        const historyLog = document.getElementById('history-log');

        let expr = '';
        let result = null;
        let memory = 0;
        let angleMode = 'deg'; // deg or rad
        let newCalc = false;

        // Mode Toggles
        modeDeg.addEventListener('click', () => {
            modeDeg.classList.add('active');
            modeRad.classList.remove('active');
            angleMode = 'deg';
        });
        modeRad.addEventListener('click', () => {
            modeRad.classList.add('active');
            modeDeg.classList.remove('active');
            angleMode = 'rad';
        });

        // Set up keypad clicks
        document.querySelectorAll('.calc-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.dataset.val;
                handleInput(val);
            });
        });

        // Keyboard Support
        document.addEventListener('keydown', (e) => {
            const key = e.key;
            if (key >= '0' && key <= '9') handleInput(key);
            else if (key === '.') handleInput('.');
            else if (key === '+') handleInput('+');
            else if (key === '-') handleInput('-');
            else if (key === '*') handleInput('*');
            else if (key === '/') handleInput('/');
            else if (key === '^') handleInput('^');
            else if (key === '(' || key === ')') handleInput(key);
            else if (key === 'Enter' || key === '=') handleInput('=');
            else if (key === 'Backspace') handleInput('backspace');
            else if (key === 'Escape') handleInput('ac');
        });

        function handleInput(val) {
            if (newCalc) {
                if (['+', '-', '*', '/', '^', 'sqr', 'fact'].includes(val)) {
                    // Carry forward previous result
                    expr = calcDisplay.textContent;
                } else {
                    expr = '';
                }
                newCalc = false;
            }

            switch (val) {
                case 'ac':
                    expr = '';
                    calcExpr.textContent = '';
                    calcDisplay.textContent = '0';
                    break;
                case 'backspace':
                    if (expr.length > 0) {
                        // If deleting a function keyword, delete the whole word
                        if (expr.endsWith('sin(') || expr.endsWith('cos(') || expr.endsWith('tan(')) {
                            expr = expr.slice(0, -4);
                        } else if (expr.endsWith('log(') || expr.endsWith('sqrt(')) {
                            expr = expr.slice(0, -5);
                        } else if (expr.endsWith('ln(')) {
                            expr = expr.slice(0, -3);
                        } else {
                            expr = expr.slice(0, -1);
                        }
                    }
                    updateScreen();
                    break;
                case 'sin':
                case 'cos':
                case 'tan':
                case 'log':
                case 'ln':
                case 'sqrt':
                    expr += val + '(';
                    updateScreen();
                    break;
                case 'sqr':
                    expr += '^2';
                    updateScreen();
                    break;
                case 'fact':
                    expr += '!';
                    updateScreen();
                    break;
                case 'pi':
                    expr += 'π';
                    updateScreen();
                    break;
                case 'e':
                    expr += 'e';
                    updateScreen();
                    break;
                case 'deg': // MC (Memory Clear)
                    memory = 0;
                    memoryIndicator.style.visibility = 'hidden';
                    showToast('Memory Cleared');
                    break;
                case 'rad': // MR (Memory Recall)
                    expr += memory.toString();
                    updateScreen();
                    break;
                case 'm-plus': // M+
                    try {
                        const valToSave = parseFloat(calcDisplay.textContent) || 0;
                        memory += valToSave;
                        memoryIndicator.style.visibility = 'visible';
                        showToast(`Added to memory: ${valToSave}`);
                        newCalc = true;
                    } catch (e) {}
                    break;
                case 'm-minus': // M-
                    try {
                        const valToSave = parseFloat(calcDisplay.textContent) || 0;
                        memory -= valToSave;
                        memoryIndicator.style.visibility = 'visible';
                        showToast(`Subtracted from memory: ${valToSave}`);
                        newCalc = true;
                    } catch (e) {}
                    break;
                case '=':
                    evaluateExpression();
                    break;
                default:
                    // standard numbers/operators
                    expr += val;
                    updateScreen();
            }
        }

        function updateScreen() {
            // Replace internal operators with nice display operators
            let displayExpr = expr
                .replace(/\*/g, '×')
                .replace(/\//g, '÷');
            calcExpr.textContent = displayExpr;
        }

        // Custom Safe Mathematical Parser & Evaluator
        function evaluateExpression() {
            if (!expr) return;

            try {
                const prepared = prepareExpr(expr);
                const tokens = tokenize(prepared);
                const rpn = shuntingYard(tokens);
                const val = evalRPN(rpn);

                if (isNaN(val) || !isFinite(val)) {
                    throw new Error('Calculation error');
                }

                // Format the result nicely
                let formatted = parseFloat(val.toFixed(10));
                if (Math.abs(formatted) < 1e-10) formatted = 0; // handle float precision errors

                calcDisplay.textContent = formatted.toLocaleString(undefined, { maximumFractionDigits: 8 });
                
                // Add to history
                addHistoryItem(expr, formatted);

                newCalc = true;
            } catch (e) {
                calcDisplay.textContent = 'Error';
                newCalc = true;
            }
        }

        function prepareExpr(s) {
            return s
                .replace(/π/g, Math.PI.toString())
                .replace(/e/g, Math.E.toString())
                .replace(/\s+/g, '');
        }

        function tokenize(s) {
            const regex = /\d+(\.\d+)?([eE][+-]?\d+)?|[a-zA-Z]+|[+\-*/^!()]/g;
            const matches = s.match(regex) || [];
            return matches;
        }

        function getPrecedence(op) {
            if (op === '+' || op === '-') return 1;
            if (op === '*' || op === '/') return 2;
            if (op === '^' || op === '!') return 3;
            return 0;
        }

        function isLeftAssociative(op) {
            return op !== '^';
        }

        function isFunction(token) {
            return ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'].includes(token);
        }

        function shuntingYard(tokens) {
            const output = [];
            const stack = [];

            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];

                if (!isNaN(token)) {
                    output.push(parseFloat(token));
                    // Handle implicit multiplication: e.g., 2(3+1) or 2sin(pi)
                    if (i + 1 < tokens.length) {
                        const next = tokens[i + 1];
                        if (next === '(' || isFunction(next)) {
                            stack.push('*');
                        }
                    }
                } else if (isFunction(token)) {
                    stack.push(token);
                } else if (token === '(') {
                    stack.push(token);
                } else if (token === ')') {
                    while (stack.length > 0 && stack[stack.length - 1] !== '(') {
                        output.push(stack.pop());
                    }
                    if (stack.length === 0) throw new Error('Mismatched parenthesis');
                    stack.pop(); // pop '('

                    if (stack.length > 0 && isFunction(stack[stack.length - 1])) {
                        output.push(stack.pop());
                    }
                } else {
                    // Operator
                    while (
                        stack.length > 0 &&
                        stack[stack.length - 1] !== '(' &&
                        !isFunction(stack[stack.length - 1]) &&
                        (getPrecedence(stack[stack.length - 1]) > getPrecedence(token) ||
                            (getPrecedence(stack[stack.length - 1]) === getPrecedence(token) && isLeftAssociative(token)))
                    ) {
                        output.push(stack.pop());
                    }
                    stack.push(token);
                }
            }

            while (stack.length > 0) {
                const op = stack.pop();
                if (op === '(' || op === ')') throw new Error('Mismatched parenthesis');
                output.push(op);
            }

            return output;
        }

        function factorial(n) {
            if (n < 0) return NaN;
            if (n === 0 || n === 1) return 1;
            let res = 1;
            for (let i = 2; i <= Math.min(n, 100); i++) {
                res *= i;
            }
            return res;
        }

        function evalRPN(rpn) {
            const stack = [];

            for (let token of rpn) {
                if (typeof token === 'number') {
                    stack.push(token);
                } else if (isFunction(token)) {
                    if (stack.length < 1) throw new Error('Invalid expression');
                    const arg = stack.pop();
                    let val = 0;
                    switch (token) {
                        case 'sin':
                            val = angleMode === 'deg' ? Math.sin(arg * Math.PI / 180) : Math.sin(arg);
                            break;
                        case 'cos':
                            val = angleMode === 'deg' ? Math.cos(arg * Math.PI / 180) : Math.cos(arg);
                            break;
                        case 'tan':
                            val = angleMode === 'deg' ? Math.tan(arg * Math.PI / 180) : Math.tan(arg);
                            break;
                        case 'log':
                            val = Math.log10(arg);
                            break;
                        case 'ln':
                            val = Math.log(arg);
                            break;
                        case 'sqrt':
                            val = Math.sqrt(arg);
                            break;
                    }
                    stack.push(val);
                } else if (token === '!') {
                    if (stack.length < 1) throw new Error('Invalid expression');
                    const arg = stack.pop();
                    stack.push(factorial(Math.floor(arg)));
                } else {
                    // Operator
                    if (stack.length < 2) throw new Error('Invalid expression');
                    const b = stack.pop();
                    const a = stack.pop();
                    let val = 0;
                    switch (token) {
                        case '+': val = a + b; break;
                        case '-': val = a - b; break;
                        case '*': val = a * b; break;
                        case '/': val = a / b; break;
                        case '^': val = Math.pow(a, b); break;
                    }
                    stack.push(val);
                }
            }

            if (stack.length !== 1) throw new Error('Invalid expression');
            return stack[0];
        }

        function addHistoryItem(expr, result) {
            const items = historyLog.querySelectorAll('.history-item');
            if (items.length === 1 && items[0].textContent.includes('No history')) {
                historyLog.innerHTML = '';
            }

            const cleanExpr = expr.replace(/\*/g, '×').replace(/\//g, '÷');
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `<span>${cleanExpr}</span> <strong>${result}</strong>`;
            item.addEventListener('click', () => {
                expr = result.toString();
                updateScreen();
            });
            historyLog.insertBefore(item, historyLog.firstChild);
        }

        function showToast(msg) {
            if (typeof TN !== 'undefined' && TN.toast) {
                TN.toast.success(msg);
            }
        }
    });
})();

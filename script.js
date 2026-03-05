const currentDisplay = document.getElementById('current');
const historyDisplay = document.getElementById('history');
const buttons = document.querySelectorAll('.btn');

let currentOperand = '';
let previousOperand = '';
let operation = undefined;

// Helper to update the screen
function updateDisplay() {
    currentDisplay.innerText = currentOperand || '0';
    if (operation != null) {
        if (operation === 'yroot') {
            historyDisplay.innerText = `${previousOperand} yroot`;
        }
        else if (operation === 'logyx') {
            historyDisplay.innerText = `log(${previousOperand})base`
        }
        else {
            historyDisplay.innerText = `${previousOperand} ${operation}`;
        }
    } else {
        historyDisplay.innerText = '';
    }
}

// Logic for basic math
function compute() {
    let computation;
    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);
    if (isNaN(prev) || isNaN(current)) return;

    switch (operation) {
        case '+': computation = prev + current; break;
        case '-': computation = prev - current; break;
        case '*': computation = prev * current; break;
        case '/': computation = prev / current; break;
        case '%': computation = prev % current; break;
        case 'xy': computation = Math.pow(prev, current); break;

        case 'logyx':
            if (prev <= 0 || current <= 0 || current === 1) {
                computation = "Error"; // Log rules: x > 0, base > 0 and != 1
            } else {
                computation = Math.log(prev) / Math.log(current);
            }
            break;

        case 'yroot':
            if (current === 0) {
                computation = "Error"; // Cannot take the 0th root
            } else if (prev < 0 && current % 2 === 0) {
                computation = "Error"; // Even root of a negative number is imaginary
            } else {
                computation = Math.pow(prev, 1 / current);
            }
            break;

        case 'Exp': computation = prev * Math.pow(10, current); break;

        default: return;
    }
    currentOperand = computation.toString();
    operation = undefined;
    previousOperand = '';
}

function factorial(n) {
    if (n < 0) return undefined;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Handle Scientific Functions
function handleScientific(func) {
    let val = parseFloat(currentOperand);

    // Check for π and e first since they don't need a value beforehand
    if (func === 'π') {
        currentOperand = Math.PI.toString();
        updateDisplay();
        return;
    }
    if (func === 'e') {
        currentOperand = Math.E.toString();
        updateDisplay();
        return;
    }

    if (isNaN(val)) return;

    // Fix for Rad/Deg toggle
    const unitInput = document.querySelector('input[name="unit"]:checked').value;
    // const isRad = unitInput ? unitInput.value === 'Rad' : true;

    const toRad = (num) => (unitInput === 'Deg' ? num * (Math.PI / 180) : num);
    const fromRad = (num) => (unitInput === 'Deg' ? num * (180 / Math.PI) : num);

    switch (func) {
        // Trig (Matches the button text exactly)
        case 'sin': currentOperand = Math.sin(toRad(val)); break;
        case 'cos': currentOperand = Math.cos(toRad(val)); break;
        case 'tan': currentOperand = Math.tan(toRad(val)); break;
        case 'sin⁻¹': currentOperand = fromRad(Math.asin(val)); break;
        case 'cos⁻¹': currentOperand = fromRad(Math.acos(val)); break;
        case 'tan⁻¹': currentOperand = fromRad(Math.atan(val)); break;
        case 'sinh': currentOperand = Math.sinh(val); break;
        case 'cosh': currentOperand = Math.cosh(val); break;
        case 'tanh': currentOperand = Math.tanh(val); break;
        case 'sinh-1': case 'sinh⁻¹': currentOperand = Math.asinh(val); break;
        case 'cosh-1': case 'cosh⁻¹': currentOperand = val < 1 ? "Error" : Math.acosh(val); break;
        case 'tanh-1': case 'tanh⁻¹': currentOperand = (val <= -1 || val >= 1) ? "Error" : Math.atanh(val); break;

        // Powers (Check if your button text has the 'x' or just the symbol)
        case 'x²': case 'x2': currentOperand = Math.pow(val, 2); break;
        case 'x³': case 'x3': currentOperand = Math.pow(val, 3); break;
        case 'ex': currentOperand = Math.E ** val; break;
        case '10x': currentOperand = Math.pow(10, val); break;
        case 'sqrt': currentOperand = Math.sqrt(val); break;
        case '3root': currentOperand = Math.cbrt(val); break;

        // Logs
        case 'log': currentOperand = Math.log10(val); break;
        case 'ln': currentOperand = Math.log(val); break;
        case 'log₂x': currentOperand = Math.log2(val); break;


        // Others
        case '1/x': currentOperand = 1 / val; break;
        case '±': currentOperand = val * -1; break;
        case '|x|': currentOperand = Math.abs(val); break;
        case 'n!': currentOperand = factorial(val); break;

        default:
            console.log("No match found for:", func); // Helps you debug in Console
            return;
    }

    // rounding off large numbers
    if (typeof currentOperand === 'number') {
        currentOperand = Number(currentOperand.toFixed(10));
    }

    currentOperand = currentOperand.toString();
    updateDisplay();
}
// Button Click Listener
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const text = button.getAttribute('data-op') || button.innerText.trim();

        // Number keys
        if (!isNaN(text) || text === '.') {
            if (text === '.' && currentOperand.includes('.')) return;
            currentOperand += text;
        }
        // Clear & Delete
        else if (text === 'C') {
            currentOperand = '';
            previousOperand = '';
            operation = undefined;
        }
        else if (text === '←') {
            currentOperand = currentOperand.slice(0, -1);
        }
        // Operators
        else if (['+', '-', '*', '/', '%', 'xy', 'logyx', 'yroot', 'Exp'].includes(text)) {
            if (currentOperand === '') return;
            if (previousOperand !== '') compute();
            operation = text;
            previousOperand = currentOperand;
            currentOperand = '';
        }
        // Equals
        else if (text === '=') {
            compute();
        }
        // Scientific
        else {
            handleScientific(text);
        }

        updateDisplay();
    });
});
// DOM elements
const form = document.getElementById('calculatorForm');
const num1Input = document.getElementById('num1');
const num2Input = document.getElementById('num2');
const operationInput = document.getElementById('operation');
const previousOperandDisplay = document.querySelector('.previous-operand');
const currentOperandDisplay = document.querySelector('.current-operand');
const numberButtons = document.querySelectorAll('.number-btn');
const operationButtons = document.querySelectorAll('.op-btn');
const equalsButton = document.querySelector('.equals-btn');
const clearButton = document.querySelector('.clear-btn');
const clearEntryButton = document.querySelector('.clear-entry-btn');
const backspaceButton = document.querySelector('.backspace-btn');
const decimalButton = document.querySelector('.decimal-btn');
const errorDiv = document.getElementById('error');

// History elements
const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
const historyTape = document.getElementById('historyTape');
const historyContent = document.getElementById('historyContent');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const calculatorWrapper = document.querySelector('.calculator-wrapper');

// API endpoint
const API_URL = 'http://localhost:8080/api/calculate';

// Calculator state
let firstNumber = null;
let operation = null;
let shouldResetDisplay = false;
let historyVisible = false;
let calculationHistory = [];
let justCalculated = false;

// Function to append number or decimal
function appendNumber(value) {
    // If we just calculated and user types a number, start fresh
    if (justCalculated) {
        firstNumber = null;
        operation = null;
        justCalculated = false;
        previousOperandDisplay.textContent = '';
    }
    
    if (shouldResetDisplay) {
        currentOperandDisplay.textContent = '';
        shouldResetDisplay = false;
    }
    if (value === '.' && currentOperandDisplay.textContent.includes('.')) return;
    if (currentOperandDisplay.textContent === '0' && value !== '.') {
        currentOperandDisplay.textContent = value;
    } else {
        currentOperandDisplay.textContent += value;
    }
}

// Number button handlers
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        appendNumber(button.dataset.number);
    });
});

// Decimal button handler
decimalButton.addEventListener('click', () => {
    appendNumber('.');
});

// Operation button handlers
operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        handleOperation(button.dataset.operation);
        operationButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

function handleOperation(op) {
    const currentValue = parseFloat(currentOperandDisplay.textContent);
    
    // If we just calculated and user presses an operator, continue with the result
    if (justCalculated) {
        justCalculated = false;
        firstNumber = currentValue;
        operation = op;
        previousOperandDisplay.textContent = `${formatNumber(firstNumber)} ${getOperationSymbol(op)}`;
        shouldResetDisplay = true;
        return;
    }
    
    if (firstNumber === null) {
        // First operation - store the number
        firstNumber = currentValue;
        operation = op;
        previousOperandDisplay.textContent = `${formatNumber(firstNumber)} ${getOperationSymbol(op)}`;
        shouldResetDisplay = true;
    } else if (operation && shouldResetDisplay) {
        // User changed their mind about the operation before entering second number
        operation = op;
        previousOperandDisplay.textContent = `${formatNumber(firstNumber)} ${getOperationSymbol(op)}`;
    } else if (operation) {
        // Chain operations - calculate previous operation first
        const secondNumber = currentValue;
        calculateResult(firstNumber, operation, secondNumber, true).then(() => {
            // After calculation, set up for next operation
            operation = op;
            previousOperandDisplay.textContent = `${formatNumber(firstNumber)} ${getOperationSymbol(op)}`;
            shouldResetDisplay = true;
        });
    }
}

// Equals button handler
equalsButton.addEventListener('click', async () => {
    if (firstNumber === null || operation === null) return;
    
    const secondNumber = parseFloat(currentOperandDisplay.textContent);
    await calculateResult(firstNumber, operation, secondNumber, false);
    previousOperandDisplay.textContent = '';
    operation = null;
    shouldResetDisplay = true;
    justCalculated = true;
    operationButtons.forEach(btn => btn.classList.remove('active'));
});
    
// Clear button handler
clearButton.addEventListener('click', () => {
    currentOperandDisplay.textContent = '0';
    previousOperandDisplay.textContent = '';
    firstNumber = null;
    operation = null;
    shouldResetDisplay = false;
    justCalculated = false;
    operationButtons.forEach(btn => btn.classList.remove('active'));
});

// Clear entry button handler
clearEntryButton.addEventListener('click', () => {
    currentOperandDisplay.textContent = '0';
});

// Backspace button handler
backspaceButton.addEventListener('click', () => {
    if (currentOperandDisplay.textContent.length === 1) {
        currentOperandDisplay.textContent = '0';
    } else {
        currentOperandDisplay.textContent = currentOperandDisplay.textContent.slice(0, -1);
    }
});

// Helper function to get operation symbol
function getOperationSymbol(op) {
    switch(op) {
        case 'add': return '+';
        case 'subtract': return '−';
        case 'multiply': return '×';
        case 'divide': return '÷';
        default: return '';
    }
}

// Calculate result
async function calculateResult(num1, op, num2, isChaining = false) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `num1=${num1}&operation=${op}&num2=${num2}`
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Update the display
        firstNumber = data.result;
        currentOperandDisplay.textContent = formatNumber(data.result);
        currentOperandDisplay.classList.add('updated');
        setTimeout(() => currentOperandDisplay.classList.remove('updated'), 300);

        // Add to history only if not chaining
        if (!isChaining) {
            addToHistory(num1, op, num2, data.result);
        }

    } catch (error) {
        console.error('Error:', error);
        showError(`Error: ${error.message}`);
        currentOperandDisplay.textContent = 'Error';
        firstNumber = null;
        operation = null;
        shouldResetDisplay = false;
        justCalculated = false;
        previousOperandDisplay.textContent = '';
    }
}

// Format number for display
function formatNumber(num) {
    if (isNaN(num)) return 'Error';
    
    // Handle division by zero
    if (!isFinite(num)) return 'Cannot divide by zero';
    
    // Handle very large or very small numbers
    if (Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-6 && num !== 0)) {
        return num.toExponential(6);
    }
    
    // Handle regular numbers
    if (Number.isInteger(num) && Math.abs(num) < 1e12) {
        return num.toString();
    }
    
    // Handle decimals
    return parseFloat(num.toPrecision(10)).toString();
}

// Show error message
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// History Tape Functions
function toggleHistory() {
    historyVisible = !historyVisible;
    
    if (historyVisible) {
        historyTape.style.display = 'block';
        calculatorWrapper.classList.remove('history-hidden');
        calculatorWrapper.classList.add('history-visible');
        toggleHistoryBtn.textContent = 'Hide History Tape';
    } else {
        historyTape.style.display = 'none';
        calculatorWrapper.classList.remove('history-visible');
        calculatorWrapper.classList.add('history-hidden');
        toggleHistoryBtn.textContent = 'View History Tape';
    }
}

function addToHistory(num1, op, num2, result) {
    const historyItem = {
        num1: num1,
        operation: op,
        num2: num2,
        result: result,
        timestamp: new Date()
    };
    
    calculationHistory.push(historyItem);
    
    // Keep only last 50 calculations
    if (calculationHistory.length > 50) {
        calculationHistory.shift();
    }
    
    renderHistory();
}

function renderHistory() {
    if (calculationHistory.length === 0) {
        historyContent.innerHTML = '<p class="empty-history">No calculations yet</p>';
        return;
    }
    
    let historyHTML = '';
    calculationHistory.forEach((item, index) => {
        const opSymbol = getOperationSymbol(item.operation);
        historyHTML += `
            <div class="history-item">
                ${formatNumber(item.num1)} ${opSymbol} ${formatNumber(item.num2)} = ${formatNumber(item.result)}
            </div>
        `;
    });
    
    historyContent.innerHTML = historyHTML;
    
    // Auto-scroll to bottom to show newest calculation
    historyContent.parentElement.scrollTop = historyContent.parentElement.scrollHeight;
}

function clearHistory() {
    if (confirm('Clear all calculation history?')) {
        calculationHistory = [];
        renderHistory();
    }
}

// Event listeners for history controls
toggleHistoryBtn.addEventListener('click', toggleHistory);
clearHistoryBtn.addEventListener('click', clearHistory);

// Initialize wrapper state
calculatorWrapper.classList.add('history-hidden');

// Keyboard Input Support
document.addEventListener('keydown', (e) => {
    // Prevent default behavior for calculator keys
    if (['0','1','2','3','4','5','6','7','8','9','.','+','-','*','/','Enter','Escape','Backspace'].includes(e.key)) {
        e.preventDefault();
    }
    
    // Number keys (0-9)
    if (e.key >= '0' && e.key <= '9') {
        appendNumber(e.key);
    }
    
    // Decimal point
    else if (e.key === '.') {
        appendNumber('.');
    }
    
    // Operations
    else if (e.key === '+') {
        handleOperation('add');
        operationButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-operation="add"]').classList.add('active');
    }
    else if (e.key === '-') {
        handleOperation('subtract');
        operationButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-operation="subtract"]').classList.add('active');
    }
    else if (e.key === '*') {
        handleOperation('multiply');
        operationButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-operation="multiply"]').classList.add('active');
    }
    else if (e.key === '/') {
        handleOperation('divide');
        operationButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-operation="divide"]').classList.add('active');
    }
    
    // Enter key - calculate result
    else if (e.key === 'Enter') {
        if (firstNumber !== null && operation !== null) {
            const secondNumber = parseFloat(currentOperandDisplay.textContent);
            calculateResult(firstNumber, operation, secondNumber, false);
            previousOperandDisplay.textContent = '';
            operation = null;
            shouldResetDisplay = true;
            justCalculated = true;
            operationButtons.forEach(btn => btn.classList.remove('active'));
        }
    }
    
    // Escape key - clear
    else if (e.key === 'Escape') {
        clearButton.click();
    }
    
    // Backspace key
    else if (e.key === 'Backspace') {
        if (currentOperandDisplay.textContent.length === 1) {
            currentOperandDisplay.textContent = '0';
        } else {
            currentOperandDisplay.textContent = currentOperandDisplay.textContent.slice(0, -1);
        }
    }
});

console.log('C++ Calculator Frontend Loaded');
console.log('Backend should be running on http://localhost:8080');
console.log('Keyboard support: 0-9, ., +, -, *, /, Enter (calculate), Escape (clear), Backspace');
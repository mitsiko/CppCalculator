// Loading Screen Logic
window.addEventListener('load', function() {
    const loadingScreen = document.getElementById('loadingScreen');
    const mainContent = document.getElementById('mainContent');
    
    // Show loading screen for 4 seconds
    setTimeout(function() {
        loadingScreen.style.opacity = '0';
        setTimeout(function() {
            loadingScreen.style.display = 'none';
            mainContent.style.display = 'block';
            
            // Initialize animations after loading screen
            initTextAnimations();
        }, 500);
    }, 4000);
});

// Initialize all text animations
function initTextAnimations() {
    // Prepare slide-up text elements
    prepareSlideUpText();
    
    // Initialize intersection observers
    initIntersectionObservers();
}

// Prepare slide-up text by wrapping each character in spans
function prepareSlideUpText() {
    const slideUpElements = document.querySelectorAll('.slide-up-text');
    
    slideUpElements.forEach(element => {
        const text = element.textContent;
        const words = text.split(/(\s+)/);
        
        let newHTML = '';
        words.forEach(word => {
            if (word.trim() === '') {
                newHTML += word; // Preserve whitespace
            } else {
                // Wrap each character in a span
                const chars = word.split('');
                const wrappedChars = chars.map(char => 
                    `<span class="char">${char}</span>`
                ).join('');
                newHTML += wrappedChars;
            }
        });
        
        element.innerHTML = newHTML;
    });
}

// Initialize intersection observers for animations
function initIntersectionObservers() {
    // Observer for slide-up text (character by character)
    const textObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                animateSlideUpText(entry.target);
                entry.target.classList.add('animated');
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observer for pan-up elements (calculator and history)
    const panUpObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, 200);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all slide-up text elements
    document.querySelectorAll('.slide-up-text').forEach(element => {
        textObserver.observe(element);
    });

    // Observe all pan-up elements
    document.querySelectorAll('.pan-up-element').forEach(element => {
        panUpObserver.observe(element);
    });
}

// Animate slide-up text character by character
function animateSlideUpText(element) {
    const chars = element.querySelectorAll('.char');
    
    // Use GSAP for smooth character animation
    if (typeof gsap !== 'undefined') {
        gsap.to(chars, {
            duration: 0.2, // Changed from 0.6s to 0.4s
            y: 0,
            opacity: 1,
            stagger: 0.02, // Changed from 0.03s to 0.02s
            ease: "back.out(1.7)"
        });
    } else {
        // Fallback: CSS transitions
        chars.forEach((char, index) => {
            setTimeout(() => {
                char.classList.add('animated');
            }, index * 30); // Changed from 50ms to 30ms
        });
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            window.scrollTo({
                top: targetSection.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(228, 235, 228, 0.95)';
    } else {
        navbar.style.backgroundColor = 'transparent';
    }
});

// ========== EXISTING CALCULATOR LOGIC (UNCHANGED) ==========
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
const historyContent = document.getElementById('historyContent');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// API endpoint
const API_URL = 'http://localhost:8080/api/calculate';

// Calculator state
let firstNumber = null;
let operation = null;
let shouldResetDisplay = false;
let calculationHistory = [];
let justCalculated = false;

// Function to append number or decimal
function appendNumber(value) {
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
    
    if (justCalculated) {
        justCalculated = false;
        firstNumber = currentValue;
        operation = op;
        previousOperandDisplay.textContent = `${formatNumber(firstNumber)} ${getOperationSymbol(op)}`;
        shouldResetDisplay = true;
        return;
    }
    
    if (firstNumber === null) {
        firstNumber = currentValue;
        operation = op;
        previousOperandDisplay.textContent = `${formatNumber(firstNumber)} ${getOperationSymbol(op)}`;
        shouldResetDisplay = true;
    } else if (operation && shouldResetDisplay) {
        operation = op;
        previousOperandDisplay.textContent = `${formatNumber(firstNumber)} ${getOperationSymbol(op)}`;
    } else if (operation) {
        const secondNumber = currentValue;
        calculateResult(firstNumber, operation, secondNumber, true).then(() => {
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

        firstNumber = data.result;
        currentOperandDisplay.textContent = formatNumber(data.result);
        currentOperandDisplay.classList.add('updated');
        setTimeout(() => currentOperandDisplay.classList.remove('updated'), 300);

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
    
    if (!isFinite(num)) return 'Cannot divide by zero';
    
    if (Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-6 && num !== 0)) {
        return num.toExponential(6);
    }
    
    if (Number.isInteger(num) && Math.abs(num) < 1e12) {
        return num.toString();
    }
    
    return parseFloat(num.toPrecision(10)).toString();
}

// Show error message
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// History Functions
function addToHistory(num1, op, num2, result) {
    const historyItem = {
        num1: num1,
        operation: op,
        num2: num2,
        result: result,
        timestamp: new Date()
    };
    
    calculationHistory.push(historyItem);
    
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
    
    historyContent.parentElement.scrollTop = historyContent.parentElement.scrollHeight;
}

function clearHistory() {
    if (confirm('Clear all calculation history?')) {
        calculationHistory = [];
        renderHistory();
    }
}

// Event listener for clear history button
clearHistoryBtn.addEventListener('click', clearHistory);

// Keyboard Input Support
document.addEventListener('keydown', (e) => {
    if (['0','1','2','3','4','5','6','7','8','9','.','+','-','*','/','Enter','Escape','Backspace'].includes(e.key)) {
        e.preventDefault();
    }
    
    if (e.key >= '0' && e.key <= '9') {
        appendNumber(e.key);
    }
    
    else if (e.key === '.') {
        appendNumber('.');
    }
    
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
    
    else if (e.key === 'Escape') {
        clearButton.click();
    }
    
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
// DOM elements
const form = document.getElementById('calculatorForm');
const num1Input = document.getElementById('num1');
const num2Input = document.getElementById('num2');
const multiplyBtn = document.getElementById('multiplyBtn');
const btnText = document.querySelector('.btn-text');
const loading = document.querySelector('.loading');
const resultValue = document.getElementById('resultValue');
const errorDiv = document.getElementById('error');

// API endpoint
const API_URL = 'http://localhost:8080/api/multiply';

// Form submission handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const num1 = parseFloat(num1Input.value);
    const num2 = parseFloat(num2Input.value);
    
    // Validate inputs
    if (isNaN(num1) || isNaN(num2)) {
        showError('Please enter valid numbers');
        return;
    }
    
    // Clear previous error
    hideError();
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Send request to C++ backend
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `num1=${num1}&num2=${num2}`
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Display result with animation
        displayResult(data.result);
        
    } catch (error) {
        console.error('Error:', error);
        showError(`Error: ${error.message}`);
        resultValue.textContent = '-';
    } finally {
        // Hide loading state
        setLoadingState(false);
    }
});

// Set loading state
function setLoadingState(isLoading) {
    multiplyBtn.disabled = isLoading;
    
    if (isLoading) {
        btnText.style.display = 'none';
        loading.style.display = 'inline';
    } else {
        btnText.style.display = 'inline';
        loading.style.display = 'none';
    }
}

// Display result with animation
function displayResult(result) {
    resultValue.textContent = formatNumber(result);
    resultValue.classList.add('updated');
    
    // Remove animation class after animation completes
    setTimeout(() => {
        resultValue.classList.remove('updated');
    }, 300);
}

// Format number for display
function formatNumber(num) {
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
    setTimeout(hideError, 5000);
}

// Hide error message
function hideError() {
    errorDiv.style.display = 'none';
}

// Input validation and formatting
num1Input.addEventListener('input', validateInput);
num2Input.addEventListener('input', validateInput);

function validateInput(e) {
    // Remove any invalid characters (basic validation)
    const value = e.target.value;
    const validValue = value.replace(/[^0-9.-]/g, '');
    
    if (value !== validValue) {
        e.target.value = validValue;
    }
}

// Handle Enter key in inputs
num1Input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        num2Input.focus();
    }
});

num2Input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        form.dispatchEvent(new Event('submit'));
    }
});

// Clear result when inputs change
num1Input.addEventListener('input', clearResult);
num2Input.addEventListener('input', clearResult);

function clearResult() {
    if (resultValue.textContent !== '-') {
        resultValue.textContent = '-';
        hideError();
    }
}

// Initialize - focus on first input
window.addEventListener('load', () => {
    num1Input.focus();
});

// Handle connection errors gracefully
window.addEventListener('beforeunload', () => {
    // Cancel any pending requests if needed
});

console.log('C++ Calculator Frontend Loaded');
console.log('Backend should be running on http://localhost:8080');
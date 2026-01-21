// Get form elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');

// Load saved email if "Remember me" was checked
window.addEventListener('DOMContentLoaded', () => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const wasRemembered = localStorage.getItem('rememberMe') === 'true';
    
    if (wasRemembered && savedEmail) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }
});

// Form submission handler
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;
    
    // Validate inputs
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }
    
    // Handle "Remember me" functionality
    if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMe', 'true');
    } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
    }
    
    // Simulate login (replace with actual API call)
    handleLogin(email, password);
});

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show error message
function showError(message) {
    // Create error element if it doesn't exist
    let errorElement = document.querySelector('.error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.cssText = `
            background-color: #fee2e2;
            color: #991b1b;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
            font-size: 0.875rem;
            border: 1px solid #fecaca;
        `;
        loginForm.insertBefore(errorElement, loginForm.firstChild);
    }
    
    errorElement.textContent = message;
    
    // Remove error after 5 seconds
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}

// Show success message
function showSuccess(message) {
    // Create success element
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.style.cssText = `
        background-color: #d1fae5;
        color: #065f46;
        padding: 0.75rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        font-size: 0.875rem;
        border: 1px solid #6ee7b7;
    `;
    successElement.textContent = message;
    
    loginForm.insertBefore(successElement, loginForm.firstChild);
    
    // Remove success message after 3 seconds
    setTimeout(() => {
        successElement.remove();
    }, 3000);
}

// Handle login (simulate API call)
function handleLogin(email, password) {
    // Show loading state
    const submitButton = document.querySelector('.btn-signin');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Signing In...';
    submitButton.disabled = true;
    
    // Simulate API call with setTimeout
    setTimeout(() => {
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // Show success message
        showSuccess('Login successful! Redirecting to dashboard...');
        
        // Log the attempt (in production, this would be an API call)
        console.log('Login attempt:', {
            email: email,
            timestamp: new Date().toISOString(),
            rememberMe: rememberMeCheckbox.checked
        });
        
        // Simulate redirect to dashboard
        setTimeout(() => {
            // window.location.href = '/dashboard';
            console.log('Redirecting to dashboard...');
        }, 1500);
    }, 1500);
}

// Add input animation on focus
const inputs = document.querySelectorAll('.form-input');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'translateY(-2px)';
        this.parentElement.style.transition = 'transform 0.2s ease';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'translateY(0)';
    });
});

// Forgot Password handler
document.querySelector('.forgot-password').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Password reset functionality would be implemented here. Please check your email for reset instructions.');
});

// Sign Up link handler
document.querySelector('.signup-link').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'signup.html';
});
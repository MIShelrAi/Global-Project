// ============================================
// DIGITAL KRISHI - SIGN UP AUTHENTICATION
// ============================================

// Get form elements
const signupForm = document.getElementById('signupForm');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const agreeTermsCheckbox = document.getElementById('agreeTerms');

// Initialize Supabase auth
let supabase;
let currentUser = null;

// Wait for DOM and config to load
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for supabase config to load
    if (typeof window.supabaseClient === 'undefined') {
        console.error('Supabase config not loaded. Make sure supabase-config.js is loaded first.');
        return;
    }
    
    supabase = window.supabaseClient;
    
    // Check for existing session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUser = session.user;
        console.log('User already logged in:', currentUser.email);
        // Redirect to index if already logged in
        window.location.href = './index.html';
        return;
    }
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state change:', event);
        
        if (event === 'SIGNED_IN' && session) {
            currentUser = session.user;
            console.log('User signed up:', currentUser.email);
            showSuccess('Account created successfully! Redirecting to dashboard...');
            
            setTimeout(() => {
                window.location.href = APP_CONFIG?.auth?.redirectUrl || './index.html';
            }, 1500);
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            console.log('User signed out');
        }
    });
});

// Form submission handler
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const agreeTerms = agreeTermsCheckbox.checked;
    
    // Validate inputs
    if (!fullName) {
        showError('Please enter your full name');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (!phone) {
        showError('Please enter your phone number');
        return;
    }
    
    if (password.length < (APP_CONFIG?.auth?.passwordMinLength || 8)) {
        showError(`Password must be at least ${APP_CONFIG?.auth?.passwordMinLength || 8} characters long`);
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    if (!agreeTerms) {
        showError('Please agree to the Terms of Service and Privacy Policy');
        return;
    }
    
    // Handle signup with Supabase
    await handleSignup(email, password, fullName, phone);
});

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show error message
function showError(message) {
    // Remove existing messages
    removeMessages();
    
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = 'auth-message error';
    errorElement.textContent = message;
    
    // Insert before form
    signupForm.insertBefore(errorElement, signupForm.firstChild);
    
    // Remove error after 5 seconds
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}

// Show success message
function showSuccess(message) {
    // Remove existing messages
    removeMessages();
    
    // Create success element
    const successElement = document.createElement('div');
    successElement.className = 'auth-message success';
    successElement.textContent = message;
    
    // Insert before form
    signupForm.insertBefore(successElement, signupForm.firstChild);
    
    // Remove success message after 3 seconds
    setTimeout(() => {
        successElement.remove();
    }, 3000);
}

// Remove all auth messages
function removeMessages() {
    const messages = document.querySelectorAll('.auth-message');
    messages.forEach(msg => msg.remove());
}

// Handle signup with Supabase
async function handleSignup(email, password, fullName, phone) {
    // Show loading state
    const submitButton = document.querySelector('.btn-signin');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Creating Account...';
    submitButton.disabled = true;
    
    try {
        // Create user with Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone,
                    display_name: fullName
                }
            }
        });

        if (error) {
            throw error;
        }

        console.log('Signup successful:', data);
        
        // Show success and redirect
        showSuccess('Account created successfully! Redirecting to dashboard...');
        
        setTimeout(() => {
            window.location.href = APP_CONFIG?.auth?.redirectUrl || './index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Signup error:', error);
        
        // Handle specific error messages
        let errorMessage = 'Account creation failed. Please try again.';
        
        if (error.message.includes('User already registered')) {
            errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (error.message.includes('Password should be at least')) {
            errorMessage = 'Password must be at least 8 characters long.';
        } else if (error.message.includes('Invalid email')) {
            errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('weak_password')) {
            errorMessage = 'Password is too weak. Please choose a stronger password.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showError(errorMessage);
        
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Terms links handler
document.querySelectorAll('.terms-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        // You can redirect to terms/privacy pages or show modals
        console.log('Terms/Privacy link clicked');
        // For now, just show a simple alert
        const linkText = e.target.textContent;
        alert(`${linkText} page will open here. This is a demo.`);
    });
});

// Sign In link handler
document.querySelector('.signup-link').addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Redirecting to sign in page...');
    window.location.href = './login.html';
});

// Input animations
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

// Password strength indicator
passwordInput.addEventListener('input', function() {
    const password = this.value;
    const strength = checkPasswordStrength(password);
    updatePasswordStrength(strength);
});

function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    return strength;
}

function updatePasswordStrength(strength) {
    const strengthBar = document.getElementById('password-strength');
    if (!strengthBar) return;
    
    const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthColor = ['#ff4444', '#ff6b6b', '#ffa500', '#4caf50', '#2196f3'];
    
    strengthBar.style.width = `${(strength / 6) * 100}%`;
    strengthBar.style.backgroundColor = strengthColor[strength - 1] || '#ff4444';
    
    const strengthTextElement = document.getElementById('strength-text');
    if (strengthTextElement) {
        strengthTextElement.textContent = strengthText[strength - 1] || '';
    }
}

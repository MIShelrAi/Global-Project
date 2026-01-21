const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');

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
    
    // Load saved email if "Remember me" was checked
    const savedEmail = localStorage.getItem('rememberedEmail');
    const wasRemembered = localStorage.getItem('rememberMe') === 'true';
    
    if (wasRemembered && savedEmail) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state change:', event);
        
        if (event === 'SIGNED_IN' && session) {
            currentUser = session.user;
            console.log('User signed in:', currentUser.email);
            showSuccess('Login successful! Redirecting to dashboard...');
            
            setTimeout(() => {
                window.location.href = './index.html';
            }, 1500);
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            console.log('User signed out');
        }
    });
});

// Form submission handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;
    
    // Validate inputs
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (password.length < APP_CONFIG?.auth?.passwordMinLength || 6) {
        showError(`Password must be at least ${APP_CONFIG?.auth?.passwordMinLength || 6} characters long`);
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
    
    // Handle login with Supabase
    await handleLogin(email, password);
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
    loginForm.insertBefore(errorElement, loginForm.firstChild);
    
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
    loginForm.insertBefore(successElement, loginForm.firstChild);
    
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

// Handle login with Supabase
async function handleLogin(email, password) {
    // Show loading state
    const submitButton = document.querySelector('.btn-signin');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Signing In...';
    submitButton.disabled = true;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw error;
        }

        console.log('Login successful:', data);
        showSuccess('Login successful! Redirecting to dashboard...');
        
        // Immediate redirect to dashboard
        window.location.href = './index.html';
        
        // Auth state change listener will also handle redirect (backup)
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Handle specific error messages
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please confirm your email address before signing in. Check your inbox for the confirmation link.';
        } else if (error.message.includes('Too many requests')) {
            errorMessage = 'Too many login attempts. Please wait a moment and try again.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showError(errorMessage);
        
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Social authentication
async function socialAuth(provider) {
    if (!supabase) {
        showError('Authentication system not ready. Please refresh the page.');
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: APP_CONFIG?.auth?.redirectUrl || `${window.location.origin}/index.html`
            }
        });

        if (error) {
            throw error;
        }
        
        console.log(`OAuth with ${provider} initiated`);
        
    } catch (error) {
        console.error(`${provider} OAuth error:`, error);
        showError(`Failed to sign in with ${provider}. Please try again.`);
    }
}

// Password reset handler
async function handlePasswordReset(email) {
    if (!supabase) {
        showError('Authentication system not ready. Please refresh the page.');
        return;
    }
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`
        });

        if (error) {
            throw error;
        }
        
        showSuccess('Password reset email sent! Please check your inbox.');
        
    } catch (error) {
        console.error('Password reset error:', error);
        showError('Failed to send password reset email. Please try again.');
    }
}

// Forgot Password handler
document.querySelector('.forgot-password').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    if (!email) {
        showError('Please enter your email address first');
        emailInput.focus();
        return;
    }
    
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        emailInput.focus();
        return;
    }
    
    await handlePasswordReset(email);
});

// Sign Up link handler
document.querySelector('.signup-link').addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Redirecting to sign up page...');
    window.location.href = './signup.html';
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

// Make socialAuth function globally available
window.socialAuth = socialAuth;
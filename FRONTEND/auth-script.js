// Form switching functionality
function switchToSignup() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
}

function switchToLogin() {
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
}

// Password visibility toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.textContent = '🙈';
    } else {
        input.type = 'password';
        toggle.textContent = '👁️';
    }
}

// Form validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function showError(inputElement, message) {
    inputElement.classList.add('input-error');
    
    // Remove existing error message
    const existingError = inputElement.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('span');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    inputElement.parentElement.appendChild(errorDiv);
}

function showSuccess(inputElement) {
    inputElement.classList.remove('input-error');
    inputElement.classList.add('input-success');
    
    // Remove error message
    const existingError = inputElement.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function clearValidation(inputElement) {
    inputElement.classList.remove('input-error', 'input-success');
    const existingError = inputElement.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

const API_BASE = 'http://127.0.0.1:5000/api';

async function apiFetch(path, { method = 'GET', body, token } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const resp = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) {
        const msg = json.message || `Request failed (${resp.status})`;
        throw new Error(msg);
    }
    return json;
}

// Login form handler
document.getElementById('loginFormElement').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail');
    const password = document.getElementById('loginPassword');
    let isValid = true;

    // Clear previous validations
    clearValidation(email);
    clearValidation(password);

    // Validate email
    if (!email.value.trim()) {
        showError(email, 'Email is required');
        isValid = false;
    } else if (!validateEmail(email.value.trim())) {
        showError(email, 'Please enter a valid email address');
        isValid = false;
    } else {
        showSuccess(email);
    }

    // Validate password
    if (!password.value.trim()) {
        showError(password, 'Password is required');
        isValid = false;
    } else {
        showSuccess(password);
    }

    if (!isValid) return;

    // Show loading
    showLoading('Signing you in...');

    try {
        const loginData = { email: email.value.trim(), password: password.value };
        let response;
        try {
            response = await apiFetch('/login', { method: 'POST', body: loginData });
        } catch (networkErr) {
            // Fallback to mock in dev if backend isn't running
            response = await mockApiCall('/api/login', loginData);
        }

        if (response && response.success) {
            // Store user token/session (in production, use secure methods)
            localStorage.setItem('userToken', response.token);
            localStorage.setItem('userData', JSON.stringify(response.user));
            
            // Redirect to dashboard
            window.location.href = 'index.html';
        } else {
            hideLoading();
            showError(password, (response && response.message) || 'Invalid credentials');
        }
    } catch (error) {
        hideLoading();
        showError(password, 'Login failed. Please try again.');
        console.error('Login error:', error);
    }
});

// Signup form handler
document.getElementById('signupFormElement').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName');
    const email = document.getElementById('signupEmail');
    const password = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const agreeTerms = document.getElementById('agreeTerms');
    let isValid = true;

    // Clear previous validations
    [name, email, password, confirmPassword].forEach(clearValidation);

    // Validate name
    if (!name.value.trim()) {
        showError(name, 'Full name is required');
        isValid = false;
    } else if (name.value.trim().length < 2) {
        showError(name, 'Name must be at least 2 characters long');
        isValid = false;
    } else {
        showSuccess(name);
    }

    // Validate email
    if (!email.value.trim()) {
        showError(email, 'Email is required');
        isValid = false;
    } else if (!validateEmail(email.value.trim())) {
        showError(email, 'Please enter a valid email address');
        isValid = false;
    } else {
        showSuccess(email);
    }

    // Validate password
    if (!password.value.trim()) {
        showError(password, 'Password is required');
        isValid = false;
    } else if (!validatePassword(password.value)) {
        showError(password, 'Password must be at least 6 characters long');
        isValid = false;
    } else {
        showSuccess(password);
    }

    // Validate password confirmation
    if (!confirmPassword.value.trim()) {
        showError(confirmPassword, 'Please confirm your password');
        isValid = false;
    } else if (password.value !== confirmPassword.value) {
        showError(confirmPassword, 'Passwords do not match');
        isValid = false;
    } else {
        showSuccess(confirmPassword);
    }

    // Validate terms agreement
    if (!agreeTerms.checked) {
        alert('Please agree to the Terms & Conditions');
        isValid = false;
    }

    if (!isValid) return;

    // Show loading
    showLoading('Creating your account...');

    try {
        const signupData = { name: name.value.trim(), email: email.value.trim(), password: password.value };
        let response;
        try {
            response = await apiFetch('/signup', { method: 'POST', body: signupData });
        } catch (networkErr) {
            response = await mockApiCall('/api/signup', signupData);
        }

        if (response && response.success) {
            hideLoading();
            alert('Account created successfully! Please sign in.');
            switchToLogin();
            // Clear signup form
            document.getElementById('signupFormElement').reset();
        } else {
            hideLoading();
            showError(email, (response && response.message) || 'Account creation failed');
        }
    } catch (error) {
        hideLoading();
        showError(email, 'Account creation failed. Please try again.');
        console.error('Signup error:', error);
    }
});

// Loading overlay functions
function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    overlay.querySelector('p').textContent = message;
    overlay.classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

// Social login functions (placeholders)
function loginWithGoogle() {
    alert('🔍 Google OAuth Integration\n\nThis would integrate with Google OAuth:\n• Redirect to Google consent screen\n• Handle OAuth callback\n• Create/login user account\n\nGoogle OAuth credentials needed!');
}

function loginWithFacebook() {
    alert('📘 Facebook Login Integration\n\nThis would integrate with Facebook Login:\n• Facebook SDK initialization\n• Handle login response\n• Create/login user account\n\nFacebook App ID needed!');
}

// Mock API call function (replace with actual backend calls)
async function mockApiCall(endpoint, data) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock responses based on endpoint
    if (endpoint === '/api/login') {
        // Mock successful login (in production, validate against database)
        if (data.email === 'demo@moodtracker.com' && data.password === 'demo123') {
            return {
                success: true,
                token: 'mock_jwt_token_' + Date.now(),
                user: {
                    id: 1,
                    name: 'Demo User',
                    email: data.email
                }
            };
        } else {
            return {
                success: false,
                message: 'Invalid email or password'
            };
        }
    } else if (endpoint === '/api/signup') {
        // Mock successful signup (in production, save to database)
        return {
            success: true,
            message: 'Account created successfully'
        };
    }
    
    return { success: false, message: 'Unknown error' };
}

// Check if user is already logged in
function checkAuthStatus() {
    const token = localStorage.getItem('userToken');
    if (token) {
        // In production, validate token with backend
        // For now, redirect to dashboard if token exists
        window.location.href = 'index.html';
    }
}

// Real-time input validation
document.addEventListener('DOMContentLoaded', function() {
    // Check auth status on page load
    checkAuthStatus();
    
    // Add real-time validation to inputs
    const inputs = document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim()) {
                if (this.type === 'email' && validateEmail(this.value.trim())) {
                    showSuccess(this);
                } else if (this.type === 'password' && validatePassword(this.value)) {
                    showSuccess(this);
                } else if (this.type === 'text' && this.value.trim().length >= 2) {
                    showSuccess(this);
                }
            }
        });
        
        input.addEventListener('input', function() {
            clearValidation(this);
        });
    });
});

// Demo credentials helper
document.addEventListener('DOMContentLoaded', function() {
    // Add demo credentials info
    const demoInfo = document.createElement('div');
    demoInfo.innerHTML = `
        <div style="
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 12px;
            z-index: 1000;
        ">
            <strong>Demo Credentials:</strong><br>
            Email: demo@moodtracker.com<br>
            Password: demo123
        </div>
    `;
    document.body.appendChild(demoInfo);
});
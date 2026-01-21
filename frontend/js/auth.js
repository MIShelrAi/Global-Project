// =============================================
// AUTHENTICATION MODULE
// =============================================

class AuthManager {
    constructor() {
        this.supabase = window.supabaseClient;
        this.user = null;
        this.init();
    }

    async init() {
        // Check current session
        const { data: { session } } = await this.supabase.auth.getSession();
        this.user = session?.user || null;
        
        // Listen for auth changes
        this.supabase.auth.onAuthStateChange((event, session) => {
            this.user = session?.user || null;
            this.updateUI();
            
            if (event === 'SIGNED_IN') {
                this.onSignIn();
            } else if (event === 'SIGNED_OUT') {
                this.onSignOut();
            }
        });

        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
                document.getElementById(`${tab.dataset.tab}-form`)?.classList.remove('hidden');
            });
        });

        // Login form
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Signup form
        document.getElementById('signup-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.signup();
        });

        // Social logins
        document.getElementById('google-login')?.addEventListener('click', () => {
            this.socialLogin('google');
        });

        document.getElementById('github-login')?.addEventListener('click', () => {
            this.socialLogin('github');
        });

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.logout();
        });
    }

    async login() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');

        try {
            const { error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            window.location.href = 'index.html';
        } catch (error) {
            errorEl.textContent = error.message;
        }
    }

    async signup() {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const errorEl = document.getElementById('signup-error');

        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: name }
                }
            });

            if (error) throw error;

            // Create profile
            if (data.user) {
                await this.supabase.from('profiles').insert({
                    id: data.user.id,
                    email: email,
                    full_name: name
                });
            }

            alert('Check your email for verification link!');
        } catch (error) {
            errorEl.textContent = error.message;
        }
    }

    async socialLogin(provider) {
        try {
            const { error } = await this.supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin + '/index.html'
                }
            });

            if (error) throw error;
        } catch (error) {
            alert(error.message);
        }
    }

    async logout() {
        await this.supabase.auth.signOut();
        window.location.href = 'index.html';
    }

    onSignIn() {
        console.log('User signed in:', this.user?.email);
    }

    onSignOut() {
        console.log('User signed out');
    }

    updateUI() {
        const isLoggedIn = !!this.user;

        document.querySelectorAll('.auth-required').forEach(el => {
            el.style.display = isLoggedIn ? '' : 'none';
        });

        document.querySelectorAll('.guest-only').forEach(el => {
            el.style.display = isLoggedIn ? 'none' : '';
        });

        if (isLoggedIn) {
            document.querySelectorAll('.user-email').forEach(el => {
                el.textContent = this.user.email;
            });
        }
    }

    getUser() {
        return this.user;
    }

    isAuthenticated() {
        return !!this.user;
    }
}

// Initialize
window.authManager = new AuthManager();
console.log('✅ Auth Manager initialized');
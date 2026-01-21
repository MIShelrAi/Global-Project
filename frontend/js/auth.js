

class AuthManager {
    constructor() {
        this.supabase = window.supabaseClient;
        this.currentUser = null;
        this.userProfile = null;
        this.init();
    }

    async init() {
        // Check for existing session
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            await this.loadUserProfile();
        }

        // Listen for auth changes
        this.supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth event:', event);
            
            if (event === 'SIGNED_IN' && session) {
                this.currentUser = session.user;
                await this.loadUserProfile();
                this.updateUI();
                
                // Redirect if on auth page
                if (window.location.pathname.includes('auth.html')) {
                    window.location.href = 'index.html';
                }
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.userProfile = null;
                this.updateUI();
                
                // Redirect to auth page
                if (!window.location.pathname.includes('auth.html')) {
                    window.location.href = 'auth.html';
                }
            }
        });

        this.updateUI();
    }

    async loadUserProfile() {
        if (!this.currentUser) return;

        const { data, error } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', this.currentUser.id)
            .single();

        if (error) {
            console.error('Error loading profile:', error);
            return;
        }

        this.userProfile = data;
    }

    // ==========================================
    // SIGN UP
    // ==========================================
    async signUp(email, password, fullName) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (error) throw error;

            return {
                success: true,
                message: 'Check your email to confirm your account!',
                user: data.user
            };
        } catch (error) {
            console.error('Signup error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ==========================================
    // SIGN IN
    // ==========================================
    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            return {
                success: true,
                user: data.user
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ==========================================
    // SOCIAL AUTH (Google, GitHub)
    // ==========================================
    async signInWithProvider(provider) {
        try {
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: provider, // 'google', 'github', 'facebook'
                options: {
                    redirectTo: `${window.location.origin}/index.html`
                }
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('OAuth error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ==========================================
    // SIGN OUT
    // ==========================================
    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            window.location.href = 'auth.html';
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ==========================================
    // PASSWORD RESET
    // ==========================================
    async resetPassword(email) {
        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html`
            });

            if (error) throw error;

            return {
                success: true,
                message: 'Password reset email sent!'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ==========================================
    // UPDATE PASSWORD
    // ==========================================
    async updatePassword(newPassword) {
        try {
            const { error } = await this.supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            return {
                success: true,
                message: 'Password updated successfully!'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ==========================================
    // UPDATE PROFILE
    // ==========================================
    async updateProfile(updates) {
        if (!this.currentUser) return { success: false, message: 'Not logged in' };

        try {
            const { error } = await this.supabase
                .from('profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.currentUser.id);

            if (error) throw error;

            await this.loadUserProfile();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ==========================================
    // UI HELPERS
    // ==========================================
    updateUI() {
        const authButtons = document.getElementById('auth-buttons');
        const userInfo = document.getElementById('user-info');
        const protectedContent = document.querySelectorAll('.protected');

        if (this.currentUser) {
            // Show user info, hide auth buttons
            if (authButtons) authButtons.style.display = 'none';
            if (userInfo) {
                userInfo.style.display = 'flex';
                const userName = userInfo.querySelector('.user-name');
                const userEmail = userInfo.querySelector('.user-email');
                if (userName) userName.textContent = this.userProfile?.full_name || 'User';
                if (userEmail) userEmail.textContent = this.currentUser.email;
            }

            // Show protected content
            protectedContent.forEach(el => el.style.display = 'block');
        } else {
            // Show auth buttons, hide user info
            if (authButtons) authButtons.style.display = 'flex';
            if (userInfo) userInfo.style.display = 'none';

            // Hide protected content
            protectedContent.forEach(el => el.style.display = 'none');
        }
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    requireAuth() {
        if (!this.currentUser) {
            window.location.href = 'auth.html';
            return false;
        }
        return true;
    }
}

// Initialize auth manager
window.authManager = new AuthManager();
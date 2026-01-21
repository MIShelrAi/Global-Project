// ============================================
// SUPABASE CONFIGURATION FOR DIGITAL KRISHI
// ============================================

// 📋 HOW TO GET YOUR SUPABASE CREDENTIALS:
// 1. Go to https://supabase.com/dashboard
// 2. Select your project or create a new one
// 3. Go to Settings → API
// 4. Copy the "Project URL" (looks like: https://your-project-id.supabase.co)
// 5. Copy the "anon public" key
// 6. Replace the placeholder values below

// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://acopbivjinlcqtwtsiqg.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjb3BiaXZqaW5sY3F0d3RzaXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MjM3NTMsImV4cCI6MjA4NDQ5OTc1M30.Hu4GmJLUasOg9UDHsJnIJK3C7Cv2TeXqQTQ8ZGs0fD0'; 
const PLANT_ID_API_KEY = 'YOUR_PLANT_ID_API_KEY';

// Initialize Supabase client
const { supabase } = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// App Configuration
const CONFIG = {
    app: {
        name: 'Digital Krishi',
        description: 'Smart farming platform for crop disease detection and management'
    },
    auth: {
        redirectUrl: `${window.location.origin}/dashboard.html`,
        passwordMinLength: 6
    },
    plantIdApi: 'https://api.plant.id/v3/health_assessment',
    maxImageSize: 5 * 1024 * 1024, // 5MB
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    scanLimits: {
        free: 10,
        premium: 100,
        pro: Infinity
    },
    features: {
        enableSocialAuth: true,
        providers: ['google', 'github']
    }
};

// Export for use in other files
window.supabaseClient = supabase;
window.APP_CONFIG = CONFIG;
window.PLANT_ID_API_KEY = PLANT_ID_API_KEY;

// Check if configuration is properly set
if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.warn('⚠️ Please update SUPABASE_URL and SUPABASE_ANON_KEY in supabase-config.js');
}
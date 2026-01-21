// App Configuration
const CONFIG = {
    // Supabase Configuration
    SUPABASE_URL: 'https://bphxlvnwirystwwywpwa.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwaHhsdm53aXJ5c3R3d3l3cHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5ODM2MDgsImV4cCI6MjA4NDU1OTYwOH0._aoHGnZKhsvS_cAJqo5xDWokwNNw9m7yPIBn9TxMPQ8',
    
    // Google Gemini API
    GEMINI_API_KEY: 'AIzaSyAFZOhyrTFVyxNUkDhYzb0DV1cNwmeIHCw',
    GEMINI_MODEL: 'gemini-1.5-pro',
    
    // App Settings
    MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
    
    // Auth Settings
    auth: {
        redirectUrl: `${window.location.origin}/index.html`,
        passwordMinLength: 6
    },
    
    // Scan limits
    scanLimits: {
        free: 10,
        premium: 100,
        pro: Infinity
    },
    
    // Features
    features: {
        enableSocialAuth: true,
        providers: ['google', 'github']
    },
    
    // App info
    app: {
        name: 'Digital Krishi',
        description: 'Smart farming platform for crop disease detection and management'
    }
};

// Initialize Supabase client
const { supabase } = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// Export for use in other files
window.supabaseClient = supabase;
window.APP_CONFIG = CONFIG;
window.PLANT_ID_API_KEY = CONFIG.GEMINI_API_KEY;

// Check if configuration is properly set
if (CONFIG.SUPABASE_URL.includes('your-project') || CONFIG.SUPABASE_ANON_KEY.includes('your-anon-key')) {
    console.warn('⚠️ Please update SUPABASE_URL and SUPABASE_ANON_KEY in supabase-config.js');
}
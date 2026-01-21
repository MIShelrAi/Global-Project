const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const PLANT_ID_API_KEY = 'YOUR_PLANT_ID_API_KEY';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// API Configuration
const CONFIG = {
    plantIdApi: 'https://api.plant.id/v3/health_assessment',
    maxImageSize: 5 * 1024 * 1024, // 5MB
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    scanLimits: {
        free: 10,
        premium: 100,
        pro: Infinity
    }
};

// Export for use in other files
window.supabaseClient = supabase;
window.APP_CONFIG = CONFIG;
window.PLANT_ID_API_KEY = PLANT_ID_API_KEY;

const CONFIG = {
    // Supabase Configuration
    SUPABASE_URL: 'https://acopbivjinlcqtwtsiqg.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjb3BiaXZqaW5sY3F0d3RzaXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MjM3NTMsImV4cCI6MjA4NDQ5OTc1M30.Hu4GmJLUasOg9UDHsJnIJK3C7Cv2TeXqQTQ8ZGs0fD0',
    
    // Google Gemini API
    GEMINI_API_KEY: 'AIzaSyAFZOhyrTFVyxNUkDhYzb0DV1cNwmeIHCw',
    GEMINI_MODEL: 'gemini-1.5-pro', // or 'gemini-1.5-pro' for better accuracy
    
    // App Settings
    MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
};

// Initialize Supabase
const supabase = window.supabase.createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_ANON_KEY
);

// Export to global scope
window.CONFIG = CONFIG;
window.supabaseClient = supabase;

console.log('✅ Configuration loaded');
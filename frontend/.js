// State
let selectedImage = null;
let imagePreview = null;
let identificationResult = null;
let currentLanguage = 'en'; // 'en' or 'ne'

// Translation dictionary
const translations = {
    en: {
        app_title: "AI Plant Identifier",
        app_subtitle: "Identify plants instantly with AI",
        upload_title: "Upload Plant Photo",
        change_photo: "Change Photo",
        drop_photo: "Drop your plant photo here",
        or_browse: "or click to browse",
        upload_photo: "Upload Photo",
        take_photo: "Take Photo",
        identify_plant: "Identify Plant",
        identifying: "Identifying Plant...",
        how_it_works: "How It Works",
        step1_title: "1. Upload a Photo",
        step1_desc: "Take or upload a clear photo of your plant",
        step2_title: "2. AI Identification",
        step2_desc: "Our AI analyzes and identifies your plant",
        step3_title: "3. Get Care Tips",
        step3_desc: "Receive detailed care instructions",
        features: "Features",
        feature1: "98% accurate plant identification",
        feature2: "Disease and pest detection",
        feature3: "Personalized care instructions",
        feature4: "10,000+ plant species database",
        new_search: "New Search",
        care_level: "Care Level",
        growth_rate: "Growth Rate",
        origin: "Origin",
        toxicity_warning: "Toxicity Warning",
        tab_information: "Information",
        tab_care: "Care Guide",
        tab_similar: "Similar Plants",
        description: "Description",
        watering: "Watering",
        light_requirements: "Light Requirements",
        temperature: "Temperature",
        humidity: "Humidity",
        similar_plants_title: "Similar Plants You Might Like",
        learn_more: "Learn More →",
        save_collection: "Save to Collection",
        share_results: "Share Results",
        match: "Match"
    },
    ne: {
        app_title: "एआई बिरुवा पहिचानकर्ता",
        app_subtitle: "एआईसँग तुरुन्तै बिरुवा पहिचान गर्नुहोस्",
        upload_title: "बिरुवाको फोटो अपलोड गर्नुहोस्",
        change_photo: "फोटो परिवर्तन गर्नुहोस्",
        drop_photo: "आफ्नो बिरुवाको फोटो यहाँ राख्नुहोस्",
        or_browse: "वा ब्राउज गर्न क्लिक गर्नुहोस्",
        upload_photo: "फोटो अपलोड गर्नुहोस्",
        take_photo: "फोटो खिच्नुहोस्",
        identify_plant: "बिरुवा पहिचान गर्नुहोस्",
        identifying: "बिरुवा पहिचान गर्दै...",
        how_it_works: "यो कसरी काम गर्छ",
        step1_title: "१. फोटो अपलोड गर्नुहोस्",
        step1_desc: "आफ्नो बिरुवाको स्पष्ट फोटो खिच्नुहोस् वा अपलोड गर्नुहोस्",
        step2_title: "२. एआई पहिचान",
        step2_desc: "हाम्रो एआईले तपाईंको बिरुवा विश्लेषण र पहिचान गर्छ",
        step3_title: "३. हेरचाह सुझावहरू प्राप्त गर्नुहोस्",
        step3_desc: "विस्तृत हेरचाह निर्देशनहरू प्राप्त गर्नुहोस्",
        features: "विशेषताहरू",
        feature1: "९८% सटीक बिरुवा पहिचान",
        feature2: "रोग र कीट पत्ता लगाउने",
        feature3: "व्यक्तिगत हेरचाह निर्देशनहरू",
        feature4: "१०,००० + बिरुवा प्रजाति डाटाबेस",
        new_search: "नयाँ खोज",
        care_level: "हेरचाह स्तर",
        growth_rate: "वृद्धि दर",
        origin: "उत्पत्ति",
        toxicity_warning: "विषाक्तता चेतावनी",
        tab_information: "जानकारी",
        tab_care: "हेरचाह गाइड",
        tab_similar: "समान बिरुवाहरू",
        description: "विवरण",
        watering: "पानी दिने",
        light_requirements: "प्रकाश आवश्यकताहरू",
        temperature: "तापक्रम",
        humidity: "आर्द्रता",
        similar_plants_title: "तपाईंलाई मनपर्न सक्ने समान बिरुवाहरू",
        learn_more: "थप जान्नुहोस् →",
        save_collection: "संग्रहमा सुरक्षित गर्नुहोस्",
        share_results: "परिणामहरू साझा गर्नुहोस्",
        match: "मिलान"
    }
};

// Sample plant data with Nepali translations
const samplePlants = [
    {
        name: "Monstera Deliciosa",
        commonName: "Swiss Cheese Plant",
        confidence: 98.5,
        scientificName: "Monstera deliciosa",
        family: "Araceae",
        origin: {
            en: "Central America",
            ne: "मध्य अमेरिका"
        },
        description: {
            en: "A popular tropical plant known for its large, split leaves with natural holes. It's an easy-to-grow houseplant that can tolerate low light conditions.",
            ne: "प्राकृतिक प्वालहरू भएका ठूला, विभाजित पातहरूका लागि परिचित एक लोकप्रिय उष्णकटिबंधीय बिरुवा। यो कम प्रकाश अवस्था सहन सक्ने सजिलै बढ्ने घरेलु बिरुवा हो।"
        },
        toxicity: {
            en: "Toxic to pets and humans if ingested",
            ne: "खाएमा पाल्तु जनावर र मानिसका लागि विषाक्त"
        },
        watering: {
            en: "Water when top 2 inches of soil are dry, typically once a week",
            ne: "माटोको माथिल्लो २ इन्च सुक्दा पानी दिनुहोस्, सामान्यतया हप्तामा एक पटक"
        },
        light: {
            en: "Bright, indirect light. Can tolerate low light but grows slower",
            ne: "उज्यालो, अप्रत्यक्ष प्रकाश। कम प्रकाश सहन सक्छ तर बिस्तारै बढ्छ"
        },
        temperature: {
            en: "65-85°F (18-29°C)",
            ne: "६५-८५°F (१८-२९°C)"
        },
        humidity: {
            en: "High humidity preferred (60-80%)",
            ne: "उच्च आर्द्रता रुचाइन्छ (६०-८०%)"
        },
        care_level: {
            en: "Easy",
            ne: "सजिलो"
        },
        growth_rate: {
            en: "Fast",
            ne: "छिटो"
        },
        similar_plants: ["Monstera Adansonii", "Philodendron Selloum", "Epipremnum Aureum"]
    },
    {
        name: "Ficus Lyrata",
        commonName: "Fiddle Leaf Fig",
        confidence: 95.2,
        scientificName: "Ficus lyrata",
        family: "Moraceae",
        origin: {
            en: "Western Africa",
            ne: "पश्चिम अफ्रिका"
        },
        description: {
            en: "A striking plant with large, violin-shaped leaves. It's become one of the most popular indoor trees for modern homes.",
            ne: "ठूला, भायोलिन आकारका पातहरू भएको आकर्षक बिरुवा। यो आधुनिक घरहरूको लागि सबैभन्दा लोकप्रिय इनडोर रूखहरू मध्ये एक बनेको छ।"
        },
        toxicity: {
            en: "Toxic to pets if ingested",
            ne: "खाएमा पाल्तु जनावरका लागि विषाक्त"
        },
        watering: {
            en: "Water when top inch of soil is dry, usually every 7-10 days",
            ne: "माटोको माथिल्लो इन्च सुक्दा पानी दिनुहोस्, सामान्यतया हरेक ७-१० दिनमा"
        },
        light: {
            en: "Bright, indirect light. Needs more light than most ficus",
            ne: "उज्यालो, अप्रत्यक्ष प्रकाश। धेरैजसो फिकसभन्दा बढी प्रकाश चाहिन्छ"
        },
        temperature: {
            en: "60-75°F (15-24°C)",
            ne: "६०-७५°F (१५-२४°C)"
        },
        humidity: {
            en: "Moderate to high (40-60%)",
            ne: "मध्यम देखि उच्च (४०-६०%)"
        },
        care_level: {
            en: "Moderate",
            ne: "मध्यम"
        },
        growth_rate: {
            en: "Moderate",
            ne: "मध्यम"
        },
        similar_plants: ["Ficus Elastica", "Ficus Benghalensis", "Ficus Audrey"]
    },
    {
        name: "Pothos",
        commonName: "Devil's Ivy",
        confidence: 92.8,
        scientificName: "Epipremnum aureum",
        family: "Araceae",
        origin: {
            en: "Southeast Asia",
            ne: "दक्षिणपूर्व एशिया"
        },
        description: {
            en: "One of the easiest houseplants to grow, with heart-shaped leaves that can be green or variegated. Perfect for beginners.",
            ne: "बढाउनको लागि सबैभन्दा सजिलो घरेलु बिरुवाहरू मध्ये एक, मुटुको आकारका पातहरू जुन हरियो वा विविध हुन सक्छन्। शुरुआतीहरूका लागि उत्तम।"
        },
        toxicity: {
            en: "Toxic to pets if ingested",
            ne: "खाएमा पाल्तु जनावरका लागि विषाक्त"
        },
        watering: {
            en: "Water when soil is mostly dry, every 1-2 weeks",
            ne: "माटो प्रायः सुक्दा पानी दिनुहोस्, हरेक १-२ हप्तामा"
        },
        light: {
            en: "Low to bright, indirect light. Very adaptable",
            ne: "कम देखि उज्यालो, अप्रत्यक्ष प्रकाश। धेरै अनुकूलनीय"
        },
        temperature: {
            en: "65-85°F (18-29°C)",
            ne: "६५-८५°F (१८-२९°C)"
        },
        humidity: {
            en: "Average household humidity (40-60%)",
            ne: "औसत घरेलु आर्द्रता (४०-६०%)"
        },
        care_level: {
            en: "Very Easy",
            ne: "धेरै सजिलो"
        },
        growth_rate: {
            en: "Fast",
            ne: "छिटो"
        },
        similar_plants: ["Philodendron Heartleaf", "Scindapsus Pictus", "Philodendron Brasil"]
    }
];

// DOM Elements
const uploadSection = document.getElementById('uploadSection');
const resultsSection = document.getElementById('resultsSection');
const uploadBtn = document.getElementById('uploadBtn');
const cameraBtn = document.getElementById('cameraBtn');
const fileInput = document.getElementById('fileInput');
const cameraInput = document.getElementById('cameraInput');
const identifyBtn = document.getElementById('identifyBtn');
const identifyText = document.getElementById('identifyText');
const changePhotoBtn = document.getElementById('changePhotoBtn');
const newSearchBtn = document.getElementById('newSearchBtn');
const previewContainer = document.getElementById('previewContainer');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const imagePreviewEl = document.getElementById('imagePreview');
const languageToggle = document.getElementById('languageToggle');
const languageLabel = document.getElementById('languageLabel');

// Event Listeners
uploadBtn.addEventListener('click', () => fileInput.click());
cameraBtn.addEventListener('click', () => cameraInput.click());
fileInput.addEventListener('change', handleImageSelect);
cameraInput.addEventListener('change', handleImageSelect);
identifyBtn.addEventListener('click', identifyPlant);
changePhotoBtn.addEventListener('click', changePhoto);
newSearchBtn.addEventListener('click', reset);
languageToggle.addEventListener('click', toggleLanguage);

// Tab functionality
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('tab-active'));
        tab.classList.add('tab-active');
        
        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('tab-panel-active');
        });
        document.getElementById(targetTab + 'Tab').classList.add('tab-panel-active');
    });
});

// Translation Functions
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ne' : 'en';
    languageLabel.textContent = currentLanguage === 'en' ? 'नेपाली' : 'English';
    updatePageTranslations();
    
    // If results are showing, update them too
    if (identificationResult) {
        updateResultTranslations();
    }
}

function updatePageTranslations() {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
}

function updateResultTranslations() {
    if (!identificationResult) return;
    
    const lang = currentLanguage;
    
    document.getElementById('careLevel').textContent = identificationResult.care_level[lang];
    document.getElementById('growthRate').textContent = identificationResult.growth_rate[lang];
    document.getElementById('origin').textContent = identificationResult.origin[lang];
    
    if (identificationResult.toxicity) {
        document.getElementById('toxicityText').textContent = identificationResult.toxicity[lang];
    }
    
    document.getElementById('description').textContent = identificationResult.description[lang];
    document.getElementById('watering').textContent = identificationResult.watering[lang];
    document.getElementById('light').textContent = identificationResult.light[lang];
    document.getElementById('temperature').textContent = identificationResult.temperature[lang];
    document.getElementById('humidity').textContent = identificationResult.humidity[lang];
}

// Functions
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (file) {
        selectedImage = file;
        const reader = new FileReader();
        reader.onloadend = () => {
            imagePreview = reader.result;
            displayImagePreview();
        };
        reader.readAsDataURL(file);
    }
}

function displayImagePreview() {
    uploadPlaceholder.classList.add('hidden');
    previewContainer.classList.remove('hidden');
    imagePreviewEl.src = imagePreview;
    identifyBtn.classList.remove('hidden');
}

function changePhoto() {
    fileInput.click();
}

function identifyPlant() {
    if (!selectedImage) return;
    
    // Show loading state
    identifyBtn.disabled = true;
    const loadingText = currentLanguage === 'en' ? 'Identifying Plant...' : 'बिरुवा पहिचान गर्दै...';
    identifyText.innerHTML = `<div class="spinner"></div><span>${loadingText}</span>`;
    
    // Simulate AI identification
    setTimeout(() => {
        const randomPlant = samplePlants[Math.floor(Math.random() * samplePlants.length)];
        identificationResult = randomPlant;
        displayResults();
    }, 2000);
}

function displayResults() {
    const lang = currentLanguage;
    
    // Hide upload section, show results
    uploadSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    
    // Populate result data
    document.getElementById('plantName').textContent = identificationResult.name;
    const matchText = translations[lang].match;
    document.getElementById('confidence').textContent = identificationResult.confidence + '% ' + matchText;
    document.getElementById('commonName').textContent = identificationResult.commonName;
    document.getElementById('scientificInfo').textContent = 
        `${identificationResult.scientificName} • ${identificationResult.family}`;
    
    document.getElementById('resultImage').src = imagePreview;
    document.getElementById('resultImage').alt = identificationResult.name;
    
    document.getElementById('careLevel').textContent = identificationResult.care_level[lang];
    document.getElementById('growthRate').textContent = identificationResult.growth_rate[lang];
    document.getElementById('origin').textContent = identificationResult.origin[lang];
    
    // Toxicity warning
    const toxicityWarning = document.getElementById('toxicityWarning');
    if (identificationResult.toxicity) {
        toxicityWarning.classList.remove('hidden');
        document.getElementById('toxicityText').textContent = identificationResult.toxicity[lang];
    } else {
        toxicityWarning.classList.add('hidden');
    }
    
    // Tab content
    document.getElementById('description').textContent = identificationResult.description[lang];
    document.getElementById('watering').textContent = identificationResult.watering[lang];
    document.getElementById('light').textContent = identificationResult.light[lang];
    document.getElementById('temperature').textContent = identificationResult.temperature[lang];
    document.getElementById('humidity').textContent = identificationResult.humidity[lang];
    
    // Similar plants
    const similarPlantsContainer = document.getElementById('similarPlants');
    similarPlantsContainer.innerHTML = '';
    const learnMoreText = translations[lang].learn_more;
    
    identificationResult.similar_plants.forEach(plant => {
        const plantDiv = document.createElement('div');
        plantDiv.className = 'similar-plant';
        plantDiv.innerHTML = `
            <div class="similar-plant-info">
                <div class="similar-plant-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                    </svg>
                </div>
                <span class="similar-plant-name">${plant}</span>
            </div>
            <button class="similar-plant-link">${learnMoreText}</button>
        `;
        similarPlantsContainer.appendChild(plantDiv);
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function reset() {
    selectedImage = null;
    imagePreview = null;
    identificationResult = null;
    
    // Reset UI
    uploadSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    previewContainer.classList.add('hidden');
    uploadPlaceholder.classList.remove('hidden');
    identifyBtn.classList.add('hidden');
    identifyBtn.disabled = false;
    
    const identifyText = translations[currentLanguage].identify_plant;
    document.getElementById('identifyText').innerHTML = identifyText;
    
    // Reset file inputs
    fileInput.value = '';
    cameraInput.value = '';
    
    // Reset tabs
    document.querySelectorAll('.tab').forEach((tab, index) => {
        if (index === 0) {
            tab.classList.add('tab-active');
        } else {
            tab.classList.remove('tab-active');
        }
    });
    
    document.querySelectorAll('.tab-panel').forEach((panel, index) => {
        if (index === 0) {
            panel.classList.add('tab-panel-active');
        } else {
            panel.classList.remove('tab-panel-active');
        }
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
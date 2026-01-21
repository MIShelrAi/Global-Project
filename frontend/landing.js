// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards
document.querySelectorAll('.feature-card, .product-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease-out';
    observer.observe(card);
});

// Contact form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const name = contactForm.querySelector('input[type="text"]').value;
        const email = contactForm.querySelector('input[type="email"]').value;
        const phone = contactForm.querySelector('input[type="tel"]').value;
        const message = contactForm.querySelector('textarea').value;
        
        // Simple validation
        if (name && email && message) {
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        } else {
            alert('Please fill in all required fields.');
        }
    });
}

// Language toggle functionality
const langBtn = document.querySelector('.lang-btn');
let isNepali = false;

// Nepali translations
const translations = {
    en: {
        navLinks: ['Home', 'About', 'Services', 'Products', 'Contact'],
        heroTitle: 'Growing Together',
        heroSubtitle: 'Empowering Farmers with Modern Agricultural Solutions',
        getStarted: 'Get Started',
        learnMore: 'Learn More',
        services: 'Our Services',
        features: [
            { title: 'Smart Farming', desc: 'Leverage technology to optimize crop yields and reduce resource waste' },
            { title: 'Market Analytics', desc: 'Real-time market prices and trends to help farmers make informed decisions' },
            { title: 'Weather Forecasting', desc: 'Accurate weather predictions tailored for agricultural planning' },
            { title: 'Expert Advice', desc: 'Connect with agricultural experts for personalized guidance' }
        ],
        about: 'About Digital Krishi',
        aboutText1: 'Digital Krishi is dedicated to transforming agriculture through innovative digital solutions. We bridge the gap between traditional farming practices and modern technology, empowering farmers with tools and knowledge to increase productivity and profitability.',
        aboutText2: 'Our mission is to make agriculture sustainable, efficient, and accessible to every farmer in Nepal.',
        products: 'Our Products',
        productCards: [
            { title: 'Mobile App', desc: 'Access all our services on the go with our user-friendly mobile application', btn: 'Download' },
            { title: 'Web Platform', desc: 'Comprehensive dashboard for managing your farming operations', btn: 'Explore' },
            { title: 'IoT Sensors', desc: 'Smart sensors for monitoring soil health, moisture, and crop conditions', btn: 'Learn More' }
        ],
        contact: 'Get In Touch',
        name: 'Your Name',
        email: 'Your Email',
        phone: 'Phone Number',
        message: 'Your Message',
        sendMessage: 'Send Message',
        location: 'Location',
        contactEmail: 'Email',
        contactPhone: 'Phone',
        quickLinks: 'Quick Links',
        followUs: 'Follow Us'
    },
    np: {
        navLinks: ['गृहपृष्ठ', 'हाम्रोबारे', 'सेवाहरू', 'उत्पादनहरू', 'सम्पर्क'],
        heroTitle: 'सँगै बढ्दै',
        heroSubtitle: 'आधुनिक कृषि समाधानहरूले किसानहरूलाई सशक्त बनाउँदै',
        getStarted: 'सुरु गर्नुहोस्',
        learnMore: 'थप जान्नुहोस्',
        services: 'हाम्रा सेवाहरू',
        features: [
            { title: 'स्मार्ट कृषि', desc: 'प्रविधिको प्रयोग गरेर बाली उत्पादन अनुकूलन गर्नुहोस् र स्रोत बर्बादी घटाउनुहोस्' },
            { title: 'बजार विश्लेषण', desc: 'किसानहरूलाई सूचित निर्णयहरू गर्न मद्दत गर्न वास्तविक-समय बजार मूल्यहरू र प्रवृत्तिहरू' },
            { title: 'मौसम पूर्वानुमान', desc: 'कृषि योजनाको लागि उपयुक्त सटीक मौसम पूर्वानुमानहरू' },
            { title: 'विशेषज्ञ सल्लाह', desc: 'व्यक्तिगत मार्गदर्शनको लागि कृषि विशेषज्ञहरूसँग जडान' }
        ],
        about: 'डिजिटल कृषिको बारेमा',
        aboutText1: 'डिजिटल कृषि नवीन डिजिटल समाधानहरू मार्फत कृषिलाई रूपान्तरण गर्न समर्पित छ। हामी परम्परागत कृषि प्रथाहरू र आधुनिक प्रविधि बीचको खाडललाई पुल गर्दछौं, किसानहरूलाई उत्पादकता र लाभदायित्व बढाउन उपकरणहरू र ज्ञानको साथ सशक्त बनाउँदै।',
        aboutText2: 'हाम्रो मिशन नेपालका हरेक किसानको लागि कृषिलाई टिकाउ, कुशल, र पहुँचयोग्य बनाउनु हो।',
        products: 'हाम्रा उत्पादनहरू',
        productCards: [
            { title: 'मोबाइल एप', desc: 'हाम्रो प्रयोगकर्ता-मैत्री मोबाइल अनुप्रयोगमार्फत सबै सेवाहरू पहुँच गर्नुहोस्', btn: 'डाउनलोड गर्नुहोस्' },
            { title: 'वेब प्लेटफर्म', desc: 'तपाईंको कृषि सञ्चालन व्यवस्थापन गर्न व्यापक ड्यासबोर्ड', btn: 'अन्वेषण गर्नुहोस्' },
            { title: 'IoT सेन्सरहरू', desc: 'माटो स्वास्थ्य, नमी, र बाली अवस्थाहरू अनुगमन गर्न स्मार्ट सेन्सरहरू', btn: 'थप जान्नुहोस्' }
        ],
        contact: 'सम्पर्कमा',
        name: 'तपाईंको नाम',
        email: 'तपाईंको इमेल',
        phone: 'फोन नम्बर',
        message: 'तपाईंको सन्देश',
        sendMessage: 'सन्देश पठाउनुहोस्',
        location: 'स्थान',
        contactEmail: 'इमेल',
        contactPhone: 'फोन',
        quickLinks: 'द्रुत लिंकहरू',
        followUs: 'हामीलाई फलो गर्नुहोस्'
    }
};

if (langBtn) {
    langBtn.addEventListener('click', () => {
        isNepali = !isNepali;
        langBtn.textContent = isNepali ? 'English' : 'नेपाली';
        
        // Update all text content
        updateLanguage(isNepali ? 'np' : 'en');
    });
}

function updateLanguage(lang) {
    const t = translations[lang];
    
    // Update navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach((link, index) => {
        if (t.navLinks[index]) {
            link.textContent = t.navLinks[index];
        }
    });
    
    // Update hero section
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    
    if (heroTitle) heroTitle.textContent = t.heroTitle;
    if (heroSubtitle) heroSubtitle.textContent = t.heroSubtitle;
    if (heroButtons[0]) heroButtons[0].textContent = t.getStarted;
    if (heroButtons[1]) heroButtons[1].textContent = t.learnMore;
    
    // Update features section
    const featuresTitle = document.querySelector('.features .section-title');
    if (featuresTitle) featuresTitle.textContent = t.services;
    
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        if (t.features[index]) {
            const h3 = card.querySelector('h3');
            const p = card.querySelector('p');
            if (h3) h3.textContent = t.features[index].title;
            if (p) p.textContent = t.features[index].desc;
        }
    });
    
    // Update about section
    const aboutTitle = document.querySelector('.about h2');
    const aboutTexts = document.querySelectorAll('.about-text p');
    
    if (aboutTitle) aboutTitle.textContent = t.about;
    if (aboutTexts[0]) aboutTexts[0].textContent = t.aboutText1;
    if (aboutTexts[1]) aboutTexts[1].textContent = t.aboutText2;
    
    // Update products section
    const productsTitle = document.querySelector('.products .section-title');
    if (productsTitle) productsTitle.textContent = t.products;
    
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        if (t.productCards[index]) {
            const h3 = card.querySelector('h3');
            const p = card.querySelector('p');
            const btn = card.querySelector('.btn-small');
            if (h3) h3.textContent = t.productCards[index].title;
            if (p) p.textContent = t.productCards[index].desc;
            if (btn) btn.textContent = t.productCards[index].btn;
        }
    });
    
    // Update contact section
    const contactTitle = document.querySelector('.contact .section-title');
    if (contactTitle) contactTitle.textContent = t.contact;
    
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        const inputs = contactForm.querySelectorAll('input, textarea');
        const placeholders = [t.name, t.email, t.phone, t.message];
        inputs.forEach((input, index) => {
            if (placeholders[index]) {
                input.placeholder = placeholders[index];
            }
        });
        
        const submitBtn = contactForm.querySelector('.btn-primary');
        if (submitBtn) submitBtn.textContent = t.sendMessage;
    }
    
    // Update contact info
    const infoItems = document.querySelectorAll('.info-item h4');
    const infoLabels = ['📍 ' + t.location, '📧 ' + t.contactEmail, '📞 ' + t.contactPhone];
    infoItems.forEach((item, index) => {
        if (infoLabels[index]) {
            item.textContent = infoLabels[index];
        }
    });
    
    // Update footer
    const footerLinks = document.querySelector('.footer-links h4');
    const footerSocial = document.querySelector('.footer-social h4');
    if (footerLinks) footerLinks.textContent = t.quickLinks;
    if (footerSocial) footerSocial.textContent = t.followUs;
}

// Add hover effect to buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

// Counter animation for stats (if you add stats section)
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-content');
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - (scrolled / 600);
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '1';
    }, 100);
});

// Mobile menu toggle (for future enhancement)
const createMobileMenu = () => {
    const navLinks = document.querySelector('.nav-links');
    const burger = document.createElement('div');
    burger.classList.add('burger-menu');
    burger.innerHTML = '☰';
    burger.style.display = 'none';
    burger.style.fontSize = '2rem';
    burger.style.color = 'white';
    burger.style.cursor = 'pointer';
    
    if (window.innerWidth <= 768) {
        burger.style.display = 'block';
        document.querySelector('.nav-content').appendChild(burger);
        
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
};

// Initialize mobile menu on load and resize
window.addEventListener('load', createMobileMenu);
window.addEventListener('resize', createMobileMenu);

console.log('Digital Krishi - Empowering Farmers with Technology');
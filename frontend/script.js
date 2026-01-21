let currentLang = 'en';
let currentTheme = 'light';

// =====================
// Initialization
// =====================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigationTabs();
    setupThemeToggle();
    setupLanguageToggle();
    setupFileUpload();
    setupMarketplaceFilters();
    setupProductButtons();
    setupRoleToggle();
    setupFarmerForm();
    setupLogout();
}

// =====================
// Navigation Tab System
// =====================
function setupNavigationTabs() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            navTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// =====================
// Theme Toggle (Light/Dark Mode)
// =====================
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    // Load saved theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    themeToggle.addEventListener('click', function() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(currentTheme);
    });
}

function setTheme(theme) {
    currentTheme = theme;
    const themeToggle = document.getElementById('themeToggle');
    
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.textContent = '🌙';
    }
    
    // Save theme preference
    localStorage.setItem('theme', theme);
}

// =====================
// Language Toggle (English/Nepali)
// =====================
function setupLanguageToggle() {
    const langToggle = document.getElementById('langToggle');
    
    // Load saved language from localStorage or default to English
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
    
    langToggle.addEventListener('click', function() {
        currentLang = currentLang === 'en' ? 'ne' : 'en';
        setLanguage(currentLang);
    });
}

function setLanguage(lang) {
    currentLang = lang;
    const langToggle = document.getElementById('langToggle');
    
    // Update button text
    langToggle.textContent = lang === 'en' ? '🌐 EN' : '🌐 ने';
    
    // Update all elements with language attributes
    const elements = document.querySelectorAll('[data-en][data-ne]');
    elements.forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            element.textContent = text;
        }
    });
    
    // Save language preference
    localStorage.setItem('language', lang);
}

// =====================
// File Upload for Disease Scanner
// =====================
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const chooseBtn = document.getElementById('chooseBtn');

    // Click on button to trigger file input
    chooseBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        fileInput.click();
    });

    // Click on upload area to trigger file input
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    });

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--primary-green)';
        this.style.background = 'var(--bg-color)';
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--border-color)';
        this.style.background = 'var(--light-green)';
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--border-color)';
        this.style.background = 'var(--light-green)';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFileUpload(file);
        }
    });
}

function handleFileUpload(file) {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert(currentLang === 'en' ? 
            'File size exceeds 10MB. Please choose a smaller file.' : 
            'फाइल आकार 10MB भन्दा बढी छ। कृपया सानो फाइल छान्नुहोस्।');
        return;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        alert(currentLang === 'en' ? 
            'Please upload a valid image file (JPG, PNG, or WEBP).' : 
            'कृपया मान्य छवि फाइल अपलोड गर्नुहोस् (JPG, PNG, वा WEBP)।');
        return;
    }

    // Display preview and process image
    const reader = new FileReader();
    reader.onload = function(e) {
        displayImagePreview(e.target.result, file.name);
        // Here you would typically send the image to your backend API
        processImage(file);
    };
    reader.readAsDataURL(file);
}

function displayImagePreview(imageSrc, fileName) {
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <img src="${imageSrc}" style="max-width: 100%; max-height: 300px; border-radius: 8px; margin-bottom: 1rem;">
        <p style="color: var(--text-primary); font-weight: 600; margin-bottom: 0.5rem;">${fileName}</p>
        <button class="choose-btn" onclick="analyzeImage()" data-en="Analyze Image" data-ne="छवि विश्लेषण गर्नुहोस्">
            ${currentLang === 'en' ? 'Analyze Image' : 'छवि विश्लेषण गर्नुहोस्'}
        </button>
        <button class="choose-btn" onclick="resetUpload()" style="margin-left: 0.5rem; background: var(--text-secondary);" data-en="Upload Another" data-ne="अर्को अपलोड गर्नुहोस्">
            ${currentLang === 'en' ? 'Upload Another' : 'अर्को अपलोड गर्नुहोस्'}
        </button>
    `;
}

function resetUpload() {
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <div class="upload-icon">📸</div>
        <h3 class="upload-title" data-en="Upload Crop Image" data-ne="बाली छवि अपलोड गर्नुहोस्">
            ${currentLang === 'en' ? 'Upload Crop Image' : 'बाली छवि अपलोड गर्नुहोस्'}
        </h3>
        <p class="upload-subtitle" data-en="Take a clear photo of the affected plant or upload an existing image" data-ne="प्रभावित बिरुवाको स्पष्ट फोटो लिनुहोस् वा अवस्थित छवि अपलोड गर्नुहोस्">
            ${currentLang === 'en' ? 'Take a clear photo of the affected plant or upload an existing image' : 'प्रभावित बिरुवाको स्पष्ट फोटो लिनुहोस् वा अवस्थित छवि अपलोड गर्नुहोस्'}
        </p>
        <input type="file" id="fileInput" accept="image/*" style="display: none;">
        <button class="choose-btn" id="chooseBtn" data-en="Choose Image" data-ne="छवि छान्नुहोस्">
            ${currentLang === 'en' ? 'Choose Image' : 'छवि छान्नुहोस्'}
        </button>
        <p class="file-support" data-en="Supports: JPG, PNG, WEBP (Max 10MB)" data-ne="समर्थन: JPG, PNG, WEBP (अधिकतम 10MB)">
            ${currentLang === 'en' ? 'Supports: JPG, PNG, WEBP (Max 10MB)' : 'समर्थन: JPG, PNG, WEBP (अधिकतम 10MB)'}
        </p>
    `;
    setupFileUpload();
}

function analyzeImage() {
    alert(currentLang === 'en' ? 
        'Image analysis started! This will be connected to the backend API.' : 
        'छवि विश्लेषण सुरु भयो! यो ब्याकएन्ड API मा जडान हुनेछ।');
    // This is where you would call your backend API to analyze the image
    // Example: sendToBackendAPI(imageData);
}

function processImage(file) {
    // Placeholder for image processing logic
    console.log('Processing image:', file.name);
    // This would typically involve:
    // 1. Sending image to backend API
    // 2. Receiving disease detection results
    // 3. Displaying results to user
}

// =====================
// Marketplace Filters
// =====================
function setupMarketplaceFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter products based on category
            const category = this.getAttribute('data-category');
            filterProducts(category);
        });
    });
}

function filterProducts(category) {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// =====================
// Role Toggle (Farmer/Consumer)
// =====================
function setupRoleToggle() {
    const consumerViewBtn = document.getElementById('consumerViewBtn');
    const farmerViewBtn = document.getElementById('farmerViewBtn');
    const consumerView = document.getElementById('consumerView');
    const farmerView = document.getElementById('farmerView');

    if (consumerViewBtn && farmerViewBtn) {
        consumerViewBtn.addEventListener('click', function() {
            consumerViewBtn.classList.add('active');
            farmerViewBtn.classList.remove('active');
            consumerView.classList.add('active');
            farmerView.classList.remove('active');
        });

        farmerViewBtn.addEventListener('click', function() {
            farmerViewBtn.classList.add('active');
            consumerViewBtn.classList.remove('active');
            farmerView.classList.add('active');
            consumerView.classList.remove('active');
        });
    }
}

// =====================
// Farmer Product Management
// =====================
let farmerProducts = [];

function setupFarmerForm() {
    const addProductForm = document.getElementById('addProductForm');
    
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewProduct();
        });
    }

    // Setup edit and delete buttons for existing products
    setupProductManagementButtons();
}

function addNewProduct() {
    const productName = document.getElementById('productName').value;
    const productCategory = document.getElementById('productCategory').value;
    const productPrice = document.getElementById('productPrice').value;
    const productQuantity = document.getElementById('productQuantity').value;
    const productDescription = document.getElementById('productDescription').value;

    // Create product object
    const product = {
        id: Date.now(),
        name: productName,
        category: productCategory,
        price: productPrice,
        quantity: productQuantity,
        description: productDescription,
        seller: 'ghimirepratik1100'
    };

    // Add to products array
    farmerProducts.push(product);

    // Add to farmer's product list
    addToFarmerProductList(product);

    // Add to consumer view
    addToConsumerView(product);

    // Show success message
    showNotification(
        currentLang === 'en' ? 
        'Product added successfully!' : 
        'उत्पादन सफलतापूर्वक थपियो!',
        'success'
    );

    // Reset form
    document.getElementById('addProductForm').reset();
}

function addToFarmerProductList(product) {
    const farmerProductsList = document.getElementById('farmerProductsList');
    
    const productItem = document.createElement('div');
    productItem.className = 'farmer-product-item';
    productItem.dataset.productId = product.id;
    productItem.innerHTML = `
        <div class="product-item-info">
            <div class="product-item-name">${product.name}</div>
            <div class="product-item-details">
                <span>NPR ${product.price}/kg</span>
                <span>•</span>
                <span>${product.quantity} kg available</span>
            </div>
        </div>
        <div class="product-item-actions">
            <button class="edit-btn" onclick="editProduct(${product.id})" data-en="Edit" data-ne="सम्पादन">Edit</button>
            <button class="delete-btn" onclick="deleteProduct(${product.id})" data-en="Delete" data-ne="मेटाउनुहोस्">Delete</button>
        </div>
    `;
    
    farmerProductsList.appendChild(productItem);
}

function addToConsumerView(product) {
    const productGrid = document.getElementById('productGrid');
    
    // Category emoji mapping
    const categoryEmoji = {
        'vegetables': '🥬',
        'fruits': '🍎',
        'grains': '🌾',
        'other': '📦'
    };

    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.dataset.category = product.category;
    productCard.dataset.productId = product.id;
    productCard.innerHTML = `
        <div class="product-image">${categoryEmoji[product.category] || '📦'}</div>
        <div class="product-info">
            <div class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-details">
                <span data-en="Available: ${product.quantity} kg" data-ne="उपलब्ध: ${product.quantity} किलो">Available: ${product.quantity} kg</span>
            </div>
            <div class="product-price">NPR ${product.price}/kg</div>
            <div class="product-seller" data-en="Seller: ${product.seller}" data-ne="बिक्रेता: ${product.seller}">Seller: ${product.seller}</div>
            <button class="product-btn" data-en="Add to Cart" data-ne="कार्टमा थप्नुहोस्">Add to Cart</button>
        </div>
    `;
    
    productGrid.appendChild(productCard);
    
    // Setup button for new product
    const addToCartBtn = productCard.querySelector('.product-btn');
    addToCartBtn.addEventListener('click', function() {
        const productName = productCard.querySelector('.product-name').textContent;
        alert(currentLang === 'en' ? 
            `"${productName}" added to cart!` : 
            `"${productName}" कार्टमा थपियो!`);
        addToCart(productName);
    });
}

function editProduct(productId) {
    const product = farmerProducts.find(p => p.id === productId);
    if (product) {
        // Pre-fill form with product data
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productQuantity').value = product.quantity;
        document.getElementById('productDescription').value = product.description;

        // Delete the old product
        deleteProduct(productId);

        // Scroll to form
        document.querySelector('.add-product-section').scrollIntoView({ behavior: 'smooth' });
    }
}

function deleteProduct(productId) {
    // Remove from array
    farmerProducts = farmerProducts.filter(p => p.id !== productId);

    // Remove from farmer's list
    const farmerItem = document.querySelector(`.farmer-product-item[data-product-id="${productId}"]`);
    if (farmerItem) {
        farmerItem.remove();
    }

    // Remove from consumer view
    const consumerCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
    if (consumerCard) {
        consumerCard.remove();
    }

    showNotification(
        currentLang === 'en' ? 
        'Product deleted successfully!' : 
        'उत्पादन सफलतापूर्वक मेटियो!',
        'success'
    );
}

function setupProductManagementButtons() {
    // This will be called after dynamic products are added
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-btn')) {
            const productItem = e.target.closest('.farmer-product-item');
            const productId = parseInt(productItem.dataset.productId);
            editProduct(productId);
        }
        
        if (e.target.classList.contains('delete-btn')) {
            const productItem = e.target.closest('.farmer-product-item');
            const productId = parseInt(productItem.dataset.productId);
            const confirmed = confirm(currentLang === 'en' ? 
                'Are you sure you want to delete this product?' : 
                'के तपाईं यो उत्पादन मेटाउन चाहनुहुन्छ?');
            if (confirmed) {
                deleteProduct(productId);
            }
        }
    });
}

// =====================
// Product Add to Cart
// =====================
function setupProductButtons() {
    const productButtons = document.querySelectorAll('.product-btn');
    
    productButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-name').textContent;
            
            // Show confirmation
            alert(currentLang === 'en' ? 
                `"${productName}" added to cart!` : 
                `"${productName}" कार्टमा थपियो!`);
            
            // This would typically add the product to a cart array/object
            // and update the cart UI
            addToCart(productName);
        });
    });
}

function addToCart(productName) {
    console.log('Added to cart:', productName);
    // This would typically:
    // 1. Add product to cart state
    // 2. Update cart count in UI
    // 3. Store in localStorage or send to backend
}

// =====================
// Logout Functionality
// =====================
function setupLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    
    logoutBtn.addEventListener('click', function() {
        const confirmed = confirm(currentLang === 'en' ? 
            'Are you sure you want to logout?' : 
            'के तपाईं लगआउट गर्न चाहनुहुन्छ?');
        
        if (confirmed) {
            // Clear user session
            localStorage.removeItem('userSession');
            
            // Redirect to login page
            window.location.href = 'login.html';
        }
    });
}

// =====================
// Utility Functions
// =====================

// Format date to local format
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString(currentLang === 'en' ? 'en-US' : 'ne-NP', options);
}

// Show loading state
function showLoading(message) {
    // Create loading overlay
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingOverlay';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    loadingDiv.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 12px; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
            <p style="color: var(--text-primary);">${message}</p>
        </div>
    `;
    document.body.appendChild(loadingDiv);
}

// Hide loading state
function hideLoading() {
    const loadingDiv = document.getElementById('loadingOverlay');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10a572' : type === 'error' ? '#c33' : '#0d8656'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// =====================
// API Integration Functions
// =====================

// These functions would be connected to your backend API

async function sendToBackendAPI(imageData) {
    try {
        showLoading(currentLang === 'en' ? 'Analyzing image...' : 'छवि विश्लेषण गर्दै...');
        
        // Example API call
        // const response = await fetch('YOUR_BACKEND_URL/analyze', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ image: imageData })
        // });
        // const result = await response.json();
        
        hideLoading();
        // Handle the result
        
    } catch (error) {
        hideLoading();
        console.error('Error:', error);
        showNotification(
            currentLang === 'en' ? 'Error analyzing image' : 'छवि विश्लेषण गर्दा त्रुटि',
            'error'
        );
    }
}

async function fetchHistoryData() {
    try {
        // Example API call to fetch scan history
        // const response = await fetch('YOUR_BACKEND_URL/history');
        // const data = await response.json();
        // updateHistoryUI(data);
    } catch (error) {
        console.error('Error fetching history:', error);
    }
}

async function fetchMarketplaceProducts() {
    try {
        // Example API call to fetch products
        // const response = await fetch('YOUR_BACKEND_URL/products');
        // const products = await response.json();
        // updateProductsUI(products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// =====================
// Console Log - App Loaded
// =====================
console.log('Digital Krishi Dashboard Loaded Successfully! 🌾');
console.log('Current Language:', currentLang);
console.log('Current Theme:', currentTheme);
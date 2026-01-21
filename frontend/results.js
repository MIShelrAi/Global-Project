// =============================================
// DISEASE DETECTION RESULTS PAGE
// =============================================

class ResultsManager {
    constructor() {
        this.scannedImageData = null;
        this.analysisResults = null;
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadLanguage();
        this.getScannedData();
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Language toggle
        document.getElementById('langToggle')?.addEventListener('click', () => {
            this.toggleLanguage();
        });

        // Action buttons
        document.getElementById('scanNewBtn')?.addEventListener('click', () => {
            this.scanNewImage();
        });

        document.getElementById('saveResultsBtn')?.addEventListener('click', () => {
            this.saveResults();
        });

        document.getElementById('shareResultsBtn')?.addEventListener('click', () => {
            this.shareResults();
        });

        document.getElementById('retryBtn')?.addEventListener('click', () => {
            this.retryAnalysis();
        });

        document.querySelector('.back-btn')?.addEventListener('click', () => {
            window.location.href = './index.html';
        });
    }

    getScannedData() {
        // Get image data from localStorage or URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const imageData = localStorage.getItem('scannedImageData');
        
        if (imageData) {
            this.scannedImageData = imageData;
            document.getElementById('scannedImage').src = imageData;
            this.analyzeImage();
        } else {
            this.showError('No image data found. Please scan an image first.');
        }
    }

    async analyzeImage() {
        try {
            this.showLoading();
            
            if (!window.geminiAI) {
                throw new Error('Gemini AI not initialized');
            }

            const results = await window.geminiAI.analyzePlantDisease(this.scannedImageData);
            this.analysisResults = results;
            
            this.displayResults(results);
            this.hideLoading();
            
        } catch (error) {
            console.error('Analysis error:', error);
            this.showError(error.message || 'Failed to analyze image. Please try again.');
            this.hideLoading();
        }
    }

    displayResults(results) {
        const container = document.getElementById('resultsContainer');
        const statusCard = document.getElementById('diseaseStatus');
        const detailsCard = document.getElementById('diseaseDetails');
        const treatmentCard = document.getElementById('treatmentRecommendations');

        // Display status
        statusCard.innerHTML = this.generateStatusHTML(results);
        
        // Display disease details
        detailsCard.innerHTML = this.generateDetailsHTML(results);
        
        // Display treatment recommendations
        treatmentCard.innerHTML = this.generateTreatmentHTML(results);

        container.style.display = 'grid';
    }

    generateStatusHTML(results) {
        const isHealthy = results.status === 'healthy';
        const confidence = results.confidence || 0;
        const confidenceClass = confidence > 80 ? 'high' : confidence > 60 ? 'medium' : 'low';
        
        return `
            <div class="status-header">
                <div class="status-icon">${isHealthy ? '✅' : '⚠️'}</div>
                <div>
                    <div class="status-title">${isHealthy ? 'Plant is Healthy' : 'Disease Detected'}</div>
                    <div class="status-description">
                        ${isHealthy ? 
                            'No signs of disease were detected in the plant image.' : 
                            `Our AI has detected potential signs of ${results.diseaseName || 'plant disease'}.`
                        }
                    </div>
                    <div class="confidence-score ${confidenceClass}">
                        Confidence: ${confidence}%
                    </div>
                </div>
            </div>
        `;
    }

    generateDetailsHTML(results) {
        if (results.status === 'healthy') {
            return `
                <div class="disease-name">Plant Health Status</div>
                <div class="disease-symptoms">
                    <h4>Positive Indicators:</h4>
                    <ul class="symptom-list">
                        <li>Healthy leaf color and structure</li>
                        <li>No visible signs of infection</li>
                        <li>Normal growth patterns observed</li>
                        <li>No pest damage detected</li>
                    </ul>
                </div>
            `;
        }

        return `
            <div class="disease-name">${results.diseaseName || 'Unknown Disease'}</div>
            <div class="disease-symptoms">
                <h4>Common Symptoms:</h4>
                <ul class="symptom-list">
                    ${results.symptoms ? results.symptoms.map(symptom => `<li>${symptom}</li>`).join('') : 
                      '<li>Leaf discoloration</li><li>Spots or lesions</li><li>Wilting or curling</li>'}
                </ul>
            </div>
            <div class="disease-causes">
                <h4>Possible Causes:</h4>
                <ul class="symptom-list">
                    ${results.causes ? results.causes.map(cause => `<li>${cause}</li>`).join('') : 
                      '<li>Fungal infection</li><li>Bacterial infection</li><li>Environmental stress</li>'}
                </ul>
            </div>
        `;
    }

    generateTreatmentHTML(results) {
        if (results.status === 'healthy') {
            return `
                <h4>Preventive Care Recommendations:</h4>
                <div class="treatment-steps">
                    <div class="treatment-step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <div class="step-title">Regular Monitoring</div>
                            <div class="step-description">Continue monitoring your plants regularly for early detection of any issues.</div>
                        </div>
                    </div>
                    <div class="treatment-step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <div class="step-title">Proper Watering</div>
                            <div class="step-description">Maintain consistent watering schedule and avoid overwatering.</div>
                        </div>
                    </div>
                    <div class="treatment-step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <div class="step-title">Nutrient Management</div>
                            <div class="step-description">Ensure proper fertilization to maintain plant health.</div>
                        </div>
                    </div>
                </div>
            `;
        }

        const treatments = results.treatments || [
            {
                title: "Isolate Affected Plants",
                description: "Separate infected plants from healthy ones to prevent spread."
            },
            {
                title: "Remove Infected Parts",
                description: "Carefully remove and destroy affected leaves or branches."
            },
            {
                title: "Apply Fungicide",
                description: "Use appropriate fungicide treatment as recommended for the specific disease."
            },
            {
                title: "Improve Air Circulation",
                description: "Ensure proper spacing and ventilation to reduce humidity."
            }
        ];

        return `
            <h4>Treatment Recommendations:</h4>
            <div class="treatment-steps">
                ${treatments.map((treatment, index) => `
                    <div class="treatment-step">
                        <div class="step-number">${index + 1}</div>
                        <div class="step-content">
                            <div class="step-title">${treatment.title}</div>
                            <div class="step-description">${treatment.description}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showLoading() {
        document.getElementById('loadingState').style.display = 'block';
        document.getElementById('resultsContainer').style.display = 'none';
        document.getElementById('errorState').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loadingState').style.display = 'none';
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorState').style.display = 'block';
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('resultsContainer').style.display = 'none';
    }

    scanNewImage() {
        localStorage.removeItem('scannedImageData');
        window.location.href = 'index.html';
    }

    saveResults() {
        if (!this.analysisResults) return;

        const resultsData = {
            timestamp: new Date().toISOString(),
            image: this.scannedImageData,
            analysis: this.analysisResults
        };

        // Get existing history
        const history = JSON.parse(localStorage.getItem('scanHistory') || '[]');
        history.unshift(resultsData);
        
        // Keep only last 50 scans
        if (history.length > 50) {
            history.splice(50);
        }

        localStorage.setItem('scanHistory', JSON.stringify(history));
        
        // Show success message
        this.showNotification('Results saved successfully!', 'success');
    }

    shareResults() {
        if (!this.analysisResults) return;

        const shareText = `Digital Krishi Analysis Results:\n` +
            `Status: ${this.analysisResults.status === 'healthy' ? 'Healthy' : 'Disease Detected'}\n` +
            `Confidence: ${this.analysisResults.confidence}%\n` +
            `${this.analysisResults.diseaseName ? `Disease: ${this.analysisResults.diseaseName}` : ''}`;

        if (navigator.share) {
            navigator.share({
                title: 'Digital Krishi - Plant Disease Analysis',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('Results copied to clipboard!', 'success');
            });
        }
    }

    retryAnalysis() {
        this.analyzeImage();
    }

    toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeBtn = document.getElementById('themeToggle');
        themeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'ne' : 'en';
        localStorage.setItem('language', this.currentLanguage);
        this.loadLanguage();
    }

    loadLanguage() {
        const elements = document.querySelectorAll('[data-en], [data-ne]');
        elements.forEach(element => {
            const text = element.getAttribute(`data-${this.currentLanguage}`);
            if (text) {
                element.textContent = text;
            }
        });

        const langBtn = document.getElementById('langToggle');
        langBtn.textContent = this.currentLanguage === 'en' ? '🌐 EN' : '🌐 NE';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--primary-green)' : 'var(--text-primary)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--shadow);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the results manager
document.addEventListener('DOMContentLoaded', () => {
    window.resultsManager = new ResultsManager();
});

// Add slide animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

class PlantDiseaseApp {
    constructor() {
        this.supabase = window.supabaseClient;
        this.auth = window.authManager;
        this.currentImage = null;
        this.currentImageBase64 = null;
        this.isProcessing = false;
        
        this.initElements();
        this.bindEvents();
    }

    initElements() {
        // Camera/Upload elements
        this.cameraBtn = document.getElementById('camera-btn');
        this.uploadBtn = document.getElementById('upload-btn');
        this.fileInput = document.getElementById('file-input');
        this.cameraInput = document.getElementById('camera-input');
        this.previewImage = document.getElementById('preview-image');
        this.previewContainer = document.getElementById('preview-container');
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.resultsContainer = document.getElementById('results-container');
        this.loadingOverlay = document.getElementById('loading-overlay');
    }

    bindEvents() {
        // Upload button
        if (this.uploadBtn) {
            this.uploadBtn.addEventListener('click', () => {
                this.fileInput?.click();
            });
        }

        // Camera button
        if (this.cameraBtn) {
            this.cameraBtn.addEventListener('click', () => {
                this.cameraInput?.click();
            });
        }

        // File input change
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => {
                this.handleImageSelect(e.target.files[0]);
            });
        }

        // Camera input change
        if (this.cameraInput) {
            this.cameraInput.addEventListener('change', (e) => {
                this.handleImageSelect(e.target.files[0]);
            });
        }

        // Analyze button
        if (this.analyzeBtn) {
            this.analyzeBtn.addEventListener('click', () => {
                this.analyzeImage();
            });
        }

        // Drag and drop
        const dropZone = document.getElementById('drop-zone');
        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('dragover');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                    this.handleImageSelect(file);
                }
            });
        }
    }

    // ==========================================
    // IMAGE HANDLING
    // ==========================================
    async handleImageSelect(file) {
        if (!file) return;

        // Validate file
        if (!APP_CONFIG.supportedFormats.includes(file.type)) {
            this.showNotification('Please select a valid image (JPEG, PNG, WebP)', 'error');
            return;
        }

        if (file.size > APP_CONFIG.maxImageSize) {
            this.showNotification('Image too large. Maximum size is 5MB', 'error');
            return;
        }

        this.currentImage = file;

        // Convert to base64
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImageBase64 = e.target.result.split(',')[1];
            
            // Show preview
            if (this.previewImage) {
                this.previewImage.src = e.target.result;
            }
            if (this.previewContainer) {
                this.previewContainer.style.display = 'block';
            }
            if (this.analyzeBtn) {
                this.analyzeBtn.disabled = false;
            }
        };
        reader.readAsDataURL(file);
    }

    // ==========================================
    // PLANT.ID API INTEGRATION
    // ==========================================
    async analyzeImage() {
        if (!this.auth.isAuthenticated()) {
            this.showNotification('Please sign in to analyze plants', 'error');
            window.location.href = 'auth.html';
            return;
        }

        if (!this.currentImageBase64 || this.isProcessing) return;

        this.isProcessing = true;
        this.showLoading(true);

        try {
            // Call Plant.id API
            const response = await fetch(APP_CONFIG.plantIdApi, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Api-Key': PLANT_ID_API_KEY
                },
                body: JSON.stringify({
                    images: [this.currentImageBase64],
                    latitude: null,
                    longitude: null,
                    similar_images: true,
                    health: 'all',
                    disease_details: ['description', 'treatment', 'cause']
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const result = await response.json();
            console.log('Plant.id Response:', result);

            // Upload image to Supabase Storage
            const imageUrl = await this.uploadImage();

            // Save scan to database
            const scanData = await this.saveScan(result, imageUrl);

            // Display results
            this.displayResults(result, scanData);

        } catch (error) {
            console.error('Analysis error:', error);
            this.showNotification('Failed to analyze image. Please try again.', 'error');
        } finally {
            this.isProcessing = false;
            this.showLoading(false);
        }
    }

    // ==========================================
    // STORAGE UPLOAD
    // ==========================================
    async uploadImage() {
        const userId = this.auth.currentUser.id;
        const fileName = `${userId}/${Date.now()}_${this.currentImage.name}`;

        const { data, error } = await this.supabase.storage
            .from('plant-images')
            .upload(fileName, this.currentImage, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Upload error:', error);
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = this.supabase.storage
            .from('plant-images')
            .getPublicUrl(fileName);

        return publicUrl;
    }

    // ==========================================
    // SAVE SCAN TO DATABASE
    // ==========================================
    async saveScan(apiResult, imageUrl) {
        const result = apiResult.result;
        
        // Extract plant info
        const plantSuggestion = result.classification?.suggestions?.[0];
        const healthAssessment = result.is_healthy;
        const diseases = result.disease?.suggestions || [];

        const scanData = {
            user_id: this.auth.currentUser.id,
            image_url: imageUrl,
            image_path: imageUrl,
            
            // Plant identification
            plant_name: plantSuggestion?.name || 'Unknown',
            plant_common_names: plantSuggestion?.details?.common_names || [],
            plant_scientific_name: plantSuggestion?.name || null,
            plant_probability: plantSuggestion?.probability || 0,
            
            // Health assessment
            is_healthy: healthAssessment?.binary ?? true,
            health_probability: healthAssessment?.probability ?? 1,
            
            // Diseases
            diseases: diseases.map(d => ({
                name: d.name,
                probability: d.probability,
                description: d.details?.description,
                treatment: d.details?.treatment,
                cause: d.details?.cause
            })),
            
            // Raw response
            raw_response: apiResult
        };

        const { data, error } = await this.supabase
            .from('scans')
            .insert(scanData)
            .select()
            .single();

        if (error) {
            console.error('Save error:', error);
            throw error;
        }

        return data;
    }

    // ==========================================
    // DISPLAY RESULTS
    // ==========================================
    displayResults(apiResult, scanData) {
        if (!this.resultsContainer) return;

        const result = apiResult.result;
        const isHealthy = result.is_healthy?.binary ?? true;
        const diseases = result.disease?.suggestions || [];

        let html = `
            <div class="results-card ${isHealthy ? 'healthy' : 'diseased'}">
                <div class="results-header">
                    <div class="health-status">
                        <span class="status-icon">${isHealthy ? '✅' : '⚠️'}</span>
                        <span class="status-text">${isHealthy ? 'Healthy Plant' : 'Issues Detected'}</span>
                    </div>
                    <span class="confidence">
                        ${Math.round((result.is_healthy?.probability || 1) * 100)}% confidence
                    </span>
                </div>

                <div class="plant-info">
                    <h3>🌱 Plant Identification</h3>
                    <p class="plant-name">${scanData.plant_name}</p>
                    ${scanData.plant_common_names?.length ? 
                        `<p class="common-names">Also known as: ${scanData.plant_common_names.join(', ')}</p>` : ''}
                    <p class="probability">Confidence: ${Math.round(scanData.plant_probability * 100)}%</p>
                </div>

                ${!isHealthy && diseases.length > 0 ? `
                    <div class="diseases-section">
                        <h3>🦠 Detected Issues</h3>
                        <div class="diseases-list">
                            ${diseases.slice(0, 3).map(disease => `
                                <div class="disease-item">
                                    <div class="disease-header">
                                        <span class="disease-name">${disease.name}</span>
                                        <span class="disease-probability">${Math.round(disease.probability * 100)}%</span>
                                    </div>
                                    ${disease.details?.description ? 
                                        `<p class="disease-description">${disease.details.description}</p>` : ''}
                                    ${disease.details?.treatment ? `
                                        <div class="treatment">
                                            <strong>💊 Treatment:</strong>
                                            <p>${this.formatTreatment(disease.details.treatment)}</p>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="results-actions">
                    <button class="btn btn-secondary" onclick="app.resetScan()">
                        📷 New Scan
                    </button>
                    <button class="btn btn-primary" onclick="app.saveFavorite('${scanData.id}')">
                        ⭐ Save to Favorites
                    </button>
                    <button class="btn btn-outline" onclick="app.shareResults('${scanData.id}')">
                        📤 Share
                    </button>
                </div>
            </div>
        `;

        this.resultsContainer.innerHTML = html;
        this.resultsContainer.style.display = 'block';
        this.resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    formatTreatment(treatment) {
        if (typeof treatment === 'object') {
            return Object.entries(treatment)
                .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                .join('<br>');
        }
        return treatment;
    }


    async saveFavorite(scanId) {
        const { error } = await this.supabase
            .from('scans')
            .update({ is_favorite: true })
            .eq('id', scanId);

        if (error) {
            this.showNotification('Failed to save favorite', 'error');
        } else {
            this.showNotification('Saved to favorites!', 'success');
        }
    }

    async shareResults(scanId) {
        const shareUrl = `${window.location.origin}/results.html?id=${scanId}`;
        
        if (navigator.share) {
            await navigator.share({
                title: 'Plant Health Analysis',
                url: shareUrl
            });
        } else {
            await navigator.clipboard.writeText(shareUrl);
            this.showNotification('Link copied to clipboard!', 'success');
        }
    }

    resetScan() {
        this.currentImage = null;
        this.currentImageBase64 = null;
        
        if (this.previewContainer) {
            this.previewContainer.style.display = 'none';
        }
        if (this.resultsContainer) {
            this.resultsContainer.style.display = 'none';
        }
        if (this.analyzeBtn) {
            this.analyzeBtn.disabled = true;
        }
        if (this.fileInput) {
            this.fileInput.value = '';
        }
        if (this.cameraInput) {
            this.cameraInput.value = '';
        }
    }

    showLoading(show) {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PlantDiseaseApp();
});
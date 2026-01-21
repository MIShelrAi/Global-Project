// =============================================
// MAIN APPLICATION
// =============================================

class PlantDiseaseApp {
    constructor() {
        this.supabase = window.supabaseClient;
        this.geminiAI = window.geminiAI;
        this.currentImage = null;
        this.currentImageBase64 = null;
        this.init();
    }

    async init() {
        await this.waitForDependencies();
        this.setupEventListeners();
        this.checkAuthState();
    }

    async waitForDependencies() {
        return new Promise(resolve => {
            const check = () => {
                if (window.authManager && window.geminiAI) {
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    checkAuthState() {
        setTimeout(() => {
            const user = window.authManager?.getUser();
            this.updateUIForAuth(!!user);
        }, 500);
    }

    updateUIForAuth(isLoggedIn) {
        document.querySelectorAll('.auth-required').forEach(el => {
            el.style.display = isLoggedIn ? '' : 'none';
        });
        document.querySelectorAll('.guest-only').forEach(el => {
            el.style.display = isLoggedIn ? 'none' : '';
        });
        
        if (isLoggedIn && window.authManager?.getUser()) {
            document.querySelectorAll('.user-email').forEach(el => {
                el.textContent = window.authManager.getUser().email;
            });
        }
    }

    setupEventListeners() {
        // Camera button
        document.getElementById('camera-btn')?.addEventListener('click', () => {
            this.openCamera();
        });

        // Upload button
        document.getElementById('upload-btn')?.addEventListener('click', () => {
            document.getElementById('file-input')?.click();
        });

        // File input
        document.getElementById('file-input')?.addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        // Analyze button
        document.getElementById('analyze-btn')?.addEventListener('click', () => {
            this.analyzePlant();
        });

        // Retake button
        document.getElementById('retake-btn')?.addEventListener('click', () => {
            this.resetCapture();
        });

        // Drag and drop
        this.setupDragDrop();
    }

    setupDragDrop() {
        const dropZone = document.querySelector('.scan-section');
        if (!dropZone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
            dropZone.addEventListener(event, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        dropZone.addEventListener('dragover', () => {
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            dropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.processFile(file);
            }
        });
    }

    // =========================================
    // CAMERA FUNCTIONS
    // =========================================
    async openCamera() {
        if (!this.checkAuth()) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            const videoContainer = document.getElementById('video-container');
            const video = document.getElementById('camera-video');

            video.srcObject = stream;
            await video.play();
            videoContainer.classList.remove('hidden');

            // Hide scan options
            document.querySelector('.scan-options')?.classList.add('hidden');

            // Setup capture button
            document.getElementById('capture-btn').onclick = () => {
                this.captureFromCamera(video, stream);
            };

            // Setup close button
            this.addCameraControls(stream, videoContainer);

        } catch (error) {
            console.error('Camera error:', error);
            if (error.name === 'NotAllowedError') {
                this.showNotification('Camera access denied. Please enable camera permissions.', 'error');
            } else {
                this.showNotification('Could not access camera. Try uploading an image.', 'error');
            }
        }
    }

    addCameraControls(stream, container) {
        // Remove existing controls
        container.querySelector('.camera-controls')?.remove();

        const controls = document.createElement('div');
        controls.className = 'camera-controls';
        controls.innerHTML = `
            <button class="btn-close-camera" title="Close camera">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(controls);

        controls.querySelector('.btn-close-camera').onclick = () => {
            stream.getTracks().forEach(track => track.stop());
            container.classList.add('hidden');
            document.querySelector('.scan-options')?.classList.remove('hidden');
        };
    }

    captureFromCamera(video, stream) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        // Stop camera
        stream.getTracks().forEach(track => track.stop());
        document.getElementById('video-container').classList.add('hidden');

        // Get base64
        this.currentImageBase64 = canvas.toDataURL('image/jpeg', 0.9);

        // Create file for upload
        canvas.toBlob((blob) => {
            this.currentImage = new File([blob], `plant_${Date.now()}.jpg`, {
                type: 'image/jpeg'
            });
            this.showPreview(this.currentImageBase64);
        }, 'image/jpeg', 0.9);
    }

    // =========================================
    // FILE HANDLING
    // =========================================
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        if (!this.checkAuth()) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select an image file', 'error');
            return;
        }

        // Validate file size
        if (file.size > CONFIG.MAX_IMAGE_SIZE) {
            this.showNotification('Image too large. Maximum size is 10MB.', 'error');
            return;
        }

        this.currentImage = file;

        // Convert to base64
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImageBase64 = e.target.result;
            this.showPreview(this.currentImageBase64);
        };
        reader.onerror = () => {
            this.showNotification('Error reading file', 'error');
        };
        reader.readAsDataURL(file);
    }

    showPreview(imageSrc) {
        const preview = document.getElementById('preview-container');
        const previewImg = document.getElementById('preview-image');
        const actions = document.getElementById('action-buttons');
        const scanOptions = document.querySelector('.scan-options');

        previewImg.src = imageSrc;
        preview.classList.remove('hidden');
        actions.classList.remove('hidden');
        scanOptions?.classList.add('hidden');
    }

    resetCapture() {
        this.currentImage = null;
        this.currentImageBase64 = null;

        document.getElementById('preview-container')?.classList.add('hidden');
        document.getElementById('action-buttons')?.classList.add('hidden');
        document.getElementById('video-container')?.classList.add('hidden');
        document.getElementById('file-input').value = '';
        document.querySelector('.scan-options')?.classList.remove('hidden');
    }

    // =========================================
    // MAIN ANALYSIS FUNCTION
    // =========================================
    async analyzePlant() {
        if (!this.currentImageBase64) {
            this.showNotification('Please capture or upload an image first', 'error');
            return;
        }

        if (!this.checkAuth()) return;

        // Show loading
        this.showLoading(true, 'Analyzing your plant with AI...');

        try {
            // Step 1: Upload image to Supabase
            this.updateLoadingMessage('Uploading image...');
            const imageData = await this.uploadImage();

            // Step 2: Analyze with Gemini AI
            this.updateLoadingMessage('🌿 AI is analyzing your plant...');
            const analysisResult = await this.geminiAI.analyzePlant(this.currentImageBase64);

            if (!analysisResult.success) {
                throw new Error(analysisResult.error || 'Analysis failed');
            }

            // Step 3: Save to database
            this.updateLoadingMessage('Saving results...');
            const savedScan = await this.saveScanResults(imageData, analysisResult.data);

            // Step 4: Redirect to results
            this.showNotification('Analysis complete!', 'success');
            
            setTimeout(() => {
                window.location.href = `results.html?id=${savedScan.id}`;
            }, 500);

        } catch (error) {
            console.error('Analysis error:', error);
            this.showNotification(error.message || 'Analysis failed. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async uploadImage() {
        const user = window.authManager.getUser();
        const timestamp = Date.now();
        const fileName = `${user.id}/${timestamp}_${this.currentImage.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

        const { data, error } = await this.supabase.storage
            .from('plant-images')
            .upload(fileName, this.currentImage, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            throw new Error('Failed to upload image');
        }

        // Get public URL
        const { data: urlData } = this.supabase.storage
            .from('plant-images')
            .getPublicUrl(fileName);

        return {
            path: fileName,
            url: urlData.publicUrl
        };
    }

    async saveScanResults(imageData, analysisData) {
        const user = window.authManager.getUser();

        // Insert main scan record
        const { data: scanData, error: scanError } = await this.supabase
            .from('plant_scans')
            .insert({
                user_id: user.id,
                image_url: imageData.url,
                image_path: imageData.path,
                status: 'completed',
                is_healthy: analysisData.healthAssessment.isHealthy,
                health_score: analysisData.healthAssessment.healthScore,
                plant_name: analysisData.plantIdentification.commonName,
                plant_scientific_name: analysisData.plantIdentification.scientificName,
                api_response: analysisData
            })
            .select()
            .single();

        if (scanError) {
            throw new Error('Failed to save scan');
        }

        // Insert detected diseases
        if (analysisData.diseases && analysisData.diseases.length > 0) {
            const diseaseRecords = analysisData.diseases.map(disease => ({
                scan_id: scanData.id,
                disease_name: disease.name,
                scientific_name: disease.scientificName,
                probability: disease.confidence,
                description: disease.description,
                treatment: [
                    ...analysisData.treatments.immediate,
                    ...analysisData.treatments.chemical.map(t => t.product),
                    ...analysisData.treatments.organic.map(t => t.method)
                ],
                prevention: analysisData.prevention,
                severity: disease.severity
            }));

            await this.supabase
                .from('detected_diseases')
                .insert(diseaseRecords);
        }

        return scanData;
    }

    // =========================================
    // UTILITY FUNCTIONS
    // =========================================
    checkAuth() {
        if (!window.authManager?.isAuthenticated()) {
            this.showNotification('Please sign in to analyze plants', 'warning');
            setTimeout(() => {
                window.location.href = 'auth.html';
            }, 1500);
            return false;
        }
        return true;
    }

    showLoading(show, message = 'Loading...') {
        let overlay = document.getElementById('loading-overlay');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loader">
                    <div class="loader-icon">
                        <i class="fas fa-seedling fa-pulse"></i>
                    </div>
                    <p class="loader-message">${message}</p>
                    <div class="loader-bar">
                        <div class="loader-progress"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        if (show) {
            overlay.classList.remove('hidden');
            overlay.querySelector('.loader-message').textContent = message;
        } else {
            overlay.classList.add('hidden');
        }
    }

    updateLoadingMessage(message) {
        const msgEl = document.querySelector('.loader-message');
        if (msgEl) {
            msgEl.textContent = message;
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());

        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${icons[type]}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.plantApp = new PlantDiseaseApp();
});
class ResultsPage {
    constructor() {
        this.supabase = window.supabaseClient;
        this.geminiAI = window.geminiAI;
        this.scanId = null;
        this.scanData = null;
        this.analysisData = null;
        this.init();
    }

    async init() {
        // Try to get scan ID from URL first, then fallback to localStorage
        this.scanId = new URLSearchParams(window.location.search).get('id');
        
        // If no scan ID, try to load from localStorage (for demo/client-side only)
        if (!this.scanId) {
            this.loadFromLocalStorage();
            return;
        }

        try {
            await this.loadResults();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error loading results:', error);
            window.location.href = 'index.html';
        }
    }

    loadFromLocalStorage() {
        try {
            // Get image data and scan results from localStorage
            const imageData = localStorage.getItem('scannedImageData');
            const scanResults = localStorage.getItem('scanResults');
            
            if (!imageData || !scanResults) {
                // Don't show error if no data, just redirect back
                window.location.href = 'index.html';
                return;
            }

            // Create scan data from real AI analysis
            this.scanData = {
                id: 'demo-' + Date.now(),
                image_url: imageData,
                scan_date: new Date().toISOString(),
                api_response: JSON.parse(scanResults)
            };
            
            this.analysisData = this.scanData.api_response;
            this.renderResults();
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            // Redirect back instead of showing error
            window.location.href = 'index.html';
        }
    }

    getMockAnalysisData() {
        // This is now just a fallback - real data comes from Gemini AI
        // Only used when AI service fails or no image data
        return null;
    }

    async loadResults() {
        const { data, error } = await this.supabase
            .from('plant_scans')
            .select(`
                *,
                detected_diseases (*)
            `)
            .eq('id', this.scanId)
            .single();

        if (error || !data) {
            throw new Error('Scan not found');
        }

        this.scanData = data;
        this.analysisData = data.api_response;
        this.renderResults();
    }

    renderResults() {
        // Hide loading
        document.getElementById('results-loading').classList.add('hidden');
        document.getElementById('results-content').classList.remove('hidden');

        const analysis = this.analysisData;
        const health = analysis.healthAssessment;
        const plant = analysis.plantIdentification;

        // 1. Plant Image
        document.getElementById('result-plant-image').src = this.scanData.image_url;

        // 2. Health Badge
        const badge = document.getElementById('health-badge');
        badge.className = `health-badge ${health.isHealthy ? 'healthy' : 'unhealthy'}`;
        badge.innerHTML = health.isHealthy
            ? '<i class="fas fa-check-circle"></i> Healthy'
            : '<i class="fas fa-exclamation-circle"></i> Issues Found';

        // 3. Health Score Circle
        this.renderHealthScore(health.healthScore);

        // 4. Plant Info
        document.getElementById('plant-name').textContent = plant.commonName || 'Unknown Plant';
        if (plant.scientificName) {
            document.getElementById('plant-scientific').textContent = plant.scientificName;
        }
        document.getElementById('plant-confidence').textContent = 
            `${Math.round(plant.confidence * 100)}% confidence`;

        // 5. Scan Date
        document.getElementById('scan-date').textContent = 
            new Date(this.scanData.scan_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

        // 6. Health Status
        document.getElementById('health-status').textContent = health.overallCondition;
        document.getElementById('health-status').className = 
            `condition-badge condition-${health.overallCondition.toLowerCase()}`;

        // 7. Render Diseases
        this.renderDiseases(analysis.diseases);

        // 8. Render Treatments
        this.renderTreatments(analysis.treatments);

        // 9. Render Growth Recommendations
        this.renderGrowthRecommendations(analysis.growthRecommendations);

        // 10. Render Prevention Tips
        this.renderPrevention(analysis.prevention);

        // 11. Additional Notes
        if (analysis.additionalNotes) {
            document.getElementById('additional-notes').textContent = analysis.additionalNotes;
            document.getElementById('notes-section').classList.remove('hidden');
        }

        // 12. Urgency Banner
        if (analysis.urgencyLevel !== 'none') {
            this.showUrgencyBanner(analysis.urgencyLevel, analysis.followUpDays);
        }
    }

    renderHealthScore(score) {
        const scoreEl = document.getElementById('health-score');
        const circleEl = document.getElementById('score-circle-progress');
        const container = document.getElementById('score-container');

        // Set color class
        let colorClass = 'critical';
        if (score >= 80) colorClass = 'excellent';
        else if (score >= 60) colorClass = 'good';
        else if (score >= 40) colorClass = 'fair';

        container.className = `score-container ${colorClass}`;

        // Animate score
        const circumference = 2 * Math.PI * 54;
        circleEl.style.strokeDasharray = circumference;
        circleEl.style.strokeDashoffset = circumference;

        setTimeout(() => {
            const offset = circumference - (score / 100) * circumference;
            circleEl.style.strokeDashoffset = offset;

            // Animate number
            let current = 0;
            const interval = setInterval(() => {
                current += 2;
                if (current >= score) {
                    current = score;
                    clearInterval(interval);
                }
                scoreEl.textContent = Math.round(current);
            }, 20);
        }, 300);
    }

    renderDiseases(diseases) {
        const container = document.getElementById('diseases-container');
        const section = document.getElementById('diseases-section');

        if (!diseases || diseases.length === 0) {
            section.classList.add('hidden');
            document.getElementById('healthy-message').classList.remove('hidden');
            return;
        }

        container.innerHTML = diseases.map((disease, index) => `
            <div class="disease-card severity-${disease.severity}" data-index="${index}">
                <div class="disease-header">
                    <div class="disease-info">
                        <h3>${disease.name}</h3>
                        ${disease.scientificName ? `<span class="scientific">${disease.scientificName}</span>` : ''}
                    </div>
                    <div class="confidence-badge">
                        ${Math.round(disease.confidence * 100)}%
                    </div>
                </div>

                <div class="severity-row">
                    <span class="severity-tag severity-${disease.severity}">
                        <i class="fas fa-${this.getSeverityIcon(disease.severity)}"></i>
                        ${disease.severity.charAt(0).toUpperCase() + disease.severity.slice(1)} Severity
                    </span>
                    ${disease.affectedParts?.length ? `
                        <span class="affected-parts">
                            <i class="fas fa-leaf"></i>
                            ${disease.affectedParts.join(', ')}
                        </span>
                    ` : ''}
                </div>

                ${disease.description ? `
                    <p class="disease-description">${disease.description}</p>
                ` : ''}

                ${disease.symptoms?.length ? `
                    <div class="symptoms-list">
                        <h4><i class="fas fa-search"></i> Symptoms</h4>
                        <ul>
                            ${disease.symptoms.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${disease.causes?.length ? `
                    <div class="causes-list">
                        <h4><i class="fas fa-question-circle"></i> Causes</h4>
                        <ul>
                            ${disease.causes.map(c => `<li>${c}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                <button class="btn btn-sm btn-outline learn-more-btn" data-disease="${encodeURIComponent(disease.name)}">
                    <i class="fas fa-external-link-alt"></i> Learn More
                </button>
            </div>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.learn-more-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = decodeURIComponent(btn.dataset.disease);
                window.open(`https://www.google.com/search?q=${encodeURIComponent(name + ' plant disease treatment')}`, '_blank');
            });
        });
    }

    getSeverityIcon(severity) {
        const icons = {
            critical: 'skull-crossbones',
            high: 'exclamation-triangle',
            medium: 'exclamation-circle',
            low: 'info-circle'
        };
        return icons[severity] || 'info-circle';
    }

    renderTreatments(treatments) {
        const container = document.getElementById('treatments-container');

        let html = '';

        // Immediate Actions
        if (treatments.immediate?.length) {
            html += `
                <div class="treatment-group urgent">
                    <h4><i class="fas fa-bolt"></i> Immediate Actions</h4>
                    <ul>
                        ${treatments.immediate.map(t => `<li>${t}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // Chemical Treatments
        if (treatments.chemical?.length) {
            html += `
                <div class="treatment-group chemical">
                    <h4><i class="fas fa-flask"></i> Chemical Treatments</h4>
                    <div class="treatment-cards">
                        ${treatments.chemical.map(t => `
                            <div class="treatment-item">
                                <strong>${t.product}</strong>
                                <p>${t.application}</p>
                                <span class="frequency"><i class="fas fa-clock"></i> ${t.frequency}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Organic Treatments
        if (treatments.organic?.length) {
            html += `
                <div class="treatment-group organic">
                    <h4><i class="fas fa-leaf"></i> Organic Treatments</h4>
                    <div class="treatment-cards">
                        ${treatments.organic.map(t => `
                            <div class="treatment-item">
                                <strong>${t.method}</strong>
                                <p>${t.instructions}</p>
                                <span class="effectiveness effectiveness-${t.effectiveness}">
                                    Effectiveness: ${t.effectiveness}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Cultural Practices
        if (treatments.cultural?.length) {
            html += `
                <div class="treatment-group cultural">
                    <h4><i class="fas fa-hands-helping"></i> Cultural Practices</h4>
                    <ul>
                        ${treatments.cultural.map(t => `<li>${t}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        container.innerHTML = html || '<p>No specific treatments needed for healthy plants.</p>';
    }

    renderGrowthRecommendations(recommendations) {
        const container = document.getElementById('growth-container');

        const sections = [
            {
                key: 'water',
                icon: 'tint',
                title: 'Watering',
                color: '#3498db'
            },
            {
                key: 'sunlight',
                icon: 'sun',
                title: 'Sunlight',
                color: '#f39c12'
            },
            {
                key: 'soil',
                icon: 'mountain',
                title: 'Soil',
                color: '#8b4513'
            },
            {
                key: 'temperature',
                icon: 'thermometer-half',
                title: 'Temperature',
                color: '#e74c3c'
            },
            {
                key: 'fertilizer',
                icon: 'seedling',
                title: 'Fertilizer',
                color: '#27ae60'
            },
            {
                key: 'pruning',
                icon: 'cut',
                title: 'Pruning',
                color: '#9b59b6'
            }
        ];

        container.innerHTML = sections.map(section => {
            const data = recommendations[section.key];
            if (!data) return '';

            return `
                <div class="care-card" style="--card-color: ${section.color}">
                    <div class="care-header">
                        <i class="fas fa-${section.icon}"></i>
                        <h4>${section.title}</h4>
                    </div>
                    <div class="care-content">
                        ${this.renderCareContent(section.key, data)}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderCareContent(key, data) {
        switch (key) {
            case 'water':
                return `
                    <div class="care-item"><strong>Frequency:</strong> ${data.frequency}</div>
                    <div class="care-item"><strong>Amount:</strong> ${data.amount}</div>
                    <div class="care-item"><strong>Method:</strong> ${data.method}</div>
                    ${data.signs_overwatering?.length ? `
                        <div class="care-warning">
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>Overwatering signs:</strong> ${data.signs_overwatering.join(', ')}
                        </div>
                    ` : ''}
                `;

            case 'sunlight':
                return `
                    <div class="care-item"><strong>Requirement:</strong> ${data.requirement}</div>
                    <div class="care-item"><strong>Hours:</strong> ${data.hours}</div>
                    <div class="care-item"><strong>Intensity:</strong> ${data.intensity}</div>
                    ${data.tips?.length ? `
                        <ul class="care-tips">
                            ${data.tips.map(t => `<li>${t}</li>`).join('')}
                        </ul>
                    ` : ''}
                `;

            case 'soil':
                return `
                    <div class="care-item"><strong>Type:</strong> ${data.type}</div>
                    <div class="care-item"><strong>pH:</strong> ${data.pH}</div>
                    <div class="care-item"><strong>Drainage:</strong> ${data.drainage}</div>
                    ${data.amendments?.length ? `
                        <div class="care-item"><strong>Amendments:</strong> ${data.amendments.join(', ')}</div>
                    ` : ''}
                `;

            case 'temperature':
                return `
                    <div class="care-item"><strong>Optimal:</strong> ${data.optimal}</div>
                    <div class="care-item"><strong>Min:</strong> ${data.minimum}</div>
                    <div class="care-item"><strong>Max:</strong> ${data.maximum}</div>
                    <div class="care-item"><strong>Humidity:</strong> ${data.humidity}</div>
                `;

            case 'fertilizer':
                return `
                    <div class="care-item"><strong>Type:</strong> ${data.type}</div>
                    <div class="care-item"><strong>NPK Ratio:</strong> ${data.npk}</div>
                    <div class="care-item"><strong>Frequency:</strong> ${data.frequency}</div>
                    <div class="care-item"><strong>Season:</strong> ${data.season}</div>
                `;

            case 'pruning':
                return `
                    <div class="care-item"><strong>When:</strong> ${data.when}</div>
                    <div class="care-item"><strong>How:</strong> ${data.how}</div>
                    <div class="care-item"><strong>Frequency:</strong> ${data.frequency}</div>
                `;

            default:
                return JSON.stringify(data);
        }
    }

    renderPrevention(prevention) {
        const container = document.getElementById('prevention-container');

        if (!prevention || prevention.length === 0) {
            container.innerHTML = '<p>Continue with regular plant care practices.</p>';
            return;
        }

        container.innerHTML = `
            <ul class="prevention-list">
                ${prevention.map(tip => `
                    <li>
                        <i class="fas fa-shield-alt"></i>
                        ${tip}
                    </li>
                `).join('')}
            </ul>
        `;
    }

    showUrgencyBanner(level, followUpDays) {
        const banner = document.getElementById('urgency-banner');
        
        const messages = {
            low: { icon: 'info-circle', text: 'Minor attention needed' },
            medium: { icon: 'exclamation-circle', text: 'Requires attention soon' },
            high: { icon: 'exclamation-triangle', text: 'Urgent attention required' },
            critical: { icon: 'skull-crossbones', text: 'Critical - Immediate action needed' }
        };

        const { icon, text } = messages[level] || messages.low;

        banner.className = `urgency-banner urgency-${level}`;
        banner.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${text}</span>
            <span class="followup">Follow-up scan in ${followUpDays} days</span>
        `;
        banner.classList.remove('hidden');
    }

    setupEventListeners() {
        // Save button
        document.getElementById('save-btn')?.addEventListener('click', () => this.savePlant());

        // Share button
        document.getElementById('share-btn')?.addEventListener('click', () => this.shareResults());

        // Download button
        document.getElementById('download-btn')?.addEventListener('click', () => this.downloadReport());

        // Ask AI button
        document.getElementById('ask-ai-btn')?.addEventListener('click', () => this.openAskModal());

        // Ask modal submit
        document.getElementById('ask-submit-btn')?.addEventListener('click', () => this.submitQuestion());

        // Close modal
        document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
            el.addEventListener('click', () => this.closeModals());
        });
    }

    async savePlant() {
        try {
            const user = window.authManager?.getUser();
            if (!user) {
                alert('Please sign in to save plants');
                return;
            }

            const { error } = await this.supabase
                .from('saved_plants')
                .insert({
                    user_id: user.id,
                    scan_id: this.scanId
                });

            if (error?.code === '23505') {
                this.showNotification('Plant already saved!', 'info');
            } else if (error) {
                throw error;
            } else {
                this.showNotification('Saved to favorites!', 'success');
                const btn = document.getElementById('save-btn');
                btn.innerHTML = '<i class="fas fa-heart"></i> Saved';
                btn.disabled = true;
            }
        } catch (error) {
            this.showNotification('Failed to save', 'error');
        }
    }

    async shareResults() {
        const shareData = {
            title: `Plant Health Report - ${this.analysisData.plantIdentification.commonName}`,
            text: `My plant health score: ${this.analysisData.healthAssessment.healthScore}%`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                this.showNotification('Link copied!', 'success');
            }
        } catch (error) {
            console.log('Share cancelled');
        }
    }

    downloadReport() {
        const analysis = this.analysisData;
        const plant = analysis.plantIdentification;
        const health = analysis.healthAssessment;

        const report = `


Generated: ${new Date().toLocaleString()}
Scan ID: ${this.scanId}


  Common Name: ${plant.commonName}
  Scientific Name: ${plant.scientificName || 'N/A'}
  Family: ${plant.family || 'N/A'}
  Confidence: ${Math.round(plant.confidence * 100)}%


  Health Score: ${health.healthScore}/100
  Status: ${health.isHealthy ? '✅ Healthy' : '⚠️ Issues Detected'}
  Condition: ${health.overallCondition}


${analysis.diseases.length === 0 ? '  No diseases detected! ✨' :
    analysis.diseases.map(d => `
  • ${d.name} (${Math.round(d.confidence * 100)}% confidence)
    Severity: ${d.severity}
    ${d.description ? `Description: ${d.description}` : ''}
`).join('\n')}


${analysis.treatments.immediate?.length ? `
  🚨 Immediate Actions:
${analysis.treatments.immediate.map(t => `     • ${t}`).join('\n')}
` : ''}
${analysis.treatments.organic?.length ? `
  🌿 Organic Treatments:
${analysis.treatments.organic.map(t => `     • ${t.method}: ${t.instructions}`).join('\n')}
` : ''}
${analysis.treatments.chemical?.length ? `
  🧪 Chemical Treatments:
${analysis.treatments.chemical.map(t => `     • ${t.product}: ${t.application}`).join('\n')}
` : ''}


  💧 Watering: ${analysis.growthRecommendations.water?.frequency}
  ☀️ Sunlight: ${analysis.growthRecommendations.sunlight?.requirement}
  🌡️ Temperature: ${analysis.growthRecommendations.temperature?.optimal}
  🧪 Fertilizer: ${analysis.growthRecommendations.fertilizer?.frequency}


${analysis.prevention.map(p => `  • ${p}`).join('\n')}


${analysis.additionalNotes ? `
  ${analysis.additionalNotes}
` : ''}

 Follow-up recommended in ${analysis.followUpDays} days

Generated by PlantDoc AI 🌿
Powered by Google Gemini
        `.trim();

        const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plant-report-${plant.commonName.replace(/\s+/g, '-')}-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Report downloaded!', 'success');
    }

    openAskModal() {
        document.getElementById('ask-modal').classList.remove('hidden');
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    }

    async submitQuestion() {
        const input = document.getElementById('ask-input');
        const question = input.value.trim();
        
        if (!question) return;

        const responseEl = document.getElementById('ask-response');
        responseEl.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> AI is thinking...</div>';
        
        try {
            // Get image data from scanData
            const imageData = this.scanData?.image_url || localStorage.getItem('scannedImageData');
            
            if (!imageData) {
                throw new Error('No image data available');
            }
            
            const result = await window.geminiAI.askQuestion(imageData, question);
            
            if (result.success) {
                responseEl.innerHTML = `
                    <div class="ai-response">
                        <div class="response-header">
                            <i class="fas fa-robot"></i> AI Response
                        </div>
                        <div class="response-content">${result.answer}</div>
                    </div>
                `;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            responseEl.innerHTML = `<div class="error">Failed to get response: ${error.message}</div>`;
        }
    }

    showError(message) {
        const loadingEl = document.getElementById('results-loading');
        const errorEl = document.getElementById('results-error');
        const messageEl = document.getElementById('error-message');
        
        if (loadingEl) loadingEl.classList.add('hidden');
        if (errorEl) errorEl.classList.remove('hidden');
        if (messageEl) messageEl.textContent = message;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} show`;
        notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i> ${message}`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new ResultsPage();
});
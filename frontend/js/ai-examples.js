// =====================================================
// DIGITAL KRISHI - AI USAGE EXAMPLES
// =====================================================
// This file demonstrates various ways to use the Gemini AI
// plant disease detection system

// =====================================================
// EXAMPLE 1: Basic Plant Analysis
// =====================================================
async function basicAnalysis(imageFile) {
    console.log('📸 Starting basic plant analysis...');
    
    // Convert file to Base64
    const imageBase64 = await fileToBase64(imageFile);
    
    // Analyze with Gemini AI
    const result = await window.geminiAI.analyzePlant(imageBase64);
    
    if (result.success) {
        console.log('✅ Analysis successful!');
        console.log('Plant:', result.data.plantIdentification.commonName);
        console.log('Health Score:', result.data.healthAssessment.healthScore);
        console.log('Is Healthy:', result.data.healthAssessment.isHealthy);
        
        if (result.data.diseases.length > 0) {
            console.log('⚠️ Diseases found:', result.data.diseases.length);
            result.data.diseases.forEach(disease => {
                console.log(`  - ${disease.name} (${disease.severity})`);
            });
        }
        
        return result.data;
    } else {
        console.error('❌ Analysis failed:', result.error);
        return null;
    }
}

// =====================================================
// EXAMPLE 2: Quick Plant Identification Only
// =====================================================
async function quickIdentification(imageFile) {
    console.log('🔍 Quick plant identification...');
    
    const imageBase64 = await fileToBase64(imageFile);
    const result = await window.geminiAI.identifyPlant(imageBase64);
    
    if (result.success) {
        console.log('Plant identified:');
        console.log('Common Name:', result.data.commonName);
        console.log('Scientific Name:', result.data.scientificName);
        console.log('Family:', result.data.family);
        console.log('Confidence:', (result.data.confidence * 100).toFixed(1) + '%');
        console.log('Description:', result.data.description);
        return result.data;
    } else {
        console.error('Identification failed:', result.error);
        return null;
    }
}

// =====================================================
// EXAMPLE 3: Get Care Tips for Known Plant
// =====================================================
async function getPlantCareTips(plantName) {
    console.log(`🌱 Getting care tips for ${plantName}...`);
    
    const result = await window.geminiAI.getCareTips(plantName);
    
    if (result.success) {
        const care = result.data;
        console.log('Care Difficulty:', care.difficulty);
        console.log('\n💧 Watering:');
        console.log('  Frequency:', care.water.frequency);
        console.log('\n☀️ Sunlight:');
        console.log('  Requirement:', care.sunlight.requirement);
        console.log('\n🌡️ Temperature:');
        console.log('  Range:', care.temperature.range);
        console.log('\n🌾 Soil:');
        console.log('  Type:', care.soil.type);
        
        if (care.commonProblems.length > 0) {
            console.log('\n⚠️ Common Problems:');
            care.commonProblems.forEach(problem => {
                console.log(`  - ${problem.problem}`);
                console.log(`    Solution: ${problem.solution}`);
            });
        }
        
        return care;
    } else {
        console.error('Failed to get care tips:', result.error);
        return null;
    }
}

// =====================================================
// EXAMPLE 4: Ask Follow-up Questions
// =====================================================
async function askAboutPlant(imageFile, question) {
    console.log(`❓ Asking: "${question}"`);
    
    const imageBase64 = await fileToBase64(imageFile);
    const result = await window.geminiAI.askQuestion(imageBase64, question);
    
    if (result.success) {
        console.log('💬 Answer:', result.answer);
        return result.answer;
    } else {
        console.error('Failed to get answer:', result.error);
        return null;
    }
}

// =====================================================
// EXAMPLE 5: Batch Processing Multiple Images
// =====================================================
async function batchAnalysis(imageFiles) {
    console.log(`📦 Processing ${imageFiles.length} images...`);
    
    const results = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
        console.log(`\n[${i + 1}/${imageFiles.length}] Processing ${imageFiles[i].name}...`);
        
        const imageBase64 = await fileToBase64(imageFiles[i]);
        const result = await window.geminiAI.analyzePlant(imageBase64);
        
        if (result.success) {
            results.push({
                fileName: imageFiles[i].name,
                plant: result.data.plantIdentification.commonName,
                healthScore: result.data.healthAssessment.healthScore,
                diseaseCount: result.data.diseases.length,
                data: result.data
            });
            console.log(`✅ ${result.data.plantIdentification.commonName} - Health: ${result.data.healthAssessment.healthScore}/100`);
        } else {
            results.push({
                fileName: imageFiles[i].name,
                error: result.error
            });
            console.log(`❌ Failed: ${result.error}`);
        }
        
        // Add delay to avoid rate limiting
        await sleep(2000);
    }
    
    console.log('\n📊 Batch Analysis Summary:');
    console.log(`Total: ${results.length}`);
    console.log(`Successful: ${results.filter(r => !r.error).length}`);
    console.log(`Failed: ${results.filter(r => r.error).length}`);
    
    return results;
}

// =====================================================
// EXAMPLE 6: Disease Alert System
// =====================================================
async function diseaseAlertSystem(imageFile, alertThreshold = 'medium') {
    console.log('🚨 Running disease alert system...');
    
    const imageBase64 = await fileToBase64(imageFile);
    const result = await window.geminiAI.analyzePlant(imageBase64);
    
    if (result.success) {
        const alerts = [];
        const data = result.data;
        
        // Check urgency level
        if (data.urgencyLevel !== 'none' && data.urgencyLevel !== 'low') {
            alerts.push({
                type: 'URGENCY',
                level: data.urgencyLevel,
                message: `Urgent attention needed! Urgency level: ${data.urgencyLevel}`
            });
        }
        
        // Check health score
        if (data.healthAssessment.healthScore < 50) {
            alerts.push({
                type: 'HEALTH',
                level: 'high',
                message: `Poor health detected! Score: ${data.healthAssessment.healthScore}/100`
            });
        }
        
        // Check diseases
        data.diseases.forEach(disease => {
            const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
            const thresholdLevel = severityLevels[alertThreshold];
            const diseaseLevel = severityLevels[disease.severity];
            
            if (diseaseLevel >= thresholdLevel) {
                alerts.push({
                    type: 'DISEASE',
                    level: disease.severity,
                    message: `${disease.name} detected (${disease.severity} severity)`,
                    disease: disease
                });
            }
        });
        
        // Send alerts
        if (alerts.length > 0) {
            console.log(`\n⚠️ ${alerts.length} ALERT(S) TRIGGERED:`);
            alerts.forEach((alert, i) => {
                console.log(`\n[${i + 1}] ${alert.type} - ${alert.level.toUpperCase()}`);
                console.log(`    ${alert.message}`);
            });
            
            // Could send email, SMS, push notification here
            await sendNotifications(alerts, data);
        } else {
            console.log('✅ No alerts - plant is healthy!');
        }
        
        return { alerts, data };
    } else {
        console.error('Alert system failed:', result.error);
        return null;
    }
}

// =====================================================
// EXAMPLE 7: Treatment Recommendation System
// =====================================================
async function getTreatmentPlan(imageFile, preferOrganic = false) {
    console.log('💊 Generating treatment plan...');
    
    const imageBase64 = await fileToBase64(imageFile);
    const result = await window.geminiAI.analyzePlant(imageBase64);
    
    if (result.success) {
        const data = result.data;
        const plan = {
            plant: data.plantIdentification.commonName,
            healthScore: data.healthAssessment.healthScore,
            diseases: data.diseases,
            steps: []
        };
        
        // Step 1: Immediate actions
        if (data.treatments.immediate.length > 0) {
            plan.steps.push({
                priority: 'IMMEDIATE',
                title: '⚡ Immediate Actions (Do Now)',
                actions: data.treatments.immediate
            });
        }
        
        // Step 2: Main treatment
        if (preferOrganic) {
            if (data.treatments.organic.length > 0) {
                plan.steps.push({
                    priority: 'HIGH',
                    title: '🌿 Organic Treatments (Next 1-3 Days)',
                    actions: data.treatments.organic.map(t => 
                        `${t.method}: ${t.instructions}`
                    )
                });
            }
            if (data.treatments.chemical.length > 0) {
                plan.steps.push({
                    priority: 'MEDIUM',
                    title: '🧪 Chemical Treatments (If Organic Fails)',
                    actions: data.treatments.chemical.map(t => 
                        `${t.product}: ${t.application} - ${t.frequency}`
                    )
                });
            }
        } else {
            if (data.treatments.chemical.length > 0) {
                plan.steps.push({
                    priority: 'HIGH',
                    title: '🧪 Chemical Treatments (Next 1-3 Days)',
                    actions: data.treatments.chemical.map(t => 
                        `${t.product}: ${t.application} - ${t.frequency}`
                    )
                });
            }
            if (data.treatments.organic.length > 0) {
                plan.steps.push({
                    priority: 'MEDIUM',
                    title: '🌿 Organic Alternatives',
                    actions: data.treatments.organic.map(t => 
                        `${t.method}: ${t.instructions}`
                    )
                });
            }
        }
        
        // Step 3: Cultural practices
        if (data.treatments.cultural.length > 0) {
            plan.steps.push({
                priority: 'ONGOING',
                title: '🌾 Long-term Practices',
                actions: data.treatments.cultural
            });
        }
        
        // Step 4: Prevention
        if (data.prevention.length > 0) {
            plan.steps.push({
                priority: 'PREVENTIVE',
                title: '🛡️ Prevention for Future',
                actions: data.prevention
            });
        }
        
        // Display plan
        console.log(`\n📋 TREATMENT PLAN FOR ${plan.plant}`);
        console.log(`Current Health: ${plan.healthScore}/100`);
        console.log(`Diseases: ${plan.diseases.length}\n`);
        
        plan.steps.forEach((step, i) => {
            console.log(`\n${i + 1}. ${step.title}`);
            step.actions.forEach(action => {
                console.log(`   • ${action}`);
            });
        });
        
        console.log(`\n📅 Follow-up recommended in ${data.followUpDays} days`);
        
        return plan;
    } else {
        console.error('Failed to generate treatment plan:', result.error);
        return null;
    }
}

// =====================================================
// EXAMPLE 8: Health Monitoring Over Time
// =====================================================
class PlantHealthMonitor {
    constructor(plantId) {
        this.plantId = plantId;
        this.scans = [];
    }
    
    async addScan(imageFile) {
        console.log(`📊 Adding scan for plant ${this.plantId}...`);
        
        const imageBase64 = await fileToBase64(imageFile);
        const result = await window.geminiAI.analyzePlant(imageBase64);
        
        if (result.success) {
            const scan = {
                date: new Date(),
                healthScore: result.data.healthAssessment.healthScore,
                diseaseCount: result.data.diseases.length,
                diseases: result.data.diseases.map(d => d.name),
                urgencyLevel: result.data.urgencyLevel,
                data: result.data
            };
            
            this.scans.push(scan);
            console.log(`✅ Scan added. Total scans: ${this.scans.length}`);
            
            return scan;
        } else {
            console.error('Scan failed:', result.error);
            return null;
        }
    }
    
    getHealthTrend() {
        if (this.scans.length < 2) {
            return 'Insufficient data';
        }
        
        const recent = this.scans.slice(-3);
        const scores = recent.map(s => s.healthScore);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const trend = scores[scores.length - 1] - scores[0];
        
        console.log('\n📈 Health Trend Analysis:');
        console.log(`Total scans: ${this.scans.length}`);
        console.log(`Recent avg score: ${avg.toFixed(1)}/100`);
        console.log(`Trend: ${trend > 0 ? '↗️ Improving' : trend < 0 ? '↘️ Declining' : '→ Stable'} (${trend > 0 ? '+' : ''}${trend.toFixed(1)})`);
        
        return {
            totalScans: this.scans.length,
            averageScore: avg,
            trend: trend,
            status: trend > 5 ? 'improving' : trend < -5 ? 'declining' : 'stable'
        };
    }
    
    getDiseaseHistory() {
        const diseaseMap = new Map();
        
        this.scans.forEach(scan => {
            scan.diseases.forEach(disease => {
                if (!diseaseMap.has(disease)) {
                    diseaseMap.set(disease, []);
                }
                diseaseMap.get(disease).push(scan.date);
            });
        });
        
        console.log('\n🦠 Disease History:');
        diseaseMap.forEach((dates, disease) => {
            console.log(`${disease}: ${dates.length} occurrence(s)`);
        });
        
        return Object.fromEntries(diseaseMap);
    }
}

// =====================================================
// EXAMPLE 9: Comparative Analysis
// =====================================================
async function compareImages(imageFile1, imageFile2) {
    console.log('⚖️ Comparing two images...');
    
    const [img1Base64, img2Base64] = await Promise.all([
        fileToBase64(imageFile1),
        fileToBase64(imageFile2)
    ]);
    
    const [result1, result2] = await Promise.all([
        window.geminiAI.analyzePlant(img1Base64),
        window.geminiAI.analyzePlant(img2Base64)
    ]);
    
    if (result1.success && result2.success) {
        const comparison = {
            image1: {
                plant: result1.data.plantIdentification.commonName,
                health: result1.data.healthAssessment.healthScore,
                diseases: result1.data.diseases.length
            },
            image2: {
                plant: result2.data.plantIdentification.commonName,
                health: result2.data.healthAssessment.healthScore,
                diseases: result2.data.diseases.length
            },
            diff: {
                healthChange: result2.data.healthAssessment.healthScore - result1.data.healthAssessment.healthScore,
                diseaseChange: result2.data.diseases.length - result1.data.diseases.length
            }
        };
        
        console.log('\n📊 Comparison Results:');
        console.log(`\nImage 1: ${comparison.image1.plant}`);
        console.log(`  Health: ${comparison.image1.health}/100`);
        console.log(`  Diseases: ${comparison.image1.diseases}`);
        console.log(`\nImage 2: ${comparison.image2.plant}`);
        console.log(`  Health: ${comparison.image2.health}/100`);
        console.log(`  Diseases: ${comparison.image2.diseases}`);
        console.log(`\nChange:`);
        console.log(`  Health: ${comparison.diff.healthChange > 0 ? '+' : ''}${comparison.diff.healthChange}`);
        console.log(`  Diseases: ${comparison.diff.diseaseChange > 0 ? '+' : ''}${comparison.diff.diseaseChange}`);
        
        return comparison;
    } else {
        console.error('Comparison failed');
        return null;
    }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Convert file to Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Sleep utility
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock notification sender
async function sendNotifications(alerts, plantData) {
    console.log('\n📧 Sending notifications...');
    // In production, integrate with:
    // - Email service (SendGrid, AWS SES)
    // - SMS service (Twilio)
    // - Push notifications (Firebase)
    alerts.forEach(alert => {
        console.log(`  ✉️ Notification sent: ${alert.message}`);
    });
}

// =====================================================
// USAGE EXAMPLES
// =====================================================

// Example 1: Basic usage
/*
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    await basicAnalysis(file);
});
*/

// Example 2: Health monitoring
/*
const monitor = new PlantHealthMonitor('tomato-plant-01');
// Add scans over time
await monitor.addScan(scan1File);
await monitor.addScan(scan2File);
await monitor.addScan(scan3File);
// Get trend
monitor.getHealthTrend();
monitor.getDiseaseHistory();
*/

// Example 3: Treatment plan
/*
const plan = await getTreatmentPlan(imageFile, true); // true = prefer organic
*/

// Export for use in other files
if (typeof window !== 'undefined') {
    window.PlantAIExamples = {
        basicAnalysis,
        quickIdentification,
        getPlantCareTips,
        askAboutPlant,
        batchAnalysis,
        diseaseAlertSystem,
        getTreatmentPlan,
        PlantHealthMonitor,
        compareImages
    };
    console.log('✅ Plant AI Examples loaded!');
}

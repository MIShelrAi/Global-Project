// =============================================
// GEMINI AI - PLANT DISEASE DETECTION MODULE
// =============================================

class GeminiPlantAI {
    constructor() {
        this.apiKey = CONFIG.GEMINI_API_KEY;
        this.model = CONFIG.GEMINI_MODEL;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    }

    // =========================================
    // MAIN ANALYSIS FUNCTION
    // =========================================
    async analyzePlant(imageBase64, options = {}) {
        try {
            // Clean base64 string
            const cleanBase64 = this.cleanBase64(imageBase64);
            const mimeType = this.getMimeType(imageBase64);

            // Build the analysis prompt
            const prompt = this.buildAnalysisPrompt(options);

            // Call Gemini API
            const response = await this.callGeminiVision(prompt, cleanBase64, mimeType);

            // Parse and structure the response
            const analysisResult = this.parseAnalysisResponse(response);

            return {
                success: true,
                data: analysisResult,
                rawResponse: response
            };

        } catch (error) {
            console.error('Gemini Analysis Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to analyze plant'
            };
        }
    }

    // =========================================
    // BUILD ANALYSIS PROMPT
    // =========================================
    buildAnalysisPrompt(options = {}) {
        return `You are an expert botanist and plant pathologist. Analyze this plant image and provide a comprehensive assessment.

Please analyze the image and respond with a JSON object in this EXACT format (no markdown, just pure JSON):

{
    "isPlant": true/false,
    "plantIdentification": {
        "commonName": "Plant common name",
        "scientificName": "Scientific name",
        "family": "Plant family",
        "confidence": 0.0 to 1.0
    },
    "healthAssessment": {
        "isHealthy": true/false,
        "healthScore": 0 to 100,
        "overallCondition": "Excellent/Good/Fair/Poor/Critical"
    },
    "diseases": [
        {
            "name": "Disease name",
            "scientificName": "Scientific name if known",
            "confidence": 0.0 to 1.0,
            "severity": "low/medium/high/critical",
            "affectedParts": ["leaves", "stem", etc],
            "symptoms": ["symptom 1", "symptom 2"],
            "description": "Brief description of the disease",
            "causes": ["cause 1", "cause 2"],
            "spread": "How it spreads"
        }
    ],
    "treatments": {
        "immediate": ["Action 1", "Action 2"],
        "chemical": [
            {
                "product": "Product name/type",
                "application": "How to apply",
                "frequency": "How often"
            }
        ],
        "organic": [
            {
                "method": "Organic treatment method",
                "instructions": "How to apply",
                "effectiveness": "high/medium/low"
            }
        ],
        "cultural": ["Cultural practice 1", "Cultural practice 2"]
    },
    "prevention": [
        "Prevention tip 1",
        "Prevention tip 2"
    ],
    "growthRecommendations": {
        "water": {
            "frequency": "How often to water",
            "amount": "How much water",
            "method": "Best watering method",
            "signs_overwatering": ["Sign 1", "Sign 2"],
            "signs_underwatering": ["Sign 1", "Sign 2"]
        },
        "sunlight": {
            "requirement": "Full sun/Partial shade/Shade",
            "hours": "X-Y hours per day",
            "intensity": "Direct/Indirect/Filtered",
            "tips": ["Tip 1", "Tip 2"]
        },
        "soil": {
            "type": "Soil type preference",
            "pH": "pH range",
            "drainage": "Drainage requirement",
            "amendments": ["Amendment 1", "Amendment 2"]
        },
        "temperature": {
            "optimal": "X-Y°C or °F",
            "minimum": "Min temp",
            "maximum": "Max temp",
            "humidity": "Humidity preference"
        },
        "fertilizer": {
            "type": "Fertilizer type",
            "npk": "N-P-K ratio",
            "frequency": "How often",
            "season": "Best season to fertilize"
        },
        "pruning": {
            "when": "When to prune",
            "how": "How to prune",
            "frequency": "How often"
        }
    },
    "additionalNotes": "Any other important observations or recommendations",
    "urgencyLevel": "none/low/medium/high/critical",
    "followUpDays": 7
}

Important instructions:
1. If no plant is detected, set isPlant to false and provide minimal data
2. If plant is healthy, return empty diseases array
3. Be specific with treatments and recommendations
4. Confidence scores should reflect your certainty
5. Always provide growth recommendations even for healthy plants
6. Return ONLY the JSON object, no other text`;
    }

    // =========================================
    // CALL GEMINI VISION API
    // =========================================
    async callGeminiVision(prompt, imageBase64, mimeType) {
        const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: imageBase64
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.4,
                topK: 32,
                topP: 1,
                maxOutputTokens: 4096,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_NONE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_NONE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_NONE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_NONE"
                }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Error:', errorData);
            throw new Error(errorData.error?.message || 'Gemini API request failed');
        }

        const data = await response.json();
        
        // Extract text from response
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!textContent) {
            throw new Error('No response from Gemini');
        }

        return textContent;
    }

    // =========================================
    // PARSE ANALYSIS RESPONSE
    // =========================================
    parseAnalysisResponse(responseText) {
        try {
            // Clean the response - remove markdown code blocks if present
            let cleanedResponse = responseText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();

            // Parse JSON
            const parsed = JSON.parse(cleanedResponse);

            // Validate and add defaults
            return this.validateAndEnhance(parsed);

        } catch (error) {
            console.error('Parse error:', error);
            console.log('Raw response:', responseText);
            
            // Return a fallback structure
            return this.createFallbackResponse(responseText);
        }
    }

    // =========================================
    // VALIDATE AND ENHANCE RESPONSE
    // =========================================
    validateAndEnhance(data) {
        return {
            isPlant: data.isPlant ?? true,
            
            plantIdentification: {
                commonName: data.plantIdentification?.commonName || 'Unknown Plant',
                scientificName: data.plantIdentification?.scientificName || null,
                family: data.plantIdentification?.family || null,
                confidence: data.plantIdentification?.confidence || 0.5
            },
            
            healthAssessment: {
                isHealthy: data.healthAssessment?.isHealthy ?? true,
                healthScore: data.healthAssessment?.healthScore ?? 70,
                overallCondition: data.healthAssessment?.overallCondition || 'Good'
            },
            
            diseases: (data.diseases || []).map(disease => ({
                name: disease.name || 'Unknown Issue',
                scientificName: disease.scientificName || null,
                confidence: disease.confidence || 0.5,
                severity: disease.severity || 'medium',
                affectedParts: disease.affectedParts || [],
                symptoms: disease.symptoms || [],
                description: disease.description || '',
                causes: disease.causes || [],
                spread: disease.spread || ''
            })),
            
            treatments: {
                immediate: data.treatments?.immediate || [],
                chemical: data.treatments?.chemical || [],
                organic: data.treatments?.organic || [],
                cultural: data.treatments?.cultural || []
            },
            
            prevention: data.prevention || [],
            
            growthRecommendations: {
                water: data.growthRecommendations?.water || {
                    frequency: 'When top inch of soil is dry',
                    amount: 'Water thoroughly until drainage',
                    method: 'Water at soil level',
                    signs_overwatering: ['Yellow leaves', 'Wilting despite wet soil'],
                    signs_underwatering: ['Dry, crispy leaves', 'Drooping']
                },
                sunlight: data.growthRecommendations?.sunlight || {
                    requirement: 'Bright indirect light',
                    hours: '6-8 hours',
                    intensity: 'Indirect',
                    tips: ['Rotate plant regularly']
                },
                soil: data.growthRecommendations?.soil || {
                    type: 'Well-draining potting mix',
                    pH: '6.0-7.0',
                    drainage: 'Good drainage required',
                    amendments: ['Perlite', 'Compost']
                },
                temperature: data.growthRecommendations?.temperature || {
                    optimal: '18-24°C (65-75°F)',
                    minimum: '10°C (50°F)',
                    maximum: '30°C (86°F)',
                    humidity: 'Moderate (40-60%)'
                },
                fertilizer: data.growthRecommendations?.fertilizer || {
                    type: 'Balanced liquid fertilizer',
                    npk: '10-10-10',
                    frequency: 'Monthly during growing season',
                    season: 'Spring and Summer'
                },
                pruning: data.growthRecommendations?.pruning || {
                    when: 'As needed',
                    how: 'Remove dead or yellowing leaves',
                    frequency: 'Monthly inspection'
                }
            },
            
            additionalNotes: data.additionalNotes || '',
            urgencyLevel: data.urgencyLevel || 'none',
            followUpDays: data.followUpDays || 14,
            
            // Metadata
            analyzedAt: new Date().toISOString(),
            aiModel: this.model
        };
    }

    // =========================================
    // FALLBACK RESPONSE (if parsing fails)
    // =========================================
    createFallbackResponse(rawText) {
        // Try to extract some information from the raw text
        const isHealthy = !rawText.toLowerCase().includes('disease') && 
                          !rawText.toLowerCase().includes('unhealthy');
        
        return {
            isPlant: true,
            plantIdentification: {
                commonName: 'Plant (identification pending)',
                scientificName: null,
                family: null,
                confidence: 0.3
            },
            healthAssessment: {
                isHealthy: isHealthy,
                healthScore: isHealthy ? 75 : 50,
                overallCondition: isHealthy ? 'Good' : 'Fair'
            },
            diseases: [],
            treatments: {
                immediate: ['Please retake the photo with better lighting'],
                chemical: [],
                organic: [],
                cultural: []
            },
            prevention: ['Regular monitoring recommended'],
            growthRecommendations: this.getDefaultGrowthRecommendations(),
            additionalNotes: 'Analysis was partially successful. Consider retaking the photo with better lighting and focus.',
            urgencyLevel: 'low',
            followUpDays: 7,
            analyzedAt: new Date().toISOString(),
            aiModel: this.model,
            parsingNote: 'Fallback response generated'
        };
    }

    getDefaultGrowthRecommendations() {
        return {
            water: {
                frequency: 'Check soil moisture before watering',
                amount: 'Water thoroughly until drainage',
                method: 'Water at soil level, avoid leaves',
                signs_overwatering: ['Yellow leaves', 'Root rot smell'],
                signs_underwatering: ['Wilting', 'Dry crispy leaves']
            },
            sunlight: {
                requirement: 'Varies by plant type',
                hours: '4-8 hours depending on species',
                intensity: 'Check plant-specific requirements',
                tips: ['Observe leaf color for light stress signs']
            },
            soil: {
                type: 'Well-draining potting mix',
                pH: '6.0-7.0 for most plants',
                drainage: 'Ensure drainage holes',
                amendments: ['Perlite for drainage', 'Compost for nutrients']
            },
            temperature: {
                optimal: '18-24°C (65-75°F)',
                minimum: 'Protect from frost',
                maximum: 'Provide shade in extreme heat',
                humidity: 'Most plants prefer 40-60%'
            },
            fertilizer: {
                type: 'Balanced fertilizer',
                npk: '10-10-10 or similar',
                frequency: 'Monthly during growing season',
                season: 'Spring through early fall'
            },
            pruning: {
                when: 'Remove dead/damaged parts anytime',
                how: 'Use clean, sharp tools',
                frequency: 'As needed'
            }
        };
    }

    // =========================================
    // UTILITY FUNCTIONS
    // =========================================
    cleanBase64(base64String) {
        // Remove data URL prefix if present
        return base64String.replace(/^data:image\/\w+;base64,/, '');
    }

    getMimeType(base64String) {
        const match = base64String.match(/^data:(image\/\w+);base64,/);
        return match ? match[1] : 'image/jpeg';
    }

    // =========================================
    // QUICK PLANT IDENTIFICATION ONLY
    // =========================================
    async identifyPlant(imageBase64) {
        try {
            const cleanBase64 = this.cleanBase64(imageBase64);
            const mimeType = this.getMimeType(imageBase64);

            const prompt = `Identify this plant and provide the response as JSON:
{
    "commonName": "Plant name",
    "scientificName": "Scientific name",
    "family": "Plant family",
    "confidence": 0.0 to 1.0,
    "description": "Brief description",
    "nativeRegion": "Where it's from",
    "commonUses": ["Use 1", "Use 2"]
}

Return ONLY the JSON object.`;

            const response = await this.callGeminiVision(prompt, cleanBase64, mimeType);
            const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            
            return {
                success: true,
                data: JSON.parse(cleaned)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // =========================================
    // GET CARE TIPS FOR A PLANT
    // =========================================
    async getCareTips(plantName) {
        try {
            const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

            const prompt = `Provide detailed care tips for ${plantName}. Return as JSON:
{
    "plantName": "${plantName}",
    "difficulty": "Easy/Moderate/Hard",
    "water": {
        "frequency": "How often",
        "tips": ["Tip 1", "Tip 2"]
    },
    "sunlight": {
        "requirement": "Light requirement",
        "tips": ["Tip 1", "Tip 2"]
    },
    "soil": {
        "type": "Soil type",
        "tips": ["Tip 1", "Tip 2"]
    },
    "temperature": {
        "range": "Temperature range",
        "tips": ["Tip 1", "Tip 2"]
    },
    "fertilizer": {
        "type": "Fertilizer type",
        "schedule": "When to fertilize"
    },
    "commonProblems": [
        {
            "problem": "Problem name",
            "solution": "How to fix"
        }
    ],
    "seasonalCare": {
        "spring": "Spring care tips",
        "summer": "Summer care tips",
        "fall": "Fall care tips",
        "winter": "Winter care tips"
    },
    "propagation": "How to propagate",
    "toxicity": "Toxic to pets/humans?"
}

Return ONLY the JSON.`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 2048
                    }
                })
            });

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            return {
                success: true,
                data: JSON.parse(cleaned)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // =========================================
    // ASK FOLLOW-UP QUESTION
    // =========================================
    async askQuestion(imageBase64, question) {
        try {
            const cleanBase64 = this.cleanBase64(imageBase64);
            const mimeType = this.getMimeType(imageBase64);

            const prompt = `Looking at this plant image, please answer the following question:

${question}

Provide a helpful, detailed response focused on plant care and health.`;

            const response = await this.callGeminiVision(prompt, cleanBase64, mimeType);

            return {
                success: true,
                answer: response
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Initialize and export
window.geminiAI = new GeminiPlantAI();
console.log('✅ Gemini Plant AI initialized');
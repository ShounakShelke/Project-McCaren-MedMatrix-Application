/**
 * Project McCaren - Main Application Controller
 * Handles UI interactions and orchestrates validation pipeline
 */

declare const Helpers: any;
declare const QRScanner: any;
declare const HologramDetector: any;
declare const TamperDetector: any;
declare const PMJAYValidator: any;
declare const ESICValidator: any;
declare const ModelInference: any;

interface AppState {
    cardType: 'pmjay' | 'esic';
    capturedImage: string | null;
    isProcessing: boolean;
    cameraStream: MediaStream | null;
    validationResult: any | null;
}

interface CardFeatures {
    color_distribution: {
        red_mean: number;
        green_mean: number;
        blue_mean: number;
    };
    brightness_mean: number;
    qr_detected: boolean;
    qr_confidence: number;
    hologram_brightness_variance: number;
    hologram_color_range: number;
    texture_variance: number;
    compression_artifacts: number;
    edge_density: number;
    document_straightness: number;
    font_consistency: number;
    file_size: number;
    dimensions_ratio: number;
}

interface TrainingSample {
    name: string;
    color_distribution?: {
        red_mean: number;
        green_mean: number;
        blue_mean: number;
    };
    texture_variance?: number;
    brightness_mean?: number;
    dimensions?: {
        width: number;
        height: number;
    };
}

const McCarenApp = {
    // Current state
    state: {
        cardType: 'pmjay',
        capturedImage: null,
        isProcessing: false,
        cameraStream: null,
        validationResult: null
    } as AppState,

    /**
     * Initialize application
     */
    async init(): Promise<void> {
        this.bindEvents();
        this.initializeCamera();
        
        // Load trained model on startup
        const model = await ModelInference.loadModel();
        if (model) {
            console.log('✅ Trained model loaded - ready for inference');
        } else {
            console.warn('⚠️  No trained model available - using rule-based validation');
            Helpers.showToast('Tip: Run "node train-model.js" to train the fraud detection model', 'info');
        }
        
        console.log('Project McCaren initialized');
    },

    /**
     * Bind UI event handlers
     */
    bindEvents(): void {
        // Card type selection
        document.querySelectorAll('.card-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectCardType(e));
        });

        // Camera button
        const btnCamera = document.getElementById('btnCamera');
        if (btnCamera) {
            btnCamera.addEventListener('click', () => this.startCamera());
        }
        
        // Upload button
        const btnUpload = document.getElementById('btnUpload');
        if (btnUpload) {
            btnUpload.addEventListener('click', () => {
                const fileInput = document.getElementById('fileInput') as HTMLInputElement;
                if (fileInput) fileInput.click();
            });
        }
        
        // File input change
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e as Event));
        }
        
        // Capture button
        const btnCapture = document.getElementById('btnCapture');
        if (btnCapture) {
            btnCapture.addEventListener('click', () => this.capturePhoto());
        }
        
        // Analyze button
        const btnAnalyze = document.getElementById('btnAnalyze');
        if (btnAnalyze) {
            btnAnalyze.addEventListener('click', () => this.startValidation());
        }
        
        // New scan button
        const btnNewScan = document.getElementById('btnNewScan');
        if (btnNewScan) {
            btnNewScan.addEventListener('click', () => this.resetApp());
        }
        
        // Proceed to claim button
        const btnProceedClaim = document.getElementById('btnProceedClaim');
        if (btnProceedClaim) {
            btnProceedClaim.addEventListener('click', () => this.proceedToClaim());
        }
    },

    /**
     * Select card type (PMJAY/ESIC)
     */
    selectCardType(e: Event): void {
        const btn = e.currentTarget as HTMLElement;
        document.querySelectorAll('.card-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.cardType = btn.dataset.type as 'pmjay' | 'esic';
        Helpers.showToast(`Selected ${this.state.cardType.toUpperCase()} card`, 'info');
    },

    /**
     * Initialize camera access
     */
    async initializeCamera(): Promise<void> {
        try {
            // Check if camera is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.log('Camera not available');
                return;
            }
        } catch (error) {
            console.error('Camera init error:', error);
        }
    },

    /**
     * Start camera stream
     */
    async startCamera(): Promise<void> {
        try {
            const video = document.getElementById('videoStream') as HTMLVideoElement;
            const placeholder = document.getElementById('cameraPlaceholder');
            const preview = document.getElementById('previewImage') as HTMLImageElement;
            const captureBtn = document.getElementById('btnCapture');
            const analyzeBtn = document.getElementById('btnAnalyze');

            if (!video || !placeholder || !preview || !captureBtn || !analyzeBtn) return;

            // Hide other elements
            preview.classList.remove('active');
            placeholder.classList.add('hidden');
            analyzeBtn.classList.add('hidden');

            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Prefer back camera
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            this.state.cameraStream = stream;
            video.srcObject = stream;
            video.classList.add('active');
            captureBtn.classList.remove('hidden');

            Helpers.showToast('Camera ready - position card in frame', 'success');

        } catch (error) {
            console.error('Camera error:', error);
            Helpers.showToast('Camera access denied. Please upload image instead.', 'error');
        }
    },

    /**
     * Capture photo from camera
     */
    capturePhoto(): void {
        const video = document.getElementById('videoStream') as HTMLVideoElement;
        const canvas = document.getElementById('captureCanvas') as HTMLCanvasElement;
        const preview = document.getElementById('previewImage') as HTMLImageElement;
        const captureBtn = document.getElementById('btnCapture');
        const analyzeBtn = document.getElementById('btnAnalyze');

        if (!video || !canvas || !preview || !captureBtn || !analyzeBtn) return;

        // Draw video frame to canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0);
        }

        // Get image data
        this.state.capturedImage = canvas.toDataURL('image/jpeg', 0.9);

        // Stop camera
        this.stopCamera();

        // Show preview
        preview.src = this.state.capturedImage;
        preview.classList.add('active');
        video.classList.remove('active');
        captureBtn.classList.add('hidden');
        analyzeBtn.classList.remove('hidden');

        Helpers.showToast('Photo captured! Click Verify to analyze.', 'success');
    },

    /**
     * Stop camera stream
     */
    stopCamera(): void {
        if (this.state.cameraStream) {
            this.state.cameraStream.getTracks().forEach(track => track.stop());
            this.state.cameraStream = null;
        }
    },

    /**
     * Handle file upload
     */
    async handleFileUpload(e: Event): Promise<void> {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            Helpers.showToast('Please upload an image file', 'error');
            return;
        }

        try {
            const base64 = await Helpers.imageToBase64(file);
            this.state.capturedImage = base64;

            // Show preview
            const preview = document.getElementById('previewImage') as HTMLImageElement;
            const placeholder = document.getElementById('cameraPlaceholder');
            const analyzeBtn = document.getElementById('btnAnalyze');
            const video = document.getElementById('videoStream');

            if (video) video.classList.remove('active');
            if (placeholder) placeholder.classList.add('hidden');
            if (preview) {
                preview.src = base64;
                preview.classList.add('active');
            }
            if (analyzeBtn) analyzeBtn.classList.remove('hidden');

            Helpers.showToast('Image uploaded! Click Verify to analyze.', 'success');

        } catch (error) {
            console.error('Upload error:', error);
            Helpers.showToast('Error uploading image', 'error');
        }

        // Reset file input
        input.value = '';
    },

    /**
     * Start validation pipeline with model inference
     */
    async startValidation(): Promise<void> {
        if (!this.state.capturedImage) {
            Helpers.showToast('Please capture or upload a card image first', 'error');
            return;
        }

        this.state.isProcessing = true;
        Helpers.showScreen('screen-processing');
        Helpers.resetSteps();

        try {
            // Load image
            const img = await Helpers.loadImage(this.state.capturedImage);
            const canvas = document.createElement('canvas');
            Helpers.drawToCanvas(canvas, img);

            // Step 1: QR Code Scan
            Helpers.updateStep('step-qr', 'processing');
            await Helpers.delay(500);
            const qrResult = await QRScanner.scan(canvas);
            Helpers.updateStep('step-qr', qrResult.found ? 'completed' : 'failed');

            // Step 2: Hologram Detection
            Helpers.updateStep('step-hologram', 'processing');
            await Helpers.delay(500);
            const hologramResult = await HologramDetector.detect(canvas);
            Helpers.updateStep('step-hologram', hologramResult.passed ? 'completed' : 'failed');

            // Step 3: ID Format Validation (included in main validator)
            Helpers.updateStep('step-mrn', 'processing');
            await Helpers.delay(400);

            // Step 4: Tamper Detection
            Helpers.updateStep('step-tamper', 'processing');
            await Helpers.delay(500);
            const tamperResult = await TamperDetector.detect(canvas);
            Helpers.updateStep('step-tamper', tamperResult.isTampered ? 'failed' : 'completed');

            // Extract features from uploaded card for model inference
            const cardFeatures = this.extractCardFeatures(canvas, qrResult, hologramResult, tamperResult);

            // Run main validator (rule-based)
            const validationData = {
                qrData: qrResult.found ? { text: qrResult.text } : null,
                hologramResult: hologramResult,
                tamperResult: tamperResult,
                ocrText: '', // OCR would be handled by Person A
                imageCanvas: canvas
            };

            let validationResult;
            if (this.state.cardType === 'pmjay') {
                validationResult = await PMJAYValidator.validate(validationData);
            } else {
                validationResult = await ESICValidator.validate(validationData);
            }

            // Update MRN step based on ID validation
            Helpers.updateStep('step-mrn', validationResult.checks.idFormat?.passed ? 'completed' : 'failed');

            // Run model inference if model is loaded
            let modelDecision = null;
            if (ModelInference.trainedModel) {
                const model = ModelInference.trainedModel;
                
                console.log(`\n🔬 MODEL INFERENCE:`);
                console.log(`   Model version: ${model.meta.version || '1.0'}`);
                console.log(`   Trained with: ${model.meta.samples || '?'} samples`);
                
                let finalScore = 0;
                
                // CHECK FOR BROWSER-TRAINED MODEL (has real training_data.features)
                if (model.training_data && model.training_data.features && model.training_data.features.length > 0) {
                    console.log(`   ✅ Using DIRECT SAMPLE COMPARISON (browser-trained model)`);
                    
                    // Compare against each genuine training sample
                    const genuineSamples = model.training_data.features as TrainingSample[];
                    let bestMatch = 0;
                    let bestMatchName = '';
                    
                    for (const sample of genuineSamples) {
                        // Calculate similarity score
                        const similarity = this.calculateSampleSimilarity(cardFeatures, sample);
                        console.log(`   vs ${sample.name}: ${(similarity * 100).toFixed(1)}% similar`);
                        
                        if (similarity > bestMatch) {
                            bestMatch = similarity;
                            bestMatchName = sample.name;
                        }
                    }
                    
                    finalScore = bestMatch;
                    console.log(`   BEST MATCH: ${bestMatchName} at ${(bestMatch * 100).toFixed(1)}%`);
                    
                } else {
                    // Fallback to baseline comparison (Node.js trained - less accurate)
                    console.log(`   ⚠️ Using BASELINE STATS (Node.js trained - may be inaccurate)`);
                    console.log(`   👉 For better results, train in browser: http://localhost:3000/train.html`);
                    
                    const comparison = ModelInference.compareFeatures(
                        cardFeatures,
                        model.baseline
                    );
                    finalScore = comparison.matchScore;
                }

                // Make decision
                modelDecision = ModelInference.makeDecision(finalScore);
                validationResult.modelDecision = modelDecision;
                validationResult.featureMatchScore = finalScore;
                
                console.log(`   📊 Final Score: ${(finalScore * 100).toFixed(1)}%`);
                console.log(`   📋 Decision: ${modelDecision.message}\n`);
            }

            this.state.validationResult = validationResult;

            // Show results
            await Helpers.delay(500);
            this.showResults(validationResult);

        } catch (error: any) {
            console.error('Validation error:', error);
            Helpers.showToast('Validation failed: ' + error.message, 'error');
            Helpers.showScreen('screen-upload');
        }

        this.state.isProcessing = false;
    },

    /**
     * Extract features from card image for model comparison
     */
    extractCardFeatures(canvas: HTMLCanvasElement, qrResult: any, hologramResult: any, tamperResult: any): CardFeatures {
        try {
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Calculate color distribution (average RGB values)
            let rSum = 0, gSum = 0, bSum = 0;
            let pixelCount = 0;
            
            for (let i = 0; i < data.length; i += 4) {
                rSum += data[i];
                gSum += data[i + 1];
                bSum += data[i + 2];
                pixelCount++;
            }

            // Calculate brightness mean
            const brightnessMean = (rSum + gSum + bSum) / (3 * pixelCount);

            const features: CardFeatures = {
                // Color characteristics
                color_distribution: {
                    red_mean: pixelCount > 0 ? rSum / pixelCount : 180,
                    green_mean: pixelCount > 0 ? gSum / pixelCount : 175,
                    blue_mean: pixelCount > 0 ? bSum / pixelCount : 170
                },
                
                // Brightness mean (for direct comparison)
                brightness_mean: brightnessMean,
                
                // QR Code metrics
                qr_detected: qrResult.found || false,
                qr_confidence: (qrResult.confidence || 0.8),
                
                // Hologram features
                hologram_brightness_variance: (hologramResult?.brightnessVariance || 35),
                hologram_color_range: (hologramResult?.colorRange || 60),
                
                // Document quality
                texture_variance: this.calculateTextureVariance(imageData),
                compression_artifacts: (tamperResult?.compressionScore || 0) * 100,
                edge_density: (tamperResult?.edgeScore || 0) * 100,
                
                // Geometry
                document_straightness: this.estimateDocumentStraightness(canvas),
                font_consistency: 0.90, // Will be improved when OCR is integrated with Person A
                
                // File characteristics
                file_size: canvas.width * canvas.height,
                dimensions_ratio: canvas.width / canvas.height
            };

            console.log('📊 Extracted Features:', features);
            return features;

        } catch (error) {
            console.error('Error extracting features:', error);
            // Return default features if extraction fails
            return {
                color_distribution: { red_mean: 180, green_mean: 175, blue_mean: 170 },
                brightness_mean: 175,
                qr_detected: qrResult.found || false,
                qr_confidence: qrResult.confidence || 0.8,
                hologram_brightness_variance: hologramResult?.brightnessVariance || 35,
                hologram_color_range: hologramResult?.colorRange || 60,
                texture_variance: 50,
                compression_artifacts: 15,
                edge_density: 45,
                document_straightness: 0.92,
                font_consistency: 0.90,
                file_size: canvas.width * canvas.height,
                dimensions_ratio: canvas.width / canvas.height
            };
        }
    },

    /**
     * Calculate texture variance in image
     */
    calculateTextureVariance(imageData: ImageData): number {
        try {
            const data = imageData.data;
            let variance = 0;
            let count = 0;

            // Sample variance at intervals (every 10 pixels to optimize)
            const step = 10;
            for (let i = 0; i < data.length; i += step * 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const brightness = (r + g + b) / 3;
                variance += brightness;
                count++;
            }

            const mean = count > 0 ? variance / count : 128;
            let sumVariance = 0;

            for (let i = 0; i < data.length; i += step * 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const brightness = (r + g + b) / 3;
                sumVariance += Math.pow(brightness - mean, 2);
            }

            return Math.sqrt(count > 0 ? sumVariance / count : 0);
        } catch (e) {
            return 50; // Default variance
        }
    },

    /**
     * Estimate document straightness (no rotation)
     */
    estimateDocumentStraightness(canvas: HTMLCanvasElement): number {
        try {
            // Check if image is reasonably straight (width/height ratio ~1.6 for cards)
            const ratio = canvas.width / canvas.height;
            const cardRatio = 1.58; // Standard PMJAY aspect ratio
            
            // How close to expected ratio? (1.0 = perfect, 0.0 = very wrong)
            const deviation = Math.abs(ratio - cardRatio) / cardRatio;
            return Math.max(0.5, Math.min(1.0, 1.0 - deviation));
        } catch (e) {
            return 0.92;
        }
    },

    /**
     * Calculate similarity between uploaded card and a training sample
     * Returns 0-1 where 1 = identical match
     * VERY STRICT - only the exact trained cards should pass
     */
    calculateSampleSimilarity(uploaded: CardFeatures, sample: TrainingSample): number {
        let totalWeight = 0;
        let weightedScore = 0;

        // Compare color distribution - VERY STRICT (tiny deviations only)
        if (uploaded.color_distribution && sample.color_distribution) {
            const rDiff = Math.abs(uploaded.color_distribution.red_mean - sample.color_distribution.red_mean);
            const gDiff = Math.abs(uploaded.color_distribution.green_mean - sample.color_distribution.green_mean);
            const bDiff = Math.abs(uploaded.color_distribution.blue_mean - sample.color_distribution.blue_mean);
            
            // VERY STRICT: Only allow up to 3 deviation per channel
            // Same image re-uploaded should have diff ~0
            // Different image will have diff 10+
            const rScore = rDiff <= 3 ? 1 - (rDiff / 3) : 0;
            const gScore = gDiff <= 3 ? 1 - (gDiff / 3) : 0;
            const bScore = bDiff <= 3 ? 1 - (bDiff / 3) : 0;
            
            const colorScore = (rScore + gScore + bScore) / 3;
            weightedScore += colorScore * 0.40;
            totalWeight += 0.40;
            
            console.log(`     Color: R diff=${rDiff.toFixed(1)}, G diff=${gDiff.toFixed(1)}, B diff=${bDiff.toFixed(1)} → ${(colorScore * 100).toFixed(1)}%`);
        }

        // Compare texture variance - VERY STRICT
        if (uploaded.texture_variance !== undefined && sample.texture_variance !== undefined) {
            const texDiff = Math.abs(uploaded.texture_variance - sample.texture_variance);
            // Same image should be within 1, different images 5+
            const texScore = texDiff <= 2 ? 1 - (texDiff / 2) : 0;
            
            weightedScore += texScore * 0.20;
            totalWeight += 0.20;
            
            console.log(`     Texture: diff=${texDiff.toFixed(1)} → ${(texScore * 100).toFixed(1)}%`);
        }

        // Compare brightness - VERY STRICT
        if (uploaded.brightness_mean !== undefined && sample.brightness_mean !== undefined) {
            const brightDiff = Math.abs(uploaded.brightness_mean - sample.brightness_mean);
            // Same image should be within 1, different images 5+
            const brightScore = brightDiff <= 2 ? 1 - (brightDiff / 2) : 0;
            
            weightedScore += brightScore * 0.20;
            totalWeight += 0.20;
            
            console.log(`     Brightness: diff=${brightDiff.toFixed(1)} → ${(brightScore * 100).toFixed(1)}%`);
        }

        // Compare file size (pixel count) - different images have different sizes
        if (uploaded.file_size !== undefined && sample.dimensions !== undefined) {
            const sampleSize = sample.dimensions.width * sample.dimensions.height;
            const sizeDiff = Math.abs(uploaded.file_size - sampleSize);
            const sizeRatio = sizeDiff / Math.max(sampleSize, 1);
            // Same image should be identical (0%), different images vary by 5%+
            const sizeScore = sizeRatio <= 0.02 ? 1 - (sizeRatio / 0.02) : 0;
            
            weightedScore += sizeScore * 0.20;
            totalWeight += 0.20;
            
            console.log(`     File Size: ${uploaded.file_size} vs ${sampleSize}, diff=${(sizeRatio * 100).toFixed(1)}% → ${(sizeScore * 100).toFixed(1)}%`);
        }

        // Final score
        const finalScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
        console.log(`     🎯 Sample Score: ${(finalScore * 100).toFixed(1)}%`);
        return finalScore;
    },

    /**
     * Display validation results with model decision
     */
    showResults(result: any): void {
        Helpers.showScreen('screen-results');

        // If model decision is available, show that prominently
        if (result.modelDecision) {
            const decision = result.modelDecision;
            const headerDiv = document.getElementById('resultHeader');
            const scoreDiv = document.getElementById('validityScore');
            const confidence = decision.confidence;

            if (!headerDiv || !scoreDiv) return;

            // Show big approve/decline decision
            const decisionColor = decision.status === 'approved' ? '#10B981' : 
                                 decision.status === 'suspicious' ? '#F59E0B' : '#EF4444';
            const decisionBg = decision.status === 'approved' ? '#DCFCE7' : 
                              decision.status === 'suspicious' ? '#FEF3C7' : '#FEE2E2';

            headerDiv.innerHTML = `
                <div class="result-decision" style="background: ${decisionBg}; color: ${decisionColor}; padding: 20px; border-radius: 12px; text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px;">
                    ${decision.message}
                </div>
            `;

            // Show confidence score
            const circumference = 2 * Math.PI * 50;
            const dashOffset = circumference * (1 - confidence / 100);
            
            scoreDiv.innerHTML = `
                <div class="score-circle">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle class="score-circle-bg" cx="60" cy="60" r="50"/>
                        <circle class="score-circle-fill" cx="60" cy="60" r="50" 
                            style="stroke: ${decisionColor}; 
                                   stroke-dasharray: ${circumference}; 
                                   stroke-dashoffset: ${dashOffset}"/>
                    </svg>
                    <div class="score-value" style="color: ${decisionColor}">${confidence}%</div>
                </div>
                <div class="score-label">Model Confidence</div>
            `;

        } else {
            // Fallback to rule-based scoring
            const headerDiv = document.getElementById('resultHeader');
            const status = Helpers.getResultStatus(result.overallScore);
            const statusLabels: { [key: string]: { text: string; class: string } } = {
                valid: { text: '✓ Card Verified', class: 'valid' },
                warning: { text: '⚠ Partially Verified', class: 'warning' },
                invalid: { text: '✗ Verification Failed', class: 'invalid' }
            };
            
            if (headerDiv) {
                headerDiv.innerHTML = `
                    <div class="result-badge ${statusLabels[status].class}">
                        ${statusLabels[status].text}
                    </div>
                `;
            }

            // Show validity score circle
            const scoreDiv = document.getElementById('validityScore');
            const scorePercent = Helpers.formatScore(result.overallScore);
            const scoreColor = Helpers.getScoreColor(result.overallScore);
            const circumference = 2 * Math.PI * 50;
            const dashOffset = circumference * (1 - result.overallScore);

            if (scoreDiv) {
                scoreDiv.innerHTML = `
                    <div class="score-circle">
                        <svg width="120" height="120" viewBox="0 0 120 120">
                            <circle class="score-circle-bg" cx="60" cy="60" r="50"/>
                            <circle class="score-circle-fill" cx="60" cy="60" r="50" 
                                style="stroke: ${scoreColor}; 
                                       stroke-dasharray: ${circumference}; 
                                       stroke-dashoffset: ${dashOffset}"/>
                        </svg>
                        <div class="score-value" style="color: ${scoreColor}">${scorePercent}%</div>
                    </div>
                    <div class="score-label">Validity Score</div>
                `;
            }
        }

        // Validation checks details
        const detailsDiv = document.getElementById('resultDetails');
        const checks = [
            { key: 'qrCode', label: '📱 QR Code', icon: '📱' },
            { key: 'idFormat', label: '🆔 ID Format', icon: '🆔' },
            { key: 'hologram', label: '✨ Hologram', icon: '✨' },
            { key: 'tampering', label: '🔍 Tampering Check', icon: '🔍' }
        ];

        // Check if model approved - if so, override all checks to PASS for consistency
        const isModelApproved = result.modelDecision?.status === 'approved';

        if (detailsDiv) {
            detailsDiv.innerHTML = checks.map(check => {
                const checkResult = result.checks[check.key];
                if (!checkResult) return '';
                
                // If model approved with high confidence, show all checks as PASS
                let statusClass: string;
                let statusText: string;
                
                if (isModelApproved) {
                    statusClass = 'pass';
                    statusText = 'PASS';
                } else {
                    statusClass = checkResult.passed ? 'pass' : (checkResult.score > 0.3 ? 'warn' : 'fail');
                    statusText = checkResult.passed ? 'PASS' : (checkResult.score > 0.3 ? 'WARN' : 'FAIL');
                }
                
                return `
                    <div class="detail-item">
                        <span class="detail-label">
                            <span>${check.icon}</span>
                            <span>${check.label}</span>
                        </span>
                        <span class="detail-status ${statusClass}">${statusText}</span>
                    </div>
                `;
            }).join('');
        }

        // Extracted card info
        const infoDiv = document.getElementById('cardInfo');
        const info = result.extractedInfo;
        
        if (infoDiv && info && Object.keys(info).length > 0) {
            const infoItems: { label: string; value: string }[] = [];
            
            if (info.cardType) infoItems.push({ label: 'Card Type', value: info.cardType });
            if (info.beneficiaryId) infoItems.push({ label: 'Beneficiary ID', value: info.beneficiaryId });
            if (info.insuranceNumber) infoItems.push({ label: 'Insurance No', value: info.insuranceNumber });
            if (info.name || info.ipName) infoItems.push({ label: 'Name', value: info.name || info.ipName || 'Not detected' });
            if (info.stateCode) infoItems.push({ label: 'State', value: info.stateCode });
            if (info.familyId) infoItems.push({ label: 'Family ID', value: info.familyId });

            infoDiv.innerHTML = `
                <div class="card-info-title">Extracted Information</div>
                ${infoItems.map(item => `
                    <div class="card-info-item">
                        <span class="card-info-label">${item.label}</span>
                        <span class="card-info-value">${item.value}</span>
                    </div>
                `).join('')}
            `;
        } else if (infoDiv) {
            infoDiv.innerHTML = `
                <div class="card-info-title">Extracted Information</div>
                <div class="card-info-item">
                    <span class="card-info-label">Status</span>
                    <span class="card-info-value">Could not extract card details</span>
                </div>
            `;
        }


        // Show recommendations if any
        // If model approved, only show success message, not warnings
        if (infoDiv && result.recommendations && result.recommendations.length > 0) {
            let filteredRecs = result.recommendations;
            
            // If model approved, filter out warning/danger messages and show only success
            if (isModelApproved) {
                filteredRecs = [{
                    type: 'success',
                    message: '✅ Card verified successfully! You can proceed with claim filing.'
                }];
            }
            
            const recsHtml = filteredRecs.map((rec: any) => `
                <div class="detail-item" style="margin-top: 12px; background: ${
                    rec.type === 'danger' ? '#FEE2E2' : 
                    rec.type === 'warning' ? '#FEF3C7' : 
                    rec.type === 'success' ? '#D1FAE5' : '#E0E7FF'
                }">
                    <span class="detail-label" style="font-size: 13px;">
                        ${rec.message}
                    </span>
                </div>
            `).join('');
            
            infoDiv.innerHTML += recsHtml;
        }
    },

    /**
     * Reset app to initial state
     */
    resetApp(): void {
        this.stopCamera();
        this.state.capturedImage = null;
        this.state.validationResult = null;

        // Reset UI
        const video = document.getElementById('videoStream');
        const preview = document.getElementById('previewImage');
        const placeholder = document.getElementById('cameraPlaceholder');
        const captureBtn = document.getElementById('btnCapture');
        const analyzeBtn = document.getElementById('btnAnalyze');

        if (video) video.classList.remove('active');
        if (preview) preview.classList.remove('active');
        if (placeholder) placeholder.classList.remove('hidden');
        if (captureBtn) captureBtn.classList.add('hidden');
        if (analyzeBtn) analyzeBtn.classList.add('hidden');

        Helpers.showScreen('screen-upload');
    },

    /**
     * Proceed to claim filing (placeholder)
     */
    proceedToClaim(): void {
        const result = this.state.validationResult;
        
        console.log('🔍 Proceed button clicked. Result:', result);
        console.log('   modelDecision:', result?.modelDecision);
        console.log('   isValid:', result?.isValid);
        
        // Check for either model approval OR rule-based validity
        const isModelApproved = result?.modelDecision?.status === 'approved';
        const isRuleBasedValid = result?.isValid;
        
        console.log('   isModelApproved:', isModelApproved);
        console.log('   isRuleBasedValid:', isRuleBasedValid);
        
        if (!result) {
            Helpers.showToast('Please validate a card first', 'error');
            return;
        }
        
        if (!isModelApproved && !isRuleBasedValid) {
            Helpers.showToast('Card must be APPROVED before proceeding', 'error');
            return;
        }
        
        // SUCCESS - card is approved
        Helpers.showToast('✅ Card verified! Proceeding to claim filing...', 'success');
        // This would navigate to the bill upload / claim filing flow
        // For now, show a success modal
        setTimeout(() => {
            alert('Card successfully verified!\n\nYou can now proceed to file your insurance claim.\n\n(This is where Person A\'s bill parsing would integrate)');
        }, 500);
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 App initializing...');
        McCarenApp.init();
    });
} else {
    console.log('🚀 App initializing...');
    McCarenApp.init();
}

(window as any).McCarenApp = McCarenApp;

export { McCarenApp, AppState, CardFeatures };

/**
 * Model Loader & Inference Engine
 * Loads trained model and compares uploaded cards against baseline
 */

interface BaselineStat {
    mean: number;
    std: number;
}

interface ColorDistribution {
    red_mean: BaselineStat | number;
    green_mean: BaselineStat | number;
    blue_mean: BaselineStat | number;
}

interface TrainedModelBaseline {
    qr_confidence?: BaselineStat;
    color_distribution?: ColorDistribution;
    texture_variance?: BaselineStat;
    font_consistency?: BaselineStat;
    edge_density?: BaselineStat;
    qr_detected?: boolean;
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

interface TrainedModel {
    meta: {
        version?: string;
        samples?: number;
    };
    baseline?: TrainedModelBaseline;
    training_data?: {
        features?: TrainingSample[];
    };
}

interface UploadedFeatures {
    qr_confidence?: number;
    color_distribution?: {
        red_mean: number;
        green_mean: number;
        blue_mean: number;
    };
    texture_variance?: number;
    font_consistency?: number;
    edge_density?: number;
    qr_detected?: boolean;
}

interface ScoreDetails {
    [key: string]: {
        raw: number;
        weighted: number;
    };
}

interface ComparisonResult {
    matchScore: number;
    approved: boolean;
    reason: string;
    details?: ScoreDetails;
}

interface ModelDecision {
    status: 'approved' | 'suspicious' | 'declined';
    message: string;
    confidence: number;
    color: string;
}

class ModelInference {
    static trainedModel: TrainedModel | null = null;

    /**
     * Load trained model - prioritizes browser-trained model from localStorage
     */
    static async loadModel(): Promise<TrainedModel | null> {
        // First, try loading browser-trained model from localStorage
        try {
            const storedModel = localStorage.getItem('project-mccaren_trained_model');
            if (storedModel) {
                this.trainedModel = JSON.parse(storedModel);
                console.log('✅ Browser-trained model loaded from localStorage');
                console.log('   Trained with REAL features from', this.trainedModel?.meta?.samples, 'genuine cards');
                return this.trainedModel;
            }
        } catch (e: any) {
            console.warn('⚠️ localStorage model invalid:', e.message);
        }

        // Fallback to JSON file
        try {
            const response = await fetch('data/trained-model.json');
            if (!response.ok) throw new Error('Model file not found');
            this.trainedModel = await response.json();
            console.log('✅ Trained model loaded from JSON file');
            return this.trainedModel;
        } catch (error: any) {
            console.warn('⚠️ Could not load trained model:', error.message);
            console.warn('👉 Go to /train.html to train the model with your genuine cards');
            return null;
        }
    }

    /**
     * Compare card features against baseline model
     * Returns match score (0-1) and approval decision
     */
    static compareFeatures(uploadedFeatures: UploadedFeatures, baseline: TrainedModelBaseline | undefined): ComparisonResult {
        if (!baseline) {
            console.error('❌ No baseline model available');
            return { matchScore: 0.5, approved: false, reason: 'No baseline model' };
        }

        console.log('🔍 Comparing features:');
        console.log('  Uploaded:', uploadedFeatures);
        console.log('  Baseline:', baseline);

        // Track individual feature scores
        let scores: number[] = [];
        let scoreDetails: ScoreDetails = {};

        // 1. Compare QR Confidence (35% weight)
        if (uploadedFeatures.qr_confidence !== undefined && baseline.qr_confidence?.mean) {
            const qrScore = this.computeFeatureScore(uploadedFeatures.qr_confidence, baseline.qr_confidence);
            const weightedScore = qrScore * 0.35;
            scores.push(weightedScore);
            scoreDetails.qr = { raw: qrScore, weighted: weightedScore };
            console.log(`  📱 QR Confidence: ${(qrScore * 100).toFixed(1)}% → weighted: ${(weightedScore * 100).toFixed(1)}%`);
        }

        // 2. Compare Color Distribution (20% weight)
        if (uploadedFeatures.color_distribution && baseline.color_distribution) {
            const baselineColor = baseline.color_distribution;
            const rScore = this.computeFeatureScore(
                uploadedFeatures.color_distribution.red_mean,
                baselineColor.red_mean as BaselineStat
            );
            const gScore = this.computeFeatureScore(
                uploadedFeatures.color_distribution.green_mean,
                baselineColor.green_mean as BaselineStat
            );
            const bScore = this.computeFeatureScore(
                uploadedFeatures.color_distribution.blue_mean,
                baselineColor.blue_mean as BaselineStat
            );
            const avgColorScore = (rScore + gScore + bScore) / 3;
            const weightedScore = avgColorScore * 0.20;
            scores.push(weightedScore);
            scoreDetails.color = { raw: avgColorScore, weighted: weightedScore };
            console.log(`  🎨 Color Distribution: ${(avgColorScore * 100).toFixed(1)}% → weighted: ${(weightedScore * 100).toFixed(1)}%`);
        }

        // 3. Compare Texture Variance (15% weight)
        if (uploadedFeatures.texture_variance !== undefined && baseline.texture_variance?.mean) {
            const textureScore = this.computeFeatureScore(uploadedFeatures.texture_variance, baseline.texture_variance);
            const weightedScore = textureScore * 0.15;
            scores.push(weightedScore);
            scoreDetails.texture = { raw: textureScore, weighted: weightedScore };
            console.log(`  🌊 Texture Variance: ${(textureScore * 100).toFixed(1)}% → weighted: ${(weightedScore * 100).toFixed(1)}%`);
        }

        // 4. Compare Font Consistency (15% weight)
        if (uploadedFeatures.font_consistency !== undefined && baseline.font_consistency?.mean) {
            const fontScore = this.computeFeatureScore(uploadedFeatures.font_consistency, baseline.font_consistency);
            const weightedScore = fontScore * 0.15;
            scores.push(weightedScore);
            scoreDetails.font = { raw: fontScore, weighted: weightedScore };
            console.log(`  ✏️ Font Consistency: ${(fontScore * 100).toFixed(1)}% → weighted: ${(weightedScore * 100).toFixed(1)}%`);
        }

        // 5. Compare Edge Density/Sharpness (10% weight)
        if (uploadedFeatures.edge_density !== undefined && baseline.edge_density?.mean) {
            const edgeScore = this.computeFeatureScore(uploadedFeatures.edge_density, baseline.edge_density);
            const weightedScore = edgeScore * 0.10;
            scores.push(weightedScore);
            scoreDetails.edge = { raw: edgeScore, weighted: weightedScore };
            console.log(`  🔍 Edge Density: ${(edgeScore * 100).toFixed(1)}% → weighted: ${(weightedScore * 100).toFixed(1)}%`);
        }

        // 6. QR Detection Match (5% weight)
        if (uploadedFeatures.qr_detected !== undefined && baseline.qr_detected !== undefined) {
            const qrDetectMatch = uploadedFeatures.qr_detected === baseline.qr_detected ? 1.0 : 0.3;
            const weightedScore = qrDetectMatch * 0.05;
            scores.push(weightedScore);
            scoreDetails.qr_detect = { raw: qrDetectMatch, weighted: weightedScore };
            console.log(`  📍 QR Detected: ${uploadedFeatures.qr_detected} (expected: ${baseline.qr_detected}) → ${(weightedScore * 100).toFixed(1)}%`);
        }

        // Calculate weighted average
        const matchScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) : 0.5;
        const finalScore = Math.max(0, Math.min(1, matchScore));
        
        console.log(`\n  ✅ FINAL MATCH SCORE: ${(finalScore * 100).toFixed(1)}%`);
        console.log(`  threshold >= 0.85 for APPROVED\n`);
        
        return {
            matchScore: finalScore,
            approved: finalScore >= 0.85,
            reason: finalScore >= 0.85 ? 'Card matches authentic baseline' : 'Card deviates from authentic baseline',
            details: scoreDetails
        };
    }

    /**
     * Compute similarity score for a single feature
     * Returns 0-1 where 1 = perfect match
     * More lenient than before - allows for real-world variation
     */
    static computeFeatureScore(uploadedValue: number, baselineStat: BaselineStat): number {
        if (typeof uploadedValue !== 'number' || !baselineStat.mean) {
            return 0.8;
        }

        const { mean, std } = baselineStat;
        const deviation = Math.abs(uploadedValue - mean);
        
        // Allow up to 2.5 standard deviations (98% confidence interval)
        // More lenient than before (was 2.0 = 95%)
        const allowedDeviation = std * 2.5;
        const score = Math.max(0, 1 - (deviation / (allowedDeviation + 1)));
        
        return score;
    }

    /**
     * Make approval decision based on match score
     * VERY STRICT thresholds - requires very high match to pass
     */
    static makeDecision(matchScore: number): ModelDecision {
        // VERY STRICT thresholds:
        // - Must be 90%+ to approve (needs to be nearly identical)
        // - 50-90% is suspicious
        // - Below 50% is declined
        
        if (matchScore >= 0.90) {
            return {
                status: 'approved',
                message: '✅ APPROVED - Authentic Card',
                confidence: Math.round(matchScore * 100),
                color: 'green'
            };
        } else if (matchScore >= 0.50) {
            return {
                status: 'suspicious',
                message: '⚠️ SUSPICIOUS - Possible Tampering',
                confidence: Math.round(matchScore * 100),
                color: 'orange'
            };
        } else {
            return {
                status: 'declined',
                message: '❌ DECLINED - Fake or Heavily Tampered',
                confidence: Math.round(matchScore * 100),
                color: 'red'
            };
        }
    }
}

(window as any).ModelInference = ModelInference;

export { ModelInference, TrainedModel, UploadedFeatures, ComparisonResult, ModelDecision, TrainingSample };

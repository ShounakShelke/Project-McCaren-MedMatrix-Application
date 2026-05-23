/**
 * Project McCaren - Tamper Detection Module
 * Detects signs of document tampering using image analysis
 */

const TamperDetector = {
    /**
     * Main tamper detection function
     * @param source - Image source
     * @returns Tampering analysis result
     */
    async detect(source) {
        const result = {
            isTampered: false,
            score: 1.0, // 1 = clean, 0 = definitely tampered
            flags: [],
            checks: {
                fontConsistency: { passed: true, score: 1, details: null },
                edgeArtifacts: { passed: true, score: 1, details: null },
                noisePattern: { passed: true, score: 1, details: null },
                colorConsistency: { passed: true, score: 1, details: null },
                compressionArtifacts: { passed: true, score: 1, details: null }
            },
            regions: []
        };

        try {
            let canvas;
            if (typeof source === 'string') {
                const img = await Helpers.loadImage(source);
                canvas = document.createElement('canvas');
                Helpers.drawToCanvas(canvas, img);
            } else if (source instanceof HTMLCanvasElement) {
                canvas = source;
            } else {
                canvas = document.createElement('canvas');
                Helpers.drawToCanvas(canvas, source);
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Run all tampering checks
            result.checks.edgeArtifacts = this.detectEdgeArtifacts(imageData);
            result.checks.noisePattern = this.analyzeNoisePattern(imageData);
            result.checks.colorConsistency = this.checkColorConsistency(imageData);
            result.checks.compressionArtifacts = this.detectCompressionArtifacts(imageData);

            // Collect flags from failed checks
            Object.keys(result.checks).forEach(check => {
                if (!result.checks[check].passed) {
                    result.flags.push(`${check}: ${result.checks[check].details || 'anomaly detected'}`);
                }
            });

            // Calculate overall tampering score
            const scores = Object.values(result.checks).map(c => c.score);
            result.score = scores.reduce((a, b) => a + b, 0) / scores.length;
            result.isTampered = result.score < 0.6;

            // Collect suspicious regions
            Object.values(result.checks).forEach(check => {
                if (check.regions) {
                    result.regions.push(...check.regions);
                }
            });

        } catch (error) {
            result.flags.push('Analysis error: ' + error.message);
            console.error('Tamper Detection Error:', error);
        }

        return result;
    },

    /**
     * Detect edge artifacts (copy-paste indicators)
     * Sharp edges where they shouldn't be = potential photoshop
     */
    detectEdgeArtifacts(imageData) {
        const { data, width, height } = imageData;
        const result = { passed: true, score: 1, details: null, regions: [] };

        // Sobel edge detection
        const edges = new Float32Array(width * height);
        const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let gx = 0, gy = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const i = ((y + ky) * width + (x + kx)) * 4;
                        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        const ki = (ky + 1) * 3 + (kx + 1);
                        gx += gray * sobelX[ki];
                        gy += gray * sobelY[ki];
                    }
                }
                
                edges[y * width + x] = Math.sqrt(gx * gx + gy * gy);
            }
        }

        // Find unusually sharp rectangular edges (copy-paste artifacts)
        const gridSize = 50;
        const suspiciousRegions = [];

        for (let gy = 0; gy < height - gridSize; gy += gridSize / 2) {
            for (let gx = 0; gx < width - gridSize; gx += gridSize / 2) {
                // Check for rectangular edge patterns
                const edgeProfile = this.analyzeEdgeProfile(edges, gx, gy, gridSize, width);
                
                if (edgeProfile.hasRectangularPattern) {
                    suspiciousRegions.push({
                        x: gx,
                        y: gy,
                        width: gridSize,
                        height: gridSize,
                        type: 'sharp_edge',
                        confidence: edgeProfile.confidence
                    });
                }
            }
        }

        if (suspiciousRegions.length > 2) {
            result.passed = false;
            result.score = Math.max(0.3, 1 - suspiciousRegions.length * 0.15);
            result.details = `${suspiciousRegions.length} suspicious edge regions found`;
            result.regions = suspiciousRegions;
        }

        return result;
    },

    /**
     * Analyze edge profile for rectangular patterns
     */
    analyzeEdgeProfile(edges, x, y, size, width) {
        const result = { hasRectangularPattern: false, confidence: 0 };
        
        // Sample edges along the border of the region
        const borderEdges = [];
        const threshold = 100;

        // Top and bottom edges
        for (let i = 0; i < size; i++) {
            const topIdx = y * width + x + i;
            const bottomIdx = (y + size - 1) * width + x + i;
            borderEdges.push(edges[topIdx] > threshold ? 1 : 0);
            borderEdges.push(edges[bottomIdx] > threshold ? 1 : 0);
        }

        // Count continuous edge segments
        let edgeRuns = 0;
        let currentRun = 0;
        
        for (let i = 0; i < borderEdges.length; i++) {
            if (borderEdges[i]) {
                currentRun++;
            } else {
                if (currentRun >= 10) edgeRuns++;
                currentRun = 0;
            }
        }

        // Rectangular pattern: multiple long edge runs
        if (edgeRuns >= 2) {
            result.hasRectangularPattern = true;
            result.confidence = Math.min(1, edgeRuns / 4);
        }

        return result;
    },

    /**
     * Analyze noise pattern consistency
     * Tampered areas often have different noise characteristics
     */
    analyzeNoisePattern(imageData) {
        const { data, width, height } = imageData;
        const result = { passed: true, score: 1, details: null, regions: [] };

        // Calculate local noise variance in grid cells
        const gridSize = 40;
        const variances = [];

        for (let gy = 0; gy < height - gridSize; gy += gridSize) {
            for (let gx = 0; gx < width - gridSize; gx += gridSize) {
                const pixels = [];
                
                for (let y = gy; y < gy + gridSize; y += 2) {
                    for (let x = gx; x < gx + gridSize; x += 2) {
                        const i = (y * width + x) * 4;
                        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        pixels.push(gray);
                    }
                }

                // Calculate variance
                const mean = pixels.reduce((a, b) => a + b, 0) / pixels.length;
                const variance = pixels.reduce((s, p) => s + (p - mean) ** 2, 0) / pixels.length;
                
                variances.push({
                    x: gx,
                    y: gy,
                    variance,
                    mean
                });
            }
        }

        // Find outlier regions (very different noise level)
        const allVariances = variances.map(v => v.variance);
        const medianVariance = this.median(allVariances);
        const varianceThreshold = medianVariance * 3;

        const outliers = variances.filter(v => 
            v.variance > varianceThreshold || 
            (v.variance < medianVariance / 3 && v.mean > 30 && v.mean < 220)
        );

        if (outliers.length > variances.length * 0.15) {
            result.passed = false;
            result.score = Math.max(0.4, 1 - outliers.length / variances.length);
            result.details = 'Inconsistent noise pattern detected';
            result.regions = outliers.map(o => ({
                x: o.x,
                y: o.y,
                width: gridSize,
                height: gridSize,
                type: 'noise_anomaly'
            }));
        }

        return result;
    },

    /**
     * Check color consistency across document
     * Tampered areas may have color shifts
     */
    checkColorConsistency(imageData) {
        const { data, width, height } = imageData;
        const result = { passed: true, score: 1, details: null, regions: [] };

        // Analyze color channels separately
        const gridSize = 60;
        const colorStats = [];

        for (let gy = 0; gy < height - gridSize; gy += gridSize) {
            for (let gx = 0; gx < width - gridSize; gx += gridSize) {
                const rValues = [], gValues = [], bValues = [];
                
                for (let y = gy; y < gy + gridSize; y += 3) {
                    for (let x = gx; x < gx + gridSize; x += 3) {
                        const i = (y * width + x) * 4;
                        rValues.push(data[i]);
                        gValues.push(data[i + 1]);
                        bValues.push(data[i + 2]);
                    }
                }

                // Calculate color channel ratios
                const rMean = rValues.reduce((a, b) => a + b, 0) / rValues.length;
                const gMean = gValues.reduce((a, b) => a + b, 0) / gValues.length;
                const bMean = bValues.reduce((a, b) => a + b, 0) / bValues.length;

                // Color cast/white balance
                const rgRatio = rMean / (gMean + 0.1);
                const rbRatio = rMean / (bMean + 0.1);

                colorStats.push({
                    x: gx,
                    y: gy,
                    rg: rgRatio,
                    rb: rbRatio,
                    brightness: (rMean + gMean + bMean) / 3
                });
            }
        }

        // Find color-shifted regions
        const allRG = colorStats.map(c => c.rg);
        const allRB = colorStats.map(c => c.rb);
        const medianRG = this.median(allRG);
        const medianRB = this.median(allRB);

        const colorOutliers = colorStats.filter(c => 
            Math.abs(c.rg - medianRG) > 0.3 || 
            Math.abs(c.rb - medianRB) > 0.3
        );

        if (colorOutliers.length > colorStats.length * 0.1) {
            result.passed = false;
            result.score = Math.max(0.5, 1 - colorOutliers.length / colorStats.length * 2);
            result.details = 'Color inconsistencies detected';
            result.regions = colorOutliers.map(c => ({
                x: c.x,
                y: c.y,
                width: gridSize,
                height: gridSize,
                type: 'color_shift'
            }));
        }

        return result;
    },

    /**
     * Detect JPEG compression artifacts (double compression = tampering)
     */
    detectCompressionArtifacts(imageData) {
        const { data, width, height } = imageData;
        const result = { passed: true, score: 1, details: null };

        // JPEG uses 8x8 blocks - look for blocking artifacts
        const blockSize = 8;
        let blockEdgeCount = 0;
        let totalEdges = 0;

        for (let y = blockSize; y < height - blockSize; y += blockSize) {
            for (let x = 0; x < width - 1; x++) {
                const i1 = (y * width + x) * 4;
                const i2 = ((y - 1) * width + x) * 4;
                
                const diff = Math.abs(
                    (data[i1] + data[i1 + 1] + data[i1 + 2]) / 3 -
                    (data[i2] + data[i2 + 1] + data[i2 + 2]) / 3
                );
                
                if (diff > 10) blockEdgeCount++;
                totalEdges++;
            }
        }

        // High edge count at block boundaries = heavy/double compression
        const blockEdgeRatio = blockEdgeCount / totalEdges;
        
        if (blockEdgeRatio > 0.3) {
            result.passed = false;
            result.score = Math.max(0.4, 1 - blockEdgeRatio);
            result.details = 'Compression artifacts suggest re-saved/edited image';
        }

        return result;
    },

    /**
     * Calculate median of array
     */
    median(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    },

    /**
     * Quick tampering check (faster, less accurate)
     */
    async quickCheck(source) {
        const result = await this.detect(source);
        return {
            likely_tampered: result.isTampered,
            confidence: 1 - result.score,
            top_flag: result.flags[0] || null
        };
    }
};

window.TamperDetector = TamperDetector;

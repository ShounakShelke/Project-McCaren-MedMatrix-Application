/**
 * Project McCaren - Hologram Detector
 * Detects security holograms on ID cards using image analysis
 */

declare const Helpers: any;

interface HologramRegion {
    x: number;
    y: number;
    width: number;
    height: number;
    intensity?: number;
    contrast?: number;
    silverRatio?: number;
}

interface HologramResult {
    passed: boolean;
    score: number;
    message: string;
    data: {
        hasBrightSpots: boolean;
        hasColorVariation: boolean;
        hasReflectiveArea: boolean;
        regions: HologramRegion[];
    };
}

interface BrightSpotAnalysis {
    found: boolean;
    regions: HologramRegion[];
    intensity: number;
}

interface ColorAnalysis {
    hasVariation: boolean;
    score: number;
    hueDistribution: { [key: number]: number };
}

interface ReflectiveAnalysis {
    found: boolean;
    regions: HologramRegion[];
}

interface HSL {
    h: number;
    s: number;
    l: number;
}

const HologramDetector = {
    /**
     * Detect hologram presence in card image
     * @param source - Image source
     * @returns Hologram detection result
     */
    async detect(source: HTMLCanvasElement | HTMLImageElement | string): Promise<HologramResult> {
        const result: HologramResult = {
            passed: false,
            score: 0,
            message: '',
            data: {
                hasBrightSpots: false,
                hasColorVariation: false,
                hasReflectiveArea: false,
                regions: []
            }
        };

        try {
            let canvas: HTMLCanvasElement;
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
            
            // Analyze for hologram characteristics
            const brightSpotAnalysis = this.detectBrightSpots(imageData);
            const colorAnalysis = this.analyzeColorVariation(imageData);
            const reflectiveAnalysis = this.detectReflectiveAreas(imageData);

            result.data.hasBrightSpots = brightSpotAnalysis.found;
            result.data.hasColorVariation = colorAnalysis.hasVariation;
            result.data.hasReflectiveArea = reflectiveAnalysis.found;
            result.data.regions = [
                ...brightSpotAnalysis.regions,
                ...reflectiveAnalysis.regions
            ];

            // Calculate hologram score
            let score = 0;
            if (brightSpotAnalysis.found) score += 0.35;
            if (colorAnalysis.hasVariation) score += 0.35;
            if (reflectiveAnalysis.found) score += 0.30;

            result.score = score;
            result.passed = score >= 0.5;

            if (result.passed) {
                result.message = 'Hologram/security feature detected';
            } else if (score > 0.2) {
                result.message = 'Partial security features found';
            } else {
                result.message = 'No hologram detected - verify card authenticity';
            }

        } catch (error: any) {
            result.message = 'Detection error: ' + error.message;
            console.error('Hologram Detection Error:', error);
        }

        return result;
    },

    /**
     * Detect unusually bright spots (hologram reflection)
     */
    detectBrightSpots(imageData: ImageData): BrightSpotAnalysis {
        const { data, width, height } = imageData;
        const result: BrightSpotAnalysis = { found: false, regions: [], intensity: 0 };
        
        const brightThreshold = 240; // Very bright pixels
        let brightCount = 0;
        const brightRegions: HologramRegion[] = [];

        // Grid-based analysis
        const gridSize = 20;
        for (let gy = 0; gy < height; gy += gridSize) {
            for (let gx = 0; gx < width; gx += gridSize) {
                let regionBright = 0;
                let regionTotal = 0;

                for (let y = gy; y < Math.min(gy + gridSize, height); y++) {
                    for (let x = gx; x < Math.min(gx + gridSize, width); x++) {
                        const i = (y * width + x) * 4;
                        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        
                        if (brightness > brightThreshold) {
                            regionBright++;
                            brightCount++;
                        }
                        regionTotal++;
                    }
                }

                // If region has clustered bright spots
                const brightRatio = regionBright / regionTotal;
                if (brightRatio > 0.1 && brightRatio < 0.5) {
                    brightRegions.push({
                        x: gx,
                        y: gy,
                        width: gridSize,
                        height: gridSize,
                        intensity: brightRatio
                    });
                }
            }
        }

        const totalPixels = width * height;
        const brightRatio = brightCount / totalPixels;

        // Hologram typically shows 1-5% very bright pixels in clustered regions
        result.found = brightRegions.length >= 2 && brightRatio > 0.005 && brightRatio < 0.15;
        result.regions = brightRegions.slice(0, 5);
        result.intensity = brightRatio;

        return result;
    },

    /**
     * Analyze color variation (hologram rainbow effect)
     */
    analyzeColorVariation(imageData: ImageData): ColorAnalysis {
        const { data, width, height } = imageData;
        const result: ColorAnalysis = { hasVariation: false, score: 0, hueDistribution: {} };

        // Sample pixels and calculate hue distribution
        const hues: number[] = [];
        const step = 4; // Sample every 4th pixel

        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                const i = (y * width + x) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Convert to HSL
                const { h, s, l } = this.rgbToHsl(r, g, b);

                // Only count saturated, non-dark, non-white pixels
                if (s > 0.2 && l > 0.2 && l < 0.8) {
                    const hueBucket = Math.floor(h / 30) * 30; // 30-degree buckets
                    hues.push(hueBucket);
                }
            }
        }

        // Count hue distribution
        const hueCounts: { [key: number]: number } = {};
        hues.forEach(h => {
            hueCounts[h] = (hueCounts[h] || 0) + 1;
        });

        result.hueDistribution = hueCounts;

        // Hologram shows multiple distinct hues (rainbow effect)
        const distinctHues = Object.keys(hueCounts).length;
        const hasMultipleHues = distinctHues >= 4;
        
        // Check for balanced distribution (not dominated by single color)
        const values = Object.values(hueCounts);
        const maxCount = Math.max(...values);
        const totalCount = values.reduce((a, b) => a + b, 0);
        const notDominated = maxCount / totalCount < 0.5;

        result.hasVariation = hasMultipleHues && notDominated;
        result.score = (distinctHues / 12) * (notDominated ? 1 : 0.5);

        return result;
    },

    /**
     * Detect reflective/metallic areas
     */
    detectReflectiveAreas(imageData: ImageData): ReflectiveAnalysis {
        const { data, width, height } = imageData;
        const result: ReflectiveAnalysis = { found: false, regions: [] };

        // Look for areas with high contrast and metallic color properties
        const gridSize = 30;
        
        for (let gy = 0; gy < height; gy += gridSize) {
            for (let gx = 0; gx < width; gx += gridSize) {
                let minBrightness = 255;
                let maxBrightness = 0;
                let silverCount = 0;
                let pixelCount = 0;

                for (let y = gy; y < Math.min(gy + gridSize, height); y++) {
                    for (let x = gx; x < Math.min(gx + gridSize, width); x++) {
                        const i = (y * width + x) * 4;
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        const brightness = (r + g + b) / 3;

                        minBrightness = Math.min(minBrightness, brightness);
                        maxBrightness = Math.max(maxBrightness, brightness);

                        // Silver/metallic: similar RGB values, medium-high brightness
                        const rgbDiff = Math.max(r, g, b) - Math.min(r, g, b);
                        if (rgbDiff < 30 && brightness > 150 && brightness < 230) {
                            silverCount++;
                        }
                        pixelCount++;
                    }
                }

                const contrast = maxBrightness - minBrightness;
                const silverRatio = silverCount / pixelCount;

                // High local contrast + silver appearance = reflective
                if (contrast > 100 && silverRatio > 0.3) {
                    result.regions.push({
                        x: gx,
                        y: gy,
                        width: gridSize,
                        height: gridSize,
                        contrast,
                        silverRatio
                    });
                }
            }
        }

        result.found = result.regions.length >= 1;
        return result;
    },

    /**
     * Convert RGB to HSL
     */
    rgbToHsl(r: number, g: number, b: number): HSL {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h: number = 0;
        let s: number = 0;
        const l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return { h: h * 360, s, l };
    }
};

(window as any).HologramDetector = HologramDetector;

export { HologramDetector, HologramResult, HologramRegion, BrightSpotAnalysis, ColorAnalysis, ReflectiveAnalysis, HSL };

/**
 * Project McCaren - QR Code Scanner
 * Uses ZXing library for QR code detection
 */

const QRScanner = {
    reader: null,
    
    /**
     * Initialize QR scanner
     */
    init() {
        if (typeof ZXing !== 'undefined') {
            this.reader = new ZXing.BrowserQRCodeReader();
        } else {
            console.warn('ZXing library not loaded, using fallback QR detection');
        }
    },

    /**
     * Scan QR code from image
     * @param source - Image source
     * @returns QR code data
     */
    async scan(source) {
        const result = {
            found: false,
            text: null,
            format: null,
            position: null,
            confidence: 0,
            error: null
        };

        try {
            // Convert source to canvas if needed
            let canvas;
            if (typeof source === 'string') {
                // Base64 or URL
                const img = await Helpers.loadImage(source);
                canvas = document.createElement('canvas');
                Helpers.drawToCanvas(canvas, img);
            } else if (source instanceof HTMLImageElement) {
                canvas = document.createElement('canvas');
                Helpers.drawToCanvas(canvas, source);
            } else if (source instanceof HTMLCanvasElement) {
                canvas = source;
            } else {
                throw new Error('Invalid image source');
            }

            // Try ZXing first
            if (this.reader) {
                try {
                    const zxingResult = await this.reader.decodeFromCanvas(canvas);
                    if (zxingResult) {
                        result.found = true;
                        result.text = zxingResult.getText();
                        result.format = zxingResult.getBarcodeFormat();
                        result.confidence = 0.95;
                        
                        // Get position if available
                        const points = zxingResult.getResultPoints();
                        if (points && points.length > 0) {
                            result.position = {
                                topLeft: { x: points[0].getX(), y: points[0].getY() },
                                topRight: points.length > 1 ? { x: points[1].getX(), y: points[1].getY() } : null,
                                bottomLeft: points.length > 2 ? { x: points[2].getX(), y: points[2].getY() } : null
                            };
                        }
                    }
                } catch (zxingError) {
                    console.log('ZXing scan failed, trying fallback:', zxingError.message);
                }
            }

            // Fallback: Manual QR detection using canvas analysis
            if (!result.found) {
                const fallbackResult = await this.fallbackScan(canvas);
                if (fallbackResult.found) {
                    Object.assign(result, fallbackResult);
                }
            }

        } catch (error) {
            result.error = error.message;
            console.error('QR Scan Error:', error);
        }

        return result;
    },

    /**
     * Fallback QR detection using pattern matching
     * Detects if QR code exists (not content decode)
     */
    async fallbackScan(canvas) {
        const result = {
            found: false,
            text: null,
            confidence: 0,
            position: null
        };

        const ctx = canvas.getContext('2d');
        if (!ctx) return result;
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert to grayscale and detect patterns
        const width = canvas.width;
        const height = canvas.height;
        const grayscale = new Uint8Array(width * height);

        for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
            grayscale[i / 4] = gray;
        }

        // Look for QR finder patterns (7x7 black-white-black pattern)
        const finderPatterns = this.detectFinderPatterns(grayscale, width, height);
        
        if (finderPatterns.length >= 3) {
            result.found = true;
            result.confidence = 0.7;
            result.position = {
                patterns: finderPatterns.slice(0, 3)
            };
            // Note: Cannot decode content without full QR library
            result.text = '[QR_DETECTED_NO_DECODE]';
        }

        return result;
    },

    /**
     * Detect QR finder patterns in grayscale image
     */
    detectFinderPatterns(grayscale, width, height) {
        const patterns = [];
        const threshold = 128;
        
        // Sample points looking for finder pattern signature
        // Finder pattern: 1:1:3:1:1 ratio black:white:black:white:black
        
        for (let y = 10; y < height - 10; y += 5) {
            let state = 0;
            let count = [0, 0, 0, 0, 0];
            
            for (let x = 0; x < width; x++) {
                const pixel = grayscale[y * width + x] < threshold ? 1 : 0;
                
                if (pixel === (state & 1)) {
                    count[state]++;
                } else {
                    if (state === 4) {
                        // Check if this is a valid finder pattern ratio
                        if (this.isFinderPattern(count)) {
                            const centerX = x - count[4] - count[3] - count[2] / 2;
                            patterns.push({ x: centerX, y: y });
                        }
                        // Shift counts
                        count[0] = count[2];
                        count[1] = count[3];
                        count[2] = count[4];
                        count[3] = 1;
                        count[4] = 0;
                        state = 3;
                    } else {
                        state++;
                        count[state] = 1;
                    }
                }
            }
        }

        // Cluster nearby patterns
        return this.clusterPatterns(patterns);
    },

    /**
     * Check if count array matches finder pattern ratio 1:1:3:1:1
     */
    isFinderPattern(count) {
        const total = count.reduce((a, b) => a + b, 0);
        if (total < 7) return false;
        
        const moduleSize = total / 7;
        const variance = moduleSize / 2;
        
        return Math.abs(count[0] - moduleSize) < variance &&
               Math.abs(count[1] - moduleSize) < variance &&
               Math.abs(count[2] - 3 * moduleSize) < variance * 3 &&
               Math.abs(count[3] - moduleSize) < variance &&
               Math.abs(count[4] - moduleSize) < variance;
    },

    /**
     * Cluster nearby pattern detections
     */
    clusterPatterns(patterns) {
        const clustered = [];
        const used = new Set();

        for (let i = 0; i < patterns.length; i++) {
            if (used.has(i)) continue;
            
            const cluster = [patterns[i]];
            used.add(i);

            for (let j = i + 1; j < patterns.length; j++) {
                if (used.has(j)) continue;
                
                const dist = Math.hypot(
                    patterns[i].x - patterns[j].x,
                    patterns[i].y - patterns[j].y
                );
                
                if (dist < 20) {
                    cluster.push(patterns[j]);
                    used.add(j);
                }
            }

            // Average cluster center
            const center = {
                x: cluster.reduce((s, p) => s + p.x, 0) / cluster.length,
                y: cluster.reduce((s, p) => s + p.y, 0) / cluster.length
            };
            clustered.push(center);
        }

        return clustered;
    },

    /**
     * Check if QR code contains PMJAY data
     */
    isPMJAYQR(qrText) {
        if (!qrText) return false;
        
        const pmjayIndicators = [
            'pmjay', 'ayushman', 'abha', 'nha.gov.in', 'beneficiary'
        ];
        
        const lowerText = qrText.toLowerCase();
        return pmjayIndicators.some(ind => lowerText.includes(ind));
    },

    /**
     * Parse PMJAY QR content
     */
    parsePMJAYQR(qrText) {
        try {
            // Try JSON first
            const json = JSON.parse(qrText);
            return {
                type: 'json',
                data: json
            };
        } catch {
            // Try pipe-separated
            if (qrText.includes('|')) {
                const parts = qrText.split('|');
                return {
                    type: 'pipe',
                    data: {
                        beneficiaryId: parts[0],
                        name: parts[1],
                        familyId: parts[2],
                        state: parts[3]
                    }
                };
            }
            
            // URL format
            if (qrText.includes('http')) {
                return {
                    type: 'url',
                    data: { url: qrText }
                };
            }
            
            return {
                type: 'unknown',
                data: { raw: qrText }
            };
        }
    }
};

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => QRScanner.init());
} else {
    QRScanner.init();
}

window.QRScanner = QRScanner;

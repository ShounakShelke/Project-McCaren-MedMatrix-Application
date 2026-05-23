/**
 * Project McCaren - Utility Helper Functions
 */

const Helpers = {
    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</span>
            <span>${message}</span>
        `;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /**
     * Switch between screens
     */
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    },

    /**
     * Update processing step status
     */
    updateStep(stepId, status) {
        const step = document.getElementById(stepId);
        if (!step) return;
        
        const icon = step.querySelector('.step-icon');
        
        step.classList.remove('completed', 'failed', 'processing');
        
        if (status === 'completed') {
            if (icon) icon.textContent = '✅';
            step.classList.add('completed');
        } else if (status === 'failed') {
            if (icon) icon.textContent = '❌';
            step.classList.add('failed');
        } else if (status === 'processing') {
            if (icon) icon.textContent = '⏳';
            step.classList.add('processing');
        }
    },

    /**
     * Reset all processing steps
     */
    resetSteps() {
        ['step-qr', 'step-hologram', 'step-mrn', 'step-tamper'].forEach(stepId => {
            const step = document.getElementById(stepId);
            if (!step) return;
            
            const icon = step.querySelector('.step-icon');
            step.classList.remove('completed', 'failed', 'processing');
            if (icon) icon.textContent = '⏳';
        });
    },

    /**
     * Delay helper for async operations
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Convert image to base64
     */
    imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * Load image from URL/base64
     */
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    },

    /**
     * Get image data from canvas
     */
    getImageData(canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    },

    /**
     * Draw image to canvas
     */
    drawToCanvas(canvas, image) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return canvas;
        
        canvas.width = image.width || image.videoWidth;
        canvas.height = image.height || image.videoHeight;
        ctx.drawImage(image, 0, 0);
        return canvas;
    },

    /**
     * Calculate Levenshtein distance for fuzzy matching
     */
    levenshteinDistance(str1, str2) {
        const m = str1.length;
        const n = str2.length;
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
                }
            }
        }
        return dp[m][n];
    },

    /**
     * Calculate string similarity (0-1)
     */
    stringSimilarity(str1, str2) {
        const maxLen = Math.max(str1.length, str2.length);
        if (maxLen === 0) return 1;
        const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
        return 1 - distance / maxLen;
    },

    /**
     * Validate Luhn checksum (used for ID validation)
     */
    validateLuhn(number) {
        const digits = String(number).replace(/\D/g, '');
        let sum = 0;
        let isEven = false;

        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = parseInt(digits[i], 10);
            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    },

    /**
     * Format score as percentage
     */
    formatScore(score) {
        return Math.round(score * 100);
    },

    /**
     * Get color based on score
     */
    getScoreColor(score) {
        if (score >= 0.8) return '#22C55E'; // Green
        if (score >= 0.5) return '#F59E0B'; // Yellow
        return '#EF4444'; // Red
    },

    /**
     * Get result status based on score
     */
    getResultStatus(score) {
        if (score >= 0.8) return 'valid';
        if (score >= 0.5) return 'warning';
        return 'invalid';
    }
};

// Export for use in other modules
window.Helpers = Helpers;

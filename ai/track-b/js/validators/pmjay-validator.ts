/**
 * Project McCaren - PMJAY Card Validator
 * Validates PM-JAY (Ayushman Bharat) cards
 * 
 * PMJAY Card Structure:
 * - QR Code containing beneficiary ID
 * - ABHA ID / MRN Number (14 digits)
 * - Beneficiary name
 * - Family ID
 * - Hologram/security features
 */

declare const Helpers: any;

interface PMJAYRules {
    abhaIdPattern: RegExp;
    pmjayIdPattern: RegExp;
    validStateCodes: string[];
    cardAspectRatio: { min: number; max: number };
    thresholds: {
        qrConfidence: number;
        hologramConfidence: number;
        formatConfidence: number;
        overallValid: number;
    };
}

interface ValidationCheck {
    passed: boolean;
    score: number;
    message: string;
    data: any;
}

interface ExtractedCardInfo {
    cardType: string;
    beneficiaryId: string | null;
    name: string | null;
    familyId: string | null;
    stateCode: string | null;
    hhd: string | null;
}

interface Recommendation {
    type: 'warning' | 'action' | 'danger' | 'success' | 'info';
    message: string;
}

interface PMJAYValidationResult {
    isValid: boolean;
    overallScore: number;
    checks: {
        qrCode: ValidationCheck;
        idFormat: ValidationCheck;
        hologram: ValidationCheck;
        tampering: ValidationCheck;
    };
    extractedInfo: ExtractedCardInfo;
    flags: string[];
    recommendations: Recommendation[];
    modelDecision?: any;
    featureMatchScore?: number;
}

interface ValidationData {
    qrData?: { text: string } | null;
    hologramResult?: ValidationCheck;
    tamperResult?: { score: number; flags: string[] };
    ocrText?: string;
    imageCanvas?: HTMLCanvasElement;
}

const PMJAYValidator = {
    // PMJAY card validation rules
    rules: {
        // ABHA ID format: 14 digits (XX-XXXX-XXXX-XXXX)
        abhaIdPattern: /^\d{2}-?\d{4}-?\d{4}-?\d{4}$/,
        
        // PMJAY card number format: State code (2) + District (3) + Family ID (7) + Member (2)
        pmjayIdPattern: /^[A-Z]{2}\d{3}\d{7}\d{2}$/,
        
        // Valid state codes
        validStateCodes: [
            'AP', 'AR', 'AS', 'BR', 'CG', 'GA', 'GJ', 'HR', 'HP', 'JK', 
            'JH', 'KA', 'KL', 'MP', 'MH', 'MN', 'ML', 'MZ', 'NL', 'OD',
            'PB', 'RJ', 'SK', 'TN', 'TS', 'TR', 'UP', 'UK', 'WB', 'AN',
            'CH', 'DN', 'DD', 'DL', 'LD', 'PY'
        ],
        
        // Expected card dimensions ratio (width:height ≈ 1.58 for standard ID card)
        cardAspectRatio: { min: 1.4, max: 1.7 },
        
        // Minimum confidence thresholds
        thresholds: {
            qrConfidence: 0.7,
            hologramConfidence: 0.6,
            formatConfidence: 0.8,
            overallValid: 0.75
        }
    } as PMJAYRules,

    /**
     * Main validation function
     * @param data - Contains image, qrData, ocrData
     * @returns Validation result
     */
    async validate(data: ValidationData): Promise<PMJAYValidationResult> {
        const results: PMJAYValidationResult = {
            isValid: false,
            overallScore: 0,
            checks: {
                qrCode: { passed: false, score: 0, message: '', data: null },
                idFormat: { passed: false, score: 0, message: '', data: null },
                hologram: { passed: false, score: 0, message: '', data: null },
                tampering: { passed: false, score: 0, message: '', data: null }
            },
            extractedInfo: {
                cardType: 'PMJAY',
                beneficiaryId: null,
                name: null,
                familyId: null,
                stateCode: null,
                hhd: null
            },
            flags: [],
            recommendations: []
        };

        try {
            // 1. Validate QR Code
            if (data.qrData) {
                results.checks.qrCode = this.validateQRCode(data.qrData);
            } else {
                results.checks.qrCode = {
                    passed: false,
                    score: 0,
                    message: 'No QR code detected',
                    data: null
                };
                results.flags.push('QR code not found or unreadable');
            }

            // 2. Validate ID Format
            results.checks.idFormat = this.validateIdFormat(data);

            // 3. Validate Hologram (from hologram detector)
            if (data.hologramResult) {
                results.checks.hologram = data.hologramResult;
            }

            // 4. Check for Tampering (from tamper detector)
            if (data.tamperResult) {
                results.checks.tampering = {
                    passed: data.tamperResult.score > 0.7,
                    score: data.tamperResult.score,
                    message: data.tamperResult.flags.length > 0 
                        ? `Issues: ${data.tamperResult.flags.join(', ')}`
                        : 'No tampering detected',
                    data: data.tamperResult
                };
            }

            // Calculate overall score
            const weights: { [key: string]: number } = { qrCode: 0.35, idFormat: 0.25, hologram: 0.2, tampering: 0.2 };
            let totalWeight = 0;
            let weightedScore = 0;

            (Object.keys(results.checks) as Array<keyof typeof results.checks>).forEach(check => {
                if (results.checks[check].score > 0 || results.checks[check].passed !== undefined) {
                    weightedScore += results.checks[check].score * weights[check];
                    totalWeight += weights[check];
                }
            });

            results.overallScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
            results.isValid = results.overallScore >= this.rules.thresholds.overallValid;

            // Extract card info
            results.extractedInfo = this.extractCardInfo(data);

            // Generate recommendations
            results.recommendations = this.generateRecommendations(results);

        } catch (error: any) {
            console.error('PMJAY Validation Error:', error);
            results.flags.push('Validation error: ' + error.message);
        }

        return results;
    },

    /**
     * Validate QR Code data
     */
    validateQRCode(qrData: { text: string }): ValidationCheck {
        const result: ValidationCheck = {
            passed: false,
            score: 0,
            message: '',
            data: null
        };

        if (!qrData || !qrData.text) {
            result.message = 'QR code empty or unreadable';
            return result;
        }

        const qrText = qrData.text.trim();
        
        // PMJAY QR contains JSON or pipe-separated data
        // Format: BeneficiaryID|Name|FamilyID|StateCode or JSON
        
        let parsedData: any = null;

        // Try JSON parse first
        try {
            parsedData = JSON.parse(qrText);
        } catch {
            // Try pipe-separated format
            const parts = qrText.split('|');
            if (parts.length >= 3) {
                parsedData = {
                    beneficiaryId: parts[0],
                    name: parts[1],
                    familyId: parts[2],
                    stateCode: parts[3] || ''
                };
            }
        }

        if (parsedData) {
            // Validate beneficiary ID format
            const hasValidId = this.validateBeneficiaryId(
                parsedData.beneficiaryId || parsedData.abha_id || parsedData.pmjay_id
            );
            
            result.data = parsedData;
            
            if (hasValidId) {
                result.passed = true;
                result.score = 0.95;
                result.message = 'Valid PMJAY QR code';
            } else {
                result.score = 0.5;
                result.message = 'QR readable but ID format invalid';
            }
        } else {
            // Check if it's a URL (some cards have verification URLs)
            if (qrText.includes('pmjay.gov.in') || qrText.includes('nha.gov.in')) {
                result.passed = true;
                result.score = 0.8;
                result.message = 'Valid PMJAY verification URL';
                result.data = { url: qrText };
            } else {
                result.score = 0.3;
                result.message = 'QR code detected but format unrecognized';
            }
        }

        return result;
    },

    /**
     * Validate beneficiary ID format
     */
    validateBeneficiaryId(id: string | null | undefined): boolean {
        if (!id) return false;
        
        const cleanId = id.replace(/[-\s]/g, '');
        
        // ABHA format: 14 digits
        if (/^\d{14}$/.test(cleanId)) {
            return Helpers.validateLuhn(cleanId);
        }
        
        // PMJAY format: State + District + Family + Member
        if (this.rules.pmjayIdPattern.test(id)) {
            const stateCode = id.substring(0, 2);
            return this.rules.validStateCodes.includes(stateCode);
        }

        return false;
    },

    /**
     * Validate ID format from OCR
     */
    validateIdFormat(data: ValidationData): ValidationCheck {
        const result: ValidationCheck = {
            passed: false,
            score: 0,
            message: '',
            data: null
        };

        // Check OCR extracted text for ID patterns
        const ocrText = data.ocrText || '';
        
        // Look for ABHA ID pattern
        const abhaMatch = ocrText.match(/(\d{2}-?\d{4}-?\d{4}-?\d{4})/);
        if (abhaMatch) {
            const isValid = this.validateBeneficiaryId(abhaMatch[1]);
            result.data = { abhaId: abhaMatch[1] };
            
            if (isValid) {
                result.passed = true;
                result.score = 0.9;
                result.message = 'Valid ABHA ID format';
            } else {
                result.score = 0.5;
                result.message = 'ID found but checksum invalid';
            }
            return result;
        }

        // Look for PMJAY ID pattern
        const pmjayMatch = ocrText.match(/([A-Z]{2}\d{12})/);
        if (pmjayMatch) {
            const isValid = this.validateBeneficiaryId(pmjayMatch[1]);
            result.data = { pmjayId: pmjayMatch[1] };
            
            if (isValid) {
                result.passed = true;
                result.score = 0.9;
                result.message = 'Valid PMJAY ID format';
            } else {
                result.score = 0.4;
                result.message = 'ID found but state code invalid';
            }
            return result;
        }

        // Check if QR data has valid ID
        if (data.qrData && data.qrData.text) {
            const qrCheck = this.validateQRCode(data.qrData);
            if (qrCheck.data && (qrCheck.data.beneficiaryId || qrCheck.data.abha_id)) {
                result.passed = true;
                result.score = 0.85;
                result.message = 'ID validated from QR code';
                result.data = qrCheck.data;
                return result;
            }
        }

        result.message = 'No valid ID format detected';
        return result;
    },

    /**
     * Extract card information
     */
    extractCardInfo(data: ValidationData): ExtractedCardInfo {
        const info: ExtractedCardInfo = {
            cardType: 'PMJAY',
            beneficiaryId: null,
            name: null,
            familyId: null,
            stateCode: null,
            hhd: null // Household ID
        };

        // From QR data
        if (data.qrData && data.qrData.text) {
            try {
                const parsed = JSON.parse(data.qrData.text);
                info.beneficiaryId = parsed.beneficiaryId || parsed.abha_id || parsed.pmjay_id;
                info.name = parsed.name || parsed.beneficiary_name;
                info.familyId = parsed.familyId || parsed.family_id;
                info.stateCode = parsed.stateCode || parsed.state;
            } catch {
                const parts = data.qrData.text.split('|');
                if (parts.length >= 2) {
                    info.beneficiaryId = parts[0];
                    info.name = parts[1];
                    info.familyId = parts[2];
                }
            }
        }

        // From OCR text
        const ocrText = data.ocrText || '';
        
        if (!info.beneficiaryId) {
            const idMatch = ocrText.match(/(\d{2}-?\d{4}-?\d{4}-?\d{4})|([A-Z]{2}\d{12})/);
            if (idMatch) info.beneficiaryId = idMatch[0];
        }

        if (!info.name) {
            // Look for name patterns (usually after "Name:" or "Beneficiary:")
            const nameMatch = ocrText.match(/(?:Name|Beneficiary)[:\s]*([A-Za-z\s]+)/i);
            if (nameMatch) info.name = nameMatch[1].trim();
        }

        return info;
    },

    /**
     * Generate recommendations based on validation
     */
    generateRecommendations(results: PMJAYValidationResult): Recommendation[] {
        const recommendations: Recommendation[] = [];

        if (!results.checks.qrCode.passed) {
            recommendations.push({
                type: 'warning',
                message: 'QR code could not be verified. Visit nearest PMJAY kiosk for verification.'
            });
        }

        if (!results.checks.idFormat.passed) {
            recommendations.push({
                type: 'action',
                message: 'ID format invalid. Contact PMJAY helpline: 14555'
            });
        }

        if (results.checks.tampering && !results.checks.tampering.passed) {
            recommendations.push({
                type: 'danger',
                message: 'Possible tampering detected. Do not use this card for claims.'
            });
        }

        if (results.overallScore >= 0.8) {
            recommendations.push({
                type: 'success',
                message: 'Card appears valid. You can proceed with claim filing.'
            });
        } else if (results.overallScore >= 0.5) {
            recommendations.push({
                type: 'info',
                message: 'Card partially verified. Manual verification recommended.'
            });
        }

        return recommendations;
    },

    /**
     * Check if image is likely a PMJAY card
     */
    isPMJAYCard(imageData: ImageData): boolean {
        // Check for PMJAY-specific visual markers
        // This is a simplified version - in production would use ML
        
        const markers = {
            hasGovLogo: false,
            hasAyushmanText: false,
            hasNhaLogo: false,
            colorScheme: false
        };

        // These would be detected using OpenCV/ML in production
        // For now, return true if any markers detected
        
        return true; // Placeholder - actual implementation needs CV
    }
};

// Export for use in other modules
(window as any).PMJAYValidator = PMJAYValidator;

export { PMJAYValidator, PMJAYValidationResult, ValidationCheck, ExtractedCardInfo, Recommendation, ValidationData };

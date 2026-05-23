/**
 * Project McCaren - ESIC Card Validator
 * Validates ESIC (Employees' State Insurance Corporation) cards
 */

const ESICValidator = {
    // ESIC card validation rules
    rules: {
        // ESIC Insurance Number: 17 digits
        insuranceNumberPattern: /^\d{17}$/,
        
        // Regional office codes (first 2 digits)
        validRegionCodes: [
            '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
            '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
            '31', '32', '33', '34', '35', '36', '37', '38'
        ],
        
        // Dispensary code format
        dispensaryPattern: /^[A-Z]{2}\d{4}$/,
        
        // Minimum confidence thresholds
        thresholds: {
            formatConfidence: 0.8,
            overallValid: 0.7
        }
    },

    /**
     * Main validation function
     */
    async validate(data) {
        const results = {
            isValid: false,
            overallScore: 0,
            checks: {
                insuranceNumber: { passed: false, score: 0, message: '', data: null },
                cardFormat: { passed: false, score: 0, message: '', data: null },
                tampering: { passed: false, score: 0, message: '', data: null }
            },
            extractedInfo: {
                cardType: 'ESIC',
                insuranceNumber: null,
                ipName: null,
                dispensaryCode: null,
                employerCode: null,
                regionOffice: null
            },
            flags: [],
            recommendations: []
        };

        try {
            // 1. Validate Insurance Number
            results.checks.insuranceNumber = this.validateInsuranceNumber(data);

            // 2. Validate Card Format
            results.checks.cardFormat = this.validateCardFormat(data);

            // 3. Check for Tampering
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
            const weights = { insuranceNumber: 0.5, cardFormat: 0.3, tampering: 0.2 };
            let weightedScore = 0;
            let totalWeight = 0;

            Object.keys(results.checks).forEach(check => {
                if (results.checks[check].score > 0) {
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

        } catch (error) {
            console.error('ESIC Validation Error:', error);
            results.flags.push('Validation error: ' + error.message);
        }

        return results;
    },

    /**
     * Validate ESIC Insurance Number
     */
    validateInsuranceNumber(data) {
        const result = {
            passed: false,
            score: 0,
            message: '',
            data: null
        };

        const ocrText = data.ocrText || '';
        
        // Look for 17-digit insurance number
        const numberMatch = ocrText.match(/(\d{17})/);
        
        if (numberMatch) {
            const insNumber = numberMatch[1];
            const regionCode = insNumber.substring(0, 2);
            
            result.data = { 
                insuranceNumber: insNumber,
                regionCode: regionCode,
                subRegion: insNumber.substring(2, 4),
                officeCode: insNumber.substring(4, 7),
                ipNumber: insNumber.substring(7)
            };

            if (this.rules.validRegionCodes.includes(regionCode)) {
                result.passed = true;
                result.score = 0.95;
                result.message = 'Valid ESIC Insurance Number';
            } else {
                result.score = 0.5;
                result.message = 'Insurance number found but region code invalid';
            }
        } else {
            // Look for partial matches
            const partialMatch = ocrText.match(/\d{10,16}/);
            if (partialMatch) {
                result.score = 0.3;
                result.message = 'Partial number detected - may be obscured';
                result.data = { partial: partialMatch[0] };
            } else {
                result.message = 'No ESIC insurance number found';
            }
        }

        return result;
    },

    /**
     * Validate card format and structure
     */
    validateCardFormat(data) {
        const result = {
            passed: false,
            score: 0,
            message: '',
            data: null
        };

        const ocrText = data.ocrText || '';
        const markers = {
            hasESICLogo: /ESIC|Employees.*State.*Insurance/i.test(ocrText),
            hasDispensary: this.rules.dispensaryPattern.test(ocrText),
            hasIPName: /IP\s*Name|Insured\s*Person/i.test(ocrText),
            hasEmployerCode: /Employer\s*Code|Emp\s*Code/i.test(ocrText)
        };

        result.data = markers;
        
        const markerCount = Object.values(markers).filter(v => v).length;
        result.score = markerCount / 4;

        if (markerCount >= 3) {
            result.passed = true;
            result.message = 'Valid ESIC card format detected';
        } else if (markerCount >= 2) {
            result.score = 0.6;
            result.message = 'Partial ESIC format - some fields missing';
        } else if (markerCount >= 1) {
            result.score = 0.3;
            result.message = 'Minimal ESIC markers found';
        } else {
            result.message = 'Does not appear to be ESIC card';
        }

        return result;
    },

    /**
     * Extract card information
     */
    extractCardInfo(data) {
        const info = {
            cardType: 'ESIC',
            insuranceNumber: null,
            ipName: null,
            dispensaryCode: null,
            employerCode: null,
            regionOffice: null
        };

        const ocrText = data.ocrText || '';

        // Insurance number
        const insMatch = ocrText.match(/(\d{17})/);
        if (insMatch) {
            info.insuranceNumber = insMatch[1];
            info.regionOffice = this.getRegionName(insMatch[1].substring(0, 2));
        }

        // IP Name
        const nameMatch = ocrText.match(/(?:IP\s*Name|Name)[:\s]*([A-Za-z\s]+)/i);
        if (nameMatch) info.ipName = nameMatch[1].trim();

        // Dispensary Code
        const dispMatch = ocrText.match(/([A-Z]{2}\d{4})/);
        if (dispMatch) info.dispensaryCode = dispMatch[1];

        return info;
    },

    /**
     * Get region name from code
     */
    getRegionName(code) {
        const regions = {
            '11': 'Delhi', '12': 'Haryana', '13': 'Punjab',
            '14': 'Rajasthan', '15': 'UP East', '16': 'UP West',
            '17': 'Bihar', '21': 'Gujarat', '22': 'Maharashtra',
            '31': 'Karnataka', '32': 'Tamil Nadu', '33': 'Kerala'
        };
        return regions[code] || 'Unknown Region';
    },

    /**
     * Generate recommendations
     */
    generateRecommendations(results) {
        const recommendations = [];

        if (!results.checks.insuranceNumber.passed) {
            recommendations.push({
                type: 'action',
                message: 'Insurance number not verified. Contact ESIC helpline: 1800-11-2526'
            });
        }

        if (results.overallScore >= 0.7) {
            recommendations.push({
                type: 'success',
                message: 'Card appears valid. You can file Form-8 for reimbursement.'
            });
        }

        return recommendations;
    }
};

window.ESICValidator = ESICValidator;

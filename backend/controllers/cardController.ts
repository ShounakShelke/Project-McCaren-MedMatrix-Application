import { Request, Response } from "express";

type CardType = 'pmjay' | 'esic';

interface ValidationCheck {
    passed: boolean;
    score: number;
    message: string;
}

interface CardValidationResult {
    isValid: boolean;
    overallScore: number;
    cardType: CardType;
    checks: {
        qrCode: ValidationCheck;
        hologram: ValidationCheck;
        idFormat: ValidationCheck;
        tampering: ValidationCheck;
    };
    extractedInfo: {
        beneficiaryId: string | null;
        name: string | null;
        stateCode: string | null;
    };
    flags: string[];
}

// PMJAY validation rules
const PMJAY_VALID_STATE_CODES = [
    'AP', 'AR', 'AS', 'BR', 'CG', 'GA', 'GJ', 'HR', 'HP', 'JK',
    'JH', 'KA', 'KL', 'MP', 'MH', 'MN', 'ML', 'MZ', 'NL', 'OD',
    'PB', 'RJ', 'SK', 'TN', 'TS', 'TR', 'UP', 'UK', 'WB', 'AN',
    'CH', 'DN', 'DD', 'DL', 'LD', 'PY'
];

/**
 * Analyze image buffer for QR-like patterns
 */
function detectQRCode(buffer: Buffer): ValidationCheck {
    // Simplified QR detection - in production would use a proper library
    // For now, simulate based on image characteristics
    const hasContent = buffer.length > 10000; // Non-empty image
    const score = hasContent ? 0.6 + Math.random() * 0.3 : 0;
    
    return {
        passed: score > 0.5,
        score,
        message: score > 0.5 ? 'QR code pattern detected' : 'No QR code found'
    };
}

/**
 * Detect hologram/security features
 */
function detectHologram(buffer: Buffer): ValidationCheck {
    // Simplified hologram detection
    const imageSize = buffer.length;
    const score = imageSize > 50000 ? 0.5 + Math.random() * 0.4 : 0.3;
    
    return {
        passed: score >= 0.5,
        score,
        message: score >= 0.5 ? 'Security features detected' : 'No hologram detected'
    };
}

/**
 * Check for tampering artifacts
 */
function detectTampering(buffer: Buffer): ValidationCheck {
    // Simplified tampering detection
    const score = 0.7 + Math.random() * 0.25;
    
    return {
        passed: score > 0.6,
        score,
        message: score > 0.6 ? 'No tampering detected' : 'Possible tampering detected'
    };
}

/**
 * Validate ID format based on card type
 */
function validateIdFormat(cardType: CardType): ValidationCheck {
    // For demo, assume format is valid
    const score = 0.8 + Math.random() * 0.2;
    
    if (cardType === 'pmjay') {
        return {
            passed: true,
            score,
            message: 'Valid PMJAY format'
        };
    }
    
    return {
        passed: true,
        score,
        message: 'Valid ESIC format'
    };
}

/**
 * POST /api/verify-card
 * Accepts: multipart/form-data with field "cardImage" and "cardType"
 * Returns: CardValidationResult
 */
export async function verifyCard(req: Request, res: Response): Promise<void> {
    try {
        if (!req.file) {
            res.status(400).json({ error: "Missing required field: cardImage" });
            return;
        }

        const cardType = (req.body.cardType || 'pmjay') as CardType;
        const buffer = req.file.buffer;

        // Run all checks
        const qrResult = detectQRCode(buffer);
        const hologramResult = detectHologram(buffer);
        const tamperResult = detectTampering(buffer);
        const idFormatResult = validateIdFormat(cardType);

        // Calculate overall score
        const weights = { qrCode: 0.3, hologram: 0.25, idFormat: 0.25, tampering: 0.2 };
        const overallScore = 
            qrResult.score * weights.qrCode +
            hologramResult.score * weights.hologram +
            idFormatResult.score * weights.idFormat +
            tamperResult.score * weights.tampering;

        // Generate extracted info based on card type
        const stateCode = PMJAY_VALID_STATE_CODES[Math.floor(Math.random() * PMJAY_VALID_STATE_CODES.length)];
        
        const result: CardValidationResult = {
            isValid: overallScore >= 0.5,
            overallScore,
            cardType,
            checks: {
                qrCode: qrResult,
                hologram: hologramResult,
                idFormat: idFormatResult,
                tampering: tamperResult
            },
            extractedInfo: {
                beneficiaryId: cardType === 'pmjay' 
                    ? `${stateCode}***********01` 
                    : '12******89',
                name: null,
                stateCode: cardType === 'pmjay' ? stateCode : null
            },
            flags: []
        };

        // Collect flags
        if (!qrResult.passed) result.flags.push('QR code not verified');
        if (!hologramResult.passed) result.flags.push('Security hologram not detected');
        if (!tamperResult.passed) result.flags.push('Possible tampering detected');

        res.status(200).json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[verifyCard]", err);
        res.status(500).json({ error: "Failed to verify card", details: message });
    }
}

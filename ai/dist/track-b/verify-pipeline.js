import { scanPMJAYQR } from './card-validator/qr-scanner.js';
import { validateMRN } from './card-validator/mrn-check.js';
import { detectHologram } from './card-validator/hologram-det.js';
import { analyzeFontConsistency } from './tamper-det/font-analyzer.js';
function calculateTrustScore(qrValid, mrnValid, tamperedFlags) {
    let score = 1.0;
    if (!qrValid)
        score -= 0.3;
    if (!mrnValid)
        score -= 0.2;
    score -= (tamperedFlags * 0.1);
    return Math.max(0, parseFloat(score.toFixed(2)));
}
export async function processCardPhoto(imagePath) {
    const codeReader = await scanPMJAYQR(imagePath);
    const tamperFlags = [];
    try {
        const qrValid = codeReader.valid;
        const mrnResult = await validateMRN(imagePath);
        const hologramResult = await detectHologram(imagePath);
        const fontCheck = await analyzeFontConsistency(imagePath);
        if (!fontCheck.consistent)
            tamperFlags.push('font_mismatch');
        if (!hologramResult.detected)
            tamperFlags.push('no_hologram');
        const validity = calculateTrustScore(qrValid, mrnResult.valid, tamperFlags.length);
        return {
            success: true,
            data: {
                validity,
                qr_valid: qrValid,
                mrn_valid: mrnResult.valid,
                issues: tamperFlags,
                beneficiary_id: codeReader.id
            }
        };
    }
    catch (error) {
        return {
            success: false,
            data: {
                validity: 0,
                qr_valid: false,
                mrn_valid: false,
                issues: ['validation_failed']
            }
        };
    }
}

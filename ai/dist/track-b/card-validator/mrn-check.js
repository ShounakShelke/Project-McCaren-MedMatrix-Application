import Tesseract from 'tesseract.js';
import fs from 'fs';
export async function validateMRN(imagePath) {
    try {
        const buffer = fs.readFileSync(imagePath);
        const { data: { text } } = await Tesseract.recognize(buffer, 'eng', { logger: () => { } });
        // Check for 14 digit dashed code
        const mrnMatch = text.match(/\b[A-Z0-9\-]{12,17}\b/);
        if (!mrnMatch)
            return { valid: false };
        const mrn = mrnMatch[0];
        if (mrn.includes('FAKE'))
            return { valid: false, mrn };
        return { valid: true, mrn };
    }
    catch (e) {
        return { valid: false };
    }
}

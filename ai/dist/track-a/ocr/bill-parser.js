import Tesseract from 'tesseract.js';
import { preprocessBill } from './preprocess.js';
import { extractBillData } from './extract-fields.js';
import { classifyTreatment } from '../classifier/treatment-cat.js';
import { calculateSchemes } from './scheme-engine.js';
export async function processBillPhoto(imagePath) {
    try {
        const processedBuffer = await preprocessBill(imagePath);
        // Tesseract.js recognizes buffer
        const { data: { text } } = await Tesseract.recognize(processedBuffer, 'eng+hin', { logger: () => { } });
        const billData = extractBillData(text);
        const classification = classifyTreatment(billData.treatment);
        const schemeData = calculateSchemes(billData.amount, billData.hospital, billData.treatment);
        // Map to expected unified format
        return {
            success: true,
            data: {
                hospital: billData.hospital,
                treatment: billData.treatment,
                amount: billData.amount,
                date: billData.date,
                category: classification.category
            },
            savings_engine: schemeData,
            confidence: classification.confidence
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

import tesseract from "node-tesseract-ocr";
import os from "os";
import path from "path";
import fs from "fs";
import { BillData } from "../types";
// NOTE: AI module import disabled for now - using local OCR
// import { processBillPhoto } from '../../ai/track-a/ocr/bill-parser';

/**
 * Classify a raw treatment string into a treatmentKey.
 */
function classifyTreatment(text: string): BillData["treatmentKey"] {
    const lower = text.toLowerCase();
    if (/fracture|ortho|bone/.test(lower)) return "fracture";
    if (/accident|emergency|trauma|burn/.test(lower)) return "accident_emergency";
    return "default";
}

/**
 * Extract the largest ₹ / Rs amount from OCR text.
 */
function extractAmount(text: string): number {
    const matches = [...text.matchAll(/(?:₹|Rs?\.?)\s*([\d,]+(?:\.\d{1,2})?)/gi)];
    if (!matches.length) return 0;
    const amounts = matches.map((m) => parseFloat(m[1].replace(/,/g, "")));
    return Math.max(...amounts);
}

/**
 * Extract a DD/MM/YYYY date from text near an optional label.
 */
function extractDateNear(text: string, labels: string[]): string | null {
    const labelPattern = new RegExp(
        `(?:${labels.join("|")})[^\\n]{0,40}?(\\d{2}\\/\\d{2}\\/\\d{4})`,
        "i"
    );
    const labelMatch = text.match(labelPattern);
    if (labelMatch) return labelMatch[1];

    const datePattern = /(\d{2}\/\d{2}\/\d{4})/g;
    const all = [...text.matchAll(datePattern)];
    return all.length ? all[0][1] : null;
}

/**
 * Extract hospital name — first line containing a known institution keyword.
 */
function extractHospitalName(text: string): string | null {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
        if (/hospital|clinic|medical|health|care|centre|center|nursing/i.test(line)) {
            return line.substring(0, 100);
        }
    }
    return lines[0] ?? null;
}

/**
 * Extract treatment description line.
 */
function extractTreatment(text: string): string | null {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
        if (
            /treatment|procedure|diagnosis|surgery|operation|fracture|accident|emergency|trauma|burn|ortho/i.test(
                line
            )
        ) {
            return line.substring(0, 200);
        }
    }
    return null;
}

/**
 * Run Tesseract OCR on an image buffer and return structured BillData.
 */
export async function extractBillData(imageBuffer: Buffer): Promise<BillData> {
    const tmpPath = path.join(os.tmpdir(), `project-mccaren-${Date.now()}.png`);
    await fs.promises.writeFile(tmpPath, imageBuffer);

    let ocrText = "";
    try {
        ocrText = await tesseract(tmpPath, { lang: "eng", oem: 1, psm: 6 });
    } finally {
        try {
            await fs.promises.unlink(tmpPath);
        } catch {
            // ignore cleanup errors
        }
    }

    const treatment = extractTreatment(ocrText);
    const treatmentKey = classifyTreatment(ocrText);

    return {
        hospitalName: extractHospitalName(ocrText),
        treatment,
        treatmentKey,
        amount: extractAmount(ocrText),
        admissionDate: extractDateNear(ocrText, ["admission", "admit", "date of admission"]),
        dischargeDate: extractDateNear(ocrText, ["discharge", "date of discharge"]),
    };
}

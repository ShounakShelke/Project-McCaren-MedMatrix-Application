import { Request, Response } from "express";
import crypto from "crypto";
import { extractBillData } from "../services/ocrService";
import * as caseRepository from "../repositories/caseRepository";
import * as billRepository from "../repositories/billRepository";

/**
 * POST /api/extract-bill
 * Accepts: multipart/form-data with field "billImage"
 * Returns: { billData, caseId, sessionId }
 */
export async function extractBill(req: Request, res: Response): Promise<void> {
    try {
        if (!req.file) {
            res.status(400).json({ error: "Missing required field: billImage" });
            return;
        }

        const sessionId = crypto.randomBytes(16).toString("hex");
        const billData = await extractBillData(req.file.buffer);
        const newCase = await caseRepository.createCase(sessionId);
        await billRepository.createBill(newCase.id, billData);

        res.status(200).json({ billData, caseId: newCase.id, sessionId });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[extractBill]", err);
        res.status(500).json({ error: "Failed to extract bill data", details: message });
    }
}

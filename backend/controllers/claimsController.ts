import { Request, Response } from "express";
import { computeClaims } from "../services/rulesEngine";
import * as claimRepository from "../repositories/claimRepository";
import { ComputeClaimsBody } from "../validation/schemas";

/**
 * POST /api/compute-claims
 * Body validated upstream by Zod (ComputeClaimsSchema).
 * Returns: { claims }
 */
export async function computeClaimsHandler(req: Request, res: Response): Promise<void> {
    try {
        const { billData, caseId, flags } = req.body as ComputeClaimsBody;

        const claimsData = computeClaims(billData, flags);
        const savedClaims = await claimRepository.createClaims(caseId, claimsData);

        res.status(200).json({ claims: savedClaims });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[computeClaims]", err);
        res.status(500).json({ error: "Failed to compute claims", details: message });
    }
}

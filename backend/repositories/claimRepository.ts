import prisma from "../services/prismaClient";
import { ClaimData } from "../types";

/**
 * Bulk-create Claim records linked to a Case.
 */
export async function createClaims(caseId: number, claims: ClaimData[]) {
    await prisma.claim.createMany({
        data: claims.map((c) => ({
            caseId,
            scheme: c.scheme,
            eligible: c.eligible,
            amount: c.amount,
            reason: c.reason,
        })),
    });
    return prisma.claim.findMany({ where: { caseId } });
}

/**
 * Find all Claims for a given Case.
 */
export async function findClaimsByCaseId(caseId: number) {
    return prisma.claim.findMany({ where: { caseId } });
}

/**
 * Update the pdfUrl on a Claim record.
 */
export async function updateClaimPdfUrl(claimId: number, pdfUrl: string) {
    return prisma.claim.update({
        where: { id: claimId },
        data: { pdfUrl },
    });
}

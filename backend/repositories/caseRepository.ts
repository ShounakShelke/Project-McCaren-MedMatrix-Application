import prisma from "../services/prismaClient";

/**
 * Create a new Case record.
 */
export async function createCase(sessionId: string) {
    return prisma.case.create({ data: { sessionId } });
}

/**
 * Find a Case by ID, including its bill and claims.
 */
export async function findCaseById(caseId: number) {
    return prisma.case.findUnique({
        where: { id: caseId },
        include: { bill: true, claims: true },
    });
}

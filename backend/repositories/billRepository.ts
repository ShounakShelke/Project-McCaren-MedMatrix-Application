import prisma from "../services/prismaClient";
import { BillData } from "../types";

/**
 * Create a Bill linked to a Case.
 */
export async function createBill(caseId: number, billData: BillData) {
    return prisma.bill.create({
        data: {
            caseId,
            hospitalName: billData.hospitalName,
            treatment: billData.treatment,
            treatmentKey: billData.treatmentKey,
            amount: billData.amount,
            admissionDate: billData.admissionDate,
            dischargeDate: billData.dischargeDate,
        },
    });
}

/**
 * Find a Bill by its Case ID.
 */
export async function findBillByCaseId(caseId: number) {
    return prisma.bill.findUnique({ where: { caseId } });
}

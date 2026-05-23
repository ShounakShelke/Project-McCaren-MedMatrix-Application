import { z } from "zod";

// ── Shared sub-schemas ───────────────────────────────────────────────────────

const BillDataSchema = z.object({
    hospitalName: z.string().nullable(),
    treatment: z.string().nullable(),
    treatmentKey: z.enum(["fracture", "accident_emergency", "default"]),
    amount: z.number().nonnegative(),
    admissionDate: z.string().nullable(),
    dischargeDate: z.string().nullable(),
});

const ClaimSchema = z.object({
    id: z.number().int().positive(),
    scheme: z.string(),
    eligible: z.boolean(),
    amount: z.number().nonnegative(),
    reason: z.string(),
    pdfUrl: z.string().nullable().optional(),
});

const UserSchema = z.object({
    patientName: z.string().min(1),
    esicNumber: z.string(),
    pmjayId: z.string(),
    pincode: z.string(),
});

// ── Request body schemas ─────────────────────────────────────────────────────

export const ComputeClaimsSchema = z.object({
    billData: BillDataSchema,
    caseId: z.number().int().positive(),
    flags: z.object({
        hasPmjay: z.boolean(),
        hasEsic: z.boolean(),
        hasGroupPolicy: z.boolean(),
    }),
});

export const GenerateDocsSchema = z.object({
    billData: BillDataSchema,
    claims: z.array(ClaimSchema).min(1),
    caseId: z.number().int().positive(),
    user: UserSchema,
});

// ── Inferred types (reuse in controllers instead of manual interfaces) ────────

export type ComputeClaimsBody = z.infer<typeof ComputeClaimsSchema>;
export type GenerateDocsBody = z.infer<typeof GenerateDocsSchema>;

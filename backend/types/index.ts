// Shared domain types for Project McCaren backend

export interface BillData {
    hospitalName: string | null;
    treatment: string | null;
    treatmentKey: "fracture" | "accident_emergency" | "default";
    amount: number;
    admissionDate: string | null;
    dischargeDate: string | null;
}

export interface ClaimData {
    scheme: "PMJAY" | "ESIC" | "GROUP";
    eligible: boolean;
    amount: number;
    reason: string;
}

export interface CoverageFlags {
    hasPmjay: boolean;
    hasEsic: boolean;
    hasGroupPolicy: boolean;
}

export interface User {
    patientName: string;
    esicNumber: string;
    pmjayId: string;
    pincode: string;
}

// Rules JSON shape
export interface SchemeRule {
    covered: boolean;
    coveragePct?: number;
    maxAmount?: number;
}

export interface TreatmentRules {
    pmjay: SchemeRule;
    esic: SchemeRule;
    group: SchemeRule;
}

export type RulesMap = Record<string, TreatmentRules>;

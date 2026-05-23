import { BillData, ClaimData, CoverageFlags, RulesMap } from "../types";
import rulesJson from "../data/rules.json";

const rules = rulesJson as RulesMap;

/**
 * Apply coverage rules and compute a claim list for PMJAY / ESIC / GROUP.
 */
export function computeClaims(
    billData: Pick<BillData, "treatmentKey" | "amount">,
    flags: CoverageFlags
): ClaimData[] {
    const { treatmentKey, amount } = billData;
    const key = rules[treatmentKey] ? treatmentKey : "default";
    const treatmentRules = rules[key];

    const claims: ClaimData[] = [];

    // ---- PMJAY ----
    if (!flags.hasPmjay) {
        claims.push({ scheme: "PMJAY", eligible: false, amount: 0, reason: "No coverage selected" });
    } else {
        const r = treatmentRules.pmjay;
        if (!r.covered) {
            claims.push({ scheme: "PMJAY", eligible: false, amount: 0, reason: "Not covered for this treatment" });
        } else {
            const covered = Math.min(amount * (r.coveragePct ?? 1), r.maxAmount ?? Infinity);
            claims.push({
                scheme: "PMJAY",
                eligible: true,
                amount: covered,
                reason: `Coverage at ${(r.coveragePct ?? 1) * 100}%, capped at ₹${(r.maxAmount ?? 0).toLocaleString("en-IN")}`,
            });
        }
    }

    // ---- ESIC ----
    if (!flags.hasEsic) {
        claims.push({ scheme: "ESIC", eligible: false, amount: 0, reason: "No coverage selected" });
    } else {
        const r = treatmentRules.esic;
        if (!r.covered) {
            claims.push({ scheme: "ESIC", eligible: false, amount: 0, reason: "Not covered for this treatment" });
        } else {
            const covered = Math.min(amount, r.maxAmount ?? Infinity);
            claims.push({
                scheme: "ESIC",
                eligible: true,
                amount: covered,
                reason: `Actual expense reimbursement, capped at ₹${(r.maxAmount ?? 0).toLocaleString("en-IN")}`,
            });
        }
    }

    // ---- GROUP ----
    if (!flags.hasGroupPolicy) {
        claims.push({ scheme: "GROUP", eligible: false, amount: 0, reason: "No coverage selected" });
    } else {
        const r = treatmentRules.group;
        if (!r.covered) {
            claims.push({ scheme: "GROUP", eligible: false, amount: 0, reason: "Not covered for this treatment" });
        } else {
            const covered = Math.min(amount * (r.coveragePct ?? 1), r.maxAmount ?? Infinity);
            claims.push({
                scheme: "GROUP",
                eligible: true,
                amount: covered,
                reason: `Coverage at ${(r.coveragePct ?? 1) * 100}%, capped at ₹${(r.maxAmount ?? 0).toLocaleString("en-IN")}`,
            });
        }
    }

    return claims;
}

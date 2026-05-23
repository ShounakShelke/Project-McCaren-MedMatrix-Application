from typing import Dict, Any, List

def predict_treatment_costs(treatment_key: str, bill_amount: float) -> Dict[str, Any]:
    # Baselines based on rules
    baselines = {
        "fracture": {"est_min": 35000.0, "est_max": 75000.0, "avg": 55000.0},
        "accident_emergency": {"est_min": 50000.0, "est_max": 200000.0, "avg": 120000.0},
        "default": {"est_min": 10000.0, "est_max": 40000.0, "avg": 20000.0}
    }
    
    stats = baselines.get(treatment_key, baselines["default"])
    
    return {
        "estimated_min_cost": stats["est_min"],
        "estimated_max_cost": stats["est_max"],
        "average_cost_for_treatment": stats["avg"],
        "current_bill_amount": bill_amount,
        "is_within_normal_range": stats["est_min"] <= bill_amount <= stats["est_max"]
    }

def predict_approval_probability(
    card_validation_score: float, 
    ocr_confidence: float, 
    treatment_key: str, 
    bill_amount: float,
    has_matching_names: bool = True
) -> Dict[str, Any]:
    # Calculate base probability from card validation score and OCR confidence
    base_prob = (card_validation_score * 0.5) + (ocr_confidence * 0.3)
    
    # Apply penalties or bonuses
    reasons = []
    if card_validation_score < 0.70:
        base_prob -= 0.25
        reasons.append("Low trust score on uploaded insurance card.")
    else:
        reasons.append("Insurance card validation score is high (genuine card).")
        
    if not has_matching_names:
        base_prob -= 0.30
        reasons.append("Name mismatch between patient bill and insurance card.")
    else:
        reasons.append("Patient names match perfectly on both documents.")
        
    # Check scheme limits (extreme bill amounts reduce approval chance due to strict audits)
    if treatment_key == "fracture" and bill_amount > 50000:
        base_prob -= 0.10
        reasons.append("Claim exceeds standard package rates for fracture treatments (₹50,000 limit). Requires audit review.")
    elif treatment_key == "accident_emergency" and bill_amount > 100000:
        base_prob -= 0.15
        reasons.append("Claim exceeds standard package rates for accident & emergency (₹1,00,000 limit). Requires audit review.")
    elif treatment_key == "default":
        base_prob -= 0.20
        reasons.append("Treatment category is not covered by default PMJAY/ESIC packages.")

    # Ensure range [0.0, 1.0]
    final_prob = max(0.05, min(0.98, base_prob))
    
    # Decide risk category
    if final_prob >= 0.80:
        risk = "LOW"
        est_time = "2-4 Hours (Auto-Approval Eligible)"
    elif final_prob >= 0.50:
        risk = "MEDIUM"
        est_time = "1-2 Days (Requires Medical Officer Review)"
    else:
        risk = "HIGH"
        est_time = "3-5 Days (Requires Detailed Audit & Verification)"

    return {
        "approval_probability": round(final_prob * 100, 1),
        "risk_category": risk,
        "estimated_processing_time": est_time,
        "factors": reasons
    }

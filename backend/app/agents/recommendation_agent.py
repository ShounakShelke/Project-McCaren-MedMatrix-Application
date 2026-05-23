from typing import Dict, Any, List

def recommend_schemes(patient_income: float, patient_state: str, treatment_key: str, bill_amount: float) -> List[Dict[str, Any]]:
    recommendations = []
    
    # 1. PM-JAY Recommendation
    # Rule: PM-JAY targets lower income groups (typically below 1.2 Lakhs annually, though state-by-state limits vary)
    if patient_income < 120000:
        recommendations.append({
            "scheme": "PM-JAY (Ayushman Bharat)",
            "priority": "HIGH",
            "eligible": True,
            "reason": f"Patient's annual income of ₹{patient_income:,.2f} is within the threshold (< ₹1.2 Lakhs) for PM-JAY eligibility. Covers up to ₹5 Lakhs per family annually.",
            "action_required": "Provide ABHA Card / PM-JAY Beneficiary ID for verification."
        })
    elif patient_income < 250000:
        recommendations.append({
            "scheme": "PM-JAY (Ayushman Bharat)",
            "priority": "MEDIUM",
            "eligible": True,
            "reason": "Income is slightly above the baseline, but eligible under expanded socio-economic criteria or state co-contributions.",
            "action_required": "Verify family registration on the SECC database."
        })
    else:
        recommendations.append({
            "scheme": "PM-JAY (Ayushman Bharat)",
            "priority": "LOW",
            "eligible": False,
            "reason": "Annual income exceeds PM-JAY standard limits. PM-JAY is focused on lower-income beneficiaries.",
            "action_required": "None (Explore private insurance or state co-pays)."
        })

    # 2. ESIC Recommendation
    # Rule: ESIC is for organized sector employees earning <= ₹21,000/month (₹2.52 Lakhs/year)
    if patient_income <= 252000:
        recommendations.append({
            "scheme": "ESIC (Employees' State Insurance)",
            "priority": "HIGH",
            "eligible": True,
            "reason": f"Annual income of ₹{patient_income:,.2f} falls within the ESIC employee wage limit (<= ₹21,000/month). Provides full medical cover for employees and dependents.",
            "action_required": "Provide ESIC insurance number and employer contribution slip."
        })
    else:
        recommendations.append({
            "scheme": "ESIC (Employees' State Insurance)",
            "priority": "LOW",
            "eligible": False,
            "reason": "Income exceeds ESIC statutory limit of ₹21,000/month.",
            "action_required": "None"
        })

    # 3. State-Specific Schemes
    # Recommend state-specific schemes based on the patient state
    state_schemes = {
        "MH": {"name": "Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)", "limit": 120000},
        "KA": {"name": "Ayushman Bharat - Arogya Karnataka (AB-ARK)", "limit": 300000},
        "UP": {"name": "UP State Employees Cashless State Scheme", "limit": 500000},
        "GJ": {"name": "Mukhyamantri Amrutam (MA) Yojana", "limit": 400000},
        "TN": {"name": "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)", "limit": 120000}
    }
    
    state_code = (patient_state or "MH").upper()
    if state_code in state_schemes:
        scheme_info = state_schemes[state_code]
        eligible = patient_income <= scheme_info["limit"]
        recommendations.append({
            "scheme": f"State Scheme ({scheme_info['name']})",
            "priority": "HIGH" if eligible else "LOW",
            "eligible": eligible,
            "reason": f"Specific health program for {state_code} residents. Eligibility limit is ₹{scheme_info['limit']:,.2f}.",
            "action_required": f"Provide resident certificate for {state_code} and ration card." if eligible else "None"
        })
    else:
        # Generic state scheme recommendation
        recommendations.append({
            "scheme": f"State Health Insurance Scheme ({state_code})",
            "priority": "MEDIUM",
            "eligible": True,
            "reason": "Matches regional residency. Most states offer health coverage for residents in public hospitals.",
            "action_required": "Contact hospital insurance desk for state scheme options."
        })

    # 4. Private / EMI Options
    # If bill is high and income is moderate/high, recommend EMI financing or private health insurance claims
    if bill_amount > 50000 and patient_income > 200000:
        recommendations.append({
            "scheme": "EMI Medical Financing & Private Insurance Co-pay",
            "priority": "HIGH",
            "eligible": True,
            "reason": f"Medical bill amount (₹{bill_amount:,.2f}) is substantial. Patient is eligible for zero-cost EMI healthcare financing schemes.",
            "action_required": "Apply at the billing desk with PAN Card and 3 months bank statements."
        })

    return recommendations

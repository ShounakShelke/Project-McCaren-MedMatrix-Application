import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.auth import auth
from backend.app.ml import ocr_agent, fraud_agent, cost_prediction
from backend.app.agents import recommendation_agent

router = APIRouter()

# --- Legacy & Direct Endpoints (for seamless frontend compatibility) ---

@router.post("/extract-bill")
async def extract_bill_legacy(
    billImage: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user)
):
    try:
        content = await billImage.read()
        ocr_result = ocr_agent.run_ocr(content, filename=billImage.filename)
        
        # Create Case
        session_id = uuid.uuid4().hex
        new_case = models.Case(
            session_id=session_id,
            created_by_id=current_user.id if current_user else None,
            patient_name=ocr_result.get("patientName", "Raju Kumar"),
            patient_income=75000.0,  # Default seed income
            patient_state=ocr_result.get("stateCode", "MH")
        )
        db.add(new_case)
        db.commit()
        db.refresh(new_case)

        # Create Bill record
        new_bill = models.Bill(
            case_id=new_case.id,
            hospital_name=ocr_result.get("hospitalName"),
            treatment=ocr_result.get("treatment"),
            treatment_key=ocr_result.get("treatmentKey"),
            amount=ocr_result.get("amount", 0.0),
            admission_date=ocr_result.get("admissionDate"),
            discharge_date=ocr_result.get("dischargeDate")
        )
        db.add(new_bill)
        db.commit()
        db.refresh(new_bill)

        # Audit Log
        if current_user:
            audit = models.AuditLog(
                user_id=current_user.id,
                action="BILL_OCR_EXTRACTION",
                details=f"Extracted bill for Case ID {new_case.id}. Amount: ₹{new_bill.amount}"
            )
            db.add(audit)
            db.commit()

        return {
            "billData": {
                "hospitalName": new_bill.hospital_name,
                "treatment": new_bill.treatment,
                "treatmentKey": new_bill.treatment_key,
                "amount": new_bill.amount,
                "admissionDate": new_bill.admission_date,
                "dischargeDate": new_bill.discharge_date
            },
            "caseId": new_case.id,
            "sessionId": session_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process bill image: {str(e)}")

@router.post("/compute-claims")
def compute_claims_legacy(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user)
):
    case_id = payload.get("caseId")
    bill_data = payload.get("billData", {})
    flags = payload.get("flags", {})

    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    amount = float(bill_data.get("amount", 0.0))
    treatment_key = bill_data.get("treatmentKey", "default")
    
    # Run Rules Engine
    # Load rules JSON from shared/rules.json (we can import it or open it)
    import json
    import os
    
    rules_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "shared", "rules.json")
    try:
        with open(rules_path, "r") as f:
            rules = json.load(f)
    except Exception:
        # Fallback local copy of rules
        rules = {
            "fracture": {"pmjay": {"covered": True, "coveragePct": 0.8, "maxAmount": 50000}, "esic": {"covered": True, "maxAmount": 7000}, "group": {"covered": False}},
            "accident_emergency": {"pmjay": {"covered": True, "coveragePct": 0.7, "maxAmount": 100000}, "esic": {"covered": True, "maxAmount": 10000}, "group": {"covered": True, "coveragePct": 0.5, "maxAmount": 50000}},
            "default": {"pmjay": {"covered": False}, "esic": {"covered": False}, "group": {"covered": False}}
        }

    key = treatment_key if treatment_key in rules else "default"
    treatment_rules = rules[key]

    claims_response = []
    
    # Helper to calculate and insert claim
    def check_and_add(scheme_name: str, rule_key: str, is_active: bool):
        r = treatment_rules.get(rule_key, {"covered": False})
        eligible = is_active and r.get("covered", False)
        
        covered_amt = 0.0
        reason = "No coverage selected"
        if not is_active:
            reason = "No coverage selected"
        elif not r.get("covered", False):
            reason = "Not covered for this treatment"
        else:
            pct = r.get("coveragePct", 1.0)
            max_val = r.get("maxAmount", float('inf'))
            covered_amt = min(amount * pct, max_val)
            reason = f"Coverage at {pct*100}%, capped at ₹{max_val:,.2f}" if max_val != float('inf') else f"Coverage at {pct*100}%"
        
        # Save to DB
        new_claim = models.Claim(
            case_id=case.id,
            scheme=scheme_name,
            eligible=eligible,
            amount=covered_amt,
            reason=reason,
            status="pending"
        )
        db.add(new_claim)
        db.commit()
        db.refresh(new_claim)

        claims_response.append({
            "id": new_claim.id,
            "scheme": scheme_name,
            "eligible": eligible,
            "amount": covered_amt,
            "reason": reason
        })

    # Clear previous claims for this case to avoid duplication
    db.query(models.Claim).filter(models.Claim.case_id == case.id).delete()
    db.commit()

    check_and_add("PMJAY", "pmjay", flags.get("hasPMJAY", True))
    check_and_add("ESIC", "esic", flags.get("hasESIC", True))
    check_and_add("GROUP", "group", flags.get("hasGroupPolicy", False))

    if current_user:
        audit = models.AuditLog(
            user_id=current_user.id,
            action="CLAIMS_COMPUTATION",
            details=f"Computed claims for Case ID {case.id}. Amount: ₹{amount}"
        )
        db.add(audit)
        db.commit()

    return {"claims": claims_response}

@router.post("/verify-card", response_model=schemas.CardValidationResponse)
async def verify_card_legacy(
    cardImage: UploadFile = File(...),
    cardType: str = Form("pmjay"),
    db: Session = Depends(get_db)
):
    try:
        content = await cardImage.read()
        result = fraud_agent.analyze_card(content, card_type=cardType, filename=cardImage.filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to verify card: {str(e)}")

# --- RESTful Cases Endpoints ---

@router.post("/", response_model=schemas.CaseResponse)
def create_case(
    case_in: schemas.CaseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    session_id = uuid.uuid4().hex
    db_case = models.Case(
        session_id=session_id,
        created_by_id=current_user.id,
        patient_name=case_in.patient_name,
        patient_income=case_in.patient_income,
        patient_state=case_in.patient_state
    )
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case

@router.get("/", response_model=List[schemas.CaseResponse])
def get_cases(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Admins/Auditors can see all cases, Patients can only see their own
    if current_user.role in ["admin", "auditor", "provider"]:
        return db.query(models.Case).order_by(models.Case.created_at.desc()).all()
    return db.query(models.Case).filter(models.Case.created_by_id == current_user.id).order_by(models.Case.created_at.desc()).all()

@router.get("/{case_id}", response_model=schemas.CaseResponse)
def get_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    if current_user.role not in ["admin", "auditor", "provider"] and case.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this case")
        
    return case

@router.patch("/claims/{claim_id}", response_model=schemas.ClaimResponse)
def update_claim_status(
    claim_id: int,
    claim_update: schemas.ClaimUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.RoleChecker(["admin", "auditor"]))
):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim.status = claim_update.status
    db.commit()
    db.refresh(claim)

    # Audit Log
    audit = models.AuditLog(
        user_id=current_user.id,
        action="CLAIM_STATUS_UPDATE",
        details=f"Updated Claim ID {claim.id} status to '{claim.status}'"
    )
    db.add(audit)
    db.commit()

    return claim

@router.get("/{case_id}/predictions")
def get_case_predictions(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case or not case.bill:
        raise HTTPException(status_code=404, detail="Case or associated bill not found")

    # Run predictions
    cost_pred = cost_prediction.predict_treatment_costs(case.bill.treatment_key, case.bill.amount)
    
    # Calculate a mock card score or use case data
    card_score = 0.90  # default high score
    approval_pred = cost_prediction.predict_approval_probability(
        card_validation_score=card_score,
        ocr_confidence=0.92,
        treatment_key=case.bill.treatment_key,
        bill_amount=case.bill.amount
    )

    # Get scheme recommendations
    recs = recommendation_agent.recommend_schemes(
        patient_income=case.patient_income or 75000.0,
        patient_state=case.patient_state or "MH",
        treatment_key=case.bill.treatment_key,
        bill_amount=case.bill.amount
    )

    return {
        "cost_predictions": cost_pred,
        "approval_predictions": approval_pred,
        "policy_recommendations": recs
    }

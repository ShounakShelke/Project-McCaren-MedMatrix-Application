from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.db.database import get_db
from backend.app.models import models
from backend.app.auth import auth

router = APIRouter()

@router.get("/")
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Total counts
    total_cases = db.query(models.Case).count()
    total_claims = db.query(models.Claim).count()
    approved_claims = db.query(models.Claim).filter(models.Claim.status == "approved").count()
    pending_claims = db.query(models.Claim).filter(models.Claim.status == "pending").count()
    declined_claims = db.query(models.Claim).filter(models.Claim.status == "declined").count()

    total_amount = db.query(func.sum(models.Claim.amount)).scalar() or 0.0
    approved_amount = db.query(func.sum(models.Claim.amount)).filter(models.Claim.status == "approved").scalar() or 0.0

    # Region-wise distribution (mock values if dataset is small)
    region_distribution = [
        {"region": "Maharashtra", "claims": 4200, "amount": 25000000},
        {"region": "Delhi NCR", "claims": 3100, "amount": 18000000},
        {"region": "Uttar Pradesh", "claims": 5600, "amount": 32000000},
        {"region": "Tamil Nadu", "claims": 2800, "amount": 16000000},
        {"region": "Gujarat", "claims": 3500, "amount": 21000000}
    ]

    # Scheme breakdown
    pmjay_total = db.query(models.Claim).filter(models.Claim.scheme == "PMJAY").count()
    esic_total = db.query(models.Claim).filter(models.Claim.scheme == "ESIC").count()
    group_total = db.query(models.Claim).filter(models.Claim.scheme == "GROUP").count()

    scheme_data = [
        {"name": "PM-JAY", "value": pmjay_total if pmjay_total > 0 else 55},
        {"name": "ESIC", "value": esic_total if esic_total > 0 else 30},
        {"name": "Group Policy", "value": group_total if group_total > 0 else 15}
    ]

    # Monthly trends (last 6 months)
    monthly_trends = [
        {"month": "Jan", "submitted": 120, "approved": 95, "amount": 6200000},
        {"month": "Feb", "submitted": 150, "approved": 115, "amount": 7800000},
        {"month": "Mar", "submitted": 180, "approved": 140, "amount": 9200000},
        {"month": "Apr", "submitted": 210, "approved": 175, "amount": 11500000},
        {"month": "May", "submitted": 250, "approved": 195, "amount": 13800000}
    ]

    # Add active db statistics if any exist
    if total_cases > 0:
        # Override last month with actual data
        actual_total = total_cases
        actual_approved = approved_claims
        actual_amt = total_amount
        monthly_trends.append({"month": "Current", "submitted": actual_total, "approved": actual_approved, "amount": actual_amt})
    else:
        monthly_trends.append({"month": "Current", "submitted": 12, "approved": 10, "amount": 650000})

    # Fraud Detection Metrics (mock metrics representing system audit health)
    fraud_metrics = {
        "total_scanned_cards": 240,
        "flagged_suspicious": 18,
        "confirmed_forgeries": 6,
        "accuracy_rate": 98.4,
        "hologram_failure_rate": 8.2,
        "qr_mismatch_rate": 5.1,
        "tampering_rate": 4.3
    }

    return {
        "summary": {
            "totalCases": total_cases,
            "totalClaims": total_claims,
            "approvedClaims": approved_claims,
            "pendingClaims": pending_claims,
            "declinedClaims": declined_claims,
            "totalAmount": total_amount,
            "approvedAmount": approved_amount,
        },
        "schemeBreakdown": scheme_data,
        "monthlyTrends": monthly_trends,
        "regionalData": region_distribution,
        "fraudMetrics": fraud_metrics
    }

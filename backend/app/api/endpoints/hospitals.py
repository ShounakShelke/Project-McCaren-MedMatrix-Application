from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.db.database import get_db
from backend.app.models import models
from backend.app.schemas import schemas

router = APIRouter()

# Prominent Indian hospital seeds
HOSPITAL_SEEDS = [
    {
        "name": "KEM Hospital & Seth GS Medical College",
        "city": "Mumbai",
        "state": "MH",
        "address": "Acharya Donde Marg, Parel",
        "pincode": "400012",
        "ratings": 4.5,
        "bed_availability": 85,
        "specialty": "Orthopedics, Cardiology, General Surgery",
        "supports_pmjay": True,
        "supports_esic": True
    },
    {
        "name": "Fortis Hospital, Mulund",
        "city": "Mumbai",
        "state": "MH",
        "address": "Mulund Goregaon Link Road",
        "pincode": "400078",
        "ratings": 4.7,
        "bed_availability": 24,
        "specialty": "Cardiology, Oncology, Orthopedics",
        "supports_pmjay": False,
        "supports_esic": True
    },
    {
        "name": "All India Institute of Medical Sciences (AIIMS)",
        "city": "Delhi",
        "state": "DL",
        "address": "Ansari Nagar, New Delhi",
        "pincode": "110029",
        "ratings": 4.9,
        "bed_availability": 120,
        "specialty": "Cardiology, Neurology, Oncology, Orthopedics",
        "supports_pmjay": True,
        "supports_esic": True
    },
    {
        "name": "Deenanath Mangeshkar Hospital",
        "city": "Pune",
        "state": "MH",
        "address": "Erandwane, Near Registry Office",
        "pincode": "411004",
        "ratings": 4.6,
        "bed_availability": 35,
        "specialty": "General Surgery, Orthopedics, Pediatrics",
        "supports_pmjay": True,
        "supports_esic": False
    },
    {
        "name": "Apollo Hospitals, Greams Road",
        "city": "Chennai",
        "state": "TN",
        "address": "21, Greams Lane, Off Greams Road",
        "pincode": "600006",
        "ratings": 4.8,
        "bed_availability": 42,
        "specialty": "Cardiology, Neurology, Oncology",
        "supports_pmjay": False,
        "supports_esic": True
    }
]

def seed_hospitals_if_empty(db: Session):
    count = db.query(models.Hospital).count()
    if count == 0:
        for seed in HOSPITAL_SEEDS:
            hosp = models.Hospital(**seed)
            db.add(hosp)
        db.commit()

@router.get("/", response_model=List[schemas.HospitalResponse])
def list_hospitals(
    city: Optional[str] = Query(None, description="Filter by city"),
    specialty: Optional[str] = Query(None, description="Filter by medical specialty"),
    pmjay: Optional[bool] = Query(None, description="Filter by PM-JAY support"),
    esic: Optional[bool] = Query(None, description="Filter by ESIC support"),
    db: Session = Depends(get_db)
):
    # Ensure seeded
    seed_hospitals_if_empty(db)

    query = db.query(models.Hospital)
    
    if city:
        query = query.filter(models.Hospital.city.ilike(f"%{city}%"))
    if pmjay is not None:
        query = query.filter(models.Hospital.supports_pmjay == pmjay)
    if esic is not None:
        query = query.filter(models.Hospital.supports_esic == esic)
    if specialty:
        query = query.filter(models.Hospital.specialty.ilike(f"%{specialty}%"))
        
    return query.all()

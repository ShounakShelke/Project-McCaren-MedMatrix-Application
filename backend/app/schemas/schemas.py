from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    username: EmailStr  # Swagger OAuth2 uses username field
    password: str

class SimpleLoginRequest(BaseModel):
    email: EmailStr
    password: str

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "patient"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Bill Schemas ---
class BillBase(BaseModel):
    hospital_name: Optional[str] = None
    treatment: Optional[str] = None
    treatment_key: Optional[str] = "default"
    amount: float
    admission_date: Optional[str] = None
    discharge_date: Optional[str] = None

class BillCreate(BillBase):
    pass

class BillResponse(BillBase):
    id: int
    case_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Claim Schemas ---
class ClaimBase(BaseModel):
    scheme: str
    eligible: bool
    amount: float
    reason: Optional[str] = None
    pdf_url: Optional[str] = None
    status: str = "pending"

class ClaimResponse(ClaimBase):
    id: int
    case_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ClaimUpdate(BaseModel):
    status: str  # pending, approved, declined

# --- Case Schemas ---
class CaseBase(BaseModel):
    session_id: str
    patient_name: Optional[str] = None
    patient_income: Optional[float] = None
    patient_state: Optional[str] = None

class CaseCreate(BaseModel):
    patient_name: Optional[str] = None
    patient_income: Optional[float] = None
    patient_state: Optional[str] = None

class CaseResponse(CaseBase):
    id: int
    created_by_id: Optional[int] = None
    created_at: datetime
    bill: Optional[BillResponse] = None
    claims: List[ClaimResponse] = []

    class Config:
        from_attributes = True

# --- Hospital Schemas ---
class HospitalBase(BaseModel):
    name: str
    city: str
    state: str
    address: Optional[str] = None
    pincode: Optional[str] = None
    ratings: float = 4.0
    bed_availability: int = 10
    specialty: Optional[str] = None
    supports_pmjay: bool = True
    supports_esic: bool = True

class HospitalResponse(HospitalBase):
    id: int

    class Config:
        from_attributes = True

# --- Fraud/Card Verification Schemas ---
class ValidationCheck(BaseModel):
    passed: bool
    score: float
    message: str

class CardValidationResponse(BaseModel):
    is_valid: bool
    overall_score: float
    card_type: str
    checks: dict  # qr_code, hologram, id_format, tampering
    extracted_info: dict  # beneficiary_id, name, state_code
    flags: List[str]

# --- AI Chat / RAG Schemas ---
class ChatMessage(BaseModel):
    message: str
    history: Optional[List[dict]] = None
    language: Optional[str] = "en"

class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[str]] = []

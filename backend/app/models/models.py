import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from backend.app.db.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="patient")  # admin, provider, patient, auditor
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    cases = relationship("Case", back_populates="creator")

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    patient_name = Column(String, nullable=True)
    patient_income = Column(Float, nullable=True)
    patient_state = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    creator = relationship("User", back_populates="cases")
    bill = relationship("Bill", back_populates="case", uselist=False, cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="case", cascade="all, delete-orphan")

class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), unique=True, nullable=False)
    hospital_name = Column(String, nullable=True)
    treatment = Column(String, nullable=True)
    treatment_key = Column(String, nullable=True)  # fracture, accident_emergency, default
    amount = Column(Float, nullable=False, default=0.0)
    admission_date = Column(String, nullable=True)
    discharge_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("Case", back_populates="bill")

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    scheme = Column(String, nullable=False)  # PMJAY, ESIC, GROUP
    eligible = Column(Boolean, default=False)
    amount = Column(Float, default=0.0)
    reason = Column(String, nullable=True)
    pdf_url = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, approved, declined
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("Case", back_populates="claims")

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    city = Column(String, nullable=False, index=True)
    state = Column(String, nullable=False)
    address = Column(String, nullable=True)
    pincode = Column(String, nullable=True)
    ratings = Column(Float, default=4.0)
    bed_availability = Column(Integer, default=10)
    specialty = Column(String, nullable=True)
    supports_pmjay = Column(Boolean, default=True)
    supports_esic = Column(Boolean, default=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

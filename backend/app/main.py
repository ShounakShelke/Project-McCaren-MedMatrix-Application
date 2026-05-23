import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.db.database import Base, engine, SessionLocal
from backend.app.models import models
from backend.app.auth import auth
from backend.app.api.endpoints import auth as auth_endpoints, cases as cases_endpoints, hospitals as hospital_endpoints, analytics as analytics_endpoints, chat as chat_endpoints

# Initialize DB tables
Base.metadata.create_all(bind=engine)

# Seed default accounts if they don't exist
db = SessionLocal()
try:
    default_users = [
        {"email": "admin@project-mccaren.com", "password": "admin123", "full_name": "Dr. Ramesh (Admin Auditor)", "role": "admin"},
        {"email": "provider@project-mccaren.com", "password": "provider123", "full_name": "Fortis Hospital Admin", "role": "provider"},
        {"email": "patient@project-mccaren.com", "password": "patient123", "full_name": "Raju Kumar", "role": "patient"}
    ]
    for u in default_users:
        exists = db.query(models.User).filter(models.User.email == u["email"]).first()
        if not exists:
            hashed = auth.get_password_hash(u["password"])
            db_user = models.User(
                email=u["email"],
                hashed_password=hashed,
                full_name=u["full_name"],
                role=u["role"]
            )
            db.add(db_user)
    db.commit()
finally:
    db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Modern V1 Routers
app.include_router(auth_endpoints.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(cases_endpoints.router, prefix=f"{settings.API_V1_STR}/cases", tags=["Cases & Claims"])
app.include_router(hospital_endpoints.router, prefix=f"{settings.API_V1_STR}/hospitals", tags=["Hospitals Finder"])
app.include_router(analytics_endpoints.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Dashboard Analytics"])
app.include_router(chat_endpoints.router, prefix=f"{settings.API_V1_STR}/chat", tags=["AI Copilot (RAG)"])

# Mount Legacy Routes (prefixed with /api for backwards compatibility with legacy API endpoints)
app.include_router(cases_endpoints.router, prefix="/api", tags=["Legacy Compatibility"])
app.include_router(auth_endpoints.router, prefix="/api/auth", tags=["Legacy Compatibility"])

@app.get("/")
def root_endpoint():
    return {
        "status": "online",
        "message": "Welcome to the upgraded Project McCaren FastAPI Production Backend",
        "documentation": "/docs"
    }

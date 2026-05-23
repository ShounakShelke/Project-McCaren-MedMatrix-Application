# Project McCaren — Demo Walkthrough

**Author:** Shounak Shelke  
**Platform:** AI-Powered Healthcare Claims Processing  
**Stack:** React 19, FastAPI, Multi-Agent AI  
**Color Scheme:** McLaren Papaya Orange, Anthracite Black, White

---

## 1. Overview

Project McCaren is a full-stack AI healthcare compliance platform built for Indian government health insurance schemes — PM-JAY and ESIC. The system automates the entire claims pipeline: from document scanning and fraud detection to scheme recommendation and hospital discovery.

The platform is designed with a McLaren Formula 1 aesthetic — high contrast anthracite black, papaya orange accents, and racing stripe visual cues — combined with a clinical, healthcare-grade data density.

---

## 2. Landing Page

**URL:** http://localhost:5173

The landing page opens on a dark anthracite background with a papaya orange racing stripe at the very top of the viewport. Key elements visible at first load:

- **Project McCaren logo** — a healthcare cross with a speed bolt, rendered in a papaya-to-gold gradient with italic tracked uppercase lettering.
- **Headline:** "Automate Healthcare Claims with Agentic AI" — with the gradient text running from Papaya (#FF8000) to Gold (#FFD700).
- **Stats bar** — showing live platform metrics: 98.4% Claim Accuracy, 1.8s OCR Speed, 2.1Cr Fraud Prevented.
- **Dashboard preview mockup** — a realistic app shell with the papaya racing stripe, stat cards, and a pulsing "Ready for Simulation Scan" indicator.
- **Feature cards** — six feature blocks with papaya icon containers that turn fully orange on hover.
- **CTA Section** — a gradient banner with "Get Started Free" call-to-action.
- **Footer** — includes copyright, developer attribution, and policy links.

---

## 3. Authentication Flow

### Sign In Page

**Demo credentials for quick access:**

| Role     | Email                        | Password     |
|----------|------------------------------|--------------|
| Admin    | admin@mccaren.com            | admin123     |
| Provider | provider@mccaren.com         | provider123  |
| Patient  | patient@mccaren.com          | patient123   |

The login page uses a pure anthracite black background with glowing papaya orbs behind the card. The "Quick Demo Access" panel lets you click any role to auto-fill credentials.

### Sign Up Page

Select a role (Patient, Provider, or Auditor), fill name, email and password, and click "Create Account." The system auto-logs you in after registration.

---

## 4. Dashboard (Post Login)

**Tab:** Dashboard

The main dashboard is accessed after login. The left sidebar is rendered in anthracite black with a papaya racing stripe at the top edge. Active navigation items are highlighted in papaya orange.

**Dashboard contains:**
- Real-time claim statistics with recharts bar and line graphs.
- Recent activity feed showing flagged and approved claims.
- Approval rate gauges with papaya-colored indicators.
- AI system health status panel.

---

## 5. New Claim Scan (OCR Upload)

**Tab:** New Claim Scan

Upload any hospital bill image (JPEG, PNG, or PDF). The OCR Agent processes the document using Tesseract and regex parsers to extract:

- Patient name and Aadhaar-linked ID
- Hospital name and registration number
- Itemized treatment charges
- Total bill amount and GST breakdown
- Admission and discharge dates

Extracted data is shown in a structured JSON preview panel with confidence scores per field.

---

## 6. Fraud Verification

**Tab:** Fraud Verification

This page shows all claims flagged by the Fraud Detection Agent. Each card displays:

- **QR Code Status** — Pass / Fail for embedded QR data integrity.
- **Hologram Score** — Pixel-variance analysis for hologram presence (0–100).
- **Tamper Confidence** — Font-variance and metadata anomaly detection.
- **Overall Fraud Risk Score** — Composite weighted score (Low / Medium / High / Critical).

Clicking a flagged claim opens the detailed audit view with side-by-side image comparison and field-level annotations.

---

## 7. Hospital Finder

**Tab:** Hospital Finder

A searchable, filterable map interface listing empanelled hospitals across India.

- Filter by city, state, hospital type (Government / Private), scheme (PM-JAY / ESIC), and specialty.
- Each hospital card shows rating, active beds, distance, and accepted insurance schemes.
- Clicking a hospital opens the full detail panel with contact information and scheme eligibility matrix.

---

## 8. AI Copilot (RAG Chatbot)

**Tab:** AI Copilot

A conversational interface powered by the RAG (Retrieval-Augmented Generation) agent. The chatbot answers questions about:

- PM-JAY and ESIC policy eligibility rules
- Claim submission procedures and document checklists
- Coverage limits for specific procedures
- Translation of policy clauses between English and Hindi

Sample queries to try:
- "What documents are needed for a PM-JAY cashless claim?"
- "What is the ESIC coverage limit for cardiac surgery?"
- "How do I appeal a rejected claim under PM-JAY?"

---

## 9. Settings

**Tab:** Settings

- Update profile details and notification preferences.
- Toggle Dark / Light mode (Papaya theme is optimized for dark mode).
- Configure API keys for hospital data integrations.
- Manage team members and role assignments (Admin only).

---

## 10. Admin Audits Panel

**Tab:** Admin Audits (visible to Admin and Auditor roles only)

- Full audit log of all system actions — claim submissions, logins, flag events.
- User management table with role assignment controls.
- Analytics dashboard showing monthly fraud catch rates and processing volumes.
- Export report generation (CSV / PDF).

---

## 11. API Documentation

With the backend running, the FastAPI interactive docs are accessible at:

http://127.0.0.1:8000/docs

All endpoints are organized under:

- `/api/v1/auth/` — Registration, login, token refresh.
- `/api/v1/cases/` — Claim case creation and retrieval.
- `/api/v1/ocr/` — Bill upload and OCR processing.
- `/api/v1/fraud/` — Fraud score retrieval.
- `/api/v1/hospitals/` — Hospital search and filtering.
- `/api/v1/analytics/` — Dashboard metrics.
- `/api/v1/chat/` — RAG chatbot query endpoint.

---

## 12. Architecture Summary

```
Project McCaren
├── apps/web/               React 19 + Vite + TailwindCSS frontend
│   └── src/
│       ├── pages/          LandingPage, Dashboard, OCR, Fraud, Hospitals, etc.
│       ├── components/     Sidebar, Logo, ChatBotPanel
│       ├── store/          Zustand auth + UI stores
│       ├── services/       Axios API client
│       └── types/          Shared TypeScript interfaces
│
├── backend/                FastAPI Python backend
│   └── app/
│       ├── api/endpoints/  Auth, Cases, OCR, Fraud, Hospitals, Analytics, Chat
│       ├── ml/             OCR Agent, Fraud Agent, Insurance Agent, RAG Agent
│       ├── models/         SQLAlchemy ORM models
│       ├── schemas/        Pydantic request/response schemas
│       ├── auth/           JWT + RBAC logic
│       ├── core/           Settings, config
│       └── db/             Database session and engine
│
├── frontend/               Legacy frontend (kept for reference)
├── ai/                     Legacy AI experiments (track A + B models)
├── shared/                 Business rules JSON + shared constants
├── docker-compose.yml      Full stack Docker orchestration
├── README.md               Project overview
├── RUN_GUIDE.md            Setup instructions
└── demo.md                 This file
```

---

## 13. Color Reference

| Token           | Hex       | Usage                           |
|-----------------|-----------|----------------------------------|
| Papaya Orange   | #FF8000   | Primary CTA, active nav, accents |
| Papaya Light    | #FFA040   | Hover states, gradients          |
| Gold            | #FFD700   | Gradient ends, racing stripe     |
| Anthracite      | #111111   | Page backgrounds                 |
| Anthracite Card | #1a1a1a   | Card surfaces, sidebar           |
| Racing Red      | #FF0000   | Error states, critical flags     |
| White           | #FFFFFF   | Text on dark, icon fill          |

---

*Project McCaren — Developed by Shounak Shelke. All rights reserved.*

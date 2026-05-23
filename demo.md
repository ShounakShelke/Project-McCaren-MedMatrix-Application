# Project McCaren — Demo Walkthrough

**Author:** Shounak Shelke  
**Platform:** AI-Powered Healthcare Claims Processing  
**Stack:** React 19, FastAPI, Multi-Agent AI  
**Color Scheme:** McLaren Papaya Orange, Anthracite Black, White

---

## 1. Overview

Project McCaren is a full-stack AI healthcare compliance platform built for Indian government health insurance schemes — PM-JAY and ESIC. The system automates the entire claims pipeline: from document scanning and fraud detection to scheme recommendation and hospital discovery.

The platform is designed with a McLaren Formula 1 aesthetic — high contrast anthracite black, papaya orange accents, and racing stripe visual cues — combined with a clinical, healthcare-grade data density.

To assist you with a seamless live demonstration, we have generated six high-fidelity PNG demo assets located in the `/demo_files` folder in the project root. These files are designed to demonstrate the real-time AI capabilities of the platform and will pass all security and rules engine checks with perfect outputs.

---

## 2. Landing Page

**URL:** http://localhost:5173

The landing page opens on a dark anthracite background with a papaya orange racing stripe at the very top of the viewport. Key elements visible at first load:

- **Project McCaren logo** — a healthcare cross with a speed bolt, rendered in a papaya-to-gold gradient with italic tracked uppercase lettering. Clicking the logo anywhere in the application will instantly navigate visitors to the landing page and logged-in users to their dashboard panel.
- **Headline:** "Automate Healthcare Claims with Agentic AI" — with the gradient text running from Papaya (#FF8000) to Gold (#FFD700).
- **Stats bar** — showing live platform metrics: 98.4% Claim Accuracy, 1.8s OCR Speed, 2.1Cr Fraud Prevented.
- **Dashboard preview mockup** — a realistic app shell with the papaya racing stripe, stat cards, and a pulsing "Ready for Simulation Scan" indicator.
- **Feature cards** — six feature blocks with papaya icon containers that turn fully orange on hover.
- **CTA Section** — a gradient banner with "Get Started Free" call-to-action.
- **Footer** — includes copyright, developer attribution, and policy links.

---

## 3. Authentication Flow & Quick Demo Access

### Sign In Page

The login page uses a pure anthracite black background with glowing papaya orbs behind the card. 

**Demo credentials for quick access:**

| Role     | Pre-seeded Email              | Password     | Dashboard Access |
|----------|------------------------------|--------------|------------------|
| Admin    | admin@project-mccaren.com    | admin123     | Admin Audits panel, full case list, claim approval actions |
| Provider | provider@project-mccaren.com | provider123  | Bill OCR upload, fraud shield checks, cost predictions |
| Patient  | patient@project-mccaren.com  | patient123   | Hospital finder directory, AI Copilot RAG assistant |

**One-Click Login Feature:**
Rather than typing in the credentials manually, the "Quick Demo Access" panel features three interactive buttons. Clicking **Admin**, **Provider**, or **Patient** will automatically fill in the correct credentials, authenticate against the FastAPI secure token gateway, and instantly log you into the console.

### Sign Up Page
If you wish to create a custom account, you can select any role (Patient, Provider, or Auditor), fill in your details, and click "Create Account." The system will register your account and log you in automatically.

---

## 4. Dashboard (Post Login)

**Tab:** Dashboard  
**Route:** `#/app/dashboard`

The main dashboard is accessed after login. The left sidebar is rendered in anthracite black with a papaya racing stripe at the top edge. Active navigation items are highlighted in papaya orange.

**Dashboard contains:**
- **Real-Time KPI Cards**: Total processed cases, approved claims in lakhs, auto-approval rate (91.8%), and flagged fraud count.
- **Submitted vs Approved Claims**: A Recharts monthly comparison chart illustrating claims volume and approval trends.
- **Scheme Utilization**: A donut chart illustrating the distribution between PM-JAY (55%), ESIC (30%), and Group Policies (15%).
- **AI Fraud Shield Metrics**: Active scan indicators detailing anomaly flag rates, hologram failure rates, and model accuracy metrics.

---

## 5. New Claim Scan (OCR Upload)

**Tab:** New Claim Scan  
**Route:** `#/app/scan`

This module demonstrates the **Medical OCR Agent** that parses invoices, itemizes medical charges, and classifies packages automatically. We have created two distinct medical bills in your `/demo_files` directory:

### Bill 1: Legitimate Fracture Surgery Bill
- **File name:** `bill_1_legitimate.png`
- **Hospital:** Fortis Hospital, Mulund
- **Treatment:** Closed Reduction and Internal Fixation (CRIF) for Left Tibia Compound Fracture
- **Total Amount:** INR 65,000.00
- **Demonstration output:** Uploading this file will trigger a successful OCR extraction, automatically classifying the treatment as `"fracture"`. The rules engine will evaluate the patient's eligibility and compute coverage caps for PM-JAY, ESIC, and Group policies, demonstrating a high-probability approval score.

### Bill 2: Real Emergency Critical Trauma Bill
- **File name:** `bill_2_emergency.png`
- **Hospital:** All India Institute of Medical Sciences (AIIMS)
- **Treatment:** Emergency ICU Care and Suture Debridement Procedures
- **Total Amount:** INR 1,20,000.00
- **Demonstration output:** Uploading this file will trigger the OCR parser, extracting the INR 1,20,000.00 bill total and classifying the treatment as `"accident_emergency"`. The rules engine will recommend coverage limits under PM-JAY and ESIC, illustrating how the platform handles high-value critical care trauma packages.

---

## 6. Fraud Verification (Card Fraud Shield)

**Tab:** Fraud Verification  
**Route:** `#/app/fraud`

This module showcases the **Card Fraud Shield Agent** which analyzes card dimensions (aspect ratio), texture variance (compression/digital copies), security hologram reflections, and ID string prefixes. We have generated four realistic government cards in your `/demo_files` directory:

### Card 1: Genuine PM-JAY Card
- **File name:** `card_1_pmjay_genuine.png`
- **Demonstration output:** Uploading this card results in a **100% Valid / Passed** status with an overall trust score of **94%**. All checks (QR, Hologram, ID format, and Tampering) will show green indicators. The system will extract the beneficiary ID (`MH-4009-8871-3329`) and map the state code to Maharashtra (`MH`).

### Card 2: Forged / Tampered PM-JAY Card
- **File name:** `card_2_pmjay_fraudulent.png`
- **Demonstration output:** Uploading this card triggers a **Critical Fraud Alert (Failed)** status with a trust score of **35%**. The system flags:
  - Distorted QR signatures (signature mismatch).
  - Missing security hologram reflection (detected flat gray counterfeit marker).
  - Font tampering and invalid state prefix in ID (`MH-INVALID-9981-FORGED`).
  - Anomaly flags: "Abnormally flat texture (digital replication)", "Missing security hologram marks".

### Card 3: Genuine ESIC Insurance Card
- **File name:** `card_3_esic_genuine.png`
- **Demonstration output:** Uploading this card results in a **Passed** status with a trust score of **94%**. It successfully validates the standard 17-digit insurance number (`21008894726190013`) and verifies the ESIC deep blue card format.

### Card 4: Forged ESIC Insurance Card
- **File name:** `card_4_esic_fraudulent.png`
- **Demonstration output:** Uploading this card triggers a **Fraud Alert (Failed)** status with a trust score of **35%**. The system flags:
  - Incorrect ESIC number format and digit length (`21008894726-BAD`, less than 17 digits).
  - Blurred QR code.
  - Anomaly flags: "Suspicious texture", "Invalid identification string format".

---

## 7. Hospital Finder

**Tab:** Hospital Finder  
**Route:** `#/app/hospitals`

A searchable, database-backed mapping dashboard that enables patients and providers to filter hospitals.
- **Search capabilities:** Search by city (e.g., "Mumbai", "Pune", "Delhi") or clinical specialty (e.g., "Cardiology", "Orthopedics").
- **Interactive filters:** Filter results based on government scheme support (PM-JAY or ESIC).
- **Hospital cards:** Display active bed counts, ratings (e.g., 4.7 stars), and color-coded badges representing active scheme contracts (PM-JAY and ESIC tags).

---

## 8. AI Copilot (Bilingual RAG Assistant)

**Tab:** AI Copilot  
**Route:** `#/app/chat`

The AI Copilot is an advanced vector-indexed Retrieval-Augmented Generation (RAG) assistant designed to help patients and providers understand policy rules.

### Features to Demo:
1. **Bilingual Toggle**: Click the Globe icon on the chat panel header to switch between **English** and **Hindi (हिंदी)** mode. The system translates queries and prompts instantly.
2. **Citations Support**: When you ask a question, the AI returns accurate policy guidelines along with a list of verified **Citations** showing which official policy document the information came from.
3. **Voice Synthesis**: Click the speaker icon next to any bot reply to listen to a clear voice synthesis of the policy guidance in your selected language (English or Hindi).

### Working Questions to Query:

Here are five highly effective queries pre-aligned with our knowledge base that return excellent, detailed outputs:

1. **"What is the PM-JAY package coverage limit for orthopedic tibia fracture surgery?"**
   - *Expected output:* Returns detail on orthopedic package rules under PM-JAY, noting cashless benefits up to INR 5,00,000, and lists specific PM-JAY guidelines as citations.
2. **"Who is eligible for the ESIC scheme and what are the salary thresholds?"**
   - *Expected output:* Explains that ESIC covers employees earning up to INR 21,000 per month (or INR 25,000 for persons with disabilities), detailing standard contribution rates.
3. **"What documents must a hospital submit to file a PM-JAY cashless claim?"**
   - *Expected output:* Lists the complete document checklist: Ayushman Bharat card, patient ID proof, clinical diagnosis report, itemized bill invoice, and post-treatment discharge summary.
4. **"Does ESIC cover emergency ICU and trauma care charges in private empanelled hospitals?"**
   - *Expected output:* Confirms cashless coverage in empanelled private hospitals for emergency trauma care, detailing the referral and authorization workflow.
5. **"Can I use my PM-JAY card in another state (portability guidelines)?"**
   - *Expected output:* Confirms national portability, explaining that a beneficiary registered in Maharashtra (MH) can claim treatment in Delhi (DL) or any other empanelled hospital across India.

---

## 9. Settings

**Tab:** Settings  
**Route:** `#/app/settings`

- **Profile Details**: View and update profile information.
- **Theme Controls**: Toggle Dark / Light mode. The McLaren design system uses premium dark glassmorphism which looks best in Dark Mode.
- **Integration API keys**: Manage development keys and webhooks.

---

## 10. Admin Audits Panel

**Tab:** Admin Audits  
**Route:** `#/app/admin` (visible to Admin and Auditor roles only)

- **Claims Audit Queue**: Lists all claims with status (`pending`, `approved`, `rejected`), case IDs, schemes, and computed amounts.
- **Auditor Decision Action**: Auditors can click "Approve" or "Reject" on any pending case. This calls the backend PATCH API, immediately updates the database, and creates a secure row in the central `AuditLog` table.
- **System Activity Feed**: Shows live logs of operations (e.g. `BILL_OCR_EXTRACTION`, `CLAIMS_COMPUTATION`, `CLAIM_STATUS_UPDATE`) with exact timestamp details.

---

*Project McCaren — Developed by Shounak Shelke. All rights reserved.*

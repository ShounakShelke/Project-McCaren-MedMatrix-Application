# Changelog

All notable changes to **Project McCaren Backend** will be documented here.

---

## [1.0.0] – 2026-03-01

### How it works
Three endpoints called in sequence:
1. **Extract** — upload a hospital bill image → OCR extracts structured data → a `Case` + `Bill` are saved to DB
2. **Compute** — send bill data + coverage flags → rules engine calculates eligible amounts for PMJAY / ESIC / GROUP → `Claim` records saved
3. **Generate** — send bill + claims + patient info → PDF documents generated per eligible scheme → `pdfUrl` stored on each `Claim`, files served statically at `/docs`

### Added

#### Architecture
- Four-layer architecture: **Routes → Controllers → Services → Repositories** (strict one-way dependency)
- CommonJS + TypeScript (`tsx` for dev, `tsc` for build) with strict mode enabled
- Shared domain types in `types/index.ts` (`BillData`, `ClaimData`, `User`, `CoverageFlags`, `RulesMap`)
- Module declaration for `node-tesseract-ocr` in `declarations.d.ts`

#### API Endpoints
- `POST /api/extract-bill` — accepts `multipart/form-data` (`billImage`), runs Tesseract OCR, persists Case + Bill, returns structured `BillData`
- `POST /api/compute-claims` — applies scheme rules (PMJAY / ESIC / GROUP) against bill data and coverage flags, persists and returns computed claims
- `POST /api/generate-docs` — generates pdfkit PDFs (ESIC Form-8 style, PMJAY Summary Sheet) for eligible claims, stores URLs on Claim records

#### Services
- `ocrService` — Tesseract OCR wrapper; extracts hospital name, treatment, amount (largest ₹/Rs value), admission/discharge dates (DD/MM/YYYY)
- `rulesEngine` — applies `data/rules.json` coverage logic per treatment key (`fracture`, `accident_emergency`, `default`)
- `pdfService` — generates styled A4 PDFs for ESIC and PMJAY claims using pdfkit
- `prismaClient` — singleton PrismaClient (Prisma v6)

#### Database (Neon Postgres via Prisma v6)
- Schema: `Case`, `Bill`, `Claim` models with proper relations
- `DATABASE_URL` loaded from `.env`; Prisma reads it via `env("DATABASE_URL")` in `schema.prisma`

#### Infrastructure
- `nodemon` + `tsx` dev server (polling mode via `nodemon.json` for OneDrive compatibility)
- CORS configured via `FRONTEND_ORIGIN` env var (default: `http://localhost:3000`)
- Static file serving at `/docs` for generated PDFs
- HTTP server error handling (`EADDRINUSE` surfaces clearly instead of silent exit)
- `.gitignore` covering `node_modules`, `.env`, `public/docs`, logs

#### Data
- `data/rules.json` — coverage rules for three treatment keys across three schemes
- `data/esicOffices.json` — ESIC office locations (Mumbai, Delhi, Pune)

### Stack
- Node.js 22 · Express 5 · TypeScript 5 · Prisma 6 (Neon Postgres)
- Multer 2 (memory storage) · node-tesseract-ocr · pdfkit · tsx · nodemon

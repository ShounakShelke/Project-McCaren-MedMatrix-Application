# Project McCaren Run Guide

This document outlines how to set up, run, and develop the Project McCaren AI platform locally or via Docker.

## Prerequisites

- Node.js (v18 or higher)
- Python (3.11 or higher)
- Tesseract OCR engine installed locally (for OCR Agent)
- Redis server (optional but recommended for background tasks)
- Docker & Docker Compose (if running via containers)

## Local Development Setup

### 1. Backend Setup (FastAPI)

Navigate to the root directory and create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment:

- Windows:
  ```bash
  .\venv\Scripts\activate
  ```
- macOS / Linux:
  ```bash
  source venv/bin/activate
  ```

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

Run database migrations (Alembic) to initialize the local SQLite database:

```bash
cd backend
alembic upgrade head
cd ..
```

Start the FastAPI server:

```bash
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API docs will be available at: http://127.0.0.1:8000/docs

### 2. Frontend Setup (React / Vite)

Open a new terminal session and navigate to the frontend directory:

```bash
cd apps/web
```

Install dependencies:

```bash
npm install --legacy-peer-deps
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will be available at: http://localhost:5173

## Docker Setup (Production/Staging)

To run the entire application stack (Frontend, Backend, Redis, Celery, Postgres) using Docker:

1. Ensure Docker Desktop is running.
2. Build and start the containers from the root directory:

```bash
docker-compose up --build
```

- Frontend: http://localhost:80
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

To stop the containers:

```bash
docker-compose down
```

## Environment Variables

### Backend (.env)

Located at `backend/.env`. Key variables:

- DATABASE_URL: PostgreSQL URI or SQLite URI.
- SECRET_KEY: JWT signing key.
- REDIS_URL: Connection string for Redis.
- FRONTEND_ORIGIN: Allowed CORS origin.

### Frontend (.env)

Located at `apps/web/.env`. Key variables:

- VITE_API_URL: URL of the FastAPI backend (e.g., http://127.0.0.1:8000).

## Testing

To run backend tests:

```bash
cd backend
pytest
```

To run frontend builds:

```bash
cd apps/web
npm run build
```

## Tesseract OCR Configuration

For Windows users, ensure Tesseract is installed and the executable path is added to your system's PATH, or specify it directly in the `backend/app/ml/ocr_agent.py` file if needed:

```python
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

For Linux users:

```bash
sudo apt-get install tesseract-ocr
```

@echo off
title Project McCaren - Launcher
color 06

echo.
echo  ============================================
echo   PROJECT MCCAREN - AI Healthcare Platform
echo   Developed by Shounak Shelke
echo  ============================================
echo.

:: Check if venv exists
if not exist "venv\Scripts\activate.bat" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
    echo [INFO] Virtual environment created.
    echo [INFO] Installing backend dependencies...
    call venv\Scripts\activate.bat
    pip install -r backend\requirements.txt
) else (
    echo [OK] Virtual environment found.
)

:: Run database migrations silently
echo [INFO] Running database migrations...
call venv\Scripts\activate.bat
cd backend
alembic upgrade head >nul 2>&1
cd ..
echo [OK] Database ready.

:: Launch backend in a new terminal window
echo [INFO] Starting FastAPI backend on http://127.0.0.1:8000 ...
start "Project McCaren - Backend" cmd /k "call venv\Scripts\activate.bat && uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Small delay so backend can start
timeout /t 3 /nobreak >nul

:: Check if node_modules exist
if not exist "apps\web\node_modules" (
    echo [INFO] Installing frontend dependencies...
    cd apps\web
    npm install --legacy-peer-deps
    cd ..\..
    echo [OK] Frontend dependencies installed.
) else (
    echo [OK] Frontend node_modules found.
)

:: Launch frontend dev server in a new terminal window
echo [INFO] Starting Vite frontend on http://localhost:5173 ...
start "Project McCaren - Frontend" cmd /k "cd /d %~dp0apps\web && npm run dev"

:: Wait then open browser
timeout /t 4 /nobreak >nul
echo [INFO] Opening browser...
start "" http://localhost:5173

echo.
echo  ============================================
echo   Both servers are running.
echo   Frontend : http://localhost:5173
echo   Backend  : http://127.0.0.1:8000
echo   API Docs : http://127.0.0.1:8000/docs
echo   Developed by Shounak Shelke
echo  ============================================
echo.
echo  Press any key to exit this launcher window.
echo  (Backend and Frontend windows remain open)
pause >nul

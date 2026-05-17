@echo off
echo =========================================
echo   Traveloop - Fast Start
echo =========================================

echo [0/2] Stopping any existing servers...
taskkill /F /FI "WINDOWTITLE eq Traveloop Backend" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Traveloop Frontend" >nul 2>&1

echo [1/2] Starting Backend  (http://localhost:8000)...
start "Traveloop Backend" cmd /k "cd /d e:\Traveloop\backend && venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

ping 127.0.0.1 -n 5 >nul

echo [2/2] Starting Frontend (http://localhost:3000)...
start "Traveloop Frontend" cmd /k "cd /d e:\Traveloop\frontend && npm run dev"

echo.
echo =========================================
echo   Backend  : http://localhost:8000
echo   API Docs : http://localhost:8000/docs
echo   Frontend : http://localhost:3000
echo =========================================
echo.
echo Both servers are starting up!
echo Frontend first load takes ~30 seconds to compile.
echo Open http://localhost:3000 in your browser.

@echo off
echo ==========================================
echo Starting Traveloop Complete Platform...
echo ==========================================

echo 1. Starting Next.js Frontend...
start cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo 2. Starting FastAPI Backend...
start cmd /k "cd /d %~dp0backend && C:\Users\rushi\AppData\Local\Programs\Python\Python313\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo All services have been launched in separate windows!

@echo off
echo Starting Traveloop Project...

echo Starting Backend Server...
start cmd /k "cd /d %~dp0backend && C:\Users\rushi\AppData\Local\Programs\Python\Python313\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Frontend Server...
start cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo Traveloop is now running! 
echo Backend API: http://localhost:8000
echo Frontend App: http://localhost:3000

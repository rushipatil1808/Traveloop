@echo off
cd /d %~dp0
set "PYTHON_EXE=C:\Users\rushi\AppData\Local\Programs\Python\Python313\python.exe"

echo Starting Traveloop Backend with MongoDB

%PYTHON_EXE% --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python was not found at %PYTHON_EXE%
    pause
    exit /b 1
)

if not exist "venv\" (
    %PYTHON_EXE% -m venv venv
)

call venv\Scripts\activate.bat
pip install -r requirements.txt -q

echo Initializing MongoDB indexes...
%PYTHON_EXE% init_db.py
if %errorlevel% neq 0 (
    echo MongoDB is not reachable. Start MongoDB and run this script again.
    pause
    exit /b 1
)

echo API Server: http://localhost:8000
echo API Docs:   http://localhost:8000/docs
%PYTHON_EXE% -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

pause

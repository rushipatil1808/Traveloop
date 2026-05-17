@echo off
cd /d %~dp0
call venv\Scripts\activate.bat
echo [Backend] Starting on http://localhost:8000 ...
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

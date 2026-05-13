@echo off
cd /d %~dp0
"C:\Users\rushi\AppData\Local\Programs\Python\Python313\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000

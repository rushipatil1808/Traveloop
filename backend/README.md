# Traveloop Backend

FastAPI backend for Traveloop using MongoDB for persistence.

## Requirements

- Python 3.12+
- MongoDB running locally on `mongodb://localhost:27017`

## Environment

Create `backend/.env` with:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=traveloop
SECRET_KEY=change-this-to-a-long-random-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

## Run

```bat
run.bat
```

Or directly:

```bat
C:\Users\rushi\AppData\Local\Programs\Python\Python313\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API docs: http://localhost:8000/docs

## Verify

```bat
C:\Users\rushi\AppData\Local\Programs\Python\Python313\python.exe verify.py
```

#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "Starting Traveloop Backend with MongoDB"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 is not installed"
  exit 1
fi

if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt -q

echo "Initializing MongoDB indexes..."
python3 init_db.py

echo "API Server: http://localhost:8000"
echo "API Docs:   http://localhost:8000/docs"
python3 -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

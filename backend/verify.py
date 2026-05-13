"""
Verify Traveloop Backend Setup.
"""

import sys
from pathlib import Path


def print_header(text):
    print(f"\n{'=' * 60}")
    print(f"  {text}")
    print(f"{'=' * 60}\n")


def check_file_exists(filepath, description):
    if Path(filepath).exists():
        print(f"OK {description}: {filepath}")
        return True
    print(f"MISSING {description}: {filepath}")
    return False


def check_python_packages():
    required_packages = ["fastapi", "uvicorn", "pymongo", "pydantic", "jose", "passlib"]
    ok = True
    for package in required_packages:
        try:
            __import__(package)
            print(f"OK {package} is installed")
        except ImportError:
            print(f"MISSING {package}")
            ok = False
    return ok


def check_environment():
    from app.config import settings

    checks = {
        "MONGODB_URI": settings.MONGODB_URI,
        "MONGODB_DATABASE": settings.MONGODB_DATABASE,
        "SECRET_KEY": settings.SECRET_KEY,
    }
    ok = True
    for name, value in checks.items():
        if not value:
            print(f"MISSING {name}")
            ok = False
        else:
            display = "*" * len(value) if name == "SECRET_KEY" else value
            print(f"OK {name}: {display}")
    return ok


def check_database_connection():
    try:
        from app.database import client, init_db

        client.admin.command("ping")
        init_db()
        print("OK MongoDB connection successful")
        return True
    except Exception as e:
        print(f"FAILED MongoDB connection: {e}")
        return False


def main():
    print_header("Traveloop Backend Verification")
    checks = [
        check_file_exists("app/config.py", "Config file"),
        check_file_exists("app/database.py", "MongoDB database file"),
        check_file_exists("app/main.py", "FastAPI app"),
        check_file_exists(".env", "Environment file"),
        check_python_packages(),
        check_environment(),
        check_database_connection(),
    ]

    print_header("Summary")
    if all(checks):
        print("All checks passed.")
        return 0

    print("Some checks failed.")
    print("Make sure MongoDB is running and then run: python init_db.py")
    return 1


if __name__ == "__main__":
    sys.exit(main())

"""
Initialize MongoDB indexes for Traveloop.
"""

import sys

from app.database import init_db
from app.utils.logger import logger


def init_database() -> bool:
    try:
        logger.info("Initializing MongoDB indexes...")
        init_db()
        logger.info("MongoDB initialization completed successfully.")
        return True
    except Exception as e:
        logger.error(f"Error initializing MongoDB: {str(e)}")
        return False


if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)

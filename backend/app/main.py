from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import api_router
from app.database import init_db
from app.utils.logger import logger
import json

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Travel Planning API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS middleware
cors_origins = settings.BACKEND_CORS_ORIGINS
if isinstance(cors_origins, str):
    try:
        cors_origins = json.loads(cors_origins)
    except:
        cors_origins = [cors_origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes. /api/v1 is the canonical frontend path; /api is kept for
# compatibility with older AI-generated code and requested integration tests.
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(api_router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    try:
        init_db()
        logger.info("MongoDB indexes ready.")
    except Exception as e:
        logger.warning(f"MongoDB initialization skipped: {e}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Traveloop API",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting Traveloop API on {settings.SERVER_HOST}:{settings.SERVER_PORT}")
    uvicorn.run(
        "app.main:app",
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=settings.RELOAD,
        log_level="info"
    )

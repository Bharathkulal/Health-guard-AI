"""
HealthGuard AI - FastAPI Application Entrypoint.
Production-grade foundation for clinical assessment ingestion, MongoDB persistence,
ML risk stratification pipelines, and JWT authentication & authorization.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.middleware import SecurityHeadersMiddleware
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.api.router import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger("healthguard.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Connects to MongoDB and builds indexes on startup, cleanly closes pool on shutdown.
    """
    logger.info("Initializing HealthGuard AI API server...")
    # Connect to MongoDB
    await connect_to_mongo()
    yield
    # Shutdown sequence
    logger.info("Shutting down HealthGuard AI API server...")
    await close_mongo_connection()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Production backend for HealthGuard AI. Ingests, validates, and stores multi-factor "
        "clinical health assessments in MongoDB, establishing the foundation for ML risk prediction pipelines."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Apply Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# Configure Cross-Origin Resource Sharing (CORS)
cors_origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.onrender\.com|http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", summary="Root Health & Info Endpoint", tags=["System"])
async def root_endpoint():
    """Returns basic service information and confirmation that backend is active."""
    return {
        "success": True,
        "service": "HealthGuard AI API",
        "version": settings.VERSION,
        "status": "healthy",
        "docs_url": "/docs",
    }


# Custom Exception Handlers for Unified API Response Envelope
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Formats FastAPI HTTPExceptions into standardized envelope with headers preserved."""
    return JSONResponse(
        status_code=exc.status_code,
        headers=exc.headers,
        content={
            "success": False,
            "message": exc.detail if isinstance(exc.detail, str) else "Request error",
            "data": None,
            "errors": [exc.detail] if isinstance(exc.detail, str) else exc.detail,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Formats Pydantic validation errors into standard API envelope."""
    error_details = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err.get("loc", []) if loc != "body"])
        error_details.append({
            "field": field,
            "message": err.get("msg", "Invalid input value"),
            "type": err.get("type", "value_error"),
        })

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation failed on input parameters.",
            "data": None,
            "errors": error_details,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Catches unhandled exceptions and returns clean, secure error responses."""
    logger.error(f"Unhandled server error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An internal server error occurred while processing health data.",
            "data": None,
            "errors": [str(exc)] if settings.DEBUG else ["Internal server error."],
        },
    )


# Mount API Router under prefix
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
async def root_redirect():
    """Root info endpoint."""
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "documentation": "/docs",
        "api_root": settings.API_V1_STR,
    }

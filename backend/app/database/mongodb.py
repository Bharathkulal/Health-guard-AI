"""
MongoDB Async Database Connection and Lifecycle Management using Motor.
"""

import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import certifi
import pymongo
from app.core.config import settings

logger = logging.getLogger("healthguard.database")

COLLECTION_HEALTH_ASSESSMENTS = "health_assessments"
COLLECTION_USERS = "users"
COLLECTION_RISK_ASSESSMENTS = "risk_assessments"
COLLECTION_RECOMMENDATIONS = "recommendations"


class MongoDBManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    connected: bool = False


db_manager = MongoDBManager()


async def connect_to_mongo() -> bool:
    """
    Initializes the Motor async MongoDB client and tests connectivity.
    Creates necessary indexes for performant healthcare data querying and uniqueness constraints.
    Supports local MongoDB as well as cloud MongoDB Atlas connections.
    """
    # Mask password for logging if credentials are in URI
    log_uri = settings.MONGODB_URI
    if "@" in log_uri and "://" in log_uri:
        prefix, rest = log_uri.split("://", 1)
        creds, host_part = rest.split("@", 1)
        user = creds.split(":")[0] if ":" in creds else creds
        log_uri = f"{prefix}://{user}:****@{host_part}"

    logger.info(f"Connecting to MongoDB at {log_uri} (database: {settings.DATABASE_NAME})...")
    try:
        client_kwargs = {
            "serverSelectionTimeoutMS": settings.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
        }
        # Provide certifi CA bundle for Atlas TLS connections to prevent Windows SSL verify failures
        if "mongodb+srv" in settings.MONGODB_URI or "ssl=true" in settings.MONGODB_URI.lower() or "tls=true" in settings.MONGODB_URI.lower():
            client_kwargs["tlsCAFile"] = certifi.where()

        db_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            **client_kwargs,
        )
        # Verify server availability with a ping command
        await db_manager.client.admin.command("ping")
        db_manager.db = db_manager.client[settings.DATABASE_NAME]
        db_manager.connected = True
        logger.info(f"Successfully connected to MongoDB database: '{settings.DATABASE_NAME}'")

        # Initialize collections indexes
        await _setup_indexes()
        return True
    except Exception as exc:
        db_manager.connected = False
        logger.warning(
            f"MongoDB connection could not be established: {exc}. "
            f"The backend will continue running with fallback storage for local development."
        )
        return False


async def _setup_indexes():
    """Configures database indexes for fast query resolution, uniqueness constraints, and user isolation."""
    if not db_manager.connected or db_manager.db is None:
        return

    try:
        # Users collection
        users_col = db_manager.db[COLLECTION_USERS]
        await users_col.create_index("user_id", unique=True)
        await users_col.create_index("email", unique=True)

        # Health Assessments collection
        assessments_col = db_manager.db[COLLECTION_HEALTH_ASSESSMENTS]
        await assessments_col.create_index("assessment_id", unique=True)
        await assessments_col.create_index([("user_id", pymongo.ASCENDING), ("created_at", pymongo.DESCENDING)])
        await assessments_col.create_index([("created_at", pymongo.DESCENDING)])

        # Risk Assessments collection
        risk_col = db_manager.db[COLLECTION_RISK_ASSESSMENTS]
        await risk_col.create_index("assessment_id", unique=True)
        await risk_col.create_index([("user_id", pymongo.ASCENDING), ("created_at", pymongo.DESCENDING)])
        await risk_col.create_index([("created_at", pymongo.DESCENDING)])

        logger.info("MongoDB security and user-isolation indexes verified successfully.")
    except Exception as exc:
        logger.warning(f"Failed to create some MongoDB indexes: {exc}")


async def close_mongo_connection():
    """Closes the MongoDB connection pool cleanly."""
    if db_manager.client is not None:
        logger.info("Closing MongoDB connection pool...")
        db_manager.client.close()
        db_manager.client = None
        db_manager.db = None
        db_manager.connected = False
        logger.info("MongoDB connection closed.")


def get_database() -> Optional[AsyncIOMotorDatabase]:
    """Returns active database handle if connected, or None."""
    if db_manager.connected and db_manager.db is not None:
        return db_manager.db
    return None


def get_collection(name: str):
    """Returns a specific MongoDB collection handle."""
    db = get_database()
    if db is not None:
        return db[name]
    return None


def is_database_connected() -> bool:
    """Returns True if the MongoDB connection is alive and bound to active event loop."""
    if not db_manager.connected or db_manager.client is None or db_manager.db is None:
        return False
    try:
        import asyncio
        try:
            loop = asyncio.get_running_loop()
            client_loop = getattr(db_manager.client, "io_loop", None)
            if client_loop is None and hasattr(db_manager.client, "get_io_loop"):
                client_loop = db_manager.client.get_io_loop()
            if client_loop is not None and (client_loop.is_closed() or client_loop != loop):
                return False
        except RuntimeError:
            pass
    except Exception:
        pass
    return db_manager.connected

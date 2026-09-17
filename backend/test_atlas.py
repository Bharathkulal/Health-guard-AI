import asyncio
from app.database.mongodb import connect_to_mongo, close_mongo_connection, db_manager

async def test():
    print("Testing connection to MongoDB Atlas...")
    connected = await connect_to_mongo()
    if connected and db_manager.db is not None:
        collections = await db_manager.db.list_collection_names()
        print("\n========================================")
        print(" SUCCESS: Connected to MongoDB Atlas!")
        print(f" Database: {db_manager.db.name}")
        print(f" Collections found: {collections}")
        print("========================================\n")
    else:
        print("\n[FAILED] Could not connect to MongoDB Atlas.\n")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(test())

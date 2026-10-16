import os
import json
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
DB_NAME = os.getenv('MONGODB_DB_NAME', 'smart_diet_db')

_client = None
_db = None
_is_connected = False

def get_mongo_client():
    """Returns a MongoClient instance or None if MongoDB cannot be reached."""
    global _client, _is_connected
    if _client is not None:
        return _client
    
    try:
        from pymongo import MongoClient
        from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
        
        # Short timeout for connection check (1.5 seconds)
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=1500)
        # Test connection
        client.admin.command('ping')
        _client = client
        _is_connected = True
        logger.info(f"Connected to MongoDB at {MONGODB_URI}")
        return _client
    except Exception as e:
        logger.warning(f"MongoDB not reachable ({e}). Using in-memory fallback store.")
        _is_connected = False
        return None

def get_database(db_name=DB_NAME):
    """Returns the database instance or an in-memory fallback adapter."""
    global _db
    client = get_mongo_client()
    if client is not None:
        _db = client[db_name]
        return _db
    
    # Return In-Memory fallback adapter
    return InMemoryDatabaseFallback()

def is_mongo_connected():
    """Check if live MongoDB connection is active."""
    return _is_connected

class InMemoryCollectionFallback:
    """Lightweight in-memory MongoDB-compatible collection for local testing/offline mode."""
    def __init__(self, name):
        self.name = name
        self.documents = []
        
        # Prepopulate food collection from JSON if available
        if name == 'foods':
            self._load_seed_foods()

    def _load_seed_foods(self):
        try:
            curr_dir = os.path.dirname(os.path.abspath(__file__))
            json_path = os.path.join(curr_dir, 'data', 'food_database.json')
            if os.path.exists(json_path):
                with open(json_path, 'r', encoding='utf-8') as f:
                    self.documents = json.load(f)
        except Exception as e:
            logger.error(f"Failed to preload seed foods: {e}")

    def insert_one(self, doc):
        new_doc = dict(doc)
        if '_id' not in new_doc:
            new_doc['_id'] = str(len(self.documents) + 1)
        self.documents.append(new_doc)
        class Result:
            inserted_id = new_doc['_id']
        return Result()

    def insert_many(self, docs):
        ids = []
        for d in docs:
            res = self.insert_one(d)
            ids.append(res.inserted_id)
        class Result:
            inserted_ids = ids
        return Result()

    def find(self, query=None):
        if not query:
            return list(self.documents)
        results = []
        for doc in self.documents:
            match = True
            for k, v in query.items():
                if isinstance(v, dict) and '$in' in v:
                    doc_val = doc.get(k)
                    if isinstance(doc_val, list):
                        if not any(item in v['$in'] for item in doc_val):
                            match = False
                            break
                    elif doc_val not in v['$in']:
                        match = False
                        break
                elif doc.get(k) != v:
                    match = False
                    break
            if match:
                results.append(doc)
        return results

    def find_one(self, query=None):
        res = self.find(query)
        return res[0] if res else None

    def update_one(self, query, update, upsert=False):
        doc = self.find_one(query)
        if doc and '$set' in update:
            doc.update(update['$set'])
        elif not doc and upsert:
            new_doc = dict(query)
            if '$set' in update:
                new_doc.update(update['$set'])
            self.insert_one(new_doc)

    def count_documents(self, query=None):
        return len(self.find(query))

    def create_index(self, *args, **kwargs):
        pass

class InMemoryDatabaseFallback:
    """Mock MongoDB database fallback when server is not running."""
    def __init__(self):
        self._collections = {}

    def __getitem__(self, name):
        if name not in self._collections:
            self._collections[name] = InMemoryCollectionFallback(name)
        return self._collections[name]

    def list_collection_names(self):
        return list(self._collections.keys())

from datetime import datetime
from ..connection import get_database

class UserRepository:
    def __init__(self):
        self.db = get_database()
        self.collection = self.db['users']

    def get_by_email(self, email):
        user = self.collection.find_one({"email": email.lower().strip()})
        if user and '_id' in user:
            user['_id'] = str(user['_id'])
        return user

    def save_or_update(self, user_data):
        email = user_data.get('email', '').lower().strip()
        if not email:
            raise ValueError("Email is required for saving user")
        
        user_data['updated_at'] = datetime.utcnow()
        self.collection.update_one(
            {"email": email},
            {"$set": user_data},
            upsert=True
        )
        return self.get_by_email(email)

from datetime import datetime
from ..connection import get_database

class DietPlanRepository:
    def __init__(self):
        self.db = get_database()
        self.collection = self.db['diet_plans']

    def save_plan(self, plan_data):
        if 'created_at' not in plan_data:
            plan_data['created_at'] = datetime.utcnow()
        result = self.collection.insert_one(plan_data)
        return str(result.inserted_id)

    def get_plans_by_user(self, email, limit=10):
        docs = list(self.collection.find({"user_email": email.lower().strip()}))
        for d in docs:
            if '_id' in d:
                d['_id'] = str(d['_id'])
        return docs[:limit]

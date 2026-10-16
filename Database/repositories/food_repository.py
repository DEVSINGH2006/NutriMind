import os
import json
import logging
from ..connection import get_database

logger = logging.getLogger(__name__)

class FoodRepository:
    def __init__(self):
        self.db = get_database()
        self.collection = self.db['foods']

    def get_all_foods(self):
        """Fetch all food documents."""
        docs = list(self.collection.find({}))
        # Remove MongoDB _id from returned items if needed
        for doc in docs:
            if '_id' in doc:
                doc['_id'] = str(doc['_id'])
        return docs

    def get_food_database_dict(self):
        """
        Returns a dictionary keyed by food_name matching the legacy food_database dictionary:
        {
            'apple': {'calories': 95, 'protein': 0.5, 'carbs': 25.0, 'fat': 0.3, 'sugar': 19.0, ...},
            ...
        }
        """
        foods = self.get_all_foods()
        result = {}
        for food in foods:
            name = food.get('food_name')
            if name:
                data = {
                    'food_name': name,
                    'calories': food.get('calories', 0),
                    'protein': food.get('protein', 0),
                    'carbs': food.get('carbs', 0),
                    'fat': food.get('fat', 0),
                    'sugar': food.get('sugar', 0),
                    'category': food.get('category', 'General'),
                    'dietary_flags': food.get('dietary_flags', []),
                    'meal_slot': food.get('meal_slot', 'any'),
                    'ingredients': food.get('ingredients', [])
                }
                result[name] = data
        return result

    def find_compatible_foods(self, dietary_restrictions):
        """Find foods compatible with all specified dietary restrictions."""
        all_foods = self.get_all_foods()
        if not dietary_restrictions:
            return all_foods
        
        normalized_restrictions = [r.lower().strip() for r in dietary_restrictions]
        compatible = []
        for food in all_foods:
            flags = [f.lower().strip() for f in food.get('dietary_flags', [])]
            # Must satisfy all given restrictions
            if all(r in flags for r in normalized_restrictions):
                compatible.append(food)
        return compatible

    def insert_food(self, food_data):
        return self.collection.insert_one(food_data)

import os
import json
import logging
from connection import get_database, get_mongo_client, is_mongo_connected

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def seed():
    """Populates MongoDB with initial foods, nutritional facts, and sample data."""
    curr_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(curr_dir, 'data', 'food_database.json')

    if not os.path.exists(json_path):
        logger.error(f"Seed file not found: {json_path}")
        return False

    with open(json_path, 'r', encoding='utf-8') as f:
        foods_data = json.load(f)

    db = get_database()
    foods_col = db['foods']
    users_col = db['users']

    # Clear old legacy foods and insert fresh Indian meals
    logger.info(f"Seeding {len(foods_data)} food documents...")
    foods_col.delete_many({})
    inserted_count = 0
    for food in foods_data:
        food_name = food.get('food_name')
        foods_col.update_one(
            {"food_name": food_name},
            {"$set": food},
            upsert=True
        )
        inserted_count += 1

    # Ensure index on food_name
    try:
        foods_col.create_index("food_name", unique=True)
        users_col.create_index("email", unique=True)
    except Exception as e:
        logger.warning(f"Note on index creation: {e}")

    # Seed both demo and test users into MongoDB
    initial_users = [
        {
            "email": "demo@example.com",
            "username": "demo",
            "password": "password123",
            "display_name": "Demo User",
            "age": 26,
            "gender": "Female",
            "weight": 62,
            "height": 165,
            "activity_level": "Medium Active",
            "dietary_restrictions": ["vegetarian"],
            "health_conditions": [],
            "preferred_cuisine": "North Indian",
            "current_mood": "energetic",
            "calorieGoal": 1850,
            "proteinGoal": 65,
            "carbsGoal": 230,
            "fatGoal": 50
        },
        {
            "email": "test@example.com",
            "username": "test",
            "password": "password123",
            "display_name": "Test User",
            "age": 30,
            "gender": "Male",
            "weight": 75,
            "height": 178,
            "activity_level": "Highly Active",
            "dietary_restrictions": ["non-vegetarian"],
            "health_conditions": [],
            "preferred_cuisine": "Indian",
            "current_mood": "motivated",
            "calorieGoal": 2400,
            "proteinGoal": 95,
            "carbsGoal": 280,
            "fatGoal": 65
        },
        {
            "email": "demo@smartdiet.io",
            "username": "demo_legacy",
            "password": "password123",
            "display_name": "Demo User (Legacy)",
            "age": 28,
            "gender": "Female",
            "weight": 65,
            "height": 168,
            "activity_level": "Moderately Active",
            "dietary_restrictions": ["vegetarian"],
            "health_conditions": [],
            "preferred_cuisine": "North Indian",
            "current_mood": "energetic"
        }
    ]

    for u in initial_users:
        users_col.update_one(
            {"email": u["email"]},
            {"$set": u},
            upsert=True
        )

    logger.info(f"Successfully seeded database with {inserted_count} foods and {len(initial_users)} users.")
    return True

if __name__ == '__main__':
    seed()

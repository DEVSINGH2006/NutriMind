"""
Database (MongoDB) Module for Smart Diet Plan Generator
Includes:
- connection: MongoClient connection manager with in-memory fallback
- models: Document schemas for Foods, Users, and Diet Plans
- repositories: FoodRepository, UserRepository, DietPlanRepository
- seed_database: Automated seeder utility
"""

from .connection import get_database, get_mongo_client, is_mongo_connected
from .repositories import FoodRepository, UserRepository, DietPlanRepository
from .models import FoodItem, UserModel, DietPlanModel

__all__ = [
    'get_database',
    'get_mongo_client',
    'is_mongo_connected',
    'FoodRepository',
    'UserRepository',
    'DietPlanRepository',
    'FoodItem',
    'UserModel',
    'DietPlanModel'
]

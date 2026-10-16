import pytest
import sys
import os

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from AI.diet_generator import generate_diet_plan, is_food_compatible
from services.user_management import UserProfile

def test_is_food_compatible_vegan():
    assert is_food_compatible("apple", ["Vegan"]) is True
    assert is_food_compatible("spinach", ["Vegan"]) is True
    assert is_food_compatible("chicken breast", ["Vegan"]) is False

def test_generate_diet_plan():
    user = UserProfile(
        user_id=1,
        age=30,
        gender="Female",
        weight=60.0,
        height=165.0,
        activity_level="Lightly Active",
        dietary_restrictions=["Gluten-Free"],
        health_conditions=[]
    )
    food_db = {
        "apple": {"food_name": "apple", "calories": 95, "protein": 0.5, "carbs": 25, "fat": 0.3, "sugar": 19},
        "quinoa": {"food_name": "quinoa", "calories": 222, "protein": 8.1, "carbs": 39.4, "fat": 3.6, "sugar": 1.6},
        "salmon": {"food_name": "salmon", "calories": 206, "protein": 22.0, "carbs": 0, "fat": 12.0, "sugar": 0}
    }
    plan = generate_diet_plan(user, food_db)
    assert len(plan) == 3
    for meal in plan:
        assert meal["food_name"] in food_db

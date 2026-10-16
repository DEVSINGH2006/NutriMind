import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.health_considerations import adjust_for_health_conditions

def test_adjust_for_diabetes_filters_high_sugar():
    diet_plan = [
        {"food_name": "apple", "sugar": 19.0, "fat": 0.3},
        {"food_name": "spinach", "sugar": 0.4, "fat": 0.4},
        {"food_name": "sweet potato", "sugar": 7.4, "fat": 0.2}
    ]
    adjusted = adjust_for_health_conditions(diet_plan, ["Diabetes"])
    # Apple has 19g sugar (>15g) and should be filtered out
    food_names = [f["food_name"] for f in adjusted]
    assert "spinach" in food_names
    assert "sweet potato" in food_names

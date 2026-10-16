import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.nutritional_analysis import analyze_nutrition

def test_analyze_nutrition_calculation():
    diet_plan = [
        {"food_name": "apple", "calories": 95, "protein": 0.5, "carbs": 25.0, "fat": 0.3, "sugar": 19.0},
        {"food_name": "quinoa", "calories": 222, "protein": 8.1, "carbs": 39.4, "fat": 3.6, "sugar": 1.6}
    ]
    food_db = {}
    nutrition = analyze_nutrition(diet_plan, food_db)

    assert nutrition["calories"] == 317.0
    assert nutrition["protein"] == 8.6
    assert nutrition["carbs"] == 64.4
    assert nutrition["fat"] == 3.9
    assert nutrition["sugar"] == 20.6

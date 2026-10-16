"""
AI & Machine Learning Package for Smart Diet Plan Generator
Includes:
- diet_generator: Rule-based & constraint-satisfaction meal planner
- llm_integration: Local / Remote LLM integration for recipe generation & diet explanations
- recommendation_engine: Scikit-Learn ML model loader and inference engine
- train_model: Model training pipeline
"""

from .diet_generator import generate_diet_plan, is_food_compatible
from .recommendation_engine import load_model, recommend_diet
from .llm_integration import get_meal_suggestions, get_diet_explanation

__all__ = [
    'generate_diet_plan',
    'is_food_compatible',
    'load_model',
    'recommend_diet',
    'get_meal_suggestions',
    'get_diet_explanation'
]

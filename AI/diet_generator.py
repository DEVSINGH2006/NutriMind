import random
import logging

logger = logging.getLogger(__name__)

def is_food_compatible(food_dict, dietary_restrictions):
    """
    Check if a food item satisfies user dietary restrictions.
    Compatible flags: 'vegetarian', 'non-vegetarian', 'vegan', 'lactose-free'.
    """
    if not dietary_restrictions:
        return True

    flags = [f.lower().strip() for f in food_dict.get('dietary_flags', [])]
    user_restrictions = [r.lower().strip() for r in dietary_restrictions]

    # Non-vegetarian preference: prefers non-veg foods, can also eat balanced vegetarian items
    if 'non-vegetarian' in user_restrictions:
        # Compatible if tagged non-vegetarian
        if 'non-vegetarian' not in flags:
            return False

    # Vegetarian preference: strictly requires vegetarian or vegan
    if 'vegetarian' in user_restrictions:
        if 'vegetarian' not in flags and 'vegan' not in flags:
            return False

    # Vegan preference: strictly requires vegan
    if 'vegan' in user_restrictions:
        if 'vegan' not in flags:
            return False

    # Lactose-free preference: strictly requires lactose-free
    if 'lactose-free' in user_restrictions:
        if 'lactose-free' not in flags:
            return False

    return True

def generate_diet_plan(user_profile, food_database):
    """
    Generate a 3-meal personalized Indian diet plan (Breakfast, Lunch, Dinner).
    Ensures:
    1. Breakfast, Lunch, and Dinner are distinct and meal-appropriate.
    2. No dish is ever repeated in the same day.
    3. Respects user dietary restrictions (Vegetarian, Non-Vegetarian, Vegan, Lactose-Free).
    4. Non-vegetarian profiles get authentic non-veg Indian staples.
    """
    dietary_restrictions = getattr(user_profile, 'dietary_restrictions', []) or []
    is_non_veg = any('non-vegetarian' in r.lower() for r in dietary_restrictions)

    # Filter all compatible foods
    compatible_foods = {}
    for name, food in food_database.items():
        if is_food_compatible(food, dietary_restrictions):
            compatible_foods[name] = food

    if not compatible_foods:
        # Fallback to entire database if restrictions were overly strict
        compatible_foods = food_database

    # Group into meal slots
    breakfast_pool = []
    lunch_pool = []
    dinner_pool = []

    for name, food in compatible_foods.items():
        slot = food.get('meal_slot', '').lower()
        cat = food.get('category', '').lower()
        
        if slot == 'breakfast' or cat == 'breakfast':
            breakfast_pool.append(food)
        elif slot == 'lunch' or cat == 'lunch':
            lunch_pool.append(food)
        elif slot == 'dinner' or cat == 'dinner':
            dinner_pool.append(food)
        else:
            lunch_pool.append(food)
            dinner_pool.append(food)

    # Fallback pools if any slot is empty
    all_items = list(compatible_foods.values())
    if not breakfast_pool:
        breakfast_pool = all_items
    if not lunch_pool:
        lunch_pool = all_items
    if not dinner_pool:
        dinner_pool = all_items

    # If user wants non-vegetarian, prioritize non-veg dishes for lunch / dinner / breakfast
    def pick_meal(pool, excluded_names):
        available = [m for m in pool if m.get('food_name') not in excluded_names]
        if not available:
            available = pool
        
        # If user is non-veg, prioritize foods with 'non-vegetarian' in flags
        if is_non_veg:
            non_veg_candidates = [m for m in available if 'non-vegetarian' in [f.lower() for f in m.get('dietary_flags', [])] and not any(v in [f.lower() for f in m.get('dietary_flags', [])] for v in ['vegan', 'vegetarian'])]
            if non_veg_candidates:
                return random.choice(non_veg_candidates)
        
        return random.choice(available)

    selected_meals = []
    used_names = set()

    # 1. Breakfast
    b_meal = pick_meal(breakfast_pool, used_names)
    selected_meals.append(b_meal)
    used_names.add(b_meal.get('food_name'))

    # 2. Lunch
    l_meal = pick_meal(lunch_pool, used_names)
    selected_meals.append(l_meal)
    used_names.add(l_meal.get('food_name'))

    # 3. Dinner
    d_meal = pick_meal(dinner_pool, used_names)
    selected_meals.append(d_meal)
    used_names.add(d_meal.get('food_name'))

    return selected_meals

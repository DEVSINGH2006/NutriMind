from datetime import datetime

class FoodItem:
    def __init__(self, food_name, calories, protein, carbs, fat, sugar, category="General", dietary_flags=None, meal_slot="any", ingredients=None):
        self.food_name = food_name.lower().strip()
        self.calories = float(calories)
        self.protein = float(protein)
        self.carbs = float(carbs)
        self.fat = float(fat)
        self.sugar = float(sugar)
        self.category = category
        self.dietary_flags = dietary_flags or []
        self.meal_slot = meal_slot
        self.ingredients = ingredients or []

    def to_dict(self):
        return {
            "food_name": self.food_name,
            "calories": self.calories,
            "protein": self.protein,
            "carbs": self.carbs,
            "fat": self.fat,
            "sugar": self.sugar,
            "category": self.category,
            "dietary_flags": self.dietary_flags,
            "meal_slot": self.meal_slot,
            "ingredients": self.ingredients
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            food_name=data.get('food_name', ''),
            calories=data.get('calories', 0),
            protein=data.get('protein', 0),
            carbs=data.get('carbs', 0),
            fat=data.get('fat', 0),
            sugar=data.get('sugar', 0),
            category=data.get('category', 'General'),
            dietary_flags=data.get('dietary_flags', []),
            meal_slot=data.get('meal_slot', 'any'),
            ingredients=data.get('ingredients', [])
        )

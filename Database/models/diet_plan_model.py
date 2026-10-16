from datetime import datetime

class DietPlanModel:
    def __init__(self, user_email, meals, nutrition, recommendation=None, explanation=None, shopping_list=None):
        self.user_email = user_email
        self.meals = meals
        self.nutrition = nutrition
        self.recommendation = recommendation
        self.explanation = explanation
        self.shopping_list = shopping_list or []
        self.created_at = datetime.utcnow()

    def to_dict(self):
        return {
            "user_email": self.user_email,
            "meals": self.meals,
            "nutrition": self.nutrition,
            "recommendation": self.recommendation,
            "explanation": self.explanation,
            "shopping_list": self.shopping_list,
            "created_at": self.created_at
        }

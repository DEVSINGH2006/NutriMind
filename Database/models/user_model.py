from datetime import datetime

class UserModel:
    def __init__(self, email, display_name=None, age=None, gender=None, weight=None, height=None,
                 activity_level="Sedentary", dietary_restrictions=None, health_conditions=None,
                 preferred_cuisine="Any", current_mood="balanced"):
        self.email = email.lower().strip()
        self.display_name = display_name or email.split('@')[0]
        self.age = age
        self.gender = gender
        self.weight = weight
        self.height = height
        self.activity_level = activity_level
        self.dietary_restrictions = dietary_restrictions or []
        self.health_conditions = health_conditions or []
        self.preferred_cuisine = preferred_cuisine
        self.current_mood = current_mood
        self.created_at = datetime.utcnow()

    def to_dict(self):
        return {
            "email": self.email,
            "display_name": self.display_name,
            "age": self.age,
            "gender": self.gender,
            "weight": self.weight,
            "height": self.height,
            "activity_level": self.activity_level,
            "dietary_restrictions": self.dietary_restrictions,
            "health_conditions": self.health_conditions,
            "preferred_cuisine": self.preferred_cuisine,
            "current_mood": self.current_mood,
            "updated_at": datetime.utcnow()
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            email=data.get('email', ''),
            display_name=data.get('display_name'),
            age=data.get('age'),
            gender=data.get('gender'),
            weight=data.get('weight'),
            height=data.get('height'),
            activity_level=data.get('activity_level', 'Sedentary'),
            dietary_restrictions=data.get('dietary_restrictions', []),
            health_conditions=data.get('health_conditions', []),
            preferred_cuisine=data.get('preferred_cuisine', 'Any'),
            current_mood=data.get('current_mood', 'balanced')
        )

import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.user_management import UserProfile

def test_user_profile_creation_valid():
    user = UserProfile(
        user_id=1,
        age=25,
        gender="Male",
        weight=70.0,
        height=175.0,
        activity_level="Moderately Active",
        dietary_restrictions=["Vegan"],
        health_conditions=["None"]
    )
    assert user.age == 25
    assert user.weight == 70.0
    assert "Vegan" in user.dietary_restrictions

def test_user_profile_invalid_age():
    with pytest.raises(ValueError, match="age must be between"):
        UserProfile(
            user_id=1,
            age=150,
            gender="Male",
            weight=70.0,
            height=175.0,
            activity_level="Moderately Active",
            dietary_restrictions=[],
            health_conditions=[]
        )

def test_user_profile_invalid_gender():
    with pytest.raises(ValueError, match="gender must be one of"):
        UserProfile(
            user_id=1,
            age=30,
            gender="Alien",
            weight=70.0,
            height=175.0,
            activity_level="Moderately Active",
            dietary_restrictions=[],
            health_conditions=[]
        )

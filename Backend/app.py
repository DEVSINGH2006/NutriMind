from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import logging
from datetime import datetime
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(name)s: %(message)s')
logger = logging.getLogger(__name__)

# Add Project Root to Python path to import AI and Database packages
current_dir = os.path.dirname(os.path.abspath(__file__))  # /Backend
project_root = os.path.dirname(current_dir)               # /Smart Diet Plan Generator

for path in [current_dir, project_root]:
    if path not in sys.path:
        sys.path.insert(0, path)

# Import Services
from services.user_management import UserProfile
from services.nutritional_analysis import analyze_nutrition
from services.health_considerations import adjust_for_health_conditions

# Import AI Module
from AI.diet_generator import generate_diet_plan
from AI.recommendation_engine import load_model, recommend_diet
from AI.llm_integration import get_meal_suggestions, get_diet_explanation

# Import Database Module (MongoDB)
from Database.repositories import FoodRepository, UserRepository, DietPlanRepository
from Database.connection import is_mongo_connected

# Initialize Repositories
food_repo = FoodRepository()
user_repo = UserRepository()
diet_plan_repo = DietPlanRepository()

# Preload AI recommendation model if available
ml_model = None
try:
    ml_model = load_model()
    logger.info("AI recommendation model loaded successfully")
except Exception as e:
    logger.warning(f"Note on AI recommendation model: {e}")

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Google Places API key
GOOGLE_PLACES_API_KEY = os.getenv('GOOGLE_PLACES_API_KEY')
if not GOOGLE_PLACES_API_KEY:
    logger.info("Google Places API key not set in environment (optional for mock stores)")

def get_food_database():
    """Retrieve food items from MongoDB or fallback seed data."""
    return food_repo.get_food_database_dict()

# ==========================================
# Routes & Endpoints
# ==========================================

@app.route('/api/test', methods=['GET'])
def test():
    """Verify backend status."""
    return jsonify({
        "status": "success",
        "message": "NutriMind Backend is running!",
        "database": "MongoDB" if is_mongo_connected() else "In-Memory/Fallback",
        "ai_model": "Loaded" if ml_model is not None else "Not Loaded"
    })

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint for all 4 subsystems."""
    return jsonify({
        "status": "healthy",
        "subsystems": {
            "backend": "operational",
            "database_mongodb": "connected" if is_mongo_connected() else "fallback_mode",
            "ai_recommender": "ready" if ml_model is not None else "needs_training",
            "food_items_count": len(food_repo.get_all_foods())
        },
        "timestamp": datetime.utcnow().isoformat()
    })

@app.route('/api/foods', methods=['GET'])
def list_foods():
    """Fetch food database items with optional dietary restriction filter."""
    restriction = request.args.get('restriction')
    if restriction:
        foods = food_repo.find_compatible_foods([restriction])
    else:
        foods = food_repo.get_all_foods()
    return jsonify({"foods": foods, "count": len(foods)})

@app.route('/api/generate-diet', methods=['POST'])
def generate_diet():
    """Generate personalized diet plan with AI suggestions & MongoDB persistence."""
    try:
        data = request.json or {}
        logger.info(f"Received diet generation request for user age={data.get('age')}")

        # 1. Validate & Create User Profile
        user = UserProfile(
            user_id=data.get('user_id', 1),
            age=int(data['age']),
            gender=data['gender'],
            weight=float(data['weight']),
            height=float(data['height']),
            activity_level=data['activity_level'],
            dietary_restrictions=data.get('dietary_restrictions', []),
            health_conditions=data.get('health_conditions', [])
        )

        # 2. Load Foods from MongoDB
        food_db = get_food_database()
        if not food_db:
            return jsonify({'error': 'Food database is empty or unavailable'}), 500

        # 3. Generate Base Diet Plan
        diet_plan = generate_diet_plan(user, food_db)

        # 4. Adjust for Health Considerations
        adjusted_plan = adjust_for_health_conditions(diet_plan, user.health_conditions)

        # 5. Nutritional Analysis
        nutrition = analyze_nutrition(adjusted_plan, food_db)

        # 6. ML Recommendation
        recommendation_text = "Balanced diet recommended"
        if ml_model is not None:
            try:
                recommendation_text = recommend_diet(vars(user), ml_model)
            except Exception as e:
                logger.warning(f"Error predicting diet recommendation: {e}")

        # 7. Local LLM Context-Aware Suggestions (Optional/Non-blocking)
        mood = data.get('current_mood')
        cuisine = data.get('preferred_cuisine')
        meal_names = ["Breakfast", "Lunch", "Dinner"]
        meal_times = ["8:00 AM", "1:00 PM", "7:30 PM"]
        
        formatted_meals = []
        shopping_set = set()

        for idx, food_item in enumerate(adjusted_plan):
            food_name = food_item.get('food_name', f"Meal {idx+1}").title()
            
            # Retrieve real ingredients with exact gram weights
            ingredients = food_item.get('ingredients')
            if not ingredients or not isinstance(ingredients, list):
                ingredients = [
                    f"{food_name} (200g)",
                    "Fresh Salad of Cucumber & Onions (80g)",
                    "Cold-pressed Oil / Cumin & Mustard Tadka (8g)"
                ]

            for ing in ingredients:
                clean_ing = ing.split('(')[0].strip()
                shopping_set.add(clean_ing if clean_ing else food_name)
            
            # Format meal item
            meal_data = {
                "name": meal_names[idx] if idx < len(meal_names) else f"Meal {idx+1}",
                "dish": food_name,
                "time": meal_times[idx] if idx < len(meal_times) else "Scheduled",
                "calories": food_item.get('calories', 0),
                "protein": food_item.get('protein', 0),
                "carbs": food_item.get('carbs', 0),
                "fat": food_item.get('fat', 0),
                "sugar": food_item.get('sugar', 0),
                "ingredients": ingredients
            }

            # Attempt LLM suggestion if available
            try:
                suggestion = get_meal_suggestions(vars(user), food_item, idx + 1, mood=mood, preferred_cuisine=cuisine)
                if suggestion:
                    meal_data["ai_suggestion"] = suggestion
            except Exception as e:
                logger.debug(f"LLM suggestion skipped: {e}")

            formatted_meals.append(meal_data)

        # 8. Overall AI Explanation
        explanation_text = None
        try:
            explanation_text = get_diet_explanation(vars(user), adjusted_plan, nutrition)
        except Exception as e:
            logger.debug(f"LLM explanation skipped: {e}")

        if not explanation_text:
            explanation_text = (
                f"Personalized meal plan optimized for {user.activity_level.lower()} activity "
                f"with {nutrition['calories']} kcal total energy intake, fulfilling target "
                f"protein ({nutrition['protein']}g), healthy fats ({nutrition['fat']}g), "
                f"and complex carbohydrates ({nutrition['carbs']}g)."
            )

        response_payload = {
            "status": "success",
            "meals": formatted_meals,
            "nutrition": nutrition,
            "shoppingList": list(shopping_set),
            "recommendation": recommendation_text,
            "explanation": explanation_text
        }

        # 9. Save to MongoDB
        user_email = data.get('email', 'guest@smartdiet.io')
        try:
            diet_plan_repo.save_plan({
                "user_email": user_email,
                "user_profile": vars(user),
                "plan": response_payload,
                "created_at": datetime.utcnow()
            })
            logger.info("Diet plan stored in MongoDB successfully")
        except Exception as e:
            logger.warning(f"Could not persist diet plan to MongoDB: {e}")

        return jsonify(response_payload)

    except ValueError as e:
        logger.error(f"Validation error: {e}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Unexpected error in diet generation: {e}")
        return jsonify({'error': f"Failed to generate diet plan: {str(e)}"}), 500

# ==========================================
# User Profile Endpoints
# ==========================================

@app.route('/api/users/profile', methods=['GET', 'POST'])
def user_profile():
    if request.method == 'POST':
        data = request.json or {}
        email = data.get('email')
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        saved_user = user_repo.save_or_update(data)
        return jsonify({"status": "success", "user": saved_user})
    else:
        email = request.args.get('email')
        if not email:
            return jsonify({'error': 'Email parameter is required'}), 400
        user = user_repo.get_by_email(email)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify(user)

# ==========================================
# Nearby Stores & Places Endpoints
# ==========================================

@app.route('/api/stores', methods=['GET'])
@app.route('/api/places', methods=['GET'])
def find_stores():
    """Find nearby healthy food stores or fall back to curated spots."""
    lat = request.args.get('lat')
    lng = request.args.get('lng')

    if not lat or not lng:
        return jsonify({'error': 'Latitude and longitude are required'}), 400

    # If Google Places API key is configured, query Google Places API
    if GOOGLE_PLACES_API_KEY:
        try:
            url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius=5000&type=grocery_or_supermarket&keyword=organic+healthy+grocery&key={GOOGLE_PLACES_API_KEY}"
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                results = resp.json().get('results', [])
                stores = []
                for p in results[:6]:
                    stores.append({
                        "name": p.get('name', 'Healthy Market'),
                        "address": p.get('vicinity', ''),
                        "rating": p.get('rating', 4.5),
                        "isOpen": p.get('opening_hours', {}).get('open_now', True),
                        "distance": "1.2 km"
                    })
                return jsonify({'stores': stores})
        except Exception as e:
            logger.warning(f"Google Places query failed: {e}")

    # Curated healthy stores fallback
    curated_stores = [
        {
            "name": "Green Earth Organic Market",
            "distance": "0.8 km",
            "address": "124 Market Square",
            "phone": "+1 555-0192",
            "isOpen": True,
            "rating": 4.8,
            "inStockItems": ["Organic Produce", "Quinoa", "Greek Yogurt", "Fresh Almonds"]
        },
        {
            "name": "Nature's Basket Health Foods",
            "distance": "1.4 km",
            "address": "45 Greenway Blvd",
            "phone": "+1 555-0144",
            "isOpen": True,
            "rating": 4.7,
            "inStockItems": ["Gluten-Free Oats", "Chia Seeds", "Tofu", "Avocados"]
        },
        {
            "name": "Farm Fresh Supermarket",
            "distance": "2.1 km",
            "address": "880 Harvest Way",
            "phone": "+1 555-0188",
            "isOpen": True,
            "rating": 4.6,
            "inStockItems": ["Fresh Spinach", "Sweet Potatoes", "Salmon Fillets", "Free-Range Eggs"]
        }
    ]
    return jsonify({'stores': curated_stores})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    logger.info(f"Starting NutriMind Backend on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)

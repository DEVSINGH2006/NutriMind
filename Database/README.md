# Database Module (MongoDB)

This folder contains the MongoDB database layer, data models, repositories, and data files for the Smart Diet Plan Generator.

---

## 📂 Folder Structure

```
Database/
├── data/
│   ├── food_database.csv       # Tabular food & nutritional records
│   └── food_database.json      # Structured documents for MongoDB
├── models/
│   ├── food_model.py           # Food item schema & serialization
│   ├── user_model.py           # User profile & preferences schema
│   └── diet_plan_model.py      # Generated meal plans schema
├── repositories/
│   ├── food_repository.py      # Food queries & dietary compatibility filters
│   ├── user_repository.py      # User profile persistence
│   └── diet_plan_repository.py # Diet plan history persistence
├── connection.py               # MongoDB client manager + offline in-memory fallback
├── seed_database.py            # MongoDB seeder script
├── requirements.txt            # Database dependencies (pymongo, pandas)
└── README.md                   # Documentation
```

---

## 🍃 MongoDB Configuration

By default, the application connects to a local MongoDB instance:
```env
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=smart_diet_db
```

For MongoDB Atlas (cloud cluster), configure your `.env` file:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=smart_diet_db
```

> **Note**: If MongoDB is not running locally, the application automatically falls back to an in-memory/JSON store adapter loaded with `data/food_database.json`, ensuring zero crashes and seamless offline development.

---

## 🚀 Seeding the Database

To populate MongoDB with healthy foods, macronutrients, and a demo user profile:

```bash
python seed_database.py
```

### Collections Created:
1. `foods`: Indexed on `food_name` (unique). Stores nutritional values (`calories`, `protein`, `carbs`, `fat`, `sugar`) and dietary tags (`vegan`, `vegetarian`, `gluten-free`, `lactose-free`).
2. `users`: Indexed on `email` (unique). Stores user health metrics, goals, and restrictions.
3. `diet_plans`: Stores generated meal plans, nutritional breakdowns, and AI recommendations.

# Backend Module (Python / Flask)

This folder contains the core REST API backend for the Smart Diet Plan Generator, written in Python with Flask.

---

## 📂 Folder Structure

```
Backend/
├── services/
│   ├── user_management.py         # User profile validation and health metrics
│   ├── nutritional_analysis.py    # Macro and micronutrient calculations
│   └── health_considerations.py   # Health condition rules (diabetes, cholesterol)
├── tests/
│   ├── test_user_management.py    # Unit tests for user management
│   ├── test_diet_generator.py     # Unit tests for meal planning
│   ├── test_nutritional_analysis.py # Unit tests for nutrition analyzer
│   └── test_health_considerations.py # Unit tests for medical condition rules
├── app.py                         # Flask application & REST endpoints
├── requirements.txt               # Backend dependencies
└── README.md                      # Documentation
```

---

## 🚀 Running the Backend

### 1. Install Dependencies
```bash
cd Backend
pip install -r requirements.txt
```

### 2. Run the Server
```bash
python app.py
```
The server will start at `http://localhost:5000`.

---

## 🧪 Running Unit Tests

Run test suite from the project root or Backend folder:

```bash
pytest Backend/tests
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/test` | Status check with DB & AI model info |
| `GET` | `/api/health` | Comprehensive subsystem health report |
| `POST` | `/api/generate-diet` | Generates personalized diet plan + AI recipes + persists to MongoDB |
| `GET` | `/api/foods` | List foods from MongoDB with optional `?restriction=` filter |
| `GET` / `POST` | `/api/users/profile` | Read or save user profile in MongoDB |
| `GET` | `/api/stores` / `/api/places` | Nearby grocery stores via Google Places or curated list |

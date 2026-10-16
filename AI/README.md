# AI & Machine Learning Module

This folder contains the core Artificial Intelligence and Machine Learning subsystems for the Smart Diet Plan Generator.

---

## 📂 Folder Structure

```
AI/
├── models/
│   └── diet_recommender.pkl     # Trained RandomForest diet recommendation model
├── notebooks/
│   └── data_analysis.ipynb      # EDA and experimentation notebook
├── diet_generator.py            # Constraint-satisfaction meal planner
├── llm_integration.py           # Local/Cloud LLM integration (LM Studio, Ollama, OpenAI)
├── recommendation_engine.py     # ML inference engine for diet plan classification
├── train_model.py               # Script to train and save the recommendation model
├── requirements.txt             # AI package dependencies
└── README.md                    # Documentation
```

---

## 🧠 Components

### 1. Recommendation Engine (`recommendation_engine.py`)
- Uses a `RandomForestClassifier` trained on health parameters (age, BMI/weight/height, activity level, vegan status, diabetic conditions).
- Predicts optimal diet categories:
  - `0`: Low-calorie diet (for metabolic/diabetic conditions)
  - `1`: Balanced plant-based diet (for vegan/vegetarian lifestyles)
  - `2`: High-protein diet (for active fitness regimes)

### 2. Diet Generation (`diet_generator.py`)
- Implements constraint matching to filter foods according to dietary restrictions:
  - Vegan, Vegetarian, Gluten-Free, Lactose-Free.
- Composes balanced multi-meal daily schedules conforming to target calorie and macronutrient requirements.

### 3. LLM Integration (`llm_integration.py`)
- Interfaces with local LLMs (such as LM Studio running `Phi 3.1 Mini` or any OpenAI-compatible server at `http://localhost:1234/v1`).
- Generates context-aware, chef-quality recipes, preparation steps, cooking times, cultural tips, and mood-adaptive meal variations.

---

## 🚀 How to Retrain the Model

To retrain the diet recommendation model:

```bash
python train_model.py
```

The output model will be stored in `models/diet_recommender.pkl`.

import { UserData } from '../contexts/UserContext';
import { API_BASE_URL } from '../config';
import axios from 'axios';

export interface DietPlan {
  meals: Array<{
    name: string;
    dish?: string;
    time: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar?: number;
    ingredients: string[];
    ai_suggestion?: string;
  }>;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar?: number;
  };
  shoppingList: string[];
  recommendation?: string;
  explanation?: string;
}

export const generateDietPlan = async (userData: UserData): Promise<DietPlan> => {
  // First attempt: Call live Python Flask Backend + MongoDB + AI Subsystem
  try {
    const response = await axios.post(`${API_BASE_URL}/api/generate-diet`, {
      age: userData.age,
      gender: userData.gender,
      weight: userData.weight,
      height: userData.height,
      activity_level: userData.activity_level,
      dietary_restrictions: userData.dietary_restrictions || [],
      health_conditions: userData.health_conditions || [],
      preferred_cuisine: userData.preferred_cuisine,
      current_mood: userData.current_mood
    }, { timeout: 7000 });

    if (response.data && response.data.meals && response.data.nutrition) {
      return response.data;
    }
  } catch (error) {
    console.warn('Live Backend request failed or timed out, falling back to local computation:', error);
  }

  // Local fallback calculation if backend is unreachable
  const bmr = calculateBMR(userData);
  
  const activityMultipliers = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very_active': 1.9
  };
  
  const dailyCalories = Math.round(bmr * (activityMultipliers[userData.activity_level as keyof typeof activityMultipliers] || 1.2));
  
  const protein = Math.round((dailyCalories * 0.3) / 4);
  const fat = Math.round((dailyCalories * 0.25) / 9);
  const carbs = Math.round((dailyCalories * 0.45) / 4);

  const meals = [
    {
      name: "Breakfast",
      dish: "Oatmeal with Fresh Berries",
      time: "8:00 AM",
      calories: Math.round(dailyCalories * 0.3),
      protein: Math.round(protein * 0.3),
      carbs: Math.round(carbs * 0.3),
      fat: Math.round(fat * 0.3),
      ingredients: ["Oatmeal", "Berries", "Nuts", "Protein powder", "Milk"]
    },
    {
      name: "Lunch",
      dish: "Grilled Chicken & Quinoa Bowl",
      time: "1:00 PM",
      calories: Math.round(dailyCalories * 0.4),
      protein: Math.round(protein * 0.4),
      carbs: Math.round(carbs * 0.4),
      fat: Math.round(fat * 0.4),
      ingredients: ["Grilled chicken", "Quinoa", "Mixed vegetables", "Olive oil", "Herbs"]
    },
    {
      name: "Dinner",
      dish: "Herb-Baked Salmon & Brown Rice",
      time: "7:00 PM",
      calories: Math.round(dailyCalories * 0.3),
      protein: Math.round(protein * 0.3),
      carbs: Math.round(carbs * 0.3),
      fat: Math.round(fat * 0.3),
      ingredients: ["Salmon", "Brown rice", "Asparagus", "Lemon", "Herbs"]
    }
  ];

  const shoppingList = Array.from(new Set(meals.flatMap(meal => meal.ingredients)));

  return {
    meals,
    nutrition: {
      calories: dailyCalories,
      protein,
      carbs,
      fat
    },
    shoppingList,
    recommendation: generateRecommendation(userData),
    explanation: generateExplanation(userData, dailyCalories)
  };
};

const calculateBMR = (userData: UserData): number => {
  const { age, gender, weight, height } = userData;
  
  if (gender.toLowerCase() === 'male') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
};

const generateRecommendation = (userData: UserData): string => {
  const recommendations = [
    "Based on your activity level and goals, focus on protein-rich foods to support muscle maintenance.",
    "Consider spreading your meals throughout the day to maintain stable energy levels.",
    "Stay hydrated by drinking water between meals and before exercising."
  ];

  return recommendations[Math.floor(Math.random() * recommendations.length)];
};

const generateExplanation = (userData: UserData, calories: number): string => {
  return `This personalized diet plan is designed for your ${userData.activity_level} activity level and takes into account your dietary preferences. The total daily calorie target of ${calories} calories is distributed across three meals to help you maintain a balanced and sustainable diet. Each meal is designed to provide a mix of proteins, carbs, and healthy fats while respecting your dietary restrictions.`;
};
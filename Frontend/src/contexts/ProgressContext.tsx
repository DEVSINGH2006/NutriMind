import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';

interface MealProgress {
  date: string;
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  progress: number;
  total: number;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ProgressContextType {
  mealProgress: MealProgress[];
  achievements: Achievement[];
  currentStreak: number;
  weeklyProgress: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    streak: number;
  };
  updateMealProgress: (date: string, mealType: 'breakfast' | 'lunch' | 'dinner', completed: boolean) => void;
  updateNutritionProgress: (date: string, nutrition: { calories: number; protein: number; carbs: number; fat: number; water: number }) => void;
  checkAchievements: () => void;
  toggleMealCompletion: (date: string, mealType: 'breakfast' | 'lunch' | 'dinner', completed: boolean) => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_week',
    title: 'Week 1 Champion',
    description: "You've completed your first week of diet planning 🎉",
    icon: 'EmojiEvents',
    category: 'milestone',
    points: 50,
    progress: 0,
    total: 7,
    unlocked: false,
    rarity: 'rare'
  },
  {
    id: 'first_meal',
    title: 'Healthy Start',
    description: 'Log and complete your first meal of the day',
    icon: 'CheckCircle',
    category: 'daily',
    points: 25,
    progress: 0,
    total: 1,
    unlocked: false,
    rarity: 'common'
  },
  {
    id: 'daily_champion',
    title: 'Clean Plate',
    description: 'Completed all 3 meals of the day (Breakfast, Lunch & Dinner)',
    icon: 'Whatshot',
    category: 'daily',
    points: 50,
    progress: 0,
    total: 3,
    unlocked: false,
    rarity: 'rare'
  },
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Complete all meals for 7 days straight',
    icon: 'EmojiEvents',
    category: 'streak',
    points: 100,
    progress: 0,
    total: 7,
    unlocked: false,
    rarity: 'epic'
  },
  {
    id: 'protein_champion',
    title: 'Protein Champion',
    description: 'Meet protein goals for 5 consecutive days',
    icon: 'Whatshot',
    category: 'nutrition',
    points: 75,
    progress: 0,
    total: 5,
    unlocked: false,
    rarity: 'rare'
  },
  {
    id: 'hydration_master',
    title: 'Hydration Master',
    description: 'Drink 2L of water daily for 3 days',
    icon: 'WaterDrop',
    category: 'nutrition',
    points: 50,
    progress: 0,
    total: 3,
    unlocked: false,
    rarity: 'common'
  }
];

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [mealProgress, setMealProgress] = useState<MealProgress[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  // Load progress and achievements from localStorage on mount or when user changes
  useEffect(() => {
    const userKey = user ? user.uid : 'default';
    const savedProgress = localStorage.getItem(`progress_${userKey}`);
    if (savedProgress) {
      try {
        setMealProgress(JSON.parse(savedProgress));
      } catch (e) {
        console.error('Error loading progress:', e);
        setMealProgress([]);
      }
    } else {
      setMealProgress([]);
    }

    const savedAchievements = localStorage.getItem(`achievements_${userKey}`);
    if (savedAchievements) {
      try {
        const parsed = JSON.parse(savedAchievements);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAchievements(INITIAL_ACHIEVEMENTS.map(def => {
            const saved = parsed.find((p: Achievement) => p.id === def.id);
            return saved ? { ...def, ...saved } : def;
          }));
        } else {
          setAchievements(INITIAL_ACHIEVEMENTS);
        }
      } catch (e) {
        console.error('Error loading achievements:', e);
        setAchievements(INITIAL_ACHIEVEMENTS);
      }
    } else {
      setAchievements(INITIAL_ACHIEVEMENTS);
    }
  }, [user?.uid]);

  // Save progress and achievements to localStorage whenever they change
  useEffect(() => {
    if (!user) return;
    const userKey = user.uid;
    localStorage.setItem(`progress_${userKey}`, JSON.stringify(mealProgress));
  }, [mealProgress, user]);

  useEffect(() => {
    if (!user) return;
    const userKey = user.uid;
    localStorage.setItem(`achievements_${userKey}`, JSON.stringify(achievements));
  }, [achievements, user]);

  const updateMealProgress = (date: string, mealType: 'breakfast' | 'lunch' | 'dinner', completed: boolean) => {
    setMealProgress(prev => {
      const dayIndex = prev.findIndex(d => d.date === date);
      if (dayIndex === -1) {
        return [...prev, {
          date,
          meals: {
            breakfast: mealType === 'breakfast' ? completed : false,
            lunch: mealType === 'lunch' ? completed : false,
            dinner: mealType === 'dinner' ? completed : false
          },
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          water: 0
        }];
      }
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        meals: {
          ...updated[dayIndex].meals,
          [mealType]: completed
        }
      };
      return updated;
    });
  };

  const updateNutritionProgress = (date: string, nutrition: { calories: number; protein: number; carbs: number; fat: number; water: number }) => {
    setMealProgress(prev => {
      const dayIndex = prev.findIndex(d => d.date === date);
      if (dayIndex === -1) {
        return [...prev, { date, meals: { breakfast: false, lunch: false, dinner: false }, ...nutrition }];
      }
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        ...nutrition
      };
      return updated;
    });
  };

  const calculateCurrentStreak = () => {
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const sortedProgress = [...mealProgress].sort((a, b) => b.date.localeCompare(a.date));

    for (const day of sortedProgress) {
      if (day.meals.breakfast && day.meals.lunch && day.meals.dinner) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const calculateWeeklyProgress = () => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weekProgress = mealProgress.filter(p => p.date >= weekAgo && p.date <= today);

    const totalCalories = weekProgress.reduce((sum, day) => sum + day.calories, 0);
    const totalProtein = weekProgress.reduce((sum, day) => sum + day.protein, 0);
    const totalCarbs = weekProgress.reduce((sum, day) => sum + day.carbs, 0);
    const totalFat = weekProgress.reduce((sum, day) => sum + day.fat, 0);

    return {
      calories: Math.round((totalCalories / (2000 * 7)) * 100),
      protein: Math.round((totalProtein / (150 * 7)) * 100),
      carbs: Math.round((totalCarbs / (250 * 7)) * 100),
      fat: Math.round((totalFat / (70 * 7)) * 100),
      streak: calculateCurrentStreak()
    };
  };

  const checkAchievements = () => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weekProgress = mealProgress.filter(p => p.date >= weekAgo && p.date <= today);

    setAchievements(prev => prev.map(achievement => {
      let progress = 0;
      let unlocked = achievement.unlocked;

      switch (achievement.id) {
        case 'first_week':
          const daysWithCompleted = mealProgress.filter(
            p => p.meals.breakfast || p.meals.lunch || p.meals.dinner
          ).length;
          progress = Math.min(7, daysWithCompleted);
          if (progress >= 7 && !unlocked) {
            unlocked = true;
            achievement.unlockedAt = new Date().toISOString();
          }
          break;
        case 'first_meal':
          const hasAnyCompleted = mealProgress.some(p => p.meals.breakfast || p.meals.lunch || p.meals.dinner);
          if (hasAnyCompleted) {
            progress = 1;
            unlocked = true;
            if (!achievement.unlockedAt) {
              achievement.unlockedAt = new Date().toISOString();
            }
          }
          break;
        case 'daily_champion':
          const todayItem = mealProgress.find(p => p.date === today);
          const completedCount = (todayItem?.meals.breakfast ? 1 : 0) + (todayItem?.meals.lunch ? 1 : 0) + (todayItem?.meals.dinner ? 1 : 0);
          progress = completedCount;
          if (completedCount >= 3 && !unlocked) {
            unlocked = true;
            achievement.unlockedAt = new Date().toISOString();
          }
          break;
        case 'perfect_week':
          progress = calculateCurrentStreak();
          if (progress >= 7 && !unlocked) {
            unlocked = true;
            achievement.unlockedAt = new Date().toISOString();
          }
          break;
        case 'protein_champion':
          const proteinDays = weekProgress.filter(day => day.protein >= 150).length;
          progress = proteinDays;
          if (proteinDays >= 5 && !unlocked) {
            unlocked = true;
            achievement.unlockedAt = new Date().toISOString();
          }
          break;
        case 'hydration_master':
          const hydrationDays = weekProgress.filter(day => day.water >= 2000).length;
          progress = hydrationDays;
          if (hydrationDays >= 3 && !unlocked) {
            unlocked = true;
            achievement.unlockedAt = new Date().toISOString();
          }
          break;
      }

      return {
        ...achievement,
        progress,
        unlocked
      };
    }));
  };

  const toggleMealCompletion = async (date: string, mealType: 'breakfast' | 'lunch' | 'dinner', completed: boolean) => {
    updateMealProgress(date, mealType, completed);
  };

  const value = {
    mealProgress,
    achievements,
    currentStreak: calculateCurrentStreak(),
    weeklyProgress: calculateWeeklyProgress(),
    updateMealProgress,
    updateNutritionProgress,
    checkAchievements,
    toggleMealCompletion
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
} 
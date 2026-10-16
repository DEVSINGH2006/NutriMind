import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  Divider,
  Button,
  Avatar,
  IconButton,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Fade,
  Zoom,
  Slide,
  Grow,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Restaurant as RestaurantIcon,
  LocalDining as LocalDiningIcon,
  EmojiEvents as EmojiEventsIcon,
  Timer as TimerIcon,
  Whatshot as WhatshotIcon,
  DirectionsRun as DirectionsRunIcon,
  Favorite as FavoriteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useUser } from '../contexts/UserContext';
import { useProgress, Achievement } from '../contexts/ProgressContext';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);
const MotionListItem = motion(ListItem);

// Define getRarityColor function outside the component
const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return 'error';
    case 'epic':
      return 'secondary';
    case 'rare':
      return 'primary';
    default:
      return 'default';
  }
};

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, getUserData } = useUser();
  const { 
    mealProgress, 
    weeklyProgress, 
    achievements,
    updateMealProgress, 
    updateNutritionProgress,
    checkAchievements,
    toggleMealCompletion
  } = useProgress();
  const userData = getUserData();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Get today's date in ISO format for consistency
  const today = new Date().toISOString().split('T')[0];
  
  // Get today's progress from mealProgress
  const todayProgress = mealProgress.find(p => p.date === today) || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0,
    meals: {
      breakfast: false,
      lunch: false,
      dinner: false
    }
  };

  // Define meals with dynamic completion status
  const [todaysMeals, setTodaysMeals] = useState([
    {
      id: 'breakfast',
      time: '8:00 AM',
      name: 'Breakfast',
      calories: 350,
      completed: todayProgress.meals.breakfast,
      items: ['Poha with Roasted Peanuts (150g)', 'Moong Dal Chilla', 'Curd'],
      macros: {
        protein: 15,
        carbs: 45,
        fat: 10
      }
    },
    {
      id: 'lunch',
      time: '1:00 PM',
      name: 'Lunch',
      calories: 550,
      completed: todayProgress.meals.lunch,
      items: ['Dal Tadka (160g)', 'Whole Wheat Phulkas (2 pcs - 70g)', 'Kachumber Salad (100g)'],
      macros: {
        protein: 25,
        carbs: 65,
        fat: 15
      }
    },
    {
      id: 'dinner',
      time: '7:30 PM',
      name: 'Dinner',
      calories: 450,
      completed: todayProgress.meals.dinner,
      items: ['Moong Dal Khichdi (220g)', 'Fresh Curd / Dahi (100g)', 'Roasted Papad'],
      macros: {
        protein: 20,
        carbs: 55,
        fat: 12
      }
    }
  ]);

  // Sync todaysMeals completed status with todayProgress
  useEffect(() => {
    setTodaysMeals(prev => prev.map(meal => ({
      ...meal,
      completed: Boolean(todayProgress.meals[meal.id as keyof typeof todayProgress.meals])
    })));
  }, [todayProgress.meals.breakfast, todayProgress.meals.lunch, todayProgress.meals.dinner]);

  // Handle meal completion toggle
  const handleMealToggle = async (mealId: string, meal: any) => {
    const newCompleted = !meal.completed;
    
    // Update meal completion status
    await toggleMealCompletion(today, mealId as 'breakfast' | 'lunch' | 'dinner', newCompleted);
    
    // Update local state first
    const updatedMeals = todaysMeals.map(m => 
      m.id === mealId ? { ...m, completed: newCompleted } : m
    );
    setTodaysMeals(updatedMeals);

    // Sum nutrition across all completed meals
    const completedMeals = updatedMeals.filter(m => m.completed);
    const totalCalories = completedMeals.reduce((sum, m) => sum + m.calories, 0);
    const totalProtein = completedMeals.reduce((sum, m) => sum + m.macros.protein, 0);
    const totalCarbs = completedMeals.reduce((sum, m) => sum + m.macros.carbs, 0);
    const totalFat = completedMeals.reduce((sum, m) => sum + m.macros.fat, 0);
    const totalWater = completedMeals.length * 500;

    await updateNutritionProgress(today, {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      water: totalWater
    });

    // Check for new achievements
    checkAchievements();
  };

  // Update current time and meal status
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Check every minute

    return () => clearInterval(timer);
  }, []);

  // Calculate real-time calories left: strictly 0 if all meals of the day are completed
  const calculateCaloriesLeft = () => {
    const allCompleted = (todayProgress?.meals?.breakfast && todayProgress?.meals?.lunch && todayProgress?.meals?.dinner) ||
                         todaysMeals.every(m => m.completed);
    if (allCompleted) {
      return 0;
    }
    const dailyGoal = getUserData()?.calorieGoal || 2000;
    const remaining = dailyGoal - (todayProgress?.calories || 0);
    return Math.max(0, remaining);
  };

  // Calculate real-time progress percentages
  const calculateProgress = (nutrient: 'calories' | 'protein' | 'carbs' | 'fat') => {
    const allCompleted = (todayProgress?.meals?.breakfast && todayProgress?.meals?.lunch && todayProgress?.meals?.dinner) ||
                         todaysMeals.every(m => m.completed);
    if (allCompleted && nutrient === 'calories') {
      return 100;
    }

    const goals = {
      calories: getUserData()?.calorieGoal || 2000,
      protein: getUserData()?.proteinGoal || 150,
      carbs: getUserData()?.carbsGoal || 250,
      fat: getUserData()?.fatGoal || 70
    };
    
    const currentValue = todayProgress[nutrient];
    const goalValue = goals[nutrient];
    
    if (typeof currentValue !== 'number' || typeof goalValue !== 'number') {
      return 0;
    }
    
    return Math.min(100, Math.round((currentValue / goalValue) * 100));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Welcome Section with Current Time */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ 
          mb: 4, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          p: 3,
          borderRadius: 2,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)'
            : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        }}
      >
        <Avatar
          src={user?.photoURL || undefined}
          sx={{ 
            width: 64, 
            height: 64, 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(96, 165, 250, 0.2)' : 'primary.main',
            color: theme.palette.mode === 'dark' ? '#60A5FA' : 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        >
          {user?.displayName?.[0]}
        </Avatar>
        <Box>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              color: theme.palette.mode === 'dark' ? '#F3F4F6' : 'white',
              fontWeight: 'bold',
              textShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Welcome back, {user?.displayName}!
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: theme.palette.mode === 'dark' ? '#D1D5DB' : 'rgba(255,255,255,0.9)'
            }}
          >
            {format(currentTime, 'EEEE, MMMM d • h:mm a')}
          </Typography>
        </Box>
      </MotionBox>
      
      <Grid container spacing={3}>
        {/* Today's Overview */}
        <Grid item xs={12} lg={8}>
          <MotionPaper
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            sx={{ 
              p: 3, 
              mb: 3,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(17,24,39,0.95) 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 8px 32px rgba(0,0,0,0.1)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              border: theme.palette.mode === 'dark'
                ? '1px solid rgba(255,255,255,0.1)'
                : 'none',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3,
                color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#2D3748',
                fontSize: '1.25rem',
                fontWeight: 600,
              }}
            >
              Today's Overview
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                {
                  icon: <LocalDiningIcon />,
                  value: calculateCaloriesLeft(),
                  label: 'Calories Left',
                  color: '#60A5FA',
                  bgColor: 'rgba(96, 165, 250, 0.15)'
                },
                {
                  icon: <DirectionsRunIcon />,
                  value: `${todaysMeals.filter(meal => meal.completed).length}/${todaysMeals.length}`,
                  label: 'Meals Completed',
                  color: '#34D399',
                  bgColor: 'rgba(52, 211, 153, 0.15)'
                },
                {
                  icon: <WhatshotIcon />,
                  value: `${Math.round((todaysMeals.filter(meal => meal.completed).length / todaysMeals.length) * 100)}%`,
                  label: 'Daily Goal',
                  color: '#FBBF24',
                  bgColor: 'rgba(251, 191, 36, 0.15)'
                },
                {
                  icon: <FavoriteIcon />,
                  value: weeklyProgress.streak || 0,
                  label: 'Day Streak',
                  color: '#F87171',
                  bgColor: 'rgba(248, 113, 113, 0.15)'
                }
              ].map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    sx={{
                      p: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: theme.palette.mode === 'dark' ? stat.bgColor : 'white',
                      border: theme.palette.mode === 'dark' ? `1px solid ${stat.color}40` : 'none',
                      borderRadius: '16px',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 4px 20px rgba(0,0,0,0.4)'
                        : '0 4px 20px rgba(0,0,0,0.1)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 8px 25px rgba(0,0,0,0.5)'
                          : '0 8px 25px rgba(0,0,0,0.2)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        background: theme.palette.mode === 'dark' ? `${stat.color}40` : stat.bgColor,
                        color: stat.color
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        mb: 1,
                        color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#2D3748',
                        fontWeight: 600,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.palette.mode === 'dark' ? '#D1D5DB' : '#718096',
                        textAlign: 'center',
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </MotionPaper>

          {/* Today's Meals */}
          <MotionPaper
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            sx={{ 
              p: 3,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(17,24,39,0.95) 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 8px 32px rgba(0,0,0,0.1)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              border: theme.palette.mode === 'dark'
                ? '1px solid rgba(255,255,255,0.1)'
                : 'none',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3,
                color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#2D3748',
                fontSize: '1.25rem',
                fontWeight: 600,
              }}
            >
              Today's Meals
            </Typography>
            <List>
              {todaysMeals.map((meal, index) => (
                <React.Fragment key={meal.id}>
                  <MotionListItem
                    onClick={() => handleMealToggle(meal.id, meal)}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: '12px',
                      mb: 2,
                      background: theme.palette.mode === 'dark'
                        ? meal.completed 
                          ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(52, 211, 153, 0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(17,24,39,0.95) 100%)'
                        : meal.completed
                          ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
                          : 'rgba(255,255,255,0.8)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 4px 20px rgba(0,0,0,0.4)'
                        : '0 4px 12px rgba(0,0,0,0.05)',
                      border: theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.1)'
                        : 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateX(5px)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 8px 25px rgba(0,0,0,0.5)'
                          : '0 6px 16px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Avatar 
                        sx={{ 
                          bgcolor: theme.palette.mode === 'dark'
                            ? meal.completed 
                              ? 'rgba(52, 211, 153, 0.2)'
                              : 'rgba(255,255,255,0.1)'
                            : meal.completed 
                              ? 'white' 
                              : 'grey.400',
                          color: theme.palette.mode === 'dark'
                            ? meal.completed
                              ? '#34D399'
                              : '#D1D5DB'
                            : meal.completed
                              ? 'success.main'
                              : 'white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        {meal.completed ? <CheckCircleIcon /> : <RestaurantIcon />}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              color: theme.palette.mode === 'dark'
                                ? meal.completed
                                  ? '#34D399'
                                  : '#F3F4F6'
                                : meal.completed
                                  ? 'white'
                                  : 'text.primary',
                              fontWeight: 'bold'
                            }}
                          >
                            {meal.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={`${meal.calories} cal`}
                            sx={{ 
                              bgcolor: theme.palette.mode === 'dark'
                                ? meal.completed
                                  ? 'rgba(52, 211, 153, 0.2)'
                                  : 'rgba(255,255,255,0.1)'
                                : meal.completed
                                  ? 'white'
                                  : 'grey.200',
                              color: theme.palette.mode === 'dark'
                                ? meal.completed
                                  ? '#34D399'
                                  : '#D1D5DB'
                                : meal.completed
                                  ? 'success.main'
                                  : 'text.primary',
                              fontWeight: 'bold',
                              border: theme.palette.mode === 'dark'
                                ? `1px solid ${meal.completed ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255,255,255,0.1)'}`
                                : 'none',
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: theme.palette.mode === 'dark'
                                ? meal.completed
                                  ? 'rgba(52, 211, 153, 0.8)'
                                  : '#D1D5DB'
                                : meal.completed
                                  ? 'rgba(255,255,255,0.8)'
                                  : 'text.secondary'
                            }}
                          >
                            {meal.time}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: theme.palette.mode === 'dark'
                                ? meal.completed
                                  ? 'rgba(52, 211, 153, 0.8)'
                                  : '#D1D5DB'
                                : meal.completed
                                  ? 'rgba(255,255,255,0.8)'
                                  : 'text.secondary'
                            }}
                          >
                            {meal.items.join(', ')}
                          </Typography>
                        </>
                      }
                    />
                  </MotionListItem>
                  {index < todaysMeals.length - 1 && (
                    <Divider 
                      sx={{ 
                        my: 2,
                        borderColor: theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(0,0,0,0.1)'
                      }} 
                    />
                  )}
                </React.Fragment>
              ))}
            </List>
          </MotionPaper>
        </Grid>
        
        {/* Weekly Progress */}
        <Grid item xs={12} lg={4}>
          <MotionPaper
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            sx={{ 
              p: 3, 
              mb: 3,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(17,24,39,0.95) 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 8px 32px rgba(0,0,0,0.1)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              border: theme.palette.mode === 'dark'
                ? '1px solid rgba(255,255,255,0.1)'
                : 'none',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3,
                color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#2D3748',
                fontSize: '1.25rem',
                fontWeight: 600,
              }}
            >
              Weekly Progress
            </Typography>
            {[
              { label: 'Calories', value: calculateProgress('calories'), color: '#60A5FA' },
              { label: 'Protein', value: calculateProgress('protein'), color: '#34D399' },
              { label: 'Carbs', value: calculateProgress('carbs'), color: '#FBBF24' },
              { label: 'Fat', value: calculateProgress('fat'), color: '#F87171' }
            ].map((item, index) => (
              <MotionBox
                key={item.label}
                variants={itemVariants}
                sx={{ mb: 3 }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.mode === 'dark' ? '#D1D5DB' : '#718096',
                      fontWeight: 500
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.mode === 'dark' ? '#D1D5DB' : '#718096',
                      fontWeight: 500
                    }}
                  >
                    {item.value}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={item.value} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: theme.palette.mode === 'dark' 
                      ? `${item.color}20`
                      : `${item.color}40`,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: item.color,
                      transition: 'width 1s ease-in-out'
                    }
                  }}
                />
              </MotionBox>
            ))}
          </MotionPaper>

          {/* Recent Achievements */}
          <MotionPaper
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            sx={{ 
              p: 3,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(17,24,39,0.95) 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 8px 32px rgba(0,0,0,0.1)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              border: theme.palette.mode === 'dark'
                ? '1px solid rgba(255,255,255,0.1)'
                : 'none',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3,
                color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#2D3748',
                fontSize: '1.25rem',
                fontWeight: 600,
              }}
            >
              Recent Achievements
            </Typography>
            {achievements.filter((a: Achievement) => a.unlocked).length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <EmojiEventsIcon sx={{ fontSize: 44, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Complete your daily meals to unlock achievements!
                </Typography>
              </Box>
            ) : (
              <List>
                {achievements
                  .filter((a: Achievement) => a.unlocked)
                  .sort((a: Achievement, b: Achievement) => {
                    const timeB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
                    const timeA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
                    return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
                  })
                  .slice(0, 3)
                  .map((achievement: Achievement, index: number) => {
                    let formattedDate = 'Recently';
                    if (achievement.unlockedAt) {
                      try {
                        const parsed = new Date(achievement.unlockedAt);
                        if (!isNaN(parsed.getTime())) {
                          formattedDate = format(parsed, 'MMM d, yyyy');
                        }
                      } catch {
                        formattedDate = 'Recently';
                      }
                    }

                    return (
                      <MotionListItem
                        key={achievement.id}
                        variants={itemVariants}
                        sx={{
                          borderRadius: '12px',
                          mb: 2,
                          background: theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(255,255,255,0.8)',
                          boxShadow: theme.palette.mode === 'dark'
                            ? '0 4px 20px rgba(0,0,0,0.4)'
                            : '0 4px 12px rgba(0,0,0,0.05)',
                          border: theme.palette.mode === 'dark'
                            ? '1px solid rgba(255,255,255,0.1)'
                            : 'none',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(5px)',
                            boxShadow: theme.palette.mode === 'dark'
                              ? '0 8px 25px rgba(0,0,0,0.5)'
                              : '0 6px 16px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        <ListItemIcon>
                          <Avatar 
                            sx={{ 
                              bgcolor: theme.palette.mode === 'dark'
                                ? 'rgba(96, 165, 250, 0.2)'
                                : 'primary.light',
                              color: theme.palette.mode === 'dark'
                                ? '#60A5FA'
                                : 'primary.main',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          >
                            <EmojiEventsIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  color: theme.palette.mode === 'dark' ? '#F3F4F6' : '#2D3748',
                                  fontWeight: 'bold'
                                }}
                              >
                                {achievement.title}
                              </Typography>
                              <Chip
                                size="small"
                                label={achievement.rarity}
                                sx={{ 
                                  bgcolor: theme.palette.mode === 'dark'
                                    ? 'rgba(96, 165, 250, 0.2)'
                                    : 'primary.light',
                                  color: theme.palette.mode === 'dark'
                                    ? '#60A5FA'
                                    : 'primary.main',
                                  textTransform: 'capitalize',
                                  fontWeight: 'bold',
                                  border: theme.palette.mode === 'dark'
                                    ? '1px solid rgba(96, 165, 250, 0.2)'
                                    : 'none',
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: theme.palette.mode === 'dark' ? '#D1D5DB' : '#718096'
                                }}
                              >
                                {achievement.description}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: theme.palette.mode === 'dark' ? '#34D399' : 'success.main',
                                  display: 'block',
                                  mt: 1,
                                  fontWeight: 'bold'
                                }}
                              >
                                Unlocked {formattedDate}
                              </Typography>
                            </>
                          }
                        />
                      </MotionListItem>
                    );
                  })}
              </List>
            )}
          </MotionPaper>
        </Grid>
      </Grid>
    </Box>
  );
} 
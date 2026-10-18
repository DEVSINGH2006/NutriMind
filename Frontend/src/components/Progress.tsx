import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  IconButton,
  Collapse,
  useTheme,
  useMediaQuery,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Timeline as TimelineIcon,
  LocalDining as LocalDiningIcon,
  Whatshot as WhatshotIcon,
  DirectionsRun as DirectionsRunIcon,
  WaterDrop as WaterDropIcon,
  FitnessCenter as FitnessCenterIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useProgress } from '../contexts/ProgressContext';
import { format, subDays } from 'date-fns';
import { useUser } from '../contexts/UserContext';

const MotionCard = motion(Card);
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

interface DailyProgress {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    snacks: boolean;
  };
}

const sampleProgress: DailyProgress[] = Array.from({ length: 7 }, (_, i) => ({
  date: format(subDays(new Date(), i), 'MMM dd'),
  calories: Math.floor(Math.random() * 500) + 1500,
  protein: Math.floor(Math.random() * 30) + 70,
  carbs: Math.floor(Math.random() * 50) + 150,
  fat: Math.floor(Math.random() * 20) + 40,
  water: Math.floor(Math.random() * 2) + 6,
  meals: {
    breakfast: Math.random() > 0.2,
    lunch: Math.random() > 0.1,
    dinner: Math.random() > 0.15,
    snacks: Math.random() > 0.3,
  },
}));

// Add hover animation variants
const hoverVariants = {
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};

// Add click animation variants
const clickVariants = {
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

export default function Progress() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const { mealProgress, weeklyProgress } = useProgress();
  const { getUserData, user } = useUser();
  const userData = getUserData();

  // Determine how many days to show:
  // For a newly created account, only show days from the account creation date onwards (max 7 days up to today)
  const accountCreatedDate = (() => {
    if (user?.createdAt) return new Date(user.createdAt);
    try {
      const accounts = JSON.parse(localStorage.getItem('nutrimind_registered_accounts') || '{}');
      if (user?.email && accounts[user.email.toLowerCase()]?.createdAt) {
        return new Date(accounts[user.email.toLowerCase()].createdAt);
      }
    } catch {}
    return new Date();
  })();

  const todayDate = new Date();
  const startOfCreated = new Date(accountCreatedDate.getFullYear(), accountCreatedDate.getMonth(), accountCreatedDate.getDate()).getTime();
  const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()).getTime();
  const daysSinceCreation = Math.max(0, Math.floor((startOfToday - startOfCreated) / (1000 * 60 * 60 * 24)));

  // Show at least 1 day (today), capped at 7 days
  const numDaysToShow = Math.min(7, daysSinceCreation + 1);

  // Generate days array from registration date (capped at 7) up to today
  const displayedDays = [...Array(numDaysToShow)].map((_, i) => {
    const date = format(subDays(todayDate, i), 'yyyy-MM-dd');
    const dayProgress = mealProgress.find(p => p.date === date) || {
      date,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      water: 0,
      meals: {
        breakfast: false,
        lunch: false,
        dinner: false,
        snacks: false
      }
    };
    return dayProgress;
  }).reverse();

  const handleExpandClick = (index: number) => {
    setExpandedDay(expandedDay === index ? null : index);
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return 'success';
    if (percentage >= 60) return 'primary';
    if (percentage >= 30) return 'warning';
    return 'error';
  };

  // Calculate weekly stats based on displayed days
  const weeklyStats = {
    avgCalories: Math.round(displayedDays.reduce((acc, day) => acc + day.calories, 0) / (displayedDays.length || 1)),
    avgProtein: Math.round(displayedDays.reduce((acc, day) => acc + day.protein, 0) / (displayedDays.length || 1)),
    avgCarbs: Math.round(displayedDays.reduce((acc, day) => acc + day.carbs, 0) / (displayedDays.length || 1)),
    avgFat: Math.round(displayedDays.reduce((acc, day) => acc + day.fat, 0) / (displayedDays.length || 1)),
    completedMeals: displayedDays.reduce((acc, day) => 
      acc + Object.values(day.meals).filter(Boolean).length, 0
    ),
    totalMeals: displayedDays.length * 4 // 4 meals per day including snacks
  };

  // Animation variants
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
      {/* Weekly Overview */}
      <MotionBox
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{ mb: 4 }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(45deg, #60A5FA 30%, #A78BFA 90%)'
              : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}
        >
          Weekly Progress Overview
        </Typography>
        <Grid container spacing={3}>
          {[
            {
              icon: <LocalDiningIcon />,
              label: 'Avg. Calories',
              value: weeklyStats.avgCalories,
              target: userData?.calorieGoal || 2000,
              color: '#60A5FA'
            },
            {
              icon: <FitnessCenterIcon />,
              label: 'Avg. Protein',
              value: weeklyStats.avgProtein,
              target: userData?.proteinGoal || 150,
              color: '#34D399'
            },
            {
              icon: <WhatshotIcon />,
              label: 'Meals Completed',
              value: `${weeklyStats.completedMeals}/${weeklyStats.totalMeals}`,
              color: '#FBBF24'
            }
          ].map((stat, index) => (
            <Grid item xs={12} sm={4} md={4} key={index}>
              <MotionPaper
                variants={itemVariants}
                sx={{
                  p: 3,
                  height: '100%',
                  background: theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}10 100%)`
                    : 'white',
                  borderRadius: 2,
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 8px 32px rgba(0,0,0,0.4)'
                    : '0 8px 32px rgba(0,0,0,0.1)',
                  border: theme.palette.mode === 'dark'
                    ? `1px solid ${stat.color}40`
                    : 'none',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}20`,
                      color: stat.color,
                      mr: 2
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h6" color="text.primary">
                    {stat.value}
                    {stat.target && (
                      <Typography component="span" variant="body2" color="text.secondary">
                        /{stat.target}
                      </Typography>
                    )}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </MotionPaper>
            </Grid>
          ))}
        </Grid>
      </MotionBox>

      {/* Daily Progress Cards */}
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Daily Breakdown
      </Typography>
      <Grid container spacing={3}>
        {displayedDays.map((day, index) => (
          <Grid item xs={12} key={day.date}>
            <MotionCard
              variants={itemVariants}
              sx={{
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(17,24,39,0.95) 100%)'
                  : 'white',
                borderRadius: 2,
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 8px 32px rgba(0,0,0,0.4)'
                  : '0 8px 32px rgba(0,0,0,0.1)',
                border: theme.palette.mode === 'dark'
                  ? '1px solid rgba(255,255,255,0.1)'
                  : 'none',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateX(8px)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {format(new Date(day.date), 'EEEE, MMMM d')}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimelineIcon fontSize="small" />
                      Daily Progress
                    </Typography>
                  </Box>
                  <IconButton onClick={() => handleExpandClick(index)}>
                    {expandedDay === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Calories
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={(day.calories / (userData?.calorieGoal || 2000)) * 100}
                            color={getProgressColor(day.calories, userData?.calorieGoal || 2000)}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {day.calories}/{userData?.calorieGoal || 2000}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Collapse in={expandedDay === index}>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Nutrition Breakdown
                    </Typography>
                    <Grid container spacing={2}>
                      {[
                        { label: 'Protein', value: day.protein, target: userData?.proteinGoal || 150, unit: 'g' },
                        { label: 'Carbs', value: day.carbs, target: userData?.carbsGoal || 250, unit: 'g' },
                        { label: 'Fat', value: day.fat, target: userData?.fatGoal || 70, unit: 'g' }
                      ].map((nutrient, idx) => (
                        <Grid item xs={12} sm={4} key={idx}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              {nutrient.label}
                            </Typography>
                            <Box sx={{ position: 'relative', display: 'inline-flex', mt: 1 }}>
                              <CircularProgress
                                variant="determinate"
                                value={(nutrient.value / nutrient.target) * 100}
                                color={getProgressColor(nutrient.value, nutrient.target)}
                                size={60}
                              />
                              <Box
                                sx={{
                                  top: 0,
                                  left: 0,
                                  bottom: 0,
                                  right: 0,
                                  position: 'absolute',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Typography variant="caption" component="div" color="text.secondary">
                                  {nutrient.value}/{nutrient.target}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Meal Completion
                    </Typography>
                    <List dense>
                      {Object.entries(day.meals).map(([meal, completed]) => (
                        <ListItem key={meal}>
                          <ListItemIcon>
                            <LocalDiningIcon 
                              color={completed ? 'success' : 'error'} 
                              fontSize="small" 
                            />
                          </ListItemIcon>
                          <ListItemText 
                            primary={meal.charAt(0).toUpperCase() + meal.slice(1)}
                            secondary={completed ? 'Completed' : 'Missed'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Collapse>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
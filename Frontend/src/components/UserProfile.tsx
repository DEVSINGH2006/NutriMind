import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Avatar,
  Chip,
  useTheme,
  alpha,
  Container,
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  FitnessCenter as FitnessCenterIcon,
  LocalDining as LocalDiningIcon,
  Speed as SpeedIcon,
  MonitorWeight as WeightIcon,
  Height as HeightIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const MotionPaper = motion(Paper);

export default function UserProfile() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, getUserData } = useUser();
  const userData = getUserData();

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const email = user?.email || 'user@example.com';

  const age = userData?.age ? `${userData.age} years` : 'Not specified';
  const gender = userData?.gender || 'Not specified';
  const weight = userData?.weight ? `${userData.weight} kg` : 'Not specified';
  const height = userData?.height ? `${userData.height} cm` : 'Not specified';
  const activityLevel = userData?.activity_level || 'Medium Active';
  const dietaryRestrictions =
    userData?.dietary_restrictions && userData.dietary_restrictions.length > 0
      ? userData.dietary_restrictions.join(', ')
      : 'None';
  const healthConditions =
    userData?.health_conditions && userData.health_conditions.length > 0
      ? userData.health_conditions.join(', ')
      : 'None';
  const calorieGoal = userData?.calorieGoal ? `${userData.calorieGoal} kcal` : '2,000 kcal';

  const profileRows = [
    { label: 'Age', value: age, icon: <SpeedIcon fontSize="small" color="primary" /> },
    { label: 'Gender', value: gender, icon: <AccountCircleIcon fontSize="small" color="primary" /> },
    { label: 'Weight (kg)', value: weight, icon: <WeightIcon fontSize="small" color="primary" /> },
    { label: 'Height (cm)', value: height, icon: <HeightIcon fontSize="small" color="primary" /> },
    { label: 'Activity Level', value: activityLevel, icon: <FitnessCenterIcon fontSize="small" color="primary" /> },
    { label: 'Dietary Restrictions', value: dietaryRestrictions, icon: <LocalDiningIcon fontSize="small" color="primary" /> },
    { label: 'Health Conditions', value: healthConditions, icon: <FavoriteIcon fontSize="small" color="primary" /> },
    { label: 'Target Calories', value: calorieGoal, icon: <SpeedIcon fontSize="small" color="primary" /> },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(45deg, #3B82F6 20%, #8B5CF6 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Your Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Personal biometric details, dietary preferences, and target nutritional goals
        </Typography>
      </Box>

      <MotionPaper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(17,24,39,0.95) 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 12px 40px rgba(0,0,0,0.5)'
              : '0 12px 36px rgba(0,0,0,0.06)',
          border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
        }}
      >
        {/* User Identity Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Avatar
            sx={{
              width: 72,
              height: 72,
              bgcolor: theme.palette.primary.main,
              color: 'white',
              fontSize: '1.8rem',
              fontWeight: 700,
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
            }}
          >
            {displayName[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {email}
            </Typography>
          </Box>
          <Chip
            label={userData ? 'Profile Active' : 'Setup Required'}
            color={userData ? 'success' : 'warning'}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Profile Attributes Table / Grid */}
        <Grid container spacing={2}>
          {profileRows.map((row) => (
            <Grid item xs={12} sm={6} key={row.label}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.common.white, 0.03)
                      : alpha(theme.palette.common.black, 0.02),
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {row.icon}
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {row.label}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    textAlign: 'right',
                    maxWidth: '55%',
                    textTransform: row.label === 'Dietary Restrictions' ? 'capitalize' : 'none',
                  }}
                >
                  {row.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            mt: 4,
            pt: 2,
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{
              px: 4,
              py: 1.2,
              borderRadius: 2.5,
              fontWeight: 600,
              textTransform: 'none',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.35)}`,
              '&:hover': {
                transform: 'translateY(-2px)',
              },
            }}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<EditIcon />}
            onClick={() => navigate('/form')}
            sx={{
              px: 3,
              py: 1.2,
              borderRadius: 2.5,
              fontWeight: 600,
              textTransform: 'none',
              borderColor: alpha(theme.palette.primary.main, 0.5),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            Update Metrics & Goals
          </Button>
        </Box>
      </MotionPaper>
    </Container>
  );
}

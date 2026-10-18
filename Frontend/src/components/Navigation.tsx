import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useTheme,
  Chip,
  Switch,
  Container,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  FitnessCenter as FitnessCenterIcon,
  Restaurant as RestaurantIcon,
  Timeline as TimelineIcon,
  EmojiEvents as EmojiEventsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Dashboard as DashboardIcon,
  ArrowBack,
  TrendingUp as TrendingUpIcon,
  LocalDining as LocalDiningIcon,
  Assessment,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useUser } from '../contexts/UserContext';
import { useProgress, Achievement } from '../contexts/ProgressContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationProps {
  currentPage: 'form' | 'plan' | 'dashboard' | 'progress' | 'achievements';
  isOpen: boolean;
  onToggle: () => void;
  showBackButton?: boolean;
}

export default function Navigation({ currentPage, isOpen, onToggle, showBackButton }: NavigationProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, toggleTheme, isDarkMode } = useUser();
  const { achievements } = useProgress();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  const navigationItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/dashboard',
      active: currentPage === 'dashboard',
      description: 'Overview of your diet progress'
    },
    { 
      text: 'Diet Plan', 
      icon: <LocalDiningIcon />, 
      path: '/plan',
      active: currentPage === 'plan',
      description: 'View your current diet plan'
    },
    { 
      text: 'Progress Tracking', 
      icon: <TrendingUpIcon />, 
      path: '/progress',
      active: currentPage === 'progress',
      description: 'Track your health metrics'
    },
    { 
      text: 'Achievements', 
      icon: <EmojiEventsIcon />, 
      path: '/achievements',
      active: currentPage === 'achievements',
      description: 'Your milestones and rewards'
    },
  ];

  const handleClose = () => {
    setAnchorEl(null);
    setNotificationAnchor(null);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onToggle();
  };

  const drawer = (
    <Box 
      sx={{ 
        width: 280, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Box
        sx={{
          py: 4,
          px: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          bgcolor: theme.palette.mode === 'light' 
            ? theme.palette.primary.main 
            : alpha(theme.palette.primary.main, 0.1),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at top right, ${alpha(theme.palette.primary.light, 0.1)}, transparent)`,
            zIndex: 0,
          }
        }}
      >
        <Avatar
          src={user?.photoURL || undefined}
          sx={{ 
            width: 84,
            height: 84,
            border: '3px solid',
            borderColor: 'white',
            bgcolor: theme.palette.mode === 'light' ? 'white' : theme.palette.primary.main,
            color: theme.palette.mode === 'light' ? theme.palette.primary.main : 'white',
            fontSize: '2rem',
            fontWeight: 'bold',
            boxShadow: theme.shadows[4],
            zIndex: 1,
          }}
        >
          {user?.displayName?.[0] || <AccountCircleIcon sx={{ fontSize: '2.5rem' }} />}
        </Avatar>
        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.mode === 'light' ? 'white' : theme.palette.text.primary,
            }}
          >
            {user?.displayName || 'Guest'}
          </Typography>
          <Chip
            size="small"
            label="Premium Member"
            sx={{
              mt: 1,
              bgcolor: theme.palette.mode === 'light' 
                ? alpha(theme.palette.common.white, 0.2)
                : theme.palette.primary.main,
              color: theme.palette.mode === 'light' ? 'white' : 'white',
              border: '1px solid',
              borderColor: theme.palette.mode === 'light' 
                ? alpha(theme.palette.common.white, 0.3)
                : theme.palette.primary.dark,
              '& .MuiChip-label': { 
                px: 2,
                fontWeight: 500,
              },
            }}
          />
        </Box>
      </Box>

      <List 
        sx={{ 
          px: 2,
          py: 3,
          flex: 1,
        }}
      >
        {navigationItems.map((item) => (
          <ListItem 
            key={item.text} 
            disablePadding 
            sx={{ mb: 1 }}
          >
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              selected={item.active}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                transition: theme.transitions.create(['background-color', 'box-shadow']),
                '&:hover': {
                  bgcolor: theme.palette.mode === 'light'
                    ? alpha(theme.palette.primary.main, 0.08)
                    : alpha(theme.palette.primary.main, 0.15),
                },
                '&.Mui-selected': {
                  bgcolor: theme.palette.mode === 'light'
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.primary.main, 0.25),
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'light'
                      ? alpha(theme.palette.primary.main, 0.25)
                      : alpha(theme.palette.primary.main, 0.35),
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: item.active 
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: item.active ? 600 : 400,
                    color: item.active 
                      ? theme.palette.text.primary
                      : theme.palette.text.secondary,
                  }}
                >
                  {item.text}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    display: 'block',
                  }}
                >
                  {item.description}
                </Typography>
              </Box>
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2, opacity: 0.5 }} />

      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: theme.palette.mode === 'light'
            ? alpha(theme.palette.primary.main, 0.03)
            : alpha(theme.palette.background.paper, 0.5),
        }}
      >
        <Avatar
          src={user?.photoURL || undefined}
          sx={{ 
            width: 40,
            height: 40,
            bgcolor: theme.palette.primary.main,
          }}
        >
          {user?.displayName?.[0]}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {user?.displayName}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.primary.main,
              fontWeight: 500,
            }}
          >
            Premium Account
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: isOpen ? `calc(100% - 280px)` : '100%' },
          ml: { sm: isOpen ? '280px' : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={onToggle}
            sx={{ 
              mr: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.1)',
                bgcolor: alpha(theme.palette.common.white, 0.15),
              },
              '&:active': {
                transform: 'scale(0.95)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          
          {showBackButton && (
            <IconButton 
              color="inherit" 
              onClick={() => navigate(-1)}
              sx={{ mr: 1 }}
            >
              <ArrowBack />
            </IconButton>
          )}

          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.5px',
                background: 'linear-gradient(45deg, #3B82F6 20%, #8B5CF6 80%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              NutriMind
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: { xs: 'none', md: 'inline-block' },
                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                fontWeight: 500,
                letterSpacing: '0.2px'
              }}
            >
              Intelligent Nutrition, Simplified Living
            </Typography>
          </Box>

          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5 
            }}
          >
            <Tooltip title="Help Center">
              <IconButton 
                onClick={() => setHelpOpen(true)}
                sx={{ 
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <HelpIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton 
                onClick={handleNotifications}
                sx={{ 
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <Badge 
                  badgeContent={unlockedAchievements.length} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: theme.palette.error.main,
                    },
                  }}
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Box 
              sx={{ 
                height: 24, 
                width: 1, 
                bgcolor: theme.palette.divider,
                mx: 1,
              }} 
            />

            <Tooltip title="Account settings">
              <IconButton
                onClick={handleMenu}
                sx={{
                  p: 0.5,
                  border: 2,
                  borderColor: 'transparent',
                  transition: theme.transitions.create(['border-color', 'transform']),
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Avatar
                  src={user?.photoURL || undefined}
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                  }}
                >
                  {user?.displayName?.[0] || <AccountCircleIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={onToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: isOpen ? 280 : 0,
            boxSizing: 'border-box',
            overflow: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
        open={isOpen}
      >
        {drawer}
      </Drawer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1.5,
            minWidth: 250,
            borderRadius: 2,
            overflow: 'visible',
            border: `1px solid ${theme.palette.divider}`,
            '& .MuiMenuItem-root': {
              py: 1.5,
              px: 2.5,
            },
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Signed in as
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { handleClose(); navigate('/form'); }}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          Your Profile
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); setSettingsOpen(true); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={toggleTheme}>
          <ListItemIcon>
            {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </ListItemIcon>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            Dark Mode
            <Switch
              size="small"
              checked={isDarkMode}
              onChange={toggleTheme}
              sx={{ ml: 1 }}
            />
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon sx={{ color: 'inherit' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1.5,
            width: 360,
            borderRadius: 2,
            overflow: 'visible',
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {unlockedAchievements.length > 0 
              ? `You have ${unlockedAchievements.length} unlocked achievement${unlockedAchievements.length > 1 ? 's' : ''}`
              : 'No new notifications'}
          </Typography>
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {unlockedAchievements.length > 0 ? (
            unlockedAchievements.slice(0, 3).map((ach) => (
              <ListItem 
                key={ach.id} 
                sx={{ 
                  px: 2, 
                  py: 1.5, 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) }
                }}
                onClick={() => {
                  setNotificationAnchor(null);
                  navigate('/achievements');
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                      <EmojiEventsIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" color="primary">
                        New Achievement!
                      </Typography>
                      <Typography variant="body2">
                        {ach.title}: {ach.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        Recently unlocked
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            ))
          ) : (
            <ListItem sx={{ px: 2, py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Complete meals to unlock new achievements!
              </Typography>
            </ListItem>
          )}
        </List>
        <Divider />
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography 
            variant="body2" 
            color="primary"
            onClick={() => {
              setNotificationAnchor(null);
              navigate('/achievements');
            }}
            sx={{ 
              cursor: 'pointer',
              fontWeight: 500,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            View All Achievements
          </Typography>
        </Box>
      </Menu>

      {/* Help Center Dialog */}
      <Dialog 
        open={helpOpen} 
        onClose={() => setHelpOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HelpIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              NutriMind Help Center & Nutrition Guide
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setHelpOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 600 }}>How does NutriMind generate my diet plan?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                NutriMind uses your biometric profile (age, gender, height, weight, activity level) to calculate your Basal Metabolic Rate (BMR) via the Mifflin-St Jeor equation. We then apply your Total Daily Energy Expenditure (TDEE) multiplier and balance meal portions with exact gram-weight Indian household foods to hit your protein, carbohydrate, and healthy fat targets.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 600 }}>How do I track and complete my daily meals?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Simply click on any meal on your Dashboard or Diet Plan tab (or tap the green checkmark icon). When marked complete, your consumed calories and macronutrient progress bars automatically update and count towards daily achievements and streaks.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 600 }}>What accounts can I use to sign in?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                NutriMind comes pre-configured with 2 accounts: <strong>demo</strong> (password: <code>password123</code>) and <strong>test</strong> (password: <code>password123</code>). All other users can click <strong>Sign Up</strong> on the authentication page to create their personal account.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 600 }}>What dietary preferences are supported?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                NutriMind features authentic Indian meals categorized into <strong>Vegetarian</strong>, <strong>Non-vegetarian</strong>, <strong>Vegan</strong>, and <strong>Lactose-Free</strong> options, complete with precise gram weights for home cooking.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="contained" onClick={() => setHelpOpen(false)} sx={{ borderRadius: 2 }}>
            Got It
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Account Settings
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setSettingsOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Appearance
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Dark Mode
              </Typography>
              <Switch checked={isDarkMode} onChange={toggleTheme} />
            </Box>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Active Profile
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {user?.displayName || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Dietary Profile
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              fullWidth
              onClick={() => {
                setSettingsOpen(false);
                navigate('/form');
              }}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Update Health Metrics & Preferences
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="contained" onClick={() => setSettingsOpen(false)} sx={{ borderRadius: 2 }}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 
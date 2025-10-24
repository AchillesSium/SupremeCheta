import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  MenuItem,
  Menu,
  Avatar,
  InputBase,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Settings as SettingsIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useAuth } from '../../../providers/AuthProvider';

const drawerWidth = 240;

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.primary,
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  width: 40,
  height: 40,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '100%',
    '&::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 0.7,
    },
  },
}));

const StyledSearchBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  maxWidth: '400px',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const StyledMenuButton = styled(IconButton)(({ theme }) => ({
  width: 45,
  height: 45,
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    transform: 'scale(1.05)',
    '& .MuiSvgIcon-root': {
      transform: 'rotate(180deg)',
      color: theme.palette.primary.main,
    },
  },
  '& .MuiSvgIcon-root': {
    transition: 'all 0.3s ease',
    fontSize: 24,
    color: alpha(theme.palette.primary.main, 0.8),
  },
}));

const Header = ({ open, toggleDrawer, toggleTheme, isDarkMode }) => {
  const theme = useTheme();
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleNotificationsOpen = (event) => setNotificationsAnchorEl(event.currentTarget);
  const handleProfileOpen = (event) => setProfileAnchorEl(event.currentTarget);
  const handleMenuClose = () => {
    setNotificationsAnchorEl(null);
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${open ? drawerWidth : 72}px)` },
        ml: { sm: `${open ? drawerWidth : 72}px` },
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
      elevation={0}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <StyledMenuButton
            onClick={toggleDrawer}
            edge="start"
            aria-label="menu"
          >
            <MenuIcon />
          </StyledMenuButton>

          <StyledSearchBox>
            <Box
              sx={{
                padding: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <IconButton sx={{ p: '10px', color: 'text.secondary' }}>
                <SearchIcon />
              </IconButton>
              <StyledInputBase
                placeholder="Search..."
                inputProps={{ 'aria-label': 'search' }}
              />
            </Box>
          </StyledSearchBox>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <StyledIconButton onClick={handleNotificationsOpen}>
            <StyledBadge badgeContent={4} color="error">
              <NotificationsIcon />
            </StyledBadge>
          </StyledIconButton>
          <StyledIconButton>
            <StyledBadge badgeContent={2} color="error">
              <EmailIcon />
            </StyledBadge>
          </StyledIconButton>
          <StyledIconButton onClick={toggleTheme}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </StyledIconButton>
          <StyledIconButton>
            <SettingsIcon />
          </StyledIconButton>

          <Tooltip title="Profile">
            <IconButton
              onClick={handleProfileOpen}
              sx={{
                ml: 1,
                p: 0.5,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                '&:hover': {
                  border: `2px solid ${theme.palette.primary.main}`,
                },
              }}
            >
              <Avatar
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={notificationsAnchorEl}
          open={Boolean(notificationsAnchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              backdropFilter: 'blur(8px)',
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1.5,
                borderRadius: 1,
                mx: 0.5,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              },
            },
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <Box>
              <Typography variant="subtitle2">New Order #1234</Typography>
              <Typography variant="caption" color="text.secondary">
                2 minutes ago
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Box>
              <Typography variant="subtitle2">Stock Alert: Product XYZ</Typography>
              <Typography variant="caption" color="text.secondary">
                5 minutes ago
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Box>
              <Typography variant="subtitle2">3 New Reviews</Typography>
              <Typography variant="caption" color="text.secondary">
                15 minutes ago
              </Typography>
            </Box>
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={profileAnchorEl}
          open={Boolean(profileAnchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              backdropFilter: 'blur(8px)',
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1.5,
                borderRadius: 1,
                mx: 0.5,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              },
            },
          }}
        >
          <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
          <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

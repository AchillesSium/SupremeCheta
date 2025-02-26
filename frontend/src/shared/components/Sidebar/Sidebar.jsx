import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Box,
  Typography,
  Avatar,
  Button,
  Divider,
  useTheme,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ProductsIcon,
  People as CustomersIcon,
  Assessment as AnalyticsIcon,
  Settings as SettingsIcon,
  LocalShipping as OrdersIcon,
  Category as CategoriesIcon,
  Inventory as InventoryIcon,
  Store as VendorsIcon,
  HelpOutline as HelpIcon,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(8px)',
    borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow: `1px 0 12px ${alpha(theme.palette.primary.main, 0.08)}`,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  padding: theme.spacing(0.5, 2),
  '& .MuiListItemButton-root': {
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(1.5, 2),
    transition: 'all 0.2s ease',
    backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
    '&:hover': {
      backgroundColor: active 
        ? alpha(theme.palette.primary.main, 0.12) 
        : alpha(theme.palette.primary.main, 0.04),
    },
    '& .MuiListItemIcon-root': {
      color: active ? theme.palette.primary.main : theme.palette.text.secondary,
      minWidth: 40,
    },
    '& .MuiListItemText-primary': {
      fontWeight: active ? 600 : 400,
      fontSize: '0.875rem',
      color: active ? theme.palette.primary.main : theme.palette.text.primary,
    },
  },
}));

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Orders', icon: <OrdersIcon />, path: '/dashboard/orders' },
  { text: 'Products', icon: <ProductsIcon />, path: '/dashboard/products' },
  { text: 'Customers', icon: <CustomersIcon />, path: '/dashboard/customers' },
  { text: 'Categories', icon: <CategoriesIcon />, path: '/dashboard/categories' },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/dashboard/inventory' },
  { text: 'Vendors', icon: <VendorsIcon />, path: '/dashboard/vendors' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/dashboard/analytics' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings' },
];

const Sidebar = ({ open, toggleDrawer }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <StyledDrawer
      variant="permanent"
      sx={{
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 72,
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 64,
          }}
        >
          {open && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              >
                SC
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
                  SUPREME
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'primary.main',
                    letterSpacing: 2,
                    fontWeight: 500,
                  }}
                >
                  CHETA
                </Typography>
              </Box>
            </Box>
          )}
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.1) }} />

        {/* Navigation */}
        <List sx={{ px: 2, pt: 2, flex: 1 }}>
          {menuItems.map((item) => (
            <StyledListItem
              key={item.text}
              disablePadding
              active={location.pathname === item.path ? 1 : 0}
            >
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={item.text} />}
              </ListItemButton>
            </StyledListItem>
          ))}
        </List>

        {/* Help Section */}
        {open && (
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  width: 40,
                  height: 40,
                }}
              >
                <HelpIcon />
              </Avatar>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Need Help?
              </Typography>
              <Typography variant="caption" align="center" color="text.secondary" sx={{ mb: 1 }}>
                Check our documentation for detailed instructions
              </Typography>
              <Button
                fullWidth
                variant="contained"
                endIcon={<KeyboardArrowRight />}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.9),
                  '&:hover': {
                    bgcolor: theme.palette.primary.main,
                  },
                  borderRadius: '12px',
                  textTransform: 'none',
                }}
              >
                Documentation
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </StyledDrawer>
  );
};

export default Sidebar;

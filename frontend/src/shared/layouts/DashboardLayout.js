import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';

const drawerWidth = 0;

const DashboardLayout = ({ children, toggleTheme, isDarkMode }) => {
  const [open, setOpen] = useState(true);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header 
        open={open} 
        drawerWidth={drawerWidth}
        toggleDrawer={toggleDrawer} 
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
      />
      <Sidebar 
        open={open} 
        drawerWidth={drawerWidth}
        toggleDrawer={toggleDrawer} 
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginLeft: { sm: `${open ? drawerWidth : -180}px` },
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;

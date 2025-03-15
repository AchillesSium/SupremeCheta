import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { lightTheme, darkTheme } from './theme/theme';
import DashboardLayout from './shared/layouts/DashboardLayout';
import Dashboard from './features/admin/Dashboard';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

const App = () => {
  const [mode, setMode] = useState('light');

  // Create theme instance
  const theme = useMemo(
    () => mode === 'light' ? lightTheme : darkTheme,
    [mode]
  );

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          
          {/* Dashboard Routes */}
          <Route path="/" element={
            <DashboardLayout toggleTheme={toggleTheme} isDarkMode={mode === 'dark'} />
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { lightTheme, darkTheme } from './theme/theme';
import { useAuth } from './providers/AuthProvider';
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
  const { user, isRegistered } = useAuth();
  const location = useLocation();

  // Create theme instance
  const theme = useMemo(
    () => mode === 'light' ? lightTheme : darkTheme,
    [mode]
  );

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Determine the initial route
  const getInitialRoute = () => {
    if (user) {
      return <Navigate to="/dashboard" replace />;
    }
    if (isRegistered === false) {
      return <Navigate to="/register" replace />;
    }
    return <Navigate to="/login" replace />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {/* Initial Route */}
          <Route path="/" element={getInitialRoute()} />

          {/* Auth Routes */}
          <Route path="/register" element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : isRegistered ? (
              <Navigate to="/login" replace />
            ) : (
              <RegisterForm />
            )
          } />
          
          <Route path="/login" element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : isRegistered === false ? (
              <Navigate to="/register" replace />
            ) : (
              <LoginForm />
            )
          } />
          
          {/* Protected Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={
              !user ? (
                <Navigate to="/" state={{ from: location }} replace />
              ) : (
                <DashboardLayout toggleTheme={toggleTheme} isDarkMode={mode === 'dark'} />
              )
            }
          >
            <Route index element={<Dashboard />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
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
// frontend/src/components/auth/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { hasRole } from '../../utils/tokenManager';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Protected Route Component
 * Restricts access based on authentication and role
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string|string[]} props.requiredRole - Required role(s) to access route
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if requiredRole is specified
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        p={3}
      >
        <Typography variant="h4" color="error" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          You don't have permission to access this page.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
          Required role: {Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your role: {user.role}
        </Typography>
      </Box>
    );
  }

  // User is authenticated and has required role
  return children;
};

export default ProtectedRoute;

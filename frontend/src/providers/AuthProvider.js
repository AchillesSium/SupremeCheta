// frontend/src/providers/AuthProvider.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi, getCurrentUser, changePassword as changePasswordApi } from '../utils/api';
import { setTokens, getUser, setUser as saveUser, clearTokens, getAccessToken } from '../utils/tokenManager';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getAccessToken();
        const userData = getUser();

        if (token && userData) {
          // Optionally fetch fresh user data from server
          try {
            const freshUser = await getCurrentUser();
            setUser(freshUser);
            saveUser(freshUser);
          } catch (err) {
            // If fetch fails, use cached data
            console.log('Using cached user data');
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAuth = useCallback(() => {
    clearTokens();
    setUser(null);
    setError(null);
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const data = await loginApi(credentials);

      // Store tokens
      setTokens(data.accessToken, data.refreshToken);

      // Store user
      saveUser(data.user);
      setUser(data.user);

      return data;
    } catch (error) {
      setError(error.message);
      clearAuth();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await registerApi(userData);

      // Registration successful, but don't auto-login
      // User must login with credentials

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);

    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);

    try {
      const data = await changePasswordApi({ currentPassword, newPassword });
      clearAuth();
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    changePassword,
    clearAuth,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
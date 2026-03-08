// frontend/src/utils/api.js
import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isTokenExpired,
  getOrCreateFingerprint
} from './tokenManager';
import { API_URL } from '../config/constants';

const BASE_API_URL = API_URL;

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let refreshSubscribers = [];

/**
 * Subscribe to token refresh completion
 * @param {Function} callback - Callback to execute when token is refreshed
 */
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * Notify all subscribers when token is refreshed
 * @param {string} accessToken - New access token
 */
const onTokenRefreshed = (accessToken) => {
  refreshSubscribers.forEach(callback => callback(accessToken));
  refreshSubscribers = [];
};

/**
 * Refresh access token using refresh token
 * @returns {Promise<string>} New access token
 */
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(`${BASE_API_URL}/api/auth/refresh`, {
      refreshToken
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Store new tokens
    setTokens(accessToken, newRefreshToken);

    return accessToken;
  } catch (error) {
    // Refresh failed, clear tokens and redirect to login
    clearTokens();
    window.location.href = '/login';
    throw error;
  }
};

// REQUEST INTERCEPTOR - Add JWT token and handle token expiry
api.interceptors.request.use(
  async (config) => {
    const fingerprint = getOrCreateFingerprint();
    config.headers['X-Fingerprint'] = fingerprint;

    let accessToken = getAccessToken();

    // Check if token is expired (proactive refresh)
    if (accessToken && isTokenExpired(accessToken)) {

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          accessToken = await refreshAccessToken();
          isRefreshing = false;
          onTokenRefreshed(accessToken);
        } catch (error) {
          isRefreshing = false;
          throw error;
        }
      } else {
        // Wait for the refresh to complete
        accessToken = await new Promise(resolve => {
          subscribeTokenRefresh(token => resolve(token));
        });
      }
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR - Handle 401 errors and auto-refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    console.error('API Error:', error.response?.data || error.message);

    // If 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorCode = error.response?.data?.code;
      
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'TOKEN_FAMILY_INVALID') {
        // Token expired or invalidated (e.g., password changed elsewhere)
        if (errorCode === 'TOKEN_FAMILY_INVALID') {
          clearTokens();
          window.location.href = '/login?message=Session invalidated. Please login again.';
          return Promise.reject(error);
        }
        
        originalRequest._retry = true;

        try {
          const accessToken = await refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        clearTokens();
        window.location.href = '/login';
      }
    }

    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject({ message, ...error.response?.data });
  }
);

// AUTH API METHODS

/**
 * Login user
 * @param {Object} credentials - Email and password
 * @returns {Promise<Object>} Login response data
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration response data
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    const refreshToken = getRefreshToken();
    await api.post('/api/auth/logout', { refreshToken });
    clearTokens();
  } catch (error) {
    // Clear tokens anyway
    clearTokens();
    throw error;
  }
};

/**
 * Get current user profile
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/auth/me');
    return response.data.user;
  } catch (error) {
    throw error;
  }
};

/**
 * Change password
 * @param {Object} passwords - Current and new password
 * @returns {Promise<Object>} Response data
 */
export const changePassword = async (passwords) => {
  try {
    const refreshToken = getRefreshToken();
    const response = await api.post('/api/auth/change-password', {
      ...passwords,
      refreshToken
    });
    clearTokens();
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;

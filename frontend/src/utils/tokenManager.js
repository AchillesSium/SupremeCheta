// frontend/src/utils/tokenManager.js
import { STORAGE_KEYS, TOKEN_CONFIG } from '../config/constants';

const { ACCESS_TOKEN, REFRESH_TOKEN, USER, FINGERPRINT } = STORAGE_KEYS;
const { PROACTIVE_REFRESH_SECONDS } = TOKEN_CONFIG;

const getOrCreateFingerprint = () => {
  let fingerprint = localStorage.getItem(FINGERPRINT);

  if (!fingerprint) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);

    const canvasData = canvas.toDataURL();
    const navigatorData = JSON.stringify({
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    fingerprint = btoa(canvasData + navigatorData).substring(0, 64);
    localStorage.setItem(FINGERPRINT, fingerprint);
  }

  return fingerprint;
};

/**
 * Store authentication tokens
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token
 */
export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem(ACCESS_TOKEN, accessToken);
  localStorage.setItem(REFRESH_TOKEN, refreshToken);
};

/**
 * Get access token
 * @returns {string|null} Access token or null
 */
export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN);
};

/**
 * Get refresh token
 * @returns {string|null} Refresh token or null
 */
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN);
};

/**
 * Clear all tokens and user data
 */
export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);
  localStorage.removeItem(USER);
};

/**
 * Store user data
 * @param {Object} user - User object
 */
export const setUser = (user) => {
  localStorage.setItem(USER, JSON.stringify(user));
};

/**
 * Get user data
 * @returns {Object|null} User object or null
 */
export const getUser = () => {
  const userData = localStorage.getItem(USER);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Check if token is expired (client-side check)
 * Returns true if expired or invalid
 * @param {string} token - JWT token
 * @returns {boolean} True if expired, false otherwise
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    // Decode JWT payload (base64)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const { exp } = JSON.parse(jsonPayload);

    if (!exp) return true;

    // Check if token expires soon (proactive refresh)
    return Date.now() >= (exp * 1000) - (PROACTIVE_REFRESH_SECONDS * 1000);
  } catch (error) {
    return true;
  }
};

/**
 * Get user role from stored user data
 * @returns {string} User role (admin, vendor, user, guest)
 */
export const getUserRole = () => {
  const user = getUser();
  return user?.role || 'guest';
};

/**
 * Check if user has required role
 * @param {string|string[]} requiredRoles - Required role(s)
 * @returns {boolean} True if user has required role
 */
export const hasRole = (requiredRoles) => {
  const userRole = getUserRole();
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(userRole);
  }
  return userRole === requiredRoles;
};

export { getOrCreateFingerprint };

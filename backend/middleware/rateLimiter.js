// backend/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const constants = require('../src/config/constants');

const { RATE_LIMIT } = constants;

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT.API.WINDOW_MS,
  max: RATE_LIMIT.API.MAX_REQUESTS,
  message: {
    success: false,
    message: `Too many requests from this IP, please try again after ${RATE_LIMIT.API.WINDOW_MS / 60000} minutes.`
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.AUTH.WINDOW_MS,
  max: RATE_LIMIT.AUTH.MAX_REQUESTS,
  message: {
    success: false,
    message: `Too many authentication attempts from this IP, please try again after ${RATE_LIMIT.AUTH.WINDOW_MS / 60000} minutes.`
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Moderate rate limiter for token refresh
 */
const refreshLimiter = rateLimit({
  windowMs: RATE_LIMIT.REFRESH.WINDOW_MS,
  max: RATE_LIMIT.REFRESH.MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many token refresh requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  refreshLimiter
};

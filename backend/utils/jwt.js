// backend/utils/jwt.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const constants = require('../src/config/constants');

const { JWT, TOKEN_REFRESH } = constants;
const JWT_ACCESS_SECRET = JWT.ACCESS_SECRET;
const JWT_REFRESH_SECRET = JWT.REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRY = JWT.ACCESS_TOKEN_EXPIRY;
const REFRESH_TOKEN_EXPIRY = JWT.REFRESH_TOKEN_EXPIRY;
const PROACTIVE_REFRESH_SECONDS = TOKEN_REFRESH.PROACTIVE_REFRESH_SECONDS;

const createFingerprint = () => {
  return crypto.randomBytes(32).toString('hex');
};

const hashFingerprint = (fingerprint) => {
  return crypto.createHash('sha256').update(fingerprint).digest('hex');
};

/**
 * Generate access token (short-lived)
 * @param {Object} user - User object from database
 * @param {String} fingerprint - Optional device fingerprint
 * @returns {String} JWT access token
 */
const generateAccessToken = (user, fingerprint = null) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    type: 'access'
  };

  if (fingerprint) {
    payload.fingerprint = hashFingerprint(fingerprint);
  }

  return jwt.sign(
    payload,
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

/**
 * Generate refresh token (long-lived)
 * @param {Object} user - User object from database
 * @param {String} tokenFamily - Token family for rotation tracking (optional, will generate if not provided)
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (user, tokenFamily = null) => {
  // Use provided tokenFamily or generate a new one
  if (!tokenFamily) {
    tokenFamily = crypto.randomBytes(16).toString('hex');
  }

  return jwt.sign(
    {
      id: user._id,
      type: 'refresh',
      tokenFamily
    },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

/**
 * Verify access token
 * @param {String} token - JWT access token
 * @param {String} fingerprint - Optional fingerprint to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyAccessToken = (token, fingerprint = null) => {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    if (fingerprint && decoded.fingerprint) {
      const hashedFingerprint = hashFingerprint(fingerprint);
      if (decoded.fingerprint !== hashedFingerprint) {
        throw new Error('Fingerprint mismatch');
      }
    }

    return decoded;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify refresh token
 * @param {String} token - JWT refresh token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};

/**
 * Get token expiry time
 * @param {String} token - JWT token
 * @returns {Date|null} Expiry date or null if invalid
 */
const getTokenExpiry = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded?.exp ? new Date(decoded.exp * 1000) : null;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getTokenExpiry,
  createFingerprint,
  hashFingerprint,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  PROACTIVE_REFRESH_SECONDS
};

// backend/controllers/authController.js
const User = require('../models/user');
const TokenBlacklist = require('../models/tokenBlacklist');
const UserSession = require('../models/user_session');
const { logAudit } = require('../utils/auditLogger');
const constants = require('../src/config/constants');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getTokenExpiry,
  createFingerprint,
  hashFingerprint
} = require('../utils/jwt');

const { SECURITY, ERROR_CODES, MESSAGES } = constants;

const authController = {
  /**
   * Register new user
   * POST /api/auth/register
   */
  register: async (req, res) => {
    try {
      const { username, email, password, first_name, last_name, address, phone_number } = req.body;

      // Check for existing user
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
        });
      }

      // Create user
      const user = await User.create({
        first_name,
        last_name,
        username,
        email,
        password, // Will be hashed by pre-save hook
        address,
        phone_number
      });

      // SECURITY FIX: Don't auto-login on registration
      // User must login with credentials for better security

      // Send response WITHOUT password or tokens
      res.status(201).json({
        success: true,
        message: 'Registration successful. Please login.',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          // NO PASSWORD - SECURITY FIX!
          // NO TOKEN - User must login
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  },

  /**
   * Login user
   * POST /api/auth/login
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user and include password
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if account is locked
      if (user.account_locked_until && user.account_locked_until > new Date()) {
        const minutesLeft = Math.ceil((user.account_locked_until - new Date()) / 1000 / 60);
        return res.status(423).json({
          success: false,
          message: `Account locked due to multiple failed login attempts. Try again in ${minutesLeft} minutes.`,
          code: 'ACCOUNT_LOCKED'
        });
      }

      // Check password
      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        // Track failed attempt
        await user.trackLoginAttempt();

        await logAudit('failed_login', req, user._id, {
          reason: 'invalid_credentials'
        }, 'warning');

        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Update last login
      user.last_login = new Date();
      await user.save();

      // Generate new token family for this login FIRST
      const tokenFamily = await user.generateTokenFamily();

      // Generate tokens with fingerprint
      const fingerprint = createFingerprint();
      const accessToken = generateAccessToken(user, fingerprint);
      const refreshToken = generateRefreshToken(user, tokenFamily);

      // Track active session
      const maxSessions = SECURITY.MAX_CONCURRENT_SESSIONS;
      await UserSession.create({
        userId: user._id,
        refreshToken,
        fingerprint: hashFingerprint(fingerprint),
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        expiresAt: getTokenExpiry(refreshToken) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      // Limit concurrent sessions
      await UserSession.limitSessions(user._id, maxSessions);

      // Audit log
      await logAudit('login', req, user._id, {
        method: 'email',
        sessions: maxSessions
      }, 'info');

      // Send response
      res.json({
        success: true,
        message: 'Login successful',
        accessToken,
        refreshToken,
        fingerprint,
        user: {
          id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          email: user.email,
          role: user.role,
          address: user.address,
          phone_number: user.phone_number
          // NO PASSWORD!
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  },

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  refresh: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Check if token is blacklisted
      const isBlacklisted = await TokenBlacklist.findOne({ token: refreshToken });
      if (isBlacklisted) {
        return res.status(401).json({
          success: false,
          message: 'Token has been revoked. Please login again.',
          code: 'TOKEN_REVOKED'
        });
      }

      // Get user
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Validate token family matches
      if (!user.isValidTokenFamily(decoded.tokenFamily)) {
        // Token family invalid - possible theft, invalidate all tokens
        await user.invalidateTokenFamily();
        
        await logAudit('session_invalidated', req, user._id, {
          reason: 'token_family_mismatch_possible_theft'
        }, 'critical');

        return res.status(401).json({
          success: false,
          message: 'Session invalidated. Please login again.',
          code: 'TOKEN_FAMILY_INVALID'
        });
      }

      // Generate new token family FIRST
      const newTokenFamily = await user.generateTokenFamily();

      // Generate new tokens
      const fingerprint = createFingerprint();
      const newAccessToken = generateAccessToken(user, fingerprint);
      const newRefreshToken = generateRefreshToken(user, newTokenFamily);

      // Rotate: blacklist old refresh token
      await TokenBlacklist.create({
        token: refreshToken,
        userId: user._id,
        expiresAt: getTokenExpiry(refreshToken) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        reason: 'refresh'
      });

      // Update session with new tokens
      const maxSessions = SECURITY.MAX_CONCURRENT_SESSIONS;
      await UserSession.deleteOne({ refreshToken });
      await UserSession.create({
        userId: user._id,
        refreshToken: newRefreshToken,
        fingerprint: hashFingerprint(fingerprint),
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        expiresAt: getTokenExpiry(newRefreshToken) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      await UserSession.limitSessions(user._id, maxSessions);

      await logAudit('token_refresh', req, user._id, {}, 'info');

      res.json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        fingerprint
      });
    } catch (error) {
      console.error('Refresh error:', error.message);
      console.error('Error name:', error.name);
      console.error('Full error:', error);

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Refresh token expired. Please login again.',
          code: 'REFRESH_TOKEN_EXPIRED'
        });
      }

      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN',
        error: error.message
      });
    }
  },

  /**
   * Logout user
   * POST /api/auth/logout
   */
  logout: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const userId = req.user.id; // From auth middleware

      if (refreshToken) {
        // Blacklist the refresh token
        const expiry = getTokenExpiry(refreshToken);

        await TokenBlacklist.create({
          token: refreshToken,
          userId,
          expiresAt: expiry || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          reason: 'logout'
        });

        // Remove active session
        await UserSession.deleteOne({ refreshToken });
      }

      await logAudit('logout', req, userId, {}, 'info');

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error.message
      });
    }
  },

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  me: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user'
      });
    }
  },

  /**
   * Change password
   * POST /api/auth/change-password
   */
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters'
        });
      }

      // Get user with password
      const user = await User.findById(req.user.id).select('+password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Invalidate all token families (logout all devices)
      await user.invalidateTokenFamily();

      // Audit log
      await logAudit('password_change', req, user._id, {
        invalidated_all_sessions: true
      }, 'info');

      // Blacklist current refresh token
      const { refreshToken } = req.body;
      if (refreshToken) {
        await TokenBlacklist.create({
          token: refreshToken,
          userId: user._id,
          expiresAt: getTokenExpiry(refreshToken) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          reason: 'password_change'
        });
      }

      res.json({
        success: true,
        message: 'Password changed successfully. Please login again.'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }
};

module.exports = authController;

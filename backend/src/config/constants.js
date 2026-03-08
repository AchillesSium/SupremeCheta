module.exports = {
  // =======================
  // JWT Configuration
  // =======================
  JWT: {
    // IMPORTANT: These MUST be set in .env file
    // No weak fallbacks for security-critical secrets
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || (() => {
      console.error('❌ JWT_ACCESS_SECRET is required in .env file');
      console.error('💡 Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
      process.exit(1);
    })(),
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || (() => {
      console.error('❌ JWT_REFRESH_SECRET is required in .env file');
      console.error('💡 Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
      process.exit(1);
    })(),
    ACCESS_TOKEN_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
    REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // =======================
  // Security Configuration
  // =======================
  SECURITY: {
    MAX_CONCURRENT_SESSIONS: parseInt(process.env.MAX_CONCURRENT_SESSIONS) || 3,
    ENABLE_FINGERPRINTING: process.env.ENABLE_FINGERPRINTING !== 'false',
    TOKEN_FAMILY_EXPIRY_DAYS: parseInt(process.env.TOKEN_FAMILY_EXPIRY_DAYS) || 30,
    PASSWORD_RESET_EXPIRY_MINUTES: parseInt(process.env.PASSWORD_RESET_EXPIRY_MINUTES) || 30,
    EMAIL_VERIFICATION_EXPIRY_HOURS: parseInt(process.env.EMAIL_VERIFICATION_EXPIRY_HOURS) || 24,
  },

  // =======================
  // Rate Limiting Configuration
  // =======================
  RATE_LIMIT: {
    API: {
      WINDOW_MS: parseInt(process.env.RATE_LIMIT_API_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_API_MAX) || 100,
    },
    AUTH: {
      WINDOW_MS: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_AUTH_MAX) || 5,
    },
    REFRESH: {
      WINDOW_MS: parseInt(process.env.RATE_LIMIT_REFRESH_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_REFRESH_MAX) || 20,
    },
  },

  // =======================
  // Account Security
  // =======================
  ACCOUNT: {
    MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    LOCKOUT_DURATION_MINUTES: parseInt(process.env.ACCOUNT_LOCKOUT_MINUTES) || 30,
    MIN_PASSWORD_LENGTH: parseInt(process.env.MIN_PASSWORD_LENGTH) || 8,
    MAX_PASSWORD_LENGTH: parseInt(process.env.MAX_PASSWORD_LENGTH) || 128,
  },

  // =======================
  // Validation Configuration
  // =======================
  VALIDATION: {
    USERNAME: {
      MIN_LENGTH: parseInt(process.env.USERNAME_MIN_LENGTH) || 3,
      MAX_LENGTH: parseInt(process.env.USERNAME_MAX_LENGTH) || 30,
      PATTERN: /^[a-zA-Z0-9_-]+$/,
    },
    NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 50,
      PATTERN: /^[a-zA-Z\s]+$/,
    },
    PASSWORD: {
      MIN_LENGTH: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
      MAX_LENGTH: parseInt(process.env.PASSWORD_MAX_LENGTH) || 128,
    },
    PHONE: {
      PATTERN: /^\+?[\d\s-]*$/,
    },
  },

  // =======================
  // Upload Configuration
  // =======================
  UPLOAD: {
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },

  // =======================
  // Pagination Defaults
  // =======================
  PAGINATION: {
    DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
    MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE) || 100,
  },

  // =======================
  // Token Refresh Configuration
  // =======================
  TOKEN_REFRESH: {
    PROACTIVE_REFRESH_SECONDS: parseInt(process.env.TOKEN_PROACTIVE_REFRESH_SECONDS) || 60, // Refresh 60s before expiry
  },

  // =======================
  // Error Codes
  // =======================
  ERROR_CODES: {
    NO_TOKEN: 'NO_TOKEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    INVALID_TOKEN: 'INVALID_TOKEN',
    FINGERPRINT_MISMATCH: 'FINGERPRINT_MISMATCH',
    TOKEN_FAMILY_INVALID: 'TOKEN_FAMILY_INVALID',
    TOKEN_REVOKED: 'TOKEN_REVOKED',
    REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
    INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
    ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
    TOKEN_FAMILY_COMPROMISED: 'TOKEN_FAMILY_COMPROMISED',
  },

  // =======================
  // Audit Actions
  // =======================
  AUDIT_ACTIONS: {
    LOGIN: 'login',
    LOGOUT: 'logout',
    REGISTER: 'register',
    TOKEN_REFRESH: 'token_refresh',
    FAILED_LOGIN: 'failed_login',
    PASSWORD_CHANGE: 'password_change',
    ACCOUNT_LOCKED: 'account_locked',
    SUSPICIOUS_ACTIVITY: 'suspicious_activity',
    SESSION_INVALIDATED: 'session_invalidated',
  },

  // =======================
  // User Roles
  // =======================
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    VENDOR: 'vendor',
    GUEST: 'guest',
  },

  // =======================
  // API Response Messages
  // =======================
  MESSAGES: {
    AUTH: {
      NO_TOKEN: 'No authentication token, access denied',
      TOKEN_EXPIRED: 'Token expired',
      INVALID_TOKEN: 'Invalid token',
      FINGERPRINT_MISMATCH: 'Token fingerprint mismatch',
      LOGIN_SUCCESS: 'Login successful',
      LOGOUT_SUCCESS: 'Logged out successfully',
      REGISTER_SUCCESS: 'Registration successful. Please login.',
      PASSWORD_CHANGED: 'Password changed successfully. Please login again.',
      SESSION_INVALIDATED: 'Session invalidated. Please login again.',
    },
  },
};

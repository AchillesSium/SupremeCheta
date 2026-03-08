// backend/src/config/validateEnv.js
/**
 * Validate environment variables on application startup
 * Fail fast if critical secrets are missing or weak
 */

const validateEnv = () => {
  const errors = [];
  const warnings = [];

  // ===================================
  // Critical: Required Secrets
  // ===================================

  if (!process.env.JWT_ACCESS_SECRET) {
    errors.push('JWT_ACCESS_SECRET is required in .env file');
  } else if (process.env.JWT_ACCESS_SECRET.length < 32) {
    warnings.push('JWT_ACCESS_SECRET should be at least 32 characters (current: ' + process.env.JWT_ACCESS_SECRET.length + ')');
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    errors.push('JWT_REFRESH_SECRET is required in .env file');
  } else if (process.env.JWT_REFRESH_SECRET.length < 32) {
    warnings.push('JWT_REFRESH_SECRET should be at least 32 characters (current: ' + process.env.JWT_REFRESH_SECRET.length + ')');
  }

  // Check that access and refresh secrets are different
  if (process.env.JWT_ACCESS_SECRET && process.env.JWT_REFRESH_SECRET) {
    if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
      errors.push('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
    }
  }

  if (!process.env.MONGODB_URI) {
    errors.push('MONGODB_URI is required in .env file');
  }

  // ===================================
  // Important: Configuration Values
  // ===================================

  if (!process.env.PORT) {
    warnings.push('PORT not set, using default');
  }

  if (!process.env.CORS_ORIGIN) {
    warnings.push('CORS_ORIGIN not set, using default');
  }

  if (!process.env.NODE_ENV) {
    warnings.push('NODE_ENV not set, defaulting to development');
  }

  // ===================================
  // Production-specific checks
  // ===================================

  if (process.env.NODE_ENV === 'production') {
    // In production, secrets should be very strong
    if (process.env.JWT_ACCESS_SECRET && process.env.JWT_ACCESS_SECRET.length < 64) {
      errors.push('In production, JWT_ACCESS_SECRET must be at least 64 characters');
    }

    if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 64) {
      errors.push('In production, JWT_REFRESH_SECRET must be at least 64 characters');
    }

    // Check for example/default values
    const dangerousDefaults = ['secret', '12345', 'changeme', 'password', 'example'];
    if (dangerousDefaults.some(bad => process.env.JWT_ACCESS_SECRET?.toLowerCase().includes(bad))) {
      errors.push('JWT_ACCESS_SECRET contains common/weak value. Use a strong random string.');
    }
  }

  // ===================================
  // Report Results
  // ===================================

  if (errors.length > 0) {
    console.error('\n❌ ENVIRONMENT VALIDATION FAILED:\n');
    errors.forEach(err => console.error('  ❌', err));
    console.error('\n💡 Generate secure secrets with:');
    console.error('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    console.error('\n');
    process.exit(1); // Stop application
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  ENVIRONMENT WARNINGS:\n');
    warnings.forEach(warn => console.warn('  ⚠️ ', warn));
    console.warn('\n');
  }

  console.log('✅ Environment validation passed\n');
};

module.exports = validateEnv;

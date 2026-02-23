// backend/middleware/auth.js
const { verifyAccessToken } = require('../utils/jwt');

const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const fingerprint = req.header('X-Fingerprint');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token, access denied',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    const decoded = verifyAccessToken(token, fingerprint);

    req.user = decoded;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (err.name === 'JsonWebTokenError' || err.message === 'Fingerprint mismatch') {
      return res.status(401).json({
        success: false,
        message: err.message === 'Fingerprint mismatch' ? 'Token fingerprint mismatch' : 'Invalid token',
        code: err.message === 'Fingerprint mismatch' ? 'FINGERPRINT_MISMATCH' : 'INVALID_TOKEN'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Token verification failed',
      code: 'AUTH_FAILED'
    });
  }
};

module.exports = auth;
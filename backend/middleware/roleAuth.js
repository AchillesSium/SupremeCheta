// backend/middleware/roleAuth.js

/**
 * Middleware factory to require specific roles
 * @param {...String} allowedRoles - List of allowed roles
 * @returns {Function} Express middleware
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        requiredRole: allowedRoles,
        currentRole: req.user.role
      });
    }

    // User has required role, proceed
    next();
  };
};

/**
 * Middleware to require admin role
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware to require vendor or admin role
 */
const requireVendor = requireRole('vendor', 'admin');

/**
 * Middleware to require authenticated user (any role except guest)
 */
const requireUser = requireRole('user', 'vendor', 'admin');

module.exports = {
  requireRole,
  requireAdmin,
  requireVendor,
  requireUser
};

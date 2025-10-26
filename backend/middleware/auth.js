// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Basic auth: verifies JWT and attaches payload to req.user
 * Expects JWT payload to include at least: { _id, role, email? }
 */
const auth = (req, res, next) => {
  try {
    const header = req.header('Authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    // Normalize common fields to avoid undefined
    req.user = {
      _id: verified._id || verified.id || verified.sub,
      role: verified.role || 'customer',
      email: verified.email,
      ...verified, // keep any extra claims
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token verification failed, authorization denied' });
  }
};

/**
 * Role guard: only allow users whose role is in allowedRoles
 * Usage: restrictTo('admin', 'vendor')
 */
const restrictTo = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userRole = req.user.role;
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
};

/**
 * Optional: ensure the current user is the vendor who owns the resource
 * Pass a function that returns the vendor id from the loaded resource.
 * Example:
 *   router.put('/:id', auth, restrictTo('admin','vendor'), ensureOwner(req => req.product.vendor))
 */
const ensureOwner = (getOwnerId) => (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const ownerId = getOwnerId(req);
    if (!ownerId) return res.status(404).json({ message: 'Resource not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = String(ownerId) === String(req.user._id);
    if (!isAdmin && !isOwner) return res.status(403).json({ message: 'Forbidden' });

    return next();
  } catch (e) {
    return res.status(400).json({ message: 'Ownership check failed' });
  }
};

module.exports = { auth, restrictTo, ensureOwner };
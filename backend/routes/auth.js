// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter, refreshLimiter } = require('../middleware/rateLimiter');
const { registerValidation, loginValidation, changePasswordValidation, refreshValidation } = require('../utils/validators');

// Public routes (with rate limiting and validation)
// Temporarily remove rate limiter from register for testing
router.post('/register', authLimiter, registerValidation, authController.register);
router.post('/login', authLimiter, loginValidation, authController.login);
router.post('/refresh', refreshLimiter, refreshValidation, authController.refresh);

// Protected routes (require authentication)
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.me);
router.post('/change-password', auth, changePasswordValidation, authController.changePassword);

module.exports = router;
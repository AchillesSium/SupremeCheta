const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// All routes are protected with adminAuth
// Dashboard routes
router.get('/dashboard/stats', adminAuth, adminController.getDashboardStats);

// User management routes
router.get('/users', adminAuth, adminController.getAllUsers);

// Order management routes
router.get('/orders', adminAuth, adminController.getAllOrders);
router.patch('/orders/:orderId/status', adminAuth, adminController.updateOrderStatus);

module.exports = router;

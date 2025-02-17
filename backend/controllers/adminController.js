const User = require('../models/user');
const Order = require('../models/order');

const adminController = {
    // Get dashboard statistics
    getDashboardStats: async (req, res) => {
        try {
            const totalUsers = await User.countDocuments();
            const totalOrders = await Order.countDocuments();
            
            res.json({
                success: true,
                stats: {
                    totalUsers,
                    totalOrders
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching dashboard stats',
                error: error.message 
            });
        }
    },

    // Get all users
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find().select('-password');
            res.json({
                success: true,
                users
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching users',
                error: error.message 
            });
        }
    },

    // Get all orders
    getAllOrders: async (req, res) => {
        try {
            const orders = await Order.find()
                .populate('user_id', 'username email')
                .sort({ createdAt: -1 });
            res.json({
                success: true,
                orders
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching orders',
                error: error.message 
            });
        }
    },

    // Update order status
    updateOrderStatus: async (req, res) => {
        try {
            const { orderId } = req.params;
            const { status } = req.body;

            const order = await Order.findByIdAndUpdate(
                orderId,
                { status },
                { new: true }
            );

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            res.json({
                success: true,
                order
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Error updating order status',
                error: error.message 
            });
        }
    }
};

module.exports = adminController;
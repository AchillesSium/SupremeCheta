const jwt = require('jsonwebtoken');
const User = require('../models/user');

const adminAuth = (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user
        User.findById(decoded.id)
            .then(user => {
                if (!user || user.role !== 'admin') {
                    return res.status(403).json({ message: 'Not authorized to access this resource' });
                }
                req.user = user;
                next();
            })
            .catch(err => {
                res.status(401).json({ message: 'User not found' });
            });
    } catch (error) {
        res.status(401).json({ message: 'Token is invalid or expired' });
    }
};

module.exports = adminAuth;

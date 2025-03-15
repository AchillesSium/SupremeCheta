const User = require('../models/user');
const jwt = require('jsonwebtoken');

const authController = {
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

            // Generate token
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '1d' }
            );

            await user.save();

            // Send response
            res.status(201).json({
                success: true,
                token,
                user: {
                    username: user.username,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    password: user.password,
                    address: user.address,
                    phone_number: user.phone_number
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

            // Check password
            const isMatch = await user.matchPassword(password);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Generate token
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '1d' }
            );

            // Send response
            res.json({
                success: true,
                token,
                user: {
                    id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    username: user.username,
                    email: user.email,
                    address: user.address,
                    phone_number: user.phone_number
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
    }
};

module.exports = authController;

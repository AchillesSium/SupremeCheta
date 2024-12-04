const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        first_name: {
            type: String,
            required: true,
            trim: true,
        },
        last_name: {
            type: String,
            required: true,
            trim: true,
        },
        phone_number: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            default: '',
        },
        role: {
            type: String,
            enum: ['admin', 'user', 'guest'], // Example roles
            default: 'user',
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'banned'], // Example statuses
            default: 'active',
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

const User = mongoose.model('User', userSchema);
module.exports = User;

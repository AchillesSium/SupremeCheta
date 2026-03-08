const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const constants = require('../src/config/constants');
const { SECURITY, ACCOUNT } = constants;

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters long'],
            maxlength: [30, 'Username cannot exceed 30 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters long'],
            select: false // Don't include password in queries by default
        },
        first_name: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            default: ''
        },
        last_name: {
            type: String,
            trim: true,
            default: ''
        },
        phone_number: {
            type: String,
            trim: true,
            default: ''
        },
        profile_image: {
            type: String,
            default: 'default-avatar.png'
        },
        address: [{
            type: String,
            ref: 'Address'
        }],
        role: {
            type: String,
            enum: ['admin', 'user', 'guest'],
            default: 'user',
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'banned'],
            default: 'active',
        },
        // Authentication and verification
        email_verified: {
            type: Boolean,
            default: false
        },
        email_verification_token: String,
        email_verification_expires: Date,
        password_reset_token: String,
        password_reset_expires: Date,
        last_login: Date,
        refresh_token: String,
        login_attempts: {
            type: Number,
            default: 0
        },
        account_locked_until: Date,
        
        // Token family for rotation tracking (invalidated on password change/security events)
        token_family: {
            type: String,
            default: null
        },
        token_family_expires: Date,
        
        // User preferences
        preferences: {
            newsletter: { 
                type: Boolean, 
                default: true 
            },
            language: { 
                type: String, 
                default: 'en',
                enum: ['en', 'es', 'fr', 'de'] // Add more languages as needed
            },
            currency: { 
                type: String, 
                default: 'USD',
                enum: ['USD', 'EUR', 'GBP'] // Add more currencies as needed
            },
            notifications: {
                email: { type: Boolean, default: true },
                push: { type: Boolean, default: true },
                sms: { type: Boolean, default: false }
            }
        },
        
        // Social media links
        social_links: {
            facebook: String,
            twitter: String,
            instagram: String,
            linkedin: String
        },
        
        // Device tracking
        devices: [{
            device_id: String,
            device_type: String,
            last_used: Date,
            is_active: Boolean
        }]
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual for full name
userSchema.virtual('full_name').get(function() {
    return `${this.first_name} ${this.last_name}`;
});

// Email validation
userSchema.path('email').validate(function(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}, 'Invalid email format');

// Phone number validation (optional field, only validate if provided)
userSchema.path('phone_number').validate(function(phone) {
    if (!phone || phone.trim() === '') return true; // Allow empty
    return /^\+?[\d\s-]+$/.test(phone);
}, 'Invalid phone number format');

// Hash password before saving
userSchema.pre('save', async function(next) {
    try {
        if (!this.isModified('password')) {
            return next();
        }
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
    try {
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { 
            id: this._id,
            role: this.role,
            email: this.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function() {
    this.refresh_token = crypto.randomBytes(40).toString('hex');
    return this.refresh_token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.password_reset_token = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.password_reset_expires = Date.now() + SECURITY.PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000;
    return resetToken;
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    this.email_verification_token = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    this.email_verification_expires = Date.now() + SECURITY.EMAIL_VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000;
    return verificationToken;
};

// Track login attempt
userSchema.methods.trackLoginAttempt = async function() {
    this.login_attempts += 1;
    if (this.login_attempts >= ACCOUNT.MAX_LOGIN_ATTEMPTS) {
        this.account_locked_until = new Date(Date.now() + ACCOUNT.LOCKOUT_DURATION_MINUTES * 60 * 1000);
    }
    await this.save();
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
    this.login_attempts = 0;
    this.account_locked_until = undefined;
    await this.save();
};

// Generate new token family (for token rotation)
userSchema.methods.generateTokenFamily = async function() {
    this.token_family = crypto.randomBytes(16).toString('hex');
    this.token_family_expires = new Date(Date.now() + SECURITY.TOKEN_FAMILY_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    await this.save();
    return this.token_family;
};

// Invalidate token family (logout all devices / password change)
userSchema.methods.invalidateTokenFamily = async function() {
    this.token_family = null;
    this.token_family_expires = null;
    await this.save();
};

// Verify token family matches
userSchema.methods.isValidTokenFamily = function(family) {
    return this.token_family === family && 
           this.token_family_expires && 
           this.token_family_expires > new Date();
};

// Static methods
userSchema.statics = {
    // Find by email
    findByEmail: function(email) {
        return this.findOne({ email: email.toLowerCase() });
    },

    // Find active users
    findActive: function() {
        return this.find({ status: 'active' });
    },

    // Find by role
    findByRole: function(role) {
        return this.find({ role });
    }
};

const User = mongoose.model('User', userSchema);
module.exports = User;

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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
            type: mongoose.Schema.Types.ObjectId,
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

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ status: 1 });

// Email validation
userSchema.path('email').validate(function(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}, 'Invalid email format');

// Phone number validation
userSchema.path('phone_number').validate(function(phone) {
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
    this.password_reset_expires = Date.now() + 30 * 60 * 1000; // 30 minutes
    return resetToken;
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    this.email_verification_token = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    this.email_verification_expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return verificationToken;
};

// Track login attempt
userSchema.methods.trackLoginAttempt = async function() {
    this.login_attempts += 1;
    if (this.login_attempts >= 5) {
        this.account_locked_until = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
    }
    await this.save();
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
    this.login_attempts = 0;
    this.account_locked_until = undefined;
    await this.save();
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

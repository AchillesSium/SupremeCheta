// backend/models/tokenBlacklist.js
const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true  // For TTL index
  },
  reason: {
    type: String,
    enum: ['logout', 
           'security', 
           'expired', 
           'refresh'],
    default: 'logout'
  }
}, {
  timestamps: true
});

// Auto-delete expired tokens using TTL index
// MongoDB will automatically remove documents when expiresAt is reached
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

module.exports = TokenBlacklist;

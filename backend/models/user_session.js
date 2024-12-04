const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the User collection
      ref: 'User', // Assumes there is a User model
      required: true,
    },
    ip_address: {
      type: String,
      required: true,
    },
    user_agent: {
      type: String, // Browser or device information
      required: true,
    },
    expires_at: {
      type: Date,
      required: true, // Expiration time for the session
    },
    is_active: {
      type: Boolean,
      default: true, // Indicates whether the session is active
    },
  },
  {
    timestamps: true, 
  }
);

const UserSession = mongoose.model('UserSession', userSessionSchema);

module.exports = UserSession;

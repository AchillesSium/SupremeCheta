const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
    fingerprint: {
      type: String,
      required: false,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Static method to limit concurrent sessions per user
userSessionSchema.statics.limitSessions = async function(userId, maxSessions = 3) {
  const sessions = await this.find({ userId: userId, isActive: true })
    .sort({ createdAt: -1 });

  if (sessions.length > maxSessions) {
    const sessionsToDelete = sessions.slice(maxSessions);
    const sessionIds = sessionsToDelete.map(s => s._id);
    await this.updateMany(
      { _id: { $in: sessionIds } },
      { isActive: false }
    );
  }
};

const UserSession = mongoose.model('UserSession', userSessionSchema);

module.exports = UserSession;

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the User collection
      ref: 'User', // Assumes there is a User model
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['create', 'update', 'delete', 'read'], // Example actions
    },
    table_name: {
      type: String,
      required: true,
    },
    record_id: {
      type: String, // ID of the affected record
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;

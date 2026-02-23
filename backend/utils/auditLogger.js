const AuditLog = require('../models/audit_log');

const logAudit = async (action, req, userId = null, metadata = {}, severity = 'info') => {
  try {
    await AuditLog.create({
      userId: userId || req.user?.id,
      action,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      fingerprint: req.headers['x-fingerprint'],
      metadata,
      severity
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

module.exports = { logAudit };

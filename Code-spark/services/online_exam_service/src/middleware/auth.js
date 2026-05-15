const { verifyToken, checkPermission } = require('common-node-library');
const config = require('../config');

/**
 * Middleware to authenticate JWT token from identity-service
 * Token must be sent in header: Authorization: Bearer <token>
 */
const authenticateToken = verifyToken(config.security.jwt.secret);

module.exports = {
  authenticateToken,
  checkPermission,
};

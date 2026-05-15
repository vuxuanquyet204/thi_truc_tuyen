const { verifyToken, checkPermission } = require('common-node-library');
const config = require('../config');

/**
 * Middleware to authenticate JWT token from identity-service
 * Token must be sent in header: Authorization: Bearer <token>
 *
 * NOTE: verifyToken is a HOF that takes (secretKey) and returns middleware.
 * Must be called with config.security.jwt.secret, NOT assigned directly.
 */
const authenticateToken = verifyToken(config.security.jwt.secret);

module.exports = {
	authenticateToken,
	checkPermission,
};

// file: src/middleware/auth.middleware.js
const { verifyToken, optionalVerifyToken } = require('common-node-library');
const config = require('../config');

/**
 * Middleware to authenticate JWT token from identity-service
 * Token must be sent in header: Authorization: Bearer <token>
 */
const authenticateToken = verifyToken(config.security.jwt.secret);

/**
 * Optional middleware - token not required
 * If token is present, verify it; otherwise continue
 */
const optionalAuth = optionalVerifyToken(config.security.jwt.secret);

module.exports = {
  authenticateToken,
  optionalAuth,
};

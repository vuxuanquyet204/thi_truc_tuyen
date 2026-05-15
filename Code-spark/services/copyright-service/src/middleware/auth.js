const { verifyToken, optionalVerifyToken, checkPermission } = require('common-node-library');
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

/**
 * Middleware to check permission
 * @param {string|string[]} requiredPermission - Permission or array of permissions required
 */
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated'
      });
    }

    const userRoles = req.roles || [];
    const requiredRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

    const hasRole = requiredRoles.some(role =>
      userRoles.includes(role)
    );

    if (!hasRole) {
      console.warn(`[AUTH] Role denied. Required: ${requiredRoles.join(' or ')}`);
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires ${requiredRoles.join(' or ')} role`
      });
    }

    next();
  };
};

module.exports = {
	authenticateToken,
	checkPermission,
	checkRole,
	optionalAuth,
};

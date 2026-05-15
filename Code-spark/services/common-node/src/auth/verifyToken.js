/**
 * JWT Token Verification Middleware
 * Verifies Bearer token from Authorization header and attaches decoded user to req.user.
 *
 * Supports both strict verification (for protected routes) and optional verification (for public routes).
 *
 * Usage:
 *   const { verifyToken } = require('common-node-library');
 *   router.get('/protected', verifyToken(process.env.JWT_SECRET), handler);
 *
 *   // Optional - continues even if no token (req.user may be undefined)
 *   router.get('/public', optionalVerifyToken(process.env.JWT_SECRET), handler);
 */
const jwt = require('jsonwebtoken');
const AppException = require('../exception/AppException');

/**
 * Strict token verification - rejects unauthenticated requests.
 * @param {string} secretKey - JWT secret
 * @param {object} options - { roles?: string[] }
 */
const verifyToken = (secretKey, options = {}) => {
	return (req, res, next) => {
		const authHeader = req.headers.authorization || req.headers['Authorization'];

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return next(new AppException('Truy cap bi tu choi: Khong tim thay Token hop le', 401));
		}

		const token = authHeader.split(' ')[1];

		try {
			const decoded = jwt.verify(token, secretKey);

			req.user = {
				userId: decoded.userId || decoded.id,
				username: decoded.sub || decoded.username,
				email: decoded.email,
				roles: decoded.roles || [],
				permissions: decoded.permissions || [],
			};

			// Optional: enforce role requirements
			if (options.roles && options.roles.length > 0) {
				const userRoles = req.user.roles || [];
				const hasRole = options.roles.some(role => userRoles.includes(role));
				if (!hasRole) {
					return next(new AppException(`Truy cap bi tu choi: Can quyen [${options.roles.join(' | ')}]`, 403));
				}
			}

			next();
		} catch (error) {
			if (error instanceof jwt.TokenExpiredError) {
				return next(new AppException('Token da het han', 401));
			}
			if (error instanceof jwt.JsonWebTokenError) {
				return next(new AppException('Token khong hop le', 401));
			}
			return next(new AppException('Xac thuc that bai', 403));
		}
	};
};

/**
 * Optional token verification - continues without error if no token present.
 * Use this for routes that behave differently for authenticated vs anonymous users.
 */
const optionalVerifyToken = (secretKey) => {
	return (req, res, next) => {
		const authHeader = req.headers.authorization || req.headers['Authorization'];

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return next();
		}

		const token = authHeader.split(' ')[1];

		try {
			const decoded = jwt.verify(token, secretKey);
			req.user = {
				userId: decoded.userId || decoded.id,
				username: decoded.sub || decoded.username,
				email: decoded.email,
				roles: decoded.roles || [],
				permissions: decoded.permissions || [],
			};
		} catch (_) {
			// Silently ignore invalid tokens for optional routes
		}

		next();
	};
};

module.exports = { verifyToken, optionalVerifyToken };

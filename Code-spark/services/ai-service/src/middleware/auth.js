/**
 * Auth middleware for AI Service
 * Combines common-node-library utilities with service-specific role checks.
 */
const { StatusCodes } = require('http-status-codes');
const { verifyToken, checkPermission: libCheckPermission } = require('common-node-library');
const config = require('../config');

/**
 * Middleware to authenticate JWT token.
 * Reuses verifyToken from common-node-library.
 */
const authenticateToken = (req, res, next) => {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		const error = new Error('Truy cap bi tu choi: Khong tim thay Token hop le');
		error.status = StatusCodes.UNAUTHORIZED;
		return next(error);
	}

	try {
		const jwt = require('jsonwebtoken');
		const decoded = jwt.verify(token, config.security.jwt.secret);

		req.user = {
			id: decoded.userId || decoded.sub,
			userId: decoded.userId || decoded.id,
			username: decoded.sub || decoded.username,
			email: decoded.email,
			roles: Array.isArray(decoded.roles) ? decoded.roles : [],
			permissions: Array.isArray(decoded.permissions) ? decoded.permissions : [],
		};

		next();
	} catch (error) {
		if (error.name === 'TokenExpiredError') {
			const err = new Error('Token da het han');
			err.status = StatusCodes.UNAUTHORIZED;
			return next(err);
		}
		const err = new Error('Token khong hop le');
		err.status = StatusCodes.UNAUTHORIZED;
		return next(err);
	}
};

/**
 * Middleware to check user roles.
 * @param {string[]} roles - Array of allowed roles
 */
const authorizeRoles = (...roles) => {
	return (req, res, next) => {
		if (!req.user) {
			const error = new Error('Xac thuc yeu cau');
			error.status = StatusCodes.UNAUTHORIZED;
			return next(error);
		}

		if (roles.length && !roles.some(role => req.user.roles.includes(role))) {
			const error = new Error(`Can quyen: ${roles.join(' hoac ')}`);
			error.status = StatusCodes.FORBIDDEN;
			return next(error);
		}

		next();
	};
};

/**
 * Middleware to check user permissions.
 * Enhanced version with support for 'any' or 'all' check types.
 * @param {string[]} permissions - Array of required permissions
 * @param {string} checkType - 'all' (default) requires all permissions, 'any' requires at least one
 */
const checkPermission = (permissions, checkType = 'all') => {
	return (req, res, next) => {
		if (!req.user) {
			const error = new Error('Xac thuc yeu cau');
			error.status = StatusCodes.UNAUTHORIZED;
			return next(error);
		}

		// Admin has all permissions
		if (req.user.roles && req.user.roles.includes('ADMIN')) {
			return next();
		}

		const userPermissions = req.user.permissions || [];
		const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

		let hasPermission;
		if (checkType === 'any') {
			hasPermission = requiredPermissions.some(permission =>
				userPermissions.includes(permission)
			);
		} else {
			hasPermission = requiredPermissions.every(permission =>
				userPermissions.includes(permission)
			);
		}

		if (!hasPermission) {
			const error = new Error(`Khong du quyen. Yeu cau: ${requiredPermissions.join(', ')}`);
			error.status = StatusCodes.FORBIDDEN;
			return next(error);
		}

		next();
	};
};

module.exports = {
	authenticateToken,
	authorizeRoles,
	checkPermission,
};

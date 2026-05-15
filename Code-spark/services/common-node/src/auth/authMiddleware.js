const jwt = require('jsonwebtoken');
const AppException = require('../exception/AppException');

// Middleware kiểm tra token - HOF nhận secretKey
const verifyToken = (secretKey) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppException("Truy cập bị từ chối: Không tìm thấy Token hợp lệ", 401));
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, secretKey);
      req.user = decoded;
      next();
    } catch (error) {
      next(new AppException("Truy cập bị từ chối: Token không hợp lệ hoặc đã hết hạn", 401));
    }
  };
};

// Middleware kiểm tra token (optional - không bắt buộc) - phải là HOF nhận secretKey
const optionalVerifyToken = (secretKey) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, secretKey);
      req.user = decoded;
    } catch (error) {
      // Silently ignore invalid tokens for optional routes
    }
    return next();
  };
};

// Middleware kiểm tra quyền
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppException("Unauthorized: User not authenticated", 401));
    }

    const userPermissions = req.user.permissions || [];
    const requiredPermissions = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission];

    const hasPermission = requiredPermissions.some(perm =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      return next(new AppException(`Forbidden: Missing permission: ${requiredPermissions.join(' or ')}`, 403));
    }

    next();
  };
};

module.exports = {
  verifyToken,
  optionalVerifyToken,
  checkPermission,
};

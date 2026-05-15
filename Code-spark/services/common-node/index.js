// common-node-library - Shared utilities for CodeSpark Node.js microservices

// Exception handling
const AppException = require('./src/exception/AppException');
const asyncHandler = require('./src/exception/asyncHandler');
const globalExceptionHandler = require('./src/exception/GlobalExceptionHandler');

// DTO
const ApiResponse = require('./src/dto/ApiResponse');

// Auth middleware
const { verifyToken, optionalVerifyToken, checkPermission } = require('./src/auth/authMiddleware');

// File service client
const FileServiceClient = require('./src/file/FileServiceClient');

// Notification producer
const NotificationProducerService = require('./src/notification/NotificationProducerService');

module.exports = {
  AppException,
  asyncHandler,
  globalExceptionHandler,
  ApiResponse,
  verifyToken,
  optionalVerifyToken,
  checkPermission,
  FileServiceClient,
  NotificationProducerService,
};

// src/middleware/auth.js
// Re-export verifyToken và checkPermission từ common-node-library
const { verifyToken, checkPermission } = require('common-node-library');

module.exports = {
  verifyToken,
  checkPermission,
};

// file: src/routes/copyrightExtended.routes.js
// Extended routes for copyright service
const express = require('express');
const router = express.Router();
const { verifyToken } = require('common-node-library');
const config = require('../config');

// Import controllers
const copyrightController = require('../controllers/copyright.controller');
const adminController = require('../controllers/admin.controller');

// Import upload middleware
const { uploadDocument } = require('../middleware/upload');

// Auth middleware
const authMiddleware = verifyToken(config.security.jwt.secret);

// GET /search - Search documents by filename
router.get('/search', copyrightController.searchCopyrights);

// GET /recent - Get recent documents
router.get('/recent', copyrightController.getRecentCopyrights);

// GET /analytics - Get analytics data
router.get('/analytics', copyrightController.getAnalytics);

// GET /owner/:ownerAddress - Get documents by owner
router.get('/owner/:ownerAddress', copyrightController.getCopyrightsByOwner);

// GET /blockchain/status - Get blockchain status
router.get('/blockchain/status', copyrightController.getBlockchainStatus);

// POST /check-similarity - Check document similarity
router.post('/check-similarity', uploadDocument, copyrightController.checkSimilarity);

// POST /hash/:hash/verify - Verify document by hash
router.post('/hash/:hash/verify', copyrightController.verifyCopyright);

module.exports = router;

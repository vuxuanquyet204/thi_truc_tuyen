// file: src/routes/copyright.routes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('common-node-library');
const config = require('../config');

// Import controllers
const copyrightController = require('../controllers/copyright.controller');

// Import upload middleware
const { uploadFile, uploadDocument } = require('../middleware/upload');

// Auth middleware
const authMiddleware = verifyToken(config.security.jwt.secret);

// GET / - Get all copyright documents (with pagination & filtering)
router.get('/', copyrightController.getAllCopyrights);

// GET /stats - Get copyright statistics
router.get('/stats', copyrightController.getCopyrightStats);

// GET /recent - Get recent documents
router.get('/recent', copyrightController.getRecentCopyrights);

// GET /analytics - Get analytics data
router.get('/analytics', copyrightController.getAnalytics);

// GET /blockchain/status - Get blockchain status
router.get('/blockchain/status', copyrightController.getBlockchainStatus);

// GET /search - Search copyrights
router.get('/search', copyrightController.searchCopyrights);

// GET /:id - Get copyright by ID (must be AFTER more specific routes)
router.get('/:id', copyrightController.getCopyrightById);

// GET /:id/download - Download document file (must be BEFORE /:id to match first)
router.get('/:id/download', copyrightController.downloadDocument);

// GET /hash/:hash - Get copyright by hash
router.get('/hash/:hash', copyrightController.getCopyrightByHash);

// POST / - Register new copyright (with file upload)
router.post('/', authMiddleware, uploadFile, copyrightController.createCopyright);

// PUT /:id - Update copyright
router.put('/:id', authMiddleware, copyrightController.updateCopyright);

// DELETE /:id - Delete copyright
router.delete('/:id', authMiddleware, copyrightController.deleteCopyright);

// POST /check-similarity - Check document similarity (with file upload)
router.post('/check-similarity', uploadDocument, copyrightController.checkSimilarity);

// POST /hash/:hash/verify - Verify copyright by hash
router.post('/hash/:hash/verify', copyrightController.verifyCopyright);

// GET /owner/:ownerAddress - Get copyrights by owner
router.get('/owner/:ownerAddress', copyrightController.getCopyrightsByOwner);

module.exports = router;

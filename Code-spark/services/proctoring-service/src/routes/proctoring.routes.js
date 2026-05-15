// file: proctoring-service/src/routes/proctoring.routes.js

const express = require('express');
const router = express.Router();
const proctoringController = require('../controllers/proctoring.controller');
const { authenticateToken, checkPermission } = require('../middleware/auth');

// Route: Lay chi tiet mot phien theo ID
router.get('/sessions/:sessionId', authenticateToken, proctoringController.getSessionById);

// Route cu: Lay lich su vi pham
router.get('/sessions/:sessionId/events', authenticateToken, checkPermission('proctoring:events:read'), proctoringController.getEventsBySession);

// Route: Lay tat ca cac phien giam sat dang hoat dong
router.get('/sessions', authenticateToken, proctoringController.getActiveSessions);

// Route: Bat dau mot phien giam sat
router.post('/sessions/start-monitoring', authenticateToken, proctoringController.startProctoringSession);

// Route: Ket thuc phien giam sat
router.post('/sessions/:sessionId/terminate', authenticateToken, proctoringController.terminateSession);

// Route: Danh dau phien hoan thanh
router.post('/sessions/:sessionId/complete', authenticateToken, proctoringController.completeSession);

// Route: Gui canh bao
router.post('/sessions/:sessionId/warning', authenticateToken, proctoringController.sendWarning);

// Route: Danh dau su kien da review
router.patch('/events/:eventId/review', authenticateToken, proctoringController.reviewEvent);

// Route: Lay media (screenshot/video) cua mot su kien
router.get('/events/:eventId/media', authenticateToken, proctoringController.getMediaByEventId);

// Route: Phan tich frame camera bang AI
router.post('/analyze-frame', proctoringController.analyzeFrame);

// Route test
router.get('/test', (req, res) => {
  res.json({
    message: 'Proctoring service is working through API Gateway!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

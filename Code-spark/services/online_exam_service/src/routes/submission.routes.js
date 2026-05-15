// src/routes/submission.routes.js
const express = require('express');
const router = express.Router();
const studentQuizController = require('../controllers/student.quiz.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Protected routes - yeu cau authentication
// URL nay se tro thanh: POST /api/submissions/:submissionId/submit
router.post('/:submissionId/submit', authenticateToken, studentQuizController.submitQuiz);

// URL nay se tro thanh: GET /api/submissions/:submissionId/result
router.get('/:submissionId/result', authenticateToken, studentQuizController.getSubmissionResult);

// GET /api/submissions/:submissionId
// Lay trang thai chi tiet cua mot submission (bao gom trang thai in-progress)
router.get('/:submissionId', authenticateToken, studentQuizController.getSubmissionStatus);

module.exports = router;

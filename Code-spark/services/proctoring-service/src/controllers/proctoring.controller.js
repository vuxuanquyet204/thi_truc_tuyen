// src/controllers/proctoring.controller.js
console.log('[CONTROLLER] Starting to load controller...');
const proctoringService = require('../services/proctoring.service');
const aiService = require('../services/ai.service');
console.log('[CONTROLLER] Service loaded:', typeof proctoringService);
console.log('[CONTROLLER] Service keys:', Object.keys(proctoringService || {}));

function toUuid(value) {
  return proctoringService.toUuid(value);
}

async function getEventsBySession(req, res) {
  try {
    const sessionId = req.params.sessionId;
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required.' });
    }
    const events = await proctoringService.getEventsBySession(sessionId);
    res.status(200).json(events);
  } catch (error) {
    console.error('Error in getEventsBySession controller:', error);
    res.status(500).json({ message: 'An error occurred while fetching proctoring events.' });
  }
}

async function startProctoringSession(req, res) {
  try {
    const body = req.body || {};
    const userIdFromToken = req.user?.id ?? req.user?.userId ?? req.user?.user_id;
    const userIdFromBody = body.userId ?? body.user_id ?? body.studentId;
    const examId = body.examId ?? body.exam_id;

    let resolvedUserId = userIdFromToken ?? userIdFromBody;

    if (typeof resolvedUserId === 'string') {
      const parsed = Number(resolvedUserId);
      resolvedUserId = Number.isNaN(parsed) ? resolvedUserId : parsed;
    }

    if (!resolvedUserId || !examId) {
      console.warn('[PROCTORING CONTROLLER] Thieu userId hoac examId khi tao session', {
        hasToken: !!userIdFromToken,
        hasBodyUserId: !!userIdFromBody,
        hasExamId: !!examId,
      });
      return res.status(400).json({ message: 'userId va examId la bat buoc.' });
    }

    const newSession = await proctoringService.createSession({
      user_id: resolvedUserId,
      exam_id: examId,
    });

    res.status(201).json(newSession);
  } catch (error) {
    console.error('Error in startProctoringSession controller:', error);
    res.status(500).json({ message: 'Loi khi tao phien giam sat.' });
  }
}

async function getActiveSessions(req, res) {
  try {
    const sessions = await proctoringService.getActiveSessions();
    res.status(200).json(sessions);
  } catch (error) {
    console.error('Error in getActiveSessions controller:', error);
    res.status(500).json({ message: 'Loi khi lay cac phien dang hoat dong.' });
  }
}

async function getStudentsInExam(req, res) {
  try {
    const { examId } = req.params;
    if (!examId) {
      return res.status(400).json({ message: 'Exam ID is required.' });
    }
    const students = await proctoringService.getStudentsInExam(examId);
    res.status(200).json(students);
  } catch (error) {
    console.error('Error in getStudentsInExam controller:', error);
    res.status(500).json({ message: 'Loi khi lay sinh vien.' });
  }
}

async function analyzeFrame(req, res) {
  try {
    const { image, examId, studentId, sessionId } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'Image is required.' });
    }

    await proctoringService.recordSessionActivity({ sessionId, examId, studentId });

    const aiEvents = await aiService.analyzeFrame(image);

    try {
      await proctoringService.saveDetectionsAsEvents({
        sessionId,
        examId,
        studentId,
        detections: aiEvents,
        screenshotBase64: image,
      });
    } catch (persistError) {
      console.error('[CONTROLLER] Khong the luu su kien proctoring', persistError);
    }

    if (!aiEvents || aiEvents.length === 0) {
      try {
        await proctoringService.emitSessionStatusUpdate(sessionId, examId, {
          cameraEnabled: true,
          faceDetected: true,
          faceCount: 1,
          connectionStatus: 'online'
        });
      } catch (statusError) {
        console.warn('[CONTROLLER] Khong the emit status update', statusError);
      }
    }

    const detections = aiEvents.map(event => {
      let type = event.event_type;
      if (type === 'FACE_NOT_DETECTED') type = 'FACE_NOT_DETECTED';
      else if (type === 'MULTIPLE_FACES') type = 'MULTIPLE_FACES';
      else if (type === 'MOBILE_PHONE_DETECTED') type = 'MOBILE_PHONE_DETECTED';
      else if (type === 'CAMERA_TAMPERED') type = 'CAMERA_TAMPERED';
      else if (type === 'LOOKING_AWAY') type = 'LOOKING_AWAY';

      let severity = event.severity;
      if (!severity || !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'low', 'medium', 'high', 'critical'].includes(severity)) {
        if (event.event_type === 'FACE_NOT_DETECTED' || event.event_type === 'MULTIPLE_FACES') {
          severity = 'HIGH';
        } else if (event.event_type === 'MOBILE_PHONE_DETECTED') {
          severity = 'CRITICAL';
        } else if (event.event_type === 'CAMERA_TAMPERED') {
          severity = 'HIGH';
        } else {
          severity = 'MEDIUM';
        }
      }

      const descriptions = {
        'FACE_NOT_DETECTED': 'Khong phat hien khuon mat',
        'MULTIPLE_FACES': 'Phat hien nhieu nguoi trong khung hinh',
        'MOBILE_PHONE_DETECTED': 'Phat hien dien thoai di dong',
        'CAMERA_TAMPERED': 'Camera bi che khuat hoac can thiep',
        'LOOKING_AWAY': 'Thi sinh dang nhin ra xa',
      };

      return {
        type: type,
        severity: severity,
        confidence: 90,
        timestamp: Date.now(),
        description: descriptions[event.event_type] || 'Phat hien hanh vi bat thuong',
        metadata: event.metadata || {},
      };
    });

    res.status(200).json({ detections });
  } catch (error) {
    console.error('Error in analyzeFrame controller:', error);
    res.status(200).json({ detections: [] });
  }
}

async function terminateSession(req, res) {
  try {
    const { sessionId } = req.params;
    const { reason } = req.body || {};

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required.' });
    }

    const terminatedBy =
      req.user?.id ?? req.user?.userId ?? req.user?.user_id ?? null;

    const session = await proctoringService.terminateSession(sessionId, {
      terminatedBy,
      reason,
    });

    if (!session) {
      return res.status(404).json({ message: 'Khong tim thay phien giam sat.' });
    }

    res.status(200).json({
      message: 'Phien giam sat da duoc dung thanh cong.',
      session,
    });
  } catch (error) {
    console.error('Error in terminateSession controller:', error);
    res.status(500).json({ message: 'Loi khi dung phien giam sat.' });
  }
}

async function completeSession(req, res) {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required.' });
    }

    const session = await proctoringService.completeSession(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Khong tim thay phien giam sat.' });
    }

    res.status(200).json({
      message: 'Phien giam sat da duoc danh dau hoan thanh.',
      session,
    });
  } catch (error) {
    console.error('Error in completeSession controller:', error);
    res.status(500).json({ message: 'Loi khi hoan thanh phien giam sat.' });
  }
}

async function sendWarning(req, res) {
  try {
    const { sessionId } = req.params;
    const { message } = req.body || {};

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required.' });
    }

    const sentBy =
      req.user?.id ?? req.user?.userId ?? req.user?.user_id ?? null;

    const warningEvent = await proctoringService.sendWarning(sessionId, {
      sentBy,
      message: message || 'Ban da nhan duoc canh bao tu giam thi',
    });

    if (!warningEvent) {
      return res.status(404).json({ message: 'Khong tim thay phien giam sat.' });
    }

    res.status(200).json({
      message: 'Canh bao da duoc gui thanh cong.',
      event: warningEvent,
    });
  } catch (error) {
    console.error('Error in sendWarning controller:', error);
    res.status(500).json({ message: 'Loi khi gui canh bao.' });
  }
}

async function getSessionById(req, res) {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required.' });
    }
    const session = await proctoringService.getSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Khong tim thay phien giam sat.' });
    }
    res.status(200).json(session);
  } catch (error) {
    console.error('Error in getSessionById controller:', error);
    res.status(500).json({ message: 'Loi khi lay chi tiet phien giam sat.' });
  }
}

async function reviewEvent(req, res) {
  try {
    const { eventId } = req.params;
    const { isReviewed } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required.' });
    }

    const event = await proctoringService.reviewEvent(eventId, Boolean(isReviewed));
    if (!event) {
      return res.status(404).json({ message: 'Khong tim thay su kien.' });
    }

    res.status(200).json({
      message: 'Su kien da duoc danh dau review.',
      event,
    });
  } catch (error) {
    console.error('Error in reviewEvent controller:', error);
    res.status(500).json({ message: 'Loi khi review su kien.' });
  }
}

async function getMediaByEventId(req, res) {
  try {
    const { eventId } = req.params;
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required.' });
    }
    const media = await proctoringService.getMediaByEventId(eventId);
    res.status(200).json(media);
  } catch (error) {
    console.error('Error in getMediaByEventId controller:', error);
    res.status(500).json({ message: 'Loi khi lay media.' });
  }
}

module.exports = {
  getEventsBySession,
  startProctoringSession,
  getActiveSessions,
  getStudentsInExam,
  analyzeFrame,
  terminateSession,
  completeSession,
  sendWarning,
  getSessionById,
  reviewEvent,
  getMediaByEventId,
};

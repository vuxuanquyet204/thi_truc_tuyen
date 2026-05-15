// Admin Proctoring API Service - Re-export from main API
import proctoringApiMain, {
  getAllSessions,
  getSessionById,
  getSessionWithDetails,
  terminateSession,
  completeSession,
  sendWarning,
  getEventsBySession,
  reviewEvent,
  getMediaByEventId,
  getMediaUrl,
  type ProctoringEvent,
  type MediaCapture,
  type ProctoringSession,
  type SessionWithEvents,
} from '@/features/proctoring/api';

// Re-export everything for admin use
export type { ProctoringEvent, MediaCapture, ProctoringSession, SessionWithEvents };

export const proctoringApi = {
  getAllSessions,
  getSessionById,
  getSessionWithDetails,
  terminateSession,
  completeSession,
  sendWarning,
  getEventsBySession,
  reviewEvent,
  getMediaByEventId,
  getMediaUrl,
};

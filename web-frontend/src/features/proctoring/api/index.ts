// Proctoring API barrel
export { default as proctoringApi } from './proctoringApi';
export * from './proctoringService';
export * from './cameraManager';
export * from './monitorService';

// Re-export session functions from proctoringApi directly for admin service compatibility
export {
  analyzeFrame,
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
} from './proctoringApi';

// Re-export types from proctoringApi directly
export type {
  FrameAnalysisRequest,
  Detection,
  FrameAnalysisResponse,
  ProctoringEvent,
  MediaCapture,
  ProctoringSession,
  SessionWithEvents,
} from './proctoringApi';

// Re-export as default for backward compatibility with admin/services/proctoringApi.ts
import proctoringApiDefault from './proctoringApi';
export default proctoringApiDefault;

// Note: adminProctoringApi is imported directly, not via barrel (avoids circular)

/**
 * Adapter để chuyển đổi giữa Backend ExamSession/ProctoringEvent và Frontend Proctoring Types
 * Giải quyết vấn đề không khớp giữa backend đơn giản và frontend cần nhiều field
 */

import { 
  type ProctoringSession as ApiProctoringSession,
  type ProctoringEvent as ApiProctoringEvent
} from '@/features/proctoring/api/proctoringApi'
import { 
  type ProctoringSession, 
  type Violation,
  type ProctoringEvent,
  type SessionStatus,
  type RiskLevel,
  type ViolationType,
  type Severity,
  type EventType,
  type GazeDirection,
  type ConnectionStatus
} from '@/foundation/types/proctoring'

/**
 * Backend ExamSession structure (từ proctoring-service)
 */
interface BackendExamSession {
  id: string
  userId: number | string
  examId: string
  startTime: string
  endTime?: string
  status: 'in_progress' | 'completed' | 'terminated'
  maxSeverityLevel?: string
  highSeverityViolationCount: number
  reviewNotes?: string
  reviewerId?: number | string
  createdAt?: string
  updatedAt?: string
}

/**
 * Backend ProctoringEvent structure (từ proctoring-service)
 */
interface BackendProctoringEvent {
  id: string
  sessionId: string
  eventType: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  metadata?: any
  isReviewed?: boolean
}

/**
 * Map backend status → frontend SessionStatus
 */
function mapBackendStatusToFrontend(status: string): SessionStatus {
  const statusMap: Record<string, SessionStatus> = {
    'in_progress': 'active',
    'completed': 'completed',
    'terminated': 'terminated',
    'active': 'active',
    'paused': 'paused',
    'pending': 'pending'
  }
  return statusMap[status] || 'pending'
}

/**
 * Map backend eventType → frontend ViolationType
 */
function mapEventTypeToViolationType(eventType: string): ViolationType {
  const typeMap: Record<string, ViolationType> = {
    'FACE_NOT_DETECTED': 'no_face_detected',
    'MULTIPLE_FACES': 'multiple_faces',
    'FACE_NOT_VISIBLE': 'face_not_visible',
    'LOOKING_AWAY': 'looking_away',
    'AUDIO_DETECTED': 'audio_detected',
    'TALKING': 'suspicious_audio',
    'TAB_SWITCH': 'tab_switch',
    'FULLSCREEN_EXIT': 'fullscreen_exit',
    'BROWSER_CHANGE': 'browser_change',
    'CONNECTION_LOST': 'connection_lost',
    'MOBILE_PHONE_DETECTED': 'unauthorized_device',
    'CAMERA_TAMPERED': 'no_face_detected',
    'SCREEN_SHARE': 'screen_share_detected'
  }
  
  // Normalize eventType to uppercase for comparison
  const normalizedType = eventType.toUpperCase().replace(/[-\s]/g, '_')
  return typeMap[normalizedType] || 'other'
}

/**
 * Generate violation description from eventType
 */
function generateViolationDescription(eventType: string, metadata?: any): string {
  const descMap: Record<string, string> = {
    'FACE_NOT_DETECTED': 'Không phát hiện khuôn mặt trong khung hình',
    'MULTIPLE_FACES': 'Phát hiện nhiều khuôn mặt trong khung hình',
    'FACE_NOT_VISIBLE': 'Khuôn mặt không rõ ràng',
    'LOOKING_AWAY': 'Thí sinh nhìn ra khỏi màn hình',
    'AUDIO_DETECTED': 'Phát hiện âm thanh bất thường',
    'TALKING': 'Phát hiện thí sinh đang nói',
    'TAB_SWITCH': 'Thí sinh chuyển tab trình duyệt',
    'FULLSCREEN_EXIT': 'Thí sinh thoát chế độ toàn màn hình',
    'BROWSER_CHANGE': 'Thí sinh thay đổi trình duyệt',
    'CONNECTION_LOST': 'Mất kết nối với server',
    'MOBILE_PHONE_DETECTED': 'Phát hiện điện thoại di động',
    'CAMERA_TAMPERED': 'Camera bị che hoặc tắt',
    'SCREEN_SHARE': 'Phát hiện chia sẻ màn hình'
  }
  
  const normalizedType = eventType.toUpperCase().replace(/[-\s]/g, '_')
  return descMap[normalizedType] || metadata?.description || `Vi phạm: ${eventType}`
}

/**
 * Calculate risk level from violations
 */
function calculateRiskLevel(events: BackendProctoringEvent[]): RiskLevel {
  if (!events || events.length === 0) return 'low'
  
  const criticalCount = events.filter(e => e.severity === 'critical').length
  const highCount = events.filter(e => e.severity === 'high').length
  
  if (criticalCount > 0 || highCount > 5) return 'critical'
  if (highCount > 2) return 'high'
  if (highCount > 0 || events.length > 3) return 'medium'
  return 'low'
}

/**
 * Calculate duration in minutes
 */
function calculateDuration(startTime: string, endTime?: string): number {
  if (!endTime) return 0
  try {
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    const diff = end - start
    return Math.floor(diff / (1000 * 60)) // Convert to minutes
  } catch {
    return 0
  }
}

/**
 * Map backend ProctoringEvent → frontend Violation
 */
export function backendEventToViolation(event: BackendProctoringEvent | ApiProctoringEvent, getMediaUrlFn?: (path: string) => string): Violation {
  const backendAny = event as any
  
  // Extract evidence URL from metadata
  let evidenceUrl = backendAny.metadata?.evidenceUrl || backendAny.metadata?.evidence_url
  
  // If storagePath exists, convert to full URL if getMediaUrlFn provided
  if (!evidenceUrl && backendAny.metadata?.storagePath && getMediaUrlFn) {
    evidenceUrl = getMediaUrlFn(backendAny.metadata.storagePath)
  } else if (!evidenceUrl && backendAny.metadata?.storagePath) {
    // Fallback: construct URL via API Gateway
    const gatewayUrl = import.meta.env.VITE_API_BASE_URL || ''
    evidenceUrl = `${gatewayUrl}/api/proctoring${backendAny.metadata.storagePath}`
  }
  
  return {
    id: backendAny.id || '',
    sessionId: backendAny.sessionId || '',
    timestamp: backendAny.timestamp || new Date().toISOString(),
    type: mapEventTypeToViolationType(backendAny.eventType || ''),
    severity: (backendAny.severity || 'low') as Severity,
    description: generateViolationDescription(backendAny.eventType || '', backendAny.metadata),
    evidenceUrl,
    resolved: backendAny.isReviewed || false
  }
}

/**
 * Map backend ProctoringEvent → frontend ProctoringEvent
 */
export function backendEventToProctoringEvent(event: BackendProctoringEvent | ApiProctoringEvent): ProctoringEvent {
  const backendAny = event as any
  
  // Map eventType to EventType enum
  const eventTypeMap: Record<string, EventType> = {
    'SESSION_START': 'session_start',
    'SESSION_END': 'session_end',
    'SESSION_PAUSE': 'session_pause',
    'SESSION_RESUME': 'session_resume',
    'VIOLATION_DETECTED': 'violation_detected',
    'WARNING_SENT': 'warning_sent',
    'CONNECTION_CHANGE': 'connection_change',
    'CAMERA_STATUS': 'camera_status',
    'AUDIO_STATUS': 'audio_status',
    'ADMIN_ACTION': 'admin_action'
  }
  
  const normalizedType = (backendAny.eventType || '').toUpperCase().replace(/[-\s]/g, '_')
  const mappedType = eventTypeMap[normalizedType] || 'violation_detected'
  
  return {
    id: backendAny.id || '',
    sessionId: backendAny.sessionId || '',
    timestamp: backendAny.timestamp || new Date().toISOString(),
    type: mappedType,
    message: generateViolationDescription(backendAny.eventType || '', backendAny.metadata),
    metadata: backendAny.metadata || {}
  }
}

/**
 * Chuyển từ Backend ExamSession → Frontend ProctoringSession
 * Điền giá trị mặc định cho các field backend không có
 */
export function backendSessionToProctoringSession(
  backend: BackendExamSession | ApiProctoringSession,
  events: (BackendProctoringEvent | ApiProctoringEvent)[] = [],
  getMediaUrlFn?: (path: string) => string
): ProctoringSession {
  const backendAny = backend as any
  
  // Map events to violations (with optional getMediaUrlFn)
  const violations = events.map(e => backendEventToViolation(e, getMediaUrlFn))
  
  // Calculate risk level
  const riskLevel = calculateRiskLevel(events)
  
  // Calculate duration
  const duration = calculateDuration(backendAny.startTime, backendAny.endTime)
  
  // Map status
  const status = mapBackendStatusToFrontend(backendAny.status || 'pending')
  
  // Extract metadata from events or session
  const metadata = backendAny.metadata || events[0]?.metadata || {}
  
  return {
    id: backendAny.id || '',
    examId: backendAny.examId || '',
    examTitle: backendAny.examTitle || metadata?.examTitle || `Exam ${backendAny.examId}`,
    userId: String(backendAny.userId || ''),
    userName: backendAny.userName || metadata?.userName || `User ${backendAny.userId || ''}`,
    userAvatar: backendAny.userAvatar || metadata?.userAvatar || undefined,
    startTime: backendAny.startTime || new Date().toISOString(),
    endTime: backendAny.endTime,
    duration,
    status,
    riskLevel,
    cameraEnabled: backendAny.cameraEnabled ?? metadata?.cameraEnabled ?? true,
    audioEnabled: backendAny.audioEnabled ?? metadata?.audioEnabled ?? true,
    videoStreamUrl: backendAny.videoStreamUrl || metadata?.videoStreamUrl,
    faceDetected: metadata?.faceDetected ?? (violations.filter(v => v.type === 'no_face_detected').length === 0),
    faceCount: metadata?.faceCount ?? (violations.some(v => v.type === 'multiple_faces') ? 2 : 1),
    gazeDirection: (metadata?.gazeDirection || 'center') as GazeDirection,
    audioDetected: metadata?.audioDetected ?? violations.some(v => v.type === 'audio_detected' || v.type === 'suspicious_audio'),
    totalViolations: violations.length,
    violations,
    tabSwitches: violations.filter(v => v.type === 'tab_switch').length,
    fullscreenExited: violations.filter(v => v.type === 'fullscreen_exit').length,
    browserChanged: violations.some(v => v.type === 'browser_change'),
    connectionStatus: (metadata?.connectionStatus || (status === 'active' ? 'online' : 'offline')) as ConnectionStatus,
    lastPing: metadata?.lastPing || backendAny.updatedAt
  }
}

/**
 * Helper để lấy giá trị an toàn cho các field backend không có
 */
export function getProctoringField<T>(
  backend: BackendExamSession | BackendProctoringEvent | ApiProctoringSession | ApiProctoringEvent,
  field: string,
  defaultValue: T
): T {
  const backendAny = backend as any
  return backendAny[field] !== undefined ? backendAny[field] : defaultValue
}

/**
 * Map nhiều backend sessions
 */
export function mapBackendSessionsToProctoringSessions(
  sessions: (BackendExamSession | ApiProctoringSession)[],
  eventsMap?: Record<string, (BackendProctoringEvent | ApiProctoringEvent)[]>
): ProctoringSession[] {
  return sessions.map(session => {
    const sessionEvents = eventsMap?.[session.id] || session.events || []
    return backendSessionToProctoringSession(session, sessionEvents)
  })
}

/**
 * Map nhiều backend events to violations
 */
export function mapBackendEventsToViolations(
  events: (BackendProctoringEvent | ApiProctoringEvent)[]
): Violation[] {
  return events.map(backendEventToViolation)
}

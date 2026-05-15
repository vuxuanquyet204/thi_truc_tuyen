/**
 * Proctoring API Service
 *
 * Proctoring session management, frame analysis, events, and media.
 * Uses shared proctoringHttpClient from foundation/api.
 */
import { proctoringHttpClient as proctoringClient, fetchWithRetry, type FetchOptions } from '@/foundation/api/proctoringClient'

export interface FrameAnalysisRequest {
	image: string
	examId: string
	studentId: string
	sessionId?: string
}

export interface Detection {
	type: 'FACE_NOT_DETECTED' | 'MULTIPLE_FACES' | 'MOBILE_PHONE_DETECTED' | 'CAMERA_TAMPERED' | 'LOOKING_AWAY' | 'tab_switch'
	severity: 'low' | 'medium' | 'high' | 'critical'
	confidence: number
	timestamp: number
	description: string
	metadata?: any
}

export interface FrameAnalysisResponse {
	detections: Detection[]
}

export interface ProctoringEvent {
	id: string
	sessionId: string
	eventType: string
	severity: 'low' | 'medium' | 'high'
	timestamp: string
	metadata?: any
	isReviewed?: boolean
}

export interface MediaCapture {
	id: string
	eventId: string
	captureType: 'screenshot' | 'video_clip'
	storagePath: string
	createdAt: string
}

export interface ProctoringSession {
	id: string
	userId: number
	examId: string
	startTime: string
	endTime?: string
	status: 'in_progress' | 'completed' | 'terminated'
	maxSeverityLevel?: string
	highSeverityViolationCount: number
	events?: ProctoringEvent[]
}

export interface SessionWithEvents extends ProctoringSession {
	events: ProctoringEvent[]
	mediaCaptures: MediaCapture[]
}

const analyzeFrame = async (
	request: FrameAnalysisRequest
): Promise<FrameAnalysisResponse> => {
	try {
		const response = await proctoringClient.post<FrameAnalysisResponse>(
			'/analyze-frame',
			request
		)
		return response.data
	} catch (error: any) {
		console.error('Error analyzing frame:', error)
		return { detections: [] }
	}
}

const getAllSessions = async (
	options: FetchOptions = {}
): Promise<ProctoringSession[]> => {
	try {
		const sessions = await fetchWithRetry(
			async () => {
				const response = await proctoringClient.get<ProctoringSession[]>('/sessions')
				return response.data
			},
			options
		)
		return sessions
	} catch (error: any) {
		console.warn(`[proctoringApi] getAllSessions failed: ${error.message}`)
		return []
	}
}

const getSessionById = async (
	sessionId: string
): Promise<ProctoringSession | null> => {
	try {
		const response = await proctoringClient.get<ProctoringSession>(
			`/sessions/${sessionId}`
		)
		return response.data
	} catch (error: any) {
		console.error('Error fetching session:', error)
		return null
	}
}

const getSessionWithDetails = async (
	sessionId: string
): Promise<SessionWithEvents | null> => {
	try {
		const session = await getSessionById(sessionId)
		if (!session) return null

		const events = await getEventsBySession(sessionId)

		const mediaCaptures: MediaCapture[] = []
		for (const event of events) {
			const media = await getMediaByEventId(event.id)
			mediaCaptures.push(...media)
		}

		return {
			...session,
			events,
			mediaCaptures,
		}
	} catch (error: any) {
		console.error('Error fetching session details:', error)
		return null
	}
}

const terminateSession = async (sessionId: string): Promise<boolean> => {
	try {
		const response = await proctoringClient.post(
			`/sessions/${sessionId}/terminate`
		)
		return response.status === 200
	} catch (error: any) {
		console.error('Error terminating session:', error)
		return false
	}
}

const sendWarning = async (
	sessionId: string,
	message?: string
): Promise<boolean> => {
	try {
		const response = await proctoringClient.post(`/sessions/${sessionId}/warning`, {
			message: message || 'Ban da nhan duoc canh bao tu giam thi',
		})
		return response.status === 200
	} catch (error: any) {
		console.error('Error sending warning:', error)
		return false
	}
}

const completeSession = async (sessionId: string): Promise<boolean> => {
	try {
		const response = await proctoringClient.post(
			`/sessions/${sessionId}/complete`
		)
		return response.status === 200
	} catch (error: any) {
		console.error('Error completing session:', error)
		return false
	}
}

const getEventsBySession = async (
	sessionId: string
): Promise<ProctoringEvent[]> => {
	try {
		const response = await proctoringClient.get<ProctoringEvent[]>(
			`/sessions/${sessionId}/events`
		)
		return response.data
	} catch (error: any) {
		console.error('Error fetching events:', error)
		return []
	}
}

const reviewEvent = async (
	eventId: string,
	isReviewed: boolean
): Promise<boolean> => {
	try {
		const response = await proctoringClient.patch(`/events/${eventId}/review`, {
			isReviewed,
		})
		return response.status === 200
	} catch (error: any) {
		console.error('Error reviewing event:', error)
		return false
	}
}

const getMediaByEventId = async (
	eventId: string
): Promise<MediaCapture[]> => {
	try {
		const response = await proctoringClient.get<MediaCapture[]>(
			`/events/${eventId}/media`
		)
		return response.data
	} catch (error: any) {
		if (error.response?.status === 404) {
			return []
		}
		console.error('Error fetching media:', error)
		return []
	}
}

const getMediaUrl = (storagePath: string): string => {
	if (storagePath.startsWith('/')) {
		return `/api/proctoring${storagePath}`
	}
	return storagePath
}

const proctoringApi = {
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
}

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
}

export default proctoringApi

// Types cho Proctoring System

export interface ProctoringSession {
	id: string
	examId: string
	examTitle: string
	userId: string
	userName: string
	userAvatar?: string
	startTime: string
	endTime?: string
	duration: number // phút
	status: SessionStatus
	riskLevel: RiskLevel
	
	// Camera & Audio
	cameraEnabled: boolean
	audioEnabled: boolean
	videoStreamUrl?: string
	
	// Detection metrics
	faceDetected: boolean
	faceCount: number
	gazeDirection: GazeDirection
	audioDetected: boolean
	
	// Violations
	totalViolations: number
	violations: Violation[]
	
	// Browser monitoring
	tabSwitches: number
	fullscreenExited: number
	browserChanged: boolean
	
	// Network
	connectionStatus: ConnectionStatus
	lastPing?: string
}

export type SessionStatus = 'active' | 'paused' | 'completed' | 'terminated' | 'pending'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type GazeDirection = 'center' | 'left' | 'right' | 'up' | 'down' | 'away' | 'unknown'

export type ConnectionStatus = 'online' | 'unstable' | 'offline'

export interface Violation {
	id: string
	sessionId: string
	timestamp: string
	type: ViolationType
	severity: Severity
	description: string
	evidenceUrl?: string
	resolved: boolean
}

export type ViolationType = 
	| 'no_face_detected'
	| 'multiple_faces'
	| 'face_not_visible'
	| 'looking_away'
	| 'audio_detected'
	| 'suspicious_audio'
	| 'tab_switch'
	| 'fullscreen_exit'
	| 'browser_change'
	| 'connection_lost'
	| 'unauthorized_device'
	| 'screen_share_detected'
	| 'other'

export type Severity = 'low' | 'medium' | 'high' | 'critical'

export interface ProctoringEvent {
	id: string
	sessionId: string
	timestamp: string
	type: EventType
	message: string
	metadata?: Record<string, any>
}

export type EventType = 
	| 'session_start'
	| 'session_end'
	| 'session_pause'
	| 'session_resume'
	| 'violation_detected'
	| 'warning_sent'
	| 'connection_change'
	| 'camera_status'
	| 'audio_status'
	| 'admin_action'

export interface ProctoringFilters {
	search: string
	status: SessionStatus | 'all'
	riskLevel: RiskLevel | 'all'
	examId: string | 'all'
}

export interface SessionStats {
	totalActive: number
	totalViolations: number
	highRiskSessions: number
	avgRiskLevel: number
}

export interface AlertConfig {
	noFaceThreshold: number // seconds
	multipleFacesAlert: boolean
	audioDetectionAlert: boolean
	tabSwitchLimit: number
	autoTerminateOnCritical: boolean
}


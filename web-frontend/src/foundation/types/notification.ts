/**
 * Types for the SSE notification system + REST API.
 * Matches the backend NotificationMessage DTO from notification-service.
 */

export type NotificationSeverity = 'low' | 'medium' | 'high' | 'critical'

export type NotificationType =
	| 'INFO'
	| 'WARNING'
	| 'ERROR'
	| 'SYSTEM'
	| 'EXAM'
	| 'COURSE'
	| 'CERTIFICATE'
	| 'REWARD'
	| 'ORGANIZATION'
	| 'CHAT'
	| 'SECURITY'

export interface Notification {
	id: string
	recipientUserId: string
	title: string
	content: string
	type: NotificationType
	severity: NotificationSeverity
	data?: Record<string, unknown>
	createdAt: string
	read: boolean
}

export interface NotificationState {
	notifications: Notification[]
	unreadCount: number
	isConnected: boolean
	error: string | null
	isDropdownOpen: boolean
	totalCount: number
	hasMore: boolean
	isLoading: boolean
	currentPage: number
	filter: NotificationFilter
}

export interface SseNotificationPayload {
	recipientUserId: string
	title: string
	content: string
	type: NotificationType
	severity?: NotificationSeverity
	data?: Record<string, unknown>
	createdAt?: string
}

export interface NotificationFilter {
	type?: NotificationType
	read?: boolean
	page?: number
}

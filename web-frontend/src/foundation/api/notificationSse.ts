/**
 * Notification API client using native EventSource for SSE.
 *
 * Backend: notification-service at /api/v1/notifications/stream
 * Route in api-gateway: /api/v1/notifications/** → notification-service (no strip)
 *
 * The Vite proxy forwards the JWT token from localStorage into the
 * Authorization header automatically (see vite.config.ts configure hook).
 * This allows EventSource — which doesn't support custom headers — to
 * connect to the authenticated SSE endpoint.
 */

import type {
	Notification,
	SseNotificationPayload,
} from '@/foundation/types/notification'
import { NOTIFICATION_ENDPOINTS } from '@/foundation/api/endpoints'

/**
 * Parse raw SSE notification payload from backend into a Notification object.
 * Backend sends JSON string as SSE data field.
 */
export const parseNotificationPayload = (
	raw: string | object
): SseNotificationPayload | null => {
	try {
		const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
		return {
			recipientUserId: parsed.recipientUserId ?? '',
			title: parsed.title ?? '',
			content: parsed.content ?? '',
			type: parsed.type ?? 'INFO',
			severity: parsed.severity ?? 'low',
			data: parsed.data ?? {},
			createdAt: parsed.createdAt ?? new Date().toISOString(),
		}
	} catch {
		return null
	}
}

/**
 * Convert SSE payload to a Notification with generated id and read=false.
 */
export const payloadToNotification = (
	payload: SseNotificationPayload,
	index?: number
): Notification => ({
	id: `notif-${Date.now()}-${index ?? Math.random().toString(36).slice(2, 9)}`,
	recipientUserId: payload.recipientUserId,
	title: payload.title,
	content: payload.content,
	type: payload.type,
	severity: payload.severity ?? 'low',
	data: payload.data,
	createdAt: payload.createdAt ?? new Date().toISOString(),
	read: false,
})

export type SseEventHandler = (notification: Notification) => void
export type SseErrorHandler = (error: Event | null) => void
export type SseConnectHandler = () => void

export interface SseEmitter {
	connect: (token: string) => void
	disconnect: () => void
	onNotification: (handler: SseEventHandler) => void
	onError: (handler: SseErrorHandler) => void
	onConnect: (handler: SseConnectHandler) => void
	isConnected: () => boolean
}

export const createSseEmitter = (): SseEmitter => {
	let eventSource: EventSource | null = null
	let reconnectTimer: ReturnType<typeof setTimeout> | null = null
	let currentToken: string | null = null

	const reconnectDelayMs = 3000

	const handlers: {
		notification: SseEventHandler | null
		error: SseErrorHandler | null
		connect: SseConnectHandler | null
	} = {
		notification: null,
		error: null,
		connect: null,
	}

	const cleanup = () => {
		if (eventSource) {
			eventSource.close()
			eventSource = null
		}
		if (reconnectTimer) {
			clearTimeout(reconnectTimer)
			reconnectTimer = null
		}
	}

	const connect = (token: string) => {
		currentToken = token
		cleanup()

		const url = `${NOTIFICATION_ENDPOINTS.STREAM}?token=${encodeURIComponent(token)}`

		try {
			eventSource = new EventSource(url)

			eventSource.onopen = () => {
				handlers.connect?.()
			}

			// Backend sends: emitter.send(SseEmitter.event().name("connected").data("connected"))
			eventSource.addEventListener('connected', () => {
				handlers.connect?.()
			})

			// Backend sends: emitter.send(SseEmitter.event().name("notification").data(payload))
			eventSource.addEventListener('notification', (event: MessageEvent) => {
				const payload = parseNotificationPayload(event.data)
				if (payload) {
					const notification = payloadToNotification(payload)
					handlers.notification?.(notification)
				}
			})

			eventSource.onerror = (error) => {
				handlers.error?.(error)
				cleanup()
				// Auto-reconnect after delay if token still valid
				if (currentToken) {
					reconnectTimer = setTimeout(() => {
						connect(currentToken!)
					}, reconnectDelayMs)
				}
			}
		} catch (err) {
			handlers.error?.(null)
		}
	}

	const disconnect = () => {
		currentToken = null
		cleanup()
	}

	return {
		connect,
		disconnect,
		onNotification: (handler: SseEventHandler) => {
			handlers.notification = handler
		},
		onError: (handler: SseErrorHandler) => {
			handlers.error = handler
		},
		onConnect: (handler: SseConnectHandler) => {
			handlers.connect = handler
		},
		isConnected: () => eventSource !== null && eventSource.readyState === EventSource.OPEN,
	}
}

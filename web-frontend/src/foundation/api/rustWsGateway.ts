/**
 * Rust WebSocket Gateway client.
 *
 * Connects to the Rust WS gateway at ws://localhost:8080/ws
 * for bidirectional communication via Kafka topics:
 *   - Receives: Kafka topic "to-client" (forwarded by Rust gateway)
 *   - Sends: goes to Kafka topic "from-client" (picked up by other services)
 *
 * Auth: userId is passed as query param (the gateway validates internally via identity service).
 *
 * Usage:
 *   import { createRustWsGateway, type RustWsGateway } from '@/foundation/api/rustWsGateway'
 *   const gateway = createRustWsGateway(userId)
 *   gateway.onMessage((data) => { ... })
 *   gateway.onConnect(() => { ... })
 *   gateway.onDisconnect(() => { ... })
 *   gateway.connect()
 *   gateway.send(JSON.stringify({ type: 'ping' }))
 */

export interface RustWsMessage {
	user_id: string
	content: string
}

export type RustWsMessageHandler = (data: RustWsMessage) => void
export type RustWsConnectHandler = () => void
export type RustWsDisconnectHandler = () => void
export type RustWsErrorHandler = (error: Event | null) => void

export interface RustWsGateway {
	connect: () => void
	disconnect: () => void
	send: (content: string) => void
	sendJson: (data: unknown) => void
	onMessage: (handler: RustWsMessageHandler) => void
	onConnect: (handler: RustWsConnectHandler) => void
	onDisconnect: (handler: RustWsDisconnectHandler) => void
	onError: (handler: RustWsErrorHandler) => void
	isConnected: () => boolean
}

interface RustWsHandlers {
	message: RustWsMessageHandler | null
	connect: RustWsConnectHandler | null
	disconnect: RustWsDisconnectHandler | null
	error: RustWsErrorHandler | null
}

const WS_GATEWAY_PATH = '/ws'
const RECONNECT_DELAY_MS = 3000
const MAX_RECONNECT_ATTEMPTS = 5

/**
 * Build the full WebSocket URL.
 * Uses relative URL so the Vite proxy forwards it to the Rust gateway.
 * The gateway must be available at the same host as the API gateway.
 */
const buildWsUrl = (userId: string): string => {
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
	const host = window.location.host
	return `${protocol}//${host}${WS_GATEWAY_PATH}?user_id=${encodeURIComponent(userId)}`
}

export const createRustWsGateway = (userId: string): RustWsGateway => {
	let socket: WebSocket | null = null
	let reconnectTimer: ReturnType<typeof setTimeout> | null = null
	let reconnectAttempts = 0
	let shouldReconnect = false

	const handlers: RustWsHandlers = {
		message: null,
		connect: null,
		disconnect: null,
		error: null,
	}

	const cleanup = () => {
		if (socket) {
			socket.close()
			socket = null
		}
		if (reconnectTimer) {
			clearTimeout(reconnectTimer)
			reconnectTimer = null
		}
	}

	const scheduleReconnect = () => {
		if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
			handlers.error?.(null)
			return
		}
		const delay = Math.min(
			RECONNECT_DELAY_MS * Math.pow(1.5, reconnectAttempts),
			15000
		)
		reconnectAttempts += 1
		reconnectTimer = setTimeout(() => {
			if (shouldReconnect) {
				connect()
			}
		}, delay)
	}

	const connect = () => {
		cleanup()
		shouldReconnect = true

		const url = buildWsUrl(userId)
		try {
			socket = new WebSocket(url)

			socket.onopen = () => {
				reconnectAttempts = 0
				handlers.connect?.()
			}

			socket.onmessage = (event: MessageEvent) => {
				try {
					const parsed = JSON.parse(event.data as string) as RustWsMessage
					handlers.message?.(parsed)
				} catch {
					// Treat raw text as simple message
					handlers.message?.({ user_id: userId, content: event.data as string })
				}
			}

			socket.onclose = () => {
				handlers.disconnect?.()
				if (shouldReconnect) {
					scheduleReconnect()
				}
			}

			socket.onerror = (error) => {
				handlers.error?.(error)
			}
		} catch (err) {
			handlers.error?.(null)
		}
	}

	const disconnect = () => {
		shouldReconnect = false
		cleanup()
	}

	const send = (content: string) => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(content)
		}
	}

	const sendJson = (data: unknown) => {
		send(JSON.stringify(data))
	}

	return {
		connect,
		disconnect,
		send,
		sendJson,
		onMessage: (handler: RustWsMessageHandler) => {
			handlers.message = handler
		},
		onConnect: (handler: RustWsConnectHandler) => {
			handlers.connect = handler
		},
		onDisconnect: (handler: RustWsDisconnectHandler) => {
			handlers.disconnect = handler
		},
		onError: (handler: RustWsErrorHandler) => {
			handlers.error = handler
		},
		isConnected: () => socket !== null && socket.readyState === WebSocket.OPEN,
	}
}

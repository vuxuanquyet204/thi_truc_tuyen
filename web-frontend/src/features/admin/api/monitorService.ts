export type MonitorMessage = { type: string; payload: unknown }

export function createMonitorSocket(url: string): WebSocket {
	const ws = new WebSocket(url)
	return ws
}

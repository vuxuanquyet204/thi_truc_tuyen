/**
 * NotificationInit — initializes the SSE notification connection at app startup.
 * Renders nothing; just kicks off the useNotification effect.
 * Must be used inside Redux Provider.
 */
import { useNotification } from '@/foundation/hooks/useNotification'

export function NotificationInit() {
	useNotification()
	return null
}

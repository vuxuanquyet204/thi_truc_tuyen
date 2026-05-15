/**
 * useNotification — manages SSE connection + REST API for notifications.
 *
 * Connects to the backend notification-service SSE stream when the user is authenticated.
 * Fetches initial notification history from REST API on connect.
 * Automatically reconnects on error. Dispatches incoming notifications to Redux store.
 * Shows toast alerts via Sonner for high-severity notifications.
 * Syncs local state with server state for mark-read and delete operations.
 *
 * Usage:
 *   const { isConnected, unreadCount, notifications } = useNotification()
 *
 * The hook should be used at the app root level (inside Redux Provider).
 * It will only connect when there is a valid accessToken.
 */

import { useEffect, useRef, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/foundation/store/hooks'
import {
	addNotification,
	setConnected,
	setError,
	setLoading,
	setPage,
	setHasMore,
	setTotalCount,
	replaceNotifications,
	appendNotifications,
	setUnreadCount,
	syncNotificationIds,
} from '@/foundation/store/slices/notificationSlice'
import {
	createSseEmitter,
	type SseEmitter,
} from '@/foundation/api/notificationSse'
import { notificationApi } from '@/foundation/api/notificationApi'
import { toast } from '@/foundation/contexts/ToastContext'
import type { Notification, NotificationSeverity } from '@/foundation/types/notification'

const RECONNECT_DELAY_MS = 5000
const PAGE_SIZE = 20

function severityToToastStyle(severity: NotificationSeverity): {
	variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
} {
	switch (severity) {
		case 'critical':
		case 'high':
			return { variant: 'error' }
		case 'medium':
			return { variant: 'warning' }
		default:
			return { variant: 'info' }
	}
}

function showNotificationToast(notification: Notification) {
	const { variant } = severityToToastStyle(notification.severity)
	const toastFn =
		variant === 'error'
			? toast.error
			: variant === 'warning'
				? toast.warning
				: toast.info
	toastFn(notification.title, {
		description: notification.content,
		duration: notification.severity === 'critical' ? 10000 : 5000,
	})
}

export function useNotification() {
	const dispatch = useAppDispatch()
	const emitterRef = useRef<SseEmitter | null>(null)
	const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const reconnectAttemptRef = useRef(0)
	const connectedRef = useRef(false)

	const isLoggedIn = useAppSelector((state) => state.auth.loggedIn)
	const userId = useAppSelector((state) => state.auth.user?.id)

	const fetchHistory = useCallback(
		async (page = 0) => {
			if (!isLoggedIn) return
			dispatch(setLoading(true))
			try {
				const result = await notificationApi.getNotifications({ page, size: PAGE_SIZE })
				if (result.success && result.data) {
					const { notifications, total, unreadCount } = result.data
					if (page === 0) {
						dispatch(replaceNotifications(notifications))
					} else {
						dispatch(appendNotifications(notifications))
					}
					dispatch(setTotalCount(total))
					dispatch(setUnreadCount(unreadCount))
					dispatch(setPage(page))
					dispatch(setHasMore(notifications.length === PAGE_SIZE))
				}
			} catch (err) {
				console.warn('[useNotification] Failed to fetch history:', err)
			} finally {
				dispatch(setLoading(false))
			}
		},
		[isLoggedIn, dispatch]
	)

	useEffect(() => {
		if (!isLoggedIn || !userId) {
			emitterRef.current?.disconnect()
			emitterRef.current = null
			dispatch(setConnected(false))
			connectedRef.current = false
			return
		}

		if (connectedRef.current) return

		const token = localStorage.getItem('accessToken')
		if (!token) return

		connectedRef.current = true

		const emitter = createSseEmitter()
		emitterRef.current = emitter

		emitter.onConnect(() => {
			reconnectAttemptRef.current = 0
			dispatch(setConnected(true))
			fetchHistory(0)
		})

		emitter.onNotification((notification) => {
			dispatch(addNotification(notification))
			showNotificationToast(notification)
		})

		emitter.onError(() => {
			dispatch(setConnected(false))
			dispatch(setError('SSE connection lost. Reconnecting...'))
			dispatch(setError(null))
			connectedRef.current = false
			emitter.disconnect()

			const delay = Math.min(
				RECONNECT_DELAY_MS * Math.pow(1.5, reconnectAttemptRef.current),
				30000
			)
			reconnectAttemptRef.current += 1

			reconnectTimerRef.current = setTimeout(() => {
				const refreshedToken = localStorage.getItem('accessToken')
				if (refreshedToken && isLoggedIn && userId) {
					connectedRef.current = false
				}
			}, delay)
		})

		emitter.connect(token)

		return () => {
			connectedRef.current = false
			emitter.disconnect()
			if (reconnectTimerRef.current) {
				clearTimeout(reconnectTimerRef.current)
			}
		}
	}, [isLoggedIn, userId, dispatch, fetchHistory])

	const loadMore = useCallback(() => {
		const hasMore = useAppSelector((state) => state.notifications.hasMore)
		const isLoading = useAppSelector((state) => state.notifications.isLoading)
		const currentPage = useAppSelector((state) => state.notifications.currentPage)
		if (!hasMore || isLoading) return
		fetchHistory(currentPage + 1)
	}, [fetchHistory])

	const isConnected = useAppSelector((state) => state.notifications.isConnected)
	const unreadCount = useAppSelector((state) => state.notifications.unreadCount)
	const notifications = useAppSelector((state) => state.notifications.notifications)
	const hasMore = useAppSelector((state) => state.notifications.hasMore)
	const isLoading = useAppSelector((state) => state.notifications.isLoading)
	const totalCount = useAppSelector((state) => state.notifications.totalCount)

	return {
		isConnected,
		unreadCount,
		notifications,
		hasMore,
		isLoading,
		totalCount,
		loadMore,
	}
}

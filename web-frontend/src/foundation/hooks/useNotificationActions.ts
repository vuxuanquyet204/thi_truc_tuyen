/**
 * useNotificationActions — wraps REST API calls with Redux dispatch.
 * Use this hook in components to perform notification actions (mark read,
 * mark all read, delete) that need to sync both local state and server state.
 */
import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/foundation/store/hooks'
import {
	markAsRead,
	markAllAsRead,
	removeNotification,
	clearAllNotifications,
	setUnreadCount,
} from '@/foundation/store/slices/notificationSlice'
import { notificationApi } from '@/foundation/api/notificationApi'

export function useNotificationActions() {
	const dispatch = useAppDispatch()
	const unreadCount = useAppSelector((state) => state.notifications.unreadCount)

	const markAsReadAction = useCallback(
		async (id: string) => {
			dispatch(markAsRead(id))
			await notificationApi.markAsRead(id)
		},
		[dispatch]
	)

	const markAllAsReadAction = useCallback(async () => {
		dispatch(markAllAsRead())
		dispatch(setUnreadCount(0))
		await notificationApi.markAllAsRead()
	}, [dispatch])

	const deleteNotificationAction = useCallback(
		async (id: string, isUnread: boolean) => {
			dispatch(removeNotification(id))
			if (isUnread) {
				dispatch(setUnreadCount(Math.max(0, unreadCount - 1)))
			}
			await notificationApi.deleteNotification(id)
		},
		[dispatch, unreadCount]
	)

	const clearAllAction = useCallback(async () => {
		dispatch(clearAllNotifications())
		dispatch(setUnreadCount(0))
		await notificationApi.deleteAllNotifications()
	}, [dispatch])

	return {
		markAsRead: markAsReadAction,
		markAllAsRead: markAllAsReadAction,
		deleteNotification: deleteNotificationAction,
		clearAll: clearAllAction,
	}
}

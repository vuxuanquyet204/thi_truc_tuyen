import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type {
	Notification,
	NotificationState,
	NotificationFilter,
} from '@/foundation/types/notification'

const MAX_NOTIFICATIONS = 100

const initialState: NotificationState = {
	notifications: [],
	unreadCount: 0,
	isConnected: false,
	error: null,
	isDropdownOpen: false,
	totalCount: 0,
	hasMore: true,
	isLoading: false,
	currentPage: 0,
	filter: {},
}

const notificationSlice = createSlice({
	name: 'notifications',
	initialState,
	reducers: {
		addNotification(state, action: PayloadAction<Notification>) {
			const exists = state.notifications.some((n) => n.id === action.payload.id)
			if (!exists) {
				state.notifications.unshift(action.payload)
				if (state.notifications.length > MAX_NOTIFICATIONS) {
					state.notifications.pop()
				}
			}
			if (!action.payload.read) {
				state.unreadCount += 1
			}
		},

		markAsRead(state, action: PayloadAction<string>) {
			const notif = state.notifications.find((n) => n.id === action.payload)
			if (notif && !notif.read) {
				notif.read = true
				state.unreadCount = Math.max(0, state.unreadCount - 1)
			}
		},

		markAllAsRead(state) {
			state.notifications.forEach((n) => {
				n.read = true
			})
			state.unreadCount = 0
		},

		removeNotification(state, action: PayloadAction<string>) {
			const idx = state.notifications.findIndex((n) => n.id === action.payload)
			if (idx !== -1) {
				if (!state.notifications[idx].read) {
					state.unreadCount = Math.max(0, state.unreadCount - 1)
				}
				state.notifications.splice(idx, 1)
			}
		},

		clearAllNotifications(state) {
			state.notifications = []
			state.unreadCount = 0
		},

		setConnected(state, action: PayloadAction<boolean>) {
			state.isConnected = action.payload
			if (action.payload) {
				state.error = null
			}
		},

		setError(state, action: PayloadAction<string | null>) {
			state.error = action.payload
		},

		setDropdownOpen(state, action: PayloadAction<boolean>) {
			state.isDropdownOpen = action.payload
		},

		toggleDropdown(state) {
			state.isDropdownOpen = !state.isDropdownOpen
		},

		setLoading(state, action: PayloadAction<boolean>) {
			state.isLoading = action.payload
		},

		setPage(state, action: PayloadAction<number>) {
			state.currentPage = action.payload
		},

		setHasMore(state, action: PayloadAction<boolean>) {
			state.hasMore = action.payload
		},

		setTotalCount(state, action: PayloadAction<number>) {
			state.totalCount = action.payload
		},

		setFilter(state, action: PayloadAction<NotificationFilter>) {
			state.filter = action.payload
			state.notifications = []
			state.currentPage = 0
			state.hasMore = true
		},

		appendNotifications(state, action: PayloadAction<Notification[]>) {
			const existingIds = new Set(state.notifications.map((n) => n.id))
			const newOnes = action.payload.filter((n) => !existingIds.has(n.id))
			state.notifications.push(...newOnes)
			if (state.notifications.length > MAX_NOTIFICATIONS) {
				state.notifications = state.notifications.slice(-MAX_NOTIFICATIONS)
			}
		},

		replaceNotifications(state, action: PayloadAction<Notification[]>) {
			state.notifications = action.payload
		},

		setUnreadCount(state, action: PayloadAction<number>) {
			state.unreadCount = action.payload
		},

		syncNotificationIds(state, action: PayloadAction<{ oldId: string; newId: string }>) {
			const notif = state.notifications.find((n) => n.id === action.payload.oldId)
			if (notif) {
				notif.id = action.payload.newId
			}
		},
	},
})

export const {
	addNotification,
	markAsRead,
	markAllAsRead,
	removeNotification,
	clearAllNotifications,
	setConnected,
	setError,
	setDropdownOpen,
	toggleDropdown,
	setLoading,
	setPage,
	setHasMore,
	setTotalCount,
	setFilter,
	appendNotifications,
	replaceNotifications,
	setUnreadCount,
	syncNotificationIds,
} = notificationSlice.actions

export default notificationSlice.reducer

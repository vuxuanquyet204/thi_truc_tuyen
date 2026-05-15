/**
 * Notification REST API layer.
 * Wraps notificationService client with typed methods for:
 * - Paginated notification history (GET /)
 * - Unread count (GET /unread-count)
 * - Mark read / mark all read (PUT)
 * - Delete one / delete all (DELETE)
 * - Send notification via Kafka (POST /send)
 */
import { notificationClient } from '@/foundation/api/client'
import { NOTIFICATION_ENDPOINTS } from '@/foundation/api/endpoints'
import type {
	Notification,
	NotificationType,
	NotificationSeverity,
} from '@/foundation/types/notification'

export interface NotificationPageResponse {
	success: boolean
	message?: string
	data: {
		notifications: NotificationApiDto[]
		total: number
		page: number
		size: number
		unreadCount: number
	}
}

export interface NotificationApiDto {
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

export interface UnreadCountResponse {
	success: boolean
	data: { count: number }
}

export interface MarkReadResponse {
	success: boolean
	data: { success: boolean }
}

export interface MarkAllReadResponse {
	success: boolean
	data: { count: number }
}

export interface DeleteResponse {
	success: boolean
	data: { success: boolean } | { count: number }
}

export interface SendNotificationRequest {
	recipientUserId: string
	title: string
	content: string
	type?: NotificationType
	severity?: NotificationSeverity
	data?: Record<string, unknown>
}

export interface SendNotificationResponse {
	success: boolean
	message?: string
	data: NotificationApiDto
}

export type NotificationFilter = {
	type?: NotificationType
	read?: boolean
	page?: number
	size?: number
}

const PAGE_SIZE = 20

export const notificationApi = {
	/**
	 * Lay danh sach thong bao (phan trang, co the loc theo type/read).
	 */
	async getNotifications(
		filter: NotificationFilter = {}
	): Promise<NotificationPageResponse> {
		const { type, read, page = 0, size = PAGE_SIZE } = filter
		const params = new URLSearchParams({
			page: String(page),
			size: String(size),
		})
		if (type) params.set('type', type)
		if (read !== undefined) params.set('read', String(read))

		const response = await notificationClient.get<NotificationPageResponse>(
			`/list?${params.toString()}`
		)
		return response.data
	},

	/**
	 * Lay so thong bao chua doc.
	 */
	async getUnreadCount(): Promise<number> {
		try {
			const response = await notificationClient.get<UnreadCountResponse>(
				NOTIFICATION_ENDPOINTS.UNREAD_COUNT
			)
			return response.data.data.count ?? 0
		} catch {
			return 0
		}
	},

	/**
	 * Danh dau mot thong bao la da doc.
	 */
	async markAsRead(id: string): Promise<boolean> {
		try {
			const response = await notificationClient.put<MarkReadResponse>(
				NOTIFICATION_ENDPOINTS.MARK_READ(id)
			)
			return response.data.data.success
		} catch {
			return false
		}
	},

	/**
	 * Danh dau tat ca thong bao la da doc.
	 */
	async markAllAsRead(): Promise<number> {
		try {
			const response = await notificationClient.put<MarkAllReadResponse>(
				NOTIFICATION_ENDPOINTS.MARK_ALL_READ
			)
			return response.data.data.count ?? 0
		} catch {
			return 0
		}
	},

	/**
	 * Xoa mot thong bao.
	 */
	async deleteNotification(id: string): Promise<boolean> {
		try {
			const response = await notificationClient.delete<DeleteResponse>(
				NOTIFICATION_ENDPOINTS.DELETE_ONE(id)
			)
			const data = response.data.data as { success?: boolean }
			return data.success !== undefined ? data.success : true
		} catch {
			return false
		}
	},

	/**
	 * Xoa tat ca thong bao.
	 */
	async deleteAllNotifications(): Promise<number> {
		try {
			const response = await notificationClient.delete<DeleteResponse>(
				NOTIFICATION_ENDPOINTS.DELETE_ALL
			)
			const data = response.data.data as { count?: number }
			return data.count ?? 0
		} catch {
			return 0
		}
	},

	/**
	 * Gui thong bao den mot nguoi dung.
	 * Frontend goi endpoint nay de gui notification qua Kafka den service khac.
	 */
	async sendNotification(request: SendNotificationRequest): Promise<SendNotificationResponse> {
		const response = await notificationClient.post<SendNotificationResponse>(
			NOTIFICATION_ENDPOINTS.SEND,
			request
		)
		return response.data
	},
}

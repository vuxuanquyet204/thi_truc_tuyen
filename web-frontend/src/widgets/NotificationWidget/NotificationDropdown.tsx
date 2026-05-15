/**
 * NotificationDropdown — shows notification list in a popup from the Bell icon.
 * Displays real-time notifications from SSE + REST history, supports mark-read,
 * mark-all-read, delete, filter tabs, and infinite scroll.
 */
import { useEffect, useRef, useCallback, useState } from 'react'
import {
	Bell,
	Info,
	AlertTriangle,
	XCircle,
	Star,
	BookOpen,
	Award,
	Gift,
	Users,
	MessageSquare,
	ShieldAlert,
	Settings,
	BellOff,
	CheckCheck,
	Trash2,
	Loader2,
	ChevronDown,
	Filter,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/foundation/store/hooks'
import {
	markAsRead,
	markAllAsRead,
	removeNotification,
	clearAllNotifications,
	appendNotifications,
	replaceNotifications,
	setUnreadCount,
} from '@/foundation/store/slices/notificationSlice'
import { notificationApi } from '@/foundation/api/notificationApi'
import type {
	Notification,
	NotificationType,
} from '@/foundation/types/notification'
import styles from './NotificationDropdown.module.css'

const PAGE_SIZE = 20

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
	INFO: <Info size={18} />,
	WARNING: <AlertTriangle size={18} />,
	ERROR: <XCircle size={18} />,
	SYSTEM: <Settings size={18} />,
	EXAM: <Star size={18} />,
	COURSE: <BookOpen size={18} />,
	CERTIFICATE: <Award size={18} />,
	REWARD: <Gift size={18} />,
	ORGANIZATION: <Users size={18} />,
	CHAT: <MessageSquare size={18} />,
	SECURITY: <ShieldAlert size={18} />,
}

const DEFAULT_ICON = <Bell size={18} />

const iconStyle = (type: string): string => {
	if (['WARNING'].includes(type)) return styles.warning
	if (['ERROR', 'SECURITY'].includes(type)) return styles.error
	if (['INFO', 'CHAT', 'SYSTEM'].includes(type)) return styles.info
	if (['REWARD', 'CERTIFICATE'].includes(type)) return styles.success
	if (['ORGANIZATION'].includes(type)) return styles.system
	return styles.default
}

function formatTime(isoString: string): string {
	const date = new Date(isoString)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffSec = Math.floor(diffMs / 1000)
	const diffMin = Math.floor(diffSec / 60)
	const diffHour = Math.floor(diffMin / 60)
	const diffDay = Math.floor(diffHour / 24)

	if (diffSec < 60) return 'Vua xong'
	if (diffMin < 60) return `${diffMin}p truoc`
	if (diffHour < 24) return `${diffHour}g truoc`
	if (diffDay < 7) return `${diffDay}ngay truoc`
	return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function severityClass(severity: string): string {
	if (severity === 'critical') return styles.severityCritical
	if (severity === 'high') return styles.severityHigh
	if (severity === 'medium') return styles.severityMedium
	return ''
}

type FilterTab = 'all' | 'unread'

interface NotificationDropdownProps {
	onClose: () => void
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
	const dispatch = useAppDispatch()
	const dropdownRef = useRef<HTMLDivElement>(null)
	const listRef = useRef<HTMLDivElement>(null)
	const loadingRef = useRef(false)

	const notifications = useAppSelector((state) => state.notifications.notifications)
	const hasMore = useAppSelector((state) => state.notifications.hasMore)
	const currentPage = useAppSelector((state) => state.notifications.currentPage)

	const [activeTab, setActiveTab] = useState<FilterTab>('all')
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const [isSyncing, setIsSyncing] = useState(false)

	const filteredNotifications =
		activeTab === 'unread' ? notifications.filter((n) => !n.read) : notifications

	const loadMore = useCallback(async () => {
		if (loadingRef.current || !hasMore) return
		loadingRef.current = true
		setIsLoadingMore(true)
		try {
			const readFilter = activeTab === 'unread' ? true : undefined
			const result = await notificationApi.getNotifications({
				page: currentPage + 1,
				size: PAGE_SIZE,
				read: readFilter,
			})
			if (result.success && result.data) {
				dispatch(appendNotifications(result.data.notifications))
				dispatch(setUnreadCount(result.data.unreadCount))
			}
		} catch (err) {
			console.warn('[NotificationDropdown] loadMore failed:', err)
		} finally {
			loadingRef.current = false
			setIsLoadingMore(false)
		}
	}, [activeTab, currentPage, hasMore, dispatch])

	useEffect(() => {
		const listEl = listRef.current
		if (!listEl) return
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
					loadMore()
				}
			},
			{ threshold: 0.1 }
		)
		observer.observe(listEl.lastElementChild || listEl)
		return () => observer.disconnect()
	}, [hasMore, loadMore])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				onClose()
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [onClose])

	const handleItemClick = async (notification: Notification) => {
		if (!notification.read) {
			dispatch(markAsRead(notification.id))
			await notificationApi.markAsRead(notification.id)
		}
		if (notification.data?.url && typeof notification.data.url === 'string') {
			window.location.href = notification.data.url
		}
	}

	const handleMarkAllRead = async () => {
		setIsSyncing(true)
		dispatch(markAllAsRead())
		await notificationApi.markAllAsRead()
		setIsSyncing(false)
	}

	const handleClearAll = async () => {
		setIsSyncing(true)
		dispatch(clearAllNotifications())
		await notificationApi.deleteAllNotifications()
		setIsSyncing(false)
	}

	const handleRemove = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation()
		dispatch(removeNotification(id))
		await notificationApi.deleteNotification(id)
	}

	const handleTabChange = async (tab: FilterTab) => {
		if (tab === activeTab) return
		setActiveTab(tab)
		setIsLoadingMore(true)
		try {
			const readFilter = tab === 'unread' ? true : undefined
			const result = await notificationApi.getNotifications({
				page: 0,
				size: PAGE_SIZE,
				read: readFilter,
			})
			if (result.success && result.data) {
				dispatch(replaceNotifications(result.data.notifications))
				dispatch(setUnreadCount(result.data.unreadCount))
			}
		} catch (err) {
			console.warn('[NotificationDropdown] tab change failed:', err)
		} finally {
			setIsLoadingMore(false)
		}
	}

	const unreadCount = useAppSelector((state) => state.notifications.unreadCount)
	const totalCount = useAppSelector((state) => state.notifications.totalCount)

	return (
		<>
			<div className={styles.overlay} onClick={onClose} />
			<div ref={dropdownRef} className={styles.dropdown}>
				<div className={styles.header}>
					<div className={styles.headerLeft}>
						<span className={styles.title}>Thong bao</span>
						{(unreadCount > 0 || totalCount > 0) && (
							<span className={styles.badge}>{unreadCount > 0 ? unreadCount : totalCount}</span>
						)}
					</div>
					<div className={styles.headerActions}>
						{notifications.some((n) => !n.read) && (
							<button
								className={styles.markAllBtn}
								onClick={handleMarkAllRead}
								disabled={isSyncing}
								title="Danh dau tat ca da doc"
							>
								<CheckCheck size={14} />
							</button>
						)}
						{notifications.length > 0 && (
							<button
								className={styles.clearAllBtn}
								onClick={handleClearAll}
								disabled={isSyncing}
								title="Xoa tat ca thong bao"
							>
								<Trash2 size={14} />
							</button>
						)}
					</div>
				</div>

				<div className={styles.tabs}>
					<button
						className={`${styles.tab} ${activeTab === 'all' ? styles.tabActive : ''}`}
						onClick={() => handleTabChange('all')}
					>
						Tat ca
						{totalCount > 0 && <span className={styles.tabCount}>{totalCount}</span>}
					</button>
					<button
						className={`${styles.tab} ${activeTab === 'unread' ? styles.tabActive : ''}`}
						onClick={() => handleTabChange('unread')}
					>
						Chua doc
						{unreadCount > 0 && <span className={styles.tabCountUnread}>{unreadCount}</span>}
					</button>
				</div>

				<div ref={listRef} className={styles.list}>
					{filteredNotifications.length === 0 && !isLoadingMore ? (
						<div className={styles.empty}>
							<BellOff className={styles.emptyIcon} size={40} />
							<p className={styles.emptyText}>
								{activeTab === 'unread' ? 'Khong co thong bao chua doc' : 'Khong co thong bao nao'}
							</p>
						</div>
					) : (
						<>
							{filteredNotifications.map((notification) => (
								<div
									key={notification.id}
									className={`${styles.item} ${!notification.read ? styles.unread : ''} ${severityClass(notification.severity)}`}
									onClick={() => handleItemClick(notification)}
								>
									<div className={`${styles.iconWrap} ${iconStyle(notification.type)}`}>
										{NOTIFICATION_ICONS[notification.type] ?? DEFAULT_ICON}
									</div>
									<div className={styles.content}>
										<p className={styles.itemTitle}>{notification.title}</p>
										<p className={styles.itemContent}>{notification.content}</p>
										<p className={styles.time}>{formatTime(notification.createdAt)}</p>
									</div>
									<div
										style={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											gap: 4,
										}}
									>
										{!notification.read && <div className={styles.unreadDot} />}
										<button
											onClick={(e) => handleRemove(e, notification.id)}
											style={{
												background: 'none',
												border: 'none',
												cursor: 'pointer',
												color: 'var(--muted-foreground)',
												padding: 2,
												opacity: 0.5,
												display: 'flex',
												alignItems: 'center',
											}}
											title="Xoa thong bao"
										>
											<Trash2 size={12} />
										</button>
									</div>
								</div>
							))}

							{hasMore && (
								<div className={styles.loadMore}>
									<button className={styles.loadMoreBtn} onClick={loadMore} disabled={isLoadingMore}>
										{isLoadingMore ? (
											<Loader2 size={14} className={styles.spinner} />
										) : (
											<ChevronDown size={14} />
										)}
										{isLoadingMore ? 'Dang tai...' : 'Tai them'}
									</button>
								</div>
							)}
						</>
					)}

					{isLoadingMore && filteredNotifications.length === 0 && (
						<div className={styles.loadingCenter}>
							<Loader2 size={24} className={styles.spinner} />
							<p>Đang tai thong bao...</p>
						</div>
					)}
				</div>
			</div>
		</>
	)
}

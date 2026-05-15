/**
 * NotificationBell — Bell icon button with unread badge.
 * Toggles the NotificationDropdown. Can be used in any header.
 */
import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useAppSelector } from '@/foundation/store/hooks'
import { NotificationDropdown } from './NotificationDropdown'

interface NotificationBellProps {
	className?: string
	buttonClassName?: string
	badgeClassName?: string
}

export function NotificationBell({
	className,
	buttonClassName,
	badgeClassName,
}: NotificationBellProps) {
	const [isOpen, setIsOpen] = useState(false)
	const unreadCount = useAppSelector((state) => state.notifications.unreadCount)
	const isConnected = useAppSelector((state) => state.notifications.isConnected)

	const toggle = () => setIsOpen((prev) => !prev)
	const close = () => setIsOpen(false)

	return (
		<div className={className} style={{ position: 'relative' }}>
			<button
				aria-label="Thông báo"
				className={buttonClassName}
				onClick={toggle}
				title={isConnected ? 'Thông báo' : 'Đang kết nối thông báo...'}
			>
				<Bell />
				{unreadCount > 0 && (
					<span
						className={badgeClassName}
						style={{
							position: 'absolute',
							top: '-4px',
							right: '-4px',
							minWidth: '18px',
							height: '18px',
							padding: '0 4px',
							background: '#ef4444',
							color: '#fff',
							fontSize: '11px',
							fontWeight: 700,
							borderRadius: '9px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							lineHeight: 1,
							pointerEvents: 'none',
						}}
					>
						{unreadCount > 99 ? '99+' : unreadCount}
					</span>
				)}
			</button>

			{isOpen && <NotificationDropdown onClose={close} />}
		</div>
	)
}

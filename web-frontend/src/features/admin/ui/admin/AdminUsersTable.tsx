import React from 'react'
import { AdminUser, AdminRole, AdminStatus, AdminPermission } from '@/types/admin'
import {
	Edit,
	Trash2,
	Eye,
	User,
	Mail,
	Shield,
	Clock,
	CheckCircle,
	XCircle,
	AlertTriangle,
	Pause,
	Play,
	Key,
	Settings,
	Activity
} from 'lucide-react'
import Badge from '@/features/admin/ui/common/Badge'
import styles from '@/pages/admin/AdminPage/AdminPage.module.css'

interface AdminUsersTableProps {
	admins: AdminUser[]
	onEditAdmin: (admin: AdminUser) => void
	onDeleteAdmin: (adminId: string) => void
	onViewAdmin: (admin: AdminUser) => void
	onToggleStatus: (adminId: string, newStatus: AdminStatus) => void
	onResetPassword: (adminId: string) => void
	onToggleTwoFactor: (adminId: string) => void
	loading?: boolean
	emptyMessage?: string
}

export default function AdminUsersTable({
	admins,
	onEditAdmin,
	onDeleteAdmin,
	onViewAdmin,
	onToggleStatus,
	onResetPassword,
	onToggleTwoFactor,
	loading = false,
	emptyMessage = 'Không có admin nào'
}: AdminUsersTableProps): JSX.Element {
	const getRoleLabel = (role: AdminRole) => {
		const labels: Record<AdminRole, string> = {
			super_admin: 'Super Admin',
			system_admin: 'System Admin',
			content_admin: 'Content Admin',
			user_admin: 'User Admin',
			security_admin: 'Security Admin',
			audit_admin: 'Audit Admin',
			support_admin: 'Support Admin'
		}
		return labels[role] || role
	}

	const getRoleColor = (role: AdminRole) => {
		const colors: Record<AdminRole, string> = {
			super_admin: 'var(--danger)',
			system_admin: 'var(--primary)',
			content_admin: 'var(--info)',
			user_admin: 'var(--success)',
			security_admin: 'var(--warning)',
			audit_admin: 'var(--secondary)',
			support_admin: 'var(--accent)'
		}
		return colors[role] || 'var(--muted-foreground)'
	}

	const getStatusLabel = (status: AdminStatus) => {
		const labels: Record<AdminStatus, string> = {
			active: 'Hoạt động',
			inactive: 'Không hoạt động',
			suspended: 'Tạm dừng',
			pending: 'Chờ duyệt',
			locked: 'Khóa'
		}
		return labels[status] || status
	}

	const getStatusColor = (status: AdminStatus) => {
		const colors: Record<AdminStatus, string> = {
			active: 'var(--success)',
			inactive: 'var(--muted-foreground)',
			suspended: 'var(--warning)',
			pending: 'var(--info)',
			locked: 'var(--danger)'
		}
		return colors[status] || 'var(--muted-foreground)'
	}

	const getStatusIcon = (status: AdminStatus) => {
		switch (status) {
			case 'active':
				return <CheckCircle size={14} />
			case 'inactive':
				return <XCircle size={14} />
			case 'suspended':
				return <Pause size={14} />
			case 'pending':
				return <Clock size={14} />
			case 'locked':
				return <AlertTriangle size={14} />
			default:
				return <XCircle size={14} />
		}
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	const formatRelativeTime = (dateString: string) => {
		const now = new Date()
		const date = new Date(dateString)
		const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

		if (diffInMinutes < 1) return 'Vừa xong'
		if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
		if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`
		return `${Math.floor(diffInMinutes / 1440)} ngày trước`
	}

	const getPermissionCount = (permissions: AdminPermission[]) => {
		return permissions.length
	}

	if (loading) {
		return (
			<div className={`${styles['admin-table-loading']} ${styles['loading']}`}>
				<div className={styles['loading-spinner']}></div>
				<p>Đang tải danh sách admin...</p>
			</div>
		)
	}

	if (admins.length === 0) {
		return (
			<div className={styles['admin-table-empty']}>
				<User size={48} />
				<h3>Chưa có admin nào</h3>
				<p>{emptyMessage}</p>
			</div>
		)
	}

	return (
		<div className={styles['admin-table-container']}>
			<table className={styles['admin-table']}>
				<thead>
					<tr>
						<th className={styles['sortable']}>Admin</th>
						<th className={styles['sortable']}>Vai trò</th>
						<th className={styles['sortable']}>Quyền</th>
						<th className={styles['sortable']}>Trạng thái</th>
						<th className={styles['sortable']}>Đăng nhập cuối</th>
						<th className={styles['sortable']}>Bảo mật</th>
						<th className={styles['sortable']}>Hoạt động</th>
						<th className={styles['actions']}>Thao tác</th>
					</tr>
				</thead>
				<tbody>
					{admins.map((admin) => (
						<tr key={admin.id}>
							<td>
								<div className={styles['admin-info']}>
									<div className={styles['admin-avatar']}>
										{admin.avatar ? (
											<img src={admin.avatar} alt={admin.fullName} />
										) : (
											<User size={20} />
										)}
									</div>
									<div className={styles['admin-details']}>
										<div className={styles['admin-name']}>{admin.fullName}</div>
										<div className={styles['admin-username']}>@{admin.username}</div>
										<div className={styles['admin-email']}>
											<Mail size={12} />
											{admin.email}
										</div>
									</div>
								</div>
							</td>
							<td>
								<Badge
									variant="secondary"
									style={{ backgroundColor: getRoleColor(admin.role) }}
								>
									{getRoleLabel(admin.role)}
								</Badge>
							</td>
							<td>
								<div className={styles['permissions-info']}>
									<div className={styles['permissions-count']}>
										<Shield size={14} />
										{getPermissionCount(admin.permissions)} quyền
									</div>
									<div className={styles['permissions-preview']}>
										{admin.permissions.slice(0, 3).map((permission) => (
											<span key={permission} className={styles['permission-tag']}>
												{permission.replace(/_/g, ' ')}
											</span>
										))}
										{admin.permissions.length > 3 && (
											<span className={styles['permission-more']}>
												+{admin.permissions.length - 3} khác
											</span>
										)}
									</div>
								</div>
							</td>
							<td>
								<div className={styles['status-info']}>
									<Badge
										variant="secondary"
										style={{ backgroundColor: getStatusColor(admin.status) }}
									>
										{getStatusIcon(admin.status)}
										{getStatusLabel(admin.status)}
									</Badge>
									{admin.loginAttempts > 0 && (
										<div className={styles['login-attempts']}>
											{admin.loginAttempts} lần thử
										</div>
									)}
								</div>
							</td>
							<td>
								<div className={styles['login-info']}>
									<div className={styles['login-time']}>
										<Clock size={14} />
										{formatDate(admin.lastLoginAt)}
									</div>
									<div className={styles['login-relative']}>
										{formatRelativeTime(admin.lastLoginAt)}
									</div>
								</div>
							</td>
							<td>
								<div className={styles['security-info']}>
									<div className={styles['security-item']}>
										<Key size={14} />
										<span className={admin.isTwoFactorEnabled ? styles['enabled'] : styles['disabled']}>
											{admin.isTwoFactorEnabled ? '2FA Bật' : '2FA Tắt'}
										</span>
									</div>
									<div className={styles['security-item']}>
										<Settings size={14} />
										<span>Session: {admin.preferences.security.sessionTimeout}m</span>
									</div>
								</div>
							</td>
							<td>
								<div className={styles['activity-info']}>
									<div className={styles['activity-item']}>
										<Activity size={14} />
										<span>Theme: {admin.preferences.theme}</span>
									</div>
									<div className={styles['activity-item']}>
										<Settings size={14} />
										<span>Lang: {admin.preferences.language}</span>
									</div>
									{admin.metadata.department && (
										<div className={styles['activity-item']}>
											<User size={14} />
											<span>{admin.metadata.department}</span>
										</div>
									)}
								</div>
							</td>
							<td>
								<div className={styles['table-actions']}>
									<button
										className={`${styles['btn']} ${styles['btn-sm']} ${styles['btn-outline']}`}
										onClick={() => onViewAdmin(admin)}
										title="Xem chi tiết"
									>
										<Eye size={16} />
									</button>
									<button
										className={`${styles['btn']} ${styles['btn-sm']} ${styles['btn-outline']}`}
										onClick={() => onEditAdmin(admin)}
										title="Chỉnh sửa"
									>
										<Edit size={16} />
									</button>
									<button
										className={`${styles['btn']} ${styles['btn-sm']} ${styles['btn-outline']}`}
										onClick={() => onResetPassword(admin.id)}
										title="Đặt lại mật khẩu"
									>
										<Key size={16} />
									</button>
									<button
										className={`${styles['btn']} ${styles['btn-sm']} ${styles['btn-outline']}`}
										onClick={() => onToggleTwoFactor(admin.id)}
										title={admin.isTwoFactorEnabled ? 'Tắt 2FA' : 'Bật 2FA'}
									>
										<Shield size={16} />
									</button>
									{admin.status === 'active' ? (
										<button
											className={`${styles['btn']} ${styles['btn-sm']} ${styles['btn-outline']} ${styles['btn-warning']}`}
											onClick={() => onToggleStatus(admin.id, 'suspended')}
											title="Tạm dừng"
										>
											<Pause size={16} />
										</button>
									) : admin.status === 'suspended' ? (
										<button
											className={`${styles['btn']} ${styles['btn-sm']} ${styles['btn-outline']} ${styles['btn-success']}`}
											onClick={() => onToggleStatus(admin.id, 'active')}
											title="Kích hoạt"
										>
											<Play size={16} />
										</button>
									) : null}
									<button
										className={`${styles['btn']} ${styles['btn-sm']} ${styles['btn-outline']} ${styles['btn-danger']}`}
										onClick={() => onDeleteAdmin(admin.id)}
										title="Xóa"
									>
										<Trash2 size={16} />
									</button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

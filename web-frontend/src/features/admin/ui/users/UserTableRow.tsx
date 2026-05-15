import React from 'react'
import Badge from '@/features/admin/ui/common/Badge'
import UserActions from './UserActions'
import { User } from '@/types/user'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface UserTableRowProps {
	user: User
	onEdit: (user: User) => void
	onDelete: (user: User) => void
	onToggleStatus: (user: User) => void
}

export default function UserTableRow({
	user,
	onEdit,
	onDelete,
	onToggleStatus
}: UserTableRowProps): JSX.Element {
	
	const getRoleBadgeVariant = (role: string) => {
		switch (role) {
			case 'admin': return 'danger'
			case 'teacher': return 'info'
			case 'student': return 'success'
			default: return 'secondary'
		}
	}

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case 'active': return 'success'
			case 'inactive': return 'warning'
			case 'suspended': return 'danger'
			default: return 'secondary'
		}
	}

	const getRoleLabel = (role: string) => {
		switch (role) {
			case 'admin': return 'Quản trị viên'
			case 'teacher': return 'Giảng viên'
			case 'student': return 'Học viên'
			case 'user': return 'Người dùng'
			default: return role
		}
	}

	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'active': return 'Hoạt động'
			case 'inactive': return 'Bị khóa'
			case 'suspended': return 'Bị khóa'
			default: return status
		}
	}

	const formatLastLogin = (lastLogin?: string) => {
		if (!lastLogin) return 'Chưa đăng nhập'
		
		try {
			return formatDistanceToNow(new Date(lastLogin), { 
				addSuffix: true, 
				locale: vi 
			})
		} catch {
			return lastLogin
		}
	}

	return (
		<tr>
			<td>
				<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
					<img 
						src={user.avatar || 'https://placehold.co/40x40'} 
						alt={user.name}
						className="avatar"
					/>
					<div>
						<div style={{ fontWeight: 500 }}>{user.name}</div>
						<div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
							{user.email}
						</div>
					</div>
				</div>
			</td>
			<td>
				<Badge variant={getRoleBadgeVariant(user.role)}>
					{getRoleLabel(user.role)}
				</Badge>
			</td>
			<td>{user.phone || user.phoneNumber || '-'}</td>
			<td>
				<Badge variant={getStatusBadgeVariant(user.status)}>
					{getStatusLabel(user.status)}
				</Badge>
			</td>
			<td style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
				{formatLastLogin(user.lastLogin)}
			</td>
			<td>
				<UserActions
					user={user}
					onEdit={onEdit}
					onDelete={onDelete}
					onToggleStatus={onToggleStatus}
				/>
			</td>
		</tr>
	)
}


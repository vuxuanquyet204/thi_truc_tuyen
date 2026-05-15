import React from 'react'
import { Edit2, Trash2, Lock, Unlock } from 'lucide-react'
import { User } from '@/types/user'

interface UserActionsProps {
	user: User
	onEdit: (user: User) => void
	onDelete: (user: User) => void
	onToggleStatus: (user: User) => void
}

export default function UserActions({
	user,
	onEdit,
	onDelete,
	onToggleStatus
}: UserActionsProps): JSX.Element {
	
	return (
		<div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
			{/* Nút chỉnh sửa */}
			<button
				className="btn btn-sm btn-secondary"
				onClick={() => onEdit(user)}
				title="Chỉnh sửa"
			>
				<Edit2 size={16} />
			</button>

			{/* Nút khóa/mở khóa */}
			{/* Logic: status = 'active' → hiển thị Unlock (ổ khóa mở), status = 'inactive' → hiển thị Lock (ổ khóa đóng) */}
			<button
				className="btn btn-sm btn-secondary"
				onClick={() => onToggleStatus(user)}
				title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
			>
				{user.status === 'active' ? <Unlock size={16} /> : <Lock size={16} />}
			</button>

			{/* Nút xóa */}
			<button
				className="btn btn-sm btn-danger"
				onClick={() => onDelete(user)}
				title="Xóa"
			>
				<Trash2 size={16} />
			</button>
		</div>
	)
}


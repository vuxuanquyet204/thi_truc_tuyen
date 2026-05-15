import React from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import { User } from '@/types/user'
import '@/features/admin/ui/common/styles/modal-common.scss'

interface DeleteUserModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	user: User | null
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	user
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Xác nhận xóa người dùng"
			maxWidth="500px"
			footer={
				<>
					<button 
						className="btn btn-secondary"
						onClick={onClose}
					>
						Hủy
					</button>
					<button 
						className="btn btn-danger"
						onClick={onConfirm}
					>
						Xóa
					</button>
				</>
			}
		>
			<div style={{ 
				padding: '32px 36px',
				background: 'white'
			}}>
				<p style={{ 
					margin: 0, 
					fontSize: '16px', 
					lineHeight: '1.6', 
					color: '#1e293b',
					fontWeight: 400
				}}>
					Bạn có chắc chắn muốn xóa người dùng <strong style={{ fontWeight: 600, color: '#1e293b' }}>{user?.name}</strong>? 
					Hành động này không thể hoàn tác.
				</p>
			</div>
		</Modal>
	)
}

export default DeleteUserModal

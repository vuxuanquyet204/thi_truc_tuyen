import React, { useRef } from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import Button from '@/features/admin/ui/common/primitives/Button'
import { User } from 'lucide-react'
import { User as UserType } from '@/types/user'
import { toast } from '@/foundation/contexts/ToastContext'

interface AddUserModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (userData: Partial<UserType>) => void
}

const AddUserModal: React.FC<AddUserModalProps> = ({
	isOpen,
	onClose,
	onSave
}) => {
	const formRef = useRef<HTMLFormElement>(null)

	const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		if (formRef.current) {
			const formData = new FormData(formRef.current)
			const userData = {
				name: formData.get('name') as string,
				email: formData.get('email') as string,
				phone: formData.get('phone') as string || '',
				role: formData.get('role') as any,
				status: 'active' as const
			}
			if (userData.name && userData.email) {
				onSave(userData)
			} else {
				toast.error('Vui lòng điền đầy đủ họ tên và email')
			}
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Thêm người dùng mới"
			maxWidth="550px"
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Hủy
					</Button>
					<Button variant="primary" onClick={handleSubmit}>
						Thêm người dùng
					</Button>
				</>
			}
		>
			<div className="modal-content-wrapper">
				<form ref={formRef}>
					<div className="modal-form-section">
						<div className="section-title">
							<User />
							<h4>Thông tin cơ bản</h4>
						</div>
						
						<div className="modal-form-group">
							<label className="form-label">
								<User />
								Họ và tên <span className="required">*</span>
							</label>
							<input
								type="text"
								name="name"
								className="form-input"
								placeholder="Nhập họ và tên"
								required
							/>
						</div>

						<div className="modal-form-group">
							<label className="form-label">
								<User />
								Email <span className="required">*</span>
							</label>
							<input
								type="email"
								name="email"
								className="form-input"
								placeholder="Nhập địa chỉ email"
								required
							/>
						</div>

						<div className="modal-form-row">
							<div className="modal-form-group">
								<label className="form-label">
									<User />
									Số điện thoại
								</label>
								<input
									type="tel"
									name="phone"
									className="form-input"
									placeholder="Nhập số điện thoại"
								/>
							</div>

							<div className="modal-form-group">
								<label className="form-label">
									<User />
									Vai trò
								</label>
								<select
									name="role"
									className="form-select"
									defaultValue="student"
								>
									<option value="admin">Quản trị viên</option>
									<option value="teacher">Giảng viên</option>
									<option value="student">Học viên</option>
									<option value="user">Người dùng</option>
								</select>
							</div>
						</div>
					</div>
				</form>
			</div>
		</Modal>
	)
}

export default AddUserModal

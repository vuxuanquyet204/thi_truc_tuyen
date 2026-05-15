import React from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import { FileDown } from 'lucide-react'
import { User } from '@/types/user'

interface ImportUserModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	onDownloadTemplate: () => void
	importFile: File | null
	importPreview: Partial<User>[]
}

const ImportUserModal: React.FC<ImportUserModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	onDownloadTemplate,
	importFile,
	importPreview
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Xem trước dữ liệu nhập"
			maxWidth="800px"
			footer={
				<>
					<button 
						className="btn btn-secondary"
						onClick={onDownloadTemplate}
					>
						<FileDown size={18} />
						Tải mẫu Excel
					</button>
					<button 
						className="btn btn-secondary"
						onClick={onClose}
					>
						Hủy
					</button>
					<button 
						className="btn btn-primary"
						onClick={onConfirm}
						disabled={importPreview.length === 0}
					>
						Nhập {importPreview.length} người dùng
					</button>
				</>
			}
		>
			<div>
				<p style={{ marginBottom: '16px', color: 'var(--muted-foreground)' }}>
					Đã tìm thấy <strong>{importPreview.length}</strong> người dùng hợp lệ từ file <strong>{importFile?.name}</strong>
				</p>

				{importPreview.length > 0 ? (
					<div style={{ maxHeight: '400px', overflowY: 'auto' }}>
						<table className="admin-table">
							<thead>
								<tr>
									<th>Họ và tên</th>
									<th>Email</th>
									<th>Vai trò</th>
								</tr>
							</thead>
							<tbody>
								{importPreview.map((user, index) => (
									<tr key={index}>
										<td>{user.name}</td>
										<td>{user.email}</td>
										<td>
											<span className="badge badge-info">
												{user.role === 'admin' ? 'Quản trị viên' :
												 user.role === 'teacher' ? 'Giảng viên' :
												 user.role === 'student' ? 'Học viên' : 'Người dùng'}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="admin-table-empty">
						<div className="admin-table-empty-icon">⚠️</div>
						<div className="admin-table-empty-text">
							Không tìm thấy dữ liệu hợp lệ trong file
						</div>
					</div>
				)}
			</div>
		</Modal>
	)
}

export default ImportUserModal

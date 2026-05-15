import React from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from '@/features/admin/ui/common/Modal'

interface DeleteExamModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	exam: any
}

const DeleteExamModal: React.FC<DeleteExamModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	exam
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Xác nhận xóa đề thi"
			maxWidth="520px"
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
			<div className="modal-content-wrapper">
				<div className="modal-confirmation-card danger">
					<div className="modal-confirmation-icon">
						<AlertTriangle size={28} strokeWidth={2.4} />
					</div>
					<div className="modal-confirmation-content">
						<h3>Xóa đề thi</h3>
						<p className="modal-confirmation-message">
							Bạn có chắc chắn muốn xóa đề thi{' '}
							<span className="modal-confirmation-highlight">
								{exam?.title ?? 'này'}
							</span>
							?
						</p>
						<p className="modal-confirmation-subtext">
							Hành động này không thể hoàn tác. Vui lòng kiểm tra kỹ trước khi tiếp tục.
						</p>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default DeleteExamModal

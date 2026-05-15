import React from 'react'
import { FileDown } from 'lucide-react'
import Modal from '@/features/admin/ui/common/Modal'

interface ImportExamModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirmImport: () => void
	onDownloadTemplate: () => void
	importFile: File | null
	importPreview: Partial<any>[]
}

const ImportExamModal: React.FC<ImportExamModalProps> = ({
	isOpen,
	onClose,
	onConfirmImport,
	onDownloadTemplate,
	importFile,
	importPreview
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Xem trước dữ liệu nhập"
			maxWidth="900px"
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
						onClick={onConfirmImport}
						disabled={importPreview.length === 0}
					>
						Nhập {importPreview.length} đề thi
					</button>
				</>
			}
		>
			<div>
				<p style={{ marginBottom: '16px', color: 'var(--muted-foreground)' }}>
					Đã tìm thấy <strong>{importPreview.length}</strong> đề thi hợp lệ từ file <strong>{importFile?.name}</strong>
				</p>

				{importPreview.length > 0 ? (
					<div style={{ maxHeight: '500px', overflowY: 'auto' }}>
						<table className="admin-table">
							<thead>
								<tr>
									<th>Tiêu đề</th>
									<th>Môn học</th>
									<th>Loại</th>
									<th>Số câu</th>
									<th>Thời gian</th>
									<th>Độ khó</th>
								</tr>
							</thead>
							<tbody>
								{importPreview.map((exam, index) => (
									<tr key={index}>
										<td>{exam.title}</td>
										<td>{exam.subject}</td>
										<td>
											<span className="badge badge-info">
												{exam.type === 'practice' ? 'Luyện tập' :
												 exam.type === 'quiz' ? 'Kiểm tra' :
												 exam.type === 'midterm' ? 'Giữa kỳ' :
												 exam.type === 'final' ? 'Cuối kỳ' : 'Bài tập'}
											</span>
										</td>
										<td>{exam.totalQuestions} câu</td>
										<td>{exam.duration} phút</td>
										<td>
											<span className={`badge badge-${
												exam.difficulty === 'easy' ? 'success' :
												exam.difficulty === 'medium' ? 'warning' : 'danger'
											}`}>
												{exam.difficulty === 'easy' ? 'Dễ' :
												 exam.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
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
						<div style={{ marginTop: '12px' }}>
							<button
								className="btn btn-secondary"
								onClick={onDownloadTemplate}
							>
								<FileDown size={18} />
								Tải mẫu Excel
							</button>
						</div>
					</div>
				)}
			</div>
		</Modal>
	)
}

export default ImportExamModal

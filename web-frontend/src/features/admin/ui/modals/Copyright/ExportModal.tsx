import React from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import { Download } from 'lucide-react'
import { AdminDocument } from '@/features/admin/hooks'

interface ExportModalProps {
	isOpen: boolean
	onClose: () => void
	onExportDocuments: (documents: AdminDocument[]) => Promise<void>
	documents: AdminDocument[]
	isExporting: boolean
}

const ExportModal: React.FC<ExportModalProps> = ({
	isOpen,
	onClose,
	onExportDocuments,
	documents,
	isExporting
}) => {
	const handleExport = (format: string) => {
		onExportDocuments(documents)
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Xuất dữ liệu"
		>
			<div className="modal-content-wrapper">
				<div className="modal-selection-grid">
					<div className="modal-selection-card" onClick={() => handleExport('excel')}>
						<div className="card-icon">
							<Download />
						</div>
						<div className="card-title">Excel (.xlsx)</div>
						<div className="card-description">Xuất dữ liệu dạng bảng tính Excel</div>
					</div>
					<div className="modal-selection-card" onClick={() => handleExport('csv')}>
						<div className="card-icon">
							<Download />
						</div>
						<div className="card-title">CSV (.csv)</div>
						<div className="card-description">Xuất dữ liệu dạng CSV</div>
					</div>
					<div className="modal-selection-card" onClick={() => handleExport('json')}>
						<div className="card-icon">
							<Download />
						</div>
						<div className="card-title">JSON (.json)</div>
						<div className="card-description">Xuất dữ liệu dạng JSON</div>
					</div>
				</div>

				<div className="modal-export-info">
					<div className="export-title">
						<Download />
						<h4>Tùy chọn xuất</h4>
					</div>
					<ul className="export-list">
						<li>Bao gồm metadata</li>
						<li>Bao gồm lịch sử xác minh</li>
						<li>Bao gồm tranh chấp</li>
						<li>Tên file tự động với ngày xuất</li>
					</ul>
				</div>
			</div>
		</Modal>
	)
}

export default ExportModal

import React from 'react'
import { FileText, Download } from 'lucide-react'
import Modal from '@/features/admin/ui/common/Modal'

interface ExportModalProps {
	isOpen: boolean
	onClose: () => void
	onExport: (format: 'excel' | 'pdf' | 'csv' | 'json') => Promise<void>
	isExporting: boolean
}

const ExportModal: React.FC<ExportModalProps> = ({
	isOpen,
	onClose,
	onExport,
	isExporting
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Xuất dữ liệu"
		>
			<div className="modal-content-wrapper">
				<div className="modal-selection-grid">
					<div className="modal-selection-card" onClick={() => onExport('excel')}>
						<div className="card-icon">
							<FileText />
						</div>
						<div className="card-title">Excel (.xlsx)</div>
						<div className="card-description">Xuất báo cáo dạng Excel</div>
					</div>
					<div className="modal-selection-card" onClick={() => onExport('pdf')}>
						<div className="card-icon">
							<FileText />
						</div>
						<div className="card-title">PDF (.pdf)</div>
						<div className="card-description">Xuất báo cáo dạng PDF</div>
					</div>
					<div className="modal-selection-card" onClick={() => onExport('csv')}>
						<div className="card-icon">
							<Download />
						</div>
						<div className="card-title">CSV (.csv)</div>
						<div className="card-description">Xuất dữ liệu dạng CSV</div>
					</div>
					<div className="modal-selection-card" onClick={() => onExport('json')}>
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
						<li>Bao gồm biểu đồ</li>
						<li>Bao gồm KPI</li>
						<li>Bao gồm bảng xếp hạng</li>
						<li>Tự động format theo tiếng Việt</li>
					</ul>
				</div>
			</div>
		</Modal>
	)
}

export default ExportModal

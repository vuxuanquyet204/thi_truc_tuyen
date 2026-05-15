import React from 'react'
import { Printer, FileText } from 'lucide-react'
import Modal from '@/features/admin/ui/common/Modal'

interface PrintModalProps {
	isOpen: boolean
	onClose: () => void
}

const PrintModal: React.FC<PrintModalProps> = ({
	isOpen,
	onClose
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="In báo cáo"
		>
			<div className="print-content">
				<div className="print-section">
					<h4>Tùy chọn in</h4>
					<div className="print-options">
						<label className="print-option">
							<span>Trang hiện tại</span>
							<input type="radio" name="print-range" defaultChecked />
						</label>
						<label className="print-option">
							<span>Tất cả các tab</span>
							<input type="radio" name="print-range" />
						</label>
						<label className="print-option">
							<span>Chỉ KPI và biểu đồ</span>
							<input type="radio" name="print-range" />
						</label>
					</div>
				</div>
				<div className="print-section">
					<h4>Định dạng</h4>
					<div className="print-format">
						<label className="print-option">
							<span>Khổ A4</span>
							<input type="radio" name="print-format" defaultChecked />
						</label>
						<label className="print-option">
							<span>Khổ A3</span>
							<input type="radio" name="print-format" />
						</label>
						<label className="print-option">
							<span>Khổ Letter</span>
							<input type="radio" name="print-format" />
						</label>
					</div>
				</div>
				<div className="print-actions">
					<button className="btn btn-primary">
						<Printer className="w-4 h-4" />
						In ngay
					</button>
					<button className="btn btn-secondary">
						<FileText className="w-4 h-4" />
						Xuất PDF để in
					</button>
				</div>
			</div>
		</Modal>
	)
}

export default PrintModal

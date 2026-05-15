import React from 'react'
import { Database, Settings } from 'lucide-react'
import Modal from '@/features/admin/ui/common/Modal'

interface DatabaseModalProps {
	isOpen: boolean
	onClose: () => void
}

const DatabaseModal: React.FC<DatabaseModalProps> = ({
	isOpen,
	onClose
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Đồng bộ cơ sở dữ liệu"
		>
			<div className="database-content">
				<div className="database-section">
					<h4>Trạng thái đồng bộ</h4>
					<div className="sync-status">
						<div className="status-item">
							<span>Lần đồng bộ cuối:</span>
							<span>2 phút trước</span>
						</div>
						<div className="status-item">
							<span>Trạng thái:</span>
							<span className="status-connected">Đã kết nối</span>
						</div>
						<div className="status-item">
							<span>Dữ liệu chưa đồng bộ:</span>
							<span>0 bản ghi</span>
						</div>
					</div>
				</div>
				<div className="database-section">
					<h4>Tùy chọn đồng bộ</h4>
					<div className="sync-options">
						<label className="sync-option">
							<input type="checkbox" defaultChecked />
							<span>Đồng bộ tự động mỗi 5 phút</span>
						</label>
						<label className="sync-option">
							<input type="checkbox" defaultChecked />
							<span>Đồng bộ khi có thay đổi</span>
						</label>
						<label className="sync-option">
							<input type="checkbox" />
							<span>Đồng bộ dữ liệu lịch sử</span>
						</label>
					</div>
				</div>
				<div className="database-actions">
					<button className="btn btn-primary">
						<Database className="w-4 h-4" />
						Đồng bộ ngay
					</button>
					<button className="btn btn-secondary">
						<Settings className="w-4 h-4" />
						Cài đặt nâng cao
					</button>
				</div>
			</div>
		</Modal>
	)
}

export default DatabaseModal

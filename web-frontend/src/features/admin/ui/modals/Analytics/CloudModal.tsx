import React from 'react'
import { Cloud, Settings } from 'lucide-react'
import Modal from '@/features/admin/ui/common/Modal'

interface CloudModalProps {
	isOpen: boolean
	onClose: () => void
}

const CloudModal: React.FC<CloudModalProps> = ({
	isOpen,
	onClose
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Đồng bộ đám mây"
		>
			<div className="cloud-content">
				<div className="cloud-section">
					<h4>Dịch vụ đám mây</h4>
					<div className="cloud-services">
						<label className="cloud-service">
							<input type="radio" name="cloud-service" defaultChecked />
							<span>Google Drive</span>
						</label>
						<label className="cloud-service">
							<input type="radio" name="cloud-service" />
							<span>Dropbox</span>
						</label>
						<label className="cloud-service">
							<input type="radio" name="cloud-service" />
							<span>OneDrive</span>
						</label>
					</div>
				</div>
				<div className="cloud-section">
					<h4>Tùy chọn đồng bộ</h4>
					<div className="cloud-options">
						<label className="cloud-option">
							<input type="checkbox" defaultChecked />
							<span>Đồng bộ báo cáo hàng ngày</span>
						</label>
						<label className="cloud-option">
							<input type="checkbox" defaultChecked />
							<span>Đồng bộ dữ liệu thô</span>
						</label>
						<label className="cloud-option">
							<input type="checkbox" />
							<span>Nén dữ liệu trước khi tải lên</span>
						</label>
					</div>
				</div>
				<div className="cloud-actions">
					<button className="btn btn-primary">
						<Cloud className="w-4 h-4" />
						Đồng bộ ngay
					</button>
					<button className="btn btn-secondary">
						<Settings className="w-4 h-4" />
						Cài đặt tài khoản
					</button>
				</div>
			</div>
		</Modal>
	)
}

export default CloudModal

import React from 'react'
import { Save, RefreshCw, Settings, BarChart3, Eye, AlertTriangle, Lightbulb, Zap, Grid3X3, Info } from 'lucide-react'
import Modal from '@/features/admin/ui/common/Modal'

interface SettingsModalProps {
	isOpen: boolean
	onClose: () => void
	isRealTimeEnabled: boolean
	onRealTimeToggle: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({
	isOpen,
	onClose,
	isRealTimeEnabled,
	onRealTimeToggle
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Cài đặt Analytics"
			footer={
				<>
					<button
						type="button"
						className="btn btn-secondary"
						onClick={onClose}
					>
						<RefreshCw size={18} />
						Đặt lại mặc định
					</button>
					<button
						type="button"
						className="btn btn-primary"
					>
						<Save size={18} />
						Lưu cài đặt
					</button>
				</>
			}
		>
			<div className="modal-content-wrapper">
				<div className="modal-form-section">
					<div className="section-title">
						<Eye />
						<h4>Cài đặt hiển thị</h4>
					</div>
					
					<div className="modal-checkbox-group">
						<div className="checkbox-item">
							<label className="checkbox-label">
								<input 
									type="checkbox" 
									checked={isRealTimeEnabled} 
									onChange={onRealTimeToggle} 
								/>
								<span>Tự động làm mới dữ liệu</span>
							</label>
						</div>
						<div className="checkbox-item">
							<label className="checkbox-label">
								<input type="checkbox" defaultChecked />
								<span>Hiển thị cảnh báo</span>
							</label>
						</div>
						<div className="checkbox-item">
							<label className="checkbox-label">
								<input type="checkbox" defaultChecked />
								<span>Hiển thị insights</span>
							</label>
						</div>
					</div>
				</div>
				
				<div className="modal-form-section">
					<div className="section-title">
						<BarChart3 />
						<h4>Cài đặt biểu đồ</h4>
					</div>
					
					<div className="modal-checkbox-group">
						<div className="checkbox-item">
							<label className="checkbox-label">
								<input type="checkbox" defaultChecked />
								<span>Hiệu ứng animation</span>
							</label>
						</div>
						<div className="checkbox-item">
							<label className="checkbox-label">
								<input type="checkbox" defaultChecked />
								<span>Hiển thị grid</span>
							</label>
						</div>
						<div className="checkbox-item">
							<label className="checkbox-label">
								<input type="checkbox" defaultChecked />
								<span>Hiển thị legend</span>
							</label>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default SettingsModal

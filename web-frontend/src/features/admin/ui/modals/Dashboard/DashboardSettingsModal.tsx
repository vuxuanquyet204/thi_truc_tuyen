import React from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import { Settings, Clock, RefreshCw, Eye, BarChart3 } from 'lucide-react'

interface DashboardSettingsModalProps {
	isOpen: boolean
	onClose: () => void
	settings: any
	onUpdateSettings: (key: string, value: any) => void
}

const DashboardSettingsModal: React.FC<DashboardSettingsModalProps> = ({
	isOpen,
	onClose,
	settings,
	onUpdateSettings
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Cài đặt Dashboard"
			maxWidth="500px"
		>
			<div className="modal-content-wrapper">
				<div className="modal-form-section">
					<div className="section-title">
						<Clock />
						<h4>Cài đặt thời gian</h4>
					</div>
					
					<div className="modal-form-group">
						<label className="form-label">
							<Clock />
							Khoảng thời gian làm mới (giây)
						</label>
						<input
							type="number"
							value={settings.refreshInterval}
							onChange={(e) => onUpdateSettings('refreshInterval', parseInt(e.target.value))}
							min="10"
							max="300"
							className="form-input"
						/>
						<small>Khoảng thời gian từ 10-300 giây</small>
					</div>
				</div>

				<div className="modal-form-section">
					<div className="section-title">
						<RefreshCw />
						<h4>Tùy chọn làm mới</h4>
					</div>
					
					<div className="modal-checkbox-group">
						<div className="checkbox-item">
							<input
								type="checkbox"
								id="autoRefresh"
								checked={settings.autoRefresh}
								onChange={(e) => onUpdateSettings('autoRefresh', e.target.checked)}
							/>
							<label htmlFor="autoRefresh">Tự động làm mới</label>
						</div>
					</div>
				</div>

				<div className="modal-form-section">
					<div className="section-title">
						<Eye />
						<h4>Hiển thị</h4>
					</div>
					
					<div className="modal-checkbox-group">
						<div className="checkbox-item">
							<input
								type="checkbox"
								id="showCharts"
								checked={settings.showCharts}
								onChange={(e) => onUpdateSettings('showCharts', e.target.checked)}
							/>
							<label htmlFor="showCharts">Hiển thị biểu đồ</label>
						</div>
						<div className="checkbox-item">
							<input
								type="checkbox"
								id="showActivities"
								checked={settings.showActivities}
								onChange={(e) => onUpdateSettings('showActivities', e.target.checked)}
							/>
							<label htmlFor="showActivities">Hiển thị hoạt động</label>
						</div>
					</div>
				</div>

				<div className="modal-form-section">
					<div className="section-title">
						<BarChart3 />
						<h4>Cài đặt biểu đồ</h4>
					</div>
					
					<div className="modal-form-group">
						<label className="form-label">
							<BarChart3 />
							Loại biểu đồ
						</label>
						<select
							value={settings.chartType}
							onChange={(e) => onUpdateSettings('chartType', e.target.value)}
							className="form-select"
						>
							<option value="line">Đường</option>
							<option value="bar">Cột</option>
							<option value="pie">Tròn</option>
							<option value="doughnut">Vòng tròn</option>
						</select>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default DashboardSettingsModal

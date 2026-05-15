import React from 'react'
import Modal from '@/features/admin/ui/common/Modal'

interface KpiDetailModalProps {
	isOpen: boolean
	onClose: () => void
	kpi: any
}

const KpiDetailModal: React.FC<KpiDetailModalProps> = ({
	isOpen,
	onClose,
	kpi
}) => {
	if (!kpi) return null

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`Chi tiết ${kpi.name}`}
		>
			<div className="kpi-detail">
				<div className="kpi-detail-header">
					<h3>{kpi.name}</h3>
					<p>{kpi.description}</p>
				</div>
				<div className="kpi-detail-content">
					<div className="detail-item">
						<label>Giá trị hiện tại:</label>
						<span className="detail-value">
							{kpi.value.toLocaleString('vi-VN')} {kpi.unit}
						</span>
					</div>
					<div className="detail-item">
						<label>Thay đổi:</label>
						<span className={`detail-change change-${kpi.changeType}`}>
							{kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
						</span>
					</div>
					<div className="detail-item">
						<label>Khoảng thời gian:</label>
						<span className="detail-period">{kpi.period}</span>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default KpiDetailModal

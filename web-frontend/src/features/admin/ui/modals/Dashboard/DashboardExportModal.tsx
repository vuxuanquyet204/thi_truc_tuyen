import React from 'react'
import { FileSpreadsheet, BarChart3, TrendingUp, BookOpen, Activity, Users, CheckCircle, Table } from 'lucide-react'
import Modal from '@/features/admin/ui/common/Modal'

interface DashboardExportModalProps {
	isOpen: boolean
	onClose: () => void
	onExportComplete: () => void
	onExportStats: () => void
	onExportUserGrowth: () => void
	onExportCategories: () => void
	onExportActivities: () => void
	onExportPerformers: () => void
	onExportSystemHealth: () => void
}

const DashboardExportModal: React.FC<DashboardExportModalProps> = ({
	isOpen,
	onClose,
	onExportComplete,
	onExportStats,
	onExportUserGrowth,
	onExportCategories,
	onExportActivities,
	onExportPerformers,
	onExportSystemHealth
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Xuất dữ liệu Excel"
			maxWidth="600px"
		>
			<div className="modal-content-wrapper">
				<div className="modal-detail-section">
					<div className="section-title">
						<FileSpreadsheet />
						<h4>Chọn loại dữ liệu xuất</h4>
					</div>
					<p style={{ color: 'var(--muted-foreground)', margin: '0 0 20px 0', fontSize: '15px' }}>
						Chọn loại dữ liệu bạn muốn xuất ra file Excel:
					</p>
				</div>

				<div className="modal-selection-grid">
					<div className="modal-selection-card" onClick={onExportComplete}>
						<div className="card-icon">
							<FileSpreadsheet />
						</div>
						<div className="card-title">Dashboard hoàn chỉnh</div>
						<div className="card-description">Tất cả dữ liệu trong 1 file</div>
					</div>

					<div className="modal-selection-card" onClick={onExportStats}>
						<div className="card-icon">
							<BarChart3 />
						</div>
						<div className="card-title">Thống kê tổng quan</div>
						<div className="card-description">8 chỉ số chính</div>
					</div>

					<div className="modal-selection-card" onClick={onExportUserGrowth}>
						<div className="card-icon">
							<TrendingUp />
						</div>
						<div className="card-title">Tăng trưởng người dùng</div>
						<div className="card-description">30 ngày gần nhất</div>
					</div>

					<div className="modal-selection-card" onClick={onExportCategories}>
						<div className="card-icon">
							<BookOpen />
						</div>
						<div className="card-title">Danh mục khóa học</div>
						<div className="card-description">8 danh mục</div>
					</div>

					<div className="modal-selection-card" onClick={onExportActivities}>
						<div className="card-icon">
							<Activity />
						</div>
						<div className="card-title">Hoạt động gần đây</div>
						<div className="card-description">10 hoạt động mới nhất</div>
					</div>

					<div className="modal-selection-card" onClick={onExportPerformers}>
						<div className="card-icon">
							<Users />
						</div>
						<div className="card-title">Top Performers</div>
						<div className="card-description">5 người xuất sắc nhất</div>
					</div>

					<div className="modal-selection-card" onClick={onExportSystemHealth}>
						<div className="card-icon">
							<CheckCircle />
						</div>
						<div className="card-title">Tình trạng hệ thống</div>
						<div className="card-description">Health & Alerts</div>
					</div>
				</div>

				<div className="modal-export-info">
					<div className="export-title">
						<Table />
						<h4>Thông tin xuất file</h4>
					</div>
					<ul className="export-list">
						<li>File Excel (.xlsx) với nhiều sheet</li>
						<li>Tên file tự động với ngày xuất</li>
						<li>Dữ liệu được format theo tiếng Việt</li>
						<li>Hỗ trợ mở bằng Excel, Google Sheets</li>
					</ul>
				</div>
			</div>
		</Modal>
	)
}

export default DashboardExportModal

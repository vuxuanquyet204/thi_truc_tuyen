import React from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import Badge from '@/features/admin/ui/common/Badge'
import { Shield, Activity, TrendingUp, Clock, Database, Cpu, HardDrive, Info, Package, Settings } from 'lucide-react'

interface ModuleDetailModalProps {
	isOpen: boolean
	onClose: () => void
	module: any
}

const ModuleDetailModal: React.FC<ModuleDetailModalProps> = ({
	isOpen,
	onClose,
	module
}) => {
	if (!module) return null

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active': return 'success'
			case 'warning': return 'warning'
			case 'error': return 'danger'
			case 'maintenance': return 'secondary'
			case 'offline': return 'danger'
			default: return 'secondary'
		}
	}

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'active': return <Shield size={16} />
			case 'warning': return <Activity size={16} />
			case 'error': return <Activity size={16} />
			case 'maintenance': return <Clock size={16} />
			case 'offline': return <Activity size={16} />
			default: return <Activity size={16} />
		}
	}

	const formatNumber = (num: number) => {
		return num.toLocaleString('vi-VN')
	}

	const formatBytes = (bytes: number) => {
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
		if (bytes === 0) return '0 Bytes'
		const i = Math.floor(Math.log(bytes) / Math.log(1024))
		return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`Chi tiết Module: ${module.name}`}
			maxWidth="800px"
		>
			<div className="modal-content-wrapper">
				{/* Module Overview */}
				<div className="modal-info-card">
					<div className="card-icon">
						<Shield />
					</div>
					<div className="card-content">
						<div className="card-title">{module.name}</div>
						<div className="card-description">{module.description}</div>
					</div>
					<div className="card-meta">
						<Badge variant={getStatusColor(module.status)}>
							{getStatusIcon(module.status)}
							<span style={{ marginLeft: '6px' }}>
								{module.status === 'active' ? 'Hoạt động' :
								 module.status === 'warning' ? 'Cảnh báo' :
								 module.status === 'error' ? 'Lỗi' :
								 module.status === 'maintenance' ? 'Bảo trì' :
								 module.status === 'offline' ? 'Offline' : module.status}
							</span>
						</Badge>
					</div>
				</div>

				{/* Performance Metrics */}
				<div className="modal-detail-section">
					<div className="section-title">
						<TrendingUp />
						<h4>Hiệu suất & Thống kê</h4>
					</div>
					<div className="modal-info-grid">
						<div className="modal-info-card">
							<div className="card-icon" style={{ background: '#3b82f6' }}>
								<Database />
							</div>
							<div className="card-title">Điểm bảo mật</div>
							<div className="card-value" style={{ color: '#3b82f6' }}>
								{module.securityScore}/100
							</div>
						</div>

						<div className="modal-info-card">
							<div className="card-icon" style={{ background: '#10b981' }}>
								<Activity />
							</div>
							<div className="card-title">Giao dịch hôm nay</div>
							<div className="card-value" style={{ color: '#10b981' }}>
								{formatNumber(module.todayTransactions)}
							</div>
						</div>

						<div className="modal-info-card">
							<div className="card-icon" style={{ background: '#f59e0b' }}>
								<Clock />
							</div>
							<div className="card-title">Thời gian hoạt động</div>
							<div className="card-value" style={{ color: '#f59e0b' }}>
								{module.uptime}%
							</div>
						</div>

						<div className="modal-info-card">
							<div className="card-icon" style={{ background: '#8b5cf6' }}>
								<Cpu />
							</div>
							<div className="card-title">CPU Usage</div>
							<div className="card-value" style={{ color: '#8b5cf6' }}>
								{module.cpuUsage}%
							</div>
						</div>
					</div>
				</div>

				{/* Technical Details */}
				<div className="modal-detail-section">
					<div className="section-title">
						<HardDrive />
						<h4>Thông tin kỹ thuật</h4>
					</div>
					<div className="modal-info-pairs">
						<div className="modal-info-pair">
							<div className="info-label">
								<Info />
								Version
							</div>
							<div className="info-value">{module.version}</div>
						</div>
						
						<div className="modal-info-pair">
							<div className="info-label">
								<HardDrive />
								Memory Usage
							</div>
							<div className="info-value">{formatBytes(module.memoryUsage)}</div>
						</div>
						
						<div className="modal-info-pair">
							<div className="info-label">
								<Clock />
								Last Updated
							</div>
							<div className="info-value">{new Date(module.lastUpdated).toLocaleString('vi-VN')}</div>
						</div>
						
						<div className="modal-info-pair">
							<div className="info-label">
								<Settings />
								Environment
							</div>
							<div className="info-value">{module.environment}</div>
						</div>
					</div>
				</div>

				{/* Dependencies */}
				{module.dependencies && module.dependencies.length > 0 && (
					<div className="modal-detail-section">
						<div className="section-title">
							<Package />
							<h4>Dependencies</h4>
						</div>
						<div className="modal-export-info">
							{module.dependencies.map((dep: string, index: number) => (
								<div key={index} style={{ 
									fontSize: '12px',
									fontFamily: 'monospace',
									marginBottom: '4px',
									padding: '4px 8px',
									background: '#f8fafc',
									borderRadius: '6px',
									border: '1px solid #e2e8f0'
								}}>
									{dep}
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</Modal>
	)
}

export default ModuleDetailModal

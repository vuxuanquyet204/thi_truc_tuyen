import React from 'react'
import { SystemHealth, ServiceHealth, DatabaseHealth, HealthStatus } from '@/types/admin'
import {
	Server,
	Database,
	HardDrive,
	Network,
	Shield,
	Cpu,
	Activity,
	AlertTriangle,
	CheckCircle,
	XCircle,
	Clock,
	TrendingUp,
	TrendingDown,
	Minus
} from 'lucide-react'
import Badge from '@/features/admin/ui/common/Badge'
import styles from '@/pages/admin/AdminPage/AdminPage.module.css'

interface SystemHealthWidgetProps {
	systemHealth: SystemHealth
	onRefresh?: () => void
	loading?: boolean
}

export default function SystemHealthWidget({
	systemHealth,
	onRefresh,
	loading = false
}: SystemHealthWidgetProps): JSX.Element {
	const getStatusIcon = (status: HealthStatus) => {
		switch (status) {
			case 'healthy':
				return <CheckCircle size={16} className={styles['text-green']} />
			case 'warning':
				return <AlertTriangle size={16} className={styles['text-yellow']} />
			case 'critical':
				return <XCircle size={16} className={styles['text-red']} />
			default:
				return <Minus size={16} className={styles['text-gray']} />
		}
	}

	const getStatusColor = (status: HealthStatus) => {
		switch (status) {
			case 'healthy':
				return 'var(--success)'
			case 'warning':
				return 'var(--warning)'
			case 'critical':
				return 'var(--danger)'
			default:
				return 'var(--muted-foreground)'
		}
	}

	const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
		switch (trend) {
			case 'up':
				return <TrendingUp size={12} className={styles['text-green']} />
			case 'down':
				return <TrendingDown size={12} className={styles['text-red']} />
			default:
				return <Minus size={12} className={styles['text-gray']} />
		}
	}

	const formatBytes = (bytes: number) => {
		if (bytes >= 1000000000000) return `${(bytes / 1000000000000).toFixed(1)}TB`
		if (bytes >= 1000000000) return `${(bytes / 1000000000).toFixed(1)}GB`
		if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)}MB`
		if (bytes >= 1000) return `${(bytes / 1000).toFixed(1)}KB`
		return `${bytes}B`
	}

	const formatPercentage = (value: number) => {
		return `${value.toFixed(1)}%`
	}

	const formatUptime = (uptime: number) => {
		return `${uptime.toFixed(1)}%`
	}

	if (loading) {
		return (
			<div className={`${styles['system-health-widget']} ${styles['loading']}`}>
				<div className={styles['loading-spinner']}></div>
				<p>Đang tải thông tin hệ thống...</p>
			</div>
		)
	}

	return (
		<div className={styles['system-health-widget']}>
			<div className={styles['widget-header']}>
				<div className={styles['widget-title']}>
					<Activity size={20} />
					<span>Tình trạng Hệ thống</span>
				</div>
				<div className={styles['widget-actions']}>
					<Badge
						variant="secondary"
						style={{ backgroundColor: getStatusColor(systemHealth.overall) }}
					>
						{getStatusIcon(systemHealth.overall)}
						{systemHealth.overall.toUpperCase()}
					</Badge>
					{onRefresh && (
						<button
							className={styles['btn']}
							onClick={onRefresh}
							title="Làm mới"
						>
							<Clock size={14} />
						</button>
					)}
				</div>
			</div>

			<div className={styles['widget-content']}>
				<div className={styles['overall-status']}>
					<div className={styles['status-item']}>
						<span className={styles['status-label']}>Tổng quan:</span>
						<span className={styles['status-value']} style={{ color: getStatusColor(systemHealth.overall) }}>
							{systemHealth.overall === 'healthy' ? 'Khỏe mạnh' :
							 systemHealth.overall === 'warning' ? 'Cảnh báo' :
							 systemHealth.overall === 'critical' ? 'Nguy hiểm' : 'Không xác định'}
						</span>
					</div>
					<div className={styles['status-item']}>
						<span className={styles['status-label']}>Uptime:</span>
						<span className={styles['status-value']}>{formatUptime(systemHealth.uptime.current)}</span>
					</div>
					<div className={styles['status-item']}>
						<span className={styles['status-label']}>Cập nhật:</span>
						<span className={styles['status-value']}>
							{new Date(systemHealth.lastChecked).toLocaleTimeString('vi-VN')}
						</span>
					</div>
				</div>

				<div className={styles['services-section']}>
					<h4>Dịch vụ</h4>
					<div className={styles['services-grid']}>
						{systemHealth.services.map((service) => (
							<div key={service.name} className={styles['service-item']}>
								<div className={styles['service-header']}>
									<div className={styles['service-name']}>
										<Server size={14} />
										<span>{service.name}</span>
									</div>
									<Badge
										variant="secondary"
										style={{ backgroundColor: getStatusColor(service.status) }}
									>
										{getStatusIcon(service.status)}
									</Badge>
								</div>
								<div className={styles['service-details']}>
									<div className={styles['service-metric']}>
										<span>Uptime:</span>
										<span>{formatUptime(service.uptime)}</span>
									</div>
									<div className={styles['service-metric']}>
										<span>Response:</span>
										<span>{service.responseTime}ms</span>
									</div>
									<div className={styles['service-metric']}>
										<span>Errors:</span>
										<span>{service.errorRate}%</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className={styles['databases-section']}>
					<h4>Cơ sở dữ liệu</h4>
					<div className={styles['databases-grid']}>
						{systemHealth.databases.map((db) => (
							<div key={db.name} className={styles['database-item']}>
								<div className={styles['database-header']}>
									<div className={styles['database-name']}>
										<Database size={14} />
										<span>{db.name}</span>
									</div>
									<Badge
										variant="secondary"
										style={{ backgroundColor: getStatusColor(db.status) }}
									>
										{getStatusIcon(db.status)}
									</Badge>
								</div>
								<div className={styles['database-details']}>
									<div className={styles['database-metric']}>
										<span>Connections:</span>
										<span>{db.connections.active}/{db.connections.max}</span>
									</div>
									<div className={styles['database-metric']}>
										<span>Size:</span>
										<span>{formatBytes(db.size.current)}</span>
									</div>
									<div className={styles['database-metric']}>
										<span>Growth:</span>
										<span>{formatPercentage(db.size.growth)}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className={styles['storage-section']}>
					<h4>Lưu trữ</h4>
					<div className={styles['storage-item']}>
						<div className={styles['storage-header']}>
							<div className={styles['storage-name']}>
								<HardDrive size={14} />
								<span>Disk Usage</span>
							</div>
							<div className={styles['storage-percentage']}>
								{formatPercentage((systemHealth.storage.used / systemHealth.storage.total) * 100)}
							</div>
						</div>
						<div className={styles['storage-bar']}>
							<div
								className={styles['storage-bar-fill']}
								style={{
									width: `${(systemHealth.storage.used / systemHealth.storage.total) * 100}%`,
									backgroundColor: (systemHealth.storage.used / systemHealth.storage.total) > 0.8 ? 'var(--danger)' : 'var(--success)'
								}}
							></div>
						</div>
						<div className={styles['storage-details']}>
							<div className={styles['storage-metric']}>
								<span>Used:</span>
								<span>{formatBytes(systemHealth.storage.used)}</span>
							</div>
							<div className={styles['storage-metric']}>
								<span>Available:</span>
								<span>{formatBytes(systemHealth.storage.available)}</span>
							</div>
							<div className={styles['storage-metric']}>
								<span>Total:</span>
								<span>{formatBytes(systemHealth.storage.total)}</span>
							</div>
						</div>
					</div>
				</div>

				<div className={styles['performance-section']}>
					<h4>Hiệu suất</h4>
					<div className={styles['performance-grid']}>
						<div className={styles['performance-item']}>
							<div className={styles['performance-header']}>
								<Cpu size={14} />
								<span>CPU</span>
							</div>
							<div className={styles['performance-value']}>
								{formatPercentage(systemHealth.performance.cpu.usage)}
							</div>
							<div className={styles['performance-details']}>
								<span>{systemHealth.performance.cpu.cores} cores</span>
								<span>{systemHealth.performance.cpu.temperature}°C</span>
							</div>
						</div>
						<div className={styles['performance-item']}>
							<div className={styles['performance-header']}>
								<Activity size={14} />
								<span>Memory</span>
							</div>
							<div className={styles['performance-value']}>
								{formatPercentage((systemHealth.performance.memory.used / systemHealth.performance.memory.total) * 100)}
							</div>
							<div className={styles['performance-details']}>
								<span>{formatBytes(systemHealth.performance.memory.used)}</span>
								<span>{formatBytes(systemHealth.performance.memory.total)}</span>
							</div>
						</div>
						<div className={styles['performance-item']}>
							<div className={styles['performance-header']}>
								<TrendingUp size={14} />
								<span>Load</span>
							</div>
							<div className={styles['performance-value']}>
								{systemHealth.performance.load.average1m.toFixed(1)}
							</div>
							<div className={styles['performance-details']}>
								<span>1m: {systemHealth.performance.load.average1m.toFixed(1)}</span>
								<span>5m: {systemHealth.performance.load.average5m.toFixed(1)}</span>
								<span>15m: {systemHealth.performance.load.average15m.toFixed(1)}</span>
							</div>
						</div>
					</div>
				</div>

				<div className={styles['network-section']}>
					<h4>Mạng</h4>
					<div className={styles['network-item']}>
						<div className={styles['network-header']}>
							<Network size={14} />
							<span>Bandwidth</span>
						</div>
						<div className={styles['network-details']}>
							<div className={styles['network-metric']}>
								<span>Incoming:</span>
								<span>{systemHealth.network.bandwidth.incoming} Mbps</span>
							</div>
							<div className={styles['network-metric']}>
								<span>Outgoing:</span>
								<span>{systemHealth.network.bandwidth.outgoing} Mbps</span>
							</div>
							<div className={styles['network-metric']}>
								<span>Latency:</span>
								<span>{systemHealth.network.latency.average}ms</span>
							</div>
							<div className={styles['network-metric']}>
								<span>Connections:</span>
								<span>{systemHealth.network.connections.active}/{systemHealth.network.connections.max}</span>
							</div>
						</div>
					</div>
				</div>

				<div className={styles['security-section']}>
					<h4>Bảo mật</h4>
					<div className={styles['security-item']}>
						<div className={styles['security-header']}>
							<Shield size={14} />
							<span>Threats</span>
						</div>
						<div className={styles['security-details']}>
							<div className={styles['security-metric']}>
								<span>Blocked:</span>
								<span>{systemHealth.security.threats.blocked}</span>
							</div>
							<div className={styles['security-metric']}>
								<span>Detected:</span>
								<span>{systemHealth.security.threats.detected}</span>
							</div>
							<div className={styles['security-metric']}>
								<span>Resolved:</span>
								<span>{systemHealth.security.threats.resolved}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

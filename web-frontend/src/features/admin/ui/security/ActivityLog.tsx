import React from 'react'
import { ActivityLog as ActivityLogType } from '@/foundation/types/security'
import Badge from '@/features/admin/ui/common/Badge'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { 
	Activity, 
	Shield, 
	User, 
	AlertTriangle,
	CheckCircle,
	ExternalLink,
	Zap
} from 'lucide-react'
import '@/features/admin/ui/common/styles/table.css'

interface ActivityLogProps {
	activities: ActivityLogType[]
	onActivityClick?: (activity: ActivityLogType) => void
}

export default function ActivityLog({ activities, onActivityClick }: ActivityLogProps): JSX.Element {
	
	const getLogTypeIcon = (type: string) => {
		switch (type) {
			case 'transaction': return <Activity size={16} color="#3b82f6" />
			case 'contract_deploy': return <Shield size={16} color="#10b981" />
			case 'security_alert': return <AlertTriangle size={16} color="#f59e0b" />
			case 'user_action': return <User size={16} color="#8b5cf6" />
			case 'system_event': return <Zap size={16} color="#06b6d4" />
			case 'error': return <AlertTriangle size={16} color="#ef4444" />
			case 'audit': return <CheckCircle size={16} color="#10b981" />
			case 'upgrade': return <Shield size={16} color="#6366f1" />
			default: return <Activity size={16} color="#6b7280" />
		}
	}

	const getLogTypeLabel = (type: string) => {
		switch (type) {
			case 'transaction': return 'Giao dịch'
			case 'contract_deploy': return 'Triển khai hợp đồng'
			case 'security_alert': return 'Cảnh báo bảo mật'
			case 'user_action': return 'Hành động người dùng'
			case 'system_event': return 'Sự kiện hệ thống'
			case 'error': return 'Lỗi'
			case 'audit': return 'Kiểm toán'
			case 'upgrade': return 'Nâng cấp'
			default: return type
		}
	}

	const getSeverityBadgeVariant = (severity: string) => {
		switch (severity) {
			case 'info': return 'secondary'
			case 'warning': return 'warning'
			case 'error': return 'danger'
			case 'critical': return 'danger'
			default: return 'secondary'
		}
	}

	const getSeverityLabel = (severity: string) => {
		switch (severity) {
			case 'info': return 'Thông tin'
			case 'warning': return 'Cảnh báo'
			case 'error': return 'Lỗi'
			case 'critical': return 'Nghiêm trọng'
			default: return severity
		}
	}

	const getModuleLabel = (module: string) => {
		switch (module) {
			case 'anti-cheat': return 'Camera AI + Smart Contract'
			case 'copyright-protection': return 'Document Hash + Ethereum'
			case 'token-rewards': return 'ERC-20 + Learning Ecosystem'
			case 'multisig-wallet': return 'Multi-signature + Node.js'
			default: return module
		}
	}

	const formatTime = (timestamp: string) => {
		try {
			return formatDistanceToNow(new Date(timestamp), {
				addSuffix: true,
				locale: vi
			})
		} catch {
			return timestamp
		}
	}

	if (activities.length === 0) {
		return (
			<div className="admin-table-empty">
				<div className="admin-table-empty-icon">📝</div>
				<div className="admin-table-empty-text">Không có hoạt động nào được ghi nhận</div>
			</div>
		)
	}

	return (
		<div style={{ maxHeight: '600px', overflowY: 'auto' }}>
			<table className="admin-table">
				<thead>
					<tr>
						<th>Thời gian</th>
						<th>Module</th>
						<th>Loại</th>
						<th>Mô tả</th>
						<th>Mức độ</th>
						<th>Chi tiết</th>
					</tr>
				</thead>
				<tbody>
					{activities.map(activity => (
						<tr key={activity.id} onClick={() => onActivityClick?.(activity)} style={{ cursor: onActivityClick ? 'pointer' : 'default' }}>
							<td style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
								{formatTime(activity.timestamp)}
							</td>
							<td>
								<Badge variant="info" style={{ fontSize: '11px' }}>
									{getModuleLabel(activity.module)}
								</Badge>
							</td>
							<td>
								<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
									{getLogTypeIcon(activity.type)}
									<span style={{ fontSize: '13px' }}>
										{getLogTypeLabel(activity.type)}
									</span>
								</div>
							</td>
							<td style={{ fontSize: '13px', maxWidth: '300px' }}>
								<div style={{ 
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap'
								}}>
									{activity.message}
								</div>
							</td>
							<td>
								<Badge variant={getSeverityBadgeVariant(activity.severity)} style={{ fontSize: '11px' }}>
									{getSeverityLabel(activity.severity)}
								</Badge>
							</td>
							<td>
								<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
									{activity.transactionHash && (
										<div style={{ 
											display: 'flex', 
											alignItems: 'center', 
											gap: '4px',
											fontSize: '11px',
											color: 'var(--muted-foreground)',
											fontFamily: 'monospace'
										}}>
											<ExternalLink size={12} />
											{activity.transactionHash.slice(0, 8)}...
										</div>
									)}
									{activity.blockNumber && (
										<div style={{ 
											fontSize: '11px',
											color: 'var(--muted-foreground)'
										}}>
											#{activity.blockNumber}
										</div>
									)}
									{activity.gasUsed && (
										<div style={{ 
											fontSize: '11px',
											color: 'var(--muted-foreground)'
										}}>
											{activity.gasUsed.toLocaleString()} gas
										</div>
									)}
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

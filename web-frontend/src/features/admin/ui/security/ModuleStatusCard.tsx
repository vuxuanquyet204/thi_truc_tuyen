import React from 'react'
import { BlockchainModule } from '@/foundation/types/security'
import Badge from '@/features/admin/ui/common/Badge'
import { 
	Shield, 
	ShieldAlert, 
	ShieldCheck, 
	ShieldX,
	Activity,
	Users,
	DollarSign,
	Clock,
	AlertTriangle,
	CheckCircle,
	XCircle,
	ExternalLink
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface ModuleStatusCardProps {
	module: BlockchainModule
	onClick?: (module: BlockchainModule) => void
}

export default function ModuleStatusCard({ module, onClick }: ModuleStatusCardProps): JSX.Element {
	
	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'active': return <ShieldCheck size={20} color="#10b981" />
			case 'warning': return <ShieldAlert size={20} color="#f59e0b" />
			case 'error': return <ShieldX size={20} color="#ef4444" />
			case 'maintenance': return <Clock size={20} color="#6b7280" />
			case 'offline': return <XCircle size={20} color="#6b7280" />
			default: return <Shield size={20} color="#6b7280" />
		}
	}

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case 'active': return 'success'
			case 'warning': return 'warning'
			case 'error': return 'danger'
			case 'maintenance': return 'secondary'
			case 'offline': return 'secondary'
			default: return 'secondary'
		}
	}

	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'active': return 'Hoạt động'
			case 'warning': return 'Cảnh báo'
			case 'error': return 'Lỗi'
			case 'maintenance': return 'Bảo trì'
			case 'offline': return 'Offline'
			default: return status
		}
	}

	const getSecurityScoreColor = (score: number) => {
		if (score >= 90) return '#10b981'
		if (score >= 70) return '#f59e0b'
		return '#ef4444'
	}

	const getModuleTypeLabel = (type: string) => {
		switch (type) {
			case 'anti_cheat': return 'Camera AI + Smart Contract'
			case 'copyright_protection': return 'Document Hash + Ethereum'
			case 'token_rewards': return 'ERC-20 + Learning Ecosystem'
			case 'multisig_wallet': return 'Multi-signature + Node.js'
			default: return type
		}
	}

	const getBlockchainLabel = (blockchain: string) => {
		if (!blockchain || typeof blockchain !== 'string') return 'Unknown'
		switch (blockchain) {
			case 'ethereum': return 'Ethereum'
			case 'polygon': return 'Polygon'
			case 'bsc': return 'BSC'
			case 'local': return 'Local'
			default: return blockchain
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

	return (
		<div
			className="module-status-card"
			onClick={() => onClick?.(module)}
			style={{
				border: module.status === 'error' ? '2px solid #ef4444' :
						module.status === 'warning' ? '2px solid #f59e0b' : '1px solid var(--border)',
				cursor: onClick ? 'pointer' : 'default',
				transition: 'all var(--transition-normal)',
				position: 'relative'
			}}
			onMouseEnter={(e) => {
				if (onClick) {
					e.currentTarget.style.transform = 'translateY(-2px)'
					e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
				}
			}}
			onMouseLeave={(e) => {
				if (onClick) {
					e.currentTarget.style.transform = 'translateY(0)'
					e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
				}
			}}
		>
			{/* Header */}
			<div style={{ 
				display: 'flex', 
				justifyContent: 'space-between', 
				alignItems: 'flex-start',
				marginBottom: '16px'
			}}>
				<div style={{ flex: 1 }}>
					<div style={{ 
						display: 'flex', 
						alignItems: 'center', 
						gap: '12px',
						marginBottom: '8px'
					}}>
						{getStatusIcon(module.status)}
						<h3 style={{ 
							fontSize: '18px', 
							fontWeight: 600, 
							margin: 0,
							color: 'var(--foreground)'
						}}>
							{module.name}
						</h3>
					</div>
					<p style={{ 
						fontSize: '13px', 
						color: 'var(--muted-foreground)', 
						margin: '0 0 8px 0',
						lineHeight: 1.4
					}}>
						{module.description}
					</p>
					<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
						<Badge variant="info" style={{ fontSize: '11px' }}>
							{getBlockchainLabel(module.blockchain)}
						</Badge>
						<Badge variant={getStatusBadgeVariant(module.status)} style={{ fontSize: '11px' }}>
							{getStatusLabel(module.status)}
						</Badge>
						<Badge variant="secondary" style={{ fontSize: '11px' }}>
							{getModuleTypeLabel(module.type)}
						</Badge>
					</div>
				</div>
			</div>

			{/* Contract Address */}
			{module.contractAddress && (
				<div style={{ 
					marginBottom: '16px',
					padding: '8px 12px',
					background: 'var(--muted)',
					borderRadius: 'var(--radius-md)',
					fontSize: '12px',
					fontFamily: 'monospace',
					color: 'var(--muted-foreground)',
					display: 'flex',
					alignItems: 'center',
					gap: '8px'
				}}>
					<span style={{ fontWeight: 500 }}>Contract:</span>
					<span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
						{module.contractAddress}
					</span>
					<ExternalLink size={14} />
				</div>
			)}

			{/* Metrics Grid */}
			<div style={{ 
				display: 'grid',
				gridTemplateColumns: 'repeat(2, 1fr)',
				gap: '12px',
				marginBottom: '16px'
			}}>
				<div style={{ 
					padding: '12px',
					background: 'var(--background)',
					borderRadius: 'var(--radius-md)',
					border: '1px solid var(--border)'
				}}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
						<Activity size={16} color="#3b82f6" />
						<span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
							Giao dịch hôm nay
						</span>
					</div>
					<div style={{ fontSize: '20px', fontWeight: 700, color: '#3b82f6' }}>
						{module.todayTransactions.toLocaleString()}
					</div>
					<div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
						Tổng: {module.totalTransactions.toLocaleString()}
					</div>
				</div>

				<div style={{ 
					padding: '12px',
					background: 'var(--background)',
					borderRadius: 'var(--radius-md)',
					border: '1px solid var(--border)'
				}}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
						<Users size={16} color="#10b981" />
						<span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
							Người dùng hoạt động
						</span>
					</div>
					<div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>
						{module.activeUsers.toLocaleString()}
					</div>
				</div>

				<div style={{ 
					padding: '12px',
					background: 'var(--background)',
					borderRadius: 'var(--radius-md)',
					border: '1px solid var(--border)'
				}}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
						<DollarSign size={16} color="#f59e0b" />
						<span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
							Giá trị (ETH)
						</span>
					</div>
					<div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>
						{module.totalValue.toFixed(2)}
					</div>
				</div>

				<div style={{ 
					padding: '12px',
					background: 'var(--background)',
					borderRadius: 'var(--radius-md)',
					border: '1px solid var(--border)'
				}}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
						<Shield size={16} color={getSecurityScoreColor(module.securityScore)} />
						<span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
							Điểm bảo mật
						</span>
					</div>
					<div style={{ 
						fontSize: '20px', 
						fontWeight: 700, 
						color: getSecurityScoreColor(module.securityScore)
					}}>
						{module.securityScore}/100
					</div>
					{module.vulnerabilities > 0 && (
						<div style={{ fontSize: '11px', color: '#ef4444' }}>
							{module.vulnerabilities} lỗ hổng
						</div>
					)}
				</div>
			</div>

			{/* Performance Metrics */}
			<div style={{ 
				display: 'grid',
				gridTemplateColumns: 'repeat(3, 1fr)',
				gap: '8px',
				marginBottom: '16px',
				padding: '12px',
				background: 'var(--muted)',
				borderRadius: 'var(--radius-md)'
			}}>
				<div style={{ textAlign: 'center' }}>
					<div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
						Response Time
					</div>
					<div style={{ 
						fontSize: '14px', 
						fontWeight: 600,
						color: module.responseTime < 200 ? '#10b981' : 
							   module.responseTime < 500 ? '#f59e0b' : '#ef4444'
					}}>
						{module.responseTime}ms
					</div>
				</div>

				<div style={{ textAlign: 'center' }}>
					<div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
						Uptime
					</div>
					<div style={{ 
						fontSize: '14px', 
						fontWeight: 600,
						color: module.uptime >= 99 ? '#10b981' : 
							   module.uptime >= 95 ? '#f59e0b' : '#ef4444'
					}}>
						{module.uptime}%
					</div>
				</div>

				<div style={{ textAlign: 'center' }}>
					<div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
						Error Rate
					</div>
					<div style={{ 
						fontSize: '14px', 
						fontWeight: 600,
						color: module.errorRate < 1 ? '#10b981' : 
							   module.errorRate < 3 ? '#f59e0b' : '#ef4444'
					}}>
						{module.errorRate}%
					</div>
				</div>
			</div>

			{/* Audit Info */}
			{module.lastAudit && (
				<div style={{ 
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					padding: '8px 12px',
					background: module.auditScore && module.auditScore >= 90 ? '#f0fdf4' : 
							   module.auditScore && module.auditScore >= 80 ? '#fffbeb' : '#fef2f2',
					borderRadius: 'var(--radius-md)',
					border: `1px solid ${module.auditScore && module.auditScore >= 90 ? '#bbf7d0' : 
										module.auditScore && module.auditScore >= 80 ? '#fed7aa' : '#fecaca'}`
				}}>
					<div style={{ fontSize: '13px', fontWeight: 500 }}>
						Audit: {module.lastAudit}
					</div>
					{module.auditScore && (
						<div style={{ 
							fontSize: '13px', 
							fontWeight: 600,
							color: module.auditScore >= 90 ? '#10b981' : 
								   module.auditScore >= 80 ? '#f59e0b' : '#ef4444'
						}}>
							{module.auditScore}/100
						</div>
					)}
				</div>
			)}

			{/* Last Update */}
			<div style={{ 
				fontSize: '12px', 
				color: 'var(--muted-foreground)',
				textAlign: 'right',
				marginTop: '12px'
			}}>
				Cập nhật {formatTime(module.lastUpdate)}
			</div>

			{/* Status pulse for critical modules */}
			{(module.status === 'error' || module.securityScore < 70) && (
				<div style={{
					position: 'absolute',
					top: -2,
					right: -2,
					width: '12px',
					height: '12px',
					background: '#ef4444',
					borderRadius: '50%',
					animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
				}} />
			)}
		</div>
	)
}

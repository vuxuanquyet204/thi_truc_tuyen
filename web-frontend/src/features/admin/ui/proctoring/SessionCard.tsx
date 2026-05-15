import React from 'react'
import { ProctoringSession } from '@/foundation/types/proctoring'
import Badge from '@/features/admin/ui/common/Badge'
import { 
	Video, 
	VideoOff, 
	Mic, 
	MicOff, 
	Eye, 
	AlertTriangle,
	Wifi,
	WifiOff,
	Clock
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface SessionCardProps {
	session: ProctoringSession
	onClick: (session: ProctoringSession) => void
}

export default function SessionCard({ session, onClick }: SessionCardProps): JSX.Element {
	
	const getRiskBadgeVariant = (risk: string) => {
		switch (risk) {
			case 'low': return 'success'
			case 'medium': return 'warning'
			case 'high': return 'danger'
			case 'critical': return 'danger'
			default: return 'secondary'
		}
	}

	const getRiskLabel = (risk: string) => {
		switch (risk) {
			case 'low': return 'An toàn'
			case 'medium': return 'Cảnh báo'
			case 'high': return 'Nguy hiểm'
			case 'critical': return 'Nghiêm trọng'
			default: return risk
		}
	}

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case 'active': return 'success'
			case 'paused': return 'warning'
			case 'completed': return 'secondary'
			case 'terminated': return 'danger'
			default: return 'secondary'
		}
	}

	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'active': return 'Đang thi'
			case 'paused': return 'Tạm dừng'
			case 'completed': return 'Hoàn thành'
			case 'terminated': return 'Đã dừng'
			default: return status
		}
	}

	const getElapsedTime = () => {
		const start = new Date(session.startTime)
		const now = new Date()
		const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000 / 60) // minutes
		const duration = session.duration || 0
		return duration > 0 ? `${elapsed}/${duration} phút` : `${elapsed} phút`
	}

	return (
		<div
			className="session-card"
			onClick={() => onClick(session)}
			style={{
				border: session.riskLevel === 'critical' ? '2px solid #ef4444' :
						session.riskLevel === 'high' ? '2px solid #f59e0b' : '1px solid var(--border)',
				cursor: 'pointer',
				transition: 'all var(--transition-normal)',
				position: 'relative'
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.transform = 'translateY(-2px)'
				e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.transform = 'translateY(0)'
				e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
			}}
		>
			{/* Header */}
			<div style={{ 
				display: 'flex', 
				justifyContent: 'space-between', 
				alignItems: 'flex-start',
				marginBottom: '12px'
			}}>
				<div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
					{session.userAvatar ? (
						<img 
							src={session.userAvatar} 
							alt={session.userName}
							className="avatar"
							style={{ 
								width: '48px', 
								height: '48px', 
								borderRadius: '50%',
								objectFit: 'cover'
							}}
						/>
					) : (
						<div 
							className="avatar"
							style={{ 
								width: '48px', 
								height: '48px', 
								borderRadius: '50%',
								background: 'var(--accent)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: 'var(--accent-foreground)',
								fontWeight: 600
							}}
						>
							{session.userName.charAt(0)}
						</div>
					)}
					
					<div style={{ flex: 1, minWidth: 0 }}>
						<div style={{ 
							fontWeight: 600, 
							fontSize: '15px',
							marginBottom: '4px',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap'
						}}>
							{session.userName || `User ${session.userId}`}
						</div>
						<div style={{ 
							fontSize: '13px', 
							color: 'var(--muted-foreground)',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap'
						}}>
							{session.examTitle || `Exam ${session.examId}`}
						</div>
					</div>
				</div>

				<div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
					<Badge variant={getRiskBadgeVariant(session.riskLevel)}>
						{getRiskLabel(session.riskLevel)}
					</Badge>
					<Badge variant={getStatusBadgeVariant(session.status)}>
						{getStatusLabel(session.status)}
					</Badge>
				</div>
			</div>

			{/* Camera & Audio Status */}
			<div style={{ 
				display: 'flex', 
				gap: '12px',
				marginBottom: '12px',
				padding: '8px',
				background: 'var(--muted)',
				borderRadius: 'var(--radius-md)'
			}}>
				<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
					{session.cameraEnabled ? (
						<Video size={16} color="#10b981" />
					) : (
						<VideoOff size={16} color="#ef4444" />
					)}
					<span style={{ fontSize: '13px' }}>
						{session.cameraEnabled ? 'Camera On' : 'Camera Off'}
					</span>
				</div>

				<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
					{session.audioEnabled ? (
						<Mic size={16} color="#10b981" />
					) : (
						<MicOff size={16} color="#ef4444" />
					)}
					<span style={{ fontSize: '13px' }}>
						{session.audioEnabled ? 'Audio On' : 'Audio Off'}
					</span>
				</div>

				<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
					{session.connectionStatus === 'online' ? (
						<Wifi size={16} color="#10b981" />
					) : (
						<WifiOff size={16} color="#ef4444" />
					)}
					<span style={{ fontSize: '13px' }}>
						{session.connectionStatus === 'online' ? 'Online' : 
						 session.connectionStatus === 'unstable' ? 'Không ổn định' : 'Offline'}
					</span>
				</div>
			</div>

			{/* Metrics */}
			<div style={{ 
				display: 'grid',
				gridTemplateColumns: 'repeat(2, 1fr)',
				gap: '8px',
				marginBottom: '12px'
			}}>
				<div style={{ 
					padding: '8px',
					background: 'var(--background)',
					borderRadius: 'var(--radius-md)',
					border: '1px solid var(--border)'
				}}>
					<div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
						Thời gian
					</div>
					<div style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
						<Clock size={14} />
						{getElapsedTime()}
					</div>
				</div>

				<div style={{ 
					padding: '8px',
					background: session.totalViolations > 0 ? '#fef2f2' : 'var(--background)',
					borderRadius: 'var(--radius-md)',
					border: `1px solid ${session.totalViolations > 0 ? '#fecaca' : 'var(--border)'}`
				}}>
					<div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
						Vi phạm
					</div>
					<div style={{ 
						fontSize: '14px', 
						fontWeight: 600, 
						display: 'flex', 
						alignItems: 'center', 
						gap: '4px',
						color: (session.totalViolations || 0) > 0 ? '#dc2626' : 'inherit'
					}}>
						<AlertTriangle size={14} />
							{session.totalViolations || 0} lần
					</div>
				</div>
			</div>

			{/* Face Detection */}
			<div style={{ 
				display: 'flex',
				alignItems: 'center',
				gap: '8px',
				padding: '8px',
			background: (session.faceDetected ?? true) ? '#f0fdf4' : '#fef2f2',
			borderRadius: 'var(--radius-md)',
			border: `1px solid ${(session.faceDetected ?? true) ? '#bbf7d0' : '#fecaca'}`
			}}>
				<Eye size={16} color={(session.faceDetected ?? true) ? '#10b981' : '#ef4444'} />
				<span style={{ fontSize: '13px', fontWeight: 500 }}>
					{(session.faceDetected ?? true) ? (
						<>
							✓ Phát hiện khuôn mặt 
							{(session.faceCount || 1) > 1 && <span style={{ color: '#ef4444' }}> ({session.faceCount} người)</span>}
						</>
					) : (
						<span style={{ color: '#ef4444' }}>✗ Không phát hiện khuôn mặt</span>
					)}
				</span>
			</div>

			{/* Pulse animation for critical */}
			{session.riskLevel === 'critical' && (
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


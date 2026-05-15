import React, { useEffect, useMemo, useRef } from 'react'
import { ProctoringSession } from '@/foundation/types/proctoring'
import Badge from '@/features/admin/ui/common/Badge'
import EventLog from './EventLog'
import { 
	Video, 
	VideoOff, 
	Mic, 
	MicOff, 
	Eye, 
	Wifi,
	Clock,
	User,
	FileText,
	AlertTriangle,
	Loader2,
	RefreshCw,
	WifiOff
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { StreamState } from '@/features/admin/hooks/useProctoringStreams'

interface SessionDetailViewProps {
	session: ProctoringSession
	onResolveViolation?: (violationId: string) => void
	onTerminate?: (sessionId: string) => void
	onSendWarning?: (sessionId: string) => void
	onRequestStream?: (sessionId: string, options?: { force?: boolean }) => void
	onStopStream?: (sessionId: string) => void
	streamState?: StreamState
}

export default function SessionDetailView({ 
	session, 
	onResolveViolation,
	onTerminate,
	onSendWarning,
	onRequestStream,
	onStopStream,
	streamState
}: SessionDetailViewProps): JSX.Element {
	const videoRef = useRef<HTMLVideoElement>(null)
	const streamStatus = streamState?.status ?? 'idle'
	const hasLiveStream = streamStatus === 'live' && !!streamState?.stream

	useEffect(() => {
		const video = videoRef.current
		if (!video) return

		// Kiểm tra xem video element có còn trong DOM không
		if (!video.isConnected) return

		if (streamState?.stream) {
			// Chỉ set srcObject nếu khác với stream hiện tại
			if (video.srcObject !== streamState.stream) {
				video.srcObject = streamState.stream
			}

			// Chỉ gọi play() nếu video element vẫn còn trong DOM và chưa đang phát
			if (video.isConnected && video.paused) {
				const playPromise = video.play()
				if (playPromise !== undefined) {
					playPromise.catch(error => {
						// Chỉ log warning nếu video vẫn còn trong DOM
						if (video.isConnected) {
							console.warn('Không thể phát video trong modal:', error)
						}
					})
				}
			}
		} else {
			if (video.isConnected) {
				video.pause()
				video.srcObject = null
			}
		}

		return () => {
			// Cleanup chỉ khi video element vẫn còn trong DOM
			if (video && video.isConnected) {
				try {
					video.pause()
					video.srcObject = null
				} catch (err) {
					// Ignore errors khi cleanup
				}
			}
		}
	}, [streamState?.stream])

	const streamStatusMeta = useMemo(() => {
		switch (streamStatus) {
			case 'live':
				return { label: 'Đang phát', background: 'rgba(34,197,94,0.15)', color: '#15803d' }
			case 'connecting':
				return { label: 'Đang kết nối', background: 'rgba(59,130,246,0.15)', color: '#2563eb' }
			case 'waiting':
				return { label: 'Chờ phản hồi', background: 'rgba(250,204,21,0.2)', color: '#b45309' }
			case 'error':
				return { label: 'Lỗi kết nối', background: 'rgba(248,113,113,0.15)', color: '#dc2626' }
			default:
				return { label: 'Chưa khởi tạo', background: 'var(--muted)', color: 'var(--muted-foreground)' }
		}
	}, [streamStatus])

	const lastUpdatedLabel = useMemo(() => {
		if (!streamState?.lastUpdated) return 'Chưa có dữ liệu'
		return formatDistanceToNow(streamState.lastUpdated, { addSuffix: true, locale: vi })
	}, [streamState?.lastUpdated])

	const handleRequest = (force = false) => {
		onRequestStream?.(session.id, force ? { force: true } : undefined)
	}

	const handleStop = () => {
		onStopStream?.(session.id)
	}

	const renderStreamPlaceholder = () => {
		if (!session.cameraEnabled) {
			return (
				<StreamStatusMessage
					icon={<VideoOff size={48} />}
					title="Camera đã tắt"
					description="Thí sinh chưa bật camera hoặc từ chối chia sẻ. Bạn có thể thử yêu cầu lại."
					actionLabel="Yêu cầu lại"
					onAction={() => handleRequest(true)}
				/>
			)
		}

		switch (streamStatus) {
			case 'waiting':
				return (
					<StreamStatusMessage
						icon={<Loader2 size={48} className="animate-spin" />}
						title="Đang thiết lập kết nối"
						description="Hệ thống đang kết nối tới camera của thí sinh, vui lòng đợi trong giây lát."
					/>
				)
			case 'connecting':
				return (
					<StreamStatusMessage
						icon={<Loader2 size={48} className="animate-spin" />}
						title="Đang thiết lập kết nối"
						description="Đang thiết lập phiên WebRTC, vui lòng đợi trong giây lát."
					/>
				)
			case 'error':
				return (
					<StreamStatusMessage
						icon={<WifiOff size={48} />}
						title="Không thể hiển thị camera"
						description={streamState?.error || 'Đã xảy ra lỗi khi kết nối tới camera của thí sinh.'}
						actionLabel="Thử lại"
						onAction={() => handleRequest(true)}
						severity="error"
					/>
				)
			case 'idle':
			default:
				return (
					<StreamStatusMessage
						icon={<Video size={48} />}
						title="Chưa yêu cầu camera"
						description="Nhấn nút bên dưới để yêu cầu thí sinh bật camera và chia sẻ hình ảnh."
						actionLabel="Yêu cầu camera"
						onAction={() => handleRequest(false)}
					/>
				)
		}
	}
	
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

	const getElapsedTime = () => {
		const start = new Date(session.startTime)
		const now = new Date()
		const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000 / 60)
		const duration = session.duration || 0
		return duration > 0 ? `${elapsed}/${duration} phút` : `${elapsed} phút`
	}

	const getProgress = () => {
		const start = new Date(session.startTime)
		const now = new Date()
		const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000 / 60)
		const duration = session.duration || 0
		return duration > 0 ? Math.min((elapsed / duration) * 100, 100) : 0
	}

	return (
		<div className="modal-content-wrapper">
			{/* Header */}
			<div className="modal-info-card">
				<div className="card-icon">
					{session.userAvatar ? (
						<img 
							src={session.userAvatar} 
							alt={session.userName || `User ${session.userId}`}
							style={{ 
								width: '40px', 
								height: '40px', 
								borderRadius: '50%',
								objectFit: 'cover'
							}}
						/>
					) : (
						<div style={{ 
							width: '40px', 
							height: '40px', 
							borderRadius: '50%',
							background: 'var(--accent)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: 'var(--accent-foreground)',
							fontSize: '18px',
							fontWeight: 700
						}}>
							{(session.userName || `User ${session.userId}`).charAt(0)}
						</div>
					)}
				</div>
				<div className="card-title">{session.userName || `User ${session.userId}`}</div>
				<div className="card-description">{session.examTitle || `Exam ${session.examId}`}</div>
				<div className="card-value">
					<span className={`modal-status-badge ${getRiskBadgeVariant(session.riskLevel)}`}>
						{getRiskLabel(session.riskLevel)}
					</span>
					<span className="modal-status-badge secondary" style={{ marginLeft: '8px' }}>
						ID: {session.id}
					</span>
				</div>
			</div>

			{/* Action Buttons */}
			{session.status === 'active' && (
				<div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
					{onSendWarning && (
						<button className="btn btn-warning" onClick={() => onSendWarning(session.id)}>
							<AlertTriangle size={18} />
							Gửi cảnh báo
						</button>
					)}
					{onTerminate && (
						<button className="btn btn-danger" onClick={() => onTerminate(session.id)}>
							Dừng phiên thi
						</button>
					)}
				</div>
			)}

			{/* Video Stream */}
			<div className="modal-detail-section">
				<div className="section-title">
					<Video />
					<h4>Video Stream</h4>
				</div>
				<div style={{ 
					background: '#000',
					borderRadius: '16px',
					aspectRatio: '16/9',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					position: 'relative',
					overflow: 'hidden'
				}}>
					{/* Luôn render video element để tránh unmount/remount */}
					<video
						ref={videoRef}
						autoPlay
						playsInline
						muted
						controls={false}
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
							display: hasLiveStream ? 'block' : 'none'
						}}
						onLoadedMetadata={(e) => {
							const video = e.currentTarget
							if (video.isConnected && video.srcObject && video.paused) {
								video.play().catch(err => {
									if (video.isConnected) {
										console.warn('Không thể phát video sau khi load metadata:', err)
									}
								})
							}
						}}
						onCanPlay={(e) => {
							const video = e.currentTarget
							if (video.isConnected && video.paused && video.srcObject) {
								video.play().catch(err => {
									if (video.isConnected) {
										console.warn('Không thể phát video sau khi canPlay:', err)
									}
								})
							}
						}}
					/>
					{/* Overlay placeholder khi không có stream */}
					{!hasLiveStream && (
						<div
							style={{
								position: 'absolute',
								inset: 0,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								padding: '32px'
							}}
						>
							{renderStreamPlaceholder()}
						</div>
					)}

					<div
						style={{
							position: 'absolute',
							top: '16px',
							left: '16px',
							display: 'flex',
							alignItems: 'center',
							gap: '12px'
						}}
					>
						<div
							style={{
								padding: '6px 14px',
								borderRadius: '999px',
								fontSize: '12px',
							fontWeight: 600,
								background: streamStatusMeta.background,
								color: streamStatusMeta.color,
								textTransform: 'uppercase',
								letterSpacing: '0.06em'
							}}
						>
							{streamStatusMeta.label}
						</div>
						{hasLiveStream && (
							<div
								style={{
							display: 'flex',
							alignItems: 'center',
									gap: '6px',
									background: 'rgba(220,38,38,0.85)',
									color: '#fff',
									padding: '6px 12px',
									borderRadius: '999px',
									fontSize: '12px',
									fontWeight: 600
								}}
							>
								<span
									style={{
								width: '8px',
								height: '8px',
								borderRadius: '50%',
										background: '#fff',
										boxShadow: '0 0 8px rgba(255,255,255,0.9)'
									}}
								/>
							LIVE
					</div>
				)}
					</div>

					<div
						style={{
							position: 'absolute',
							bottom: '16px',
							left: '16px',
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
							background: 'rgba(15, 23, 42, 0.6)',
							color: '#e2e8f0',
							padding: '6px 12px',
							borderRadius: '999px',
							fontSize: '12px'
						}}
					>
						<Clock size={14} />
						Cập nhật {lastUpdatedLabel}
					</div>
				</div>

				<div
					style={{
						display: 'flex',
						justifyContent: 'flex-end',
						gap: '12px',
						marginTop: '16px',
						flexWrap: 'wrap'
					}}
				>
					<button
						type="button"
						className="btn btn-secondary"
						onClick={() => handleRequest(false)}
						disabled={!onRequestStream}
						style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
					>
						<Video size={16} />
						Yêu cầu camera
					</button>
					<button
						type="button"
						className="btn btn-secondary"
						onClick={() => handleRequest(true)}
						disabled={!onRequestStream}
						style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
					>
						<RefreshCw size={16} />
						Yêu cầu lại
					</button>
					<button
						type="button"
						className="btn btn-secondary"
						onClick={handleStop}
						disabled={!onStopStream || streamStatus === 'idle'}
						style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
					>
						<VideoOff size={16} />
						Dừng phát
					</button>
				</div>
			</div>

			{/* Progress Bar */}
			<div>
				<div style={{ 
					display: 'flex', 
					justifyContent: 'space-between',
					marginBottom: '8px',
					fontSize: '14px',
					fontWeight: 500
				}}>
					<span>Tiến độ: {getElapsedTime()}</span>
					<span>{Math.round(getProgress())}%</span>
				</div>
				<div style={{
					width: '100%',
					height: '8px',
					background: 'var(--muted)',
					borderRadius: '9999px',
					overflow: 'hidden'
				}}>
					<div style={{
						width: `${getProgress()}%`,
						height: '100%',
						background: session.riskLevel === 'critical' ? '#ef4444' :
								   session.riskLevel === 'high' ? '#f59e0b' :
								   session.riskLevel === 'medium' ? '#eab308' : '#10b981',
						transition: 'width 0.3s ease'
					}} />
			</div>
			</div>

			{/* Stats Grid */}
			<div className="modal-info-grid">
				<StatCard
					icon={<Video size={20} />}
					label="Camera"
					value={session.cameraEnabled ? 'Bật' : 'Tắt'}
					color={session.cameraEnabled ? '#10b981' : '#ef4444'}
				/>
				<StatCard
					icon={<Mic size={20} />}
					label="Microphone"
					value={session.audioEnabled ? 'Bật' : 'Tắt'}
					color={session.audioEnabled ? '#10b981' : '#ef4444'}
				/>
				<StatCard
					icon={<Eye size={20} />}
					label="Khuôn mặt"
					value={(session.faceDetected ?? true) ? `${session.faceCount || 1} người` : 'Không phát hiện'}
					color={(session.faceDetected ?? true) && (session.faceCount || 1) === 1 ? '#10b981' : '#ef4444'}
				/>
				<StatCard
					icon={<Wifi size={20} />}
					label="Kết nối"
					value={(session.connectionStatus || 'offline') === 'online' ? 'Ổn định' : 
						   (session.connectionStatus || 'offline') === 'unstable' ? 'Không ổn định' : 'Mất kết nối'}
					color={(session.connectionStatus || 'offline') === 'online' ? '#10b981' : 
						   (session.connectionStatus || 'offline') === 'unstable' ? '#f59e0b' : '#ef4444'}
				/>
				<StatCard
					icon={<AlertTriangle size={20} />}
					label="Vi phạm"
					value={`${session.totalViolations || 0} lần`}
					color={(session.totalViolations || 0) > 0 ? '#ef4444' : '#10b981'}
				/>
				<StatCard
					icon={<FileText size={20} />}
					label="Chuyển tab"
					value={`${session.tabSwitches || 0} lần`}
					color={(session.tabSwitches || 0) > 0 ? '#f59e0b' : '#10b981'}
				/>
			</div>

			{/* Event Log */}
			<div className="modal-detail-section">
				<div className="section-title">
					<AlertTriangle />
					<h4>Nhật ký sự kiện ({(session.violations || []).length})</h4>
				</div>
				<EventLog 
					violations={session.violations || []}
					onResolve={onResolveViolation}
				/>
			</div>
		</div>
	)
}

// Helper Component
function StatCard({ 
	icon, 
	label, 
	value, 
	color 
}: { 
	icon: React.ReactNode
	label: string
	value: string
	color: string
}) {
	return (
		<div className="modal-info-card">
			<div className="card-icon" style={{ background: color }}>
				{icon}
			</div>
			<div className="card-title">{label}</div>
			<div className="card-value" style={{ color }}>{value}</div>
		</div>
	)
}

function StreamStatusMessage({
	icon,
	title,
	description,
	actionLabel,
	onAction,
	severity = 'info'
}: {
	icon: React.ReactNode
	title: string
	description?: string
	actionLabel?: string
	onAction?: () => void
	severity?: 'info' | 'error'
}) {
	const isError = severity === 'error'
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				textAlign: 'center',
				color: isError ? '#fca5a5' : '#e2e8f0',
				gap: '16px',
				maxWidth: '360px'
			}}
		>
			<div style={{ color: isError ? '#f87171' : '#cbd5f5' }}>{icon}</div>
			<div>
				<div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{title}</div>
				{description && (
					<div style={{ fontSize: '14px', lineHeight: 1.5 }}>
						{description}
					</div>
				)}
			</div>
			{actionLabel && onAction && (
				<button
					type="button"
					onClick={onAction}
					style={{
						padding: '8px 18px',
						borderRadius: '999px',
						border: 'none',
						cursor: 'pointer',
						fontSize: '13px',
						fontWeight: 600,
						background: isError
							? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
							: 'linear-gradient(135deg, rgba(148,163,184,0.9) 0%, rgba(148,163,184,0.6) 100%)',
						color: isError ? '#fff' : '#0f172a',
						boxShadow: isError ? '0 8px 16px rgba(220, 38, 38, 0.35)' : 'none'
					}}
				>
					{actionLabel}
				</button>
			)}
		</div>
	)
}


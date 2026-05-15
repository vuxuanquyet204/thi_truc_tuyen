import React, { useEffect, useMemo, useRef } from 'react'
import { AlertTriangle, CameraOff, Loader2, PlayCircle, WifiOff } from 'lucide-react'
import type { ProctoringSession } from '@/foundation/types/proctoring'
import type { StreamState } from '@/features/admin/hooks/useProctoringStreams'
import Badge from '@/features/admin/ui/common/Badge'

interface LiveCameraWallProps {
	sessions: ProctoringSession[]
	streamStates: Record<string, StreamState>
	onRequestStream: (sessionId: string, options?: { force?: boolean }) => void
	onSessionClick?: (session: ProctoringSession) => void
	title?: string
	subtitle?: string
}

export default function LiveCameraWall({
	sessions,
	streamStates,
	onRequestStream,
	onSessionClick,
	title = 'Luồng camera trực tiếp',
	subtitle = 'Giám sát trực quan các thí sinh đang thi'
}: LiveCameraWallProps): JSX.Element {
	const orderedSessions = useMemo(() => {
		const severityScore: Record<string, number> = {
			critical: 4,
			high: 3,
			medium: 2,
			low: 1
		}

		return [...sessions].sort((a, b) => {
			const aScore = severityScore[a.riskLevel] ?? 0
			const bScore = severityScore[b.riskLevel] ?? 0

			if (a.status === 'active' && b.status !== 'active') return -1
			if (a.status !== 'active' && b.status === 'active') return 1
			if (aScore === bScore) {
				return (b.totalViolations || 0) - (a.totalViolations || 0)
			}
			return bScore - aScore
		})
	}, [sessions])

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
			<div>
				<h2
					style={{
						fontSize: '20px',
						fontWeight: 700,
						margin: 0,
						display: 'flex',
						alignItems: 'center',
						gap: '8px'
					}}
				>
					<PlayCircle size={20} color="#ef4444" />
					{title}
				</h2>
				<p style={{ margin: '4px 0 0', color: 'var(--muted-foreground)', fontSize: '14px' }}>
					{subtitle}
				</p>
			</div>

			{orderedSessions.length === 0 ? (
				<div
					style={{
						border: '1px solid var(--border)',
						borderRadius: 'var(--radius-lg)',
						padding: '32px',
						textAlign: 'center',
						background: 'var(--card)'
					}}
				>
					<CameraOff size={32} color="#94a3b8" />
					<p style={{ marginTop: '12px', color: 'var(--muted-foreground)' }}>
						Không có phiên thi nào phù hợp với bộ lọc hiện tại
					</p>
				</div>
			) : (
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
						gap: '16px'
					}}
				>
					{orderedSessions.map(session => (
						<LiveCameraTile
							key={session.id}
							session={session}
							state={streamStates[session.id]}
							onRequest={() => onRequestStream(session.id)}
							onForceRequest={() => onRequestStream(session.id, { force: true })}
							onClick={() => onSessionClick?.(session)}
						/>
					))}
				</div>
			)}
		</div>
	)
}

interface LiveCameraTileProps {
	session: ProctoringSession
	state?: StreamState
	onRequest: () => void
	onForceRequest: () => void
	onClick?: () => void
}

function LiveCameraTile({ session, state, onRequest, onForceRequest, onClick }: LiveCameraTileProps) {
	const videoRef = useRef<HTMLVideoElement>(null)

	useEffect(() => {
		const video = videoRef.current
		if (!video) return

		// Kiểm tra xem video element có còn trong DOM không
		if (!video.isConnected) return

		if (state?.stream) {
			// Chỉ set srcObject nếu khác với stream hiện tại
			if (video.srcObject !== state.stream) {
				video.srcObject = state.stream
			}

			// Chỉ gọi play() nếu video element vẫn còn trong DOM và chưa đang phát
			if (video.isConnected && video.paused) {
				const playPromise = video.play()
				if (playPromise !== undefined) {
					playPromise.catch(err => {
						// Chỉ log warning nếu video vẫn còn trong DOM
						if (video.isConnected) {
							console.warn('Không thể phát video stream:', err)
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
	}, [state?.stream])

	const status = state?.status ?? 'idle'
	const hasLiveStream = status === 'live' && !!state?.stream

	const renderStatusOverlay = () => {
		if (!session.cameraEnabled) {
			return (
				<StatusOverlay
					title="Camera đã tắt"
					description="Thí sinh đã tắt camera hoặc chưa cấp quyền truy cập."
					icon={<CameraOff size={28} />}
					actionLabel="Thử yêu cầu lại"
					onAction={onForceRequest}
				/>
			)
		}

		switch (status) {
			case 'waiting':
				return (
					<StatusOverlay
						title="Đang gửi yêu cầu"
						description="Đang chờ thí sinh phản hồi yêu cầu camera..."
						icon={<Loader2 size={28} className="animate-spin" />}
					/>
				)
			case 'connecting':
				return (
					<StatusOverlay
						title="Đang kết nối"
						description="Thiết lập kết nối video, vui lòng chờ giây lát."
						icon={<Loader2 size={28} className="animate-spin" />}
					/>
				)
			case 'error':
				return (
					<StatusOverlay
						title="Mất kết nối"
						description={state?.error || 'Không thể hiển thị camera của thí sinh.'}
						icon={<WifiOff size={28} />}
						severity="error"
						actionLabel="Thử lại"
						onAction={onForceRequest}
					/>
				)
			case 'idle':
				return (
					<StatusOverlay
						title="Chưa có camera"
						description="Nhấn để yêu cầu thí sinh bật camera và chia sẻ."
						icon={<PlayCircle size={32} />}
						actionLabel="Yêu cầu camera"
						onAction={onRequest}
					/>
				)
			default:
				return null
		}
	}

	const riskVariant = getRiskVariant(session.riskLevel)

	return (
		<div
			onClick={onClick}
			style={{
				background: 'var(--card)',
				border: '1px solid var(--border)',
				borderRadius: 'var(--radius-lg)',
				boxShadow: 'var(--shadow-sm)',
				overflow: 'hidden',
				cursor: 'pointer',
				transition: 'box-shadow 0.2s ease, transform 0.2s ease'
			}}
			onMouseEnter={e => {
				e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
				e.currentTarget.style.transform = 'translateY(-2px)'
			}}
			onMouseLeave={e => {
				e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
				e.currentTarget.style.transform = 'translateY(0)'
			}}
		>
			<div style={{ position: 'relative', aspectRatio: '16 / 10', background: '#0f172a' }}>
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
							background:
								status === 'error'
									? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
									: 'linear-gradient(135deg, #1f2937 0%, #0f172a 100%)'
						}}
					>
						{renderStatusOverlay()}
					</div>
				)}

				{hasLiveStream && (
					<div
						style={{
							position: 'absolute',
							top: '12px',
							left: '12px',
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
							background: 'rgba(220, 38, 38, 0.85)',
							color: 'white',
							padding: '4px 12px',
							borderRadius: '999px',
							fontSize: '12px',
							fontWeight: 600,
							letterSpacing: '0.08em',
							textTransform: 'uppercase'
						}}
					>
						<span
							style={{
								width: '8px',
								height: '8px',
								borderRadius: '50%',
								background: 'white',
								boxShadow: '0 0 6px rgba(255,255,255,0.9)'
							}}
						/>
						Live
					</div>
				)}

				{status === 'live' && !session.faceDetected && (
					<div
						style={{
							position: 'absolute',
							bottom: '12px',
							right: '12px',
							background: 'rgba(239, 68, 68, 0.9)',
							color: 'white',
							padding: '6px 12px',
							borderRadius: 'var(--radius-md)',
							display: 'flex',
							alignItems: 'center',
							gap: '6px',
							fontSize: '12px',
							fontWeight: 600
						}}
					>
						<AlertTriangle size={16} />
						Không phát hiện khuôn mặt
					</div>
				)}
			</div>

			<div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
					<div style={{ maxWidth: '70%' }}>
						<div
							style={{
								fontSize: '15px',
								fontWeight: 600,
								color: 'var(--foreground)',
								marginBottom: '4px',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap'
							}}
						>
							{session.userName || `Thí sinh ${session.userId}`}
						</div>
						<div
							style={{
								fontSize: '13px',
								color: 'var(--muted-foreground)',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap'
							}}
						>
							{session.examTitle || `Bài thi ${session.examId}`}
						</div>
					</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
						<Badge variant={riskVariant}>{getRiskLabel(session.riskLevel)}</Badge>
						<StatusBadge status={status} />
					</div>
				</div>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
						gap: '8px',
						fontSize: '12px'
					}}
				>
					<InfoChip label="Trạng thái" value={getSessionStatusLabel(session.status)} />
					<InfoChip
						label="Vi phạm"
						value={`${session.totalViolations || 0} lần`}
						emphasis={(session.totalViolations || 0) > 0}
					/>
					<InfoChip
						label="Khuôn mặt"
						value={
							session.faceDetected
								? `${session.faceCount || 1} người`
								: 'Không phát hiện'
						}
						emphasis={!session.faceDetected || (session.faceCount || 1) !== 1}
					/>
				</div>
			</div>
		</div>
	)
}

function StatusOverlay({
	title,
	description,
	icon,
	severity = 'info',
	actionLabel,
	onAction
}: {
	title: string
	description?: string
	icon: React.ReactNode
	severity?: 'info' | 'error'
	actionLabel?: string
	onAction?: () => void
}) {
	const isError = severity === 'error'
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				textAlign: 'center',
				padding: '24px',
				gap: '12px',
				color: isError ? '#991b1b' : '#e2e8f0'
			}}
		>
			<div style={{ color: isError ? '#ef4444' : '#e2e8f0' }}>{icon}</div>
			<div>
				<div style={{ fontSize: '15px', fontWeight: 600 }}>{title}</div>
				{description && (
					<div
						style={{
							fontSize: '13px',
							color: isError ? '#b91c1c' : '#cbd5f5',
							marginTop: '4px'
						}}
					>
						{description}
					</div>
				)}
			</div>
			{actionLabel && onAction && (
				<button
					type="button"
					onClick={e => {
						e.stopPropagation()
						onAction()
					}}
					style={{
						padding: '6px 16px',
						borderRadius: '999px',
						border: 'none',
						cursor: 'pointer',
						fontSize: '12px',
						fontWeight: 600,
						background: isError
							? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
							: 'linear-gradient(135deg, rgba(148, 163, 184, 0.85) 0%, rgba(148, 163, 184, 0.5) 100%)',
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

function StatusBadge({ status }: { status: StreamState['status'] | 'idle' }) {
	let label = 'Chưa khởi tạo'
	let background = 'var(--muted)'
	let color = 'var(--muted-foreground)'

	switch (status) {
		case 'live':
			label = 'Đang phát'
			background = 'rgba(34,197,94,0.15)'
			color = '#16a34a'
			break
		case 'connecting':
			label = 'Đang kết nối'
			background = 'rgba(59,130,246,0.15)'
			color = '#2563eb'
			break
		case 'waiting':
			label = 'Chờ phản hồi'
			background = 'rgba(250,204,21,0.2)'
			color = '#b45309'
			break
		case 'error':
			label = 'Lỗi kết nối'
			background = 'rgba(248,113,113,0.15)'
			color = '#dc2626'
			break
		default:
			label = 'Chưa khởi tạo'
			background = 'var(--muted)'
			color = 'var(--muted-foreground)'
	}

	return (
		<div
			style={{
				padding: '4px 10px',
				borderRadius: '999px',
				fontSize: '11px',
				fontWeight: 600,
				background,
				color
			}}
		>
			{label}
		</div>
	)
}

function InfoChip({
	label,
	value,
	emphasis
}: {
	label: string
	value: string
	emphasis?: boolean
}) {
	return (
		<div
			style={{
				background: emphasis ? 'rgba(239, 68, 68, 0.08)' : 'var(--muted)',
				borderRadius: 'var(--radius-md)',
				padding: '8px',
				display: 'flex',
				flexDirection: 'column',
				gap: '4px',
				color: emphasis ? '#b91c1c' : 'var(--muted-foreground)',
				fontWeight: emphasis ? 600 : 500
			}}
		>
			<span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
				{label}
			</span>
			<span style={{ fontSize: '13px', color: emphasis ? '#b91c1c' : 'var(--foreground)' }}>
				{value}
			</span>
		</div>
	)
}

function getRiskVariant(risk: ProctoringSession['riskLevel']): Parameters<typeof Badge>[0]['variant'] {
	switch (risk) {
		case 'low':
			return 'success'
		case 'medium':
			return 'warning'
		case 'high':
		case 'critical':
			return 'danger'
		default:
			return 'secondary'
	}
}

function getRiskLabel(risk: ProctoringSession['riskLevel']): string {
	switch (risk) {
		case 'low':
			return 'An toàn'
		case 'medium':
			return 'Cảnh báo'
		case 'high':
			return 'Nguy hiểm'
		case 'critical':
			return 'Nghiêm trọng'
		default:
			return 'Không xác định'
	}
}

function getSessionStatusLabel(status: ProctoringSession['status']): string {
	switch (status) {
		case 'active':
			return 'Đang thi'
		case 'paused':
			return 'Tạm dừng'
		case 'completed':
			return 'Hoàn thành'
		case 'terminated':
			return 'Đã dừng'
		case 'pending':
		default:
			return 'Chuẩn bị'
	}
}



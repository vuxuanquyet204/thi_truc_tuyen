import React, { useMemo } from 'react'
import { RefreshCw, Users } from 'lucide-react'
import type { ActiveProctoredStudent } from '@/features/exams/api/onlineExamApi'

interface ActiveRosterPanelProps {
	roster: ActiveProctoredStudent[]
	loading: boolean
	error: string | null
	onRefresh: () => Promise<void>
	lastFetchedAt: number | null
}

interface ExamGroupSummary {
	examId: string
	examTitle: string
	total: number
}

function formatDuration(seconds: number | null): string {
	if (!seconds || seconds <= 0) {
		return '00:00'
	}
	const minutes = Math.floor(seconds / 60)
	const remainingSeconds = seconds % 60
	return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

function formatTimestamp(timestamp: number | null): string {
	if (!timestamp) {
		return 'Chưa cập nhật'
	}
	return new Date(timestamp).toLocaleTimeString(undefined, {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	})
}

const emptyStateStyle: React.CSSProperties = {
	border: '1px solid var(--border)',
	borderRadius: 'var(--radius-lg)',
	padding: '20px',
	background: 'var(--card)',
	textAlign: 'center',
	color: 'var(--muted-foreground)'
}

export default function ActiveRosterPanel({
	roster,
	loading,
	error,
	onRefresh,
	lastFetchedAt
}: ActiveRosterPanelProps): JSX.Element {
	const totalStudents = roster.length

	const examGroups = useMemo<ExamGroupSummary[]>(() => {
		const map = new Map<string, ExamGroupSummary>()
		for (const entry of roster) {
			const examId = String(entry.examId ?? 'unknown')
			const existing = map.get(examId)
			if (existing) {
				existing.total += 1
			} else {
				map.set(examId, {
					examId,
					examTitle: entry.examTitle ?? `Bài thi ${examId}`,
					total: 1
				})
			}
		}
		return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 3)
	}, [roster])

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '16px',
				marginBottom: '24px'
			}}
		>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					flexWrap: 'wrap',
					gap: '12px'
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: '44px',
							height: '44px',
							borderRadius: '50%',
							background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(6, 95, 70, 0.18) 100%)',
							color: '#0f766e'
						}}
					>
						<Users size={22} />
					</div>
					<div>
						<div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--muted-foreground)' }}>
							Danh sách proctoring đang hoạt động
						</div>
						<div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--foreground)' }}>
							{loading ? '…' : totalStudents}
						</div>
					</div>
				</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--muted-foreground)' }}>
					<div style={{ fontSize: '13px' }}>Cập nhật: {formatTimestamp(lastFetchedAt)}</div>
					<button
						onClick={() => onRefresh()}
						disabled={loading}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '6px',
							padding: '8px 12px',
							borderRadius: 'var(--radius-md)',
							border: '1px solid var(--border)',
							background: 'var(--card)',
							cursor: loading ? 'not-allowed' : 'pointer',
							color: 'var(--foreground)',
							fontSize: '13px',
							fontWeight: 500,
							opacity: loading ? 0.7 : 1
						}}
					>
						<RefreshCw size={16} />
						Làm mới
					</button>
				</div>
			</div>

			{error && (
				<div
					style={{
						padding: '12px 16px',
						borderRadius: 'var(--radius-md)',
						background: 'rgba(239, 68, 68, 0.12)',
						color: '#b91c1c',
						fontSize: '13px'
					}}
				>
					{error}
				</div>
			)}

			{totalStudents === 0 && !loading ? (
				<div style={emptyStateStyle}>
					<p style={{ margin: 0 }}>Chưa có thí sinh nào đang được giám sát.</p>
				</div>
			) : (
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
						gap: '12px'
					}}
				>
					{roster.map(entry => (
						<div
							key={`${entry.sessionId || entry.studentId || Math.random()}`}
							style={{
								border: '1px solid var(--border)',
								borderRadius: 'var(--radius-lg)',
								padding: '16px',
								background: 'var(--card)',
								display: 'flex',
								flexDirection: 'column',
								gap: '6px'
							}}
						>
							<div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)' }}>
								Thí sinh {entry.studentId ?? '—'}
							</div>
							<div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
								{entry.examTitle ?? `Bài thi ${entry.examId ?? '—'}`}
							</div>
							<div
								style={{
									display: 'grid',
									gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
									gap: '8px',
									fontSize: '12px',
									color: 'var(--muted-foreground)'
								}}
							>
								<span>Thời gian thi</span>
								<strong style={{ color: 'var(--foreground)' }}>
									{formatDuration(entry.timeSpentSeconds)}
								</strong>
								<span>Phiên</span>
								<strong style={{ color: 'var(--foreground)' }}>
									{entry.sessionStatus ?? 'đang cập nhật'}
								</strong>
							</div>
							{entry.startedAt && (
								<div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
									Bắt đầu lúc: {new Date(entry.startedAt).toLocaleTimeString()}
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{examGroups.length > 0 && (
				<div
					style={{
						border: '1px solid var(--border)',
						borderRadius: 'var(--radius-lg)',
						padding: '16px',
						background: 'var(--card)'
					}}
				>
					<div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '8px' }}>
						Bài thi đang có nhiều thí sinh nhất
					</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
						{examGroups.map(group => (
							<div
								key={group.examId}
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									fontSize: '13px',
									color: 'var(--foreground)'
								}}
							>
								<span>{group.examTitle}</span>
								<strong>{group.total} thí sinh</strong>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

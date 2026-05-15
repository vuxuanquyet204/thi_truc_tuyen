import React from 'react'
import { ProctoringSession } from '@/foundation/types/proctoring'
import SessionCard from './SessionCard'

interface SessionGridProps {
	sessions: ProctoringSession[]
	onSessionClick: (session: ProctoringSession) => void
	loading?: boolean
}

export default function SessionGrid({ sessions, onSessionClick, loading = false }: SessionGridProps): JSX.Element {
	
	if (loading) {
		return (
			<div className="admin-table-empty">
				<div className="admin-table-empty-icon">⏳</div>
				<div className="admin-table-empty-text">Đang tải dữ liệu...</div>
			</div>
		)
	}

	if (sessions.length === 0) {
		return (
			<div className="admin-table-empty">
				<div className="admin-table-empty-icon">📭</div>
				<div className="admin-table-empty-text">Không có phiên thi nào đang diễn ra</div>
			</div>
		)
	}

	return (
		<div style={{
			display: 'grid',
			gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
			gap: '20px',
			animation: 'fadeIn 0.3s ease-in'
		}}>
			{sessions.map(session => (
				<SessionCard
					key={session.id}
					session={session}
					onClick={onSessionClick}
				/>
			))}
		</div>
	)
}


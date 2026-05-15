import React from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import SessionDetailView from '@/features/admin/ui/proctoring/SessionDetailView'
import { type ProctoringSession } from '@/foundation/types/proctoring'
import type { StreamState } from '@/features/admin/hooks/useProctoringStreams'

interface RequestOptions {
	force?: boolean
}

interface SessionDetailModalProps {
	isOpen: boolean
	onClose: () => void
	session: ProctoringSession | null
	onResolveViolation: (violationId: string) => void
	onTerminate: (sessionId: string) => void
	onSendWarning: (sessionId: string) => void
	onRequestStream?: (sessionId: string, options?: RequestOptions) => void
	onStopStream?: (sessionId: string) => void
	streamState?: StreamState
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
	isOpen,
	onClose,
	session,
	onResolveViolation,
	onTerminate,
	onSendWarning,
	onRequestStream,
	onStopStream,
	streamState
}) => {
	if (!session) return null

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Chi tiết phiên giám sát"
			maxWidth="1000px"
		>
			<SessionDetailView
				session={session}
				onResolveViolation={onResolveViolation}
				onTerminate={onTerminate}
				onSendWarning={onSendWarning}
				onRequestStream={onRequestStream}
				onStopStream={onStopStream}
				streamState={streamState}
			/>
		</Modal>
	)
}

export default SessionDetailModal

import React from 'react'
import { Violation } from '@/foundation/types/proctoring'
import Badge from '@/features/admin/ui/common/Badge'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import '@/features/admin/ui/common/styles/table.css'

interface EventLogProps {
	violations: Violation[]
	onResolve?: (violationId: string) => void
}

export default function EventLog({ violations, onResolve }: EventLogProps): JSX.Element {
	
	const getSeverityBadgeVariant = (severity: string) => {
		switch (severity) {
			case 'low': return 'secondary'
			case 'medium': return 'warning'
			case 'high': return 'danger'
			case 'critical': return 'danger'
			default: return 'secondary'
		}
	}

	const getSeverityLabel = (severity: string) => {
		switch (severity) {
			case 'low': return 'Thấp'
			case 'medium': return 'Trung bình'
			case 'high': return 'Cao'
			case 'critical': return 'Nghiêm trọng'
			default: return severity
		}
	}

	const getViolationTypeLabel = (type: string) => {
		const labels: Record<string, string> = {
			no_face_detected: 'Không phát hiện khuôn mặt',
			multiple_faces: 'Nhiều khuôn mặt',
			face_not_visible: 'Khuôn mặt không rõ',
			looking_away: 'Nhìn ra ngoài',
			audio_detected: 'Phát hiện giọng nói',
			suspicious_audio: 'Âm thanh đáng ngờ',
			tab_switch: 'Chuyển tab',
			fullscreen_exit: 'Thoát toàn màn hình',
			browser_change: 'Đổi trình duyệt',
			connection_lost: 'Mất kết nối',
			unauthorized_device: 'Thiết bị không được phép',
			screen_share_detected: 'Phát hiện chia sẻ màn hình',
			camera_status: 'Trạng thái camera',
			other: 'Khác'
		}
		return labels[type] || type
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

	if (violations.length === 0) {
		return (
			<div className="admin-table-empty">
				<div className="admin-table-empty-icon">✓</div>
				<div className="admin-table-empty-text">Chưa có vi phạm nào được ghi nhận</div>
			</div>
		)
	}

	return (
		<ul className="modal-list">
			{violations.map((violation) => (
				<li key={violation.id} className="list-item">
					<div className="item-icon">
						<AlertTriangle />
					</div>
					<div className="item-content">
						<div className="item-title">{getViolationTypeLabel(violation.type)}</div>
						<div className="item-description">{violation.description}</div>
					</div>
					<div className="item-meta">
						<div className="item-time">{formatTime(violation.timestamp)}</div>
						<div className={`item-status ${getSeverityBadgeVariant(violation.severity)}`}>
							{getSeverityLabel(violation.severity)}
						</div>
						{violation.resolved ? (
							<div className="item-status success">Đã xử lý</div>
						) : (
							<div className="item-status danger">Chưa xử lý</div>
						)}
						{!violation.resolved && onResolve && (
							<button 
								className="modal-action-button"
								onClick={() => onResolve(violation.id)}
							>
								<CheckCircle />
								Xử lý
							</button>
						)}
					</div>
				</li>
			))}
		</ul>
	)
}


import React from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import Badge from '@/features/admin/ui/common/Badge'

interface ActivityDetailModalProps {
	isOpen: boolean
	onClose: () => void
	activity: any
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
	isOpen,
	onClose,
	activity
}) => {
	if (!activity) return null

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Chi tiết hoạt động"
			maxWidth="600px"
		>
			<div>
				<div style={{ marginBottom: '20px' }}>
					<h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
						{activity.title}
					</h3>
					<p style={{ color: 'var(--muted-foreground)', marginBottom: '16px' }}>
						{activity.description}
					</p>
				</div>

				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
					<div>
						<label style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '4px', display: 'block' }}>
							Thời gian
						</label>
						<div style={{ fontSize: '14px', fontWeight: 500 }}>
							{new Date(activity.timestamp).toLocaleString('vi-VN')}
						</div>
					</div>
					<div>
						<label style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '4px', display: 'block' }}>
							Trạng thái
						</label>
						<Badge variant={activity.status === 'success' ? 'success' : 
											activity.status === 'warning' ? 'warning' : 
											activity.status === 'error' ? 'danger' : 'info'}>
							{activity.status}
						</Badge>
					</div>
				</div>

				{activity.metadata && Object.keys(activity.metadata).length > 0 && (
					<div>
						<h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
							Thông tin bổ sung
						</h4>
						<div style={{ 
							background: 'var(--muted)', 
							padding: '16px', 
							borderRadius: 'var(--radius-md)',
							fontSize: '14px'
						}}>
							<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
								{JSON.stringify(activity.metadata, null, 2)}
							</pre>
						</div>
					</div>
				)}
			</div>
		</Modal>
	)
}

export default ActivityDetailModal

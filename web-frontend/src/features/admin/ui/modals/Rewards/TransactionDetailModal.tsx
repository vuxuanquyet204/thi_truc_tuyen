import React from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import { type RewardTransaction } from '@/foundation/types/reward'

interface TransactionDetailModalProps {
	isOpen: boolean
	onClose: () => void
	transaction: RewardTransaction | null
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
	isOpen,
	onClose,
	transaction
}) => {
	if (!transaction) return null

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Chi tiết giao dịch"
			maxWidth="600px"
		>
			<div style={{ padding: '20px' }}>
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
					<div>
						<label style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '4px', display: 'block' }}>
							Người dùng
						</label>
						<div style={{ fontSize: '16px', fontWeight: 600 }}>
							{transaction.userName || `User ${transaction.userId}`}
						</div>
						<div style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>
							{transaction.userId}
						</div>
					</div>
					
					<div>
						<label style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '4px', display: 'block' }}>
							Luật thưởng
						</label>
						<div style={{ fontSize: '16px', fontWeight: 600 }}>
							{transaction.ruleName || 'Custom Reward'}
						</div>
						{transaction.ruleId && (
							<div style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>
								{transaction.ruleId}
							</div>
						)}
					</div>
				</div>

				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
					<div>
						<label style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '4px', display: 'block' }}>
							Số token
						</label>
						<div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>
							{transaction.tokenAmount} {transaction.tokenSymbol}
						</div>
					</div>
					
					<div>
						<label style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '4px', display: 'block' }}>
							Trạng thái
						</label>
						<div style={{ fontSize: '14px', fontWeight: 600 }}>
							{transaction.status}
						</div>
					</div>
				</div>

				{transaction.transactionHash && (
					<div style={{ marginBottom: '20px' }}>
						<label style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '4px', display: 'block' }}>
							Thông tin Blockchain
						</label>
						<div style={{ 
							padding: '12px', 
							background: 'var(--muted)', 
							borderRadius: 'var(--radius-md)',
							fontFamily: 'monospace',
							fontSize: '12px'
						}}>
							<div>Hash: {transaction.transactionHash}</div>
							{transaction.blockNumber && (
								<div>Block: #{transaction.blockNumber}</div>
							)}
							{transaction.gasUsed && (
								<div>Gas: {transaction.gasUsed.toLocaleString()}</div>
							)}
						</div>
					</div>
				)}

				{transaction.metadata && (
					<div>
						<label style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '4px', display: 'block' }}>
							Metadata
						</label>
						<div style={{ 
							padding: '12px', 
							background: 'var(--muted)', 
							borderRadius: 'var(--radius-md)',
							fontSize: '12px',
							fontFamily: 'monospace'
						}}>
							<pre>{JSON.stringify(transaction.metadata, null, 2)}</pre>
						</div>
					</div>
				)}
			</div>
		</Modal>
	)
}

export default TransactionDetailModal

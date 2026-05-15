import { RefreshCcw, Shield } from 'lucide-react'
import { MultisigWallet } from '@/features/blockchain/api'
import { formatWeiToEth } from '@/features/blockchain/utils/multisig'
import styles from '../../../pages/rewards/MultisigWalletPage/MultisigWalletPage.module.css'

type WalletSummaryProps = {
	wallet: MultisigWallet
	onRefresh: () => void
}

const WalletSummary = ({ wallet, onRefresh }: WalletSummaryProps): JSX.Element => {
	return (
		<div className={styles.card}>
			<div className={styles.summaryHeader}>
				<div className={styles.summaryInfo}>
					<div className={styles.summaryMeta}>
						<Shield size={24} />
						<div>
							<h2 className={styles.summaryTitle}>{wallet.name}</h2>
							<div className={styles.summaryMetaText}>
								<span>ID: {wallet.id}</span>
								<span>Contract: {wallet.contractAddress}</span>
							</div>
						</div>
					</div>
					{wallet.description && <p className={styles.summaryDescription}>{wallet.description}</p>}
				</div>
				<button className={`${styles.button} ${styles.buttonSecondary}`} type="button" onClick={onRefresh}>
					<RefreshCcw size={18} />
					Làm mới
				</button>
			</div>

			<div className={styles.summaryGrid}>
				<div className={styles.summaryStat}>
					<span className={styles.summaryStatLabel}>Số dư (ETH)</span>
					<strong className={styles.summaryStatValue}>{formatWeiToEth(wallet.onChainBalance || '0')}</strong>
				</div>
				<div className={styles.summaryStat}>
					<span className={styles.summaryStatLabel}>Số lượng owners</span>
					<strong className={styles.summaryStatValue}>{wallet.owners?.length || 0}</strong>
				</div>
				<div className={styles.summaryStat}>
					<span className={styles.summaryStatLabel}>Ngưỡng chữ ký</span>
					<strong className={styles.summaryStatValue}>{wallet.threshold}</strong>
				</div>
			</div>

			<div>
				<h3 className={styles.summaryOwnerTitle}>Danh sách owners</h3>
				<div className={styles.ownerList}>
					{wallet.owners?.map((owner) => (
						<span key={owner} className={styles.ownerBadge}>
							{owner}
						</span>
					))}
				</div>
				{wallet.onChainWarning && (
					<div className={styles.warning}>
						<strong>Cảnh báo:</strong> {wallet.onChainWarning}
						{wallet.onChainError && <div>Chi tiết: {wallet.onChainError}</div>}
					</div>
				)}
			</div>
		</div>
	)
}

export default WalletSummary

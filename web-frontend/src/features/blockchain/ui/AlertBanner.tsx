import { AlertCircle } from 'lucide-react'
import styles from '../../../pages/rewards/MultisigWalletPage/MultisigWalletPage.module.css'

export type AlertBannerProps = {
	type: 'success' | 'error' | 'info'
	message: string
	details?: string
}

const alertVariants: Record<AlertBannerProps['type'], string> = {
	success: styles.alertSuccess,
	error: styles.alertError,
	info: styles.alertInfo,
}

const AlertBanner = ({ type, message, details }: AlertBannerProps): JSX.Element => {
	return (
		<div className={`${styles.alert} ${alertVariants[type]}`}>
			<AlertCircle size={20} className={styles.alertIcon} />
			<div>
				<div className={styles.alertMessage}>{message}</div>
				{details && <div className={styles.alertDetails}>{details}</div>}
			</div>
		</div>
	)
}

export default AlertBanner

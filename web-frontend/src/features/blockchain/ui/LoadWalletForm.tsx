import { ChangeEvent, FormEvent } from 'react'
import { RefreshCcw, Shield } from 'lucide-react'
import styles from '../../../pages/rewards/MultisigWalletPage/MultisigWalletPage.module.css'

type LoadWalletFormProps = {
	value: string
	loading: boolean
	onChange: (value: string) => void
	onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const LoadWalletForm = ({ value, loading, onChange, onSubmit }: LoadWalletFormProps): JSX.Element => {
	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.value)
	}

	return (
		<div className={styles.card}>
			<div className={styles.sectionTitle}>
				<Shield size={20} />
				Tải thông tin ví
			</div>
			<form className={styles.loadForm} onSubmit={onSubmit}>
				<input
					className={`${styles.input} ${styles.loadFormInput}`}
					type="text"
					value={value}
					onChange={handleChange}
					placeholder="Nhập ID ví (UUID)"
				/>
				<button className={`${styles.button} ${styles.buttonPrimary}`} type="submit" disabled={loading}>
					<RefreshCcw size={18} />
					{loading ? 'Đang tải...' : 'Tải ví'}
				</button>
			</form>
		</div>
	)
}

export default LoadWalletForm

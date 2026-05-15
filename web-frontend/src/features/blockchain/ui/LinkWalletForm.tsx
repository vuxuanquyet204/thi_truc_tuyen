import { ChangeEvent, FormEvent } from 'react'
import { Link2 } from 'lucide-react'
import styles from '../../../pages/rewards/MultisigWalletPage/MultisigWalletPage.module.css'

export type LinkWalletFormValues = {
	name: string
	description: string
	contractAddress: string
}

type LinkWalletFormProps = {
	values: LinkWalletFormValues
	loading: boolean
	onChange: <Field extends keyof LinkWalletFormValues>(
		field: Field,
		value: LinkWalletFormValues[Field],
	) => void
	onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const LinkWalletForm = ({ values, loading, onChange, onSubmit }: LinkWalletFormProps): JSX.Element => {
	const handleInputChange =
		<Field extends keyof LinkWalletFormValues>(field: Field) =>
		(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			onChange(field, event.target.value as LinkWalletFormValues[Field])
		}

	return (
		<div className={styles.card}>
			<div className={styles.sectionTitle}>
				<Link2 size={20} />
				Liên kết ví hiện có
			</div>
			<form className={styles.form} onSubmit={onSubmit}>
				<label className={styles.formLabel}>
					Tên ví
					<input
						className={styles.input}
						type="text"
						value={values.name}
						onChange={handleInputChange('name')}
						placeholder="Ví cộng đồng"
						required
					/>
				</label>
				<label className={styles.formLabel}>
					Mô tả
					<textarea
						className={`${styles.input} ${styles.textarea}`}
						value={values.description}
						onChange={handleInputChange('description')}
						placeholder="Ghi chú nội bộ (tuỳ chọn)"
					/>
				</label>
				<label className={styles.formLabel}>
					Địa chỉ contract
					<input
						className={styles.input}
						type="text"
						value={values.contractAddress}
						onChange={handleInputChange('contractAddress')}
						placeholder="0x1234..."
						required
					/>
				</label>
				<button className={`${styles.button} ${styles.buttonPrimary}`} type="submit" disabled={loading}>
					<Link2 size={18} />
					{loading ? 'Đang liên kết...' : 'Liên kết ví'}
				</button>
			</form>
		</div>
	)
}

export default LinkWalletForm

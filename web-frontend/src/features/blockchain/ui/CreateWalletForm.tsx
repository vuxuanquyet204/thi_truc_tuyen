import { ChangeEvent, FormEvent } from 'react'
import { FilePlus2, Wallet } from 'lucide-react'
import styles from '../../../pages/rewards/MultisigWalletPage/MultisigWalletPage.module.css'

export type CreateWalletFormValues = {
	name: string
	description: string
	ownersText: string
	threshold: number
}

type CreateWalletFormProps = {
	values: CreateWalletFormValues
	loading: boolean
	onChange: <Field extends keyof CreateWalletFormValues>(
		field: Field,
		value: CreateWalletFormValues[Field],
	) => void
	onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const CreateWalletForm = ({ values, loading, onChange, onSubmit }: CreateWalletFormProps): JSX.Element => {
	const handleInputChange =
		<Field extends keyof CreateWalletFormValues>(field: Field) =>
		(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const value = field === 'threshold' ? Number(event.target.value) : event.target.value
			onChange(field, value as CreateWalletFormValues[Field])
		}

	return (
		<div className={styles.card}>
			<div className={styles.sectionTitle}>
				<Wallet size={20} />
				Tạo ví mới
			</div>
			<form className={styles.form} onSubmit={onSubmit}>
				<label className={styles.formLabel}>
					Tên ví
					<input
						className={styles.input}
						type="text"
						value={values.name}
						onChange={handleInputChange('name')}
						placeholder="Ví Admin DAO"
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
					Danh sách owners (mỗi dòng hoặc cách nhau bởi dấu phẩy)
					<textarea
						className={`${styles.input} ${styles.textarea} ${styles.textareaOwners}`}
						value={values.ownersText}
						onChange={handleInputChange('ownersText')}
						placeholder={'0xabc...\n0xdef...'}
						required
					/>
				</label>
				<label className={styles.formLabel}>
					Ngưỡng chữ ký (threshold)
					<input
						className={styles.input}
						type="number"
						min={1}
						value={values.threshold}
						onChange={handleInputChange('threshold')}
						required
					/>
				</label>
				<button className={`${styles.button} ${styles.buttonPrimary}`} type="submit" disabled={loading}>
					<FilePlus2 size={18} />
					{loading ? 'Đang tạo...' : 'Tạo ví mới'}
				</button>
			</form>
		</div>
	)
}

export default CreateWalletForm

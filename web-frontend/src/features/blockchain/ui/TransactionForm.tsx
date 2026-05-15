import { ChangeEvent, FormEvent } from 'react'
import { Send } from 'lucide-react'
import styles from '../../../pages/rewards/MultisigWalletPage/MultisigWalletPage.module.css'

export type TransactionFormValues = {
	destination: string
	value: string
	data: string
}

type TransactionFormProps = {
	values: TransactionFormValues
	loading: boolean
	onChange: <Field extends keyof TransactionFormValues>(
		field: Field,
		value: TransactionFormValues[Field],
	) => void
	onSubmit: (event: FormEvent<HTMLFormElement>) => void
	onReset: () => void
}

const TransactionForm = ({ values, loading, onChange, onSubmit, onReset }: TransactionFormProps): JSX.Element => {
	const handleInputChange =
		<Field extends keyof TransactionFormValues>(field: Field) =>
		(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			onChange(field, event.target.value as TransactionFormValues[Field])
		}

	return (
		<div className={styles.card}>
			<div className={styles.sectionTitle}>
				<Send size={20} />
				Tạo giao dịch mới
			</div>
			<form className={styles.formGrid} onSubmit={onSubmit}>
				<label className={`${styles.formLabel} ${styles.formLabelFull}`}>
					Địa chỉ nhận
					<input
						className={styles.input}
						type="text"
						value={values.destination}
						onChange={handleInputChange('destination')}
						placeholder="0xNgườiNhận..."
						required
					/>
				</label>
				<label className={styles.formLabel}>
					Số lượng (ETH)
					<input
						className={styles.input}
						type="number"
						min="0"
						step="any"
						value={values.value}
						onChange={handleInputChange('value')}
						placeholder="0.5"
						required
					/>
				</label>
				<label className={styles.formLabel}>
					Dữ liệu bổ sung (hex)
					<textarea
						className={`${styles.input} ${styles.textarea} ${styles.inputMono}`}
						value={values.data}
						onChange={handleInputChange('data')}
						placeholder="0x"
					/>
				</label>
				<div className={`${styles.formActions} ${styles.formLabelFull}`}>
					<button className={`${styles.button} ${styles.buttonPrimary}`} type="submit" disabled={loading}>
						<Send size={18} />
						{loading ? 'Đang tạo...' : 'Đề xuất giao dịch'}
					</button>
					<button className={`${styles.button} ${styles.buttonSecondary}`} type="button" onClick={onReset}>
						Xoá biểu mẫu
					</button>
				</div>
			</form>
		</div>
	)
}

export default TransactionForm

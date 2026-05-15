import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, FilePlus2, Link2, Play, RefreshCcw, Send, Shield, Wallet, ListChecks } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useAppSelector } from '@/foundation/store/hooks'
import multisigApi, {
	ConfirmTransactionRequest,
	CreateWalletRequest,
	LinkWalletRequest,
	MultisigTransaction,
	MultisigWallet,
	SubmitTransactionRequest,
} from '@/features/blockchain/api'
import { parseOwners, formatWeiToEth } from '@/features/blockchain/utils/multisig'
import styles from './MultisigWalletPage.module.css'
import WalletSummary from '@/features/blockchain/ui/WalletSummary'
import TransactionForm, { TransactionFormValues } from '@/features/blockchain/ui/TransactionForm'

type AlertState = {
	type: 'success' | 'error' | 'info'
	message: string
	details?: string
} | null

const MultisigWalletPage = (): JSX.Element => {
	const user = useAppSelector((state) => state.auth.user)
	const [alertState, setAlertState] = useState<AlertState>(null)
	const [walletIdInput, setWalletIdInput] = useState('')
	const [activeWalletId, setActiveWalletId] = useState<string | null>(null)
	const [wallet, setWallet] = useState<MultisigWallet | null>(null)
	const [transactions, setTransactions] = useState<MultisigTransaction[]>([])
	const [ownedWallets, setOwnedWallets] = useState<MultisigWallet[]>([])
	const [loadingOwnedWallets, setLoadingOwnedWallets] = useState(false)
	const [loadingWallet, setLoadingWallet] = useState(false)
	const [loadingTransactions, setLoadingTransactions] = useState(false)
	const [createLoading, setCreateLoading] = useState(false)
	const [linkLoading, setLinkLoading] = useState(false)
	const [submitLoading, setSubmitLoading] = useState(false)
	const [confirmLoading, setConfirmLoading] = useState<Record<string, boolean>>({})
	const [executeLoading, setExecuteLoading] = useState<Record<string, boolean>>({})

	const [createForm, setCreateForm] = useState({
		name: '',
		description: '',
		ownersText: '',
		threshold: 1,
	})

	const [linkForm, setLinkForm] = useState({
		name: '',
		description: '',
		contractAddress: '',
	})

	const [transactionForm, setTransactionForm] = useState<TransactionFormValues>({
		destination: '',
		value: '',
		data: '',
	})

	const [confirmKeys, setConfirmKeys] = useState<Record<string, string>>({})

	const showAlert = useCallback((alert: AlertState) => {
		setAlertState(alert)
		if (alert) {
			setTimeout(() => {
				setAlertState(null)
			}, 5000)
		}
	}, [])

	const fetchWallet = useCallback(
		async (walletId: string, options?: { suppressAlert?: boolean }) => {
			if (!walletId) return
			setLoadingWallet(true)
			try {
				const data = await multisigApi.getWalletById(walletId)
				setWallet(data)
				setActiveWalletId(walletId)
				if (!options?.suppressAlert) {
					showAlert({
						type: 'success',
						message: 'Đã tải thông tin ví',
					})
				}
			} catch (error: any) {
				setWallet(null)
				showAlert({
					type: 'error',
					message: 'Không thể tải ví multisig',
					details: error.message,
				})
			} finally {
				setLoadingWallet(false)
			}
		},
		[showAlert],
	)

	const fetchTransactions = useCallback(
		async (walletId: string) => {
			if (!walletId) return
			setLoadingTransactions(true)
			try {
				const data = await multisigApi.getTransactionsByWallet(walletId)
				setTransactions(data)
			} catch (error: any) {
				showAlert({
					type: 'error',
					message: 'Không thể tải danh sách giao dịch',
					details: error.message,
				})
			} finally {
				setLoadingTransactions(false)
			}
		},
		[showAlert],
	)

	const fetchOwnedWallets = useCallback(async () => {
		if (!user?.id) {
			console.log('[MultisigWalletPage] fetchOwnedWallets: No user ID available')
			return
		}
		console.log('[MultisigWalletPage] fetchOwnedWallets: Starting, user ID:', user.id)
		setLoadingOwnedWallets(true)
		try {
			const allWallets = await multisigApi.getAllWallets()
			console.log('[MultisigWalletPage] fetchOwnedWallets: Got', allWallets.length, 'total wallets')
			const currentUserId = user.id
			console.log('[MultisigWalletPage] fetchOwnedWallets: Current user ID:', currentUserId)
			// Filter wallets where current user is an owner
			const owned = allWallets.filter((w) => {
				// Check ownerUserIds first (more reliable)
				if (w.ownerUserIds && w.ownerUserIds.length > 0) {
					const isInOwnerUserIds = w.ownerUserIds.some((id) => {
						return String(id) === currentUserId
					})
					if (isInOwnerUserIds) {
						console.log('[MultisigWalletPage] fetchOwnedWallets: Found user in ownerUserIds for wallet', w.id)
						return true
					}
				}
				// Fallback to ownerDetails if ownerUserIds is not available
				if (w.ownerDetails && w.ownerDetails.length > 0) {
					const isOwner = w.ownerDetails.some((owner) => {
						const matches = owner.userId === currentUserId
						if (matches) {
							console.log('[MultisigWalletPage] fetchOwnedWallets: Found matching owner in wallet', w.id, 'owner userId:', owner.userId)
						}
						return matches
					})
					return isOwner
				}
				console.log('[MultisigWalletPage] fetchOwnedWallets: Wallet', w.id, 'has no ownerUserIds or ownerDetails')
				return false
			})
			console.log('[MultisigWalletPage] fetchOwnedWallets: Found', owned.length, 'owned wallets')
			setOwnedWallets(owned)
		} catch (error: any) {
			console.error('[MultisigWalletPage] fetchOwnedWallets: Error:', error)
			console.warn('Không thể tải danh sách ví đang sở hữu:', error.message)
			setOwnedWallets([])
		} finally {
			setLoadingOwnedWallets(false)
		}
	}, [user?.id])

	const handleSelectOwnedWallet = useCallback(
		async (walletId: string) => {
			setWalletIdInput(walletId)
			await fetchWallet(walletId, { suppressAlert: true })
			await fetchTransactions(walletId)
		},
		[fetchWallet, fetchTransactions],
	)

	const handleLoadWallet = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!walletIdInput.trim()) {
			showAlert({
				type: 'error',
				message: 'Vui lòng nhập ID của ví multisig',
			})
			return
		}
		await fetchWallet(walletIdInput.trim())
		await fetchTransactions(walletIdInput.trim())
	}

	const handleCreateWallet = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		showAlert({
			type: 'info',
			message: 'Tính năng tạo ví chỉ dành cho admin. Vui lòng liên hệ admin để tạo ví mới.',
		})
		// Note: User page should not create wallets, only view and confirm transactions
		// This functionality is available in admin MultisigPage
	}

	const handleLinkWallet = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const payload: LinkWalletRequest = {
			name: linkForm.name.trim(),
			description: linkForm.description.trim() || undefined,
			contractAddress: linkForm.contractAddress.trim(),
		}

		if (!payload.name || !payload.contractAddress) {
			showAlert({
				type: 'error',
				message: 'Tên ví và địa chỉ contract không được để trống',
			})
			return
		}

		setLinkLoading(true)
		try {
			const linkedWallet = await multisigApi.linkWallet(payload)
			setLinkForm({
				name: '',
				description: '',
				contractAddress: '',
			})
			setWalletIdInput(linkedWallet.id)
			await fetchWallet(linkedWallet.id, { suppressAlert: true })
			await fetchTransactions(linkedWallet.id)
			showAlert({
				type: 'success',
				message: 'Liên kết ví thành công',
			})
		} catch (error: any) {
			showAlert({
				type: 'error',
				message: 'Không thể liên kết ví',
				details: error.message,
			})
		} finally {
			setLinkLoading(false)
		}
	}

	const handleSubmitTransaction = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!activeWalletId) {
			showAlert({
				type: 'error',
				message: 'Vui lòng tải thông tin ví trước',
			})
			return
		}

		const payload: SubmitTransactionRequest = {
			destination: transactionForm.destination.trim(),
			value: transactionForm.value,
			data: transactionForm.data.trim() || undefined,
		}

		if (!payload.destination || payload.value === '') {
			showAlert({
				type: 'error',
				message: 'Địa chỉ nhận và số lượng ETH không được để trống',
			})
			return
		}

		setSubmitLoading(true)
		try {
			const transaction = await multisigApi.submitTransaction(activeWalletId, payload)
			setTransactionForm({
				destination: '',
				value: '',
				data: '',
			})
			setTransactions((prev) => [transaction, ...prev])
			showAlert({
				type: 'success',
				message: 'Đã tạo giao dịch multisig mới',
			})
		} catch (error: any) {
			showAlert({
				type: 'error',
				message: 'Không thể tạo giao dịch',
				details: error.message,
			})
		} finally {
			setSubmitLoading(false)
		}
	}

	const handleConfirmTransaction = async (transactionId: string) => {
		const walletId = activeWalletId
		if (!walletId) return
		const payload: ConfirmTransactionRequest = {}
		const candidateKey = confirmKeys[transactionId]?.trim()
		if (candidateKey) {
			payload.privateKey = candidateKey
		}
		setConfirmLoading((prev) => ({ ...prev, [transactionId]: true }))
		try {
			const updated = await multisigApi.confirmTransaction(transactionId, payload)
			setTransactions((prev) =>
				prev.map((tx) => (tx.id === updated.id ? { ...tx, ...updated } : tx)),
			)
			showAlert({
				type: 'success',
				message: 'Đã xác nhận giao dịch',
			})
		} catch (error: any) {
			showAlert({
				type: 'error',
				message: 'Không thể xác nhận giao dịch',
				details: error.message,
			})
		} finally {
			setConfirmLoading((prev) => ({ ...prev, [transactionId]: false }))
		}
	}

	const handleExecuteTransaction = async (transactionId: string) => {
		if (!activeWalletId) return
		setExecuteLoading((prev) => ({ ...prev, [transactionId]: true }))
		try {
			const updated = await multisigApi.executeTransaction(transactionId)
			setTransactions((prev) =>
				prev.map((tx) => (tx.id === updated.id ? { ...tx, ...updated } : tx)),
			)
			showAlert({
				type: 'success',
				message: 'Đã thực thi giao dịch trên blockchain',
			})
		} catch (error: any) {
			showAlert({
				type: 'error',
				message: 'Không thể thực thi giao dịch',
				details: error.message,
			})
		} finally {
			setExecuteLoading((prev) => ({ ...prev, [transactionId]: false }))
		}
	}

	const pendingTransactions = useMemo(
		() => transactions.filter((tx) => tx.status !== 'executed'),
		[transactions],
	)
	const executedTransactions = useMemo(
		() => transactions.filter((tx) => tx.status === 'executed'),
		[transactions],
	)

	// Get transactions that need confirmation from current user
	const transactionsNeedingConfirmation = useMemo(() => {
		if (!wallet || !user?.id) return []
		const currentUserId = user.id
		// Find owner address for current user
		const ownerDetail = wallet.ownerDetails?.find((o) => o.userId === currentUserId)
		if (!ownerDetail) return []
		const userAddress = ownerDetail.address
		// Filter transactions that haven't been confirmed by this user yet
		return pendingTransactions.filter((tx) => {
			const confirmations = tx.confirmations || []
			return !confirmations.includes(userAddress) && tx.status !== 'executed'
		})
	}, [pendingTransactions, wallet, user?.id])

	// Fetch owned wallets on mount and when user changes
	useEffect(() => {
		console.log('[MultisigWalletPage] useEffect: user from Redux:', user)
		console.log('[MultisigWalletPage] useEffect: user?.id:', user?.id)
		fetchOwnedWallets()
	}, [fetchOwnedWallets, user])

	return (
		<div className={styles.page}>
			<div className={styles.header}>
				<h1 className={styles.headerTitle}>Ví Multisig của tôi</h1>
				<p className={styles.headerSubtitle}>
					Xem và quản lý các ví multisig mà bạn đang sở hữu. Xác nhận các giao dịch cần chữ ký của bạn
					để hoàn tất quá trình xác thực multisig.
				</p>
			</div>

			{alertState && (
				<div
					className={`${styles.alert} ${
						alertState.type === 'success'
							? styles.alertSuccess
							: alertState.type === 'error'
							? styles.alertError
							: styles.alertInfo
					}`}
				>
					<AlertCircle size={20} className={styles.alertIcon} />
					<div>
						<div className={styles.alertMessage}>{alertState.message}</div>
						{alertState.details && <div className={styles.alertDetails}>{alertState.details}</div>}
					</div>
				</div>
			)}

			{/* Tạo ví và liên kết ví chỉ dành cho admin - ẩn ở trang user */}
			{false && (
				<div className={styles.formsGrid}>
					<div className={styles.card}>
						<div className={styles.sectionTitle}>
							<Wallet size={20} />
							Tạo ví mới
						</div>
						<form className={styles.form} onSubmit={handleCreateWallet}>
						<label className={styles.formLabel}>
							Tên ví
							<input
								className={styles.input}
								type="text"
								value={createForm.name}
								onChange={(event) =>
									setCreateForm((prev) => ({ ...prev, name: event.target.value }))
								}
								placeholder="Ví Admin DAO"
								required
							/>
						</label>
						<label className={styles.formLabel}>
							Mô tả
							<textarea
								className={`${styles.input} ${styles.textarea}`}
								value={createForm.description}
								onChange={(event) =>
									setCreateForm((prev) => ({ ...prev, description: event.target.value }))
								}
								placeholder="Ghi chú nội bộ (tùy chọn)"
							/>
						</label>
						<label className={styles.formLabel}>
							Danh sách owners (mỗi dòng hoặc cách nhau bởi dấu phẩy)
							<textarea
								className={`${styles.input} ${styles.textarea} ${styles.textareaOwners}`}
								value={createForm.ownersText}
								onChange={(event) =>
									setCreateForm((prev) => ({ ...prev, ownersText: event.target.value }))
								}
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
								value={createForm.threshold}
								onChange={(event) =>
									setCreateForm((prev) => ({
										...prev,
										threshold: Number(event.target.value),
									}))
								}
								required
							/>
						</label>
						<button
							type="submit"
							className={`${styles.button} ${styles.buttonPrimary}`}
							disabled={createLoading}
						>
							<FilePlus2 size={18} />
							{createLoading ? 'Đang tạo...' : 'Tạo ví mới'}
						</button>
					</form>
				</div>

				<div className={styles.card}>
					<div className={styles.sectionTitle}>
						<Link2 size={20} />
						Liên kết ví hiện có
					</div>
					<form className={styles.form} onSubmit={handleLinkWallet}>
						<label className={styles.formLabel}>
							Tên ví
							<input
								className={styles.input}
								type="text"
								value={linkForm.name}
								onChange={(event) =>
									setLinkForm((prev) => ({ ...prev, name: event.target.value }))
								}
								placeholder="Ví cộng đồng"
								required
							/>
						</label>
						<label className={styles.formLabel}>
							Mô tả
							<textarea
								className={`${styles.input} ${styles.textarea}`}
								value={linkForm.description}
								onChange={(event) =>
									setLinkForm((prev) => ({ ...prev, description: event.target.value }))
								}
								placeholder="Ghi chú nội bộ (tùy chọn)"
							/>
						</label>
						<label className={styles.formLabel}>
							Địa chỉ contract
							<input
								className={styles.input}
								type="text"
								value={linkForm.contractAddress}
								onChange={(event) =>
									setLinkForm((prev) => ({ ...prev, contractAddress: event.target.value }))
								}
								placeholder="0x1234..."
								required
							/>
						</label>
						<button
							type="submit"
							className={`${styles.button} ${styles.buttonPrimary}`}
							disabled={linkLoading}
						>
							<Link2 size={18} />
							{linkLoading ? 'Đang liên kết...' : 'Liên kết ví'}
						</button>
					</form>
				</div>
				</div>
			)}

			<div className={styles.card}>
				<div className={styles.sectionTitle}>
					<ListChecks size={20} />
					Ví đang sở hữu {ownedWallets.length > 0 && `(${ownedWallets.length})`}
				</div>
				{loadingOwnedWallets ? (
					<div className={styles.loadingText}>Đang tải danh sách ví...</div>
				) : ownedWallets.length === 0 ? (
					<div className={styles.emptyState}>
						Bạn chưa sở hữu ví multisig nào. Vui lòng liên hệ admin để được thêm vào danh sách owner của ví.
					</div>
				) : (
					<div className={styles.ownedWalletsList}>
						{ownedWallets.map((w) => (
							<button
								key={w.id}
								type="button"
								className={`${styles.ownedWalletItem} ${
									w.id === activeWalletId ? styles.ownedWalletItemActive : ''
								}`}
								onClick={() => handleSelectOwnedWallet(w.id)}
							>
								<div className={styles.ownedWalletHeader}>
									<strong>{w.name || 'Chưa đặt tên'}</strong>
									<span className={styles.ownedWalletBadge}>
										{w.ownerDetails?.length || 0} owners • Threshold: {w.threshold}
									</span>
								</div>
								<div className={styles.ownedWalletMeta}>
									<span className={`${styles.inputMono} ${styles.inputMonoSmall}`}>
										{w.contractAddress}
									</span>
								</div>
								{w.description && (
									<div className={styles.ownedWalletDescription}>{w.description}</div>
								)}
							</button>
						))}
					</div>
				)}
			</div>

			<div className={styles.card}>
				<div className={styles.sectionTitle}>
					<Shield size={20} />
					Tải thông tin ví
				</div>
				<form className={styles.loadForm} onSubmit={handleLoadWallet}>
					<input
						className={`${styles.input} ${styles.loadFormInput}`}
						type="text"
						value={walletIdInput}
						onChange={(event) => setWalletIdInput(event.target.value)}
						placeholder="Nhập ID ví (UUID)"
					/>
					<button
						type="submit"
						className={`${styles.button} ${styles.buttonPrimary}`}
						disabled={loadingWallet}
					>
						<RefreshCcw size={18} />
						{loadingWallet ? 'Đang tải...' : 'Tải ví'}
					</button>
				</form>
			</div>

			{wallet && (
				<div className={styles.contentStack}>
					<WalletSummary
						wallet={wallet}
						onRefresh={() => {
							if (wallet.id) {
								fetchWallet(wallet.id)
								fetchTransactions(wallet.id)
							}
						}}
					/>

					<TransactionForm
						values={transactionForm}
						loading={submitLoading}
						onChange={(field, value) =>
							setTransactionForm((prev) => ({
								...prev,
								[field]: value,
							}))
						}
						onSubmit={handleSubmitTransaction}
						onReset={() =>
							setTransactionForm({
								destination: '',
								value: '',
								data: '',
							})
						}
					/>

					{transactionsNeedingConfirmation.length > 0 && (
						<div className={`${styles.card} ${styles.cardWarning}`}>
							<div className={styles.pendingHeader}>
								<div className={`${styles.sectionTitle} ${styles.sectionTitleWarning}`}>
									<CheckCircle2 size={20} />
									Giao dịch cần xác nhận ({transactionsNeedingConfirmation.length})
								</div>
								<button
									type="button"
									className={`${styles.button} ${styles.buttonSecondary}`}
									disabled={loadingTransactions}
									onClick={() => activeWalletId && fetchTransactions(activeWalletId)}
								>
									<RefreshCcw size={16} />
									Làm mới
								</button>
							</div>
							<div className={styles.transactionList}>
								{transactionsNeedingConfirmation.map((tx) => (
									<div key={tx.id} className={`${styles.transactionItem} ${styles.transactionItemWarning}`}>
										<div className={styles.transactionHeader}>
											<div className={styles.transactionMeta}>
												<strong>#{tx.txIndexOnChain}</strong>
												<span>ID: {tx.id}</span>
												<span>TX Hash: {tx.txHash || '—'}</span>
											</div>
											<div className={styles.transactionStatus}>{tx.status}</div>
										</div>
										<div className={styles.transactionGrid}>
											<div>
												<div className={styles.transactionLabel}>Gửi tới</div>
												<div className={styles.inputMono}>{tx.destination}</div>
											</div>
											<div>
												<div className={styles.transactionLabel}>Giá trị</div>
												<div>{formatWeiToEth(tx.value)} ETH</div>
											</div>
											<div>
												<div className={styles.transactionLabel}>Lượt xác nhận</div>
												<div>
													{tx.confirmations?.length || 0}/{wallet.threshold}
												</div>
											</div>
										</div>
										{tx.data && tx.data !== '0x' && (
											<div>
												<div className={styles.transactionLabel}>Dữ liệu bổ sung</div>
												<pre className={styles.transactionData}>{tx.data}</pre>
											</div>
										)}
										<div className={styles.transactionActions}>
											<label className={styles.formLabel}>
												Private key để xác nhận (tùy chọn)
												<input
													className={`${styles.input} ${styles.inputMono}`}
													type="password"
													value={confirmKeys[tx.id] || ''}
													onChange={(event) =>
														setConfirmKeys((prev) => ({ ...prev, [tx.id]: event.target.value }))
													}
													placeholder="Nếu bỏ trống sẽ dùng Service Account"
												/>
											</label>
											<div className={styles.transactionActionsButtons}>
												<button
													type="button"
													className={`${styles.button} ${styles.buttonPrimary}`}
													disabled={confirmLoading[tx.id]}
													onClick={() => handleConfirmTransaction(tx.id)}
												>
													<CheckCircle2 size={18} />
													{confirmLoading[tx.id] ? 'Đang xác nhận...' : 'Xác nhận giao dịch'}
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					<div className={styles.card}>
						<div className={styles.pendingHeader}>
							<div className={styles.sectionTitle}>
								<Wallet size={20} />
								Giao dịch chờ xử lý
							</div>
							<button
								type="button"
								className={`${styles.button} ${styles.buttonSecondary}`}
								disabled={loadingTransactions}
								onClick={() => activeWalletId && fetchTransactions(activeWalletId)}
							>
								<RefreshCcw size={16} />
								Làm mới
							</button>
						</div>
						{loadingTransactions && (
							<div className={styles.loadingText}>Đang tải danh sách giao dịch...</div>
						)}
						{!loadingTransactions && pendingTransactions.length === 0 && (
							<div className={styles.emptyState}>Không có giao dịch nào đang chờ.</div>
						)}
						<div className={styles.transactionList}>
							{pendingTransactions.map((tx) => (
								<div key={tx.id} className={styles.transactionItem}>
									<div className={styles.transactionHeader}>
										<div className={styles.transactionMeta}>
											<strong>#{tx.txIndexOnChain}</strong>
											<span>ID: {tx.id}</span>
											<span>TX Hash: {tx.txHash || '—'}</span>
										</div>
										<div className={styles.transactionStatus}>{tx.status}</div>
									</div>
									<div className={styles.transactionGrid}>
										<div>
											<div className={styles.transactionLabel}>Gửi tới</div>
											<div className={styles.inputMono}>{tx.destination}</div>
										</div>
										<div>
											<div className={styles.transactionLabel}>Giá trị</div>
											<div>{formatWeiToEth(tx.value)} ETH</div>
										</div>
										<div>
											<div className={styles.transactionLabel}>Lượt xác nhận</div>
											<div>
												{tx.confirmations?.length || 0}/{wallet.threshold}
											</div>
										</div>
									</div>
									{tx.data && tx.data !== '0x' && (
										<div>
											<div className={styles.transactionLabel}>Dữ liệu bổ sung</div>
											<pre className={styles.transactionData}>{tx.data}</pre>
										</div>
									)}
									<div className={styles.transactionActions}>
										<label className={styles.formLabel}>
											Private key để xác nhận (tùy chọn)
											<input
												className={`${styles.input} ${styles.inputMono}`}
												type="password"
												value={confirmKeys[tx.id] || ''}
												onChange={(event) =>
													setConfirmKeys((prev) => ({ ...prev, [tx.id]: event.target.value }))
												}
												placeholder="Nếu bỏ trống sẽ dùng Service Account"
											/>
										</label>
										<div className={styles.transactionActionsButtons}>
											<button
												type="button"
												className={`${styles.button} ${styles.buttonPrimary}`}
												disabled={confirmLoading[tx.id]}
												onClick={() => handleConfirmTransaction(tx.id)}
											>
												<CheckCircle2 size={18} />
												{confirmLoading[tx.id] ? 'Đang xác nhận...' : 'Xác nhận'}
											</button>
											<button
												type="button"
												className={`${styles.button} ${styles.buttonSecondary}`}
												onClick={() => handleExecuteTransaction(tx.id)}
												disabled={
													executeLoading[tx.id] ||
													(tx.confirmations?.length || 0) < wallet.threshold
												}
											>
												<Play size={18} />
												{executeLoading[tx.id] ? 'Đang thực thi...' : 'Thực thi giao dịch'}
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className={styles.card}>
						<div className={styles.sectionTitle}>
							<CheckCircle2 size={20} />
							Giao dịch đã hoàn tất
						</div>
						{executedTransactions.length === 0 ? (
							<div className={styles.emptyState}>Chưa có giao dịch nào được thực thi.</div>
						) : (
							<div className={styles.executedList}>
								{executedTransactions.map((tx) => (
									<div key={tx.id} className={styles.executedItem}>
										<div>
											<div className={styles.transactionLabel}>ID</div>
											<div className={styles.inputMono}>{tx.id}</div>
										</div>
										<div>
											<div className={styles.transactionLabel}>TX Hash</div>
											<div className={styles.inputMono}>{tx.txHash || '—'}</div>
										</div>
										<div>
											<div className={styles.transactionLabel}>Giá trị (ETH)</div>
											<div>{formatWeiToEth(tx.value)}</div>
										</div>
										<div>
											<div className={styles.transactionLabel}>Thời gian cập nhật</div>
											<div>{tx.updatedAt ? new Date(tx.updatedAt).toLocaleString() : '—'}</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export default MultisigWalletPage

import { useState, useCallback, useEffect, useMemo } from 'react'
import multisigApi, {
	ConfirmTransactionRequest,
	CreateWalletRequest,
	LinkWalletRequest,
	MultisigTransaction,
	MultisigWallet,
	OwnerCredentialResponse,
	SubmitTransactionRequest,
} from '@/features/blockchain/api'
import { getAllUsers } from '@/features/users/api'
import { formatWeiToEth } from '@/features/blockchain/utils/multisig'

export type TrackedWallet = MultisigWallet & { lastLoadedAt?: string; ownerUserIds?: string[] }

export type AlertState = {
	type: 'success' | 'error' | 'info'
	message: string
	details?: string
} | null

export type TransactionFilters = {
	status: 'all' | 'submitted' | 'confirmed' | 'executed' | 'failed'
	search: string
}

export type CreateForm = {
	name: string
	description: string
	ownerUserIdsText: string
	threshold: number
}

export type LinkForm = {
	name: string
	description: string
	contractAddress: string
	ownerUserIdsText: string
}

export type TransactionForm = {
	destination: string
	value: string
	data: string
	description: string
}

export const parseOwnerUserIds = (input: string): number[] => {
	return input
		.split(/[,\n]/)
		.map((s) => s.trim())
		.filter((s) => s.length > 0 && !isNaN(Number(s)))
		.map((s) => Number(s))
}

export function useMultisig() {
	// UI alert state
	const [alertState, setAlertState] = useState<AlertState>(null)
	const showAlert = useCallback((alert: AlertState) => {
		setAlertState(alert)
		if (alert) {
			setTimeout(() => setAlertState(null), 5000)
		}
	}, [])

	// Loading states
	const [createLoading, setCreateLoading] = useState(false)
	const [linkLoading, setLinkLoading] = useState(false)
	const [loadingWallet, setLoadingWallet] = useState(false)
	const [transactionsLoading, setTransactionsLoading] = useState(false)
	const [submitLoading, setSubmitLoading] = useState(false)
	const [confirmLoading, setConfirmLoading] = useState<Record<string, boolean>>({})
	const [executeLoading, setExecuteLoading] = useState<Record<string, boolean>>({})
	const [credentialLoading, setCredentialLoading] = useState(false)
	const [allWalletsLoading, setAllWalletsLoading] = useState(false)
	const [availableUsersLoading, setAvailableUsersLoading] = useState(false)

	// Core data state
	const [walletIdInput, setWalletIdInput] = useState('')
	const [activeWalletId, setActiveWalletId] = useState<string | null>(null)
	const [wallet, setWallet] = useState<MultisigWallet | null>(null)
	const [trackedWallets, setTrackedWallets] = useState<TrackedWallet[]>([])
	const [allWallets, setAllWallets] = useState<MultisigWallet[]>([])
	const [availableUsers, setAvailableUsers] = useState<any[]>([])
	const [transactions, setTransactions] = useState<MultisigTransaction[]>([])
	const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
	const [ownerCredential, setOwnerCredential] = useState<OwnerCredentialResponse | null>(null)
	const [useManualInput, setUseManualInput] = useState(false)
	const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
	const [confirmKeys, setConfirmKeys] = useState<Record<string, string>>({})
	const [transactionFilters, setTransactionFilters] = useState<TransactionFilters>({
		status: 'all',
		search: '',
	})

	// Form states
	const [createForm, setCreateForm] = useState<CreateForm>({
		name: '',
		description: '',
		ownerUserIdsText: '',
		threshold: 1,
	})

	const [linkForm, setLinkForm] = useState<LinkForm>({
		name: '',
		description: '',
		contractAddress: '',
		ownerUserIdsText: '',
	})

	const [transactionForm, setTransactionForm] = useState<TransactionForm>({
		destination: '',
		value: '',
		data: '',
		description: '',
	})

	// Helper: extract ownerUserIds from ownerDetails
	const extractOwnerUserIds = useCallback((w: MultisigWallet): string[] => {
		if (w.ownerDetails && w.ownerDetails.length > 0) {
			return w.ownerDetails.map(owner => owner.userId).filter((id): id is string => id != null)
		}
		return []
	}, [])

	// Upsert wallet into tracked list
	const upsertTrackedWallet = useCallback((next: MultisigWallet, loadedAt?: string) => {
		setTrackedWallets((prev) => {
			const ownerUserIds = extractOwnerUserIds(next)
			const exists = prev.find((item) => item.id === next.id)
			if (exists) {
				return prev.map((item) =>
					item.id === next.id
						? { ...next, ownerUserIds, lastLoadedAt: loadedAt ?? item.lastLoadedAt }
						: item,
				)
			}
			return [{ ...next, ownerUserIds, lastLoadedAt: loadedAt }, ...prev]
		})
	}, [extractOwnerUserIds])

	// Fetch all wallets
	const fetchAllWallets = useCallback(async () => {
		setAllWalletsLoading(true)
		try {
			const wallets = await multisigApi.getAllWallets()
			setAllWallets(wallets)
			setTrackedWallets(wallets.map((w) => {
				const ownerUserIds = w.ownerDetails
					? w.ownerDetails.map(owner => owner.userId).filter((id): id is string => id != null)
					: []
				return { ...w, ownerUserIds, lastLoadedAt: new Date().toISOString() }
			}))
		} catch (error: any) {
			showAlert({ type: 'error', message: 'Không thể tải danh sách ví', details: error.message })
		} finally {
			setAllWalletsLoading(false)
		}
	}, [showAlert])

	// Fetch available users
	const fetchAvailableUsers = useCallback(async () => {
		setAvailableUsersLoading(true)
		try {
			const users = await getAllUsers()
			setAvailableUsers(users)
		} catch (error: any) {
			console.warn('Không thể tải danh sách người dùng:', error.message)
			setAvailableUsers([])
		} finally {
			setAvailableUsersLoading(false)
		}
	}, [])

	// Fetch single wallet
	const fetchWallet = useCallback(
		async (wId: string, options?: { suppressAlert?: boolean; track?: boolean }) => {
			if (!wId) return
			setLoadingWallet(true)
			try {
				const data = await multisigApi.getWalletById(wId)
				setWallet(data)
				setActiveWalletId(wId)
				const now = new Date().toISOString()
				if (options?.track !== false) upsertTrackedWallet(data, now)
				if (!options?.suppressAlert) {
					showAlert({ type: 'success', message: 'Đã tải thông tin ví multisig' })
				}
			} catch (error: any) {
				setWallet(null)
				showAlert({ type: 'error', message: 'Không thể tải ví multisig', details: error.message })
			} finally {
				setLoadingWallet(false)
			}
		},
		[showAlert, upsertTrackedWallet],
	)

	// Fetch transactions
	const fetchTransactions = useCallback(
		async (wId: string) => {
			if (!wId) return
			setTransactionsLoading(true)
			try {
				const data = await multisigApi.getTransactionsByWallet(wId)
				if (!Array.isArray(data)) throw new Error('Dữ liệu giao dịch không đúng định dạng')
				const sorted = [...data].sort((a, b) => {
					const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
					const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
					return bTime - aTime
				})
				setTransactions(sorted)
				setLastSyncedAt(new Date().toISOString())
			} catch (error: any) {
				showAlert({ type: 'error', message: 'Không thể tải danh sách giao dịch', details: error.message })
			} finally {
				setTransactionsLoading(false)
			}
		},
		[showAlert],
	)

	// Create wallet
	const handleCreateWallet = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		let ownerUserIds: number[] = []

		if (useManualInput) {
			ownerUserIds = parseOwnerUserIds(createForm.ownerUserIdsText)
			if (ownerUserIds.length === 0) {
				showAlert({ type: 'error', message: 'Vui lòng nhập ít nhất 1 ID người dùng hợp lệ (ví dụ: 1,2,3)' })
				return
			}
		} else {
			if (selectedUserIds.length === 0) {
				showAlert({ type: 'error', message: 'Vui lòng chọn ít nhất 1 người dùng làm chủ sở hữu' })
				return
			}
			ownerUserIds = selectedUserIds
		}

		const payload: CreateWalletRequest = {
			name: createForm.name.trim(),
			description: createForm.description.trim() || undefined,
			ownerUserIds,
			threshold: Number(createForm.threshold),
		}

		if (!payload.name) {
			showAlert({ type: 'error', message: 'Tên ví không được để trống' })
			return
		}

		if (Number.isNaN(payload.threshold) || payload.threshold < 1) {
			showAlert({ type: 'error', message: 'Ngưỡng chữ ký phải là số nguyên dương' })
			return
		}

		setCreateLoading(true)
		try {
			const newWallet = await multisigApi.createWallet(payload)
			setCreateForm({ name: '', description: '', ownerUserIdsText: '', threshold: 1 })
			setSelectedUserIds([])
			setUseManualInput(false)
			setWalletIdInput(newWallet.id)
			await fetchWallet(newWallet.id, { suppressAlert: true })
			await fetchTransactions(newWallet.id)
			showAlert({ type: 'success', message: 'Tạo ví multisig thành công' })
		} catch (error: any) {
			showAlert({ type: 'error', message: 'Không thể tạo ví multisig', details: error.message })
		} finally {
			setCreateLoading(false)
		}
	}

	// Link wallet
	const handleLinkWallet = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const ownerUserIds = parseOwnerUserIds(linkForm.ownerUserIdsText)
		const payload: LinkWalletRequest = {
			name: linkForm.name.trim(),
			description: linkForm.description.trim() || undefined,
			contractAddress: linkForm.contractAddress.trim(),
			...(ownerUserIds.length > 0 && { ownerUserIds }),
		}

		if (!payload.name || !payload.contractAddress) {
			showAlert({ type: 'error', message: 'Tên ví và địa chỉ contract không được để trống' })
			return
		}

		setLinkLoading(true)
		try {
			const linkedWallet = await multisigApi.linkWallet(payload)
			setLinkForm({ name: '', description: '', contractAddress: '', ownerUserIdsText: '' })
			setWalletIdInput(linkedWallet.id)
			await fetchWallet(linkedWallet.id, { suppressAlert: true })
			await fetchTransactions(linkedWallet.id)
			showAlert({ type: 'success', message: 'Liên kết ví multisig thành công' })
		} catch (error: any) {
			showAlert({ type: 'error', message: 'Không thể liên kết ví multisig', details: error.message })
		} finally {
			setLinkLoading(false)
		}
	}

	// Load wallet by ID
	const handleLoadWallet = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!walletIdInput.trim()) {
			showAlert({ type: 'error', message: 'Vui lòng nhập ID ví multisig hoặc chọn từ danh sách theo dõi' })
			return
		}
		await fetchWallet(walletIdInput.trim())
		await fetchTransactions(walletIdInput.trim())
	}

	// Select tracked wallet
	const handleSelectTrackedWallet = async (wId: string) => {
		setWalletIdInput(wId)
		await fetchWallet(wId, { suppressAlert: true })
		await fetchTransactions(wId)
		showAlert({ type: 'info', message: 'Đã chuyển tới ví được theo dõi' })
	}

	// Submit transaction
	const handleSubmitTransaction = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!activeWalletId) {
			showAlert({ type: 'error', message: 'Vui lòng tải thông tin ví trước' })
			return
		}

		const payload: SubmitTransactionRequest = {
			destination: transactionForm.destination.trim(),
			value: transactionForm.value,
			data: transactionForm.data.trim() || undefined,
			description: transactionForm.description.trim() || undefined,
		}

		if (!payload.destination || payload.value === '') {
			showAlert({ type: 'error', message: 'Địa chỉ nhận và số lượng ETH không được để trống' })
			return
		}

		setSubmitLoading(true)
		try {
			await multisigApi.submitTransaction(activeWalletId, payload)
			setTransactionForm({ destination: '', value: '', data: '', description: '' })
			await fetchTransactions(activeWalletId)
			showAlert({ type: 'success', message: 'Đã tạo giao dịch multisig mới' })
		} catch (error: any) {
			showAlert({ type: 'error', message: 'Không thể tạo giao dịch', details: error.message })
		} finally {
			setSubmitLoading(false)
		}
	}

	// Confirm transaction
	const handleConfirmTransaction = async (transactionId: string) => {
		const wId = activeWalletId
		if (!wId) return
		if (confirmLoading[transactionId]) return

		const payload: ConfirmTransactionRequest = {}
		const candidateKey = confirmKeys[transactionId]?.trim()
		if (candidateKey && candidateKey.length > 0) {
			payload.privateKey = candidateKey
		}
		setConfirmLoading((prev) => ({ ...prev, [transactionId]: true }))
		try {
			const updated = await multisigApi.confirmTransaction(transactionId, payload)
			setTransactions((prev) =>
				prev.map((tx) => (tx.id === updated.id ? { ...tx, ...updated } : tx)),
			)
			if (activeWalletId) await fetchTransactions(activeWalletId)
			showAlert({ type: 'success', message: 'Đã xác nhận giao dịch thành công' })
		} catch (error: any) {
			const errorMessage = error.response?.data?.message || error.message || 'Không thể xác nhận giao dịch'
			showAlert({ type: 'error', message: 'Không thể xác nhận giao dịch', details: errorMessage })
		} finally {
			setConfirmLoading((prev) => ({ ...prev, [transactionId]: false }))
		}
	}

	// Execute transaction
	const handleExecuteTransaction = async (transactionId: string) => {
		if (!activeWalletId) return
		setExecuteLoading((prev) => ({ ...prev, [transactionId]: true }))
		try {
			const updated = await multisigApi.executeTransaction(transactionId)
			setTransactions((prev) =>
				prev.map((tx) => (tx.id === updated.id ? { ...tx, ...updated } : tx)),
			)
			showAlert({ type: 'success', message: 'Đã thực thi giao dịch trên blockchain' })
		} catch (error: any) {
			showAlert({ type: 'error', message: 'Không thể thực thi giao dịch', details: error.message })
		} finally {
			setExecuteLoading((prev) => ({ ...prev, [transactionId]: false }))
		}
	}

	// Get owner credential
	const handleGetOwnerCredential = async () => {
		if (!activeWalletId) return
		setCredentialLoading(true)
		try {
			const credential = await multisigApi.getOwnerCredential(activeWalletId)
			setOwnerCredential(credential)
			showAlert({ type: 'success', message: 'Lấy thông tin credential thành công' })
		} catch (error: any) {
			showAlert({ type: 'error', message: 'Không thể lấy thông tin credential', details: error.message })
		} finally {
			setCredentialLoading(false)
		}
	}

	// Refresh current wallet and transactions
	const handleRefresh = useCallback(async () => {
		if (activeWalletId) {
			await fetchWallet(activeWalletId, { suppressAlert: true })
			await fetchTransactions(activeWalletId)
		}
	}, [activeWalletId, fetchWallet, fetchTransactions])

	// Computed: pending / executed
	const pendingTransactions = useMemo(
		() => transactions.filter((tx) => tx.status !== 'executed'),
		[transactions],
	)

	const executedTransactions = useMemo(
		() => transactions.filter((tx) => tx.status === 'executed'),
		[transactions],
	)

	// Computed: filtered transactions
	const filteredTransactions = useMemo(() => {
		const searchText = transactionFilters.search.trim().toLowerCase()
		return transactions.filter((tx) => {
			if (transactionFilters.status !== 'all' && tx.status !== transactionFilters.status) return false
			if (searchText) {
				let target = `${tx.id} ${tx.destination} ${tx.txHash ?? ''} ${tx.txIndexOnChain}`.toLowerCase()
				if (wallet?.ownerDetails && wallet.ownerDetails.length > 0) {
					const ownerEmails = wallet.ownerDetails
						.map(owner => {
							if (owner.identity?.email) return owner.identity.email
							if (availableUsers && availableUsers.length > 0) {
								const user = availableUsers.find(u =>
									u.id?.toString() === owner.userId?.toString() ||
									u.userId?.toString() === owner.userId?.toString()
								)
								return user?.email || ''
							}
							return ''
						})
						.filter(email => email)
						.join(' ')
					target += ' ' + ownerEmails.toLowerCase()
					const ownerAddresses = wallet.ownerDetails
						.map(owner => owner.address || '')
						.filter(addr => addr)
						.join(' ')
					target += ' ' + ownerAddresses.toLowerCase()
					if (tx.confirmations && tx.confirmations.length > 0) {
						target += ' ' + tx.confirmations.join(' ').toLowerCase()
					}
				}
				if (!target.includes(searchText)) return false
			}
			return true
		})
	}, [transactions, transactionFilters, wallet, availableUsers])

	// Computed: total wallet value
	const totalWalletValue = useMemo(() => {
		try {
			const wei = transactions.reduce((acc, tx) => {
				const numericValue = tx.value ?? '0'
				return acc + BigInt(numericValue)
			}, BigInt(0))
			return formatWeiToEth(wei.toString())
		} catch {
			return '0'
		}
	}, [transactions])

	// Computed: ready to execute count
	const readyToExecuteCount = useMemo(() => {
		if (!wallet) return 0
		return pendingTransactions.filter(
			(tx) => (tx.confirmations?.length || 0) >= wallet.threshold && tx.status !== 'executed',
		).length
	}, [pendingTransactions, wallet])

	// Computed: used user IDs
	const usedUserIds = useMemo(() => {
		const ids = new Set<number>()
		trackedWallets.forEach(w => {
			if (w.ownerUserIds && w.ownerUserIds.length > 0) {
				w.ownerUserIds.forEach(id => {
					const idNum = typeof id === 'string' ? parseInt(id, 10) : id
					if (!isNaN(idNum)) ids.add(idNum)
				})
			}
		})
		return ids
	}, [trackedWallets])

	// Computed: available users for selection (excluding used ones)
	const availableUsersForSelection = useMemo(() => {
		return availableUsers.filter(user => !usedUserIds.has(user.id))
	}, [availableUsers, usedUserIds])

	// Auto-remove selected user IDs that are already used
	useEffect(() => {
		if (selectedUserIds.length > 0 && usedUserIds.size > 0) {
			const validSelectedIds = selectedUserIds.filter(id => !usedUserIds.has(id))
			if (validSelectedIds.length !== selectedUserIds.length) {
				setSelectedUserIds(validSelectedIds)
			}
		}
	}, [usedUserIds, selectedUserIds])

	// Initial fetch
	useEffect(() => {
		fetchAllWallets()
		fetchAvailableUsers()
	}, [fetchAllWallets, fetchAvailableUsers])

	// Auto-fetch transactions when activeWalletId changes
	useEffect(() => {
		if (activeWalletId && wallet && wallet.id === activeWalletId) {
			fetchTransactions(activeWalletId)
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeWalletId])

	const latestLoadedWallet = trackedWallets.find((item) => item.id === activeWalletId) || null

	return {
		// Alert
		alertState,
		// Loading
		createLoading,
		linkLoading,
		loadingWallet,
		transactionsLoading,
		submitLoading,
		confirmLoading,
		executeLoading,
		credentialLoading,
		allWalletsLoading,
		availableUsersLoading,
		// Forms
		createForm,
		setCreateForm,
		linkForm,
		setLinkForm,
		transactionForm,
		setTransactionForm,
		// Data
		walletIdInput,
		setWalletIdInput,
		activeWalletId,
		setActiveWalletId,
		wallet,
		trackedWallets,
		allWallets,
		availableUsers,
		transactions,
		lastSyncedAt,
		ownerCredential,
		setOwnerCredential,
		useManualInput,
		setUseManualInput,
		selectedUserIds,
		setSelectedUserIds,
		confirmKeys,
		setConfirmKeys,
		transactionFilters,
		setTransactionFilters,
		// Computed
		pendingTransactions,
		executedTransactions,
		filteredTransactions,
		totalWalletValue,
		readyToExecuteCount,
		usedUserIds,
		availableUsersForSelection,
		latestLoadedWallet,
		// Actions
		handleCreateWallet,
		handleLinkWallet,
		handleLoadWallet,
		handleSelectTrackedWallet,
		handleSubmitTransaction,
		handleConfirmTransaction,
		handleExecuteTransaction,
		handleGetOwnerCredential,
		handleRefresh,
	}
}

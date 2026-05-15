import { useState, useEffect, useCallback } from 'react'
import { getAvailableGifts, getBalance, type GiftItem } from '@/features/rewards/api'

export function useRewardStore(userId?: string) {
	const [gifts, setGifts] = useState<GiftItem[]>([])
	const [filteredGifts, setFilteredGifts] = useState<GiftItem[]>([])
	const [selectedCategory, setSelectedCategory] = useState<string>('all')
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null)
	const [quantity, setQuantity] = useState(1)
	const [deliveryAddress, setDeliveryAddress] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isRedeeming, setIsRedeeming] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)
	const [step, setStep] = useState<'browse' | 'confirm' | 'success'>('browse')
	const [currentBalance, setCurrentBalance] = useState(0)
	const [loadingBalance, setLoadingBalance] = useState(false)

	const categories = [
		{ value: 'all', label: 'Tất cả' },
		{ value: 'electronics', label: 'Điện tử' },
		{ value: 'voucher', label: 'Voucher' },
		{ value: 'course', label: 'Khóa học' },
		{ value: 'physical', label: 'Quà tặng' },
		{ value: 'other', label: 'Khác' },
	]

	const loadBalance = useCallback(async () => {
		if (!userId) return
		setLoadingBalance(true)
		try {
			const balanceData = await getBalance(userId)
			setCurrentBalance(balanceData.balance || 0)
		} catch (err) {
			console.error('Error loading balance:', err)
			setError('Không thể tải số dư')
		} finally {
			setLoadingBalance(false)
		}
	}, [userId])

	const loadGifts = useCallback(async () => {
		setIsLoading(true)
		setError(null)
		try {
			const data = await getAvailableGifts()
			setGifts(data)
			setFilteredGifts(data)
		} catch (err) {
			console.error('Error loading gifts:', err)
			setError('Không thể tải danh sách quà tặng')
		} finally {
			setIsLoading(false)
		}
	}, [])

	const filterGifts = useCallback(() => {
		let filtered = gifts
		if (selectedCategory !== 'all') {
			filtered = filtered.filter((g) => g.category === selectedCategory)
		}
		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			filtered = filtered.filter(
				(g) =>
					g.name.toLowerCase().includes(query) ||
					g.description.toLowerCase().includes(query)
			)
		}
		setFilteredGifts(filtered)
	}, [gifts, selectedCategory, searchQuery])

	useEffect(() => {
		loadGifts()
		if (userId) loadBalance()
	}, [loadGifts, loadBalance, userId])

	useEffect(() => {
		filterGifts()
	}, [filterGifts])

	const selectGift = useCallback((gift: GiftItem | null) => {
		setSelectedGift(gift)
		setStep(gift ? 'browse' : 'browse')
		setQuantity(1)
		setDeliveryAddress('')
		setSuccess(false)
	}, [])

	const resetForm = useCallback(() => {
		setStep('browse')
		setSelectedGift(null)
		setQuantity(1)
		setDeliveryAddress('')
		setSuccess(false)
		setError(null)
	}, [])

	return {
		// State
		gifts,
		filteredGifts,
		selectedCategory,
		searchQuery,
		selectedGift,
		quantity,
		deliveryAddress,
		isLoading,
		isRedeeming,
		error,
		success,
		step,
		currentBalance,
		loadingBalance,
		categories,
		// Actions
		setSelectedCategory,
		setSearchQuery,
		selectGift,
		setQuantity,
		setDeliveryAddress,
		setStep,
		setSuccess,
		setError,
		resetForm,
		loadGifts,
		loadBalance,
	}
}

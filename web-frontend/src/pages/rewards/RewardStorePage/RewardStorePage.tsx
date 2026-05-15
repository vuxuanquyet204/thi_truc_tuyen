import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Gift, ShoppingCart, Loader2, CheckCircle, AlertCircle, Search, ArrowLeft } from 'lucide-react'
import { useAppSelector } from '@/foundation/store/hooks'
import { useRewardStore } from '@/features/rewards/hooks'
import { spendTokens } from '@/features/rewards/api'
import styles from './RewardStorePage.module.css'

export default function RewardStorePage(): JSX.Element {
	const navigate = useNavigate()
	const { user } = useAppSelector((state) => state.auth)
	const userId = user?.id

	const {
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
		categories,
		setSelectedCategory,
		setSearchQuery,
		selectGift,
		setQuantity,
		setDeliveryAddress,
		setStep,
		setSuccess,
		setError,
		resetForm,
		loadBalance,
	} = useRewardStore(userId)

	const handleSelectGift = useCallback((gift: any) => {
		selectGift(gift)
		setStep('confirm')
		setError(null)
	}, [selectGift, setStep, setError])

	const handleConfirmRedeem = useCallback(async () => {
		if (!selectedGift) {
			setError('Thông tin không hợp lệ')
			return
		}

		const totalCost = selectedGift.tokenPrice * quantity

		if (totalCost > currentBalance) {
			setError('Số dư không đủ để đổi quà này')
			return
		}

		if (selectedGift.category === 'physical' && !deliveryAddress.trim()) {
			setError('Vui lòng nhập địa chỉ giao hàng')
			return
		}

		try {
			if (!userId) {
				throw new Error('User ID không tồn tại. Vui lòng đăng nhập lại.')
			}
			await spendTokens({
				studentId: userId,
				amount: totalCost,
				reasonCode: 'PURCHASE',
				relatedId: selectedGift.id,
			})

			await loadBalance()
			setStep('success')
			setSuccess(true)
		} catch (err: any) {
			setError(err.message || 'Không thể đổi quà')
		}
	}, [selectedGift, quantity, currentBalance, deliveryAddress, userId, loadBalance, setStep, setSuccess, setError])

	const resetPage = useCallback(() => {
		resetForm()
		setSearchQuery('')
	}, [resetForm, setSearchQuery])

	return (
		<div className={styles.page}>
			<div className={styles.container}>
				<div className={styles.header}>
					<div className={styles.headerLeft}>
						<button
							onClick={() => navigate('/user/prepare')}
							className={styles.backButton}
						>
							<ArrowLeft className={styles.backButtonIcon} />
						</button>
						<h1 className={styles.headerTitle}>
							<Gift className={styles.headerTitleIcon} />
							Cửa hàng quà tặng
						</h1>
					</div>
					<div className={styles.balanceBadge}>
						{currentBalance.toLocaleString()} token
					</div>
				</div>

				{step === 'browse' && (
					<div className={styles.contentCard}>
						<div className={styles.searchFilterSection}>
							<div className={styles.searchContainer}>
								<Search className={styles.searchIcon} />
								<input
									type="text"
									placeholder="Tìm kiếm quà tặng..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className={styles.searchInput}
								/>
							</div>

							<div className={styles.categoriesContainer}>
								{categories.map((cat) => (
									<button
										key={cat.value}
										onClick={() => setSelectedCategory(cat.value)}
										className={`${styles.categoryButton} ${
											selectedCategory === cat.value
												? styles.categoryButtonActive
												: styles.categoryButtonInactive
										}`}
									>
										{cat.label}
									</button>
								))}
							</div>
						</div>

						{isLoading ? (
							<div className={styles.loadingContainer}>
								<Loader2 className={styles.loadingSpinner} />
							</div>
						) : filteredGifts.length === 0 ? (
							<div className={styles.emptyState}>
								<Gift className={styles.emptyStateIcon} />
								<p className={styles.emptyStateText}>
									Không tìm thấy quà tặng nào
								</p>
							</div>
						) : (
							<div className={styles.giftsGrid}>
								{filteredGifts.map((gift) => (
									<div
										key={gift.id}
										onClick={() => handleSelectGift(gift)}
										className={styles.giftCard}
									>
										<div className={styles.giftImage}>
											<Gift className={styles.giftImageIcon} />
										</div>
										<div className={styles.giftContent}>
											<h4 className={styles.giftName}>{gift.name}</h4>
											<p className={styles.giftDescription}>{gift.description}</p>
											<div className={styles.giftFooter}>
												<span className={styles.giftPrice}>{gift.tokenPrice} token</span>
												<span className={styles.giftStock}>Còn {gift.stockQuantity}</span>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{step === 'confirm' && selectedGift && (
					<div className={styles.confirmCard}>
						<h2 className={styles.confirmTitle}>Xác nhận đổi quà</h2>

						<div className={styles.confirmGiftInfo}>
							<h3 className={styles.confirmGiftName}>{selectedGift.name}</h3>
							<p className={styles.confirmGiftDescription}>{selectedGift.description}</p>

							<div className={styles.formGroup}>
								<label className={styles.formLabel}>Số lượng</label>
								<input
									type="number"
									min="1"
									max={selectedGift.stockQuantity}
									value={quantity}
									onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
									className={styles.formInput}
								/>
							</div>

							{selectedGift.category === 'physical' && (
								<div className={styles.formGroup}>
									<label className={styles.formLabel}>Địa chỉ giao hàng</label>
									<textarea
										value={deliveryAddress}
										onChange={(e) => setDeliveryAddress(e.target.value)}
										placeholder="Nhập địa chỉ nhận hàng"
										rows={3}
										className={`${styles.formInput} ${styles.formTextarea}`}
									/>
								</div>
							)}

							<div className={styles.confirmTotal}>
								<span className={styles.confirmTotalLabel}>Tổng cộng</span>
								<span className={styles.confirmTotalValue}>
									{(selectedGift.tokenPrice * quantity).toLocaleString()} token
								</span>
							</div>
						</div>

						{error && (
							<div className={styles.errorAlert}>
								<AlertCircle className={styles.errorAlertIcon} />
								{error}
							</div>
						)}

						<div className={styles.confirmActions}>
							<button
								onClick={() => setStep('browse')}
								disabled={isRedeeming}
								className={`${styles.confirmButton} ${styles.confirmButtonSecondary}`}
							>
								Quay lại
							</button>
							<button
								onClick={handleConfirmRedeem}
								disabled={isRedeeming}
								className={`${styles.confirmButton} ${styles.confirmButtonPrimary} ${
									isRedeeming ? styles.confirmButtonLoading : ''
								}`}
							>
								{isRedeeming ? (
									<>
										<Loader2 className={styles.confirmButtonSpinner} />
										Đang xử lý...
									</>
								) : (
									'Xác nhận đổi quà'
								)}
							</button>
						</div>
					</div>
				)}

				{step === 'success' && (
					<div className={styles.successCard}>
						<CheckCircle className={styles.successIcon} />
						<h3 className={styles.successTitle}>Đổi quà thành công!</h3>
						<p className={styles.successMessage}>
							Quà tặng của bạn sẽ được giao trong thời gian sớm nhất
						</p>
						<div className={styles.successActions}>
							<button
								onClick={resetPage}
								className={`${styles.successButton} ${styles.successButtonSecondary}`}
							>
								Đổi quà khác
							</button>
							<button
								onClick={() => navigate('/user/prepare')}
								className={`${styles.successButton} ${styles.successButtonPrimary}`}
							>
								Về trang chủ
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Gift, ShoppingCart, Loader2, CheckCircle, AlertCircle, Search } from 'lucide-react'
import { type GiftItem, getAvailableGifts } from '@/features/rewards/api'
import { getBalance, spendTokens } from '@/features/rewards/api'

interface RewardStoreModalProps {
    isOpen: boolean
    onClose: () => void
    userId?: string
}

export default function RewardStoreModal({
    isOpen,
    onClose,
    userId
}: RewardStoreModalProps): JSX.Element | null {
    const [currentBalance, setCurrentBalance] = useState(0)
    const [loadingBalance, setLoadingBalance] = useState(false)
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

    const categories = [
        { value: 'all', label: 'Tất cả' },
        { value: 'electronics', label: 'Điện tử' },
        { value: 'voucher', label: 'Voucher' },
        { value: 'course', label: 'Khóa học' },
        { value: 'physical', label: 'Quà tặng' },
        { value: 'other', label: 'Khác' }
    ]

    useEffect(() => {
        if (isOpen) {
            loadGifts()
            loadBalance()
        }
    }, [isOpen, userId])

    const loadBalance = async () => {
        if (!userId) return
        
        setLoadingBalance(true)
        try {
            const balanceData = await getBalance(userId)
            setCurrentBalance(balanceData.balance || 0)
        } catch (err) {
            console.error('Error loading balance:', err)
            setCurrentBalance(0)
        } finally {
            setLoadingBalance(false)
        }
    }

    useEffect(() => {
        filterGifts()
    }, [gifts, selectedCategory, searchQuery])

    const loadGifts = async () => {
        setIsLoading(true)
        try {
            const giftsData = await getAvailableGifts()
            setGifts(giftsData)
        } catch (err) {
            console.error('Error loading gifts:', err)
            setError('Không thể tải danh sách quà tặng')
            setGifts([])
        } finally {
            setIsLoading(false)
        }
    }

    const filterGifts = () => {
        let filtered = gifts

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(g => g.category === selectedCategory)
        }

        if (searchQuery) {
            filtered = filtered.filter(g =>
                g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                g.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredGifts(filtered)
    }

    const handleSelectGift = (gift: GiftItem) => {
        setSelectedGift(gift)
        setQuantity(1)
        setDeliveryAddress('')
        setError(null)
        setStep('confirm')
    }

    const handleConfirmRedeem = async () => {
        if (!selectedGift || !userId) {
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

        setIsRedeeming(true)
        setError(null)

        try {
            // Call API to spend tokens
            await spendTokens({
                studentId: userId,
                amount: totalCost,
                reasonCode: 'PURCHASE',
                relatedId: selectedGift.id
            })

            // Refresh balance after purchase
            await loadBalance()
            
            setStep('success')
            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Không thể đổi quà')
        } finally {
            setIsRedeeming(false)
        }
    }

    const resetModal = () => {
        setSelectedGift(null)
        setQuantity(1)
        setDeliveryAddress('')
        setError(null)
        setSuccess(false)
        setStep('browse')
        setSearchQuery('')
    }

    const handleClose = () => {
        resetModal()
        onClose()
    }

    if (!isOpen) return null

    const modalContent = (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000, // Higher than header (9999)
            padding: '20px',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: 'var(--card)',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '1200px',
                width: '100%',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-xl)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '20px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Gift style={{ width: '24px', height: '24px', color: 'var(--primary)' }} />
                        Cửa hàng quà tặng
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            padding: '8px 16px',
                            background: 'var(--primary)',
                            color: 'white',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '14px',
                            fontWeight: 600
                        }}>
                            {currentBalance.toLocaleString()} token
                        </div>
                        <button
                            onClick={handleClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <X style={{ width: '20px', height: '20px' }} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    {step === 'browse' && (
                        <>
                            {/* Search and Filter */}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{
                                    position: 'relative',
                                    marginBottom: '16px'
                                }}>
                                    <Search style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '20px',
                                        height: '20px',
                                        color: 'var(--muted-foreground)'
                                    }} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm quà tặng..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 12px 12px 44px',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--border)',
                                            fontSize: '14px',
                                            background: 'var(--background)',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    overflowX: 'auto',
                                    paddingBottom: '8px'
                                }}>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.value}
                                            onClick={() => setSelectedCategory(cat.value)}
                                            style={{
                                                padding: '8px 16px',
                                                background: selectedCategory === cat.value ? 'var(--primary)' : 'var(--muted)',
                                                color: selectedCategory === cat.value ? 'white' : 'var(--foreground)',
                                                border: 'none',
                                                borderRadius: 'var(--radius-md)',
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Gift Grid */}
                            {isLoading ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <Loader2 style={{
                                        width: '48px',
                                        height: '48px',
                                        color: 'var(--primary)',
                                        animation: 'spin 1s linear infinite',
                                        margin: '0 auto'
                                    }} />
                                </div>
                            ) : filteredGifts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <Gift style={{
                                        width: '48px',
                                        height: '48px',
                                        color: 'var(--muted-foreground)',
                                        margin: '0 auto 16px'
                                    }} />
                                    <p style={{ margin: 0, color: 'var(--muted-foreground)' }}>
                                        Không tìm thấy quà tặng nào
                                    </p>
                                </div>
                            ) : (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                    gap: '16px'
                                }}>
                                    {filteredGifts.map(gift => (
                                        <div
                                            key={gift.id}
                                            onClick={() => handleSelectGift(gift)}
                                            style={{
                                                background: 'var(--card)',
                                                border: '1px solid var(--border)',
                                                borderRadius: 'var(--radius-md)',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s, box-shadow 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-4px)'
                                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)'
                                                e.currentTarget.style.boxShadow = 'none'
                                            }}
                                        >
                                            <div style={{
                                                height: '150px',
                                                background: 'var(--muted)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Gift style={{ width: '48px', height: '48px', color: 'var(--muted-foreground)' }} />
                                            </div>
                                            <div style={{ padding: '12px' }}>
                                                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>
                                                    {gift.name}
                                                </h4>
                                                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: '1.4' }}>
                                                    {gift.description}
                                                </p>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>
                                                        {gift.tokenPrice} token
                                                    </span>
                                                    <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                                                        Còn {gift.stockQuantity}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {step === 'confirm' && selectedGift && (
                        <div>
                            <div style={{
                                padding: '20px',
                                background: 'var(--muted)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '20px'
                            }}>
                                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>
                                    {selectedGift.name}
                                </h3>
                                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--muted-foreground)' }}>
                                    {selectedGift.description}
                                </p>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        marginBottom: '8px'
                                    }}>
                                        Số lượng
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedGift.stockQuantity}
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--border)',
                                            fontSize: '14px',
                                            background: 'var(--background)',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                {selectedGift.category === 'physical' && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            marginBottom: '8px'
                                        }}>
                                            Địa chỉ giao hàng
                                        </label>
                                        <textarea
                                            value={deliveryAddress}
                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                            placeholder="Nhập địa chỉ nhận hàng"
                                            rows={3}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--border)',
                                                fontSize: '14px',
                                                background: 'var(--background)',
                                                resize: 'vertical',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                                    <span style={{ fontSize: '16px', fontWeight: 600 }}>Tổng cộng</span>
                                    <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>
                                        {(selectedGift.tokenPrice * quantity).toLocaleString()} token
                                    </span>
                                </div>
                            </div>

                            {error && (
                                <div style={{
                                    padding: '12px',
                                    background: 'var(--destructive)',
                                    color: 'white',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '14px'
                                }}>
                                    <AlertCircle style={{ width: '16px', height: '16px' }} />
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setStep('browse')}
                                    disabled={isRedeeming}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'var(--muted)',
                                        color: 'var(--foreground)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        cursor: isRedeeming ? 'not-allowed' : 'pointer',
                                        opacity: isRedeeming ? 0.5 : 1
                                    }}
                                >
                                    Quay lại
                                </button>
                                <button
                                    onClick={handleConfirmRedeem}
                                    disabled={isRedeeming}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        cursor: isRedeeming ? 'not-allowed' : 'pointer',
                                        opacity: isRedeeming ? 0.7 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {isRedeeming ? (
                                        <>
                                            <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
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
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <CheckCircle style={{
                                width: '64px',
                                height: '64px',
                                color: 'var(--primary)',
                                margin: '0 auto 16px'
                            }} />
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>
                                Đổi quà thành công!
                            </h3>
                            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'var(--muted-foreground)' }}>
                                Quà tặng của bạn sẽ được giao trong thời gian sớm nhất
                            </p>
                            <button
                                onClick={handleClose}
                                style={{
                                    padding: '12px 24px',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Đóng
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )

    // Render modal using Portal to mount it at document.body
    return createPortal(modalContent, document.body)
}

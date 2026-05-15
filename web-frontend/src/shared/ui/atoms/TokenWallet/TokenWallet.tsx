import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, Gift, Coins, Download, Loader2, AlertCircle, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
    connectWallet,
    getWalletInfo,
    isMetaMaskInstalled,
    formatAddress,
    formatTokenAmount,
    onAccountsChanged,
    removeAccountsListener,
    type WalletInfo
} from '@/features/blockchain/services/walletService'
import { getBalance, getHistory, withdrawTokens } from '@/features/rewards/api'
import TokenWithdrawModal from '@/shared/ui/molecules/TokenWithdrawModal'

const asNumber = (value: unknown, fallback = 0): number => {
    if (value === null || value === undefined) {
        return fallback
    }

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : fallback
    }

    if (typeof value === 'bigint') {
        try {
            return Number(value)
        } catch {
            return fallback
        }
    }

    if (typeof value === 'string') {
        const parsed = Number(value)
        return Number.isNaN(parsed) ? fallback : parsed
    }

    return fallback
}

interface TokenWalletProps {
    userId?: string
}

export default function TokenWallet({ userId }: TokenWalletProps): JSX.Element {
    const navigate = useNavigate()
    const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    // Token reward data from API
    const [tokenBalance, setTokenBalance] = useState(0)
    const [totalEarned, setTotalEarned] = useState(0)
    const [recentTransactions, setRecentTransactions] = useState<Array<{
        type: 'earn' | 'spend' | 'reward'
        amount: number
        description: string
        date: string
    }>>([])
    const [loadingTokens, setLoadingTokens] = useState(false)
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)

    // Load wallet info on mount
    useEffect(() => {
        loadWalletInfo()

        // Listen for account changes
        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length > 0) {
                loadWalletInfo()
            } else {
                setWalletInfo(null)
            }
        }

        onAccountsChanged(handleAccountsChanged)

        return () => {
            removeAccountsListener(handleAccountsChanged)
        }
    }, [])

    // Load token balance and history from API
    useEffect(() => {
        if (userId) {
            loadTokenData()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId])

    const loadTokenData = async () => {
        if (!userId) return
        
        setLoadingTokens(true)
        try {
            // Fetch balance
            const balanceData = await getBalance(userId)
            const totalSpentValue = asNumber(balanceData.totalSpent ?? balanceData.lifetimeSpent, 0)
            const balanceValue = asNumber(
                balanceData.availableBalance ?? balanceData.balance ?? balanceData.tokenBalance,
                0
            )
            const totalEarnedValue = asNumber(
                balanceData.totalEarned ?? balanceData.lifetimeEarned,
                balanceValue + totalSpentValue
            )

            setTokenBalance(balanceValue)
            setTotalEarned(totalEarnedValue)

            // Fetch recent transactions (limit 4)
            const historyData = await getHistory(userId, 1, 4)
            
            // Transform backend data to component format
            const dataArray = (historyData as any).rewards || historyData.transactions || []
            const transformedTransactions = dataArray.map((item: any) => {
                const isEarn = item.transaction_type === 'EARN'
                const amount = asNumber(item.tokensAwarded ?? item.amount, 0)
                
                // Get reason label
                const reasonLabels: Record<string, string> = {
                    'COURSE_COMPLETION': 'Hoàn thành khóa học',
                    'EXAM_PASS': 'Đạt kỳ thi',
                    'ASSIGNMENT_SUBMIT': 'Nộp bài tập',
                    'DAILY_LOGIN': 'Đăng nhập hàng ngày',
                    'QUIZ_PERFECT': 'Quiz hoàn hảo',
                    'WITHDRAW': 'Rút token',
                    'ADMIN_BONUS': 'Thưởng từ Admin',
                    'PURCHASE': 'Mua sắm'
                }
                
                const description = reasonLabels[item.reasonCode] || item.reasonCode || 'Giao dịch token'
                
                // Format date
                const date = new Date(item.awardedAt || item.createdAt)
                const now = new Date()
                const diffMs = now.getTime() - date.getTime()
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                
                let dateStr = ''
                if (diffHours < 1) dateStr = 'Vừa xong'
                else if (diffHours < 24) dateStr = `${diffHours} giờ trước`
                else if (diffDays === 1) dateStr = 'Hôm qua'
                else if (diffDays < 7) dateStr = `${diffDays} ngày trước`
                else dateStr = date.toLocaleDateString('vi-VN')

                return {
                    type: isEarn ? 'earn' : (item.reasonCode === 'WITHDRAW' ? 'spend' : 'spend'),
                    amount: isEarn ? amount : -amount,
                    description,
                    date: dateStr
                }
            })

            setRecentTransactions(transformedTransactions)
        } catch (err) {
            console.error('Error loading token data:', err)
            // Reset to zero if API fails
            setTokenBalance(0)
            setTotalEarned(0)
            setRecentTransactions([])
        } finally {
            setLoadingTokens(false)
        }
    }

    const loadWalletInfo = async () => {
        try {
            // Try to get current wallet without prompting user
            if (!isMetaMaskInstalled()) return

            const accounts: string[] = await (window as any).ethereum.request({
                method: 'eth_accounts'
            })

            if (accounts.length > 0 && accounts[0]) {
                const info = await getWalletInfo(accounts[0])
                setWalletInfo(info)
            }
        } catch (err) {
            console.error('Error loading wallet:', err)
        }
    }

    const handleConnectWallet = async () => {
        if (!isMetaMaskInstalled()) {
            setError('MetaMask chưa được cài đặt. Vui lòng cài đặt MetaMask extension.')
            return
        }

        setIsConnecting(true)
        setError(null)

        try {
            const address = await connectWallet()
            if (address) {
                const info = await getWalletInfo(address)
                setWalletInfo(info)
            }
        } catch (err: any) {
            setError(err.message || 'Không thể kết nối ví')
        } finally {
            setIsConnecting(false)
        }
    }

    // Always use off-chain balance from API (token-reward-service)
    // Blockchain wallet is only for displaying connected address
    const displayBalance = tokenBalance
    const displayEarned = totalEarned
    const isLoading = isConnecting || loadingTokens

    const handleWithdraw = async (amount: number, toAddress: string) => {
        if (!userId) {
            return { success: false, message: 'Vui lòng đăng nhập' }
        }

        try {
            const result = await withdrawTokens({ studentId: userId, amount, toAddress })
            // Refresh token data after successful withdrawal
            await loadTokenData()
            return {
                success: true,
                message: result.message || 'Rút token thành công',
                txHash: result.transactionHash
            }
        } catch (err: any) {
            return {
                success: false,
                message: err.message || 'Không thể rút token'
            }
        }
    }

    const handleViewAllTransactions = () => {
        navigate('/user/rewards')
    }

    const handleRedeemGifts = () => {
        navigate('/user/rewards/store')
    }

    return (
        <div className="card stagger-load hover-lift interactive" style={{
            animationDelay: '200ms',
            minHeight: '370px',
            height: '100%',
            padding: 'clamp(12px, 2vw, 16px)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {/* --- HEADER --- */}
            <div style={{ flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center' }}>
                        <Wallet style={{ width: '20px', height: '20px', marginRight: '8px', color: 'var(--accent)' }} />
                        Ví Token
                    </h3>
                    {!walletInfo ? (
                        <button
                            onClick={handleConnectWallet}
                            disabled={isConnecting}
                            style={{
                                fontSize: '13px',
                                color: 'white',
                                background: 'var(--accent)',
                                border: 'none',
                                cursor: isConnecting ? 'not-allowed' : 'pointer',
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                opacity: isConnecting ? 0.7 : 1
                            }}
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                                    Đang kết nối...
                                </>
                            ) : (
                                <>
                                    <Wallet style={{ width: '14px', height: '14px' }} />
                                    Kết nối ví
                                </>
                            )}
                        </button>
                    ) : (
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--muted-foreground)',
                            background: 'var(--muted)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'var(--primary)'
                            }} />
                            {formatAddress(walletInfo.address)}
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: '8px 12px',
                        background: 'var(--destructive)',
                        color: 'white',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                        {error}
                    </div>
                )}

                {/* Balance Section */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>
                            Số dư hiện tại
                        </span>
                        {loadingTokens ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
                                <span style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>Đang tải...</span>
                            </div>
                        ) : (
                            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center' }}>
                                <Coins style={{ width: '24px', height: '24px', marginRight: '4px' }} />
                                {formatTokenAmount(displayBalance)}
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                        <TrendingUp style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                        Tổng đã kiếm: {loadingTokens ? '...' : formatTokenAmount(displayEarned)} token
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginBottom: '20px'
                }}>
                    <button
                        onClick={() => setIsWithdrawModalOpen(true)}
                        disabled={tokenBalance === 0 || loadingTokens}
                        style={{
                            padding: '10px 12px',
                            background: (tokenBalance === 0 || loadingTokens) ? 'var(--muted)' : 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: (tokenBalance === 0 || loadingTokens) ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            opacity: (tokenBalance === 0 || loadingTokens) ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (tokenBalance > 0 && !loadingTokens) {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'none'
                        }}
                    >
                        <Download style={{ width: '16px', height: '16px' }} />
                        Rút Token
                    </button>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                            onClick={handleViewAllTransactions}
                            style={{
                                padding: '8px 10px',
                                background: 'var(--muted)',
                                color: 'var(--foreground)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--primary)'
                                e.currentTarget.style.color = 'white'
                                e.currentTarget.style.borderColor = 'var(--primary)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--muted)'
                                e.currentTarget.style.color = 'var(--foreground)'
                                e.currentTarget.style.borderColor = 'var(--border)'
                            }}
                        >
                            <ExternalLink style={{ width: '14px', height: '14px' }} />
                            Chi tiết
                        </button>
                        <button
                            onClick={handleRedeemGifts}
                            style={{
                                padding: '8px 10px',
                                background: 'var(--muted)',
                                color: 'var(--foreground)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--accent)'
                                e.currentTarget.style.color = 'white'
                                e.currentTarget.style.borderColor = 'var(--accent)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--muted)'
                                e.currentTarget.style.color = 'var(--foreground)'
                                e.currentTarget.style.borderColor = 'var(--border)'
                            }}
                        >
                            <Gift style={{ width: '14px', height: '14px' }} />
                            Đổi quà
                        </button>
                    </div>
                </div>
            </div>

            {/* --- TRANSACTIONS LIST --- */}
            <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', minHeight: 0 }}>
                <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>
                        Giao dịch gần đây
                    </h4>
                    {loadingTokens ? (
                        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--muted-foreground)' }}>
                            <Loader2 style={{ width: '24px', height: '24px', margin: '0 auto 8px', animation: 'spin 1s linear infinite' }} />
                            <p style={{ fontSize: '13px', margin: 0 }}>Đang tải giao dịch...</p>
                        </div>
                    ) : recentTransactions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--muted-foreground)' }}>
                            <Coins style={{ width: '32px', height: '32px', margin: '0 auto 8px', opacity: 0.3 }} />
                            <p style={{ fontSize: '13px', margin: 0 }}>Chưa có giao dịch nào</p>
                        </div>
                    ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {recentTransactions.map((transaction, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--card)',
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--shadow-sm)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateX(4px)'
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateX(0)'
                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                            }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        marginRight: '12px',
                                        flexShrink: 0,
                                        background: transaction.type === 'earn' ? 'var(--primary)' : transaction.type === 'spend' ? 'var(--destructive)' : 'var(--accent)'
                                    }} />
                                    <div>
                                        <p style={{ fontSize: '14px', fontWeight: 500, margin: 0, color: 'var(--foreground)' }}>
                                            {transaction.description}
                                        </p>
                                        <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: 0, marginTop: '2px' }}>
                                            {transaction.date}
                                        </p>
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: transaction.amount > 0 ? 'var(--primary)' : 'var(--destructive)',
                                    marginLeft: '8px'
                                }}>
                                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                                </span>
                            </div>
                        ))}
                    </div>
                    )}
                </div>
            </div>

            {/* Withdraw Modal */}
            <TokenWithdrawModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                currentBalance={tokenBalance}
                onWithdraw={handleWithdraw}
            />

            {/* Add spin animation */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}

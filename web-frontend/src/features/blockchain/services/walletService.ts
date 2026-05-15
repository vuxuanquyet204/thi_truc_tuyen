import { ethers } from 'ethers'

// LearnToken Contract ABI (minimal for frontend usage)
const LEARN_TOKEN_ABI = [
	"function balanceOf(address account) view returns (uint256)",
	"function totalEarned(address account) view returns (uint256)",
	"function totalSpent(address account) view returns (uint256)",
	"function getUserStats(address user) view returns (uint256 balance, uint256 earned, uint256 spent)",
	"function transfer(address to, uint256 amount) returns (bool)",
	"function approve(address spender, uint256 amount) returns (bool)",
	"function allowance(address owner, address spender) view returns (uint256)",
	"event RewardIssued(address indexed user, uint256 amount, string reason)",
	"event TokensSpent(address indexed user, uint256 amount, string purpose)",
]

// Contract address (update after deployment)
// Vite uses import.meta.env instead of process.env
const LEARN_TOKEN_ADDRESS = (import.meta.env.VITE_LEARN_TOKEN_ADDRESS as string | undefined) ?? '0x0000000000000000000000000000000000000000'
const ZERO_ADDRESS_PATTERN = /^0x0{40}$/i

const isHexAddress = (value: string | null | undefined): value is string =>
	!!value && /^0x[a-fA-F0-9]{40}$/.test(value)

export const isRewardTokenConfigured = (): boolean =>
	isHexAddress(LEARN_TOKEN_ADDRESS) && !ZERO_ADDRESS_PATTERN.test(LEARN_TOKEN_ADDRESS)

export interface WalletInfo {
	address: string
	balance: string
	totalEarned: string
	totalSpent: string
	isConnected: boolean
}

export interface TokenStats {
	balance: bigint
	earned: bigint
	spent: bigint
}

export interface Transaction {
	hash: string
	from: string
	to: string
	amount: string
	type: 'earn' | 'spend' | 'reward' | 'transfer'
	description: string
	timestamp: number
	status: 'pending' | 'confirmed' | 'failed'
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
	return typeof (window as any).ethereum !== 'undefined'
}

/**
 * Connect wallet (MetaMask)
 */
export async function connectWallet(): Promise<string | null> {
	if (!isMetaMaskInstalled()) {
		throw new Error('MetaMask chưa được cài đặt. Vui lòng cài đặt MetaMask để sử dụng tính năng này.')
	}

	try {
		const accounts: string[] = await (window as any).ethereum.request({
			method: 'eth_requestAccounts'
		})
		return accounts[0] ?? null
	} catch (error: any) {
		if (error.code === 4001) {
			throw new Error('Người dùng từ chối kết nối ví')
		}
		throw error
	}
}

/**
 * Get current connected wallet address
 */
export async function getCurrentWallet(): Promise<string | null> {
	if (!isMetaMaskInstalled()) return null

	try {
		const accounts: string[] = await (window as any).ethereum.request({
			method: 'eth_accounts'
		})
		return accounts[0] ?? null
	} catch {
		return null
	}
}

/**
 * Disconnect wallet
 */
export async function disconnectWallet(): Promise<void> {
	// MetaMask doesn't have a disconnect method, but we can clear local state
	// The actual disconnection happens in MetaMask UI
}

/**
 * Get ethers provider
 */
export function getProvider(): ethers.BrowserProvider | null {
	if (!isMetaMaskInstalled()) return null
	return new ethers.BrowserProvider((window as any).ethereum)
}

/**
 * Get LearnToken contract instance
 */
export async function getLearnTokenContract(): Promise<ethers.Contract> {
	const provider = getProvider()
	if (!provider) {
		throw new Error('Provider not available')
	}

	if (!isRewardTokenConfigured()) {
		throw new Error('Reward token contract is not configured')
	}

	const signer = await provider.getSigner()
	return new ethers.Contract(LEARN_TOKEN_ADDRESS, LEARN_TOKEN_ABI, signer)
}

/**
 * Get LearnToken contract instance (read-only)
 */
export function getLearnTokenContractReadOnly(): ethers.Contract {
	const provider = getProvider()
	if (!provider) {
		throw new Error('Provider not available')
	}

	if (!isRewardTokenConfigured()) {
		throw new Error('Reward token contract is not configured')
	}

	return new ethers.Contract(LEARN_TOKEN_ADDRESS, LEARN_TOKEN_ABI, provider)
}

/**
 * Get token balance for address
 */
export async function getTokenBalance(address: string): Promise<string> {
	try {
		if (!isRewardTokenConfigured()) {
			return '0'
		}

		if (!isHexAddress(address)) {
			console.warn('getTokenBalance: invalid address provided', address)
			return '0'
		}

		let normalizedAddress: string
		try {
			normalizedAddress = ethers.getAddress(address)
		} catch (addressError) {
			console.warn('getTokenBalance: unable to normalize address', address, addressError)
			return '0'
		}

		const contract = getLearnTokenContractReadOnly()
		const balance: bigint = await contract.balanceOf(normalizedAddress)
		return ethers.formatEther(balance)
	} catch (error) {
		console.error('Error getting token balance:', error)
		return '0'
	}
}

/**
 * Get user token statistics
 */
export async function getUserTokenStats(address: string): Promise<TokenStats> {
	try {
		const contract = getLearnTokenContractReadOnly()
		const stats = await contract.getUserStats(address)
		return {
			balance: stats.balance,
			earned: stats.earned,
			spent: stats.spent
		}
	} catch (error) {
		console.error('Error getting user stats:', error)
		return {
			balance: BigInt(0),
			earned: BigInt(0),
			spent: BigInt(0)
		}
	}
}

/**
 * Get full wallet info
 */
export async function getWalletInfo(address: string): Promise<WalletInfo> {
	try {
		// Contract not deployed yet, return zero balance
		// Token balance will be fetched from backend API (token-reward-service)
		// TODO: Uncomment when contract is deployed and integrate with backend
		// const stats = await getUserTokenStats(address)
		return {
			address,
			balance: '0',
			totalEarned: '0',
			totalSpent: '0',
			isConnected: true
		}
	} catch (error) {
		console.error('Error getting wallet info:', error)
		return {
			address,
			balance: '0',
			totalEarned: '0',
			totalSpent: '0',
			isConnected: false
		}
	}
}


/**
 * Transfer tokens to another address
 */
export async function transferTokens(
	toAddress: string,
	amount: string
): Promise<string> {
	try {
		const contract = await getLearnTokenContract()
		const amountWei = ethers.parseEther(amount)

		const tx = await contract.transfer(toAddress, amountWei)
		await tx.wait()

		return tx.hash
	} catch (error: any) {
		console.error('Error transferring tokens:', error)
		if (error.message.includes('Insufficient balance')) {
			throw new Error('Số dư không đủ để chuyển')
		}
		throw new Error('Không thể thực hiện giao dịch chuyển token')
	}
}

export interface TokenTransferCostEstimate {
	gasLimit: bigint
	gasCostWei: bigint
	gasPriceWei: bigint | null
	maxFeePerGas: bigint | null
	maxPriorityFeePerGas: bigint | null
}

export async function estimateTokenTransferCost(
	toAddress: string,
	amount: string
): Promise<TokenTransferCostEstimate> {
	const provider = getProvider()
	if (!provider) {
		throw new Error('Provider not available')
	}

	if (!isRewardTokenConfigured()) {
		throw new Error('Reward token contract is not configured')
	}

	const contract = await getLearnTokenContract()
	if (!contract) {
		throw new Error('Contract not available')
	}

	const amountWei = ethers.parseEther(amount)

	// In ethers v6, use contract.transfer.estimateGas() instead of contract.estimateGas.transfer()
	let gasLimit: bigint
	try {
		gasLimit = await contract.transfer.estimateGas(toAddress, amountWei)
	} catch (error: any) {
		console.error('Gas estimation error:', error)
		throw new Error(`Cannot estimate gas: ${error?.message || 'Unknown error'}`)
	}

	const feeData = await provider.getFeeData()

	let gasPrice: bigint | null = feeData.maxFeePerGas ?? feeData.gasPrice ?? null
	let gasCostWei = 0n
	if (gasPrice !== null && gasPrice !== undefined) {
		gasCostWei = gasLimit * gasPrice
	} else {
		gasPrice = null
	}

	return {
		gasLimit,
		gasCostWei,
		gasPriceWei: gasPrice,
		maxFeePerGas: feeData.maxFeePerGas ?? null,
		maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? null
	}
}

/**
 * Get transaction history from events
 */
export async function getTransactionHistory(
	address: string,
	limit: number = 20
): Promise<Transaction[]> {
	try {
		const provider = getProvider()
		if (!provider) return []

		const contract = getLearnTokenContractReadOnly()
		const currentBlock = await provider.getBlockNumber()
		const fromBlock = Math.max(0, currentBlock - 10000) // Last ~10000 blocks

		// Fetch all relevant events
		const [rewardEvents, spentEvents] = await Promise.all([
			contract.queryFilter(
				contract.filters.RewardIssued(address),
				fromBlock,
				currentBlock
			),
			contract.queryFilter(
				contract.filters.TokensSpent(address),
				fromBlock,
				currentBlock
			),
		])

		const transactions: Transaction[] = []

		// Process reward events
		for (const event of rewardEvents) {
			if ('args' in event) {
				const block = await event.getBlock()
				transactions.push({
					hash: event.transactionHash,
					from: LEARN_TOKEN_ADDRESS,
					to: address,
					amount: ethers.formatEther(event.args?.amount || 0),
					type: 'reward',
					description: event.args?.reason || 'Nhận thưởng',
					timestamp: block.timestamp * 1000,
					status: 'confirmed'
				})
			}
		}

		// Process spent events
		for (const event of spentEvents) {
			if ('args' in event) {
				const block = await event.getBlock()
				transactions.push({
					hash: event.transactionHash,
					from: address,
					to: LEARN_TOKEN_ADDRESS,
					amount: ethers.formatEther(event.args?.amount || 0),
					type: 'spend',
					description: event.args?.purpose || 'Chi tiêu',
					timestamp: block.timestamp * 1000,
					status: 'confirmed'
				})
			}
		}


		// Sort by timestamp descending and limit
		return transactions
			.sort((a, b) => b.timestamp - a.timestamp)
			.slice(0, limit)
	} catch (error) {
		console.error('Error getting transaction history:', error)
		return []
	}
}

/**
 * Listen for account changes
 */
export function onAccountsChanged(callback: (accounts: string[]) => void): void {
	if (!isMetaMaskInstalled()) return

	(window as any).ethereum.on('accountsChanged', callback)
}

/**
 * Listen for chain changes
 */
export function onChainChanged(callback: (chainId: string) => void): void {
	if (!isMetaMaskInstalled()) return

	(window as any).ethereum.on('chainChanged', callback)
}

/**
 * Remove account change listener
 */
export function removeAccountsListener(callback: (accounts: string[]) => void): void {
	if (!isMetaMaskInstalled()) return

	(window as any).ethereum.removeListener('accountsChanged', callback)
}

/**
 * Remove chain change listener
 */
export function removeChainListener(callback: (chainId: string) => void): void {
	if (!isMetaMaskInstalled()) return

	(window as any).ethereum.removeListener('chainChanged', callback)
}

/**
 * Format address for display
 */
export function formatAddress(address: string): string {
	if (!address) return ''
	return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount: string | number): string {
	const num = typeof amount === 'string' ? parseFloat(amount) : amount
	if (num >= 1000000) {
		return `${(num / 1000000).toFixed(2)}M`
	} else if (num >= 1000) {
		return `${(num / 1000).toFixed(2)}K`
	}
	return num.toFixed(2)
}

/**
 * Get ETH balance for an address
 */
export async function getETHBalance(address: string): Promise<string> {
	try {
		if (!address) {
			console.warn('getETHBalance: No address provided');
			return '0';
		}

		const provider = getProvider()
		if (!provider) {
			console.warn('getETHBalance: Provider not available');
			throw new Error('Provider not available')
		}

		console.log('Fetching ETH balance for address:', address);
		const balance = await provider.getBalance(address)
		const formattedBalance = ethers.formatEther(balance)
		console.log('ETH Balance:', formattedBalance, 'ETH');
		return formattedBalance
	} catch (error) {
		console.error('Error getting ETH balance:', error)
		return '0'
	}
}

/**
 * Send ETH transaction (for paying registration fee)
 */
export async function sendETHTransaction(
	toAddress: string,
	amountETH: string
): Promise<string> {
	try {
		const provider = getProvider()
		if (!provider) {
			throw new Error('MetaMask chưa được cài đặt')
		}

		const signer = await provider.getSigner()
		const tx = await signer.sendTransaction({
			to: toAddress,
			value: ethers.parseEther(amountETH)
		})

		// Wait for transaction to be mined
		await tx.wait()
		return tx.hash
	} catch (error: any) {
		console.error('Error sending ETH transaction:', error)
		if (error.code === 4001) {
			throw new Error('Người dùng từ chối giao dịch')
		}
		if (error.message?.includes('insufficient funds')) {
			throw new Error('Số dư ETH không đủ')
		}
		throw new Error('Không thể thực hiện giao dịch: ' + (error.message || 'Unknown error'))
	}
}

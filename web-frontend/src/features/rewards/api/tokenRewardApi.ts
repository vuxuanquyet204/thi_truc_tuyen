// Token Reward API Service
// Uses foundation/tokenClient for all requests.

import { tokenClient } from '@/foundation/api'
import type { NormalizedError } from '@/foundation/api'

// tokenClient already configured with:
//   baseURL: VITE_API_BASE_URL/api/tokens
//   timeout: 30s
//   auth header injection
//   401 redirect

const DEFAULT_COURSE_COMPLETION_REWARD = Number(
	import.meta.env.VITE_COURSE_COMPLETION_REWARD ?? 100
)

const toNumber = (value: unknown, fallback = 0): number => {
	if (value === null || value === undefined) return fallback
	if (typeof value === 'number') return Number.isFinite(value) ? value : fallback
	if (typeof value === 'bigint') {
		try { return Number(value) } catch { return fallback }
	}
	if (typeof value === 'string') {
		const parsed = Number(value)
		return Number.isNaN(parsed) ? fallback : parsed
	}
	return fallback
}

// ==================== Types ====================

export interface GrantTokenRequest {
	studentId: number | string
	amount: number
	reasonCode?: string
	relatedId?: number | string
}

export interface SpendTokenRequest {
	studentId: number | string
	amount: number
	reasonCode?: string
	relatedId?: number | string
}

export interface WithdrawTokenRequest {
	studentId: number | string
	amount: number
	toAddress: string
}

export interface BalanceResponse {
	balance: number
	totalEarned?: number
	totalSpent?: number
	tokenBalance?: number
	availableBalance?: number
	lifetimeEarned?: number
	lifetimeSpent?: number
	netEarned?: number
	lastTransactionAt?: string | null
}

export interface Transaction {
	id?: number | string
	studentId?: number | string
	amount?: number
	tokensAwarded?: number
	reasonCode?: string
	relatedId?: number | string
	transactionType?: 'EARN' | 'SPEND' | 'WITHDRAW'
	transaction_type?: 'EARN' | 'SPEND' | 'WITHDRAW'
	type?: 'grant' | 'spend' | 'withdraw'
	description?: string
	status?: string
	createdAt?: string
	updatedAt?: string
	awardedAt?: string
	[key: string]: unknown
}

export interface HistoryResponse {
	transactions: Transaction[]
	total: number
	totalItems?: number
	totalPages?: number
	currentPage?: number
	page: number
	limit: number
	rewards?: unknown[]
}

export interface WithdrawResponse {
	transactionHash?: string
	message: string
	success: boolean
}

export interface LinkedWalletResponse {
	id: string
	userId: string
	address: string
	status: string
	linkedAt: string
	lastSeenAt?: string
	signature?: string | null
}

// ==================== Helper ====================

const extractError = (error: unknown): string => {
	if (typeof error === 'object' && error !== null && 'message' in error) {
		return String((error as { message: unknown }).message)
	}
	return 'An error occurred'
}

const extractAxiosStatus = (error: unknown): number | undefined => {
	if (typeof error === 'object' && error !== null && 'response' in error) {
		return (error as { response?: { status?: number } }).response?.status
	}
	return undefined
}

const extractAxiosMessage = (error: unknown): string | undefined => {
	if (typeof error === 'object' && error !== null && 'response' in error) {
		const data = (error as { response?: { data?: { message?: string } } }).response?.data
		return data?.message
	}
	return undefined
}

// ==================== Token Operations ====================

export const grantTokens = async (request: GrantTokenRequest): Promise<Transaction> => {
	try {
		const response = await tokenClient.post(`/grant`, request)
		const reward = response.data ?? {}
		const amount = Number(reward.amount ?? reward.tokensAwarded ?? request.amount ?? 0)
		const integerAmount = Number.isFinite(amount) ? amount : Number(request.amount ?? 0) || 0
		const transactionTypeRaw = reward.transaction_type ?? reward.transactionType ?? reward.type ?? 'EARN'
		const normalizedType = typeof transactionTypeRaw === 'string' ? transactionTypeRaw.toLowerCase() : 'earn'

		return {
			...reward,
			amount: integerAmount,
			tokensAwarded: reward.tokensAwarded ?? integerAmount,
			reasonCode: reward.reasonCode ?? request.reasonCode,
			relatedId: reward.relatedId ?? request.relatedId,
			transaction_type: typeof transactionTypeRaw === 'string' ? transactionTypeRaw.toUpperCase() : 'EARN',
			transactionType: typeof transactionTypeRaw === 'string' ? transactionTypeRaw.toUpperCase() : 'EARN',
			type:
				normalizedType === 'spend'
					? 'spend'
					: normalizedType === 'withdraw'
						? 'withdraw'
						: 'grant',
		}
	} catch (error) {
		console.error('Error granting tokens:', error)
		throw new Error(extractAxiosMessage(error) || 'Failed to grant tokens')
	}
}

export const spendTokens = async (request: SpendTokenRequest): Promise<Transaction> => {
	try {
		const response = await tokenClient.post(`/spend`, request)
		const reward = response.data ?? {}
		const amount = Number(reward.amount ?? reward.tokensAwarded ?? request.amount ?? 0)
		const integerAmount = Number.isFinite(amount) ? amount : Number(request.amount ?? 0) || 0
		const transactionTypeRaw = reward.transaction_type ?? reward.transactionType ?? reward.type ?? 'SPEND'
		const normalizedType = typeof transactionTypeRaw === 'string' ? transactionTypeRaw.toLowerCase() : 'spend'

		return {
			...reward,
			amount: integerAmount,
			tokensAwarded: reward.tokensAwarded ?? integerAmount,
			reasonCode: reward.reasonCode ?? request.reasonCode,
			relatedId: reward.relatedId ?? request.relatedId,
			transaction_type: typeof transactionTypeRaw === 'string' ? transactionTypeRaw.toUpperCase() : 'SPEND',
			transactionType: typeof transactionTypeRaw === 'string' ? transactionTypeRaw.toUpperCase() : 'SPEND',
			type: normalizedType === 'withdraw' ? 'withdraw' : 'spend',
		}
	} catch (error) {
		console.error('Error spending tokens:', error)
		const status = extractAxiosStatus(error)
		const msg = extractAxiosMessage(error)
		if (status === 400 && msg === 'Insufficient funds.') {
			throw new Error('Insufficient funds.')
		}
		throw new Error(msg || 'Failed to spend tokens')
	}
}

export const withdrawTokens = async (request: WithdrawTokenRequest): Promise<WithdrawResponse> => {
	try {
		const response = await tokenClient.post(`/withdraw`, request)
		return response.data
	} catch (error) {
		console.error('Error withdrawing tokens:', error)
		const msg = extractAxiosMessage(error) || 'Failed to withdraw tokens'
		if (msg.includes('Insufficient funds')) {
			throw new Error('Insufficient funds.')
		}
		throw new Error(msg)
	}
}

export const getLinkedWallet = async (): Promise<LinkedWalletResponse | null> => {
	try {
		const response = await tokenClient.get(`/wallets/me`)
		return response.data
	} catch (error) {
		if (extractAxiosStatus(error) === 404) return null
		throw new Error(extractAxiosMessage(error) || 'Failed to fetch linked wallet')
	}
}

export const linkWallet = async (address: string, signature?: string): Promise<LinkedWalletResponse> => {
	try {
		const response = await tokenClient.post(`/wallets/link`, { address, signature })
		return response.data
	} catch (error) {
		throw new Error(extractAxiosMessage(error) || 'Failed to link wallet')
	}
}

export const unlinkWallet = async (): Promise<void> => {
	try {
		await tokenClient.delete(`/wallets/me`)
	} catch (error) {
		if (extractAxiosStatus(error) === 404) return
		throw new Error(extractAxiosMessage(error) || 'Failed to unlink wallet')
	}
}

// ==================== Balance & History ====================

export const getBalance = async (studentId: number | string): Promise<BalanceResponse> => {
	try {
		const response = await tokenClient.get(`/balance/${studentId}`)
		const data = response.data || {}
		const balanceValue = toNumber(data.balance ?? data.tokenBalance, 0)
		const metrics = (data as Record<string, unknown>).metrics as { totalEarned?: number; totalSpent?: number; netEarned?: number } | undefined
		const totalEarned = toNumber(data.totalEarned ?? data.lifetimeEarned ?? metrics?.totalEarned, balanceValue)
		const totalSpent = toNumber(data.totalSpent ?? data.lifetimeSpent ?? metrics?.totalSpent, 0)
		const netEarned = toNumber(data.netEarned ?? metrics?.netEarned ?? (totalEarned - totalSpent), totalEarned - totalSpent)
		const availableBalance = toNumber(data.availableBalance ?? balanceValue, balanceValue)

		return {
			balance: balanceValue,
			tokenBalance: balanceValue,
			availableBalance,
			totalEarned,
			lifetimeEarned: totalEarned,
			totalSpent,
			lifetimeSpent: totalSpent,
			netEarned,
			lastTransactionAt: data.lastTransactionAt ?? data.updatedAt ?? null,
		}
	} catch (error) {
		console.error('Error getting balance:', error)
		const status = extractAxiosStatus(error)
		const msg = extractAxiosMessage(error)
		if (status === 404) throw new Error('User not found.')
		if (status === 401) throw new Error('Unauthorized: No token provided')
		if (status === 403) throw new Error('Forbidden: Invalid token. Please log in again.')
		throw new Error(msg || 'Failed to get balance')
	}
}

export const getHistory = async (
	studentId: number | string,
	page = 1,
	limit = 10
): Promise<HistoryResponse> => {
	try {
		const response = await tokenClient.get(`/history/${studentId}`, {
			params: { page, limit },
		})
		return response.data
	} catch (error) {
		console.error('Error getting history:', error)
		const status = extractAxiosStatus(error)
		const msg = extractAxiosMessage(error)
		if (status === 401) throw new Error('Unauthorized: No token provided')
		if (status === 403) throw new Error('Forbidden: Invalid token. Please log in again.')
		throw new Error(msg || 'Failed to get history')
	}
}

export interface CourseCompletionRewardRequest {
	studentId: number | string
	courseId: string | number
	amount?: number
	reasonCode?: string
}

export const grantCourseCompletionTokens = async ({
	studentId,
	courseId,
	amount,
	reasonCode = 'COMPLETE_COURSE',
}: CourseCompletionRewardRequest): Promise<Transaction> => {
	const rewardAmount = Number.isFinite(Number(amount))
		? Number(amount)
		: DEFAULT_COURSE_COMPLETION_REWARD

	if (!(rewardAmount > 0)) {
		throw new Error('Reward amount must be a positive number.')
	}

	return grantTokens({
		studentId,
		amount: rewardAmount,
		reasonCode,
		relatedId: String(courseId),
	})
}

// ==================== Gift Operations ====================

export interface GiftItem {
	id: string
	name: string
	description: string
	imageUrl?: string
	tokenPrice: number
	stockQuantity: number
	category?: string
}

export const getGifts = async (category?: string): Promise<GiftItem[]> => {
	try {
		const params = category && category !== 'all' ? { category } : {}
		const response = await tokenClient.get(`/gifts`, { params })
		return Array.isArray(response.data) ? response.data : (response.data?.gifts ?? [])
	} catch (error) {
		console.error('Error getting gifts:', error)
		throw new Error(extractAxiosMessage(error) || 'Failed to get gifts')
	}
}

export const getGiftById = async (giftId: string): Promise<GiftItem> => {
	try {
		const response = await tokenClient.get(`/gifts/${giftId}`)
		return response.data
	} catch (error) {
		if (extractAxiosStatus(error) === 404) throw new Error('Gift not found')
		throw new Error(extractAxiosMessage(error) || 'Failed to get gift')
	}
}

// ==================== Admin Operations ====================

export interface AdminStatsResponse {
	totalTokensIssued: number
	totalTokensSpent: number
	currentBalance: number
	totalUsers: number
	totalTransactions: number
	totalEarnTransactions: number
	totalSpendTransactions: number
	todayTransactions: number
	todayTokensDistributed: number
}

export interface TopUser {
	studentId: string
	totalEarned: number
	totalSpent: number
	balance: number
	transactionCount: number
}

export interface RulePerformance {
	ruleId: string
	ruleName: string
	usageCount: number
	totalTokensDistributed: number
	successRate: number
	averageReward: number
}

export const getAdminStats = async (): Promise<AdminStatsResponse> => {
	try {
		const response = await tokenClient.get(`/admin/stats`)
		return response.data
	} catch (error) {
		console.error('Error getting admin stats:', error)
		throw new Error(extractAxiosMessage(error) || 'Failed to get admin stats')
	}
}

export const getTopUsers = async (limit = 10): Promise<TopUser[]> => {
	try {
		const response = await tokenClient.get(`/admin/top-users`, {
			params: { limit },
		})
		return response.data
	} catch (error) {
		console.error('Error getting top users:', error)
		throw new Error(extractAxiosMessage(error) || 'Failed to get top users')
	}
}

export const getRulePerformance = async (): Promise<RulePerformance[]> => {
	try {
		const response = await tokenClient.get(`/admin/rule-performance`)
		return response.data
	} catch (error) {
		console.error('Error getting rule performance:', error)
		throw new Error(extractAxiosMessage(error) || 'Failed to get rule performance')
	}
}

export const getAllTransactions = async (page = 1, limit = 50): Promise<HistoryResponse> => {
	try {
		const response = await tokenClient.get(`/admin/transactions`, {
			params: { page, limit },
		})
		return response.data
	} catch (error) {
		console.error('Error getting all transactions:', error)
		throw new Error(extractAxiosMessage(error) || 'Failed to get all transactions')
	}
}

// ==================== Default Export ====================

const tokenRewardApi = {
	grantTokens,
	spendTokens,
	withdrawTokens,
	getLinkedWallet,
	linkWallet,
	unlinkWallet,
	getBalance,
	getHistory,
	grantCourseCompletionTokens,
	getGifts,
	getGiftById,
	getAdminStats,
	getTopUsers,
	getRulePerformance,
	getAllTransactions,
}

export default tokenRewardApi

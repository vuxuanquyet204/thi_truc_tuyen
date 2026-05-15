/**
 * Token Reward API - Enhanced wrapper
 *
 * Award tokens, manage balances, history, and gifts.
 * Re-exports from tokenRewardApi and adds additional helper functions.
 */

import { tokenClient } from '@/foundation/api'
import {
	grantTokens as grantTokensReward,
	spendTokens as spendTokensReward,
	getBalance as getBalanceReward,
	getHistory as getHistoryReward,
	grantCourseCompletionTokens,
	type GrantTokenRequest,
	type SpendTokenRequest,
	type BalanceResponse,
	type HistoryResponse,
	type CourseCompletionRewardRequest,
	type Transaction,
} from './tokenRewardApi'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const API_BASE_URL = `${BASE_URL}/api/tokens`

const DEFAULT_COURSE_COMPLETION_REWARD = Number(
	import.meta.env.VITE_COURSE_COMPLETION_REWARD ?? 100
)

export type {
	GrantTokenRequest,
	SpendTokenRequest,
	BalanceResponse,
	HistoryResponse,
	CourseCompletionRewardRequest,
	Transaction,
}

export interface RewardRequest {
	userId: string
	walletAddress: string
	amount?: number
	reason?: string
}

export interface GiftItem {
	id: string
	name: string
	description: string
	imageUrl: string
	tokenPrice: number
	stockQuantity: number
	category: 'electronics' | 'voucher' | 'course' | 'physical' | 'other'
}

export interface RedeemGiftRequest {
	userId: string
	walletAddress: string
	giftId: string
	quantity: number
	deliveryAddress?: string
}

export interface CourseUnlockRequest {
	userId: string
	walletAddress: string
	courseId: string
	tokenPrice: number
}

export interface TokenTransaction {
	id: string
	userId: string
	walletAddress: string
	type: 'earn' | 'spend' | 'reward'
	amount: number
	description: string
	transactionHash?: string
	status: 'pending' | 'processing' | 'completed' | 'failed'
	createdAt: string
	updatedAt: string
}

export async function awardLessonCompletion(
	request: RewardRequest
): Promise<TokenTransaction> {
	const res = await tokenClient.post<TokenTransaction>('/grant', {
		studentId: request.userId,
		walletAddress: request.walletAddress,
		amount: request.amount,
		reasonCode: request.reason,
	})
	return res.data
}

export async function awardExamPass(
	request: RewardRequest & { score: number }
): Promise<TokenTransaction> {
	const res = await tokenClient.post<TokenTransaction>('/grant', {
		studentId: request.userId,
		walletAddress: request.walletAddress,
		amount: request.amount,
		reasonCode: request.reason,
	})
	return res.data
}

export async function awardDailyStreak(
	request: RewardRequest & { streakDays: number }
): Promise<TokenTransaction> {
	const res = await tokenClient.post<TokenTransaction>('/grant', {
		studentId: request.userId,
		walletAddress: request.walletAddress,
		amount: request.amount,
		reasonCode: request.reason,
	})
	return res.data
}

export async function awardCertification(
	request: RewardRequest
): Promise<TokenTransaction> {
	const res = await tokenClient.post<TokenTransaction>('/grant', {
		studentId: request.userId,
		walletAddress: request.walletAddress,
		amount: request.amount,
		reasonCode: request.reason,
	})
	return res.data
}

export async function awardContestWin(
	request: RewardRequest & { rank: number }
): Promise<TokenTransaction> {
	const res = await tokenClient.post<TokenTransaction>('/grant', {
		studentId: request.userId,
		walletAddress: request.walletAddress,
		amount: request.amount,
		reasonCode: request.reason,
	})
	return res.data
}

export interface CourseCompletionAwardParams {
	userId: string | number
	courseId: string | number
	amount?: number
	reasonCode?: string
}

export async function awardCourseCompletion({
	userId,
	courseId,
	amount,
	reasonCode,
}: CourseCompletionAwardParams): Promise<Transaction> {
	if (userId === undefined || userId === null) {
		throw new Error('User id is required to award course completion tokens.')
	}
	if (courseId === undefined || courseId === null) {
		throw new Error('Course id is required to award course completion tokens.')
	}

	const normalizedUserId =
		typeof userId === 'string'
			? (() => {
					const trimmed = userId.trim()
					if (trimmed.length === 0) {
						throw new Error(
							'User id is required to award course completion tokens.'
						)
					}
					return Number.isFinite(Number(trimmed))
						? Number(trimmed)
						: trimmed
				})()
			: userId

	const rewardAmount = Number.isFinite(Number(amount))
		? Number(amount)
		: DEFAULT_COURSE_COMPLETION_REWARD

	if (!(rewardAmount > 0)) {
		throw new Error('Reward amount must be a positive number.')
	}

	return grantCourseCompletionTokens({
		studentId: normalizedUserId,
		courseId,
		amount: rewardAmount,
		reasonCode,
	})
}

export async function getAvailableGifts(
	category?: string
): Promise<GiftItem[]> {
	const params = category && category !== 'all' ? `?category=${category}` : ''
	const response = await tokenClient.get<GiftItem[]>(`/gifts${params}`)
	return response.data
}

export async function getGiftDetails(giftId: string): Promise<GiftItem> {
	const response = await tokenClient.get<GiftItem>(`/gifts/${giftId}`)
	return response.data
}

export async function redeemGift(
	request: RedeemGiftRequest
): Promise<{ success: boolean; message: string; data: { giftOrderId: string; giftId: string; totalCost: number; quantity: number; deliveryAddress?: string; status: string; transactionHash: string | null } }> {
	const response = await tokenClient.post<{ success: boolean; message: string; data: any }>(
		'/redeem/gift',
		{
			userId: request.userId,
			walletAddress: request.walletAddress,
			giftId: request.giftId,
			quantity: request.quantity,
			deliveryAddress: request.deliveryAddress,
		}
	)
	return response.data
}

export async function unlockCourse(
	request: CourseUnlockRequest
): Promise<{ success: boolean; message: string; data: { courseId: string; tokenSpent: number; orderId: string | null; transactionHash: string | null; unlockedAt: string } }> {
	const response = await tokenClient.post<{ success: boolean; message: string; data: any }>(
		'/redeem/course',
		{
			userId: request.userId,
			walletAddress: request.walletAddress,
			courseId: request.courseId,
			tokenPrice: request.tokenPrice,
		}
	)
	return response.data
}

export async function getUserTransactionHistory(
	userId: string,
	limit?: number,
	offset?: number
): Promise<{ transactions: TokenTransaction[]; total: number }> {
	const params: Record<string, string> = {}
	if (limit !== undefined) params.limit = String(limit)
	if (offset !== undefined) params.offset = String(offset)
	const response = await tokenClient.get<{
		rewards: TokenTransaction[]
		totalItems: number
	}>(`/history/${userId}`, { params })
	return {
		transactions: response.data.rewards || [],
		total: response.data.totalItems || 0,
	}
}

export async function getUserTokenBalance(
	userId: string | number
): Promise<{
	balance: number
	totalEarned: number
	totalSpent: number
}> {
	const data = await getBalanceReward(userId)
	return {
		balance: data.balance || 0,
		totalEarned: data.totalEarned || 0,
		totalSpent: data.totalSpent || 0,
	}
}

export async function grantTokens(request: GrantTokenRequest): Promise<any> {
	return grantTokensReward(request)
}

export async function spendTokens(request: SpendTokenRequest): Promise<any> {
	return spendTokensReward(request)
}

export async function getTransactionHistory(
	userId: string | number,
	page: number = 1,
	limit: number = 10
): Promise<HistoryResponse> {
	return getHistoryReward(userId, page, limit)
}

export async function verifyTransaction(
	transactionHash: string
): Promise<{ verified: boolean; status: string; details?: any }> {
	// Backend: POST /api/tokens/verify
	const response = await tokenClient.post<{
		verified: boolean
		status: string
		details?: any
	}>('/verify', { transactionHash })
	return response.data
}

export async function getTokenStats(): Promise<{
	totalSupply: number
	totalUsers: number
	totalTransactions: number
	totalRewardsIssued: number
	totalRedeemed: number
}> {
	// Backend: GET /api/tokens/stats
	const response = await tokenClient.get<{
		success: boolean
		data: {
			totalSupply: number
			totalUsers: number
			totalTransactions: number
			totalRewardsIssued: number
			totalRedeemed: number
		}
	}>('/stats')
	return response.data.data
}

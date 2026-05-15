// Admin Token Reward API Service
import { getBalance, getHistory, grantTokens, spendTokens, type GrantTokenRequest, type SpendTokenRequest } from '@/features/rewards/api'
import type { HistoryResponse } from '@/features/rewards/api'

// Re-export for admin use
export { getBalance, getHistory, grantTokens, spendTokens }
export type { GrantTokenRequest, SpendTokenRequest, HistoryResponse }

/**
 * Get overall token statistics (admin only)
 */
export async function getAdminStats(): Promise<{
  totalTokensIssued: number
  totalTokensSpent: number
  currentBalance: number
  totalUsers: number
  totalTransactions: number
  totalEarnTransactions: number
  totalSpendTransactions: number
  todayTransactions: number
  todayTokensDistributed: number
}> {
  try {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
    const API_URL = `${BASE_URL}/api/tokens`
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${BASE_URL}/api/tokens/admin/stats`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: Failed to fetch admin stats`
      console.error('[getAdminStats] Error response:', errorData)
      throw new Error(errorMessage)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    throw error instanceof Error ? error : new Error('Failed to fetch admin stats')
  }
}

/**
 * Get transaction history for all users (paginated)
 */
export async function getAllTransactions(
  page: number = 1,
  limit: number = 50
): Promise<{
  totalItems: number
  totalPages: number
  currentPage: number
  transactions: Array<any>
}> {
  try {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
    const API_URL = `${BASE_URL}/api/tokens`
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${BASE_URL}/api/tokens/admin/transactions?page=${page}&limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || 'Failed to fetch all transactions')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching all transactions:', error)
    throw error instanceof Error ? error : new Error('Failed to fetch all transactions')
  }
}

/**
 * Grant tokens to user (admin action)
 */
export async function adminGrantTokens(request: GrantTokenRequest) {
  return grantTokens(request)
}

/**
 * Get user's reward summary (balance + stats)
 */
export async function getUserRewardSummary(userId: number | string): Promise<{
  userId: number | string
  balance: number
  totalEarned: number
  totalSpent: number
  transactionCount: number
}> {
  try {
    const balance = await getBalance(userId)
    const history = await getHistory(userId, 1, 100)
    
    return {
      userId,
      balance: balance.balance || 0,
      totalEarned: balance.totalEarned || 0,
      totalSpent: balance.totalSpent || 0,
      transactionCount: history.total || 0
    }
  } catch (error) {
    console.error('Error getting user reward summary:', error)
    return {
      userId,
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      transactionCount: 0
    }
  }
}

/**
 * Get top users by token balance (admin only)
 */
export async function getTopUsers(limit: number = 10): Promise<Array<{
  studentId: string
  totalEarned: number
  totalSpent: number
  balance: number
  transactionCount: number
}>> {
  try {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
    const API_URL = `${BASE_URL}/api/tokens`
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${BASE_URL}/api/tokens/admin/top-users?limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || 'Failed to fetch top users')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching top users:', error)
    throw error instanceof Error ? error : new Error('Failed to fetch top users')
  }
}

/**
 * Get rule performance statistics (admin only)
 */
export async function getRulePerformance(): Promise<Array<{
  ruleId: string
  ruleName: string
  usageCount: number
  totalTokensDistributed: number
  successRate: number
  averageReward: number
}>> {
  try {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
    const API_URL = `${BASE_URL}/api/tokens`
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${BASE_URL}/api/tokens/admin/rule-performance`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || 'Failed to fetch rule performance')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching rule performance:', error)
    throw error instanceof Error ? error : new Error('Failed to fetch rule performance')
  }
}

const adminTokenRewardApi = {
  getBalance,
  getHistory,
  grantTokens,
  spendTokens,
  getAllTransactions,
  adminGrantTokens,
  getUserRewardSummary,
  getAdminStats,
  getTopUsers,
  getRulePerformance,
}

export default adminTokenRewardApi

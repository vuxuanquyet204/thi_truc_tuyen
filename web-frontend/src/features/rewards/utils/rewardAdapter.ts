/**
 * Adapter to convert between Backend RewardResponse/Transaction and Frontend Reward Types
 */

import { type Transaction as BackendTransaction } from '@/features/rewards/api'
import {
  type RewardTransaction,
  type RewardRule,
  type TokenInfo,
  type TransactionStatus,
  type RewardType
} from '@/foundation/types/reward'

/**
 * Backend RewardResponse structure (from course-service)
 */
interface BackendRewardResponse {
  id: number | string
  studentId: number | string
  tokensAwarded: number
  reasonCode: string
  relatedId?: string | number
  awardedAt: string
}

/**
 * Map from Backend RewardResponse to Frontend RewardTransaction
 */
export function backendRewardToTransaction(backend: BackendRewardResponse | BackendTransaction): RewardTransaction {
  const backendAny = backend as any

  const mapTransactionTypeToRewardType = (type: string, reasonCode?: string): RewardType => {
    if (reasonCode) {
      const reasonMap: Record<string, RewardType> = {
        'COURSE_COMPLETION': 'course_completion',
        'EXAM_PASS': 'exam_score',
        'QUIZ_PERFECT': 'quiz_perfect',
        'DAILY_LOGIN': 'daily_login',
        'ASSIGNMENT_SUBMISSION': 'assignment_submission',
        'STREAK_BONUS': 'streak_bonus',
        'REFERRAL': 'referral',
      }
      return reasonMap[reasonCode] || 'custom'
    }

    if (type === 'grant' || type === 'EARN') return 'custom'
    if (type === 'spend' || type === 'SPEND') return 'custom'
    return 'custom'
  }

  const backendType = backendAny.type || backendAny.transaction_type || 'grant'
  const reasonCode = backendAny.reasonCode || backendAny.reason_code || ''

  const status: TransactionStatus = backendAny.status ||
    (backendAny.failedReason ? 'failed' : 'completed')

  return {
    id: String(backendAny.id || ''),
    userId: String(backendAny.studentId || backendAny.userId || ''),
    userName: backendAny.userName || `User ${backendAny.studentId || backendAny.userId || ''}`,
    ruleId: String(backendAny.relatedId || backendAny.ruleId || ''),
    ruleName: reasonCode ? reasonCode.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Custom Reward',
    type: mapTransactionTypeToRewardType(backendType, reasonCode),
    tokenAmount: backendAny.tokensAwarded || backendAny.amount || 0,
    tokenSymbol: backendAny.tokenSymbol || 'LEARN',
    status,
    transactionHash: backendAny.transactionHash || backendAny.transaction_hash || undefined,
    blockNumber: backendAny.blockNumber || backendAny.block_number || undefined,
    gasUsed: backendAny.gasUsed || backendAny.gas_used || undefined,
    createdAt: backendAny.awardedAt || backendAny.createdAt || new Date().toISOString(),
    processedAt: backendAny.processedAt || backendAny.awardedAt || backendAny.createdAt || undefined,
    failedReason: backendAny.failedReason || backendAny.failed_reason || undefined,
    metadata: backendAny.metadata || {
      reasonCode,
      transactionType: backendType,
      relatedId: backendAny.relatedId
    }
  }
}

/**
 * Map from Backend Transaction to Frontend RewardTransaction
 */
export function backendTransactionToRewardTransaction(backend: BackendTransaction): RewardTransaction {
  return backendRewardToTransaction(backend)
}

/**
 * Safe field getter
 */
export function getRewardField<T>(backend: BackendRewardResponse | BackendTransaction, field: string, defaultValue: T): T {
  const backendAny = backend as any
  return backendAny[field] !== undefined ? backendAny[field] : defaultValue
}

/**
 * Map from Frontend RewardTransaction to Backend GrantTokenRequest
 */
export function rewardTransactionToBackendGrantRequest(transaction: Partial<RewardTransaction>): {
  studentId: number | string
  amount: number
  reasonCode?: string
  relatedId?: number | string
} {
  return {
    studentId: Number(transaction.userId) || transaction.userId || 0,
    amount: transaction.tokenAmount || 0,
    reasonCode: transaction.ruleName?.toUpperCase().replace(/\s+/g, '_') || transaction.type?.toUpperCase() || undefined,
    relatedId: transaction.ruleId ? Number(transaction.ruleId) || transaction.ruleId : undefined
  }
}

/**
 * Map multiple backend rewards/transactions
 */
export function mapBackendRewardsToTransactions(
  rewards: (BackendRewardResponse | BackendTransaction)[]
): RewardTransaction[] {
  return rewards.map(backendRewardToTransaction)
}

/**
 * Create TokenInfo from backend stats
 */
export function createTokenInfoFromStats(stats: {
  totalTokensIssued?: number
  totalTokensDistributed?: number
  distributedToday?: number
  distributedThisMonth?: number
  totalUsers?: number
  [key: string]: any
}): TokenInfo {
  return {
    symbol: 'LEARN',
    name: 'LearnToken',
    contractAddress: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    totalSupply: String(stats.totalTokensIssued || stats.totalTokensDistributed || 0),
    currentPrice: 0,
    marketCap: 0,
    holders: stats.totalUsers || 0,
    transfers24h: 0,
    circulatingSupply: stats.totalTokensIssued || stats.totalTokensDistributed || 0,
    rewardPool: (stats.totalTokensIssued || 0) - (stats.totalTokensDistributed || 0),
    distributedToday: stats.distributedToday || 0,
    distributedThisMonth: stats.distributedThisMonth || 0
  }
}

/**
 * Extract transaction status from backend data
 */
export function extractTransactionStatus(backend: BackendRewardResponse | BackendTransaction): TransactionStatus {
  const backendAny = backend as any

  if (backendAny.status) {
    return backendAny.status as TransactionStatus
  }

  if (backendAny.failedReason || backendAny.failed_reason || backendAny.error) {
    return 'failed'
  }

  if (backendAny.processing || backendAny.processingAt) {
    return 'processing'
  }

  return 'completed'
}

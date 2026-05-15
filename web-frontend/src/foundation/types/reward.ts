// Types cho Hệ thống thưởng Token ERC-20

export interface RewardRule {
	id: string
	name: string
	description: string
	type: RewardType
	trigger: RewardTrigger
	conditions: RewardCondition[]
	tokenAmount: number
	tokenSymbol: string
	isActive: boolean
	priority: number
	createdAt: string
	updatedAt: string
	createdBy: string
	usageCount: number
	lastUsed?: string
}

export type RewardType = 
	| 'course_completion'
	| 'exam_score'
	| 'daily_login'
	| 'assignment_submission'
	| 'quiz_perfect'
	| 'streak_bonus'
	| 'referral'
	| 'achievement'
	| 'custom'

export type RewardTrigger = 
	| 'automatic'
	| 'manual'
	| 'scheduled'
	| 'conditional'

export interface RewardCondition {
	id: string
	type: ConditionType
	operator: ConditionOperator
	value: string | number
	description: string
}

export type ConditionType = 
	| 'course_id'
	| 'exam_score'
	| 'login_days'
	| 'assignment_count'
	| 'quiz_score'
	| 'streak_days'
	| 'user_level'
	| 'custom_field'

export type ConditionOperator = 
	| 'equals'
	| 'greater_than'
	| 'less_than'
	| 'greater_equal'
	| 'less_equal'
	| 'contains'
	| 'not_equals'

export interface RewardTransaction {
	id: string
	userId: string
	userName: string
	ruleId: string
	ruleName: string
	type: RewardType
	tokenAmount: number
	tokenSymbol: string
	status: TransactionStatus
	transactionHash?: string
	blockNumber?: number
	gasUsed?: number
	createdAt: string
	processedAt?: string
	failedReason?: string
	metadata?: Record<string, any>
}

export type TransactionStatus = 
	| 'pending'
	| 'processing'
	| 'completed'
	| 'failed'
	| 'cancelled'

export interface TokenInfo {
	symbol: string
	name: string
	contractAddress: string
	decimals: number
	totalSupply: string
	currentPrice: number // USD
	marketCap: number // USD
	holders: number
	transfers24h: number
	circulatingSupply: number
	rewardPool: number // Available tokens for rewards
	distributedToday: number
	distributedThisMonth: number
}

export interface RewardStats {
	totalRules: number
	activeRules: number
	totalTransactions: number
	todayTransactions: number
	totalTokensDistributed: number
	todayTokensDistributed: number
	averageRewardPerUser: number
	topRewardRule: string
	successRate: number // Percentage of successful transactions
	pendingTransactions: number
	failedTransactions: number
}

export interface UserRewardSummary {
	userId: string
	userName: string
	totalEarned: number
	totalSpent: number
	currentBalance: number
	tokenSymbol: string
	lastRewardDate?: string
	rewardCount: number
	topRewardType: RewardType
}

export interface RewardFilters {
	search: string
	ruleType: RewardType | 'all'
	status: TransactionStatus | 'all'
	dateRange: 'today' | 'week' | 'month' | 'year' | 'all'
	tokenSymbol: string | 'all'
	userId?: string
}

export interface RewardDashboard {
	stats: RewardStats
	rules: RewardRule[]
	recentTransactions: RewardTransaction[]
	tokenInfo: TokenInfo
	topUsers: UserRewardSummary[]
	rulePerformance: RulePerformance[]
}

export interface RulePerformance {
	ruleId: string
	ruleName: string
	usageCount: number
	totalTokensDistributed: number
	successRate: number
	lastUsed?: string
	averageTokensPerUse: number
}

export interface RewardRuleForm {
	name: string
	description: string
	type: RewardType
	trigger: RewardTrigger
	conditions: Omit<RewardCondition, 'id'>[]
	tokenAmount: number
	tokenSymbol: string
	isActive: boolean
	priority: number
}

export interface BulkRewardRequest {
	userIds: string[]
	ruleId: string
	amount?: number
	reason: string
	scheduledAt?: string
}

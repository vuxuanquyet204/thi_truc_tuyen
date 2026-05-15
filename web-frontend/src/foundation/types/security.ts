// Types cho Security & Blockchain System

export interface BlockchainModule {
	id: string
	name: string
	description: string
	type: ModuleType
	status: ModuleStatus
	blockchain: BlockchainNetwork
	contractAddress?: string
	lastUpdate: string
	
	// Statistics
	totalTransactions: number
	todayTransactions: number
	activeUsers: number
	totalValue: number // in ETH/tokens
	
	// Health metrics
	responseTime: number // ms
	errorRate: number // percentage
	uptime: number // percentage
	
	// Security metrics
	securityScore: number // 0-100
	vulnerabilities: number
	lastAudit?: string
	auditScore?: number
}

export type ModuleType = 
	| 'anti_cheat'
	| 'copyright_protection'
	| 'token_rewards'
	| 'multisig_wallet'

export type ModuleStatus = 'active' | 'warning' | 'error' | 'maintenance' | 'offline'

export type BlockchainNetwork = 'ethereum' | 'polygon' | 'bsc' | 'local'

export interface ActivityLog {
	id: string
	timestamp: string
	module: string
	type: LogType
	severity: LogSeverity
	message: string
	details?: Record<string, any>
	transactionHash?: string
	blockNumber?: number
	gasUsed?: number
	gasPrice?: string
}

export type LogType = 
	| 'transaction'
	| 'contract_deploy'
	| 'security_alert'
	| 'user_action'
	| 'system_event'
	| 'error'
	| 'audit'
	| 'upgrade'

export type LogSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface SecurityAlert {
	id: string
	timestamp: string
	module: string
	type: AlertType
	severity: AlertSeverity
	title: string
	description: string
	resolved: boolean
	resolvedAt?: string
	resolvedBy?: string
}

export type SecurityAlertType =
	| 'suspicious_transaction'
	| 'contract_vulnerability'
	| 'unauthorized_access'
	| 'gas_price_spike'
	| 'network_congestion'
	| 'smart_contract_error'
	| 'wallet_compromise'
	| 'audit_failure'

export type SecurityAlertSeverity = 'low' | 'medium' | 'high' | 'critical'

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
}

export interface WalletInfo {
	address: string
	type: 'multisig' | 'regular'
	balance: string // ETH
	owners?: string[]
	requiredConfirmations?: number
	totalConfirmations?: number
	pendingTransactions: number
	lastActivity: string
}

export interface SecurityDashboard {
	overview: {
		totalModules: number
		activeModules: number
		totalTransactions: number
		totalAlerts: number
		unresolvedAlerts: number
		averageSecurityScore: number
	}
	modules: BlockchainModule[]
	recentActivities: ActivityLog[]
	securityAlerts: SecurityAlert[]
	tokens: TokenInfo[]
	wallets: WalletInfo[]
}

export interface SecurityFilters {
	search: string
	module: ModuleType | 'all'
	status: ModuleStatus | 'all'
	severity: LogSeverity | 'all'
	timeRange: 'today' | 'week' | 'month' | 'all'
}

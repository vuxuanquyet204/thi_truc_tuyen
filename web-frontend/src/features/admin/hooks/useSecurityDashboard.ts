import { useState, useMemo, useCallback, useEffect } from 'react'
import {
	BlockchainModule,
	SecurityFilters,
	SecurityDashboard,
	TokenInfo,
	WalletInfo
} from '@/foundation/types'
import type {
	ActivityLog,
	SecurityAlert,
} from '@/foundation/types/security'
import { copyrightService } from '@/features/copyright/api/copyrightService'
import { getAdminStats } from '@/features/rewards/api/tokenRewardApi'
import { getAllSessions } from '@/features/proctoring/api/proctoringApi'
import { getAllWallets } from '@/features/blockchain/api/multisigApi'

// Default empty dashboard
const defaultDashboard: SecurityDashboard = {
	overview: {
		totalModules: 0,
		activeModules: 0,
		totalTransactions: 0,
		totalAlerts: 0,
		unresolvedAlerts: 0,
		averageSecurityScore: 0
	},
	modules: [],
	recentActivities: [],
	securityAlerts: [],
	tokens: [],
	wallets: []
}

export default function useSecurityDashboard() {
	const [dashboard, setDashboard] = useState<SecurityDashboard>(defaultDashboard)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [filters, setFilters] = useState<SecurityFilters>({
		search: '',
		module: 'all',
		status: 'all',
		severity: 'all',
		timeRange: 'today'
	})
	const [autoRefresh, setAutoRefresh] = useState(true)

	// Fetch all data from APIs
	const fetchAllData = useCallback(async () => {
		try {
			setError(null)

			const [blockchainRes, tokenStatsRes, proctoringSessions, wallets] = await Promise.allSettled([
				copyrightService.getBlockchainStatus(),
				getAdminStats(),
				getAllSessions(),
				getAllWallets()
			])

			// Build modules from API responses
			const modules: BlockchainModule[] = []
			const activities: ActivityLog[] = []
			const tokens: TokenInfo[] = []
			const walletsData: WalletInfo[] = []

			// Blockchain status -> copyright-protection module
			if (blockchainRes.status === 'fulfilled' && blockchainRes.value?.data) {
				const bcData = blockchainRes.value.data
				// Handle both direct network string and nested blockchain object
				const networkValue = bcData.network
				const networkStr: string = typeof networkValue === 'object' && networkValue !== null
					? ((networkValue as any).name || (networkValue as any).chainId || 'unknown')
					: (typeof networkValue === 'string' ? networkValue : 'unknown')
				const bcModule: BlockchainModule = {
					id: 'copyright-protection',
					name: 'Bảo vệ bản quyền tài liệu học thuật',
					description: 'ReactJS + Node.js + Ethereum • Document hash + Immutable proof',
					type: 'copyright_protection',
					status: bcData.connected ? 'active' : 'error',
					blockchain: (networkStr as BlockchainModule['blockchain']) || 'ethereum',
					contractAddress: bcData.contractAddress || '',
					lastUpdate: new Date().toISOString(),
					totalTransactions: bcData.totalTransactions || 0,
					todayTransactions: 0,
					activeUsers: 0,
					totalValue: parseFloat(bcData.accountBalance || '0'),
					responseTime: 100,
					errorRate: bcData.connected ? 0 : 100,
					uptime: bcData.connected ? 99.9 : 0,
					securityScore: bcData.connected ? 90 : 30,
					vulnerabilities: 0
				}
				modules.push(bcModule)
			}

			// Token stats -> token-rewards module
			if (tokenStatsRes.status === 'fulfilled' && tokenStatsRes.value) {
				const stats = tokenStatsRes.value
				modules.push({
					id: 'token-rewards',
					name: 'Hệ thống học trực tuyến thưởng token',
					description: 'ReactJS + Node.js + ERC-20 • Auto-reward + Learning ecosystem',
					type: 'token_rewards',
					status: 'active',
					blockchain: 'ethereum',
					contractAddress: '',
					lastUpdate: new Date().toISOString(),
					totalTransactions: stats.totalTransactions || 0,
					todayTransactions: stats.todayTransactions || 0,
					activeUsers: stats.totalUsers || 0,
					totalValue: stats.totalTokensIssued || 0,
					responseTime: 95,
					errorRate: 0.1,
					uptime: 99.9,
					securityScore: 97,
					vulnerabilities: 0
				})

				// Token info from admin stats
				tokens.push({
					symbol: 'LEARN',
					name: 'Learning Ecosystem Token',
					contractAddress: '',
					decimals: 18,
					totalSupply: String(stats.totalTokensIssued || 0),
					currentPrice: 0,
					marketCap: 0,
					holders: stats.totalUsers || 0,
					transfers24h: stats.todayTransactions || 0
				})
			}

			// Proctoring sessions -> anti-cheat module
			if (proctoringSessions.status === 'fulfilled' && Array.isArray(proctoringSessions.value)) {
				const sessions = proctoringSessions.value
				const activeSessions = sessions.filter(s => s.status === 'in_progress').length
				const highViolationSessions = sessions.filter(s => (s.highSeverityViolationCount || 0) > 0).length

				modules.push({
					id: 'anti-cheat',
					name: 'Hệ thống thi trực tuyến chống gian lận',
					description: 'ReactJS + Node.js + Smart Contract • Camera AI + On-chain scoring',
					type: 'anti_cheat',
					status: highViolationSessions > 0 ? 'warning' : 'active',
					blockchain: 'ethereum',
					contractAddress: '',
					lastUpdate: new Date().toISOString(),
					totalTransactions: sessions.length,
					todayTransactions: activeSessions,
					activeUsers: activeSessions,
					totalValue: 0,
					responseTime: 120,
					errorRate: highViolationSessions > 0 ? 2 : 0.2,
					uptime: 99.8,
					securityScore: highViolationSessions > 0 ? 85 : 95,
					vulnerabilities: highViolationSessions
				})
			}

			// Multisig wallets -> multisig-wallet module
			if (wallets.status === 'fulfilled' && Array.isArray(wallets.value)) {
				const walletList = wallets.value
				let totalPending = 0
				const mapped: WalletInfo[] = walletList.map(w => {
					totalPending += (w as any).pendingTransactions || 0
					return {
						address: w.contractAddress,
						type: 'multisig' as const,
						balance: w.onChainBalance || '0',
						owners: w.owners,
						requiredConfirmations: w.threshold,
						pendingTransactions: (w as any).pendingTransactions || 0,
						lastActivity: w.updatedAt || w.createdAt || new Date().toISOString()
					}
				})
				walletsData.push(...mapped)

				modules.push({
					id: 'multisig-wallet',
					name: 'Ví đa chữ ký (Multisig Wallet)',
					description: 'ReactJS UI + Node.js backend • Multi-signature + Secure transactions',
					type: 'multisig_wallet',
					status: totalPending > 0 ? 'warning' : 'active',
					blockchain: 'ethereum',
					contractAddress: walletList[0]?.contractAddress || '',
					lastUpdate: new Date().toISOString(),
					totalTransactions: walletList.length,
					todayTransactions: 0,
					activeUsers: walletList.reduce((sum, w) => sum + (w.owners?.length || 0), 0),
					totalValue: walletList.reduce((sum, w) => sum + parseFloat(w.onChainBalance || '0'), 0),
					responseTime: 150,
					errorRate: 0,
					uptime: 99.5,
					securityScore: 90,
					vulnerabilities: 0
				})
			}

			// Build overview
			const overview = {
				totalModules: modules.length,
				activeModules: modules.filter(m => m.status === 'active').length,
				totalTransactions: modules.reduce((sum, m) => sum + m.totalTransactions, 0),
				totalAlerts: dashboard.securityAlerts.length,
				unresolvedAlerts: dashboard.securityAlerts.filter(a => !a.resolved).length,
				averageSecurityScore: modules.length > 0
					? Math.round(modules.reduce((sum, m) => sum + m.securityScore, 0) / modules.length)
					: 0
			}

			setDashboard(prev => ({
				...prev,
				overview,
				modules,
				recentActivities: activities,
				tokens,
				wallets: walletsData
			}))
		} catch (err) {
			console.error('Error fetching security dashboard data:', err)
			setError(err instanceof Error ? err.message : 'Failed to fetch data')
		} finally {
			setIsLoading(false)
		}
	}, [])

	// Initial fetch on mount
	useEffect(() => {
		fetchAllData()
	}, [fetchAllData])

	// Filter modules
	const filteredModules = useMemo(() => {
		let result = [...dashboard.modules]

		if (filters.search) {
			const searchLower = filters.search.toLowerCase()
			result = result.filter(module =>
				module.name.toLowerCase().includes(searchLower) ||
				module.description.toLowerCase().includes(searchLower) ||
				module.type.toLowerCase().includes(searchLower)
			)
		}

		if (filters.module !== 'all') {
			result = result.filter(module => module.type === filters.module)
		}

		if (filters.status !== 'all') {
			result = result.filter(module => module.status === filters.status)
		}

		return result
	}, [dashboard.modules, filters])

	// Filter activities
	const filteredActivities = useMemo(() => {
		let result = [...dashboard.recentActivities]

		if (filters.module !== 'all') {
			const moduleId = filters.module === 'anti_cheat' ? 'anti-cheat' :
							filters.module === 'copyright_protection' ? 'copyright-protection' :
							filters.module === 'token_rewards' ? 'token-rewards' :
							filters.module === 'multisig_wallet' ? 'multisig-wallet' : filters.module
			result = result.filter(activity => activity.module === moduleId)
		}

		if (filters.severity !== 'all') {
			result = result.filter(activity => activity.severity === filters.severity)
		}

		if (filters.timeRange !== 'all') {
			const now = new Date()
			const timeFilter: Record<string, number> = {
				today: 24 * 60 * 60 * 1000,
				week: 7 * 24 * 60 * 60 * 1000,
				month: 30 * 24 * 60 * 60 * 1000,
				all: Infinity
			}
			const timeLimit = timeFilter[filters.timeRange]
			result = result.filter(activity => {
				const activityTime = new Date(activity.timestamp).getTime()
				return (now.getTime() - activityTime) <= timeLimit
			})
		}

		return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
	}, [dashboard.recentActivities, filters])

	// Filter alerts
	const filteredAlerts = useMemo(() => {
		let result = [...dashboard.securityAlerts]

		if (filters.module !== 'all') {
			const moduleId = filters.module === 'anti_cheat' ? 'anti-cheat' :
							filters.module === 'copyright_protection' ? 'copyright-protection' :
							filters.module === 'token_rewards' ? 'token-rewards' :
							filters.module === 'multisig_wallet' ? 'multisig-wallet' : filters.module
			result = result.filter(alert => alert.module === moduleId)
		}

		if (filters.severity !== 'all') {
			result = result.filter(alert => alert.severity === filters.severity)
		}

		return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
	}, [dashboard.securityAlerts, filters])

	// Update filter
	const updateFilter = useCallback((key: keyof SecurityFilters, value: any) => {
		setFilters(prev => ({ ...prev, [key]: value }))
	}, [])

	// Real-time updates: refresh blockchain status and proctoring sessions periodically
	useEffect(() => {
		if (!autoRefresh) return

		const interval = setInterval(async () => {
			try {
				const [blockchainRes, proctoringSessions] = await Promise.allSettled([
					copyrightService.getBlockchainStatus(),
					getAllSessions()
				])

				setDashboard(prev => {
					let updatedModules = [...prev.modules]
					let updatedActivities = [...prev.recentActivities]
					let updatedOverview = { ...prev.overview }

					// Update copyright-protection module
					if (blockchainRes.status === 'fulfilled' && blockchainRes.value?.data) {
						const bcData = blockchainRes.value.data
						const networkValue = bcData.network
						const networkStr: BlockchainModule['blockchain'] = typeof networkValue === 'object' && networkValue !== null
							? (((networkValue as any).name || (networkValue as any).chainId) as BlockchainModule['blockchain']) || updatedModules[idx].blockchain
							: (typeof networkValue === 'string' ? networkValue as BlockchainModule['blockchain'] : updatedModules[idx].blockchain)
						const idx = updatedModules.findIndex(m => m.id === 'copyright-protection')
						if (idx !== -1) {
							updatedModules[idx] = {
								...updatedModules[idx],
								status: bcData.connected ? 'active' : 'error',
								blockchain: networkStr,
								totalValue: parseFloat(bcData.accountBalance || '0'),
								errorRate: bcData.connected ? 0 : 100,
								securityScore: bcData.connected ? 90 : 30,
								lastUpdate: new Date().toISOString()
							}
						}
					}

					// Update anti-cheat module with proctoring data
					if (proctoringSessions.status === 'fulfilled' && Array.isArray(proctoringSessions.value)) {
						const sessions = proctoringSessions.value
						const activeSessions = sessions.filter(s => s.status === 'in_progress').length
						const highViolationSessions = sessions.filter(s => (s.highSeverityViolationCount || 0) > 0).length
						const idx = updatedModules.findIndex(m => m.id === 'anti-cheat')
						if (idx !== -1) {
							updatedModules[idx] = {
								...updatedModules[idx],
								status: highViolationSessions > 0 ? 'warning' : 'active',
								totalTransactions: sessions.length,
								todayTransactions: activeSessions,
								activeUsers: activeSessions,
								errorRate: highViolationSessions > 0 ? 2 : 0.2,
								securityScore: highViolationSessions > 0 ? 85 : 95,
								vulnerabilities: highViolationSessions,
								lastUpdate: new Date().toISOString()
							}
						}
					}

					// Recalculate overview
					updatedOverview = {
						totalModules: updatedModules.length,
						activeModules: updatedModules.filter(m => m.status === 'active').length,
						totalTransactions: updatedModules.reduce((sum, m) => sum + m.totalTransactions, 0),
						totalAlerts: prev.securityAlerts.length,
						unresolvedAlerts: prev.securityAlerts.filter(a => !a.resolved).length,
						averageSecurityScore: updatedModules.length > 0
							? Math.round(updatedModules.reduce((sum, m) => sum + m.securityScore, 0) / updatedModules.length)
							: 0
					}

					// Simulate new activity occasionally
					if (Math.random() < 0.1) {
						const modules = ['anti-cheat', 'copyright-protection', 'token-rewards', 'multisig-wallet']
						const types = ['transaction', 'user_action', 'system_event']
						const severities = ['info', 'warning']

						const newActivity: ActivityLog = {
							id: `log-${Date.now()}`,
							timestamp: new Date().toISOString(),
							module: modules[Math.floor(Math.random() * modules.length)],
							type: types[Math.floor(Math.random() * types.length)] as any,
							severity: severities[Math.floor(Math.random() * severities.length)] as any,
							message: 'Hoạt động mới được ghi nhận',
							details: { simulated: true }
						}

						updatedActivities = [newActivity, ...updatedActivities].slice(0, 50)
					}

					return {
						...prev,
						overview: updatedOverview,
						modules: updatedModules,
						recentActivities: updatedActivities
					}
				})
			} catch (err) {
				console.error('Error in real-time refresh:', err)
			}
		}, 5000)

		return () => clearInterval(interval)
	}, [autoRefresh])

	// Resolve alert (local state only, no dedicated endpoint yet)
	const resolveAlert = useCallback((alertId: string) => {
		setDashboard(prev => ({
			...prev,
			securityAlerts: prev.securityAlerts.map(alert =>
				alert.id === alertId
					? {
						...alert,
						resolved: true,
						resolvedAt: new Date().toISOString(),
						resolvedBy: 'admin-user'
					}
					: alert
			),
			overview: {
				...prev.overview,
				unresolvedAlerts: prev.securityAlerts.filter(a => a.id === alertId && !a.resolved).length > 0
					? prev.overview.unresolvedAlerts - 1
					: prev.overview.unresolvedAlerts
			}
		}))
	}, [])

	const addCustomActivity = useCallback((activity: Partial<ActivityLog>) => {
		const newActivity: ActivityLog = {
			id: `log-${Date.now()}`,
			timestamp: new Date().toISOString(),
			module: 'system',
			type: 'system_event',
			severity: 'info',
			message: 'Hoạt động tùy chỉnh',
			...activity
		}

		setDashboard(prev => ({
			...prev,
			recentActivities: [newActivity, ...prev.recentActivities].slice(0, 50)
		}))
	}, [])

	const getModuleById = useCallback((id: string) => {
		return dashboard.modules.find(module => module.id === id)
	}, [dashboard.modules])

	const getUnresolvedAlerts = useCallback(() => {
		return dashboard.securityAlerts.filter(alert => !alert.resolved)
	}, [dashboard.securityAlerts])

	const getActiveModules = useCallback(() => {
		return dashboard.modules.filter(module => module.status === 'active')
	}, [dashboard.modules])

	const getModulesByStatus = useCallback((status: string) => {
		return dashboard.modules.filter(module => module.status === status)
	}, [dashboard.modules])

	return {
		dashboard,
		modules: filteredModules,
		activities: filteredActivities,
		alerts: filteredAlerts,
		filters,
		updateFilter,
		autoRefresh,
		setAutoRefresh,
		resolveAlert,
		addCustomActivity,
		getModuleById,
		getUnresolvedAlerts,
		getActiveModules,
		getModulesByStatus,
		isLoading,
		error,
		refreshData: fetchAllData
	}
}

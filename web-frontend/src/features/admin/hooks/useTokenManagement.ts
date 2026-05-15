import { useState, useCallback, useEffect } from 'react'
import { getAdminStats, getTopUsers, getRulePerformance, getAllTransactions } from '@/features/rewards/api'
import type { BalanceResponse } from '@/features/rewards/api'

type AdminStatsResponse = Awaited<ReturnType<typeof getAdminStats>>
type TopUser = Awaited<ReturnType<typeof getTopUsers>>[number]
type RulePerformance = Awaited<ReturnType<typeof getRulePerformance>>[number]
type Transaction = Awaited<ReturnType<typeof getAllTransactions>>['transactions'][number]

export type TokenManagementState = {
	stats: AdminStatsResponse | null
	topUsers: TopUser[]
	rulePerformance: RulePerformance[]
	recentTransactions: Transaction[]
	loading: boolean
	error: string | null
}

export function useTokenManagement() {
	const [stats, setStats] = useState<AdminStatsResponse | null>(null)
	const [topUsers, setTopUsers] = useState<TopUser[]>([])
	const [rulePerformance, setRulePerformance] = useState<RulePerformance[]>([])
	const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'rules' | 'transactions'>('overview')

	const fetchData = useCallback(async () => {
		try {
			setLoading(true)
			setError(null)
			const [statsData, usersData, rulesData, transactionsData] = await Promise.all([
				getAdminStats(),
				getTopUsers(10),
				getRulePerformance(),
				getAllTransactions(1, 20),
			])
			setStats(statsData)
			setTopUsers(usersData)
			setRulePerformance(rulesData)
			setRecentTransactions(transactionsData.transactions || [])
		} catch (err: any) {
			console.error('Error fetching token management data:', err)
			setError(err.message || 'Không thể tải dữ liệu')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	const formatNumber = (num: number): string => {
		return num.toLocaleString('vi-VN')
	}

	const formatDate = (dateStr: string): string => {
		try {
			return new Date(dateStr).toLocaleString('vi-VN')
		} catch {
			return dateStr
		}
	}

	return {
		// Data
		stats,
		topUsers,
		rulePerformance,
		recentTransactions,
		// State
		loading,
		error,
		activeTab,
		setActiveTab,
		// Actions
		fetchData,
		// Helpers
		formatNumber,
		formatDate,
	}
}

// Leaderboard API Service
// Dedicated API layer for the leaderboard-service (Node.js).

import { leaderboardClient } from '@/foundation/api/client'
import { LEADERBOARD_ENDPOINTS } from '@/foundation/api/endpoints'
import {
	LeaderboardEntry,
	LeaderboardData,
	PaginationInfo,
	LeaderboardFilters,
	CountryCode,
} from '@/foundation/types/leaderboard'

// ============================================================
// Types
// ============================================================

export interface LeaderboardApiEntry {
	id: string
	user_id: string
	username: string
	country_code: string
	total_score: number
	algorithms: Record<string, number>
	contests_participated: number
	contests_completed: number
	average_score: number
	best_rank: number | null
	rank: number | null
	avatar_url: string | null
	created_at: string
	updated_at: string
}

export interface LeaderboardApiResponse {
	success: boolean
	data: LeaderboardApiEntry[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

export interface TopUsersResponse {
	success: boolean
	data: LeaderboardApiEntry[]
}

// ============================================================
// Country code mapping
// ============================================================

const COUNTRY_NAME_MAP: Record<string, string> = {
	BY: 'Belarus', JP: 'Japan', RU: 'Russia', LV: 'Latvia', US: 'United States',
	CL: 'Chile', CA: 'Canada', CN: 'China', IN: 'India', BR: 'Brazil',
	DE: 'Germany', FR: 'France', GB: 'United Kingdom', AU: 'Australia',
	KR: 'South Korea', SG: 'Singapore', NL: 'Netherlands', SE: 'Sweden',
	FI: 'Finland', NO: 'Norway', DK: 'Denmark', CH: 'Switzerland',
	AT: 'Austria', BE: 'Belgium', PL: 'Poland', CZ: 'Czech Republic',
	HU: 'Hungary', IT: 'Italy', ES: 'Spain', PT: 'Portugal', GR: 'Greece',
	RO: 'Romania', BG: 'Bulgaria', HR: 'Croatia', SK: 'Slovakia',
	SI: 'Slovenia', EE: 'Estonia', LT: 'Lithuania', IE: 'Ireland',
	IS: 'Iceland', LU: 'Luxembourg', MT: 'Malta', CY: 'Cyprus',
	VN: 'Vietnam', UNKNOWN: 'Unknown',
}

const getCountryInfo = (countryCode: string | undefined): { country: CountryCode; countryName: string } => {
	const VALID_CODES: CountryCode[] = [
		'BY','JP','RU','LV','US','CL','CA','CN','IN','BR',
		'DE','FR','GB','AU','KR','SG','NL','SE','FI','NO',
		'DK','CH','AT','BE','PL','CZ','HU','IT','ES','PT',
		'GR','RO','BG','HR','SK','SI','EE','LT','IE','IS',
		'LU','MT','CY','VN',
	]
	if (!countryCode) {
		return { country: 'UNKNOWN', countryName: COUNTRY_NAME_MAP['UNKNOWN'] ?? 'Unknown' }
	}
	const upperCode = countryCode.toUpperCase()
	if (VALID_CODES.includes(upperCode as CountryCode)) {
		return { country: upperCode as CountryCode, countryName: COUNTRY_NAME_MAP[upperCode] ?? upperCode }
	}
	return { country: 'UNKNOWN', countryName: COUNTRY_NAME_MAP['UNKNOWN'] ?? 'Unknown' }
}

// ============================================================
// Transform API entry to LeaderboardEntry
// ============================================================

const transformEntry = (entry: LeaderboardApiEntry, index: number): LeaderboardEntry => {
	const countryInfo = getCountryInfo(entry.country_code)
	const effectiveRank = entry.rank ?? index + 1

	return {
		id: entry.user_id,
		hackerName: entry.username,
		rank: effectiveRank,
		country: countryInfo.country,
		countryName: countryInfo.countryName,
		score: Number(entry.total_score),
		algorithms: entry.algorithms ?? {},
		contests: {
			totalContests: entry.contests_participated ?? 0,
			completedContests: entry.contests_completed ?? 0,
			averageScore: Number(entry.average_score ?? 0),
			bestRank: entry.best_rank ?? 0,
		},
		profileUrl: `/hackers/${entry.user_id.toLowerCase()}`,
		avatarUrl: entry.avatar_url ?? undefined,
	}
}

// ============================================================
// Default values
// ============================================================

const defaultPagination: PaginationInfo = {
	currentPage: 1,
	totalPages: 1,
	itemsPerPage: 20,
	totalItems: 0,
	hasNextPage: false,
	hasPrevPage: false,
}

const defaultFilters: LeaderboardFilters = {
	hackers: 'all',
	filterBy: null,
	country: undefined,
	company: undefined,
	school: undefined,
	hackerName: undefined,
}

// ============================================================
// API Methods
// ============================================================

export interface FetchLeaderboardParams {
	page?: number
	limit?: number
	sortBy?: 'rank' | 'score' | 'username' | 'contests'
	country?: CountryCode
}

/**
 * Fetch paginated leaderboard from the dedicated leaderboard-service.
 * Falls back to mock data if the API is unavailable.
 */
export const fetchLeaderboard = async ({
	page = 1,
	limit = 20,
	sortBy = 'rank',
	country,
}: FetchLeaderboardParams): Promise<LeaderboardData> => {
	try {
		const params: Record<string, string | number> = { page, limit }
		if (country) params.country = country
		if (sortBy) params.sortBy = sortBy

		const response = await leaderboardClient.get<LeaderboardApiResponse>(
			LEADERBOARD_ENDPOINTS.LIST,
			{ params }
		)

		const apiData = response.data
		if (!apiData.success) {
			throw new Error('Invalid response from leaderboard service')
		}

		const nested = apiData.data as { data: LeaderboardApiEntry[]; pagination: LeaderboardApiResponse['pagination'] }
		if (!Array.isArray(nested.data)) {
			throw new Error('Invalid response from leaderboard service')
		}

		const entries: LeaderboardEntry[] = nested.data.map(transformEntry)
		const pagination: PaginationInfo = {
			...defaultPagination,
			currentPage: nested.pagination.page,
			totalPages: nested.pagination.totalPages,
			totalItems: nested.pagination.total,
			itemsPerPage: nested.pagination.limit,
			hasNextPage: nested.pagination.page < nested.pagination.totalPages,
			hasPrevPage: nested.pagination.page > 1,
		}

		return { entries, pagination, filters: defaultFilters }
	} catch (error) {
		console.error('[Leaderboard API] Error fetching leaderboard:', error)
		throw error instanceof Error ? error : new Error('Failed to fetch leaderboard data')
	}
}

/**
 * Fetch top N users from the leaderboard.
 */
export const fetchTopUsers = async (limit = 10): Promise<LeaderboardEntry[]> => {
	try {
		const response = await leaderboardClient.get<TopUsersResponse>(LEADERBOARD_ENDPOINTS.TOP, {
			params: { limit },
		})
		if (!response.data.success || !Array.isArray(response.data.data)) {
			throw new Error('Invalid response from leaderboard service')
		}
		return response.data.data.map(transformEntry)
	} catch (error) {
		console.error('[Leaderboard API] Error fetching top users:', error)
		throw error instanceof Error ? error : new Error('Failed to fetch top users')
	}
}

/**
 * Fetch a specific user's rank and details.
 */
export const fetchUserRank = async (userId: string): Promise<LeaderboardEntry | null> => {
	try {
		const response = await leaderboardClient.get<{ success: boolean; data: LeaderboardApiEntry }>(
			LEADERBOARD_ENDPOINTS.USER(userId)
		)
		if (!response.data.success || !response.data.data) {
			return null
		}
		return transformEntry(response.data.data, 0)
	} catch (error) {
		console.error('[Leaderboard API] Error fetching user rank:', error)
		return null
	}
}

/**
 * Submit a contest score for a user.
 */
export const submitScore = async (payload: {
	userId: string
	username: string
	countryCode?: string
	score: number
	algorithmScores?: Record<string, number>
	contestId?: string
	contestName?: string
}): Promise<LeaderboardEntry> => {
	const response = await leaderboardClient.post<{ success: boolean; data: LeaderboardApiEntry }>(
		LEADERBOARD_ENDPOINTS.SUBMIT,
		payload
	)
	if (!response.data.success || !response.data.data) {
		throw new Error('Failed to submit score')
	}
	return transformEntry(response.data.data, 0)
}

export default { fetchLeaderboard, fetchTopUsers, fetchUserRank, submitScore }

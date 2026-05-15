import { useCallback, useEffect, useRef, useState } from 'react'
import { onlineExamApi } from '@/features/exams/api'
import type { ActiveProctoredStudent } from '@/features/exams/api'

export interface ActiveProctoringRosterState {
	roster: ActiveProctoredStudent[]
	loading: boolean
	error: string | null
	lastFetchedAt: number | null
	refresh: () => Promise<void>
}

function sanitizeRoster(data: ActiveProctoredStudent[]): ActiveProctoredStudent[] {
	return (data ?? []).filter(Boolean).map(entry => ({
		...entry,
		sessionId: entry.sessionId ?? '',
		sessionStatus: entry.sessionStatus ?? null,
		studentId: entry.studentId ?? null,
		examId: entry.examId ?? null,
		examTitle: entry.examTitle ?? null,
		examStatus: entry.examStatus ?? null,
		submissionId: entry.submissionId ?? null,
		startedAt: entry.startedAt ?? null,
		timeSpentSeconds: entry.timeSpentSeconds ?? null,
		lastUpdatedAt: entry.lastUpdatedAt ?? null,
	}))
}

export function useActiveProctoringRoster(pollIntervalMs = 15000): ActiveProctoringRosterState {
	const [roster, setRoster] = useState<ActiveProctoredStudent[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null)

	const pollIntervalRef = useRef<number | null>(null)
	const isMountedRef = useRef(true)
	const isFetchingRef = useRef(false)

	const fetchRoster = useCallback(async () => {
		if (isFetchingRef.current) {
			return
		}
		isFetchingRef.current = true
		try {
			if (!roster.length) {
				setLoading(true)
			}
			const data = await onlineExamApi.getActiveProctoredStudents()
			if (!isMountedRef.current) {
				return
			}
			setRoster(sanitizeRoster(data))
			setLastFetchedAt(Date.now())
			setError(null)
		} catch (err) {
			console.error('[useActiveProctoringRoster] Cannot fetch roster', err)
			if (isMountedRef.current) {
				setError(err instanceof Error ? err.message : 'Không thể tải danh sách proctoring hiện tại')
			}
		} finally {
			if (isMountedRef.current) {
				setLoading(false)
			}
			isFetchingRef.current = false
		}
	}, [roster.length])

	useEffect(() => {
		isMountedRef.current = true
		fetchRoster()
		return () => {
			isMountedRef.current = false
			if (pollIntervalRef.current) {
				window.clearInterval(pollIntervalRef.current)
			}
		}
	}, [fetchRoster])

	useEffect(() => {
		if (pollIntervalRef.current) {
			window.clearInterval(pollIntervalRef.current)
			pollIntervalRef.current = null
		}

		if (pollIntervalMs > 0) {
			pollIntervalRef.current = window.setInterval(() => {
				fetchRoster().catch(() => {
					// errors are handled inside fetchRoster
				})
			}, pollIntervalMs)
		}

		return () => {
			if (pollIntervalRef.current) {
				window.clearInterval(pollIntervalRef.current)
				pollIntervalRef.current = null
			}
		}
	}, [fetchRoster, pollIntervalMs])

	return {
		roster,
		loading,
		error,
		lastFetchedAt,
		refresh: fetchRoster,
	}
}

export default useActiveProctoringRoster

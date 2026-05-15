import { useState, useCallback } from 'react'
import {
    awardLessonCompletion,
    awardExamPass,
    awardDailyStreak,
    awardCertification,
    awardContestWin
} from '@/features/rewards/api'

interface UseTokenRewardsProps {
    userId?: string
    walletAddress?: string
    onRewardEarned?: (amount: number, reason: string) => void
    onError?: (error: string) => void
}

export function useTokenRewards({
    userId,
    walletAddress,
    onRewardEarned,
    onError
}: UseTokenRewardsProps) {
    const [isAwarding, setIsAwarding] = useState(false)
    const [lastReward, setLastReward] = useState<{
        amount: number
        reason: string
    } | null>(null)

    const awardForLessonCompletion = useCallback(async (lessonId: string, lessonName: string) => {
        if (!userId || !walletAddress) {
            onError?.('User not authenticated')
            return false
        }

        setIsAwarding(true)
        try {
            const transaction = await awardLessonCompletion({
                userId,
                walletAddress,
                reason: `Hoàn thành: ${lessonName}`
            })

            setLastReward({
                amount: transaction.amount,
                reason: transaction.description
            })

            onRewardEarned?.(transaction.amount, transaction.description)
            return true
        } catch (error: any) {
            onError?.(error.message || 'Failed to award lesson completion')
            return false
        } finally {
            setIsAwarding(false)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, walletAddress])

    const awardForExamPass = useCallback(async (examId: string, examName: string, score: number) => {
        if (!userId || !walletAddress) {
            onError?.('User not authenticated')
            return false
        }

        setIsAwarding(true)
        try {
            const transaction = await awardExamPass({
                userId,
                walletAddress,
                score,
                reason: `Hoàn thành bài thi: ${examName} (${score} điểm)`
            })

            setLastReward({
                amount: transaction.amount,
                reason: transaction.description
            })

            onRewardEarned?.(transaction.amount, transaction.description)
            return true
        } catch (error: any) {
            onError?.(error.message || 'Failed to award exam pass')
            return false
        } finally {
            setIsAwarding(false)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, walletAddress])

    const awardForDailyStreak = useCallback(async (streakDays: number) => {
        if (!userId || !walletAddress) {
            onError?.('User not authenticated')
            return false
        }

        setIsAwarding(true)
        try {
            const transaction = await awardDailyStreak({
                userId,
                walletAddress,
                streakDays,
                reason: `Chuỗi ${streakDays} ngày học tập liên tục`
            })

            setLastReward({
                amount: transaction.amount,
                reason: transaction.description
            })

            onRewardEarned?.(transaction.amount, transaction.description)
            return true
        } catch (error: any) {
            onError?.(error.message || 'Failed to award daily streak')
            return false
        } finally {
            setIsAwarding(false)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, walletAddress])

    const awardForCertification = useCallback(async (certificationId: string, certificationName: string) => {
        if (!userId || !walletAddress) {
            onError?.('User not authenticated')
            return false
        }

        setIsAwarding(true)
        try {
            const transaction = await awardCertification({
                userId,
                walletAddress,
                reason: `Đạt chứng chỉ: ${certificationName}`
            })

            setLastReward({
                amount: transaction.amount,
                reason: transaction.description
            })

            onRewardEarned?.(transaction.amount, transaction.description)
            return true
        } catch (error: any) {
            onError?.(error.message || 'Failed to award certification')
            return false
        } finally {
            setIsAwarding(false)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, walletAddress])

    const awardForContestWin = useCallback(async (contestId: string, contestName: string, rank: number) => {
        if (!userId || !walletAddress) {
            onError?.('User not authenticated')
            return false
        }

        setIsAwarding(true)
        try {
            const transaction = await awardContestWin({
                userId,
                walletAddress,
                rank,
                reason: `Đạt hạng ${rank} trong cuộc thi: ${contestName}`
            })

            setLastReward({
                amount: transaction.amount,
                reason: transaction.description
            })

            onRewardEarned?.(transaction.amount, transaction.description)
            return true
        } catch (error: any) {
            onError?.(error.message || 'Failed to award contest win')
            return false
        } finally {
            setIsAwarding(false)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, walletAddress])

    return {
        isAwarding,
        lastReward,
        awardForLessonCompletion,
        awardForExamPass,
        awardForDailyStreak,
        awardForCertification,
        awardForContestWin
    }
}

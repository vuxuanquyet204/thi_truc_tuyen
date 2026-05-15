// Rewards API barrel
// Re-export from both files with explicit selection to avoid conflicts

// From tokenRewardApi - getBalance, spendTokens, etc.
export {
	grantTokens,
	spendTokens,
	withdrawTokens,
	getLinkedWallet,
	linkWallet,
	unlinkWallet,
	getBalance,
	getHistory,
	grantCourseCompletionTokens,
	getGifts,
	getGiftById,
	getAdminStats,
	getTopUsers,
	getRulePerformance,
	getAllTransactions,
} from './tokenRewardApi';

// From tokenApi - wrapper functions (excluding duplicates already in tokenRewardApi)
export {
	awardLessonCompletion,
	awardExamPass,
	awardDailyStreak,
	awardCertification,
	awardContestWin,
	awardCourseCompletion,
	getAvailableGifts,
	getGiftDetails,
	redeemGift,
	unlockCourse,
	getUserTransactionHistory,
	getUserTokenBalance,
	getTransactionHistory,
	verifyTransaction,
	getTokenStats,
} from './tokenApi';

export type {
	GrantTokenRequest,
	SpendTokenRequest,
	BalanceResponse,
	HistoryResponse,
	Transaction,
	GiftItem,
	RewardRequest,
	RedeemGiftRequest,
	CourseUnlockRequest,
	TokenTransaction,
} from './tokenApi';

// From leaderboardApi - leaderboard ranking functions
export {
	fetchLeaderboard,
	fetchTopUsers,
	fetchUserRank,
	submitScore,
	type LeaderboardApiEntry,
	type LeaderboardApiResponse,
	type TopUsersResponse,
	type FetchLeaderboardParams,
} from './leaderboardApi';

// Default export
import tokenRewardApi from './tokenRewardApi';
export default tokenRewardApi;

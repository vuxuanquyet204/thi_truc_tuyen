/**
 * Route path constants.
 * Use these instead of hardcoding paths throughout the app.
 */

export const ROUTE_PATHS = {
	// Auth
	AUTH: '/auth',
	LOGIN: '/auth',
	REGISTER: '/auth',
	FORGOT_PASSWORD: '/auth/forgot-password',
	OAUTH_CALLBACK: '/oauth/callback',

	// Admin
	ADMIN: '/admin',
	ADMIN_DASHBOARD: '/admin/dashboard',
	ADMIN_USERS: '/admin/users',
	ADMIN_EXAMS: '/admin/exams',
	ADMIN_PROCTORING: '/admin/proctoring',
	ADMIN_SECURITY: '/admin/security',
	ADMIN_REWARD: '/admin/reward',
	ADMIN_TOKENS: '/admin/tokens',
	ADMIN_MULTISIG: '/admin/multisig',
	ADMIN_COURSES: '/admin/courses',
	ADMIN_ORGANIZATIONS: '/admin/organizations',
	ADMIN_CERTIFY: '/admin/certify',
	ADMIN_ADMIN: '/admin/admin',
	ADMIN_ANALYTICS: '/admin/analytics',
	ADMIN_COPYRIGHT: '/admin/copyright',

	// User
	HOME: '/user',
	USER_HOME: '/user/home',
	USER_PREPARE: '/user/prepare',
	USER_CERTIFY: '/user/certify',
	USER_COMPETE: '/user/compete',
	USER_EXAM: '/user/exam',
	USER_COURSES: '/user/courses',
	USER_REWARD: '/user/reward',
	USER_COPYRIGHT: '/user/copyright',
	USER_PROFILE: '/user/profile',
	USER_SETTINGS: '/user/settings',
	USER_LEADERBOARD: '/user/leaderboard',
	USER_MULTISIG: '/user/multisig',

	// Landing
	LANDING: '/',

	// Exam (protected, user-specific)
	EXAM_PRE_CHECK: (examId: string) => `/exam/${examId}/pre-check`,
	EXAM_TAKE: (examId: string) => `/exam/${examId}/take`,
	EXAM_RESULT: (examId: string) => `/exam/${examId}/result`,
	EXAM_DETAIL: (examId: string) => `/exam/${examId}/detail`,

	// Course
	COURSE_DETAIL: (courseId: string) => `/user/courses/${courseId}`,
	COURSE_LEARN: (courseId: string) => `/user/courses/${courseId}/learn`,

	// Certification
	CERTIFY_DETAIL: (certificationId: string) => `/user/certify/${certificationId}`,

	// Contest
	CONTEST_DETAIL: (contestId: string) => `/user/compete/${contestId}`,

	// Exam user pages
	EXAM_RECENT: '/user/exams/recent',
	EXAM_SCHEDULE: '/user/exams/schedule',
	EXAM_REWARDS_STORE: '/user/rewards/store',
	CHECK_DUPLICATE: '/user/check-duplicate',

	// Wildcard
	NOT_FOUND: '/not-found',
} as const

export type RoutePath = typeof ROUTE_PATHS[keyof typeof ROUTE_PATHS]

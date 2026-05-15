/**
 * Centralized API endpoint constants.
 *
 * These constants ensure consistent endpoint paths across the application.
 * Use these instead of hardcoding URLs in components.
 */

// ============================================================
// API PATH DEFINITIONS
// All paths are relative to their service base URL.
// Full URL: VITE_API_BASE_URL + /api/v1/notifications
// notification-service routes:
// GET  /stream           — SSE real-time stream
// GET  /                 — Paginated notification list
// GET  /unread-count     — Unread count
// PUT  /:id/read         — Mark one as read
// PUT  /read-all         — Mark all as read
// DELETE /:id            — Delete one
// DELETE /               — Delete all
// POST /send             — Send notification (Kafka producer via REST)
// ============================================================
export const NOTIFICATION_ENDPOINTS = {
	BASE: '/api/v1/notifications',
	STREAM: '/api/v1/notifications/stream',
	UNREAD_COUNT: '/api/v1/notifications/unread-count',
	MARK_READ: (id: string) => `/api/v1/notifications/${id}/read`,
	MARK_ALL_READ: '/api/v1/notifications/read-all',
	DELETE_ONE: (id: string) => `/api/v1/notifications/${id}`,
	DELETE_ALL: '/api/v1/notifications',
	SEND: '/api/v1/notifications/send',
} as const
// All paths are relative to their service base URL.
// The actual full URL is built by combining with VITE_API_BASE_URL
// and the service-specific axios instance baseURL.
// ============================================================

export const API_PATHS = {
	// Identity Service: /identity/** → identity-service (strip /identity) → /api/v1/**
	IDENTITY: '/identity/api/v1',

	// Course Service: /course/api/v1/** → course-service → /api/v1/**
	COURSE: '/course/api/v1',

	// Exam Service: /exam/** → exam-service (strip /exam) → /exam/**
	EXAM: '/exam',

	// Online Exam Service: /api/exam/** → online-exam-service
	ONLINE_EXAM: '/api/exam',

	// Token Reward Service: /api/tokens/** → token-reward-service (no strip)
	TOKEN: '/api/tokens',

	// Copyright Service: /api/copyrights/** → copyright-service (strip /api/copyrights)
	COPYRIGHT: '/api/copyrights',

	// Multisig Service: /api/v1/multisig/** → multisig-service (no strip)
	MULTISIG: '/api/v1/multisig',

	// Proctoring Service: /api/proctoring/** → proctoring-service (strip /api)
	PROCTORING: '/api/proctoring',

	// Organization Service: /api/organization/** → organization-service
	ORGANIZATION: '/api/organization',

	// Analytics Service: /analytics/** → analytics-service (no strip)
	ANALYTICS: '/analytics',

	// Aliases for backward compatibility
	API: '/api/v1',
	API_V2: '/api/v2',
} as const

// ============================================================
// AUTH ENDPOINTS
// Full URL: VITE_API_BASE_URL + IDENTITY + path
// Identity Service: /identity/** → /api/v1/**
// ============================================================
export const AUTH_ENDPOINTS = {
	LOGIN: '/auth/login',
	REGISTER: '/auth/register',
	REFRESH: '/auth/refresh',
	LOGOUT: '/auth/logout',
	VERIFY: '/auth/verify',
	FORGOT_PASSWORD: '/auth/forgot-password',
	RESET_PASSWORD: '/auth/reset-password',
	ME: '/auth/me',
} as const

// User endpoints
export const USER_ENDPOINTS = {
	BASE: '/users',
	BY_ID: (id: string) => `/users/${id}`,
	PROFILE: (id: string) => `/users/${id}/profile`,
	AVATAR: (id: string) => `/users/${id}/avatar`,
	CHANGE_PASSWORD: '/users/change-password',
	SEARCH: '/users/search',
} as const

// ============================================================
// COURSE ENDPOINTS
// Full URL: VITE_API_BASE_URL + COURSE + path
// course-service routes: /courses, /courses/:id, /courses/:id/roster, /courses/:id/materials
// /courses/:id/quizzes, /courses/:id/progress, /courses/:id/publish, /courses/:id/images/upload
// /quizzes/:id, /quizzes/:id/submit, /progress/student/:studentId/course/:courseId/material/:materialId
// /progress/student/:studentId/course/:courseId, /rewards/student/:studentId, /rewards/grant
// ============================================================
export const COURSE_ENDPOINTS = {
	BASE: '/courses',
	BY_ID: (id: string) => `/courses/${id}`,
	ENROLL: (id: string) => `/courses/${id}/enroll`,
	PROGRESS: (id: string) => `/courses/${id}/progress`,
	CHAPTERS: (id: string) => `/courses/${id}/chapters`,
	ROSTER: (id: string) => `/courses/${id}/roster`,
	MATERIALS: (id: string) => `/courses/${id}/materials`,
	MATERIALS_UPLOAD: (id: string) => `/courses/${id}/materials/upload`,
	QUIZZES: (id: string) => `/courses/${id}/quizzes`,
	PUBLISH: (id: string) => `/courses/${id}/publish`,
	IMAGES_UPLOAD: (id: string) => `/courses/${id}/images/upload`,
	ENROLLMENTS: '/enrollments',
	ENROLLMENT_BY_ID: (id: string) => `/enrollments/${id}`,
	COMPLETE_CHAPTER: (courseId: string, chapterId: string) =>
		`/enrollments/${courseId}/chapters/${chapterId}/complete`,
	// Quiz endpoints
	QUIZ_BY_ID: (id: string) => `/quizzes/${id}`,
	QUIZ_SUBMIT: (id: string) => `/quizzes/${id}/submit`,
	// Material endpoints
	MATERIAL_BY_ID: (id: string) => `/materials/${id}`,
	// Progress endpoints
	STUDENT_PROGRESS: (studentId: string, courseId: string) =>
		`/progress/student/${studentId}/course/${courseId}`,
	UPDATE_PROGRESS: (studentId: string, courseId: string, materialId: string) =>
		`/progress/student/${studentId}/course/${courseId}/material/${materialId}`,
	// Reward endpoints
	STUDENT_REWARDS: (studentId: string) => `/rewards/student/${studentId}`,
	GRANT_REWARD: '/rewards/grant',
} as const

// ============================================================
// EXAM ENDPOINTS (Admin Exam Management)
// Full URL: VITE_API_BASE_URL + EXAM + path
// exam-service routes: /exams, /exams/:id, /exams/:id/config, /exams/:id/schedule
// /exams/:id/status, /exams/:id/generate-questions, /exams/schedules
// /questions, /questions/generate, /questions/:id, /api/questions/import-excel
// ============================================================
export const EXAM_ENDPOINTS = {
	BASE: '/exams',
	BY_ID: (id: string) => `/exams/${id}`,
	DETAILS: (id: string) => `/exams/${id}`,
	CONFIG: (id: string) => `/exams/${id}/config`,
	SCHEDULE: (id: string) => `/exams/${id}/schedule`,
	STATUS: (id: string) => `/exams/${id}/status`,
	GENERATE_QUESTIONS: (id: string) => `/exams/${id}/generate-questions`,
	SCHEDULES: '/exams/schedules',
	SUBJECTS: '/exams/subjects',
	TYPES: '/exams/types',
	DIFFICULTIES: '/exams/difficulties',
	STATUSES: '/exams/statuses',
	// Question endpoints
	QUESTIONS: '/questions',
	QUESTION_BY_ID: (id: string) => `/questions/${id}`,
	GENERATE_RANDOM: '/questions/generate',
	IMPORT_EXCEL: '/questions/import-excel',
	IMPORT_STATS: '/questions/import-stats',
	BY_TAG: (tag: string) => `/questions/by-tag/${tag}`,
	// Exam-level question endpoints
	EXAM_QUESTIONS: (id: string) => `/exams/${id}/questions`,
} as const

// ============================================================
// TOKEN/REWARD ENDPOINTS
// Full URL: VITE_API_BASE_URL + TOKEN + path
// token-reward-service routes: /grant, /spend, /withdraw
// /wallets/me, /wallets/link, /balance/:studentId, /history/:studentId
// /admin/stats, /admin/top-users, /admin/rule-performance, /admin/transactions
// /gifts, /gifts/:id, /redeem/gift, /redeem/course
// ============================================================
export const TOKEN_ENDPOINTS = {
	// Core token operations
	GRANT: '/grant',
	SPEND: '/spend',
	WITHDRAW: '/withdraw',
	BALANCE: (id: string) => `/balance/${id}`,
	HISTORY: (id: string) => `/history/${id}`,
	// Wallet operations
	WALLET_ME: '/wallets/me',
	WALLET_LINK: '/wallets/link',
	// Admin operations
	ADMIN_STATS: '/admin/stats',
	ADMIN_TOP_USERS: '/admin/top-users',
	ADMIN_RULE_PERFORMANCE: '/admin/rule-performance',
	ADMIN_TRANSACTIONS: '/admin/transactions',
	// Gift operations
	GIFTS: '/gifts',
	GIFT_BY_ID: (id: string) => `/gifts/${id}`,
	REDEEM_GIFT: '/redeem/gift',
	REDEEM_COURSE: '/redeem/course',
} as const

// ============================================================
// COPYRIGHT ENDPOINTS
// Full URL: VITE_API_BASE_URL + COPYRIGHT + path
// copyright-service routes: /copyrights, /copyrights/:id, /copyrights/register
// /copyrights/stats, /copyrights/analytics, /copyrights/recent, /copyrights/search
// /copyrights/check-similarity, /copyrights/blockchain/status, /copyrights/export
// /copyrights/document/:hash, /copyrights/ipfs/upload, /copyrights/ipfs/:hash
// ============================================================
export const COPYRIGHT_ENDPOINTS = {
	// Relative to /api/copyrights
	BASE: '',
	BY_ID: (id: string) => `/${id}`,
	REGISTER: '/register',
	REGISTER_TEXT: '/register-text',
	VERIFY: '/verify',
	VERIFY_BY_HASH: (hash: string) => `/verify/${hash}`,
	SIMILARITY: '/check-similarity',
	DUPLICATE_CHECK: '/check-duplicate',
	SEARCH: '/search',
	EXPORT: '/export',
	IMPORT: '/import',
	STATS: '/stats',
	ANALYTICS: '/analytics',
	RECENT: '/recent',
	HEALTH: '/health',
	BLOCKCHAIN_STATUS: '/blockchain/status',
	DOCUMENT_BY_HASH: (hash: string) => `/document/${hash}`,
	DOCUMENT_TAGS: (hash: string) => `/document/${hash}/tags`,
	OWNER: (address: string) => `/owner/${address}`,
	CATEGORY: (cat: string) => `/category/${cat}`,
	USER: (address: string) => `/user/${address}`,
	EXISTS: (hash: string) => `/exists/${hash}`,
	IPFS_UPLOAD: '/ipfs/upload',
	IPFS_BY_HASH: (hash: string) => `/ipfs/${hash}`,
	HASH_CALCULATE: '/hash/calculate',
	HASH_TEXT: '/hash/text',
	TRANSACTIONS: (address: string) => `/transactions/${address}`,
	FEES: '/fees',
	TRANSACTION_STATUS: (txHash: string) => `/transaction/${txHash}/status`,
	CONTRACT_INFO: '/contract/info',
	CONTRACT_EVENTS: '/contract/events',
	REPORTS: '/reports',
	NOTIFICATIONS: '/notifications',
	// For backward compatibility
	SIMILARITY_: '/similarity',
	SEARCH_: '/search',
	EXPORT_: '/export',
	STATS_: '/stats',
	IPFS: '/ipfs',
} as const

// Multisig endpoints
export const MULTISIG_ENDPOINTS = {
	BASE: '/multisig',
	WALLETS: '/multisig/wallets',
	WALLET_BY_ID: (id: string) => `/multisig/wallets/${id}`,
	TRANSACTIONS: '/multisig/transactions',
	TRANSACTION_BY_ID: (id: string) => `/multisig/transactions/${id}`,
	CREATE_TRANSACTION: '/multisig/transactions/create',
	CONFIRM: (id: string) => `/multisig/transactions/${id}/confirm`,
	REVOKE: (id: string) => `/multisig/transactions/${id}/revoke`,
	EXECUTE: (id: string) => `/multisig/transactions/${id}/execute`,
} as const

// Proctoring endpoints
export const PROCTORING_ENDPOINTS = {
	BASE: '/proctoring',
	SESSIONS: '/proctoring/sessions',
	SESSION_BY_ID: (id: string) => `/proctoring/sessions/${id}`,
	VIOLATIONS: (sessionId: string) => `/proctoring/sessions/${sessionId}/violations`,
	SCREENSHOTS: (sessionId: string) => `/proctoring/sessions/${sessionId}/screenshots`,
	UPLOAD_SCREENSHOT: '/proctoring/screenshots',
	EVENTS: (sessionId: string) => `/proctoring/sessions/${sessionId}/events`,
	STATUS: (sessionId: string) => `/proctoring/sessions/${sessionId}/status`,
	MONITOR: '/proctoring/monitor',
	ACTIVE: '/proctoring/sessions/active',
} as const

// Organization endpoints
export const ORGANIZATION_ENDPOINTS = {
	BASE: '/organizations',
	BY_ID: (id: string) => `/organizations/${id}`,
	USERS: (id: string) => `/organizations/${id}/users`,
	COURSES: (id: string) => `/organizations/${id}/courses`,
	STATISTICS: (id: string) => `/organizations/${id}/statistics`,
	INVITE: (id: string) => `/organizations/${id}/invite`,
} as const

// Analytics endpoints
export const ANALYTICS_ENDPOINTS = {
	BASE: '/analytics',
	DASHBOARD: '/analytics/dashboard',
	USERS: '/analytics/users',
	COURSES: '/analytics/courses',
	REVENUE: '/analytics/revenue',
	ENGAGEMENT: '/analytics/engagement',
	CONVERSION: '/analytics/conversion',
	EXPORT: '/analytics/export',
	COMPARE: '/analytics/compare',
} as const

// Certification endpoints
export const CERTIFICATION_ENDPOINTS = {
	BASE: '/certificates',
	BY_ID: (id: string) => `/certificates/${id}`,
	VERIFY: (id: string) => `/certificates/${id}/verify`,
	DOWNLOAD: (id: string) => `/certificates/${id}/download`,
	TEMPLATES: '/certificates/templates',
	TEMPLATE_BY_ID: (id: string) => `/certificates/templates/${id}`,
	ISSUE: '/certificates/issue',
	BULK_ISSUE: '/certificates/bulk-issue',
	RECIPIENTS: (templateId: string) => `/certificates/templates/${templateId}/recipients`,
	SEARCH: '/certificates/search',
	REVOKE: (id: string) => `/certificates/${id}/revoke`,
} as const

// ============================================================
// FILE SERVICE ENDPOINTS
// Full URL: VITE_API_BASE_URL + /files
// Gateway rewrite: /files/* → /api/public/files/*
// file-service routes: /api/public/files/upload, /api/public/files/uploadMultiple
// ============================================================
export const FILE_ENDPOINTS = {
	BASE: '/files',
	UPLOAD: '/files/upload',
	UPLOAD_MULTIPLE: '/files/uploadMultiple',
} as const

// ============================================================
// LEADERBOARD ENDPOINTS
// Full URL: VITE_API_BASE_URL + /api/leaderboard
// leaderboard-service routes: / (paginated), /top, /:userId, /submit, /:userId (PUT)
// ============================================================
export const LEADERBOARD_ENDPOINTS = {
	BASE: '',
	LIST: '',
	TOP: '/top',
	USER: (userId: string) => `/${userId}`,
	SUBMIT: '/submit',
} as const

// Helper: build full URL
export const buildUrl = (base: string, path: string): string => {
	return `${base}${path}`
}

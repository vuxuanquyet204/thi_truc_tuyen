/**
 * Shared TypeScript types for the entire application.
 * All types should be exported from here to avoid duplication.
 * Import from '@/foundation/types' instead of scattered across src/types/ and src/admin/types/
 */

// ─────────────────────────────────────────────────────────────
// API / Generic types
// ─────────────────────────────────────────────────────────────
export type {
	ApiResponse,
	ApiError,
	PaginatedResponse,
	RequestStatus,
	AsyncState,
	FileUploadResponse,
	Metadata,
	UserId,
	ExamId,
	QuestionId,
	SessionId,
} from './api'

export { isApiError, isApiResponse } from './api'

export type {
	LoginRequest,
	LoginResponse,
	RegisterRequest,
	RegisterResponse,
	UserInfo,
	ExamDetailsResponse,
	ExamQuestionApi,
	TestCase,
	StartExamRequest,
	StartExamResponse,
	SaveAnswerRequest,
	SaveAnswerResponse,
	SubmitExamRequest,
	ExamAnswerApi,
	SubmitExamResponse,
	ExamResultResponse,
	AnswerReview,
	TokenBalanceResponse,
	TransactionResponse,
	RewardRequest,
	RewardResponse,
	GiftItem,
	RedeemGiftRequest,
	ShippingAddress,
	RedeemGiftResponse,
	BankInfo,
	MonitoringEvent,
	UploadScreenshotRequest,
	UploadScreenshotResponse,
} from './api'

// ─────────────────────────────────────────────────────────────
// User-facing types
// ─────────────────────────────────────────────────────────────
export type {
	UserProfile,
	PersonalInfo,
	WorkExperience,
	Education,
	Skill,
	Certification,
	Project,
	Achievement,
	SocialLink,
	UserPreferences,
	InfoCardData,
	ProfileCompletion,
} from './profile'

export type {
	Contest,
	ContestSection,
	FeaturedContest,
} from './contest'

export type {
	Challenge,
	ContestDetail,
	ChallengeDifficulty,
	ChallengeStatus,
} from './contestDetail'

export type {
	Certification,
	CertificationSection,
} from './certification'

export type {
	FAQItem,
	CertificationDetail,
} from './certificationDetail'

export type {
	LeaderboardEntry,
	AlgorithmScores,
	ContestScores,
	CountryCode,
	CountryInfo,
	LeaderboardFilters,
	PaginationInfo,
	LeaderboardData,
	TabOption,
	PaginationProps,
	TabsProps,
	LeaderboardRowProps,
	LeaderboardTableProps,
	LeaderboardFiltersProps,
	PerformanceMetrics,
	TableColumn,
	SortConfig,
	LeaderboardResponse,
	FilterOption,
	FilterSection,
	LeaderboardStats,
} from './leaderboard'

export type {
	DocumentCategory,
	DocumentCopyright,
	CopyrightStats,
	UserCopyrightProfile,
	CopyrightActivity,
	CopyrightSearchFilters,
	CopyrightSearchResult,
	UploadProgress,
	CopyrightDashboard,
	CopyrightSettings,
	CopyrightValidation,
	SimilarDocument,
	SimilarityInfo,
	CopyrightApiResponse,
	CopyrightBatchOperation,
	CopyrightExportOptions,
	CopyrightImportOptions,
	CopyrightAnalytics,
	CopyrightError,
	CopyrightErrorDetails,
	CopyrightFileType,
	CopyrightCategoryLabel,
	DocumentMetadata,
	CopyrightRegistrationResult,
	CopyrightVerificationResult,
} from './copyright'

export {
	COPYRIGHT_CONSTANTS,
	COPYRIGHT_CATEGORY_LABELS,
} from './copyright'

export type {
	UserSettings,
	AccountSettings,
	PasswordSettings,
	PasswordStrength,
	RecoveryCode,
	EmailSettings,
	EmailNotificationSettings,
	MarketingSettings,
	SecurityEmailSettings,
	LanguageSettings,
	PersonalizationSettings,
	TeamSettings,
	Team,
	TeamInvitation,
	TeamPermissions,
	SubscriptionSettings,
	SubscriptionPlan,
	BillingRecord,
	PaymentMethod,
	ShippingSettings,
	ShippingAddress as SettingsShippingAddress,
	ShippingPreferences,
	SettingsNavItem,
	SettingsSection,
	TextInputProps,
	ButtonProps,
	ConnectedAccount,
	MergeAccountSettings,
	ExportDataSettings,
	DeleteAccountSettings,
	EmailAddress,
} from './settings'

// ─────────────────────────────────────────────────────────────
// Admin types
// ─────────────────────────────────────────────────────────────
export type {
	AdminUser,
	AdminRole,
	AdminStatus,
	AdminPermission,
	AdminPreferences,
	AdminMetadata,
	SystemHealth,
	HealthStatus,
	ServiceHealth,
	DatabaseHealth,
	StorageHealth,
	NetworkHealth,
	SecurityHealth,
	PerformanceHealth,
	UptimeInfo,
	GlobalSettings,
	SettingsCategory,
	SettingsType,
	SettingsValidation,
	SettingsOption,
	AuditLog,
	AuditAction,
	AuditResult,
	AuditDetails,
	AdminForm,
	AdminFilters,
	AdminStats,
	SystemAdminDashboard,
	SystemAlert,
	SystemAlertType,
	SystemAlertSeverity,
	AdminActivity,
	SecurityEvent,
	SecurityEventType,
	PerformanceMetric,
	SystemMaintenance,
	MaintenanceType,
	MaintenanceStatus,
	AlertType,
	AlertSeverity,
} from './admin'

export type {
	KPIMetric,
	ChartData,
	ChartDataset,
	AnalyticsChart,
	ChartType,
	ChartOptions,
	TopListItem,
	TopListsWidget,
	TopListType,
	DateRange,
	AnalyticsFilters,
	AnalyticsPeriod,
	RevenueData,
	UserGrowthData,
	CourseAnalytics,
	UserAnalytics,
	OrganizationAnalytics,
	InstructorAnalytics,
	CertificateAnalytics,
	EngagementMetrics,
	ConversionMetrics,
	GeographicData,
	DeviceAnalytics,
	TrafficSource,
	AnalyticsDashboard,
	AnalyticsActivity,
	ActivityType,
	AnalyticsAlert,
	AnalyticsAlertType,
	AnalyticsInsight,
	InsightType,
	ReportConfig,
	ReportType,
	ReportFrequency,
	AnalyticsExport,
	AnalyticsComparison,
	AnalyticsSegment,
	SegmentCriteria,
	AnalyticsGoal,
	AnalyticsBenchmark,
} from './analytics'

export type {
	CertificateTemplate,
	IssuedCertificate,
	CertificateCategory,
	CertificateLevel,
	CertificateStatus,
	CertificateRequirement,
	RequirementType,
	TemplateDesign,
	CertificateMetadata,
	IssuedCertificateMetadata,
	CertificateForm,
	CertificateFilters,
	CertificateStats,
	CertificateDashboard,
	CertificateAlert,
	CertificateActivity,
	CertificateVerification,
	CertificateBulkIssue,
	BulkRecipient,
} from './certification'

export type {
	Document,
	DocumentMetadata,
	VerificationRecord,
	DisputeRecord,
	CopyrightStats,
	DocumentForm,
	CopyrightFilters,
	BlockchainInfo,
	RegistrationResult,
	VerificationResult,
	DisputeForm,
	CopyrightDashboard,
	AuthorStats,
	CategoryStats,
	BlockchainStatus,
	CopyrightSettings,
	ExportOptions,
} from './copyright'

export type {
	CourseForm,
	CourseFilters,
	CourseStats,
	CourseDashboard,
} from './course'

export type {
	DashboardStats,
	DashboardUserGrowthData,
	CourseCategoryData,
	RecentActivity,
	ActivityType as DashboardActivityType,
	ActivityStatus,
	DashboardChartData,
	DashboardChartDataset,
	TopPerformer,
	SystemHealth as DashboardSystemHealth,
	SystemAlert as DashboardSystemAlert,
	DashboardData,
	DashboardFilters,
	DashboardSettings,
} from './dashboard'

export type {
	EnumOption,
	Exam,
	ExamDifficulty,
	ExamStatus,
	ExamType,
	ExamFilters,
	Question,
	RandomExamConfig,
	ExamStatistics,
} from './exam'

export type {
	Organization,
	OrganizationType,
	OrganizationStatus,
	OrganizationSize,
	SubscriptionPlan as OrgSubscriptionPlan,
	SubscriptionStatus,
	VerificationStatus,
	OrganizationFeature,
	ContactPerson,
	SocialMedia,
	OrganizationSettings,
	NotificationSettings,
	PrivacySettings,
	LearningSettings,
	SecuritySettings,
	OrganizationForm,
	OrganizationFilters,
	OrganizationStats,
	OrganizationDashboard,
	OrganizationAlert,
	OrganizationActivity,
} from './organization'

export type {
	ProctoringSession,
	SessionStatus,
	RiskLevel,
	GazeDirection,
	ConnectionStatus,
	Violation,
	ViolationType,
	Severity,
	ProctoringEvent,
	EventType,
	ProctoringFilters,
	SessionStats,
	AlertConfig,
} from './proctoring'

export type {
	RewardRule,
	RewardType,
	RewardTrigger,
	RewardCondition,
	ConditionType,
	ConditionOperator,
	RewardTransaction,
	TransactionStatus,
	TokenInfo as RewardTokenInfo,
	RewardStats,
	UserRewardSummary,
	RewardFilters,
	RewardDashboard,
	RulePerformance,
	RewardRuleForm,
	BulkRewardRequest,
} from './reward'

export type {
	BlockchainModule,
	ModuleType,
	ModuleStatus,
	BlockchainNetwork,
	ActivityLog as SecurityActivityLog,
	LogType,
	LogSeverity,
	SecurityAlert,
	SecurityAlertType,
	SecurityAlertSeverity,
	TokenInfo,
	WalletInfo,
	SecurityDashboard,
	SecurityFilters,
} from './security'

export type {
	User,
	UserRole,
	UserStatus,
	UserFilters,
	UserTableColumn,
} from './user'
export {
	mapUserResponseToUser,
	mapUserToCreateRequest,
	mapUserToUpdateRequest,
} from './user'

// ─────────────────────────────────────────────────────────────
// Exam-related types (from utils/types.ts)
// These complement the API types in api.ts
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// Exam-related types (from utils/types.ts)
// These complement the API types in api.ts
// Note: Metadata is NOT exported here (it is in api.ts)
// ─────────────────────────────────────────────────────────────
export type {
	StatCardData,
	QuestionType,
	QuestionOption,
	ExamQuestion,
	ExamDetails,
	ExamAnswer,
	ExamSubmission,
	ExamResult,
	SessionStatus,
	ExamSession,
} from './examTypes'

// ─────────────────────────────────────────────────────────────
// Speech API declarations
// ─────────────────────────────────────────────────────────────
/// <reference types="./speech" />

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T> {
	success: boolean
	data: T
	message?: string
	error?: ApiError
	timestamp: string
}

/**
 * API Error structure
 */
export interface ApiError {
	code: string
	message: string
	details?: Record<string, unknown>
	field?: string
	statusCode?: number
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
	items: T[]
	total: number
	page: number
	pageSize: number
	totalPages: number
	hasNext: boolean
	hasPrevious: boolean
}

/**
 * API request status
 */
export type RequestStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * Generic async state for Redux slices
 */
export interface AsyncState<T> {
	data: T | null
	status: RequestStatus
	error: string | null
}

/**
 * File upload types
 */
export interface FileUploadResponse {
	fileId: string
	fileName: string
	fileSize: number
	mimeType: string
	url: string
	uploadedAt: string
}

/**
 * Common metadata
 */
export interface Metadata {
	createdAt: string
	updatedAt: string
	createdBy?: string
	updatedBy?: string
}

/**
 * ID types for type safety
 */
export type UserId = string & { readonly __brand: 'UserId' }
export type ExamId = string & { readonly __brand: 'ExamId' }
export type QuestionId = number & { readonly __brand: 'QuestionId' }
export type SessionId = string & { readonly __brand: 'SessionId' }

/**
 * Type guards
 */
export function isApiError(error: unknown): error is ApiError {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		'message' in error
	)
}

export function isApiResponse<T>(response: unknown): response is ApiResponse<T> {
	return (
		typeof response === 'object' &&
		response !== null &&
		'success' in response &&
		'data' in response &&
		'timestamp' in response
	)
}

/**
 * ============================================
 * AUTHENTICATION API TYPES
 * ============================================
 */
export interface LoginRequest {
	email: string
	password: string
	rememberMe?: boolean
}

export interface LoginResponse {
	user: UserInfo
	token: string
	refreshToken?: string
	expiresIn: number
}

export interface RegisterRequest {
	name: string
	email: string
	password: string
	confirmPassword: string
	agreeToTerms: boolean
}

export interface RegisterResponse {
	user: UserInfo
	token: string
	message: string
}

export interface UserInfo {
	id: string
	name: string
	email: string
	role: 'user' | 'admin' | 'teacher'
	avatar?: string
	walletAddress?: string
	createdAt: string
	emailVerified: boolean
}

/**
 * ============================================
 * EXAM API TYPES
 * ============================================
 */
export interface ExamDetailsResponse {
	id: string
	title: string
	description: string
	duration: number
	totalQuestions: number
	totalPoints: number
	passingScore: number
	isProctored: boolean
	instructions: string[]
	questions: ExamQuestionApi[]
	difficulty: 'easy' | 'medium' | 'hard'
	category: string
	tags: string[]
	createdAt: string
	updatedAt: string
}

export interface ExamQuestionApi {
	id: number
	type: 'multiple-choice' | 'code' | 'essay'
	question: string
	points: number
	options?: string[]
	correctAnswer?: number
	codeTemplate?: string
	testCases?: TestCase[]
	language?: 'javascript' | 'python' | 'java' | 'cpp'
	maxLength?: number
	minLength?: number
}

export interface TestCase {
	input: string
	expected: string
	description?: string
	isHidden?: boolean
}

export interface StartExamRequest {
	examId: string
	cameraConsent: boolean
}

export interface StartExamResponse {
	sessionId: string
	startTime: string
	endTime: string
	examDetails: ExamDetailsResponse
}

export interface SaveAnswerRequest {
	sessionId: string
	questionId: number
	answer: number | string
	timeSpent?: number
}

export interface SaveAnswerResponse {
	success: boolean
	savedAt: string
}

export interface SubmitExamRequest {
	sessionId: string
	answers: ExamAnswerApi[]
	timeSpent: number
	submittedAt: string
}

export interface ExamAnswerApi {
	questionId: number
	answer: number | string
	timeSpent: number
}

export interface SubmitExamResponse {
	resultId: string
	score: number
	totalQuestions: number
	correctAnswers: number
	passed: boolean
	timeSpent: number
	submittedAt: string
	certificateUrl?: string
	tokenReward?: number
}

export interface ExamResultResponse {
	id: string
	examId: string
	sessionId: string
	userId: string
	score: number
	totalQuestions: number
	correctAnswers: number
	timeSpent: number
	submittedAt: string
	passed: boolean
	answers: AnswerReview[]
	certificateUrl?: string
	tokenReward?: number
	createdAt: string
}

export interface AnswerReview {
	questionId: number
	question: string
	userAnswer: number | string
	correctAnswer?: number | string
	isCorrect: boolean
	points: number
	maxPoints: number
	feedback?: string
}

/**
 * ============================================
 * TOKEN/REWARD API TYPES
 * ============================================
 */
export interface TokenBalanceResponse {
	userId: string
	balance: number
	totalEarned: number
	totalSpent: number
	walletAddress?: string
}

export interface TransactionResponse {
	id: string
	userId: string
	type: 'earn' | 'spend' | 'reward' | 'transfer'
	amount: number
	description: string
	transactionHash?: string
	status: 'pending' | 'processing' | 'completed' | 'failed'
	metadata?: Record<string, any>
	createdAt: string
	updatedAt: string
}

export interface RewardRequest {
	userId: string
	amount: number
	reason: string
	metadata?: {
		activityType: 'lesson' | 'exam' | 'streak' | 'certification' | 'contest'
		activityId: string
		activityName: string
		bonus?: number
	}
}

export interface RewardResponse {
	transactionId: string
	amount: number
	newBalance: number
	transactionHash?: string
	message: string
}

export interface GiftItem {
	id: string
	name: string
	description: string
	imageUrl: string
	tokenPrice: number
	stockQuantity: number
	category: 'course' | 'voucher' | 'electronics' | 'physical' | 'other'
	isAvailable: boolean
	metadata?: Record<string, any>
}

export interface RedeemGiftRequest {
	giftId: string
	quantity: number
	shippingAddress?: ShippingAddress
	notes?: string
}

export interface ShippingAddress {
	fullName: string
	phone: string
	address: string
	city: string
	district: string
	ward: string
	postalCode?: string
}

export interface RedeemGiftResponse {
	redemptionId: string
	giftId: string
	quantity: number
	totalCost: number
	newBalance: number
	estimatedDelivery?: string
	trackingNumber?: string
	message: string
}


export interface BankInfo {
	code: string
	name: string
	shortName: string
	logo: string
	isActive: boolean
}

/**
 * ============================================
 * MONITORING API TYPES
 * ============================================
 */
export interface MonitoringEvent {
	sessionId: string
	eventType: 'tab_switch' | 'window_blur' | 'fullscreen_exit' | 'copy' | 'paste' | 'screenshot' | 'face_detection'
	timestamp: string
	metadata?: Record<string, any>
}

export interface UploadScreenshotRequest {
	sessionId: string
	imageData: string
	timestamp: string
	metadata?: {
		faceDetected?: boolean
		multipleFaces?: boolean
		noFace?: boolean
	}
}

export interface UploadScreenshotResponse {
	uploadId: string
	imageUrl: string
	analysisResult?: {
		faceDetected: boolean
		multipleFaces: boolean
		suspicious: boolean
		confidence: number
	}
}

// Note: This file contains exam-specific types that complement api.ts
// Do NOT duplicate Metadata from api.ts here

export type StatCardData = {
	title: string
	value: string
	subtitle?: string
	delayMs?: number
}

// Question types
export type QuestionType = 'multiple-choice' | 'code' | 'essay'

// Option type for multiple choice questions
export interface QuestionOption {
	id: string // UUID from backend
	text: string
}

// Backward compatible ExamQuestion (with optional fields)
export interface ExamQuestion {
	id: string // Changed: UUID from backend (was number)
	type: QuestionType
	question: string
	points: number
	explanation?: string // NEW: Explanation for the correct answer
	// Multiple choice
	options?: QuestionOption[] // Changed from string[] to include optionId
	correctAnswer?: number | number[] // Can be single index (single_choice) or array (multiple_choice)
	// Code
	codeTemplate?: string
	testCases?: Array<{
		input: string
		expected: string
		description?: string
	}>
	language?: 'javascript' | 'python' | 'java' | 'cpp'
	// Essay
	maxLength?: number
	minLength?: number
}

// Exam related types
export interface ExamDetails {
	id: string
	title: string
	description?: string
	duration: number // minutes
	totalQuestions: number
	totalPoints?: number
	passingScore?: number // percentage
	isProctored: boolean
	instructions: string[]
	questions: ExamQuestion[]
	difficulty?: 'easy' | 'medium' | 'hard'
	category?: string
	tags?: string[]
	createdAt?: string
	updatedAt?: string
}

// Answer types - Flexible for now
export interface ExamAnswer {
	questionId: string // Changed: UUID from backend (was number)
	answer: string // Changed: optionId (UUID) from backend (was number index)
	timeSpent: number // seconds
	savedAt?: string
}

export interface ExamSubmission {
	examId: string
	sessionId: string
	answers: ExamAnswer[]
	timeSpent: number // minutes
	submittedAt: string
	ipAddress?: string
	userAgent?: string
}

export interface ExamResult {
	id?: string
	submissionId: string
	examId: string
	sessionId: string
	userId?: string
	score: number // percentage (0-100)
	totalQuestions: number
	correctAnswers: number
	wrongAnswers?: number
	timeSpent: number // minutes
	submittedAt: string
	passed: boolean
	percentile?: number
	quizTitle?: string
	examTitle?: string
	questions?: any[]
	answers?: Array<{
		questionId: number
		userAnswer: number | string
		correctAnswer?: string | number
		isCorrect: boolean
		points: number
		maxPoints: number
	}>
	certificateUrl?: string
	createdAt?: string
	updatedAt?: string
}

export type SessionStatus = 'active' | 'completed' | 'abandoned' | 'expired'

export interface ExamSession {
	id: string
	examId: string
	userId?: string
	startTime: string
	endTime?: string
	status: SessionStatus
	answers?: Record<number, ExamAnswer>
	currentQuestionIndex?: number
	flaggedQuestions?: number[]
	visitedQuestions?: number[]
	monitoringData?: {
		screenshots: string[]
		tabSwitches: number
		suspiciousActivities: string[]
	}
	createdAt?: string
	updatedAt?: string
}

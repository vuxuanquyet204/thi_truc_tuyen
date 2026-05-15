// Types cho Exam trong hệ thống admin

// ✨ NEW: Enum option from backend
export interface EnumOption {
	code: string;          // e.g., "practice", "easy", "draft"
	label: string;         // English label
	labelVi: string;       // Vietnamese label
	description?: string;  // Optional description
	displayOrder?: number; // Display order in UI
}

export interface Exam {
	id: string
	title: string
	description?: string
	subject: string
	duration: number // phút
	totalQuestions: number
	assignedQuestionCount: number
	totalPoints: number
	difficulty: ExamDifficulty
	status: ExamStatus
	type: ExamType
	createdBy: string
	createdAt: string
	startDate?: string
	endDate?: string
	passingScore: number
	allowReview: boolean
	shuffleQuestions: boolean
	showResults: boolean
	maxAttempts: number
}

export type ExamDifficulty = 'easy' | 'medium' | 'hard'

export type ExamStatus = 'draft' | 'published' | 'archived' | 'ongoing' | 'ended'

export type ExamType = 'practice' | 'quiz' | 'midterm' | 'final' | 'assignment'

export interface ExamFilters {
	search: string
	subject: string | 'all'
	difficulty: ExamDifficulty | 'all'
	status: ExamStatus | 'all'
	type: ExamType | 'all'
}

export interface Question {
	id: string
	content: string
	type: 'multiple-choice' | 'true-false' | 'essay' | 'fill-blank'
	options?: string[]
	correctAnswer: string | string[]
	points: number
	difficulty: ExamDifficulty
	subject: string
	tags: string[]
}

export interface RandomExamConfig {
	subject: string
	difficulty: ExamDifficulty | 'mixed'
	totalQuestions: number
	duration: number
	easyCount?: number
	mediumCount?: number
	hardCount?: number
}

export interface ExamStatistics {
	totalSubmissions: number
	averageScore: number
	passRate: number
	highestScore: number
	lowestScore: number
}


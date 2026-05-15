import { useState, useMemo, useCallback, useEffect } from 'react'
import { ExamFilters, RandomExamConfig } from '@/foundation/types'
import adminExamApi from '@/features/admin/api/examApi'
import {
	type Exam as ApiExam,
	type ExamCreationRequest,
	type Question as ApiQuestion,
	type QuestionCreationRequest,
	type GenerateQuestionsRequest,
	createExam as createExamApi,
	getExamById,
	updateExam as updateExamApi,
	deleteExam as deleteExamApi,
	scheduleExam,
	generateExamQuestions as generateExamQuestionsApi,
} from '@/features/exams/api/examApi'
type FrontendExamStatus = 'draft' | 'published' | 'archived' | 'ongoing' | 'ended';

function mapBackendStatusToFrontend(backendStatus: string): FrontendExamStatus {
	switch (backendStatus) {
		case 'DRAFT':
			return 'draft';
		case 'PUBLISHED': // ✨ NEW: Backend now uses PUBLISHED instead of SCHEDULED
			return 'published';
		case 'SCHEDULED': // Keep for backward compatibility
			return 'published';
		case 'ACTIVE':
			return 'ongoing';
		case 'COMPLETED':
			return 'ended';
		case 'CANCELLED':
			return 'archived';
		default:
			return 'draft';
	}
}

function mapFrontendStatusToBackend(frontendStatus: FrontendExamStatus): string {
	switch (frontendStatus) {
		case 'draft':
			return 'DRAFT';
		case 'published':
			return 'SCHEDULED';
		case 'ongoing':
			return 'ACTIVE';
		case 'ended':
			return 'COMPLETED';
		case 'archived':
			return 'CANCELLED';
		default:
			return 'DRAFT';
	}
}

// Adapter to convert API Exam to Frontend Exam type (compatible with existing frontend)
interface FrontendExam {
	id: string;
	title: string;
	description?: string;
	subject: string;
	duration: number;
	totalQuestions: number;
	assignedQuestionCount: number;
	totalPoints: number;
	difficulty: 'easy' | 'medium' | 'hard';
	status: FrontendExamStatus;
	type: 'practice' | 'quiz' | 'midterm' | 'final' | 'assignment';
	createdBy: string;
	createdAt: string;
	startDate?: string;
	endDate?: string;
	passingScore: number;
	allowReview: boolean;
	shuffleQuestions: boolean;
	showResults: boolean;
	maxAttempts: number;
}

function adaptApiExamToFrontend(apiExam: ApiExam): FrontendExam {
	// ✨ Use first tag as subject, fallback to 'General'
	const subject = (apiExam.tags && apiExam.tags.length > 0) ? apiExam.tags[0] : 'General';
	
	const totalQuestions = apiExam.totalQuestions ?? 0;
	const totalPoints = totalQuestions > 0 ? totalQuestions * 10 : 0;

	return {
		id: apiExam.id,
		title: apiExam.title,
		description: apiExam.description,
		subject: subject,
		duration: apiExam.durationMinutes || 60,
		totalQuestions: totalQuestions, // ✨ NOW: Use from API
		assignedQuestionCount: apiExam.assignedQuestionCount ?? 0,
		totalPoints,
		difficulty: 'medium', // Default
		status: mapBackendStatusToFrontend(apiExam.status),
		type: 'quiz', // Default
		createdBy: apiExam.createdBy || 'Unknown',
		createdAt: apiExam.createdAt,
		startDate: apiExam.startAt,
		endDate: apiExam.endAt,
		passingScore: apiExam.passScore || 50,
		allowReview: true,
		shuffleQuestions: true,
		showResults: true,
		maxAttempts: apiExam.maxAttempts || 1,
	};
}

export default function useExams() {
	const [allExams, setAllExams] = useState<FrontendExam[]>([])
	const [apiSubjects, setApiSubjects] = useState<string[]>([])
	
	// ✨ NEW: Enum options from API
	const [examTypes, setExamTypes] = useState<import('@/foundation/types/exam').EnumOption[]>([])
	const [examDifficulties, setExamDifficulties] = useState<import('@/foundation/types/exam').EnumOption[]>([])
	const [examStatuses, setExamStatuses] = useState<import('@/foundation/types/exam').EnumOption[]>([])
	
	const [filters, setFilters] = useState<ExamFilters>({
		search: '',
		subject: 'all',
		difficulty: 'all',
		status: 'all',
		type: 'all'
	})
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage] = useState(10)
	const [sortKey, setSortKey] = useState<string>('createdAt')
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
	const [loading, setLoading] = useState(false)

	// ✅ FIX: Convert useCallback to plain async functions to avoid re-triggering useEffect
	const loadExams = async () => {
		setLoading(true)
		try {
			const apiExams = await adminExamApi.getAllExams()
			const frontendExams = apiExams.map(adaptApiExamToFrontend)
			setAllExams(frontendExams)
		} catch (error) {
			console.error('❌ Error loading exams:', error)
			// Fallback to empty array on error
			setAllExams([])
		} finally {
			setLoading(false)
		}
	}

	// Load subjects from API
	const loadSubjects = async () => {
		try {
			const subjects = await adminExamApi.getAllSubjects()
			setApiSubjects(subjects)
		} catch (error) {
			console.error('❌ Error loading subjects:', error)
			// Fallback to empty, component will use defaults
			setApiSubjects([])
		}
	}

	// ✨ NEW: Load enums from API
	const loadEnums = async () => {
		try {
			const [types, difficulties, statuses] = await Promise.all([
				adminExamApi.getAllExamTypes(),
				adminExamApi.getAllExamDifficulties(),
				adminExamApi.getAllExamStatuses(),
			])
			setExamTypes(types)
			setExamDifficulties(difficulties)
			setExamStatuses(statuses)
		} catch (error) {
			console.error('❌ Error loading enums:', error)
			// Fallback handled in API functions
		}
	}

	// ✅ FIX: Load exams on mount without dependencies to avoid re-trigger
	useEffect(() => {
		loadExams()
		loadSubjects()
		loadEnums() // ✨ NEW: Load enums
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// ✅ FIX: Auto-refresh every 30 seconds - stable interval
	useEffect(() => {
		const interval = setInterval(() => {
			loadExams()
			loadSubjects()
			loadEnums() // ✨ NEW: Refresh enums
		}, 30000)
		return () => clearInterval(interval)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Lọc exams theo filters
	const filteredExams = useMemo(() => {
		let result = [...allExams]

		// Lọc theo search
		if (filters.search) {
			const searchLower = filters.search.toLowerCase()
			result = result.filter(exam => 
				exam.title.toLowerCase().includes(searchLower) ||
				exam.subject.toLowerCase().includes(searchLower) ||
				(exam.description || '').toLowerCase().includes(searchLower) ||
				exam.createdBy.toLowerCase().includes(searchLower)
			)
		}

		// Lọc theo subject
		if (filters.subject !== 'all') {
			result = result.filter(exam => exam.subject === filters.subject)
		}

		// Lọc theo difficulty
		if (filters.difficulty !== 'all') {
			result = result.filter(exam => exam.difficulty === filters.difficulty)
		}

		// Lọc theo status
		if (filters.status !== 'all') {
			result = result.filter(exam => exam.status === filters.status)
		}

		// Lọc theo type
		if (filters.type !== 'all') {
			result = result.filter(exam => exam.type === filters.type)
		}

		return result
	}, [allExams, filters])

	// Sắp xếp exams
	const sortedExams = useMemo(() => {
		const result = [...filteredExams]

		result.sort((a, b) => {
			let aValue = a[sortKey as keyof FrontendExam]
			let bValue = b[sortKey as keyof FrontendExam]

			// Convert to string for comparison
			if (aValue === undefined) aValue = ''
			if (bValue === undefined) bValue = ''

			const aString = String(aValue).toLowerCase()
			const bString = String(bValue).toLowerCase()

			if (aString < bString) return sortOrder === 'asc' ? -1 : 1
			if (aString > bString) return sortOrder === 'asc' ? 1 : -1
			return 0
		})

		return result
	}, [filteredExams, sortKey, sortOrder])

	// Phân trang
	const paginatedExams = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage
		const endIndex = startIndex + itemsPerPage
		return sortedExams.slice(startIndex, endIndex)
	}, [sortedExams, currentPage, itemsPerPage])

	const totalPages = Math.ceil(sortedExams.length / itemsPerPage)

	// Cập nhật filter
	const updateFilter = useCallback((key: keyof ExamFilters, value: any) => {
		setFilters(prev => ({ ...prev, [key]: value }))
		setCurrentPage(1) // Reset về trang 1 khi filter thay đổi
	}, [])

	// Sắp xếp
	const handleSort = useCallback((key: string) => {
		if (sortKey === key) {
			// Toggle sort order nếu cùng key
			setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
		} else {
			setSortKey(key)
			setSortOrder('asc')
		}
	}, [sortKey])

	// ✅ FIX: Remove loadExams from dependency to use stable function reference
	// Xóa exam
	const deleteExam = useCallback(async (examId: string) => {
		setLoading(true)
		try {
			await deleteExamApi(examId)
			await loadExams() // Reload after delete
		} catch (error: any) {
			const message = error?.message || 'Xóa đề thi thất bại. Vui lòng kiểm tra backend.'
			alert(message)
		} finally {
			setLoading(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Cập nhật exam
	const updateExam = useCallback(async (updatedExam: FrontendExam) => {
		setLoading(true)
		try {
			await updateExamApi(updatedExam.id, {
				title: updatedExam.title,
				description: updatedExam.description,
				durationMinutes: updatedExam.duration,
				passScore: updatedExam.passingScore,
				maxAttempts: updatedExam.maxAttempts,
				totalQuestions: updatedExam.totalQuestions,
				tags: updatedExam.subject ? [updatedExam.subject] : undefined,
			})
			await loadExams() // Reload after update
		} catch (error: any) {
			console.error('Error updating exam:', error)
			const message = error?.message || 'Cập nhật đề thi thất bại. Vui lòng thử lại.'
			alert(message)
			throw error
		} finally {
			setLoading(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Thêm exam mới
	const addExam = useCallback(async (newExam: Omit<FrontendExam, 'id' | 'createdAt'>) => {
		setLoading(true)
		try {
			// Get current user ID from localStorage (set during login)
			const currentUserId = localStorage.getItem('userId') || '00000000-0000-0000-0000-000000000000'
			const orgId = localStorage.getItem('orgId') || '00000000-0000-0000-0000-000000000000'
			
			console.log('Creating exam with data:', {
				title: newExam.title,
				duration: newExam.duration,
				userId: currentUserId,
				orgId
			})
			
			const request: ExamCreationRequest = {
				orgId,
				title: newExam.title,
				description: newExam.description || '',
				startAt: newExam.startDate, // optional
				endAt: newExam.endDate, // optional
				durationMinutes: newExam.duration,
				passScore: newExam.passingScore || 50,
				maxAttempts: newExam.maxAttempts || 3,
				totalQuestions: newExam.totalQuestions || 0, // ✨ NEW: Send to backend
				createdBy: currentUserId,
				tags: newExam.subject ? [newExam.subject] : undefined, // ✨ NEW: Send tags
			}
			
			const createdExam = await createExamApi(request)
			console.log('Exam created successfully:', createdExam)
			
			await loadExams() // Reload after creation
		} catch (error: any) {
			console.error('Error adding exam:', error)
			const errorMessage = error.response?.data?.message || error.message || 'Failed to create exam'
			alert(`Lỗi khi tạo đề thi: ${errorMessage}`)
			throw error
		} finally {
			setLoading(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Xuất bản exam (DRAFT -> PUBLISHED)
	const publishExam = useCallback(async (examId: string) => {
		const exam = allExams.find(e => e.id === examId)
		if (!exam) {
			alert('Không tìm thấy đề thi để xuất bản.')
			return
		}
		const totalQuestions = exam.totalQuestions ?? 0
		const assignedQuestionCount = exam.assignedQuestionCount ?? 0
		if (totalQuestions <= 0) {
			alert('Không thể xuất bản: Vui lòng thiết lập số câu hỏi mục tiêu cho đề thi.')
			return
		}
		if (assignedQuestionCount < totalQuestions) {
			const missing = totalQuestions - assignedQuestionCount
			alert(`Không thể xuất bản: Đề thi còn thiếu ${missing} câu hỏi so với mục tiêu.`)
			return
		}
		if (!confirm(`Bạn có chắc chắn muốn xuất bản đề thi "${exam.title}"?`)) {
			return
		}

		setLoading(true)
		try {
			await adminExamApi.updateExamStatus(examId, 'PUBLISHED')
			await loadExams()
		} catch (error: any) {
			alert('Xuất bản đề thi thất bại. Vui lòng thử lại.')
		} finally {
			setLoading(false)
		}
	}, [allExams])

	// Gỡ xuất bản exam (PUBLISHED -> DRAFT)
	const unpublishExam = useCallback(async (examId: string) => {
		setLoading(true)
		try {
			await adminExamApi.updateExamStatus(examId, 'DRAFT')
			await loadExams() // Reload after unpublish
		} catch (error: any) {
			const message = error?.message || 'Gỡ xuất bản đề thi thất bại'
			alert(message)
		} finally {
			setLoading(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Sao chép exam
	const duplicateExam = useCallback(async (examId: string) => {
		const examToDuplicate = allExams.find(e => e.id === examId)
		if (examToDuplicate) {
			// Create new exam with modified title
			await addExam({
				...examToDuplicate,
				title: `${examToDuplicate.title} (Bản sao)`,
				status: 'draft',
				assignedQuestionCount: 0,
			})
		}
	}, [allExams, addExam])

	// Sinh đề thi ngẫu nhiên
	const generateRandomExam = useCallback(async (config: RandomExamConfig) => {
		setLoading(true)
		try {
			const { subject, difficulty, totalQuestions, duration } = config

			// Convert difficulty to backend range
			let minDifficulty: number | undefined;
			let maxDifficulty: number | undefined;
			
			if (difficulty === 'easy') {
				minDifficulty = 1;
				maxDifficulty = 3;
			} else if (difficulty === 'medium') {
				minDifficulty = 4;
				maxDifficulty = 7;
			} else if (difficulty === 'hard') {
				minDifficulty = 8;
				maxDifficulty = 10;
			}

			// Create exam first
			const currentUserId = localStorage.getItem('userId') || '00000000-0000-0000-0000-000000000000'
			const orgId = localStorage.getItem('orgId') || '00000000-0000-0000-0000-000000000000'

			const examRequest: ExamCreationRequest = {
				orgId,
				title: `Đề thi ${subject} - ${new Date().toLocaleDateString('vi-VN')}`,
				description: `Đề thi được sinh tự động với ${totalQuestions} câu hỏi`,
				durationMinutes: duration,
				passScore: 50,
				maxAttempts: 3,
				createdBy: currentUserId,
				tags: [subject], // ✨ NEW: Set tags for random exam
			}

			const newExam = await createExamApi(examRequest)

			// Generate questions for the exam
			const generateRequest: GenerateQuestionsRequest = {
				count: totalQuestions,
				tags: [subject],
				minDifficulty,
				maxDifficulty,
			}

			await generateExamQuestionsApi(newExam.id, generateRequest)

			// Reload exams
			await loadExams()

			return adaptApiExamToFrontend(newExam)
		} catch (error) {
			console.error('Error generating random exam:', error)
			throw error
		} finally {
			setLoading(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Exams chỉ hiện những exam có subject nằm trong question bank (tags)
	const validSubjectExams = useMemo(() => {
		if (apiSubjects.length > 0) {
			return allExams.filter(e => apiSubjects.includes(e.subject))
		}
		return allExams
	}, [allExams, apiSubjects])

	// Sinh câu hỏi ngẫu nhiên cho đề thi đang có
	const generateQuestionsForExam = useCallback(async (examId: string, config: {
		difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
		useCustomDistribution: boolean
		easyCount?: number
		mediumCount?: number
		hardCount?: number
	}) => {
		setLoading(true)
		try {
			const validExam = allExams.find(e => e.id === examId)
			if (!validExam) {
				throw new Error('Exam không tìm thấy. Vui lòng thử lại.')
			}

			const { difficulty } = config

			// Convert difficulty to backend range
			let minDifficulty: number | undefined;
			let maxDifficulty: number | undefined;

			if (difficulty === 'easy') {
				minDifficulty = 1;
				maxDifficulty = 3;
			} else if (difficulty === 'medium') {
				minDifficulty = 4;
				maxDifficulty = 7;
			} else if (difficulty === 'hard') {
				minDifficulty = 8;
				maxDifficulty = 10;
			}

			const generateRequest: GenerateQuestionsRequest = {
				count: validExam.totalQuestions,
				tags: [validExam.subject],
				minDifficulty,
				maxDifficulty,
			}

			await generateExamQuestionsApi(examId, generateRequest)
			await loadExams()

			return validExam
		} catch (error: any) {
			console.error('Error generating questions for exam:', error)
			const message = error?.response?.data?.error?.validation || error?.message || 'Unknown error'
			throw new Error(message)
		} finally {
			setLoading(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allExams, apiSubjects])

	// Lấy danh sách subjects unique - ưu tiên từ API (tags có trong question bank)
	const subjects = useMemo(() => {
		if (apiSubjects.length > 0) {
			return apiSubjects
		}
		// Fallback: extract từ exams đã có
		const uniqueSubjects = Array.from(new Set(allExams.map(e => e.subject)))
		return uniqueSubjects.sort()
	}, [apiSubjects, allExams])

	return {
		exams: paginatedExams,
		allExams: sortedExams,
		filters,
		updateFilter,
		publishExam, // ✨ NEW
		unpublishExam, // ✨ NEW
		currentPage,
		setCurrentPage,
		totalPages,
		totalItems: sortedExams.length,
		itemsPerPage,
		sortKey,
		sortOrder,
		handleSort,
		deleteExam,
		updateExam,
		addExam,
		duplicateExam,
		generateRandomExam,
		generateQuestionsForExam, // ✨ NEW: Generate questions for existing exam
		subjects,
		loading,
		loadExams,
		// ✨ NEW: Enum options
		examTypes,
		examDifficulties,
		examStatuses,
	}
}

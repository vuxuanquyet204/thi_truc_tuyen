import React, { useState } from 'react'
import { Plus, Download, Shuffle, FileSpreadsheet } from 'lucide-react'
import { useExams } from '@/features/admin/hooks'
import { SearchBar } from '@/features/admin/ui/common'
import Pagination from '@/shared/ui/molecules/Pagination'
import { ExamTable } from '@/features/admin/ui/exams'
import { RandomExamModal, GenerateQuestionsModal } from '@/features/admin/ui/exams'
import {
	AddExamModal,
	EditExamModal,
	ImportQuestionsModal,
	DeleteExamModal,
	ViewExamModal
} from '@/features/admin/ui/modals'
import { Exam, RandomExamConfig } from '@/foundation/types'
import { exportExamsToExcel } from '@/features/exams/utils'
import { importQuestionsFromExcel } from '@/features/admin/api/examApi'
import { toast } from '@/foundation/contexts/ToastContext'
import '@/features/admin/ui/common/styles/common.css'
import '@/features/admin/ui/common/styles/FormStyles.css'

export default function ExamsPage(): JSX.Element {
	const {
		exams,
		allExams,
		filters,
		updateFilter,
		currentPage,
		setCurrentPage,
		totalPages,
		totalItems,
		itemsPerPage,
		sortKey,
		sortOrder,
		handleSort,
		deleteExam,
		updateExam,
		duplicateExam,
		generateRandomExam,
		generateQuestionsForExam, 
		addExam,
		subjects,
		publishExam, 
		unpublishExam, 
		examTypes,
		examDifficulties,
		examStatuses
	} = useExams()

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const [examToDelete, setExamToDelete] = useState<Exam | null>(null)
	const [isViewModalOpen, setIsViewModalOpen] = useState(false)
	const [examToView, setExamToView] = useState<Exam | null>(null)
	const [isRandomModalOpen, setIsRandomModalOpen] = useState(false)
	const [isGenerateQuestionsModalOpen, setIsGenerateQuestionsModalOpen] = useState(false) // ✨ NEW
	const [isAddModalOpen, setIsAddModalOpen] = useState(false)
	const [isEditModalOpen, setIsEditModalOpen] = useState(false)
	const [examToEdit, setExamToEdit] = useState<Exam | null>(null)
	const [isImportQuestionsModalOpen, setIsImportQuestionsModalOpen] = useState(false)

	// Xử lý xem chi tiết
	const handleView = (exam: Exam) => {
		setExamToView(exam)
		setIsViewModalOpen(true)
	}

	// Xử lý xóa exam
	const handleDelete = (exam: Exam) => {
		setExamToDelete(exam)
		setIsDeleteModalOpen(true)
	}

	// Xác nhận xóa
	const confirmDelete = () => {
		if (examToDelete) {
			deleteExam(examToDelete.id)
			setIsDeleteModalOpen(false)
			setExamToDelete(null)
		}
	}

	// Xử lý sao chép
	const handleDuplicate = (exam: Exam) => {
		duplicateExam(exam.id)
	}

	// Xử lý xuất bản - validation đã có trong publishExam hook
	const handlePublish = (exam: Exam) => {
		publishExam(exam.id)
	}

	// Xử lý gỡ xuất bản
	const handleUnpublish = (exam: Exam) => {
		if (confirm(`Bạn có chắc chắn muốn gỡ xuất bản đề thi "${exam.title}"?`)) {
			unpublishExam(exam.id)
		}
	}

	// Xử lý chỉnh sửa
	const handleEdit = (exam: Exam) => {
		setExamToEdit(exam)
		setIsEditModalOpen(true)
	}

	// Xử lý cập nhật đề thi
	const handleUpdateExam = (examData: Partial<Exam>) => {
		if (examToEdit) {
			const updatedExam: Exam = {
				...examToEdit,
				...examData
			}
			updateExam(updatedExam)
			setIsEditModalOpen(false)
			setExamToEdit(null)
		}
	}

	// Xử lý sinh đề ngẫu nhiên (tạo đề mới)
	const handleGenerateRandom = async (config: RandomExamConfig) => {
		try {
			const newExam = await generateRandomExam(config)
			setIsRandomModalOpen(false)
			toast.success(`Đã sinh thành công đề thi: "${newExam.title}"`)
		} catch (error: any) {
			console.error('Failed to generate random exam:', error)
			toast.error(`Lỗi khi sinh đề thi: ${error.message || 'Unknown error'}`)
		}
	}

	// ✨ NEW: Xử lý sinh câu hỏi cho đề thi đang có
	const handleGenerateQuestionsForExam = async (examId: string, config: {
		difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
		useCustomDistribution: boolean
		easyCount?: number
		mediumCount?: number
		hardCount?: number
	}) => {
		try {
			const exam = await generateQuestionsForExam(examId, config)
			setIsGenerateQuestionsModalOpen(false)
			toast.success(`Đã sinh ${exam.totalQuestions} câu hỏi ngẫu nhiên cho đề thi "${exam.title}" thành công!`)
		} catch (error: any) {
			console.error('Failed to generate questions:', error)
			toast.error(`Lỗi khi sinh câu hỏi: ${error.message || 'Unknown error'}`)
		}
	}

	// Xử lý thêm đề thi mới
	const handleAddExam = async (examData: Partial<Exam>) => {
		try {
			await addExam({
				...examData,
				assignedQuestionCount: examData.assignedQuestionCount ?? 0,
			} as Omit<Exam, 'id' | 'createdAt'>)
			setIsAddModalOpen(false)
			// Success message will be shown by useExams hook
			toast.success('Đã tạo đề thi thành công!')
		} catch (error) {
			// Error already handled in useExams hook
			console.error('Failed to add exam:', error)
		}
	}

	// Xử lý export Excel
	const handleExportExcel = () => {
		const allExams = exams.map(exam => ({
			...exam,
			createdAt: exam.createdAt || new Date().toISOString()
		}))
		exportExamsToExcel(allExams)
	}

	// Handle import questions from Excel
	const handleImportQuestions = async (file: File, subject: string, tags: string) => {
		return await importQuestionsFromExcel(file, subject, tags)
	}

	// Helper functions moved to modal components

	return (
		<div style={{ padding: '24px' }}>
			{/* Header */}
			<div style={{ marginBottom: '24px' }}>
				<h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0' }}>
					Quản lý Bài thi
				</h1>
				<p style={{ color: 'var(--muted-foreground)', margin: 0 }}>
					Quản lý đề thi, câu hỏi và kết quả thi
				</p>
			</div>

			{/* Actions Bar */}
			<div style={{ 
				display: 'flex', 
				justifyContent: 'space-between', 
				alignItems: 'center',
				marginBottom: '24px',
				gap: '16px',
				flexWrap: 'wrap'
			}}>
				<SearchBar
					value={filters.search}
					onChange={(value) => updateFilter('search', value)}
					placeholder="Tìm kiếm theo tiêu đề, môn học..."
				/>

			<div style={{ display: 'flex', gap: '12px' }}>
				<button 
					className="btn btn-secondary"
					onClick={() => setIsImportQuestionsModalOpen(true)}
					title="Import câu hỏi từ file Excel vào ngân hàng câu hỏi"
				>
					<FileSpreadsheet size={18} />
					Nhập câu hỏi
				</button>
				<button 
					className="btn btn-secondary"
					onClick={() => setIsGenerateQuestionsModalOpen(true)}
				>
					<Shuffle size={18} />
					Sinh câu hỏi ngẫu nhiên
				</button>
				<button 
					className="btn btn-secondary"
					onClick={handleExportExcel}
				>
					<Download size={18} />
					Xuất Excel
				</button>
				<button 
					className="btn btn-primary"
					onClick={() => setIsAddModalOpen(true)}
				>
					<Plus size={18} />
					Thêm đề thi
				</button>
			</div>
			</div>

			{/* Filters */}
			<div className="filters-container">
				<div className="filter-group">
					<label className="filter-label">Môn học</label>
					<select
						className="filter-select"
						value={filters.subject}
						onChange={(e) => updateFilter('subject', e.target.value)}
					>
						<option value="all">Tất cả môn học</option>
						{subjects.map(subject => (
							<option key={subject} value={subject}>{subject}</option>
						))}
					</select>
				</div>

				<div className="filter-group">
					<label className="filter-label">Loại bài thi</label>
					<select
						className="filter-select"
						value={filters.type}
						onChange={(e) => updateFilter('type', e.target.value)}
					>
						<option value="all">Tất cả loại</option>
						<option value="practice">Luyện tập</option>
						<option value="quiz">Kiểm tra</option>
						<option value="midterm">Giữa kỳ</option>
						<option value="final">Cuối kỳ</option>
						<option value="assignment">Bài tập</option>
					</select>
				</div>

				<div className="filter-group">
					<label className="filter-label">Độ khó</label>
					<select
						className="filter-select"
						value={filters.difficulty}
						onChange={(e) => updateFilter('difficulty', e.target.value)}
					>
						<option value="all">Tất cả độ khó</option>
						<option value="easy">Dễ</option>
						<option value="medium">Trung bình</option>
						<option value="hard">Khó</option>
					</select>
				</div>

				<div className="filter-group">
					<label className="filter-label">Trạng thái</label>
					<select
						className="filter-select"
						value={filters.status}
						onChange={(e) => updateFilter('status', e.target.value)}
					>
						<option value="all">Tất cả trạng thái</option>
						<option value="draft">Nháp</option>
						<option value="published">Đã xuất bản</option>
						<option value="ongoing">Đang diễn ra</option>
						<option value="ended">Đã kết thúc</option>
						<option value="archived">Lưu trữ</option>
					</select>
				</div>

				<div className="filter-group">
					<label className="filter-label">Kết quả</label>
					<div style={{ 
						padding: '8px 12px',
						background: 'var(--muted)',
						borderRadius: 'var(--radius-md)',
						fontSize: '14px',
						fontWeight: 500
					}}>
						Tìm thấy {totalItems} đề thi
					</div>
				</div>
			</div>

			{/* Table */}
			<div style={{ 
				background: 'var(--card)',
				borderRadius: 'var(--radius-lg)',
				boxShadow: 'var(--shadow-sm)',
				overflow: 'hidden'
			}}>
				<ExamTable
					exams={exams}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onView={handleView}
					onDuplicate={handleDuplicate}
					onPublish={handlePublish} // ✨ NEW
					onUnpublish={handleUnpublish} // ✨ NEW
					onSort={handleSort}
					sortKey={sortKey}
					sortOrder={sortOrder}
				/>
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					totalItems={totalItems}
					itemsPerPage={itemsPerPage}
				/>
			)}

			{/* Random Exam Modal (create new exam with questions) */}
			<RandomExamModal
				isOpen={isRandomModalOpen}
				onClose={() => setIsRandomModalOpen(false)}
				onGenerate={handleGenerateRandom}
				subjects={subjects}
				difficulties={examDifficulties}
			/>

			{/* ✨ NEW: Generate Questions Modal (generate questions for existing exam) */}
			<GenerateQuestionsModal
				isOpen={isGenerateQuestionsModalOpen}
				onClose={() => setIsGenerateQuestionsModalOpen(false)}
				onGenerate={handleGenerateQuestionsForExam}
				exams={allExams}
				subjects={subjects}
				difficulties={examDifficulties}
			/>

			{/* Add Exam Modal */}
			<AddExamModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
				onAddExam={handleAddExam}
				subjects={subjects}
				types={examTypes}
				difficulties={examDifficulties}
			/>

			{/* Edit Exam Modal */}
			<EditExamModal
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false)
					setExamToEdit(null)
				}}
				onUpdateExam={handleUpdateExam}
				exam={examToEdit}
				subjects={subjects}
				types={examTypes}
				difficulties={examDifficulties}
			/>

			{/* Import Questions Modal */}
			<ImportQuestionsModal
				isOpen={isImportQuestionsModalOpen}
				onClose={() => setIsImportQuestionsModalOpen(false)}
				onImport={handleImportQuestions}
			/>

			{/* Delete Modal */}
			<DeleteExamModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				onConfirm={confirmDelete}
				exam={examToDelete}
			/>

			{/* View Details Modal */}
			<ViewExamModal
				isOpen={isViewModalOpen}
				onClose={() => setIsViewModalOpen(false)}
				exam={examToView}
			/>
		</div>
	)
}

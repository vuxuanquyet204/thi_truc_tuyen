import React, { useState, useRef } from 'react'
import { BookOpen, Plus, Grid3X3, List, RefreshCw, Download, Upload, FileText, CheckCircle2, Archive, PauseCircle } from 'lucide-react'
import useCourses from '@/features/admin/hooks/useCourses'
import { CourseGrid, CourseListTable, CourseFilterBar, CourseEditorModal } from '@/features/admin/ui/courses'
import { CourseDetailModal } from '@/features/admin/ui/modals'
import { exportCoursesToExcel, importCoursesFromExcel, generateExcelTemplate } from '@/features/courses/utils'
import pageStyles from '@/pages/admin/CoursesPage/CoursesPage.module.css'
import componentStyles from '@/pages/admin/CoursesPage/Courses.module.css'
import '@/features/admin/ui/common/styles/common.css'
import { toast } from '@/foundation/contexts/ToastContext'

export default function CoursesPage(): JSX.Element {
	const {
		dashboard,
		courses,
		filters,
		updateFilter,
		clearFilters,
		addCourse,
		deleteCourse,
		toggleCourseStatus,
		isCourseEditorOpen,
		editingCourse,
		openCourseEditor,
		closeCourseEditor,
		saveCourse,
		selectedCourse,
		setSelectedCourse,
		loading,
		setLoading
	} = useCourses()

	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleAddCourse = () => openCourseEditor()
	const handleEditCourse = (course: any) => openCourseEditor(course)

	const handleDeleteCourse = (courseId: string) => {
		if (confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
			deleteCourse(courseId)
		}
	}

	const handleToggleCourseStatus = (courseId: string) => {
		toggleCourseStatus(courseId)
	}

	const handleCourseClick = (course: any) => {
		setSelectedCourse(course)
	}

	const handleExportCourses = () => {
		try {
			const filename = `courses-${new Date().toISOString().split('T')[0]}.xlsx`
			exportCoursesToExcel(courses, filename)
		} catch (error) {
			console.error('Export error:', error)
			toast.error('Có lỗi xảy ra khi xuất file Excel')
		}
	}

	const handleImportCourses = () => {
		fileInputRef.current?.click()
	}

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		try {
			setLoading(true)
			const importedCourses = await importCoursesFromExcel(file)
			for (const courseForm of importedCourses) {
				await addCourse(courseForm)
			}
			toast.success(`Đã nhập thành công ${importedCourses.length} khóa học`)
		} catch (error) {
			console.error('Import error:', error)
			toast.error(`Lỗi nhập file: ${error instanceof Error ? error.message : 'Unknown error'}`)
		} finally {
			setLoading(false)
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		}
	}

	const handleDownloadTemplate = () => {
		generateExcelTemplate()
	}

	return (
		<>
			<div className={pageStyles.coursesPage}>
				<header className={pageStyles.coursesHeader}>
					<div className={pageStyles.coursesHeaderInfo}>
						<h1 className={pageStyles.coursesTitle}>Quản lý khóa học</h1>
						<p className={pageStyles.coursesSubtitle}>Quản lý danh sách khóa học dựa trên dữ liệu từ dịch vụ backend</p>
					</div>
					<div className={pageStyles.coursesHeaderActions}>
						<button className="btn btn-secondary" onClick={handleDownloadTemplate} title="Tải template Excel">
							<FileText size={18} />
							Template
						</button>
						<button className="btn btn-secondary" onClick={handleImportCourses}>
							<Upload size={18} />
							Nhập Excel
						</button>
						<button className="btn btn-secondary" onClick={handleExportCourses}>
							<Download size={18} />
							Xuất Excel
						</button>
						<button className="btn btn-primary" onClick={handleAddCourse}>
							<Plus size={18} />
							Thêm khóa học
						</button>
					</div>
				</header>

				<div className={pageStyles.coursesStatsGrid}>
					<div className={pageStyles.statCard}>
						<div className={pageStyles.statIcon} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
							<BookOpen size={20} />
						</div>
						<div className={pageStyles.statTitle}>Tổng khóa học</div>
						<div className={pageStyles.statValue}>{dashboard.stats.totalCourses}</div>
					</div>
					<div className={pageStyles.statCard}>
						<div className={pageStyles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' }}>
							<CheckCircle2 size={20} />
						</div>
						<div className={pageStyles.statTitle}>Đã xuất bản</div>
						<div className={pageStyles.statValue}>{dashboard.stats.publishedCourses}</div>
					</div>
					<div className={pageStyles.statCard}>
						<div className={pageStyles.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
							<PauseCircle size={20} />
						</div>
						<div className={pageStyles.statTitle}>Bản nháp</div>
						<div className={pageStyles.statValue}>{dashboard.stats.draftCourses}</div>
					</div>
					<div className={pageStyles.statCard}>
						<div className={pageStyles.statIcon} style={{ background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)' }}>
							<Archive size={20} />
						</div>
						<div className={pageStyles.statTitle}>Đã lưu trữ</div>
						<div className={pageStyles.statValue}>{dashboard.stats.archivedCourses}</div>
					</div>
				</div>

				<div className={pageStyles.coursesToolbar}>
					<div className={pageStyles.coursesToolbarLeft}>
						<div className={pageStyles.coursesViewToggle}>
							<button
								className={`btn btn-icon btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
								onClick={() => setViewMode('grid')}
								title="Xem dạng lưới"
							>
								<Grid3X3 size={16} />
							</button>
							<button
								className={`btn btn-icon btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
								onClick={() => setViewMode('list')}
								title="Xem dạng danh sách"
							>
								<List size={16} />
							</button>
						</div>
						<div className={pageStyles.coursesTotal}>{courses.length} khóa học</div>
					</div>
					<button className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>
						<RefreshCw size={16} />
						Làm mới
					</button>
				</div>

				<CourseFilterBar filters={filters} onFilterChange={updateFilter} onClearFilters={clearFilters} />

				<div className={pageStyles.coursesContent}>
					{viewMode === 'grid' ? (
						<CourseGrid
							courses={courses}
							onCourseClick={handleCourseClick}
							onEditCourse={handleEditCourse}
							onDeleteCourse={handleDeleteCourse}
							onToggleStatus={handleToggleCourseStatus}
							loading={loading}
							emptyMessage="Không có khóa học nào phù hợp với bộ lọc"
						/>
					) : (
						<CourseListTable
							courses={courses}
							onCourseClick={handleCourseClick}
							onEditCourse={handleEditCourse}
							onDeleteCourse={handleDeleteCourse}
							onToggleStatus={handleToggleCourseStatus}
							loading={loading}
							emptyMessage="Không có khóa học nào phù hợp với bộ lọc"
						/>
					)}
				</div>
			</div>

			<CourseEditorModal
				isOpen={isCourseEditorOpen}
				onClose={closeCourseEditor}
				onSave={saveCourse}
				editingCourse={editingCourse}
				title={editingCourse ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
			/>

			<CourseDetailModal isOpen={!!selectedCourse} onClose={() => setSelectedCourse(null)} course={selectedCourse} />

			<input
				ref={fileInputRef}
				type="file"
				accept=".xlsx,.xls"
				onChange={handleFileChange}
				style={{ display: 'none' }}
			/>
		</>
	)
}

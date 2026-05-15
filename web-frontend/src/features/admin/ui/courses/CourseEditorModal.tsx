import React, { useState, useEffect } from 'react'
import { type CourseForm } from '@/types/course'
import { type Course as ApiCourse, type CourseVisibility } from '@/features/courses/api'
import Modal from '@/features/admin/ui/common/Modal'
import { Save, X } from 'lucide-react'
import organizationApi from '@/features/organizations/api'

interface CourseEditorModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (course: CourseForm, thumbnailFile?: File | null) => void
    editingCourse?: ApiCourse | null
	title?: string
}

const visibilityOptions: Array<{ value: CourseVisibility; label: string }> = [
	{ value: 'draft', label: 'Bản nháp' },
	{ value: 'private', label: 'Riêng tư' },
	{ value: 'published', label: 'Đã xuất bản' },
	{ value: 'archived', label: 'Đã lưu trữ' },
	{ value: 'suspended', label: 'Tạm dừng' }
]

const emptyForm: CourseForm = {
	title: '',
	description: '',
	organizationId: '',
	thumbnailUrl: '',
	visibility: 'draft'
}

const isValidVisibility = (value: any): value is CourseVisibility =>
	['draft', 'private', 'published', 'archived', 'suspended'].includes(value)

export default function CourseEditorModal({ 
	isOpen, 
	onClose, 
	onSave, 
	editingCourse,
	title = 'Thêm khóa học mới'
}: CourseEditorModalProps): JSX.Element {
	const [form, setForm] = useState<CourseForm>(emptyForm)
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
	const [thumbnailMode, setThumbnailMode] = useState<'url' | 'file'>('url')
	const [orgOptions, setOrgOptions] = useState<Array<{ id: string; name: string }>>([])
	const [orgLoading, setOrgLoading] = useState<boolean>(false)
	const [orgError, setOrgError] = useState<string>('')

    useEffect(() => {
		if (editingCourse) {
			setForm({
				id: editingCourse.id,
				title: editingCourse.title ?? '',
				description: editingCourse.description ?? '',
				organizationId: (editingCourse as any).organizationId ?? '',
				thumbnailUrl: editingCourse.thumbnailUrl ?? '',
				visibility: isValidVisibility(editingCourse.visibility)
					? editingCourse.visibility
					: 'draft'
			})
			setThumbnailFile(null)
			setThumbnailMode('url')
		} else {
			setForm(emptyForm)
			setThumbnailFile(null)
			setThumbnailMode('url')
		}

		setErrors({})
	}, [editingCourse, isOpen])

	// Load organizations for selector
	useEffect(() => {
		if (!isOpen) return
		let mounted = true
		;(async () => {
			try {
				setOrgLoading(true)
				setOrgError('')
				const list = await organizationApi.getAll()
				if (!mounted) return
				const opts = list.map(o => ({ id: o.id, name: o.name || o.id }))
				setOrgOptions(opts)
				// If empty and not set, default to first option
				if (!form.organizationId && opts.length > 0) {
					setForm(prev => ({ ...prev, organizationId: opts[0].id }))
				}
			} catch (e: any) {
				if (!mounted) return
				setOrgError(e?.message || 'Không tải được danh sách tổ chức')
				setOrgOptions([])
			} finally {
				if (mounted) setOrgLoading(false)
			}
		})()
		return () => { mounted = false }
	}, [isOpen])

	const validateForm = (): boolean => {
		const nextErrors: Record<string, string> = {}

		if (!form.title.trim()) {
			nextErrors.title = 'Tên khóa học không được để trống'
		}

		if (!form.description.trim()) {
			nextErrors.description = 'Mô tả không được để trống'
		}

		if (!form.organizationId.trim()) {
			nextErrors.organizationId = 'Vui lòng chọn Organization'
		}

		if (!form.visibility) {
			nextErrors.visibility = 'Vui lòng chọn trạng thái hiển thị'
		}

		setErrors(nextErrors)
		return Object.keys(nextErrors).length === 0
	}

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!validateForm()) return

		onSave({
			...form,
			organizationId: form.organizationId.trim(),
		}, thumbnailFile || (thumbnailMode === 'file' ? thumbnailFile : null))
			onClose()
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={title}
			footer={
				<>
					<button type="button" className="btn btn-secondary" onClick={onClose}>
						<X size={16} />
						Hủy
					</button>
					<button type="submit" form="course-editor-form" className="btn btn-primary">
						<Save size={16} />
						{editingCourse ? 'Cập nhật' : 'Tạo mới'}
					</button>
				</>
			}
		>
			<div className="modal-content-wrapper">
				<form id="course-editor-form" onSubmit={handleSubmit}>
					<div className="modal-form-section">
						<div className="section-title">
							<h4>Thông tin khóa học</h4>
						</div>
						
						<div className="modal-form-group">
							<label className="form-label">Tên khóa học <span className="required">*</span></label>
							<input
								type="text"
								className={`form-input ${errors.title ? 'error' : ''}`}
								value={form.title}
								onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
								placeholder="Nhập tên khóa học"
							/>
							{errors.title && <span className="error-message">{errors.title}</span>}
						</div>

						<div className="modal-form-group">
							<label className="form-label">Mô tả chi tiết <span className="required">*</span></label>
							<textarea
								className={`form-textarea ${errors.description ? 'error' : ''}`}
								value={form.description}
								onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
								rows={4}
								placeholder="Nhập mô tả chi tiết về khóa học"
							/>
							{errors.description && <span className="error-message">{errors.description}</span>}
							</div>

						<div className="modal-form-group">
							<label className="form-label">Tổ chức (Organization) <span className="required">*</span></label>
							<select
								className={`form-input ${errors.organizationId ? 'error' : ''}`}
								value={form.organizationId}
								onChange={(e) => setForm(prev => ({ ...prev, organizationId: e.target.value }))}
								disabled={orgLoading}
							>
								{orgOptions.length === 0 ? (
									<option value="">{orgLoading ? 'Đang tải...' : 'Không có dữ liệu'}</option>
								) : (
									orgOptions.map(opt => (
										<option key={opt.id} value={opt.id}>
											{opt.name} — {opt.id}
										</option>
									))
								)}
							</select>
							{orgError && <span className="error-message">{orgError}</span>}
							{errors.organizationId && <span className="error-message">{errors.organizationId}</span>}
						</div>

							<div className="modal-form-group">
							<label className="form-label">Ảnh thu nhỏ (thumbnailUrl)</label>
							<div
								className="thumb-toggle"
								style={{
									display: 'grid',
									gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
									gap: 8,
									marginBottom: 8
								}}
							>
								<button
									type="button"
									className={`btn ${thumbnailMode === 'url' ? 'btn-primary' : 'btn-secondary'}`}
									style={{ width: '100%' }}
									onClick={() => setThumbnailMode('url')}
								>
									URL
								</button>
								<button
									type="button"
									className={`btn ${thumbnailMode === 'file' ? 'btn-primary' : 'btn-secondary'}`}
									style={{ width: '100%' }}
									onClick={() => setThumbnailMode('file')}
								>
									Tải file
								</button>
							</div>
							{thumbnailMode === 'url' ? (
								<input
									type="url"
									className="form-input"
									value={form.thumbnailUrl}
									onChange={(e) => setForm(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
									placeholder="https://example.com/thumbnail.jpg"
								/>
							) : (
								<input
									type="file"
									accept="image/*"
									className="form-input"
									onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
								/>
							)}
						</div>
						
						<div className="modal-form-group">
							<label className="form-label">Trạng thái hiển thị <span className="required">*</span></label>
							<select
								className={`form-input ${errors.visibility ? 'error' : ''}`}
								value={form.visibility}
								onChange={(e) => {
									const value = e.target.value
									setForm(prev => ({
										...prev,
										visibility: isValidVisibility(value) ? value : 'draft'
									}))
								}}
							>
								{visibilityOptions.map(option => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
							{errors.visibility && <span className="error-message">{errors.visibility}</span>}
						</div>

						{editingCourse?.slug && (
							<div className="modal-form-group">
								<label className="form-label">Slug (tự sinh)</label>
								<input type="text" className="form-input" value={editingCourse.slug} readOnly />
							</div>
						)}
					</div>
				</form>
			</div>
		</Modal>
	)
}

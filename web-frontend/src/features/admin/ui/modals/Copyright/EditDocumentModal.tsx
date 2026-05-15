// Edit Document Modal

import React, { useState, useEffect } from 'react'
import { 
	X, 
	FileText, 
	Upload, 
	Hash, 
	Calendar, 
	User, 
	Tag, 
	Link, 
	Save, 
	AlertCircle,
	CheckCircle,
	Loader2
} from 'lucide-react'
import { AdminDocument, DocumentForm } from '@/features/admin/hooks'

interface EditDocumentModalProps {
	isOpen: boolean
	onClose: () => void
	document: AdminDocument | null
	onSave: (documentId: string, form: DocumentForm) => Promise<{ success: boolean; error?: string }>
	loading?: boolean
}

export const EditDocumentModal: React.FC<EditDocumentModalProps> = ({
	isOpen,
	onClose,
	document,
	onSave,
	loading = false
}) => {
	const [form, setForm] = useState<DocumentForm>({
		title: '',
		description: '',
		author: '',
		category: 'academic',
		keywords: [],
		references: [],
		file: undefined,
		language: 'en',
		version: '1.0',
		license: 'copyright',
		metadata: {}
	})
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Pre-fill form when document changes
	useEffect(() => {
		if (document) {
			setForm({
				title: document.title,
				description: document.description,
				author: document.author,
				category: document.category,
				keywords: (document.metadata as Record<string, unknown>)?.keywords || [],
				references: (document.metadata as Record<string, unknown>)?.references || [],
				file: undefined,
				language: (document.metadata as Record<string, unknown>)?.language || 'en',
				version: (document.metadata as Record<string, unknown>)?.version || '1.0',
				license: (document.metadata as Record<string, unknown>)?.license || 'copyright',
				metadata: document.metadata || {}
			})
			setErrors({})
		}
	}, [document])

	const handleInputChange = (field: keyof DocumentForm, value: any) => {
		setForm(prev => ({ ...prev, [field]: value }))
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }))
		}
	}

	const handleKeywordsChange = (value: string) => {
		const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0)
		handleInputChange('keywords', keywords)
	}

	const handleReferencesChange = (value: string) => {
		const references = value.split('\n').map(r => r.trim()).filter(r => r.length > 0)
		handleInputChange('references', references)
	}

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] || null
		handleInputChange('file', file)
	}

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {}

		if (!form.title.trim()) {
			newErrors.title = 'Tiêu đề là bắt buộc'
		}
		if (!form.description.trim()) {
			newErrors.description = 'Mô tả là bắt buộc'
		}
		if (!form.author.trim()) {
			newErrors.author = 'Tác giả là bắt buộc'
		}
		if (!form.category.trim()) {
			newErrors.category = 'Danh mục là bắt buộc'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		
		if (!validateForm() || !document) return

		setIsSubmitting(true)
		try {
			const result = await onSave(document.id, form)
			if (result.success) {
				onClose()
			} else {
				setErrors({ submit: result.error || 'Cập nhật thất bại' })
			}
		} catch (error) {
			setErrors({ submit: 'Có lỗi xảy ra khi cập nhật' })
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleClose = () => {
		if (!isSubmitting) {
			onClose()
		}
	}

	if (!isOpen || !document) return null

	return (
		<div className="modal-overlay-modern">
			<div className="modal-container-modern edit-document-modal">
				<div className="modal-header-modern">
					<div className="modal-title-modern">
						<FileText size={36} />
						<h2>Chỉnh sửa tài liệu</h2>
					</div>
					<button 
						className="modal-close" 
						onClick={handleClose}
						disabled={isSubmitting}
					>
						<X size={20} />
					</button>
				</div>

				<div className="modal-content-modern">
					<div className="modal-content-wrapper">
					<form onSubmit={handleSubmit}>
						<div className="modal-form-section">
							<div className="section-title">
								<FileText />
								<h4>Thông tin cơ bản</h4>
							</div>
							
							<div className="modal-form-group">
								<label htmlFor="title">
									<Tag />
									Tiêu đề tài liệu <span className="required">*</span>
								</label>
								<input
									id="title"
									type="text"
									value={form.title}
									onChange={(e) => handleInputChange('title', e.target.value)}
									placeholder="Nhập tiêu đề tài liệu"
									className={errors.title ? 'error' : ''}
									disabled={isSubmitting}
								/>
								{errors.title && <span className="error-message">{errors.title}</span>}
							</div>

							<div className="modal-form-group">
								<label htmlFor="description">
									<FileText />
									Mô tả tài liệu <span className="required">*</span>
								</label>
								<textarea
									id="description"
									value={form.description}
									onChange={(e) => handleInputChange('description', e.target.value)}
									placeholder="Nhập mô tả chi tiết về tài liệu"
									rows={4}
									className={errors.description ? 'error' : ''}
									disabled={isSubmitting}
								/>
								{errors.description && <span className="error-message">{errors.description}</span>}
							</div>

							<div className="modal-form-row">
								<div className="modal-form-group">
									<label htmlFor="author">
										<User />
										Tác giả *
									</label>
									<input
										id="author"
										type="text"
										value={form.author}
										onChange={(e) => handleInputChange('author', e.target.value)}
										placeholder="Tên tác giả"
										className={errors.author ? 'error' : ''}
										disabled={isSubmitting}
									/>
									{errors.author && <span className="error-message">{errors.author}</span>}
								</div>

								<div className="modal-form-group">
									<label htmlFor="category">
										<Hash />
										Danh mục *
									</label>
									<select
										id="category"
										value={form.category}
										onChange={(e) => handleInputChange('category', e.target.value)}
										className={errors.category ? 'error' : ''}
										disabled={isSubmitting}
									>
										<option value="">Chọn danh mục</option>
										<option value="academic">Học thuật</option>
										<option value="research">Nghiên cứu</option>
										<option value="textbook">Sách giáo khoa</option>
										<option value="thesis">Luận văn</option>
										<option value="article">Bài báo</option>
										<option value="presentation">Thuyết trình</option>
									</select>
									{errors.category && <span className="error-message">{errors.category}</span>}
								</div>
							</div>
						</div>

						<div className="modal-form-section">
							<div className="section-title">
								<Tag />
								<h4>Từ khóa và tham chiếu</h4>
							</div>
							
							<div className="modal-form-group">
								<label htmlFor="keywords">
									<Tag />
									Từ khóa
								</label>
								<input
									id="keywords"
									type="text"
									value={form.keywords.join(', ')}
									onChange={(e) => handleKeywordsChange(e.target.value)}
									placeholder="Nhập từ khóa, phân cách bằng dấu phẩy"
									disabled={isSubmitting}
								/>
								<small>Phân cách các từ khóa bằng dấu phẩy (,)</small>
							</div>

							<div className="modal-form-group">
								<label htmlFor="references">
									<Link />
									Tham chiếu
								</label>
								<textarea
									id="references"
									value={form.references?.join('\n') || ''}
									onChange={(e) => handleReferencesChange(e.target.value)}
									placeholder="Nhập các tham chiếu, mỗi tham chiếu một dòng"
									rows={3}
									disabled={isSubmitting}
								/>
								<small>Mỗi tham chiếu trên một dòng riêng</small>
							</div>
						</div>

						<div className="modal-form-section">
							<div className="section-title">
								<Upload />
								<h4>Cập nhật tệp tin</h4>
							</div>
							
							<div className="modal-form-group">
								<label htmlFor="file">
									<Upload />
									Tệp tin mới (tùy chọn)
								</label>
								<input
									id="file"
									type="file"
									onChange={handleFileChange}
									accept=".pdf,.doc,.docx,.txt,.rtf"
									disabled={isSubmitting}
								/>
								<small>Để trống nếu không muốn thay đổi tệp tin hiện tại</small>
							</div>
						</div>

						{errors.submit && (
							<div className="error-banner">
								<AlertCircle />
								<span>{errors.submit}</span>
							</div>
						)}

						<div className="modal-actions">
							<button
								type="button"
								className="btn btn-secondary"
								onClick={handleClose}
								disabled={isSubmitting}
							>
								Hủy
							</button>
							<button
								type="submit"
								className="btn btn-primary"
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>
										<Loader2 className="animate-spin" />
										Đang cập nhật...
									</>
								) : (
									<>
										<Save />
										Cập nhật tài liệu
									</>
								)}
							</button>
						</div>
					</form>
					</div>
				</div>
			</div>
		</div>
	)
}

import React, { useState, useEffect } from 'react'
import { 
	CertificateTemplate, 
	CertificateForm, 
	CertificateCategory, 
	CertificateLevel,
	RequirementType,
	CertificateRequirement 
} from '@/types/certification'
import { 
	X, 
	Plus, 
	Trash2, 
	Save, 
	Upload,
	Eye,
	Palette,
	Settings,
	FileText,
	Award,
	Clock,
	CheckCircle,
	AlertTriangle,
	Tag
} from 'lucide-react'
import Modal from '@/features/admin/ui/common/Modal'
import { toast } from '@/foundation/contexts/ToastContext'

interface CertificateFormModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (form: CertificateForm) => void
	editingTemplate?: CertificateTemplate | null
}

export default function CertificateFormModal({
	isOpen,
	onClose,
	onSave,
	editingTemplate
}: CertificateFormModalProps): JSX.Element {
	const [form, setForm] = useState<CertificateForm>({
		name: '',
		description: '',
		category: 'course_completion',
		level: 'beginner',
		validityPeriod: 12,
		issuer: 'EduPlatform',
		issuerLogo: '',
		requirements: [],
		templateDesign: {
			layout: 'modern',
			colors: {
				primary: '#3b82f6',
				secondary: '#1e40af',
				accent: '#f59e0b',
				text: '#1f2937',
				background: '#ffffff'
			},
			fonts: {
				title: 'Inter',
				subtitle: 'Inter',
				body: 'Inter',
				details: 'Inter'
			},
			elements: {
				logo: true,
				signature: true,
				seal: true,
				border: true,
				watermark: true,
				qrCode: true
			},
			dimensions: {
				width: 800,
				height: 600,
				unit: 'px'
			}
		},
		metadata: {
			tags: [],
			keywords: [],
			industry: [],
			prerequisites: [],
			benefits: [],
			recognition: [],
			compliance: []
		},
		isActive: true
	})

	const [activeTab, setActiveTab] = useState<'basic' | 'requirements' | 'design' | 'metadata'>('basic')
	const [newRequirement, setNewRequirement] = useState<Partial<CertificateRequirement>>({
		type: 'course_completion',
		description: '',
		value: 0,
		unit: '%',
		isMandatory: true
	})

	const [newTag, setNewTag] = useState('')
	const [newKeyword, setNewKeyword] = useState('')
	const [newIndustry, setNewIndustry] = useState('')
	const [newPrerequisite, setNewPrerequisite] = useState('')
	const [newBenefit, setNewBenefit] = useState('')
	const [newRecognition, setNewRecognition] = useState('')
	const [newCompliance, setNewCompliance] = useState('')

	useEffect(() => {
		if (editingTemplate) {
			setForm({
				name: editingTemplate.name,
				description: editingTemplate.description,
				category: editingTemplate.category,
				level: editingTemplate.level,
				validityPeriod: editingTemplate.validityPeriod,
				issuer: editingTemplate.issuer,
				issuerLogo: editingTemplate.issuerLogo,
				requirements: editingTemplate.requirements,
				templateDesign: editingTemplate.templateDesign,
				metadata: editingTemplate.metadata,
				isActive: editingTemplate.isActive
			})
		} else {
			setForm({
				name: '',
				description: '',
				category: 'course_completion',
				level: 'beginner',
				validityPeriod: 12,
				issuer: 'EduPlatform',
				issuerLogo: '',
				requirements: [],
				templateDesign: {
					layout: 'modern',
					colors: {
						primary: '#3b82f6',
						secondary: '#1e40af',
						accent: '#f59e0b',
						text: '#1f2937',
						background: '#ffffff'
					},
					fonts: {
						title: 'Inter',
						subtitle: 'Inter',
						body: 'Inter',
						details: 'Inter'
					},
					elements: {
						logo: true,
						signature: true,
						seal: true,
						border: true,
						watermark: true,
						qrCode: true
					},
					dimensions: {
						width: 800,
						height: 600,
						unit: 'px'
					}
				},
				metadata: {
					tags: [],
					keywords: [],
					industry: [],
					prerequisites: [],
					benefits: [],
					recognition: [],
					compliance: []
				},
				isActive: true
			})
		}
	}, [editingTemplate, isOpen])

	const handleSave = () => {
		if (!form.name.trim()) {
			toast.error('Vui lòng nhập tên chứng chỉ')
			return
		}
		if (!form.description.trim()) {
			toast.error('Vui lòng nhập mô tả chứng chỉ')
			return
		}
		if (form.requirements.length === 0) {
			toast.error('Vui lòng thêm ít nhất một yêu cầu')
			return
		}

		onSave(form)
		onClose()
	}

	const addRequirement = () => {
		if (!newRequirement.description?.trim()) {
			toast.error('Vui lòng nhập mô tả yêu cầu')
			return
		}

		const requirement: CertificateRequirement = {
			id: `req-${Date.now()}`,
			type: newRequirement.type as RequirementType,
			description: newRequirement.description,
			value: newRequirement.value || 0,
			unit: newRequirement.unit || '%',
			isMandatory: newRequirement.isMandatory || true
		}

		setForm(prev => ({
			...prev,
			requirements: [...prev.requirements, requirement]
		}))

		setNewRequirement({
			type: 'course_completion',
			description: '',
			value: 0,
			unit: '%',
			isMandatory: true
		})
	}

	const removeRequirement = (requirementId: string) => {
		setForm(prev => ({
			...prev,
			requirements: prev.requirements.filter(req => req.id !== requirementId)
		}))
	}

	const addToArray = (field: keyof typeof form.metadata, value: string) => {
		if (!value.trim()) return

		setForm(prev => ({
			...prev,
			metadata: {
				...prev.metadata,
				[field]: [...prev.metadata[field], value.trim()]
			}
		}))

		// Clear input
		switch (field) {
			case 'tags':
				setNewTag('')
				break
			case 'keywords':
				setNewKeyword('')
				break
			case 'industry':
				setNewIndustry('')
				break
			case 'prerequisites':
				setNewPrerequisite('')
				break
			case 'benefits':
				setNewBenefit('')
				break
			case 'recognition':
				setNewRecognition('')
				break
			case 'compliance':
				setNewCompliance('')
				break
		}
	}

	const removeFromArray = (field: keyof typeof form.metadata, index: number) => {
		setForm(prev => ({
			...prev,
			metadata: {
				...prev.metadata,
				[field]: prev.metadata[field].filter((_, i) => i !== index)
			}
		}))
	}

	const getCategoryLabel = (category: CertificateCategory) => {
		const labels: Record<string, string> = {
			course_completion: 'Hoàn thành khóa học',
			skill_assessment: 'Đánh giá kỹ năng',
			professional_development: 'Phát triển chuyên môn',
			academic_achievement: 'Thành tích học thuật',
			industry_certification: 'Chứng chỉ ngành',
			soft_skills: 'Kỹ năng mềm',
			technical_skills: 'Kỹ năng kỹ thuật',
			leadership: 'Lãnh đạo',
			project_management: 'Quản lý dự án',
			other: 'Khác',
			role: 'Vai trò',
			skill: 'Kỹ năng'
		}
		return labels[category] || category
	}

	const getLevelLabel = (level: CertificateLevel) => {
		const labels: Record<string, string> = {
			beginner: 'Cơ bản',
			intermediate: 'Trung cấp',
			advanced: 'Nâng cao',
			expert: 'Chuyên gia',
			master: 'Thạc sĩ',
			'Cơ bản': 'Cơ bản',
			'Trung cấp': 'Trung cấp',
			'Nâng cao': 'Nâng cao',
			Basic: 'Cơ bản',
			Intermediate: 'Trung cấp',
			Advanced: 'Nâng cao'
		}
		return labels[level] || level
	}

	const getRequirementTypeLabel = (type: RequirementType) => {
		const labels: Record<RequirementType, string> = {
			course_completion: 'Hoàn thành khóa học',
			exam_score: 'Điểm thi',
			attendance_rate: 'Tỷ lệ tham gia',
			assignment_submission: 'Nộp bài tập',
			project_completion: 'Hoàn thành dự án',
			time_spent: 'Thời gian học',
			quiz_score: 'Điểm quiz',
			peer_review: 'Đánh giá đồng nghiệp',
			instructor_approval: 'Phê duyệt giảng viên',
			custom: 'Tùy chỉnh'
		}
		return labels[type] || type
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={editingTemplate ? 'Chỉnh sửa mẫu chứng chỉ' : 'Thêm mẫu chứng chỉ mới'}
			maxWidth="1000px"
			footer={
				<>
					<button
						className="btn btn-secondary"
						onClick={onClose}
					>
						<X size={16} />
						Hủy
					</button>
					<button
						className="btn btn-primary"
						onClick={handleSave}
					>
						<Save size={16} />
						{editingTemplate ? 'Cập nhật' : 'Tạo mới'}
					</button>
				</>
			}
		>
			<div className="modal-content-wrapper">
				{/* Tab Navigation */}
				<div className="modal-tabs">
					<button
						className={`modal-tab ${activeTab === 'basic' ? 'active' : ''}`}
						onClick={() => setActiveTab('basic')}
					>
						<FileText size={16} />
						Thông tin cơ bản
					</button>
					<button
						className={`modal-tab ${activeTab === 'requirements' ? 'active' : ''}`}
						onClick={() => setActiveTab('requirements')}
					>
						<CheckCircle size={16} />
						Yêu cầu ({form.requirements.length})
					</button>
					<button
						className={`modal-tab ${activeTab === 'design' ? 'active' : ''}`}
						onClick={() => setActiveTab('design')}
					>
						<Palette size={16} />
						Thiết kế
					</button>
					<button
						className={`modal-tab ${activeTab === 'metadata' ? 'active' : ''}`}
						onClick={() => setActiveTab('metadata')}
					>
						<Settings size={16} />
						Metadata
					</button>
				</div>

				{/* Tab Content */}
				<div className="modal-tab-content">
					{/* Basic Information Tab */}
					{activeTab === 'basic' && (
						<div className="modal-form-section">
							<div className="section-title">
								<FileText />
								<h4>Thông tin cơ bản</h4>
							</div>
							
							<div className="modal-form-group">
								<label className="form-label">
									<Award />
									Tên chứng chỉ <span className="required">*</span>
								</label>
								<input
									type="text"
									value={form.name}
									onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
									placeholder="Nhập tên chứng chỉ"
									className="form-input"
								/>
							</div>

							<div className="modal-form-group">
								<label className="form-label">
									<FileText />
									Mô tả <span className="required">*</span>
								</label>
								<textarea
									value={form.description}
									onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
									placeholder="Mô tả chi tiết về chứng chỉ"
									className="form-textarea"
									rows={4}
								/>
							</div>

							<div className="modal-form-row">
								<div className="modal-form-group">
									<label className="form-label">
										<Award />
										Danh mục <span className="required">*</span>
									</label>
									<select
										value={form.category}
										onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value as CertificateCategory }))}
										className="form-select"
									>
										{Object.values(['course_completion', 'skill_assessment', 'professional_development', 'academic_achievement', 'industry_certification', 'soft_skills', 'technical_skills', 'leadership', 'project_management', 'other'] as CertificateCategory[]).map(category => (
											<option key={category} value={category}>
												{getCategoryLabel(category)}
											</option>
										))}
									</select>
								</div>

								<div className="modal-form-group">
									<label className="form-label">
										<Award />
										Cấp độ <span className="required">*</span>
									</label>
									<select
										value={form.level}
										onChange={(e) => setForm(prev => ({ ...prev, level: e.target.value as CertificateLevel }))}
										className="form-select"
									>
										{Object.values(['beginner', 'intermediate', 'advanced', 'expert', 'master'] as CertificateLevel[]).map(level => (
											<option key={level} value={level}>
												{getLevelLabel(level)}
											</option>
										))}
									</select>
								</div>
							</div>

							<div className="modal-form-row">
								<div className="modal-form-group">
									<label className="form-label">
										<Clock />
										Thời hạn (tháng) <span className="required">*</span>
									</label>
									<input
										type="number"
										value={form.validityPeriod}
										onChange={(e) => setForm(prev => ({ ...prev, validityPeriod: parseInt(e.target.value) || 12 }))}
										min="1"
										max="120"
										className="form-input"
									/>
								</div>

								<div className="modal-form-group">
									<label className="form-label">
										<Award />
										Người cấp <span className="required">*</span>
									</label>
									<input
										type="text"
										value={form.issuer}
										onChange={(e) => setForm(prev => ({ ...prev, issuer: e.target.value }))}
										placeholder="Tên tổ chức cấp chứng chỉ"
										className="form-input"
									/>
								</div>
							</div>

							<div className="modal-form-group">
								<label className="form-label">
									<Upload />
									Logo người cấp
								</label>
								<input
									type="url"
									value={form.issuerLogo}
									onChange={(e) => setForm(prev => ({ ...prev, issuerLogo: e.target.value }))}
									placeholder="URL logo"
									className="form-input"
								/>
							</div>

							<div className="modal-form-group">
								<label className="modal-checkbox-group">
									<input
										type="checkbox"
										checked={form.isActive}
										onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
									/>
									<span>Kích hoạt chứng chỉ</span>
								</label>
							</div>
						</div>
					)}

					{/* Requirements Tab */}
					{activeTab === 'requirements' && (
						<div className="modal-form-section">
							<div className="section-title">
								<CheckCircle />
								<h4>Danh sách yêu cầu</h4>
							</div>
							
							{form.requirements.length > 0 ? (
								<div className="modal-list">
									{form.requirements.map((requirement) => (
										<div key={requirement.id} className="list-item">
											<div className="item-icon">
												<CheckCircle />
											</div>
											<div className="item-content">
												<div className="item-title">
													{getRequirementTypeLabel(requirement.type)}
												</div>
												<div className="item-description">
													{requirement.description}
												</div>
											</div>
											<div className="item-meta">
												<div className="item-time">
													{requirement.value} {requirement.unit}
												</div>
												<div className="item-status">
													{requirement.isMandatory ? 'Bắt buộc' : 'Tùy chọn'}
												</div>
											</div>
											<button
												type="button"
												className="btn btn-sm btn-outline btn-danger"
												onClick={() => removeRequirement(requirement.id)}
											>
												<Trash2 size={16} />
											</button>
										</div>
									))}
								</div>
							) : (
								<div className="modal-export-info">
									<div className="export-title">
										<AlertTriangle />
										<h4>Chưa có yêu cầu nào</h4>
									</div>
									<p style={{ margin: 0, color: '#64748b' }}>
										Hãy thêm ít nhất một yêu cầu để tạo chứng chỉ.
									</p>
								</div>
							)}
						</div>
					)}

					{/* Add Requirement Section */}
					{activeTab === 'requirements' && (
						<div className="modal-form-section">
							<div className="section-title">
								<Plus />
								<h4>Thêm yêu cầu mới</h4>
							</div>
							
							<div className="modal-form-row">
								<div className="modal-form-group">
									<label className="form-label">
										<CheckCircle />
										Loại yêu cầu
									</label>
									<select
										value={newRequirement.type}
										onChange={(e) => setNewRequirement(prev => ({ ...prev, type: e.target.value as RequirementType }))}
										className="form-select"
									>
										{Object.values(['course_completion', 'exam_score', 'attendance_rate', 'assignment_submission', 'project_completion', 'time_spent', 'quiz_score', 'peer_review', 'instructor_approval', 'custom'] as RequirementType[]).map(type => (
											<option key={type} value={type}>
												{getRequirementTypeLabel(type)}
											</option>
										))}
									</select>
								</div>

								<div className="modal-form-group">
									<label className="form-label">
										<FileText />
										Mô tả
									</label>
									<input
										type="text"
										value={newRequirement.description || ''}
										onChange={(e) => setNewRequirement(prev => ({ ...prev, description: e.target.value }))}
										placeholder="Mô tả yêu cầu"
										className="form-input"
									/>
								</div>
							</div>

							<div className="modal-form-row">
								<div className="modal-form-group">
									<label className="form-label">
										<CheckCircle />
										Giá trị
									</label>
									<input
										type="number"
										value={newRequirement.value || 0}
										onChange={(e) => setNewRequirement(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
										className="form-input"
									/>
								</div>

								<div className="modal-form-group">
									<label className="form-label">
										<CheckCircle />
										Đơn vị
									</label>
									<input
										type="text"
										value={newRequirement.unit || ''}
										onChange={(e) => setNewRequirement(prev => ({ ...prev, unit: e.target.value }))}
										placeholder="%, điểm, giờ, bài..."
										className="form-input"
									/>
								</div>

								<div className="modal-form-group">
									<label className="modal-checkbox-group">
										<input
											type="checkbox"
											checked={newRequirement.isMandatory || false}
											onChange={(e) => setNewRequirement(prev => ({ ...prev, isMandatory: e.target.checked }))}
										/>
										<span>Bắt buộc</span>
									</label>
								</div>
							</div>

							<button
								type="button"
								className="modal-action-button"
								onClick={addRequirement}
							>
								<Plus />
								Thêm yêu cầu
							</button>
						</div>
					)}

					{/* Design Tab */}
					{activeTab === 'design' && (
						<div className="modal-form-section">
							<div className="section-title">
								<Palette />
								<h4>Thiết kế mẫu chứng chỉ</h4>
							</div>
							
							<div className="modal-form-group">
								<label className="form-label">
									<Palette />
									Layout
								</label>
								<select
									value={form.templateDesign.layout}
									onChange={(e) => setForm(prev => ({
										...prev,
										templateDesign: {
											...prev.templateDesign,
											layout: e.target.value as 'classic' | 'modern' | 'minimal' | 'creative'
										}
									}))}
									className="form-select"
								>
									<option value="classic">Cổ điển</option>
									<option value="modern">Hiện đại</option>
									<option value="minimal">Tối giản</option>
									<option value="creative">Sáng tạo</option>
								</select>
							</div>

							<div className="modal-form-group">
								<label className="form-label">
									<Palette />
									Màu sắc
								</label>
								<div className="modal-info-pairs">
									<div className="modal-info-pair">
										<div className="info-label">Màu chính</div>
										<div className="info-value">
											<input
												type="color"
												value={form.templateDesign.colors.primary}
												onChange={(e) => setForm(prev => ({
													...prev,
													templateDesign: {
														...prev.templateDesign,
														colors: {
															...prev.templateDesign.colors,
															primary: e.target.value
														}
													}
												}))}
												style={{ width: '60px', height: '40px', border: 'none', borderRadius: '8px' }}
											/>
										</div>
									</div>
									<div className="modal-info-pair">
										<div className="info-label">Màu phụ</div>
										<div className="info-value">
											<input
												type="color"
												value={form.templateDesign.colors.secondary}
												onChange={(e) => setForm(prev => ({
													...prev,
													templateDesign: {
														...prev.templateDesign,
														colors: {
															...prev.templateDesign.colors,
															secondary: e.target.value
														}
													}
												}))}
												style={{ width: '60px', height: '40px', border: 'none', borderRadius: '8px' }}
											/>
										</div>
									</div>
									<div className="modal-info-pair">
										<div className="info-label">Màu nhấn</div>
										<div className="info-value">
											<input
												type="color"
												value={form.templateDesign.colors.accent}
												onChange={(e) => setForm(prev => ({
													...prev,
													templateDesign: {
														...prev.templateDesign,
														colors: {
															...prev.templateDesign.colors,
															accent: e.target.value
														}
													}
												}))}
												style={{ width: '60px', height: '40px', border: 'none', borderRadius: '8px' }}
											/>
										</div>
									</div>
								</div>
							</div>

							<div className="modal-form-group">
								<label className="form-label">
									<Settings />
									Phần tử
								</label>
								<div className="modal-info-pairs">
									{Object.entries(form.templateDesign.elements).map(([key, value]) => (
										<div key={key} className="modal-info-pair">
											<div className="info-label">
												{key === 'logo' ? 'Logo' : 
												 key === 'signature' ? 'Chữ ký' : 
												 key === 'seal' ? 'Con dấu' : 
												 key === 'border' ? 'Viền' : 
												 key === 'watermark' ? 'Watermark' : 
												 key === 'qrCode' ? 'QR Code' : key}
											</div>
											<div className="info-value">
												<label className="modal-checkbox-group">
													<input
														type="checkbox"
														checked={value}
														onChange={(e) => setForm(prev => ({
															...prev,
															templateDesign: {
																...prev.templateDesign,
																elements: {
																	...prev.templateDesign.elements,
																	[key]: e.target.checked
																}
															}
														}))}
													/>
													<span>{value ? 'Bật' : 'Tắt'}</span>
												</label>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className="modal-form-row">
								<div className="modal-form-group">
									<label className="form-label">
										<Settings />
										Chiều rộng
									</label>
									<input
										type="number"
										value={form.templateDesign.dimensions.width}
										onChange={(e) => setForm(prev => ({
											...prev,
											templateDesign: {
												...prev.templateDesign,
												dimensions: {
													...prev.templateDesign.dimensions,
													width: parseInt(e.target.value) || 800
												}
											}
										}))}
										className="form-input"
									/>
								</div>

								<div className="modal-form-group">
									<label className="form-label">
										<Settings />
										Chiều cao
									</label>
									<input
										type="number"
										value={form.templateDesign.dimensions.height}
										onChange={(e) => setForm(prev => ({
											...prev,
											templateDesign: {
												...prev.templateDesign,
												dimensions: {
													...prev.templateDesign.dimensions,
													height: parseInt(e.target.value) || 600
												}
											}
										}))}
										className="form-input"
									/>
								</div>

								<div className="modal-form-group">
									<label className="form-label">
										<Settings />
										Đơn vị
									</label>
									<select
										value={form.templateDesign.dimensions.unit}
										onChange={(e) => setForm(prev => ({
											...prev,
											templateDesign: {
												...prev.templateDesign,
												dimensions: {
													...prev.templateDesign.dimensions,
													unit: e.target.value as 'px' | 'mm' | 'in'
												}
											}
										}))}
										className="form-select"
									>
										<option value="px">Pixel</option>
										<option value="mm">Millimeter</option>
										<option value="in">Inch</option>
									</select>
								</div>
							</div>
						</div>
					)}

					{/* Metadata Tab */}
					{activeTab === 'metadata' && (
						<div className="modal-form-section">
							<div className="section-title">
								<Settings />
								<h4>Metadata</h4>
							</div>
							
							{/* Tags */}
							<div className="modal-form-group">
								<label className="form-label">
									<Tag />
									Tags
								</label>
								<div style={{ display: 'flex', gap: '8px' }}>
									<input
										type="text"
										value={newTag}
										onChange={(e) => setNewTag(e.target.value)}
										placeholder="Nhập tag và nhấn Enter"
										className="form-input"
										onKeyPress={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault()
												addToArray('tags', newTag)
											}
										}}
									/>
									<button
										type="button"
										className="modal-action-button"
										onClick={() => addToArray('tags', newTag)}
									>
										<Plus />
									</button>
								</div>
								{form.metadata.tags.length > 0 && (
									<div className="modal-tags" style={{ marginTop: '12px' }}>
										{form.metadata.tags.map((tag, index) => (
											<span key={index} className="modal-tag">
												{tag}
												<button
													type="button"
													onClick={() => removeFromArray('tags', index)}
													style={{ 
														marginLeft: '8px', 
														background: 'none', 
														border: 'none', 
														color: 'inherit',
														cursor: 'pointer'
													}}
												>
													<X size={12} />
												</button>
											</span>
										))}
									</div>
								)}
							</div>

							{/* Keywords */}
							<div className="modal-form-group">
								<label className="form-label">
									<Tag />
									Từ khóa
								</label>
								<div style={{ display: 'flex', gap: '8px' }}>
									<input
										type="text"
										value={newKeyword}
										onChange={(e) => setNewKeyword(e.target.value)}
										placeholder="Nhập từ khóa và nhấn Enter"
										className="form-input"
										onKeyPress={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault()
												addToArray('keywords', newKeyword)
											}
										}}
									/>
									<button
										type="button"
										className="modal-action-button"
										onClick={() => addToArray('keywords', newKeyword)}
									>
										<Plus />
									</button>
								</div>
								{form.metadata.keywords.length > 0 && (
									<div className="modal-tags" style={{ marginTop: '12px' }}>
										{form.metadata.keywords.map((keyword, index) => (
											<span key={index} className="modal-tag">
												{keyword}
												<button
													type="button"
													onClick={() => removeFromArray('keywords', index)}
													style={{ 
														marginLeft: '8px', 
														background: 'none', 
														border: 'none', 
														color: 'inherit',
														cursor: 'pointer'
													}}
												>
													<X size={12} />
												</button>
											</span>
										))}
									</div>
								)}
							</div>

							{/* Industry */}
							<div className="modal-form-group">
								<label className="form-label">
									<Tag />
									Ngành nghề
								</label>
								<div style={{ display: 'flex', gap: '8px' }}>
									<input
										type="text"
										value={newIndustry}
										onChange={(e) => setNewIndustry(e.target.value)}
										placeholder="Nhập ngành nghề và nhấn Enter"
										className="form-input"
										onKeyPress={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault()
												addToArray('industry', newIndustry)
											}
										}}
									/>
									<button
										type="button"
										className="modal-action-button"
										onClick={() => addToArray('industry', newIndustry)}
									>
										<Plus />
									</button>
								</div>
								{form.metadata.industry.length > 0 && (
									<div className="modal-tags" style={{ marginTop: '12px' }}>
										{form.metadata.industry.map((industry, index) => (
											<span key={index} className="modal-tag">
												{industry}
												<button
													type="button"
													onClick={() => removeFromArray('industry', index)}
													style={{ 
														marginLeft: '8px', 
														background: 'none', 
														border: 'none', 
														color: 'inherit',
														cursor: 'pointer'
													}}
												>
													<X size={12} />
												</button>
											</span>
										))}
									</div>
								)}
							</div>

							{/* Prerequisites */}
							<div className="modal-form-group">
								<label className="form-label">
									<Tag />
									Điều kiện tiên quyết
								</label>
								<div style={{ display: 'flex', gap: '8px' }}>
									<input
										type="text"
										value={newPrerequisite}
										onChange={(e) => setNewPrerequisite(e.target.value)}
										placeholder="Nhập điều kiện và nhấn Enter"
										className="form-input"
										onKeyPress={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault()
												addToArray('prerequisites', newPrerequisite)
											}
										}}
									/>
									<button
										type="button"
										className="modal-action-button"
										onClick={() => addToArray('prerequisites', newPrerequisite)}
									>
										<Plus />
									</button>
								</div>
								{form.metadata.prerequisites.length > 0 && (
									<div className="modal-tags" style={{ marginTop: '12px' }}>
										{form.metadata.prerequisites.map((prerequisite, index) => (
											<span key={index} className="modal-tag">
												{prerequisite}
												<button
													type="button"
													onClick={() => removeFromArray('prerequisites', index)}
													style={{ 
														marginLeft: '8px', 
														background: 'none', 
														border: 'none', 
														color: 'inherit',
														cursor: 'pointer'
													}}
												>
													<X size={12} />
												</button>
											</span>
										))}
									</div>
								)}
							</div>

							{/* Benefits */}
							<div className="modal-form-group">
								<label className="form-label">
									<Tag />
									Lợi ích
								</label>
								<div style={{ display: 'flex', gap: '8px' }}>
									<input
										type="text"
										value={newBenefit}
										onChange={(e) => setNewBenefit(e.target.value)}
										placeholder="Nhập lợi ích và nhấn Enter"
										className="form-input"
										onKeyPress={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault()
												addToArray('benefits', newBenefit)
											}
										}}
									/>
									<button
										type="button"
										className="modal-action-button"
										onClick={() => addToArray('benefits', newBenefit)}
									>
										<Plus />
									</button>
								</div>
								{form.metadata.benefits.length > 0 && (
									<div className="modal-tags" style={{ marginTop: '12px' }}>
										{form.metadata.benefits.map((benefit, index) => (
											<span key={index} className="modal-tag">
												{benefit}
												<button
													type="button"
													onClick={() => removeFromArray('benefits', index)}
													style={{ 
														marginLeft: '8px', 
														background: 'none', 
														border: 'none', 
														color: 'inherit',
														cursor: 'pointer'
													}}
												>
													<X size={12} />
												</button>
											</span>
										))}
									</div>
								)}
							</div>

							{/* Recognition */}
							<div className="modal-form-group">
								<label className="form-label">
									<Tag />
									Sự công nhận
								</label>
								<div style={{ display: 'flex', gap: '8px' }}>
									<input
										type="text"
										value={newRecognition}
										onChange={(e) => setNewRecognition(e.target.value)}
										placeholder="Nhập sự công nhận và nhấn Enter"
										className="form-input"
										onKeyPress={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault()
												addToArray('recognition', newRecognition)
											}
										}}
									/>
									<button
										type="button"
										className="modal-action-button"
										onClick={() => addToArray('recognition', newRecognition)}
									>
										<Plus />
									</button>
								</div>
								{form.metadata.recognition.length > 0 && (
									<div className="modal-tags" style={{ marginTop: '12px' }}>
										{form.metadata.recognition.map((recognition, index) => (
											<span key={index} className="modal-tag">
												{recognition}
												<button
													type="button"
													onClick={() => removeFromArray('recognition', index)}
													style={{ 
														marginLeft: '8px', 
														background: 'none', 
														border: 'none', 
														color: 'inherit',
														cursor: 'pointer'
													}}
												>
													<X size={12} />
												</button>
											</span>
										))}
									</div>
								)}
							</div>

							{/* Compliance */}
							<div className="modal-form-group">
								<label className="form-label">
									<Tag />
									Tuân thủ
								</label>
								<div style={{ display: 'flex', gap: '8px' }}>
									<input
										type="text"
										value={newCompliance}
										onChange={(e) => setNewCompliance(e.target.value)}
										placeholder="Nhập tiêu chuẩn tuân thủ và nhấn Enter"
										className="form-input"
										onKeyPress={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault()
												addToArray('compliance', newCompliance)
											}
										}}
									/>
									<button
										type="button"
										className="modal-action-button"
										onClick={() => addToArray('compliance', newCompliance)}
									>
										<Plus />
									</button>
								</div>
								{form.metadata.compliance.length > 0 && (
									<div className="modal-tags" style={{ marginTop: '12px' }}>
										{form.metadata.compliance.map((compliance, index) => (
											<span key={index} className="modal-tag">
												{compliance}
												<button
													type="button"
													onClick={() => removeFromArray('compliance', index)}
													style={{ 
														marginLeft: '8px', 
														background: 'none', 
														border: 'none', 
														color: 'inherit',
														cursor: 'pointer'
													}}
												>
													<X size={12} />
												</button>
											</span>
										))}
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</Modal>
	)
}

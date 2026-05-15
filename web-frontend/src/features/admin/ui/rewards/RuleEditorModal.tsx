import React, { useState, useEffect } from 'react'
import { RewardRule, RewardRuleForm, RewardType, RewardTrigger, ConditionType, ConditionOperator } from '@/types/reward'
import Modal from '@/features/admin/ui/common/Modal'
import { X, Plus, Trash2, Save, FileText, Settings, Target, Hash, Zap, CheckCircle } from 'lucide-react'

interface RuleEditorModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (rule: RewardRuleForm) => void
	editingRule?: RewardRule | null
	title?: string
}

export default function RuleEditorModal({ 
	isOpen, 
	onClose, 
	onSave, 
	editingRule,
	title = "Thêm luật thưởng mới"
}: RuleEditorModalProps): JSX.Element {
	
	const [form, setForm] = useState<RewardRuleForm>({
		name: '',
		description: '',
		type: 'course_completion',
		trigger: 'automatic',
		conditions: [],
		tokenAmount: 0,
		tokenSymbol: 'LEARN',
		isActive: true,
		priority: 1
	})

	const [errors, setErrors] = useState<Record<string, string>>({})

	useEffect(() => {
		if (editingRule) {
			setForm({
				name: editingRule.name,
				description: editingRule.description,
				type: editingRule.type,
				trigger: editingRule.trigger,
				conditions: editingRule.conditions.map(c => ({
					type: c.type,
					operator: c.operator,
					value: c.value,
					description: c.description
				})),
				tokenAmount: editingRule.tokenAmount,
				tokenSymbol: editingRule.tokenSymbol,
				isActive: editingRule.isActive,
				priority: editingRule.priority
			})
		} else {
			setForm({
				name: '',
				description: '',
				type: 'course_completion',
				trigger: 'automatic',
				conditions: [],
				tokenAmount: 0,
				tokenSymbol: 'LEARN',
				isActive: true,
				priority: 1
			})
		}
		setErrors({})
	}, [editingRule, isOpen])

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {}

		if (!form.name.trim()) {
			newErrors.name = 'Tên luật thưởng không được để trống'
		}

		if (!form.description.trim()) {
			newErrors.description = 'Mô tả không được để trống'
		}

		if (form.tokenAmount <= 0) {
			newErrors.tokenAmount = 'Số token phải lớn hơn 0'
		}

		if (!form.tokenSymbol.trim()) {
			newErrors.tokenSymbol = 'Ký hiệu token không được để trống'
		}

		if (form.priority < 1) {
			newErrors.priority = 'Ưu tiên phải từ 1 trở lên'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		
		if (validateForm()) {
			onSave(form)
			onClose()
		}
	}

	const addCondition = () => {
		setForm(prev => ({
			...prev,
			conditions: [
				...prev.conditions,
				{
					type: 'course_id',
					operator: 'equals',
					value: '',
					description: ''
				}
			]
		}))
	}

	const removeCondition = (index: number) => {
		setForm(prev => ({
			...prev,
			conditions: prev.conditions.filter((_, i) => i !== index)
		}))
	}

	const updateCondition = (index: number, field: keyof typeof form.conditions[0], value: any) => {
		setForm(prev => ({
			...prev,
			conditions: prev.conditions.map((condition, i) => 
				i === index ? { ...condition, [field]: value } : condition
			)
		}))
	}

	const getConditionTypeOptions = (): { value: ConditionType; label: string }[] => [
		{ value: 'course_id', label: 'ID Khóa học' },
		{ value: 'exam_score', label: 'Điểm thi' },
		{ value: 'login_days', label: 'Số ngày đăng nhập' },
		{ value: 'assignment_count', label: 'Số bài tập' },
		{ value: 'quiz_score', label: 'Điểm quiz' },
		{ value: 'streak_days', label: 'Số ngày streak' },
		{ value: 'user_level', label: 'Cấp độ người dùng' },
		{ value: 'custom_field', label: 'Trường tùy chỉnh' }
	]

	const getOperatorOptions = (): { value: ConditionOperator; label: string }[] => [
		{ value: 'equals', label: 'Bằng' },
		{ value: 'not_equals', label: 'Không bằng' },
		{ value: 'greater_than', label: 'Lớn hơn' },
		{ value: 'less_than', label: 'Nhỏ hơn' },
		{ value: 'greater_equal', label: 'Lớn hơn hoặc bằng' },
		{ value: 'less_equal', label: 'Nhỏ hơn hoặc bằng' },
		{ value: 'contains', label: 'Chứa' }
	]

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={title}
		>
			<div className="modal-content-wrapper">
				<form onSubmit={handleSubmit}>
					{/* Basic Information */}
					<div className="modal-form-section">
						<div className="section-title">
							<FileText />
							<h4>Thông tin cơ bản</h4>
						</div>
						
						<div className="modal-form-row">
							<div className="modal-form-group">
								<label className="form-label">
									<FileText />
									Tên luật thưởng <span className="required">*</span>
								</label>
								<input
									type="text"
									className={`form-input ${errors.name ? 'error' : ''}`}
									value={form.name}
									onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
									placeholder="Nhập tên luật thưởng"
								/>
								{errors.name && <span className="error-message">{errors.name}</span>}
							</div>
							
							<div className="modal-form-group">
								<label className="form-label">
									<Target />
									Loại thưởng <span className="required">*</span>
								</label>
								<select
									className="form-select"
									value={form.type}
									onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as RewardType }))}
								>
									<option value="course_completion">Hoàn thành khóa học</option>
									<option value="exam_score">Điểm thi</option>
									<option value="daily_login">Đăng nhập hàng ngày</option>
									<option value="assignment_submission">Nộp bài tập</option>
									<option value="quiz_perfect">Quiz hoàn hảo</option>
									<option value="streak_bonus">Bonus streak</option>
									<option value="referral">Giới thiệu</option>
									<option value="achievement">Thành tích</option>
									<option value="custom">Tùy chỉnh</option>
								</select>
							</div>
						</div>

						<div className="modal-form-group">
							<label className="form-label">
								<FileText />
								Mô tả <span className="required">*</span>
							</label>
							<textarea
								className={`form-textarea ${errors.description ? 'error' : ''}`}
								value={form.description}
								onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
								placeholder="Mô tả chi tiết luật thưởng"
								rows={3}
							/>
							{errors.description && <span className="error-message">{errors.description}</span>}
						</div>
					</div>

					{/* Reward Configuration */}
					<div className="modal-form-section">
						<div className="section-title">
							<Target />
							<h4>Cấu hình thưởng</h4>
						</div>
						
						<div className="modal-form-row">
							<div className="modal-form-group">
								<label className="form-label">
									<Hash />
									Số token <span className="required">*</span>
								</label>
								<input
									type="number"
									className={`form-input ${errors.tokenAmount ? 'error' : ''}`}
									value={form.tokenAmount}
									onChange={(e) => setForm(prev => ({ ...prev, tokenAmount: Number(e.target.value) }))}
									min="1"
									placeholder="0"
								/>
								{errors.tokenAmount && <span className="error-message">{errors.tokenAmount}</span>}
							</div>
							
							<div className="modal-form-group">
								<label className="form-label">
									<Hash />
									Ký hiệu token <span className="required">*</span>
								</label>
								<input
									type="text"
									className={`form-input ${errors.tokenSymbol ? 'error' : ''}`}
									value={form.tokenSymbol}
									onChange={(e) => setForm(prev => ({ ...prev, tokenSymbol: e.target.value }))}
									placeholder="LEARN"
								/>
								{errors.tokenSymbol && <span className="error-message">{errors.tokenSymbol}</span>}
							</div>
						</div>

						<div className="modal-form-row">
							<div className="modal-form-group">
								<label className="form-label">
									<Zap />
									Kích hoạt
								</label>
								<select
									className="form-select"
									value={form.trigger}
									onChange={(e) => setForm(prev => ({ ...prev, trigger: e.target.value as RewardTrigger }))}
								>
									<option value="automatic">Tự động</option>
									<option value="manual">Thủ công</option>
									<option value="scheduled">Lên lịch</option>
									<option value="conditional">Có điều kiện</option>
								</select>
							</div>
							
							<div className="modal-form-group">
								<label className="form-label">
									<Target />
									Ưu tiên <span className="required">*</span>
								</label>
								<input
									type="number"
									className={`form-input ${errors.priority ? 'error' : ''}`}
									value={form.priority}
									onChange={(e) => setForm(prev => ({ ...prev, priority: Number(e.target.value) }))}
									min="1"
									placeholder="1"
								/>
								{errors.priority && <span className="error-message">{errors.priority}</span>}
							</div>
						</div>
					</div>

					{/* Conditions */}
					<div className="modal-form-section">
						<div className="section-title">
							<Settings />
							<h4>Điều kiện</h4>
							<button
								type="button"
								className="modal-action-button"
								onClick={addCondition}
							>
								<Plus />
								Thêm điều kiện
							</button>
						</div>
						
						{form.conditions.length === 0 ? (
							<div className="modal-export-info">
								<div className="export-title">
									<Settings />
									<h4>Chưa có điều kiện</h4>
								</div>
								<p style={{ margin: 0, color: 'var(--muted-foreground)' }}>
									Nhấn "Thêm điều kiện" để bắt đầu tạo điều kiện cho luật thưởng.
								</p>
							</div>
						) : (
							<div className="modal-list">
								{form.conditions.map((condition, index) => (
									<div key={index} className="list-item">
										<div className="item-icon">
											<Settings />
										</div>
										<div className="item-content">
											<div className="item-title">Điều kiện {index + 1}</div>
											<div className="item-description">
												{getConditionTypeOptions().find(opt => opt.value === condition.type)?.label} 
												{' '}{getOperatorOptions().find(opt => opt.value === condition.operator)?.label} 
												{' '}{condition.value}
											</div>
										</div>
										<div className="item-meta">
											<button
												type="button"
												className="modal-action-button"
												onClick={() => removeCondition(index)}
												title="Xóa điều kiện"
											>
												<Trash2 />
												Xóa
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Status */}
					<div className="modal-form-section">
						<div className="section-title">
							<CheckCircle />
							<h4>Trạng thái</h4>
						</div>
						
						<div className="modal-checkbox-group">
							<div className="checkbox-item">
								<input
									type="checkbox"
									checked={form.isActive}
									onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
								/>
								<label>Kích hoạt luật thưởng</label>
							</div>
						</div>
					</div>
				</form>
			</div>
		</Modal>
	)
}

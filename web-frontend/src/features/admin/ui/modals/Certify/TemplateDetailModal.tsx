import React from 'react'
import {
	Award,
	Clock,
	CheckCircle,
	Palette,
	Tag,
	TrendingUp,
	Calendar,
	Ruler,
	FileCheck,
	AlertCircle,
	Building2,
	Layers
} from 'lucide-react'
import Modal from '@/features/admin/ui/common/Modal'
import Badge from '@/features/admin/ui/common/Badge'
import '@/features/admin/ui/common/styles/certify.css'

interface TemplateDetailModalProps {
	isOpen: boolean
	onClose: () => void
	template: any
}

const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
	isOpen,
	onClose,
	template
}) => {
	if (!template) return null

	const getCategoryLabel = (category: string) => {
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
			other: 'Khác'
		}
		return labels[category] || category
	}

	const getLevelLabel = (level: string) => {
		const labels: Record<string, string> = {
			beginner: 'Cơ bản',
			intermediate: 'Trung cấp',
			advanced: 'Nâng cao',
			expert: 'Chuyên gia',
			master: 'Thạc sĩ'
		}
		return labels[level] || level
	}

	const getStatusVariant = (status: string) => {
		const variants: Record<string, "success" | "warning" | "danger" | "secondary"> = {
			active: 'success',
			inactive: 'secondary',
			draft: 'warning'
		}
		return variants[status] || 'secondary'
	}

	const getStatusLabel = (status: string) => {
		const labels: Record<string, string> = {
			active: 'Đang hoạt động',
			inactive: 'Không hoạt động',
			draft: 'Bản nháp'
		}
		return labels[status] || status
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={template.name || 'Chi tiết mẫu chứng chỉ'}
			maxWidth="1000px"
		>
			<div className="template-detail-modal-content">
				{/* Header Section */}
				<div className="template-detail-header">
					<div className="template-detail-icon">
						<Award size={48} />
					</div>
					<div className="template-detail-info">
						<h2 className="template-detail-title">{template.name}</h2>
						<p className="template-detail-description">{template.description}</p>
						<div className="template-detail-meta">
							<div className="meta-badge">
								<Badge variant={getStatusVariant(template.status)}>
									{getStatusLabel(template.status)}
								</Badge>
							</div>
							<div className="meta-badge">
								<Building2 size={16} />
								<span>{template.issuer}</span>
							</div>
							<div className="meta-badge">
								<span>{getCategoryLabel(template.category)}</span>
							</div>
							<div className="meta-badge">
								<TrendingUp size={16} />
								<span>{getLevelLabel(template.level)}</span>
							</div>
						</div>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="template-detail-stats-grid">
					<div className="stat-card-mini">
						<div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
							<Clock size={20} />
						</div>
						<div className="stat-data">
							<div className="stat-label">Thời hạn</div>
							<div className="stat-value">{template.validityPeriod} tháng</div>
						</div>
					</div>
					<div className="stat-card-mini">
						<div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
							<FileCheck size={20} />
						</div>
						<div className="stat-data">
							<div className="stat-label">Yêu cầu</div>
							<div className="stat-value">{template.requirements?.length || 0}</div>
						</div>
					</div>
					<div className="stat-card-mini">
						<div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
							<Ruler size={20} />
						</div>
						<div className="stat-data">
							<div className="stat-label">Kích thước</div>
							<div className="stat-value">
								{template.templateDesign.dimensions.width}×{template.templateDesign.dimensions.height}
							</div>
						</div>
					</div>
					<div className="stat-card-mini">
						<div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
							<Layers size={20} />
						</div>
						<div className="stat-data">
							<div className="stat-label">Layout</div>
							<div className="stat-value">{template.templateDesign.layout}</div>
						</div>
					</div>
				</div>

				{/* Detail Sections */}
				<div className="template-detail-sections">
					{/* Requirements */}
					<div className="detail-section">
						<h3>
							<FileCheck size={20} />
							Yêu cầu ({template.requirements?.length || 0})
						</h3>
						<div className="requirements-grid">
							{template.requirements?.map((req: any) => (
								<div key={req.id} className="requirement-card">
									<div className="requirement-header">
										<div className="requirement-type">{req.type}</div>
										{req.isMandatory && (
											<Badge variant="warning">
												<AlertCircle size={12} />
												Bắt buộc
											</Badge>
										)}
									</div>
									<div className="requirement-description">{req.description}</div>
									<div className="requirement-value-row">
										<span className="requirement-value">
											{req.value} {req.unit}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Design Info */}
					<div className="detail-section">
						<h3>
							<Palette size={20} />
							Thiết kế
						</h3>
						<div className="design-grid">
							<div className="design-card">
								<div className="design-label">
									<Layers size={16} />
									Layout
								</div>
								<div className="design-value">{template.templateDesign.layout}</div>
							</div>
							<div className="design-card">
								<div className="design-label">
									<Ruler size={16} />
									Kích thước
								</div>
								<div className="design-value">
									{template.templateDesign.dimensions.width}×{template.templateDesign.dimensions.height} {template.templateDesign.dimensions.unit}
								</div>
							</div>
							<div className="design-card">
								<div className="design-label">
									<Palette size={16} />
									Màu chính
								</div>
								<div className="design-value color-value">
									<span
										className="color-preview"
										style={{ backgroundColor: template.templateDesign.colors.primary }}
									/>
									{template.templateDesign.colors.primary}
								</div>
							</div>
							{template.templateDesign.colors.secondary && (
								<div className="design-card">
									<div className="design-label">
										<Palette size={16} />
										Màu phụ
									</div>
									<div className="design-value color-value">
										<span
											className="color-preview"
											style={{ backgroundColor: template.templateDesign.colors.secondary }}
										/>
										{template.templateDesign.colors.secondary}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Tags */}
					{template.metadata?.tags && template.metadata.tags.length > 0 && (
						<div className="detail-section">
							<h3>
								<Tag size={20} />
								Tags ({template.metadata.tags.length})
							</h3>
							<div className="tags-grid">
								{template.metadata.tags.map((tag: string, index: number) => (
									<Badge key={index} variant="info">{tag}</Badge>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</Modal>
	)
}

export default TemplateDetailModal

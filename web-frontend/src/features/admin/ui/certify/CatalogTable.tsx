import React from 'react'
import { 
	CertificateTemplate, 
	CertificateCategory, 
	CertificateLevel,
	RequirementType 
} from '@/types/certification'
import { 
	Edit, 
	Trash2, 
	Eye, 
	Copy, 
	MoreHorizontal,
	Calendar,
	Clock,
	Users,
	Award,
	CheckCircle,
	XCircle
} from 'lucide-react'
import Badge from '@/features/admin/ui/common/Badge'

interface CatalogTableProps {
	templates: CertificateTemplate[]
	onEditTemplate: (template: CertificateTemplate) => void
	onDeleteTemplate: (templateId: string) => void
	onViewTemplate: (template: CertificateTemplate) => void
	onDuplicateTemplate: (template: CertificateTemplate) => void
	loading?: boolean
	emptyMessage?: string
}

export default function CatalogTable({
	templates,
	onEditTemplate,
	onDeleteTemplate,
	onViewTemplate,
	onDuplicateTemplate,
	loading = false,
	emptyMessage = 'Không có mẫu chứng chỉ nào'
}: CatalogTableProps): JSX.Element {
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

	const getLevelColor = (level: CertificateLevel) => {
		const colors: Record<string, string> = {
			beginner: 'var(--success)',
			intermediate: 'var(--info)',
			advanced: 'var(--warning)',
			expert: 'var(--primary)',
			master: 'var(--danger)',
			'Cơ bản': 'var(--success)',
			'Trung cấp': 'var(--info)',
			'Nâng cao': 'var(--warning)'
		}
		return colors[level] || 'var(--muted-foreground)'
	}

	const getCategoryColor = (category: CertificateCategory) => {
		const colors: Record<string, string> = {
			course_completion: 'var(--primary)',
			skill_assessment: 'var(--info)',
			professional_development: 'var(--success)',
			academic_achievement: 'var(--warning)',
			industry_certification: 'var(--danger)',
			soft_skills: 'var(--accent)',
			technical_skills: 'var(--secondary)',
			leadership: 'var(--primary)',
			project_management: 'var(--info)',
			other: 'var(--muted-foreground)',
			role: 'var(--primary)',
			skill: 'var(--info)'
		}
		return colors[category] || 'var(--muted-foreground)'
	}

	if (loading) {
		return (
			<div className="admin-table-loading">
				<div className="loading-spinner"></div>
				<p>Đang tải danh sách mẫu chứng chỉ...</p>
			</div>
		)
	}

	if (templates.length === 0) {
		return (
			<div className="admin-table-empty">
				<Award size={48} />
				<h3>Chưa có mẫu chứng chỉ</h3>
				<p>{emptyMessage}</p>
			</div>
		)
	}

	return (
		<div className="admin-table-container">
			<table className="admin-table">
				<thead>
					<tr>
						<th className="sortable">Tên chứng chỉ</th>
						<th className="sortable">Danh mục</th>
						<th className="sortable">Cấp độ</th>
						<th className="sortable">Thời hạn</th>
						<th className="sortable">Yêu cầu</th>
						<th className="sortable">Trạng thái</th>
						<th className="sortable">Ngày tạo</th>
						<th className="actions">Thao tác</th>
					</tr>
				</thead>
				<tbody>
					{templates.map((template) => (
						<tr key={template.id}>
							<td>
								<div className="certificate-info">
									<div className="certificate-name">{template.name}</div>
									<div className="certificate-description">{template.description}</div>
									<div className="certificate-meta">
										<span className="issuer">
											<Award size={14} />
											{template.issuer}
										</span>
									</div>
								</div>
							</td>
							<td>
								<Badge 
									variant="secondary" 
									style={{ backgroundColor: getCategoryColor(template.category) }}
								>
									{getCategoryLabel(template.category)}
								</Badge>
							</td>
							<td>
							<Badge 
								variant="secondary" 
								style={{ 
									color: getLevelColor(template.level),
									backgroundColor: getLevelColor(template.level) + '20'
								}}
							>
									{getLevelLabel(template.level)}
								</Badge>
							</td>
							<td>
								<div className="validity-info">
									<div className="validity-period">
										<Clock size={14} />
										{template.validityPeriod} tháng
									</div>
								</div>
							</td>
							<td>
								<div className="requirements-info">
									<div className="requirements-count">
										<CheckCircle size={14} />
										{template.requirements.length} yêu cầu
									</div>
									<div className="requirements-preview">
										{template.requirements.slice(0, 2).map((req) => (
											<span key={req.id} className="requirement-tag">
												{req.description}
											</span>
										))}
										{template.requirements.length > 2 && (
											<span className="requirement-more">
												+{template.requirements.length - 2} khác
											</span>
										)}
									</div>
								</div>
							</td>
							<td>
								<Badge variant={template.isActive ? 'success' : 'secondary'}>
									{template.isActive ? 'Hoạt động' : 'Tạm dừng'}
								</Badge>
							</td>
							<td>
								<div className="date-info">
									<div className="created-date">
										<Calendar size={14} />
										{new Date(template.createdAt).toLocaleDateString('vi-VN')}
									</div>
									<div className="updated-date">
										Cập nhật: {new Date(template.updatedAt).toLocaleDateString('vi-VN')}
									</div>
								</div>
							</td>
							<td>
								<div className="table-actions">
									<button
										className="btn btn-sm btn-outline"
										onClick={() => onViewTemplate(template)}
										title="Xem chi tiết"
									>
										<Eye size={16} />
									</button>
									<button
										className="btn btn-sm btn-outline"
										onClick={() => onEditTemplate(template)}
										title="Chỉnh sửa"
									>
										<Edit size={16} />
									</button>
									<button
										className="btn btn-sm btn-outline"
										onClick={() => onDuplicateTemplate(template)}
										title="Nhân bản"
									>
										<Copy size={16} />
									</button>
									<button
										className="btn btn-sm btn-outline btn-danger"
										onClick={() => onDeleteTemplate(template.id)}
										title="Xóa"
									>
										<Trash2 size={16} />
									</button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

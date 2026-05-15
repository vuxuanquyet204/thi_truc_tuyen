import React from 'react'
import { RewardRule, RewardType, RewardTrigger } from '@/types/reward'
import Badge from '@/features/admin/ui/common/Badge'
import { 
	Edit, 
	Trash2, 
	Play, 
	Pause, 
	Copy,
	Eye,
	Target,
	Zap,
	Clock,
	User
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import '@/features/admin/ui/common/styles/table.css'

interface RewardRulesTableProps {
	rules: RewardRule[]
	onEdit: (rule: RewardRule) => void
	onDelete: (ruleId: string) => void
	onToggleStatus: (ruleId: string) => void
	onDuplicate: (rule: RewardRule) => void
	onViewDetails: (rule: RewardRule) => void
}

export default function RewardRulesTable({ 
	rules, 
	onEdit, 
	onDelete, 
	onToggleStatus, 
	onDuplicate,
	onViewDetails 
}: RewardRulesTableProps): JSX.Element {
	
	const getRewardTypeLabel = (type: RewardType) => {
		switch (type) {
			case 'course_completion': return 'Hoàn thành khóa học'
			case 'exam_score': return 'Điểm thi'
			case 'daily_login': return 'Đăng nhập hàng ngày'
			case 'assignment_submission': return 'Nộp bài tập'
			case 'quiz_perfect': return 'Quiz hoàn hảo'
			case 'streak_bonus': return 'Bonus streak'
			case 'referral': return 'Giới thiệu'
			case 'achievement': return 'Thành tích'
			case 'custom': return 'Tùy chỉnh'
			default: return type
		}
	}

	const getRewardTypeIcon = (type: RewardType) => {
		switch (type) {
			case 'course_completion': return <Target size={16} />
			case 'exam_score': return <Zap size={16} />
			case 'daily_login': return <Clock size={16} />
			case 'assignment_submission': return <User size={16} />
			case 'quiz_perfect': return <Target size={16} />
			case 'streak_bonus': return <Zap size={16} />
			case 'referral': return <User size={16} />
			case 'achievement': return <Target size={16} />
			case 'custom': return <Zap size={16} />
			default: return <Target size={16} />
		}
	}

	const getTriggerLabel = (trigger: RewardTrigger) => {
		switch (trigger) {
			case 'automatic': return 'Tự động'
			case 'manual': return 'Thủ công'
			case 'scheduled': return 'Lên lịch'
			case 'conditional': return 'Có điều kiện'
			default: return trigger
		}
	}

	const getTriggerBadgeVariant = (trigger: RewardTrigger) => {
		switch (trigger) {
			case 'automatic': return 'success'
			case 'manual': return 'warning'
			case 'scheduled': return 'info'
			case 'conditional': return 'secondary'
			default: return 'secondary'
		}
	}

	const formatTime = (timestamp: string) => {
		try {
			return formatDistanceToNow(new Date(timestamp), {
				addSuffix: true,
				locale: vi
			})
		} catch {
			return timestamp
		}
	}

	if (rules.length === 0) {
		return (
			<div className="admin-table-empty">
				<div className="admin-table-empty-icon">🎯</div>
				<div className="admin-table-empty-text">Chưa có luật thưởng nào</div>
			</div>
		)
	}

	return (
		<div className="reward-rules-table">
			<table className="admin-table">
				<thead>
					<tr>
						<th>Luật thưởng</th>
						<th>Loại</th>
						<th>Kích hoạt</th>
						<th>Số token</th>
						<th>Trạng thái</th>
						<th>Sử dụng</th>
						<th>Cập nhật</th>
						<th>Hành động</th>
					</tr>
				</thead>
				<tbody>
					{rules.map(rule => (
						<tr key={rule.id}>
							<td>
								<div className="rule-info">
									<div className="rule-name">{rule.name}</div>
									<div className="rule-description">{rule.description}</div>
									<div className="rule-priority">
										Ưu tiên: {rule.priority}
									</div>
								</div>
							</td>
							<td>
								<div className="rule-type">
									<div className="type-icon">
										{getRewardTypeIcon(rule.type)}
									</div>
									<span>{getRewardTypeLabel(rule.type)}</span>
								</div>
							</td>
							<td>
								<Badge variant={getTriggerBadgeVariant(rule.trigger)}>
									{getTriggerLabel(rule.trigger)}
								</Badge>
							</td>
							<td>
								<div className="token-amount">
									<span className="amount">{rule.tokenAmount}</span>
									<span className="symbol">{rule.tokenSymbol}</span>
								</div>
							</td>
							<td>
								<div className="rule-status">
									<Badge variant={rule.isActive ? 'success' : 'secondary'}>
										{rule.isActive ? 'Hoạt động' : 'Tạm dừng'}
									</Badge>
								</div>
							</td>
							<td>
								<div className="usage-stats">
									<div className="usage-count">{rule.usageCount} lần</div>
									{rule.lastUsed && (
										<div className="last-used">
											Lần cuối: {formatTime(rule.lastUsed)}
										</div>
									)}
								</div>
							</td>
							<td>
								<div className="update-info">
									<div className="updated-at">
										{formatTime(rule.updatedAt)}
									</div>
									<div className="created-by">
										bởi {rule.createdBy}
									</div>
								</div>
							</td>
							<td>
								<div className="action-buttons">
									<button
										className="btn btn-icon btn-sm btn-secondary"
										title="Xem chi tiết"
										onClick={() => onViewDetails(rule)}
									>
										<Eye size={16} />
									</button>
									
									<button
										className="btn btn-icon btn-sm btn-primary"
										title="Chỉnh sửa"
										onClick={() => onEdit(rule)}
									>
										<Edit size={16} />
									</button>
									
									<button
										className="btn btn-icon btn-sm btn-secondary"
										title="Sao chép"
										onClick={() => onDuplicate(rule)}
									>
										<Copy size={16} />
									</button>
									
									<button
										className={`btn btn-icon btn-sm ${rule.isActive ? 'btn-warning' : 'btn-success'}`}
										title={rule.isActive ? 'Tạm dừng' : 'Kích hoạt'}
										onClick={() => onToggleStatus(rule.id)}
									>
										{rule.isActive ? <Pause size={16} /> : <Play size={16} />}
									</button>
									
									<button
										className="btn btn-icon btn-sm btn-danger"
										title="Xóa"
										onClick={() => onDelete(rule.id)}
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

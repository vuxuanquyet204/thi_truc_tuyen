import React from 'react'
import Card from '@/features/admin/ui/common/Card'
import { TopListsWidget, TopListItem } from '@/types/analytics'
import { 
	TrendingUp, 
	TrendingDown, 
	Minus,
	Users,
	BookOpen,
	Building2,
	GraduationCap,
	Award,
	DollarSign,
	UserCheck,
	FileText,
	MoreHorizontal
} from 'lucide-react'

interface TopListsWidgetProps {
	widget: TopListsWidget
	onItemClick?: (item: TopListItem) => void
	onViewAll?: (widgetId: string) => void
	onRefresh?: (widgetId: string) => void
}

const getWidgetIcon = (type: string) => {
	const iconMap = {
		courses: BookOpen,
		users: Users,
		organizations: Building2,
		instructors: GraduationCap,
		certificates: Award,
		revenue: DollarSign,
		enrollments: UserCheck,
		completions: FileText
	}
	return iconMap[type as keyof typeof iconMap] || Users
}

const getTrendIcon = (changeType: 'increase' | 'decrease' | 'stable') => {
	switch (changeType) {
		case 'increase':
			return <TrendingUp className="w-3 h-3 text-success" />
		case 'decrease':
			return <TrendingDown className="w-3 h-3 text-danger" />
		default:
			return <Minus className="w-3 h-3 text-muted" />
	}
}

const formatValue = (value: number, unit: string) => {
	if (unit === 'VND') {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(value)
	}
	
	return new Intl.NumberFormat('vi-VN').format(value)
}

const getTypeLabel = (type: string) => {
	const labelMap = {
		courses: 'Khóa học',
		users: 'Người dùng',
		organizations: 'Tổ chức',
		instructors: 'Giảng viên',
		certificates: 'Chứng chỉ',
		revenue: 'Doanh thu',
		enrollments: 'Đăng ký',
		completions: 'Hoàn thành'
	}
	return labelMap[type as keyof typeof labelMap] || type
}

export const TopListsWidgetComponent: React.FC<TopListsWidgetProps> = ({
	widget,
	onItemClick,
	onViewAll,
	onRefresh
}) => {
	const WidgetIcon = getWidgetIcon(widget.type)
	
	const handleItemClick = (item: TopListItem) => {
		onItemClick?.(item)
	}
	
	const handleViewAll = () => {
		onViewAll?.(widget.id)
	}
	
	const handleRefresh = () => {
		onRefresh?.(widget.id)
	}
	
	return (
		<Card className="top-lists-widget">
			<div className="widget-header">
				<div className="widget-title">
					<WidgetIcon className="w-5 h-5" />
					<h3>{widget.title}</h3>
				</div>
				
				<div className="widget-controls">
					<button 
						className="widget-control-btn"
						onClick={handleRefresh}
						title="Làm mới"
					>
						<MoreHorizontal className="w-4 h-4" />
					</button>
				</div>
			</div>
			
			<div className="widget-content">
				<div className="widget-info">
					<span className="widget-period">{widget.period}</span>
					{widget.description && (
						<span className="widget-description">{widget.description}</span>
					)}
				</div>
				
				<div className="top-list">
					{widget.items.slice(0, widget.maxItems || 5).map((item, index) => (
						<div 
							key={item.id}
							className={`top-list-item ${index < 3 ? 'top-item' : ''}`}
							onClick={() => handleItemClick(item)}
						>
							<div className="item-rank">
								<span className={`rank-number rank-${index + 1}`}>
									{index + 1}
								</span>
							</div>
							
							<div className="item-content">
								<div className="item-header">
									{item.avatar && (
										<img 
											src={item.avatar} 
											alt={item.name}
											className="item-avatar"
										/>
									)}
									<div className="item-info">
										<h4 className="item-name">{item.name}</h4>
										{item.subtitle && (
											<p className="item-subtitle">{item.subtitle}</p>
										)}
									</div>
								</div>
								
								<div className="item-metrics">
									<div className="item-value">
										{formatValue(item.value, item.unit)}
									</div>
									<div className="item-change">
										{getTrendIcon(item.changeType)}
										<span className={`change-value change-${item.changeType}`}>
											{Math.abs(item.change).toFixed(1)}%
										</span>
									</div>
								</div>
							</div>
							
							{item.metadata && (
								<div className="item-metadata">
									{item.metadata.category && (
										<span className="metadata-tag category">
											{item.metadata.category}
										</span>
									)}
									{item.metadata.rating && (
										<span className="metadata-tag rating">
											⭐ {item.metadata.rating}
										</span>
									)}
									{item.metadata.level && (
										<span className="metadata-tag level">
											{item.metadata.level}
										</span>
									)}
									{item.metadata.plan && (
										<span className="metadata-tag plan">
											{item.metadata.plan}
										</span>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			</div>
			
			<div className="widget-footer">
				<button 
					className="view-all-btn"
					onClick={handleViewAll}
				>
					Xem tất cả {getTypeLabel(widget.type)}
				</button>
				<span className="widget-last-updated">
					Cập nhật: {new Date(widget.lastUpdated).toLocaleString('vi-VN')}
				</span>
			</div>
		</Card>
	)
}

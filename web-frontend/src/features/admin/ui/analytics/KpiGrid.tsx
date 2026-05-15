import React from 'react'
import Card from '@/features/admin/ui/common/Card'
import { KPIMetric } from '@/types/analytics'
import { 
	TrendingUp, 
	TrendingDown, 
	Minus,
	DollarSign,
	Users,
	CheckCircle,
	BookOpen,
	Award,
	Star
} from 'lucide-react'

interface KpiGridProps {
	kpis: KPIMetric[]
	onKpiClick?: (kpi: KPIMetric) => void
}

const getIcon = (iconName: string) => {
	const iconMap = {
		DollarSign,
		Users,
		CheckCircle,
		BookOpen,
		Award,
		Star
	}
	return iconMap[iconName as keyof typeof iconMap] || Users
}

const getTrendIcon = (changeType: 'increase' | 'decrease' | 'stable') => {
	switch (changeType) {
		case 'increase':
			return <TrendingUp className="w-4 h-4 text-success" />
		case 'decrease':
			return <TrendingDown className="w-4 h-4 text-danger" />
		default:
			return <Minus className="w-4 h-4 text-muted" />
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
	
	if (unit === '%') {
		return `${value.toFixed(1)}%`
	}
	
	if (unit === 'sao') {
		return `${value.toFixed(1)} ⭐`
	}
	
	return new Intl.NumberFormat('vi-VN').format(value)
}

export const KpiGrid: React.FC<KpiGridProps> = ({ kpis, onKpiClick }) => {
	console.log('KpiGrid rendered with', kpis.length, 'KPIs:', kpis)
	
	if (!kpis || kpis.length === 0) {
		return (
			<div style={{ 
				padding: '40px',
				textAlign: 'center',
				color: '#64748b'
			}}>
				<p>Chưa có dữ liệu KPI</p>
			</div>
		)
	}
	
	return (
		<div style={{ 
			display: 'grid', 
			gridTemplateColumns: 'repeat(3, 1fr)', 
			gap: '20px'
		}}>
			{kpis.map((kpi) => {
				const IconComponent = getIcon(kpi.icon)
				
				// Define colors for each KPI type
				const getCardColor = (index: number) => {
					const colors = [
						{ bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', circle: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%)' },
						{ bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', circle: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)' },
						{ bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', circle: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)' },
						{ bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', circle: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)' },
						{ bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', circle: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)' },
						{ bg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', circle: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.05) 100%)' }
					]
					return colors[index % colors.length]
				}
				
				const cardColor = getCardColor(kpis.indexOf(kpi))
				
				return (
					<div
						key={kpi.id}
						style={{
							background: 'var(--card)',
							borderRadius: 'var(--radius-lg)',
							padding: '20px',
							boxShadow: 'var(--shadow-sm)',
							border: '1px solid var(--border)',
							position: 'relative',
							overflow: 'hidden',
							cursor: 'pointer',
							transition: 'all 0.2s ease-in-out'
						}}
						onClick={() => onKpiClick?.(kpi)}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = 'translateY(-2px)'
							e.currentTarget.style.boxShadow = 'var(--shadow-md)'
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = 'translateY(0)'
							e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
						}}
					>
						{/* Decorative gradient circle */}
						<div style={{ 
							position: 'absolute',
							top: '0',
							right: '0',
							width: '80px',
							height: '80px',
							background: cardColor.circle,
							borderRadius: '50%',
							transform: 'translate(20px, -20px)'
						}} />
						
						{/* Header with icon and trend */}
						<div style={{ 
							display: 'flex', 
							justifyContent: 'space-between', 
							alignItems: 'flex-start',
							marginBottom: '16px',
							position: 'relative',
							zIndex: 1
						}}>
							<div style={{ 
								width: '40px', 
								height: '40px', 
								borderRadius: 'var(--radius-md)', 
								display: 'flex', 
								alignItems: 'center', 
								justifyContent: 'center',
								background: cardColor.bg,
								color: 'white',
								flexShrink: 0
							}}>
								<IconComponent size={20} />
							</div>
							<div style={{ 
								display: 'flex', 
								alignItems: 'center', 
								gap: '4px',
								background: 'rgba(255, 255, 255, 0.9)',
								padding: '4px 8px',
								borderRadius: 'var(--radius-sm)',
								backdropFilter: 'blur(4px)'
							}}>
								{getTrendIcon(kpi.changeType)}
								<span style={{ 
									fontSize: '12px', 
									fontWeight: 600,
									color: kpi.changeType === 'increase' ? 'var(--success)' : 
										   kpi.changeType === 'decrease' ? 'var(--danger)' : 'var(--muted-foreground)'
								}}>
									{Math.abs(kpi.change).toFixed(1)}%
								</span>
							</div>
						</div>
						
						{/* Main content */}
						<div style={{ position: 'relative', zIndex: 1 }}>
							<div style={{ 
								fontSize: '28px', 
								fontWeight: 700, 
								color: 'var(--foreground)', 
								lineHeight: 1, 
								marginBottom: '8px' 
							}}>
								{formatValue(kpi.value, kpi.unit)}
							</div>
							<div style={{ 
								fontSize: '13px', 
								color: 'var(--muted-foreground)', 
								fontWeight: 500,
								marginBottom: '4px'
							}}>
								{kpi.name}
							</div>
							<div style={{ 
								fontSize: '11px', 
								color: 'var(--muted-foreground)', 
								fontWeight: 400
							}}>
								{kpi.period}
							</div>
						</div>
						
						{/* Description */}
						{kpi.description && (
							<div style={{ 
								marginTop: '12px',
								fontSize: '11px',
								color: 'var(--muted-foreground)',
								lineHeight: 1.4,
								position: 'relative',
								zIndex: 1
							}}>
								{kpi.description}
							</div>
						)}
						
						{/* Threshold indicators */}
						{kpi.threshold && (
							<div style={{ 
								marginTop: '12px',
								position: 'relative',
								zIndex: 1
							}}>
								<div style={{ 
									display: 'flex', 
									justifyContent: 'space-between',
									fontSize: '10px',
									color: 'var(--muted-foreground)',
									marginBottom: '4px'
								}}>
									<span>Thấp: {formatValue(kpi.threshold.critical, kpi.unit)}</span>
									<span>Cao: {formatValue(kpi.threshold.warning, kpi.unit)}</span>
								</div>
								<div style={{ 
									width: '100%',
									height: '4px',
									background: 'var(--muted)',
									borderRadius: '2px',
									overflow: 'hidden'
								}}>
									<div 
										style={{ 
											width: `${Math.min(100, (kpi.value / kpi.threshold.critical) * 100)}%`,
											height: '100%',
											backgroundColor: kpi.value >= kpi.threshold.warning 
												? 'var(--success)' 
												: kpi.value >= kpi.threshold.critical 
													? 'var(--warning)' 
													: 'var(--danger)',
											transition: 'width 0.3s ease'
										}}
									/>
								</div>
							</div>
						)}
					</div>
				)
			})}
		</div>
	)
}

import React, { useRef, useEffect } from 'react'
import Card from '@/features/admin/ui/common/Card'
import { AnalyticsChart, ChartType } from '@/types/analytics'
import { 
	LineChart, 
	BarChart3, 
	PieChart, 
	Activity,
	Download,
	RefreshCw,
	Settings,
	Maximize2
} from 'lucide-react'

interface AnalyticsChartProps {
	chart: AnalyticsChart
	onRefresh?: (chartId: string) => void
	onExport?: (chartId: string, format: 'png' | 'jpg' | 'pdf') => void
	onConfigure?: (chartId: string) => void
	onFullscreen?: (chartId: string) => void
	height?: number
	showControls?: boolean
}

const getChartIcon = (type: ChartType) => {
	const iconMap = {
		line: LineChart,
		bar: BarChart3,
		doughnut: PieChart,
		pie: PieChart,
		area: Activity,
		scatter: Activity,
		radar: Activity,
		polar: PieChart
	}
	return iconMap[type] || LineChart
}

const formatChartData = (chart: AnalyticsChart) => {
	// Đây là nơi sẽ tích hợp với Chart.js hoặc thư viện chart khác
	// Hiện tại chỉ return mock data structure
	return {
		type: chart.type,
		data: chart.data,
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: true,
					position: 'bottom' as const
				},
				title: {
					display: true,
					text: chart.title
				}
			},
			scales: chart.type === 'line' || chart.type === 'bar' ? {
				x: {
					display: true,
					title: {
						display: true,
						text: 'Thời gian'
					}
				},
				y: {
					display: true,
					title: {
						display: true,
						text: 'Giá trị'
					}
				}
			} : undefined,
			...chart.options
		}
	}
}

const renderChart = (chart: AnalyticsChart, canvasRef: React.RefObject<HTMLCanvasElement>) => {
	if (!canvasRef.current) return
	
	const ctx = canvasRef.current.getContext('2d')
	if (!ctx) return
	
	// Mock chart rendering - trong thực tế sẽ sử dụng Chart.js
	const { data, options } = formatChartData(chart)
	
	// Clear canvas
	ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
	
	// Draw mock chart based on type
	if (data.type === 'line') {
		drawLineChart(ctx, data, canvasRef.current.width, canvasRef.current.height)
	} else if (data.type === 'bar') {
		drawBarChart(ctx, data, canvasRef.current.width, canvasRef.current.height)
	} else if (data.type === 'doughnut' || data.type === 'pie') {
		drawDoughnutChart(ctx, data, canvasRef.current.width, canvasRef.current.height)
	}
}

const drawLineChart = (ctx: CanvasRenderingContext2D, data: any, width: number, height: number) => {
	const { labels, datasets } = data
	
	if (!datasets || datasets.length === 0 || !datasets[0] || !datasets[0].data || datasets[0].data.length === 0) {
		// Draw empty state message
		ctx.fillStyle = '#64748b'
		ctx.font = '14px sans-serif'
		ctx.textAlign = 'center'
		ctx.fillText('Chưa có dữ liệu', width / 2, height / 2)
		return
	}
	
	const padding = 40
	const chartWidth = width - padding * 2
	const chartHeight = height - padding * 2
	
	// Find max and min across all datasets
	let maxValue = -Infinity
	let minValue = Infinity
	datasets.forEach((dataset: any) => {
		if (dataset.data && dataset.data.length > 0) {
			maxValue = Math.max(maxValue, ...dataset.data)
			minValue = Math.min(minValue, ...dataset.data)
		}
	})
	
	if (maxValue === -Infinity || minValue === Infinity) {
		ctx.fillStyle = '#64748b'
		ctx.font = '14px sans-serif'
		ctx.textAlign = 'center'
		ctx.fillText('Chưa có dữ liệu', width / 2, height / 2)
		return
	}
	
	const valueRange = maxValue - minValue || 1 // Avoid division by zero
	
	// Draw axes
	ctx.strokeStyle = '#e5e7eb'
	ctx.lineWidth = 1
	ctx.beginPath()
	ctx.moveTo(padding, padding)
	ctx.lineTo(padding, height - padding)
	ctx.lineTo(width - padding, height - padding)
	ctx.stroke()
	
	// Draw each dataset
	datasets.forEach((dataset: any) => {
		if (!dataset.data || dataset.data.length === 0) return
		
		// Draw line
		ctx.strokeStyle = dataset.borderColor || '#3b82f6'
		ctx.lineWidth = 2
		ctx.beginPath()
		
		dataset.data.forEach((value: number, index: number) => {
			const x = padding + (index / (dataset.data.length - 1 || 1)) * chartWidth
			const y = height - padding - ((value - minValue) / valueRange) * chartHeight
			
			if (index === 0) {
				ctx.moveTo(x, y)
			} else {
				ctx.lineTo(x, y)
			}
		})
		
		ctx.stroke()
		
		// Draw points
		ctx.fillStyle = dataset.borderColor || '#3b82f6'
		dataset.data.forEach((value: number, index: number) => {
			const x = padding + (index / (dataset.data.length - 1 || 1)) * chartWidth
			const y = height - padding - ((value - minValue) / valueRange) * chartHeight
			
			ctx.beginPath()
			ctx.arc(x, y, 4, 0, 2 * Math.PI)
			ctx.fill()
		})
	})
}

const drawBarChart = (ctx: CanvasRenderingContext2D, data: any, width: number, height: number) => {
	const { labels, datasets } = data
	const dataset = datasets[0]
	
	if (!dataset || !dataset.data || dataset.data.length === 0) {
		// Draw empty state message
		ctx.fillStyle = '#64748b'
		ctx.font = '14px sans-serif'
		ctx.textAlign = 'center'
		ctx.fillText('Chưa có dữ liệu', width / 2, height / 2)
		return
	}
	
	const padding = 40
	const chartWidth = width - padding * 2
	const chartHeight = height - padding * 2
	const barWidth = chartWidth / dataset.data.length * 0.8
	
	const maxValue = Math.max(...dataset.data)
	
	ctx.fillStyle = dataset.backgroundColor || '#3b82f6'
	
	dataset.data.forEach((value: number, index: number) => {
		const barHeight = (value / maxValue) * chartHeight
		const x = padding + (index / dataset.data.length) * chartWidth + (chartWidth / dataset.data.length - barWidth) / 2
		const y = height - padding - barHeight
		
		ctx.fillRect(x, y, barWidth, barHeight)
	})
}

const drawDoughnutChart = (ctx: CanvasRenderingContext2D, data: any, width: number, height: number) => {
	const { labels, datasets } = data
	const dataset = datasets[0]
	
	if (!dataset || !dataset.data || dataset.data.length === 0) {
		// Draw empty state message
		ctx.fillStyle = '#64748b'
		ctx.font = '14px sans-serif'
		ctx.textAlign = 'center'
		ctx.fillText('Chưa có dữ liệu', width / 2, height / 2)
		return
	}
	
	const centerX = width / 2
	const centerY = height / 2
	const radius = Math.min(width, height) / 2 - 40
	
	const total = dataset.data.reduce((sum: number, value: number) => sum + value, 0)
	let currentAngle = 0
	
	dataset.data.forEach((value: number, index: number) => {
		const sliceAngle = (value / total) * 2 * Math.PI
		
		ctx.beginPath()
		ctx.moveTo(centerX, centerY)
		ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
		ctx.closePath()
		
		ctx.fillStyle = Array.isArray(dataset.backgroundColor) 
			? dataset.backgroundColor[index] 
			: dataset.backgroundColor || '#3b82f6'
		ctx.fill()
		
		currentAngle += sliceAngle
	})
}

export const AnalyticsChartComponent: React.FC<AnalyticsChartProps> = ({
	chart,
	onRefresh,
	onExport,
	onConfigure,
	onFullscreen,
	height = 300,
	showControls = true
}) => {
	console.log('AnalyticsChartComponent rendered with chart:', chart.id, chart.title, 'data:', chart.data)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const ChartIcon = getChartIcon(chart.type)
	
	useEffect(() => {
		renderChart(chart, canvasRef)
	}, [chart])
	
	const handleRefresh = () => {
		onRefresh?.(chart.id)
		// Re-render chart
		setTimeout(() => renderChart(chart, canvasRef), 100)
	}
	
	const handleExport = (format: 'png' | 'jpg' | 'pdf') => {
		onExport?.(chart.id, format)
	}
	
	const handleConfigure = () => {
		onConfigure?.(chart.id)
	}
	
	const handleFullscreen = () => {
		onFullscreen?.(chart.id)
	}
	
	return (
		<Card className="analytics-chart">
			<div className="chart-header">
				<div className="chart-title">
					<ChartIcon className="w-5 h-5" />
					<h3>{chart.title}</h3>
				</div>
				
				{showControls && (
					<div className="chart-controls">
						<button 
							className="chart-control-btn"
							onClick={handleRefresh}
							title="Làm mới"
						>
							<RefreshCw className="w-4 h-4" />
						</button>
						
						<div className="chart-export-dropdown">
							<button 
								className="chart-control-btn"
								title="Xuất biểu đồ"
							>
								<Download className="w-4 h-4" />
							</button>
							<div className="export-menu">
								<button onClick={() => handleExport('png')}>PNG</button>
								<button onClick={() => handleExport('jpg')}>JPG</button>
								<button onClick={() => handleExport('pdf')}>PDF</button>
							</div>
						</div>
						
						<button 
							className="chart-control-btn"
							onClick={handleConfigure}
							title="Cấu hình"
						>
							<Settings className="w-4 h-4" />
						</button>
						
						<button 
							className="chart-control-btn"
							onClick={handleFullscreen}
							title="Toàn màn hình"
						>
							<Maximize2 className="w-4 h-4" />
						</button>
					</div>
				)}
			</div>
			
			<div className="chart-content">
				<div className="chart-info">
					<span className="chart-period">{chart.period}</span>
					{chart.description && (
						<span className="chart-description">{chart.description}</span>
					)}
				</div>
				
				<div className="chart-canvas-container" style={{ height: `${height}px` }}>
					<canvas 
						ref={canvasRef}
						width={800}
						height={height}
						className="chart-canvas"
					/>
				</div>
			</div>
			
			<div className="chart-footer">
				<span className="chart-last-updated">
					Cập nhật: {new Date(chart.lastUpdated).toLocaleString('vi-VN')}
				</span>
			</div>
		</Card>
	)
}

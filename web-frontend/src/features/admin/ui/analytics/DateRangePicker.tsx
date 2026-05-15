import React, { useState } from 'react'
import Card from '@/features/admin/ui/common/Card'
import { DateRange, AnalyticsPeriod } from '@/types/analytics'
import { 
	Calendar,
	ChevronDown,
	Clock,
	RefreshCw,
	Download,
	Filter
} from 'lucide-react'

interface DateRangePickerProps {
	selectedRange: DateRange
	onRangeChange: (range: DateRange) => void
	onPeriodChange: (period: AnalyticsPeriod) => void
	onRefresh?: () => void
	onExport?: () => void
	onApplyFilters?: () => void
	className?: string
}

const predefinedRanges: { period: AnalyticsPeriod; label: string; getRange: () => DateRange }[] = [
	{
		period: 'today',
		label: 'Hôm nay',
		getRange: () => {
			const today = new Date()
			return {
				start: today.toISOString().split('T')[0],
				end: today.toISOString().split('T')[0],
				label: 'Hôm nay'
			}
		}
	},
	{
		period: 'yesterday',
		label: 'Hôm qua',
		getRange: () => {
			const yesterday = new Date()
			yesterday.setDate(yesterday.getDate() - 1)
			return {
				start: yesterday.toISOString().split('T')[0],
				end: yesterday.toISOString().split('T')[0],
				label: 'Hôm qua'
			}
		}
	},
	{
		period: 'last_7_days',
		label: '7 ngày qua',
		getRange: () => {
			const end = new Date()
			const start = new Date()
			start.setDate(start.getDate() - 6)
			return {
				start: start.toISOString().split('T')[0],
				end: end.toISOString().split('T')[0],
				label: '7 ngày qua'
			}
		}
	},
	{
		period: 'last_30_days',
		label: '30 ngày qua',
		getRange: () => {
			const end = new Date()
			const start = new Date()
			start.setDate(start.getDate() - 29)
			return {
				start: start.toISOString().split('T')[0],
				end: end.toISOString().split('T')[0],
				label: '30 ngày qua'
			}
		}
	},
	{
		period: 'last_90_days',
		label: '90 ngày qua',
		getRange: () => {
			const end = new Date()
			const start = new Date()
			start.setDate(start.getDate() - 89)
			return {
				start: start.toISOString().split('T')[0],
				end: end.toISOString().split('T')[0],
				label: '90 ngày qua'
			}
		}
	},
	{
		period: 'this_month',
		label: 'Tháng này',
		getRange: () => {
			const now = new Date()
			const start = new Date(now.getFullYear(), now.getMonth(), 1)
			const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
			return {
				start: start.toISOString().split('T')[0],
				end: end.toISOString().split('T')[0],
				label: 'Tháng này'
			}
		}
	},
	{
		period: 'last_month',
		label: 'Tháng trước',
		getRange: () => {
			const now = new Date()
			const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
			const end = new Date(now.getFullYear(), now.getMonth(), 0)
			return {
				start: start.toISOString().split('T')[0],
				end: end.toISOString().split('T')[0],
				label: 'Tháng trước'
			}
		}
	},
	{
		period: 'this_quarter',
		label: 'Quý này',
		getRange: () => {
			const now = new Date()
			const quarter = Math.floor(now.getMonth() / 3)
			const start = new Date(now.getFullYear(), quarter * 3, 1)
			const end = new Date(now.getFullYear(), quarter * 3 + 3, 0)
			return {
				start: start.toISOString().split('T')[0],
				end: end.toISOString().split('T')[0],
				label: 'Quý này'
			}
		}
	},
	{
		period: 'last_quarter',
		label: 'Quý trước',
		getRange: () => {
			const now = new Date()
			const quarter = Math.floor(now.getMonth() / 3) - 1
			const year = quarter < 0 ? now.getFullYear() - 1 : now.getFullYear()
			const month = quarter < 0 ? 9 : quarter * 3
			const start = new Date(year, month, 1)
			const end = new Date(year, month + 3, 0)
			return {
				start: start.toISOString().split('T')[0],
				end: end.toISOString().split('T')[0],
				label: 'Quý trước'
			}
		}
	},
	{
		period: 'this_year',
		label: 'Năm này',
		getRange: () => {
			const now = new Date()
			const start = new Date(now.getFullYear(), 0, 1)
			const end = new Date(now.getFullYear(), 11, 31)
			return {
				start: start.toISOString().split('T')[0],
				end: end.toISOString().split('T')[0],
				label: 'Năm này'
			}
		}
	},
	{
		period: 'last_year',
		label: 'Năm trước',
		getRange: () => {
			const now = new Date()
			const year = now.getFullYear() - 1
			const start = new Date(year, 0, 1)
			const end = new Date(year, 11, 31)
			return {
				start: start.toISOString().split('T')[0],
				end: end.toISOString().split('T')[0],
				label: 'Năm trước'
			}
		}
	}
]

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
	selectedRange,
	onRangeChange,
	onPeriodChange,
	onRefresh,
	onExport,
	onApplyFilters,
	className = ''
}) => {
	const [isOpen, setIsOpen] = useState(false)
	const [customStart, setCustomStart] = useState(selectedRange.start)
	const [customEnd, setCustomEnd] = useState(selectedRange.end)
	const [isCustomRange, setIsCustomRange] = useState(false)
	
	const handlePeriodSelect = (period: AnalyticsPeriod) => {
		const range = predefinedRanges.find(r => r.period === period)
		if (range) {
			const newRange = range.getRange()
			onRangeChange(newRange)
			onPeriodChange(period)
			setIsCustomRange(false)
			setIsOpen(false)
		}
	}
	
	const handleCustomRangeApply = () => {
		if (customStart && customEnd) {
			const newRange: DateRange = {
				start: customStart,
				end: customEnd,
				label: 'Tùy chỉnh'
			}
			onRangeChange(newRange)
			onPeriodChange('custom')
			setIsCustomRange(true)
			setIsOpen(false)
		}
	}
	
	const formatDateRange = (range: DateRange) => {
		if (range.label !== 'Tùy chỉnh') {
			return range.label
		}
		
		const startDate = new Date(range.start).toLocaleDateString('vi-VN')
		const endDate = new Date(range.end).toLocaleDateString('vi-VN')
		
		if (range.start === range.end) {
			return startDate
		}
		
		return `${startDate} - ${endDate}`
	}
	
	return (
		<Card className={`date-range-picker ${className}`}>
			<div className="picker-header">
				<div className="picker-title">
					<Calendar className="w-5 h-5" />
					<h3>Khoảng thời gian</h3>
				</div>
				
				<div className="picker-controls">
					{onRefresh && (
						<button 
							className="picker-control-btn"
							onClick={onRefresh}
							title="Làm mới dữ liệu"
						>
							<RefreshCw className="w-4 h-4" />
						</button>
					)}
					
					{onExport && (
						<button 
							className="picker-control-btn"
							onClick={onExport}
							title="Xuất dữ liệu"
						>
							<Download className="w-4 h-4" />
						</button>
					)}
					
					{onApplyFilters && (
						<button 
							className="picker-control-btn"
							onClick={onApplyFilters}
							title="Áp dụng bộ lọc"
						>
							<Filter className="w-4 h-4" />
						</button>
					)}
				</div>
			</div>
			
			<div className="picker-content">
				<div className="current-range">
					<div className="range-display">
						<span className="range-label">Đã chọn:</span>
						<span className="range-value">{formatDateRange(selectedRange)}</span>
					</div>
					
					<button 
						className="range-selector"
						onClick={() => setIsOpen(!isOpen)}
					>
						<ChevronDown className={`w-4 h-4 ${isOpen ? 'rotate-180' : ''}`} />
					</button>
				</div>
				
				{isOpen && (
					<div className="range-options">
						<div className="predefined-ranges">
							<h4>Khoảng thời gian có sẵn</h4>
							<div className="range-grid">
								{predefinedRanges.map((range) => (
									<button
										key={range.period}
										className="range-option"
										onClick={() => handlePeriodSelect(range.period)}
									>
										{range.label}
									</button>
								))}
							</div>
						</div>
						
						<div className="custom-range">
							<h4>Khoảng thời gian tùy chỉnh</h4>
							<div className="custom-inputs">
								<div className="input-group">
									<label>Từ ngày:</label>
									<input
										type="date"
										value={customStart}
										onChange={(e) => setCustomStart(e.target.value)}
										className="date-input"
									/>
								</div>
								
								<div className="input-group">
									<label>Đến ngày:</label>
									<input
										type="date"
										value={customEnd}
										onChange={(e) => setCustomEnd(e.target.value)}
										className="date-input"
									/>
								</div>
								
								<button 
									className="apply-custom-btn"
									onClick={handleCustomRangeApply}
									disabled={!customStart || !customEnd}
								>
									Áp dụng
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
			
			<div className="picker-footer">
				<div className="range-info">
					<Clock className="w-4 h-4" />
					<span>
						Dữ liệu được cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
					</span>
				</div>
			</div>
		</Card>
	)
}

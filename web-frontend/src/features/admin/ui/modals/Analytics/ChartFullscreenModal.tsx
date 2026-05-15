import React from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import { AnalyticsChartComponent } from '@/features/admin/ui/analytics/AnalyticsChart'

interface ChartFullscreenModalProps {
	isOpen: boolean
	onClose: () => void
	chart: any
	onRefresh: (chartId: string) => void
	onExport: (chartId: string, format: 'png' | 'jpg' | 'pdf') => void
	onConfigure: (chartId: string) => void
	onFullscreen: (chartId: string) => void
}

const ChartFullscreenModal: React.FC<ChartFullscreenModalProps> = ({
	isOpen,
	onClose,
	chart,
	onRefresh,
	onExport,
	onConfigure,
	onFullscreen
}) => {
	if (!chart) return null

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={chart.title}
			maxWidth="90vw"
		>
			<AnalyticsChartComponent
				chart={chart}
				onRefresh={onRefresh}
				onExport={onExport}
				onConfigure={onConfigure}
				onFullscreen={onFullscreen}
				height={500}
			/>
		</Modal>
	)
}

export default ChartFullscreenModal

import React from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import { TopListsWidgetComponent } from '@/features/admin/ui/analytics/TopListsWidget'

interface TopListModalProps {
	isOpen: boolean
	onClose: () => void
	topList: any
	onItemClick: (item: any) => void
	onViewAll: (widgetId: string) => void
	onRefresh: (widgetId: string) => void
}

const TopListModal: React.FC<TopListModalProps> = ({
	isOpen,
	onClose,
	topList,
	onItemClick,
	onViewAll,
	onRefresh
}) => {
	if (!topList) return null

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={topList.title}
			maxWidth="80vw"
		>
			<TopListsWidgetComponent
				widget={topList}
				onItemClick={onItemClick}
				onViewAll={onViewAll}
				onRefresh={onRefresh}
			/>
		</Modal>
	)
}

export default TopListModal

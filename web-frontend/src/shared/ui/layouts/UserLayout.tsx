import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import UserHeader from './UserHeader'
import ChatBox from '@/shared/ui/molecules/ChatBox/ChatBox'
import styles from './UserLayout.module.css'

export default function UserLayout(): JSX.Element {
	const [isChatOpen, setIsChatOpen] = useState(false)

	const handleChatToggle = () => {
		setIsChatOpen(!isChatOpen)
	}

	const handleChatClose = () => {
		setIsChatOpen(false)
	}

	return (
		<div className={styles.layout}>
			<UserHeader />
			<main className={styles.main}>
				<Outlet />
			</main>
			
			{/* Chat Box - Fixed position in bottom right */}
			<ChatBox 
				isOpen={isChatOpen}
				onToggle={handleChatToggle}
				onClose={handleChatClose}
			/>
		</div>
	)
}

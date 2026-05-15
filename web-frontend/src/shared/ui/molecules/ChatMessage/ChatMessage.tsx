import React from 'react'
import { Bot, User } from 'lucide-react'
import styles from './ChatMessage.module.css'

interface Message {
	id: string
	content: string
	sender: 'user' | 'bot'
	timestamp: Date
	type?: 'text' | 'typing'
}

interface ChatMessageProps {
	message: Message
}

export default function ChatMessage({ message }: ChatMessageProps): JSX.Element {
	const formatTime = (date: Date) => {
		return date.toLocaleTimeString('vi-VN', { 
			hour: '2-digit', 
			minute: '2-digit' 
		})
	}

	return (
		<div className={`${styles.message} ${styles[message.sender]}`}>
			<div className={styles.messageAvatar}>
				{message.sender === 'bot' ? (
					<Bot size={16} />
				) : (
					<User size={16} />
				)}
			</div>
			<div className={styles.messageContent}>
				<div className={styles.messageText}>
					{message.content}
				</div>
				<div className={styles.messageTime}>
					{formatTime(message.timestamp)}
				</div>
			</div>
		</div>
	)
}

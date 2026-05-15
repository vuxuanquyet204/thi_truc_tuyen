import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import styles from './Modal.module.css'
import '@/features/admin/ui/common/styles/modal-common.scss'

interface ModalProps {
	isOpen: boolean
	onClose: () => void
	title: string
	children: React.ReactNode
	footer?: React.ReactNode
	maxWidth?: string
}

export default function Modal({
	isOpen,
	onClose,
	title,
	children,
	footer,
	maxWidth = '500px'
}: ModalProps): JSX.Element | null {

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'unset'
		}

		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [isOpen])

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose()
			}
		}

		if (isOpen) {
			document.addEventListener('keydown', handleEscape)
		}

		return () => {
			document.removeEventListener('keydown', handleEscape)
		}
	}, [isOpen, onClose])

	if (!isOpen) return null

	const modalContent = (
		<div className={styles.overlay} onClick={onClose}>
			<div
				className={styles.container}
				style={{ maxWidth }}
				onClick={(e) => e.stopPropagation()}
			>
				<div className={styles.header}>
					<h2 className={styles.title}>{title}</h2>
					<button
						onClick={onClose}
						className={styles.closeBtn}
						title="Đóng"
						aria-label="Đóng modal"
					>
						<X size={22} />
					</button>
				</div>

				<div className={styles.content}>
					{children}
				</div>

				{footer && (
					<div className={styles.footer}>
						{footer}
					</div>
				)}
			</div>
		</div>
	)

	return createPortal(modalContent, document.body)
}

import React from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import { DocumentRegistrar } from '@/features/admin/ui/copyright/DocumentRegistrar'
import { DocumentForm } from '@/features/admin/hooks'

interface RegisterDocumentModalProps {
	isOpen: boolean
	onClose: () => void
	onRegister: (form: DocumentForm) => Promise<any>
	loading: boolean
}

const RegisterDocumentModal: React.FC<RegisterDocumentModalProps> = ({
	isOpen,
	onClose,
	onRegister,
	loading
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Đăng ký tài liệu mới"
			maxWidth="90vw"
		>
			<DocumentRegistrar 
				onRegister={onRegister}
				loading={loading}
			/>
		</Modal>
	)
}

export default RegisterDocumentModal

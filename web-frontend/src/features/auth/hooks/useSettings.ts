import { useState, useCallback } from 'react'
import { changePassword } from '@/features/auth/api'

interface PasswordData {
	currentPassword: string
	newPassword: string
	confirmPassword: string
}

interface PasswordErrors {
	currentPassword?: string
	newPassword?: string
	confirmPassword?: string
}

export function useSettings(userId?: string) {
	const [activeTab, setActiveTab] = useState('security')
	const [notifications, setNotifications] = useState({
		email: true,
		push: false,
		sms: false,
	})
	const [privacy, setPrivacy] = useState({
		profileVisible: true,
		showEmail: false,
		showPhone: false,
	})
	const [showPasswordModal, setShowPasswordModal] = useState(false)
	const [passwordData, setPasswordData] = useState<PasswordData>({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	})
	const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({})
	const [isChangingPassword, setIsChangingPassword] = useState(false)
	const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

	const validatePassword = useCallback((): boolean => {
		const errors: PasswordErrors = {}

		if (!passwordData.currentPassword) {
			errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại'
		}

		if (!passwordData.newPassword) {
			errors.newPassword = 'Vui lòng nhập mật khẩu mới'
		} else if (passwordData.newPassword.length < 6) {
			errors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự'
		}

		if (passwordData.currentPassword === passwordData.newPassword) {
			errors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại'
		}

		if (!passwordData.confirmPassword) {
			errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới'
		} else if (passwordData.newPassword !== passwordData.confirmPassword) {
			errors.confirmPassword = 'Mật khẩu xác nhận không khớp'
		}

		setPasswordErrors(errors)
		return Object.keys(errors).length === 0
	}, [passwordData])

	const handleChangePassword = useCallback(async () => {
		if (!validatePassword()) return

		setIsChangingPassword(true)
		setPasswordMessage(null)

		try {
			await changePassword({
				currentPassword: passwordData.currentPassword,
				newPassword: passwordData.newPassword,
			})
			setPasswordMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' })
			setTimeout(() => {
				setShowPasswordModal(false)
				setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
				setPasswordMessage(null)
			}, 2000)
		} catch (err: any) {
			setPasswordMessage({
				type: 'error',
				text: err.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.',
			})
		} finally {
			setIsChangingPassword(false)
		}
	}, [passwordData, userId, validatePassword])

	const updateNotification = useCallback(
		(key: keyof typeof notifications, value: boolean) => {
			setNotifications((prev) => ({ ...prev, [key]: value }))
		},
		[]
	)

	const updatePrivacy = useCallback(
		(key: keyof typeof privacy, value: any) => {
			setPrivacy((prev) => ({ ...prev, [key]: value }))
		},
		[]
	)

	return {
		// State
		activeTab,
		notifications,
		privacy,
		showPasswordModal,
		passwordData,
		passwordErrors,
		isChangingPassword,
		passwordMessage,
		// Actions
		setActiveTab,
		setShowPasswordModal,
		setPasswordData,
		handleChangePassword,
		updateNotification,
		updatePrivacy,
	}
}

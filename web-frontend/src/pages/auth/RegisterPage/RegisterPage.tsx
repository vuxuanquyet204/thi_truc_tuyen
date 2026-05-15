import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/foundation/store/hooks'
import AuthForm from '@/shared/ui/molecules/AuthForm/AuthForm'
import Input from '@/shared/ui/atoms/Input/Input'
import PasswordStrength from '@/shared/ui/atoms/PasswordStrength'
import SocialAuthButtons from '@/shared/ui/molecules/SocialAuthButtons/SocialAuthButtons'
import { validateEmail, validatePassword, validateName, validateUsername, validateConfirmPassword, checkPasswordStrength } from '@/features/auth/utils/authValidation'
import { useFormValidation } from '@/features/auth/hooks/useFormValidation'
import { registerUser, clearError } from '@/foundation/store/slices/authSlice'
import styles from './RegisterPage.module.css'
import authFormStyles from './AuthForm.module.css'

export default function RegisterPage(): JSX.Element {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const { loading, error } = useAppSelector((state) => state.auth)
	const wasLoadingRef = React.useRef(false)

	const [passwordStrength, setPasswordStrength] = useState<'weak' | 'fair' | 'good' | 'strong'>('weak')

	// Form validation setup
	const {
		formData,
		fields,
		handleChange,
		handleBlur,
		handleFocus,
		handleSubmit,
		setFieldError
	} = useFormValidation(
		{
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
			firstName: '',
			lastName: ''
		},
		{
			username: validateUsername,
			email: validateEmail,
			password: validatePassword,
			confirmPassword: (value: string) => validateConfirmPassword(formData.password, value),
			firstName: (value: string) => validateName(value, 'Họ'),
			lastName: (value: string) => validateName(value, 'Tên')
		},
		{
			debounceMs: 300,
			validateOnChange: true,
			validateOnBlur: true
		}
	)


	// Clear error when component mounts
	useEffect(() => {
		dispatch(clearError())
	}, [dispatch])

	// Update password strength when password changes
	useEffect(() => {
		setPasswordStrength(checkPasswordStrength(formData.password))
	}, [formData.password])

	// Handle server-side errors
	useEffect(() => {
		if (error && typeof error === 'string') {
			// Map server errors to specific fields
			if (error.toLowerCase().includes('email')) {
				setFieldError('email', error)
			} else if (error.toLowerCase().includes('username')) {
				setFieldError('username', error)
			} else if (error.toLowerCase().includes('password')) {
				setFieldError('password', error)
			}
		}
	}, [error, setFieldError])

	// Watch for successful registration (alternative approach)
	useEffect(() => {
		// If loading was true and now false, and no error, registration was successful
		if (wasLoadingRef.current && !loading && !error) {
			
			// Registration success, redirect to login with pre-filled data
			const registrationData = {
				email: formData.email,
				username: formData.username,
				fullName: `${formData.firstName} ${formData.lastName}`.trim()
			}
			
			// Store registration data temporarily for login page
			sessionStorage.setItem('registrationSuccess', JSON.stringify(registrationData))
			
			// Navigate to login page
			navigate('/auth/login', { 
				state: { 
					fromRegistration: true,
					registrationData 
				}
			})
		}
		
		wasLoadingRef.current = loading
	}, [loading, error, formData, navigate])

	const onSubmit = useCallback(async () => {
		try {
			// Dispatch register action
			const result = await dispatch(registerUser({
				username: formData.username,
				email: formData.email,
				password: formData.password,
				firstName: formData.firstName,
				lastName: formData.lastName
			}))

			// Check if registration was successful
			const isSuccess = registerUser.fulfilled.match(result) || 
							 (result.type === 'auth/registerUser/fulfilled')

			if (isSuccess) {
				// Registration success, redirect to login with pre-filled data
				const registrationData = {
					email: formData.email,
					username: formData.username,
					fullName: `${formData.firstName} ${formData.lastName}`.trim()
				}
				
				// Store registration data temporarily for login page
				sessionStorage.setItem('registrationSuccess', JSON.stringify(registrationData))
				
				// Small delay to ensure state is updated
				setTimeout(() => {
					// Navigate to login page
					navigate('/auth/login', { 
						state: { 
							fromRegistration: true,
							registrationData 
						}
					})
				}, 100)
			}
		} catch (error) {
			console.error('Registration error:', error)
		}
	}, [dispatch, formData, navigate])

	const handleGoogleAuth = () => {
		console.log('Google authentication')
		// TODO: Implement Google OAuth
	}

	const handleGitHubAuth = () => {
		console.log('GitHub authentication')
		// TODO: Implement GitHub OAuth
	}

	return (
		<div className={styles.page}>
			<div className={styles.container}>
				<AuthForm
					title="Tạo tài khoản"
					subtitle="Đăng ký để bắt đầu với EduPlatform"
					onSubmit={(e) => handleSubmit(onSubmit, e)}
					buttonText="Tạo tài khoản"
					loading={loading}
					error={error}
					afterButton={
						<div>
							<SocialAuthButtons
								onGoogleAuth={handleGoogleAuth}
								onGitHubAuth={handleGitHubAuth}
							/>
						</div>
					}
					footer={
						<p>
							Đã có tài khoản?{' '}
							<Link 
								to="/auth/login"
								className={authFormStyles.footerLink}
							>
								Đăng nhập
							</Link>
						</p>
					}
				>
			<Input
				id="username"
				name="username"
				type="text"
				value={formData.username}
				onChange={handleChange}
				onBlur={handleBlur}
				onFocus={handleFocus}
				placeholder="Nhập tên đăng nhập"
				error={fields.username?.error || undefined}
				success={fields.username?.isValid && fields.username?.value.length > 0}
				suggestions={fields.username?.suggestions}
				autoComplete="username"
				required
			/>

			<Input
				id="firstName"
				name="firstName"
				type="text"
				value={formData.firstName}
				onChange={handleChange}
				onBlur={handleBlur}
				onFocus={handleFocus}
				placeholder="Nhập họ"
				error={fields.firstName?.error || undefined}
				success={fields.firstName?.isValid && fields.firstName?.value.length > 0}
				suggestions={fields.firstName?.suggestions}
				autoComplete="given-name"
				required
			/>

			<Input
				id="lastName"
				name="lastName"
				type="text"
				value={formData.lastName}
				onChange={handleChange}
				onBlur={handleBlur}
				onFocus={handleFocus}
				placeholder="Nhập tên"
				error={fields.lastName?.error || undefined}
				success={fields.lastName?.isValid && fields.lastName?.value.length > 0}
				suggestions={fields.lastName?.suggestions}
				autoComplete="family-name"
				required
			/>

			<Input
				id="email"
				name="email"
				type="email"
				value={formData.email}
				onChange={handleChange}
				onBlur={handleBlur}
				onFocus={handleFocus}
				placeholder="Nhập email của bạn"
				error={fields.email?.error || undefined}
				success={fields.email?.isValid && fields.email?.value.length > 0}
				suggestions={fields.email?.suggestions}
				autoComplete="email"
				required
			/>
			
			<div>
				<Input
					id="password"
					name="password"
					type="password"
					value={formData.password}
					onChange={handleChange}
					onBlur={handleBlur}
					onFocus={handleFocus}
					placeholder="Tạo mật khẩu"
					error={fields.password?.error || undefined}
					success={fields.password?.isValid && fields.password?.value.length > 0}
					suggestions={fields.password?.suggestions}
					autoComplete="new-password"
					required
				/>
				<PasswordStrength strength={passwordStrength} />
			</div>
			
			<Input
				id="confirmPassword"
				name="confirmPassword"
				type="password"
				value={formData.confirmPassword}
				onChange={handleChange}
				onBlur={handleBlur}
				onFocus={handleFocus}
				placeholder="Xác nhận mật khẩu"
				error={fields.confirmPassword?.error || undefined}
				success={fields.confirmPassword?.isValid && fields.confirmPassword?.value.length > 0}
				suggestions={fields.confirmPassword?.suggestions}
				autoComplete="new-password"
				required
			/>
				</AuthForm>
			</div>
		</div>
	)
}
import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/foundation/store/hooks'
import AuthForm from '@/shared/ui/molecules/AuthForm/AuthForm'
import Input from '@/shared/ui/atoms/Input/Input'
import Checkbox from '@/shared/ui/atoms/Checkbox/Checkbox'
import SocialAuthButtons from '@/shared/ui/molecules/SocialAuthButtons/SocialAuthButtons'
import SuccessNotification from '@/shared/ui/atoms/SuccessNotification/SuccessNotification'
import { validateEmail, validatePassword } from '@/features/auth/utils/authValidation'
import { useFormValidation } from '@/features/auth/hooks/useFormValidation'
import { loginUser, clearError } from '@/foundation/store/slices/authSlice'
import styles from './LoginPage.module.css'
import authFormStyles from './AuthForm.module.css'

export default function LoginPage(): JSX.Element {
	const [rememberMe, setRememberMe] = useState(false)
	const [webAuthnLoading, setWebAuthnLoading] = useState(false)

	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const location = useLocation()
	const { loading, error, loggedIn, role } = useAppSelector((state) => state.auth)

	// Check for registration success data
	const registrationData = location.state?.registrationData || 
		(() => {
			const stored = sessionStorage.getItem('registrationSuccess')
			if (stored) {
				sessionStorage.removeItem('registrationSuccess') // Clean up
				return JSON.parse(stored)
			}
			return null
		})()

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
			email: registrationData?.email || '', 
			password: '' 
		},
		{
			email: validateEmail,
			password: validatePassword
		},
		{
			debounceMs: 500,
			validateOnChange: true,
			validateOnBlur: true
		}
	)

	// Redirect based on role after successful login
	useEffect(() => {
		if (loggedIn) {
			if (role === 'admin') {
				navigate('/admin/dashboard')
			} else if (role === 'user') {
				navigate('/user')
			}
		}
	}, [loggedIn, role, navigate])

	// Clear error when component mounts
	useEffect(() => {
		dispatch(clearError())
	}, [dispatch])

	// Set server errors to form fields
	useEffect(() => {
		if (error) {
			// Try to determine which field the error relates to
			if (error.toLowerCase().includes('email')) {
				setFieldError('email', error)
			} else if (error.toLowerCase().includes('password')) {
				setFieldError('password', error)
			}
		}
	}, [error, setFieldError])

	const onSubmit = useCallback(async () => {
		// Dispatch login action
		await dispatch(loginUser({
			usernameOrEmail: formData.email,
			password: formData.password
		})).unwrap()
	}, [dispatch, formData.email, formData.password])

	const handleGoogleAuth = async () => {
		try {
			const { initiateGoogleLogin } = await import('@/features/auth/api/authApi');
			initiateGoogleLogin();
		} catch (error) {
			console.error('Google authentication error:', error);
			setFieldError('email', 'Không thể kết nối với Google. Vui lòng thử lại.');
		}
	}

	const handleFacebookAuth = () => {
		console.log('Facebook authentication')
		// TODO: Implement Facebook OAuth
	}

	const handleGitHubAuth = () => {
		console.log('GitHub authentication')
		// TODO: Implement GitHub OAuth
	}

	// WebAuthn Authentication
	const startWebAuthnAuthentication = async () => {
		if (!formData.email) {
            setFieldError('email', 'Please enter your email to use WebAuthn.');
            return;
        }

		setWebAuthnLoading(true)
		try {
			// Step 1: Get assertion options from server (qua API Gateway - localhost:8080)
			const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/identity/api/webauthn/assertion/options`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username: formData.email // Use email as username for WebAuthn
				})
			})

			if (!response.ok) {
					const errorData = await response.json();
				throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
			}

			            const raw = await response.json()
			            // Support both direct and wrapped shapes
			            const options = (raw && (raw.publicKeyCredentialRequestOptions || raw.data?.publicKeyCredentialRequestOptions)) || raw
			
			            // Step 2: Get assertion from authenticator
            const allowCredentials = (options.allowCredentials || []).map((cred: any) => {
			                const mapped: any = {
			                    type: cred.type || 'public-key',
			                    id: base64UrlToArrayBuffer(cred.id)
			                }
                // Force platform authenticator during login
                mapped.transports = ['internal']
			                return mapped
			            })

            const publicKeyOptions: any = {
                challenge: base64UrlToArrayBuffer(options.challenge),
                rpId: options.rpId,
                userVerification: options.userVerification || 'required',
                timeout: options.timeout || 60000
            }
            // Prefer discoverable credentials: omit allowCredentials so platform passkey can be found
            if (allowCredentials.length > 0) {
                publicKeyOptions.allowCredentials = allowCredentials
            }

            const assertion = await navigator.credentials.get({
                publicKey: publicKeyOptions
            }) as PublicKeyCredential

			// Step 3: Send assertion to server in Yubico's expected JSON format
			const rawIdB64u = arrayBufferToBase64Url(assertion.rawId)
			const assertionJSON = {
				id: rawIdB64u,
				rawId: rawIdB64u,
				type: assertion.type,
				response: {
					clientDataJSON: arrayBufferToBase64Url((assertion.response as any).clientDataJSON),
					authenticatorData: arrayBufferToBase64Url((assertion.response as any).authenticatorData),
					signature: arrayBufferToBase64Url((assertion.response as any).signature),
					userHandle: arrayBufferToBase64Url(new TextEncoder().encode(formData.email).buffer)
				},
				clientExtensionResults: (assertion as any).getClientExtensionResults ? (assertion as any).getClientExtensionResults() : {}
			}

			const response2 = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/identity/api/webauthn/assertion/result`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(assertionJSON)
			})

			if (!response2.ok) {
				const msg = await response2.text()
				throw new Error(`Finish assertion failed ${response2.status}: ${msg}`)
			}

			            const result = await response2.json()
						console.log('Authentication result:', result)
			
						if (result.success && result.data) {
							// WebAuthn authentication successful
							alert('Đăng nhập WebAuthn thành công!')
			
							const { accessToken, refreshToken, user: backendUser } = result.data;
			
							const user = {
								id: backendUser.id.toString(),
								email: backendUser.email,
								name: `${backendUser.firstName} ${backendUser.lastName}`.trim(),
								role: backendUser.roles[0]?.toLowerCase(),
								avatar: backendUser.avatarUrl
							};
			
							localStorage.setItem('accessToken', accessToken);
							localStorage.setItem('refreshToken', refreshToken);
							localStorage.setItem('user', JSON.stringify(user));
			
							dispatch({
								type: 'auth/loginUser/fulfilled',
								payload: user,
							});
						} else {
							alert('Đăng nhập WebAuthn thất bại: ' + (result.message || 'Unknown error'))
						}
		} catch (error: any) {
			console.error('WebAuthn authentication error:', error)
			alert('Lỗi đăng nhập WebAuthn: ' + error.message)
		} finally {
			setWebAuthnLoading(false)
		}
	}

	// Utility functions for WebAuthn
	function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
		const bytes = new Uint8Array(buffer)
		let binary = ''
		for (let i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i])
		}
		return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
	}

	function base64UrlToArrayBuffer(base64Url: string): ArrayBuffer {
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
		const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
		const binary = atob(padded)
		const buffer = new ArrayBuffer(binary.length)
		const bytes = new Uint8Array(buffer)
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i)
		}
		return buffer
	}

	// Check WebAuthn support (runtime check)
	const isWebAuthnSupported = typeof window !== 'undefined' &&
									window.navigator &&
									'credentials' in window.navigator &&
									typeof window.navigator.credentials.create === 'function' &&
									typeof window.navigator.credentials.get === 'function'

	return (
		<div className={styles.page}>
			<div className={styles.container}>
				{/* Registration success message */}
				{registrationData && (
					<SuccessNotification
						title="Đăng ký thành công!"
						message={`Chào mừng ${registrationData.fullName}! Email của bạn đã được điền sẵn, chỉ cần nhập mật khẩu để đăng nhập.`}
					/>
				)}

				<AuthForm
					title={registrationData ? 'Đăng nhập ngay' : 'Chào mừng trở lại'}
					subtitle={registrationData
						? 'Email của bạn đã được điền sẵn, chỉ cần nhập mật khẩu'
						: 'Đăng nhập vào tài khoản của bạn để tiếp tục'}
					onSubmit={(e) => handleSubmit(onSubmit, e)}
					buttonText="Đăng nhập"
					loading={loading}
					error={error}
					afterButton={
						<div>
							<SocialAuthButtons
								onGoogleAuth={handleGoogleAuth}
								onGitHubAuth={handleGitHubAuth}
							/>
							{isWebAuthnSupported && (
								<div className={styles.webAuthnContainer}>
									<button
										type="button"
										onClick={startWebAuthnAuthentication}
										disabled={webAuthnLoading}
										className={styles.webAuthnButton}
									>
										{webAuthnLoading ? 'Đang xác thực...' : 'Đăng nhập không mật khẩu'}
									</button>
								</div>
							)}
						</div>
					}
					footer={
						<p>
							Chưa có tài khoản?{' '}
							<Link 
								to="/auth/register"
								className={authFormStyles.footerLink}
							>
								Đăng ký
							</Link>
						</p>
					}
				>
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
			
			<Input
				id="password"
				name="password"
				type="password"
				value={formData.password}
				onChange={handleChange}
				onBlur={handleBlur}
				onFocus={handleFocus}
				placeholder="Nhập mật khẩu của bạn"
				error={fields.password?.error || undefined}
				success={fields.password?.isValid && fields.password?.value.length > 0}
				suggestions={fields.password?.suggestions}
				autoComplete="current-password"
				required
			/>
			
					<div className={styles.rememberForgotContainer}>
						<Checkbox
							id="remember"
							label="Ghi nhớ đăng nhập"
							checked={rememberMe}
							onChange={setRememberMe}
						/>
						<Link 
							to="/auth/forgot"
							className={styles.forgotPasswordLink}
						>
							Quên mật khẩu?
						</Link>
					</div>
				</AuthForm>
			</div>
		</div>
	)
}
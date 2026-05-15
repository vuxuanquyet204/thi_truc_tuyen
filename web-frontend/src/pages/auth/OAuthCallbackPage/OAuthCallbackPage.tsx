import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '@/foundation/store/hooks'

export default function OAuthCallbackPage(): JSX.Element {
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const dispatch = useAppDispatch()
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const processOAuthCallback = async () => {
			try {
				const token = searchParams.get('token')
				const errorParam = searchParams.get('error')

				if (errorParam) {
					throw new Error(`OAuth error: ${errorParam}`)
				}

				if (!token) {
					throw new Error('No authentication token received')
				}

				try {
					const tokenParts = token.split('.')
					if (tokenParts.length !== 3) {
						throw new Error('Invalid token format')
					}

					const payload = JSON.parse(atob(tokenParts[1]))
					console.log('Token payload:', payload)

					const user = {
						id: payload.sub || payload.userId || payload.id || '',
						email: payload.email || '',
						name:
							payload.name ||
							`${payload.firstName || ''} ${payload.lastName || ''}`.trim() ||
							payload.username ||
							'',
						role: (payload.role || payload.scope || 'user').toLowerCase(),
						avatar: payload.avatar || payload.picture || '',
					}

					localStorage.setItem('accessToken', token)
					localStorage.setItem('user', JSON.stringify(user))

					dispatch({
						type: 'auth/loginUser/fulfilled',
						payload: user,
					})

					console.log('OAuth login successful:', user)

					if (user.role === 'admin') {
						navigate('/admin/dashboard', { replace: true })
					} else {
						navigate('/user', { replace: true })
					}
				} catch (parseError: any) {
					console.error('Failed to parse token:', parseError)
					throw new Error('Invalid token received from server')
				}
			} catch (err: any) {
				console.error('OAuth callback error:', err)
				setError(err.message || 'Xác thực thất bại. Vui lòng thử lại.')

				setTimeout(() => {
					navigate('/auth/login', {
						replace: true,
						state: {
							error: err.message || 'Xác thực Google thất bại. Vui lòng thử lại.',
						},
					})
				}, 3000)
			}
		}

		processOAuthCallback()
	}, [searchParams, navigate, dispatch])

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: '100vh',
				padding: '20px',
				textAlign: 'center',
			}}
		>
			{error ? (
				<>
					<div
						style={{
							width: '48px',
							height: '48px',
							borderRadius: '50%',
							background: 'var(--destructive)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							marginBottom: '16px',
						}}
					>
						<span style={{ fontSize: '24px', color: 'white' }}>✕</span>
					</div>
					<h2 style={{ color: 'var(--destructive)', marginBottom: '8px' }}>
						Xác thực thất bại
					</h2>
					<p style={{ color: 'var(--muted-foreground)', marginBottom: '16px' }}>{error}</p>
					<p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
						Đang chuyển hướng về trang đăng nhập...
					</p>
				</>
			) : (
				<>
					<div
						style={{
							width: '48px',
							height: '48px',
							border: '3px solid var(--primary)',
							borderTopColor: 'transparent',
							borderRadius: '50%',
							animation: 'spin 1s linear infinite',
							marginBottom: '16px',
						}}
					/>
					<h2 style={{ color: 'var(--foreground)', marginBottom: '8px' }}>
						Đang xác thực...
					</h2>
					<p style={{ color: 'var(--muted-foreground)' }}>Vui lòng đợi trong giây lát</p>
				</>
			)}

			<style>{`
				@keyframes spin {
					to { transform: rotate(360deg); }
				}
			`}</style>
		</div>
	)
}

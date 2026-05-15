import { useCallback } from 'react'
import { handleOAuthCallback } from '@/features/auth/api'

interface OAuthCallbackResult {
	success: boolean
	error?: string
	user?: any
}

export function useOAuthCallback() {
	const processCallback = useCallback(async (code: string): Promise<OAuthCallbackResult> => {
		try {
			const result = await handleOAuthCallback(code)
			return { success: true, user: result }
		} catch (err: any) {
			console.error('OAuth callback error:', err)
			return {
				success: false,
				error: err.message || 'Xác thực OAuth thất bại',
			}
		}
	}, [])

	return { processCallback }
}

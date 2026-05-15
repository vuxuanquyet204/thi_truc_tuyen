import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/foundation/store'

interface ProtectedRouteProps {
	children: React.ReactNode
	requiredRole?: 'admin' | 'user'
	fallbackPath?: string
}

export default function ProtectedRoute({
	children,
	requiredRole,
	fallbackPath = '/auth'
}: ProtectedRouteProps): JSX.Element {
	const { loggedIn, role } = useAppSelector((state) => state.auth)
	const location = useLocation()

	// Not logged in
	if (!loggedIn) {
		return <Navigate to={fallbackPath} state={{ from: location }} replace />
	}

	// Role-based access control
	if (requiredRole && role !== requiredRole) {
		// Redirect to appropriate dashboard based on user's role
		const redirectPath = role === 'admin' ? '/admin/dashboard' : '/user'
		return <Navigate to={redirectPath} replace />
	}

	return <>{children}</>
}

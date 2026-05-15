import React, { createContext, useContext, useState, useCallback, useRef } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastProps {
	id: string
	type: ToastType
	title?: string
	message: string
	duration?: number
}

interface ToastContextValue {
	toasts: ToastProps[]
	showToast: (props: Omit<ToastProps, 'id'>) => void
	hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast(): ToastContextValue {
	const context = useContext(ToastContext)
	if (!context) {
		throw new Error('useToast must be used within a ToastProvider')
	}
	return context
}

interface ToastProviderProps {
	children: React.ReactNode
	maxToasts?: number
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps): JSX.Element {
	const [toasts, setToasts] = useState<ToastProps[]>([])
	const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id))
		const timer = timersRef.current.get(id)
		if (timer) {
			clearTimeout(timer)
			timersRef.current.delete(id)
		}
	}, [])

	const showToast = useCallback(
		(props: Omit<ToastProps, 'id'>) => {
			const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
			const duration = props.duration ?? 4000

			setToasts((prev) => {
				const next = [...prev, { ...props, id }]
				return next.length > maxToasts ? next.slice(-maxToasts) : next
			})

			if (duration > 0) {
				const timer = setTimeout(() => removeToast(id), duration)
				timersRef.current.set(id, timer)
			}
		},
		[maxToasts, removeToast]
	)

	const hideToast = useCallback(
		(id: string) => {
			removeToast(id)
		},
		[removeToast]
	)

	return (
		<ToastContext.Provider value={{ toasts, showToast, hideToast }}>
			{children}
			<ToastContainer toasts={toasts} onDismiss={hideToast} />
		</ToastContext.Provider>
	)
}

interface ToastContainerProps {
	toasts: ToastProps[]
	onDismiss: (id: string) => void
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps): JSX.Element | null {
	if (toasts.length === 0) return null

	return (
		<div
			style={{
				position: 'fixed',
				top: '1rem',
				right: '1rem',
				zIndex: 9999,
				display: 'flex',
				flexDirection: 'column',
				gap: '0.5rem',
				maxWidth: '400px',
			}}
		>
			{toasts.map((toast) => (
				<ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
			))}
		</div>
	)
}

const toastStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
	success: {
		bg: '#f0fdf4',
		border: '#22c55e',
		icon: '✓',
	},
	error: {
		bg: '#fef2f2',
		border: '#ef4444',
		icon: '✕',
	},
	warning: {
		bg: '#fffbeb',
		border: '#f59e0b',
		icon: '!',
	},
	info: {
		bg: '#eff6ff',
		border: '#3b82f6',
		icon: 'i',
	},
}

function ToastItem({ toast, onDismiss }: { toast: ToastProps; onDismiss: () => void }): JSX.Element {
	const style = toastStyles[toast.type]

	return (
		<div
			style={{
				background: style.bg,
				borderLeft: `4px solid ${style.border}`,
				borderRadius: '0.5rem',
				padding: '0.75rem 1rem',
				display: 'flex',
				alignItems: 'flex-start',
				gap: '0.75rem',
				boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
				animation: 'slideIn 0.2s ease-out',
			}}
		>
			<span
				style={{
					width: '20px',
					height: '20px',
					borderRadius: '50%',
					background: style.border,
					color: '#fff',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: '12px',
					fontWeight: 'bold',
					flexShrink: 0,
				}}
			>
				{style.icon}
			</span>
			<div style={{ flex: 1 }}>
				{toast.title && (
					<p style={{ fontWeight: 600, marginBottom: '2px', color: '#1f2937' }}>
						{toast.title}
					</p>
				)}
				<p style={{ color: '#374151', fontSize: '14px' }}>{toast.message}</p>
			</div>
			<button
				onClick={onDismiss}
				style={{
					background: 'none',
					border: 'none',
					cursor: 'pointer',
					color: '#9ca3af',
					fontSize: '18px',
					padding: '0',
					lineHeight: 1,
				}}
			>
				×
			</button>
			<style>{`
				@keyframes slideIn {
					from { transform: translateX(100%); opacity: 0; }
					to { transform: translateX(0); opacity: 1; }
				}
			`}</style>
		</div>
	)
}

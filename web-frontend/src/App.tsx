import React from 'react'
import './foundation/theme/globals.css'
import { Provider } from 'react-redux'
import { store } from './foundation/store'
import AppRoutes from './foundation/router/UserRoutes'
import { ThemeProvider } from './foundation/contexts/ThemeContext'
import { ToastProvider } from './foundation/contexts/ToastContext'
import { NotificationInit } from './foundation/components/NotificationInit'

export default function App(): JSX.Element {
	return (
		<Provider store={store}>
			<ThemeProvider>
				<ToastProvider>
					<NotificationInit />
					<AppRoutes />
				</ToastProvider>
			</ThemeProvider>
		</Provider>
	)
}

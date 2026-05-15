import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import examReducer from './slices/examSlice'
import uiReducer from './slices/uiSlice'
import notificationReducer from './slices/notificationSlice'

export const store = configureStore({
	reducer: {
		auth: authReducer,
		exam: examReducer,
		ui: uiReducer,
		notifications: notificationReducer,
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Re-export hooks
export { useAppDispatch, useAppSelector } from './hooks'

// Re-export actions and types for convenience
export * from './slices/authSlice'
export * from './slices/examSlice'
export * from './slices/uiSlice'

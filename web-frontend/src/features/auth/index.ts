// Auth Feature - Feature-Sliced Design
// Re-exports from foundation + feature-specific implementations

// Model (Redux slice + types)
export * from './model/types';
export {
	loginUser,
	registerUser,
	logoutUser,
	checkAuth,
	clearError,
	authReducer as authReducer,
	selectAuth,
	selectIsLoggedIn,
	selectCurrentUser,
	selectUserRole,
	selectAuthLoading,
	selectAuthError,
} from '@/foundation/store/slices/authSlice';
export type { AuthState, UserRole } from '@/foundation/store/slices/authSlice';

// API
export * from './api';

// Hooks
export * from './hooks';

// Utils
export * from './utils';

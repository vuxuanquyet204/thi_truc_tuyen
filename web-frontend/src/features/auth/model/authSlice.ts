// Auth slice - re-exported from foundation/store/slices
// This keeps the actual slice in foundation while allowing feature-level imports

export {
  loginUser,
  registerUser,
  logoutUser,
  checkAuth,
  clearError,
} from '@/foundation/store/slices/authSlice';

export { default as authReducer } from '@/foundation/store/slices/authSlice';

export type { AuthState } from '@/foundation/store/slices/authSlice';
export type { UserRole } from '@/foundation/store/slices/authSlice';

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsLoggedIn = (state: { auth: AuthState }) => state.auth.loggedIn;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.role;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

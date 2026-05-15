// useAuth hook - authenticated state management
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/foundation/store/hooks';
import {
  selectIsLoggedIn,
  selectCurrentUser,
  selectUserRole,
  selectAuthLoading,
  selectAuthError,
  loginUser,
  registerUser,
  logoutUser,
  clearError,
} from '@/features/auth/model/authSlice';
import type { LoginCredentials, RegisterCredentials } from '@/features/auth/api/authApi';

export function useAuth() {
  const dispatch = useAppDispatch();
  
  // Selectors
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const currentUser = useAppSelector(selectCurrentUser);
  const userRole = useAppSelector(selectUserRole);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  // Actions
  const login = useCallback(
    (credentials: LoginCredentials) => dispatch(loginUser(credentials)),
    [dispatch]
  );

  const register = useCallback(
    (credentials: RegisterCredentials) => dispatch(registerUser(credentials)),
    [dispatch]
  );

  const logout = useCallback(() => dispatch(logoutUser()), [dispatch]);

  const clearAuthError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    // State
    isLoggedIn,
    currentUser,
    userRole,
    loading,
    error,
    
    // Actions
    login,
    register,
    logout,
    clearError: clearAuthError,
    
    // Helpers
    isAdmin: userRole === 'admin',
    isUser: userRole === 'user',
  };
}

export default useAuth;

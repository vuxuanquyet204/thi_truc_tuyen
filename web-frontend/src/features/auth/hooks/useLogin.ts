// useLogin hook - login flow management
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/foundation/store/hooks';
import { 
  loginUser, 
  clearError, 
  selectAuthLoading, 
  selectAuthError, 
  selectIsLoggedIn,
  selectCurrentUser 
} from '@/features/auth/model/authSlice';
import type { LoginCredentials } from '@/features/auth/api/authApi';

export function useLogin() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const user = useAppSelector(selectCurrentUser);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      return await dispatch(loginUser(credentials));
    },
    [dispatch]
  );

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    login,
    clearError: clearAuthError,
    loading,
    error,
    isLoggedIn,
    user,
  };
}

export default useLogin;

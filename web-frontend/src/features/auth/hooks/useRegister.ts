// useRegister hook - registration flow management
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/foundation/store/hooks';
import { 
  registerUser, 
  clearError, 
  selectAuthLoading, 
  selectAuthError 
} from '@/features/auth/model/authSlice';
import type { RegisterCredentials } from '@/features/auth/api/authApi';

export function useRegister() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      return await dispatch(registerUser(credentials));
    },
    [dispatch]
  );

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    register,
    clearError: clearAuthError,
    loading,
    error,
  };
}

export default useRegister;

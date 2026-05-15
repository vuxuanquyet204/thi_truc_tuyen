// Auth feature types - re-exported from foundation
// Re-export from foundation for feature-level type organization

export type {
  User,
  UserRole,
  UserStatus,
} from '@/foundation/types/user';

export type {
  ApiResponse,
  PaginatedResponse,
} from '@/foundation/types/api';

// AuthState is re-exported from authSlice via features/auth/index.ts
export type { AuthState, UserRole as AuthUserRole } from '@/foundation/store/slices/authSlice';

// Feature-specific types

export interface LoginFormData {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  confirmPassword?: string;
}

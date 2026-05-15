// Users feature types - Re-exports from foundation
export type {
  User,
  UserRole,
  UserFilters,
  UserStatus,
} from '@/foundation/types/user';

export type {
  UserProfile,
  PersonalInfo,
  WorkExperience,
  Education,
  Skill,
  Certification,
  Project,
  Achievement,
  SocialLink,
  UserPreferences,
} from '@/foundation/types/profile';

// Re-export mappers from foundation
export {
  mapUserResponseToUser,
  mapUserToCreateRequest,
  mapUserToUpdateRequest,
} from '@/foundation/types/user';

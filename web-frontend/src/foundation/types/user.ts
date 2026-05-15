// Types cho User trong hệ thống admin
// Note: UserResponse, CreateUserRequest, UpdateUserRequest are defined in services/api/userApi
// These mappers bridge between API types and UI types

export interface User {
	id: string
	name: string
	email: string
	role: UserRole
	status: UserStatus
	avatar?: string
	phone?: string
	createdAt: string
	lastLogin?: string
	department?: string
	username?: string
	firstName?: string
	lastName?: string
	phoneNumber?: string
	avatarUrl?: string
	enabled?: boolean
	accountNonExpired?: boolean
	accountNonLocked?: boolean
	credentialsNonExpired?: boolean
	roles?: string[]
	updatedAt?: string
	lastLoginAt?: string
}

export type UserRole = 'admin' | 'user' | 'teacher' | 'student'

export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface UserFilters {
	search: string
	role: UserRole | 'all'
	status: UserStatus | 'all'
}

export interface UserTableColumn {
	key: string
	label: string
	sortable?: boolean
	width?: string
}

/**
 * UserResponse - minimal interface mirroring services/api/userApi
 * This avoids cross-dependency between foundation types and services layer
 */
interface UserResponse {
	id: string | number
	username: string
	email: string
	firstName?: string
	lastName?: string
	phoneNumber?: string
	avatarUrl?: string
	enabled?: boolean
	accountNonExpired?: boolean
	accountNonLocked?: boolean
	credentialsNonExpired?: boolean
	roles?: string[]
	createdAt?: string
	updatedAt?: string
	lastLoginAt?: string
}

interface CreateUserRequest {
	username: string
	email: string
	password: string
	firstName: string
	lastName: string
	roleNames?: string[]
	enabled?: boolean
	accountNonExpired?: boolean
	accountNonLocked?: boolean
	credentialsNonExpired?: boolean
	phoneNumber?: string
	avatarUrl?: string
}

interface UpdateUserRequest {
	username?: string
	email?: string
	firstName?: string
	lastName?: string
	phoneNumber?: string
	avatarUrl?: string
	enabled?: boolean
	accountNonLocked?: boolean
	roleNames?: string[]
}

export function mapUserResponseToUser(response: UserResponse): User {
	// roles 
	const getPrimaryRole = (roles: string[]): UserRole => {
		if (!roles || roles.length === 0) return 'user'
		const roleMap: Record<string, UserRole> = {
			'ROLE_ADMIN': 'admin',
			'ADMIN': 'admin',
			'ROLE_TEACHER': 'teacher',
			'TEACHER': 'teacher',
			'ROLE_STUDENT': 'student',
			'STUDENT': 'student',
			'ROLE_USER': 'user',
			'USER': 'user'
		}
		for (const role of roles) {
			const upperRole = role.toUpperCase()
			if (roleMap[upperRole]) {
				return roleMap[upperRole]
			}
		}
		return 'user'
	}

	// enabled status
	// Logic: enabled = true → active (Hoạt động), enabled = false → inactive (Bị khóa)
	const getStatus = (response: UserResponse): UserStatus => {
		if (response.enabled) return 'active'
		return 'inactive'
	}

	// Handle snake_case fields from backend response
	const rawResponse = response as any
	
	// Extract fields supporting both camelCase and snake_case
	const firstName = response.firstName || rawResponse.first_name || ''
	const lastName = response.lastName || rawResponse.last_name || ''
	const phoneNumber = response.phoneNumber || rawResponse.phone_number || rawResponse.phone || null
	const avatarUrl = response.avatarUrl || rawResponse.avatar_url || null
	const createdAt = response.createdAt || rawResponse.created_at || ''
	const updatedAt = response.updatedAt || rawResponse.updated_at || null
	const lastLoginAt = response.lastLoginAt || rawResponse.last_login_at || null
	const enabled = response.enabled !== undefined ? response.enabled : (rawResponse.enabled !== undefined ? rawResponse.enabled : true)
	const accountNonExpired = response.accountNonExpired !== undefined ? response.accountNonExpired : (rawResponse.account_non_expired !== undefined ? rawResponse.account_non_expired : true)
	const accountNonLocked = response.accountNonLocked !== undefined ? response.accountNonLocked : (rawResponse.account_non_locked !== undefined ? rawResponse.account_non_locked : true)
	const credentialsNonExpired = response.credentialsNonExpired !== undefined ? response.credentialsNonExpired : (rawResponse.credentials_non_expired !== undefined ? rawResponse.credentials_non_expired : true)
	const roles = response.roles || rawResponse.roles || []

	// firstName lastName  name
	const name = `${firstName} ${lastName}`.trim() || response.username

	return {
		id: String(response.id),
		name,
		email: response.email,
		role: getPrimaryRole(roles),
		status: getStatus({ enabled } as UserResponse),
		avatar: avatarUrl,
		phone: phoneNumber,
		createdAt: createdAt,
		lastLogin: lastLoginAt,
		username: response.username,
		firstName: firstName,
		lastName: lastName,
		phoneNumber: phoneNumber,
		avatarUrl: avatarUrl,
		enabled: enabled,
		accountNonExpired: accountNonExpired,
		accountNonLocked: accountNonLocked,
		credentialsNonExpired: credentialsNonExpired,
		roles: roles,
		updatedAt: updatedAt,
		lastLoginAt: lastLoginAt
	}
}

/**
 *  User CreateUserRequest
 */
export function mapUserToCreateRequest(user: Partial<User>): CreateUserRequest {
	const getRoleNames = (role?: UserRole): string[] => {
		if (!role) return []
		// Map frontend roles to backend role names (database has: ADMIN, USER, MANAGER)
		// Backend converts role names to uppercase, so we send the exact names from database
		const roleMap: Record<UserRole, string> = {
			'admin': 'ADMIN',        // Maps to ADMIN in database
			'teacher': 'MANAGER',    // Maps to MANAGER in database (or use USER if MANAGER doesn't fit)
			'student': 'USER',        // Maps to USER in database (no STUDENT role exists)
			'user': 'USER'           // Maps to USER in database
		}
		return roleMap[role] ? [roleMap[role]] : []
	}

	// Generate username: ensure minimum 3 characters
	const generateUsername = (): string => {
		if (user.username && user.username.length >= 3) {
			return user.username
		}
		if (user.email) {
			const emailUsername = user.email.split('@')[0]
			if (emailUsername.length >= 3) {
				return emailUsername
			}
		}
		if (user.name) {
			const nameUsername = user.name.replace(/\s+/g, '').toLowerCase()
			if (nameUsername.length >= 3) {
				return nameUsername
			}
		}
		// Fallback: use email prefix + random or timestamp
		const prefix = user.email?.split('@')[0] || 'user'
		return prefix.length >= 3 ? prefix : prefix + '123'
	}

	// Parse name into firstName and lastName
	const parseName = (): { firstName: string; lastName: string } => {
		// If firstName and lastName are already provided and not empty, use them
		if (user.firstName?.trim() && user.lastName?.trim()) {
			return { 
				firstName: user.firstName.trim(), 
				lastName: user.lastName.trim() 
			}
		}
		
		// Try to parse from name field
		if (user.name?.trim()) {
			const nameParts = user.name.trim().split(/\s+/).filter(part => part.length > 0)
			if (nameParts.length >= 2) {
				return {
					firstName: nameParts[0].trim(),
					lastName: nameParts.slice(1).join(' ').trim()
				}
			} else if (nameParts.length === 1) {
				return {
					firstName: nameParts[0].trim(),
					lastName: 'User'
				}
			}
		}
		
		// Fallback: use individual fields or defaults
		const firstName = user.firstName?.trim() || 'User'
		const lastName = user.lastName?.trim() || 'User'
		
		return {
			firstName,
			lastName
		}
	}

	const { firstName, lastName } = parseName()
	
	// Ensure firstName and lastName are not empty (backend requirement)
	if (!firstName || firstName.trim().length === 0) {
		throw new Error('First name is required')
	}
	if (!lastName || lastName.trim().length === 0) {
		throw new Error('Last name is required')
	}

	// Ensure at least one role is assigned
	const roleNames = user.roles || getRoleNames(user.role)
	const finalRoleNames = roleNames.length > 0 ? roleNames : ['ROLE_USER']

	// Build request object with required fields
	// All boolean fields must be explicitly set (backend requires @NotNull)
	// Default to true unless explicitly set to false
	const request: CreateUserRequest = {
		username: generateUsername(),
		email: user.email || '',
		password: 'TempPassword123!', 
		firstName: firstName.trim(),
		lastName: lastName.trim(),
		enabled: user.status !== 'inactive' && user.enabled !== false,
		accountNonExpired: user.accountNonExpired !== false,
		accountNonLocked: user.status !== 'suspended' && user.accountNonLocked !== false,
		credentialsNonExpired: user.credentialsNonExpired !== false,
		roleNames: finalRoleNames
	}

	// Only include optional fields if they have values
	if (user.phoneNumber || user.phone) {
		request.phoneNumber = user.phoneNumber || user.phone || undefined
	}
	if (user.avatarUrl || user.avatar) {
		request.avatarUrl = user.avatarUrl || user.avatar || undefined
	}

	return request
}

/**
 *  User  UpdateUserRequest
 */
export function mapUserToUpdateRequest(user: Partial<User>): UpdateUserRequest {
	const getRoleNames = (role?: UserRole, existingRoles?: string[]): string[] | undefined => {
		if (role) {
			// Map frontend roles to backend role names (database has: ADMIN, USER, MANAGER)
			// Backend converts role names to uppercase, so we send the exact names from database
			const roleMap: Record<UserRole, string> = {
				'admin': 'ADMIN',        // Maps to ADMIN in database
				'teacher': 'MANAGER',    // Maps to MANAGER in database (or use USER if MANAGER doesn't fit)
				'student': 'USER',        // Maps to USER in database (no STUDENT role exists)
				'user': 'USER'           // Maps to USER in database
			}
			return roleMap[role] ? [roleMap[role]] : existingRoles
		}
		// If existingRoles are provided and they're in the correct format, use them
		// Otherwise, convert them from ROLE_* format to database format
		if (existingRoles && existingRoles.length > 0) {
			return existingRoles.map(role => {
				// Convert ROLE_* format to database format
				if (role.startsWith('ROLE_')) {
					const roleName = role.substring(5) // Remove 'ROLE_' prefix
					const roleMap: Record<string, string> = {
						'ADMIN': 'ADMIN',
						'TEACHER': 'MANAGER',
						'STUDENT': 'USER',
						'USER': 'USER'
					}
					return roleMap[roleName] || roleName
				}
				return role.toUpperCase()
			})
		}
		return user.roles || existingRoles
	}

	return {
		username: user.username,
		email: user.email,
		firstName: user.firstName || user.name?.split(' ')[0],
		lastName: user.lastName || user.name?.split(' ').slice(1).join(' '),
		phoneNumber: user.phoneNumber || user.phone,
		avatarUrl: user.avatarUrl || user.avatar,
		enabled: user.status === 'active' ? true : user.status === 'inactive' ? false : user.enabled,
		accountNonLocked: user.status === 'suspended' ? false : user.accountNonLocked,
		roleNames: getRoleNames(user.role, user.roles)
	}
}


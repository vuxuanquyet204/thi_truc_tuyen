/**
 * Foundation API layer
 *
 * Provides:
 * - Centralized axios client with consistent interceptors
 * - Token management (get, clear, check auth)
 * - Normalized error handling
 * - API endpoint constants
 *
 * Usage:
 *   import { apiClient, identityClient, genericClient } from '@/foundation/api'
 *   import { AUTH_ENDPOINTS, EXAM_ENDPOINTS } from '@/foundation/api'
 *
 * For individual API modules, import from their respective feature API files.
 */

export {
	// Client factory
	createApiClient,
	// Pre-configured service clients
	apiClient,
	identityClient,
	courseClient,
	examClient,
	onlineExamClient,
	tokenClient,
	copyrightClient,
	multisigClient,
	proctoringClient,
	organizationClient,
	analyticsClient,
	genericClient,
	// Token utilities
	getAccessToken,
	clearTokens,
	isAuthenticated,
	TOKEN_KEYS,
	// Error utilities
	normalizeApiError,
} from './client'

export type { NormalizedError } from './interceptors'

export {
	requestInterceptor,
	responseInterceptor,
	normalizeError,
	responseInterceptorError,
	applyInterceptors,
} from './interceptors'

export {
	API_PATHS,
	AUTH_ENDPOINTS,
	USER_ENDPOINTS,
	COURSE_ENDPOINTS,
	EXAM_ENDPOINTS,
	TOKEN_ENDPOINTS,
	COPYRIGHT_ENDPOINTS,
	MULTISIG_ENDPOINTS,
	PROCTORING_ENDPOINTS,
	ORGANIZATION_ENDPOINTS,
	ANALYTICS_ENDPOINTS,
	CERTIFICATION_ENDPOINTS,
	buildUrl,
} from './endpoints'

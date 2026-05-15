// Types cho System Administration

export interface AdminUser {
	id: string
	username: string
	email: string
	fullName: string
	avatar?: string
	role: AdminRole
	permissions: AdminPermission[]
	status: AdminStatus
	lastLoginAt: string
	createdAt: string
	updatedAt: string
	createdBy: string
	loginAttempts: number
	isTwoFactorEnabled: boolean
	preferences: AdminPreferences
	metadata: AdminMetadata
}

export type AdminRole = 
	| 'super_admin'
	| 'system_admin'
	| 'content_admin'
	| 'user_admin'
	| 'security_admin'
	| 'audit_admin'
	| 'support_admin'

export type AdminStatus = 
	| 'active'
	| 'inactive'
	| 'suspended'
	| 'pending'
	| 'locked'

export type AdminPermission =
	| 'user_management'
	| 'content_management'
	| 'system_settings'
	| 'security_settings'
	| 'audit_logs'
	| 'backup_restore'
	| 'database_management'
	| 'api_management'
	| 'notification_management'
	| 'report_generation'
	| 'certificate_management'
	| 'organization_management'
	| 'course_management'
	| 'exam_management'
	| 'proctoring_management'
	| 'blockchain_management'
	| 'token_management'
	| 'analytics_access'
	| 'export_data'
	| 'import_data'
	| 'maintenance_mode'
	| 'system_restart'
	| 'system_shutdown'
	| 'firewall_update'
	| 'security_scan'

export interface AdminPreferences {
	language: string
	timezone: string
	theme: 'light' | 'dark' | 'auto'
	notifications: {
		email: boolean
		push: boolean
		sms: boolean
	}
	dashboard: {
		layout: 'grid' | 'list'
		widgets: string[]
		refreshInterval: number
	}
	security: {
		sessionTimeout: number
		requirePasswordChange: boolean
		passwordExpiryDays: number
	}
}

export interface AdminMetadata {
	department?: string
	phone?: string
	address?: string
	bio?: string
	skills?: string[]
	certifications?: string[]
	notes?: string
	tags?: string[]
}

export interface SystemHealth {
	overall: HealthStatus
	services: ServiceHealth[]
	databases: DatabaseHealth[]
	storage: StorageHealth
	network: NetworkHealth
	security: SecurityHealth
	performance: PerformanceHealth
	uptime: UptimeInfo
	lastChecked: string
}

export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown'

export interface ServiceHealth {
	name: string
	status: HealthStatus
	uptime: number
	responseTime: number
	errorRate: number
	lastError?: string
	version: string
	port: number
	protocol: string
}

export interface DatabaseHealth {
	name: string
	status: HealthStatus
	connections: {
		active: number
		max: number
		idle: number
	}
	queries: {
		total: number
		slow: number
		failed: number
	}
	size: {
		current: number
		max: number
		growth: number
	}
	backup: {
		lastBackup: string
		nextBackup: string
		status: HealthStatus
	}
}

export interface StorageHealth {
	total: number
	used: number
	available: number
	usage: {
		files: number
		databases: number
		logs: number
		backups: number
		cache: number
	}
	performance: {
		readSpeed: number
		writeSpeed: number
		latency: number
	}
}

export interface NetworkHealth {
	bandwidth: {
		incoming: number
		outgoing: number
		max: number
	}
	latency: {
		average: number
		min: number
		max: number
	}
	connections: {
		active: number
		max: number
		failed: number
	}
	ssl: {
		status: HealthStatus
		expiryDate: string
		issuer: string
	}
}

export interface SecurityHealth {
	threats: {
		blocked: number
		detected: number
		resolved: number
	}
	firewall: {
		status: HealthStatus
		rules: number
		blocked: number
	}
	antivirus: {
		status: HealthStatus
		lastScan: string
		threatsFound: number
	}
	encryption: {
		status: HealthStatus
		algorithms: string[]
		keyRotation: string
	}
}

export interface PerformanceHealth {
	cpu: {
		usage: number
		cores: number
		temperature: number
	}
	memory: {
		total: number
		used: number
		available: number
		swap: number
	}
	load: {
		average1m: number
		average5m: number
		average15m: number
	}
	cache: {
		hitRate: number
		size: number
		evictions: number
	}
}

export interface UptimeInfo {
	current: number
	average: number
	best: number
	worst: number
	incidents: number
	lastIncident?: string
}

export interface GlobalSettings {
	id: string
	category: SettingsCategory
	name: string
	key: string
	value: any
	type: SettingsType
	description: string
	isRequired: boolean
	isPublic: boolean
	validation?: SettingsValidation
	options?: SettingsOption[]
	updatedBy: string
	updatedAt: string
	version: number
}

export type SettingsCategory = 
	| 'general'
	| 'security'
	| 'email'
	| 'storage'
	| 'api'
	| 'notification'
	| 'backup'
	| 'maintenance'
	| 'integration'
	| 'appearance'

export type SettingsType = 
	| 'string'
	| 'number'
	| 'boolean'
	| 'array'
	| 'object'
	| 'json'
	| 'url'
	| 'email'
	| 'password'
	| 'file'

export interface SettingsValidation {
	min?: number
	max?: number
	pattern?: string
	required?: boolean
	enum?: string[]
	custom?: string
}

export interface SettingsOption {
	label: string
	value: any
	description?: string
}

export interface AuditLog {
	id: string
	timestamp: string
	userId: string
	userName: string
	userRole: AdminRole
	action: AuditAction
	resource: string
	resourceId?: string
	details: AuditDetails
	ipAddress: string
	userAgent: string
	sessionId: string
	result: AuditResult
	metadata?: Record<string, any>
}

export type AuditAction = 
	| 'login'
	| 'logout'
	| 'create'
	| 'read'
	| 'update'
	| 'delete'
	| 'export'
	| 'import'
	| 'backup'
	| 'restore'
	| 'configure'
	| 'grant_permission'
	| 'revoke_permission'
	| 'suspend_user'
	| 'activate_user'
	| 'reset_password'
	| 'change_password'
	| 'enable_2fa'
	| 'disable_2fa'
	| 'system_restart'
	| 'system_shutdown'
	| 'maintenance_mode'
	| 'security_scan'
	| 'firewall_update'
	| 'ssl_renewal'

export type AuditResult = 'success' | 'failure' | 'warning' | 'error'

export interface AuditDetails {
	description: string
	changes?: Record<string, { old: any; new: any }>
	error?: string
	warning?: string
	affectedUsers?: string[]
	affectedResources?: string[]
	duration?: number
	size?: number
}

export interface AdminForm {
	username: string
	email: string
	fullName: string
	role: AdminRole
	permissions: AdminPermission[]
	status: AdminStatus
	preferences: AdminPreferences
	metadata: AdminMetadata
}

export interface AdminFilters {
	search: string
	role: AdminRole | 'all'
	status: AdminStatus | 'all'
	permission: AdminPermission | 'all'
	department: string | 'all'
	createdFrom?: string
	createdTo?: string
	lastLoginFrom?: string
	lastLoginTo?: string
	isActive: boolean | 'all'
	hasTwoFactor: boolean | 'all'
}

export interface AdminStats {
	totalAdmins: number
	activeAdmins: number
	suspendedAdmins: number
	pendingAdmins: number
	lockedAdmins: number
	totalRoles: number
	totalPermissions: number
	recentLogins: number
	failedLogins: number
	twoFactorEnabled: number
	lastActivity: string
	adminByRole: Array<{ role: AdminRole; count: number }>
	adminByStatus: Array<{ status: AdminStatus; count: number }>
	loginTrends: Array<{ date: string; logins: number; failures: number }>
	permissionUsage: Array<{ permission: AdminPermission; count: number }>
}

export interface SystemAdminDashboard {
	stats: AdminStats
	systemHealth: SystemHealth
	recentAuditLogs: AuditLog[]
	criticalAlerts: SystemAlert[]
	recentActivities: AdminActivity[]
	topAdmins: Array<{ adminId: string; adminName: string; activityCount: number }>
	securityEvents: SecurityEvent[]
	performanceMetrics: PerformanceMetric[]
}

export interface SystemAlert {
	id: string
	type: SystemAlertType
	severity: SystemAlertSeverity
	title: string
	message: string
	source: string
	timestamp: string
	resolved: boolean
	resolvedBy?: string
	resolvedAt?: string
	acknowledged: boolean
	acknowledgedBy?: string
	acknowledgedAt?: string
	metadata?: Record<string, any>
}

export type SystemAlertType =
	| 'security'
	| 'performance'
	| 'storage'
	| 'network'
	| 'database'
	| 'service'
	| 'backup'
	| 'maintenance'
	| 'user'
	| 'system'

export type SystemAlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export type AlertType = SystemAlertType
export type AlertSeverity = SystemAlertSeverity

export interface AdminActivity {
	id: string
	adminId: string
	adminName: string
	action: string
	description: string
	timestamp: string
	duration?: number
	status: 'completed' | 'failed' | 'in_progress'
	metadata?: Record<string, any>
}

export interface SecurityEvent {
	id: string
	type: SecurityEventType
	severity: SystemAlertSeverity
	description: string
	source: string
	target?: string
	timestamp: string
	resolved: boolean
	details: Record<string, any>
}

export type SecurityEventType = 
	| 'login_attempt'
	| 'permission_escalation'
	| 'suspicious_activity'
	| 'data_access'
	| 'configuration_change'
	| 'system_access'
	| 'api_abuse'
	| 'brute_force'
	| 'unauthorized_access'
	| 'data_breach'

export interface PerformanceMetric {
	name: string
	value: number
	unit: string
	trend: 'up' | 'down' | 'stable'
	threshold: {
		warning: number
		critical: number
	}
	timestamp: string
}

export interface SystemMaintenance {
	id: string
	title: string
	description: string
	type: MaintenanceType
	scheduledAt: string
	duration: number
	status: MaintenanceStatus
	affectedServices: string[]
	createdBy: string
	createdAt: string
	startedAt?: string
	completedAt?: string
	notes?: string
}

export type MaintenanceType = 
	| 'scheduled'
	| 'emergency'
	| 'security'
	| 'performance'
	| 'backup'
	| 'update'
	| 'migration'

export type MaintenanceStatus = 
	| 'scheduled'
	| 'in_progress'
	| 'completed'
	| 'cancelled'
	| 'failed'

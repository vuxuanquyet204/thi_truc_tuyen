import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { AdminUser, AdminForm } from '@/foundation/types'

// Export Admins to Excel
export function exportAdminsToExcel(admins: AdminUser[], filename: string): void {
	const workbook = XLSX.utils.book_new()

	// Admins sheet
	const adminsData = admins.map(admin => ({
		'Username': admin.username,
		'Email': admin.email,
		'Full Name': admin.fullName,
		'Role': admin.role,
		'Status': admin.status,
		'Department': admin.metadata.department || '',
		'Phone': admin.metadata.phone || '',
		'Address': admin.metadata.address || '',
		'Bio': admin.metadata.bio || '',
		'Skills': admin.metadata.skills?.join(', ') || '',
		'Certifications': admin.metadata.certifications?.join(', ') || '',
		'Notes': admin.metadata.notes || '',
		'Tags': admin.metadata.tags?.join(', ') || '',
		'Language': admin.preferences.language,
		'Timezone': admin.preferences.timezone,
		'Theme': admin.preferences.theme,
		'Email Notifications': admin.preferences.notifications.email,
		'Push Notifications': admin.preferences.notifications.push,
		'SMS Notifications': admin.preferences.notifications.sms,
		'Dashboard Layout': admin.preferences.dashboard.layout,
		'Refresh Interval': admin.preferences.dashboard.refreshInterval,
		'Session Timeout': admin.preferences.security.sessionTimeout,
		'Require Password Change': admin.preferences.security.requirePasswordChange,
		'Password Expiry Days': admin.preferences.security.passwordExpiryDays,
		'Two Factor Enabled': admin.isTwoFactorEnabled,
		'Login Attempts': admin.loginAttempts,
		'Last Login': new Date(admin.lastLoginAt).toLocaleString('vi-VN'),
		'Created At': new Date(admin.createdAt).toLocaleString('vi-VN'),
		'Updated At': new Date(admin.updatedAt).toLocaleString('vi-VN'),
		'Created By': admin.createdBy
	}))

	const adminsSheet = XLSX.utils.json_to_sheet(adminsData)
	XLSX.utils.book_append_sheet(workbook, adminsSheet, 'Admin Users')

	// Permissions sheet
	const permissionsData: any[] = []
	admins.forEach(admin => {
		admin.permissions.forEach(permission => {
			permissionsData.push({
				'Username': admin.username,
				'Full Name': admin.fullName,
				'Role': admin.role,
				'Permission': permission,
				'Permission Label': permission.replace(/_/g, ' ')
			})
		})
	})

	if (permissionsData.length > 0) {
		const permissionsSheet = XLSX.utils.json_to_sheet(permissionsData)
		XLSX.utils.book_append_sheet(workbook, permissionsSheet, 'Permissions')
	}

	// Dashboard widgets sheet
	const widgetsData: any[] = []
	admins.forEach(admin => {
		admin.preferences.dashboard.widgets.forEach(widget => {
			widgetsData.push({
				'Username': admin.username,
				'Full Name': admin.fullName,
				'Role': admin.role,
				'Widget': widget,
				'Dashboard Layout': admin.preferences.dashboard.layout,
				'Refresh Interval': admin.preferences.dashboard.refreshInterval
			})
		})
	})

	if (widgetsData.length > 0) {
		const widgetsSheet = XLSX.utils.json_to_sheet(widgetsData)
		XLSX.utils.book_append_sheet(workbook, widgetsSheet, 'Dashboard Widgets')
	}

	// Save file
	const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
	const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
	saveAs(blob, filename)
}

// Import Admins from Excel
export async function importAdminsFromExcel(file: File): Promise<AdminForm[]> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		
		reader.onload = (e) => {
			try {
				const data = new Uint8Array(e.target?.result as ArrayBuffer)
				const workbook = XLSX.read(data, { type: 'array' })
				
				const adminsData = importAdminsFromWorkbook(workbook)
				resolve(adminsData)
			} catch (error) {
				reject(new Error(`Lỗi đọc file Excel: ${error instanceof Error ? error.message : 'Unknown error'}`))
			}
		}
		
		reader.onerror = () => {
			reject(new Error('Lỗi đọc file'))
		}
		
		reader.readAsArrayBuffer(file)
	})
}

// Import Admins from Workbook
function importAdminsFromWorkbook(workbook: XLSX.WorkBook): AdminForm[] {
	const sheetName = workbook.SheetNames[0]
	const worksheet = workbook.Sheets[sheetName]
	const jsonData = XLSX.utils.sheet_to_json(worksheet)

	return jsonData.map((row: any, index: number): AdminForm => {
		// Map role
		const mapRole = (role: string) => {
			const roleMap: Record<string, string> = {
				'Super Admin': 'super_admin',
				'System Admin': 'system_admin',
				'Content Admin': 'content_admin',
				'User Admin': 'user_admin',
				'Security Admin': 'security_admin',
				'Audit Admin': 'audit_admin',
				'Support Admin': 'support_admin'
			}
			return roleMap[role] || 'support_admin'
		}

		// Map status
		const mapStatus = (status: string) => {
			const statusMap: Record<string, string> = {
				'Hoạt động': 'active',
				'Không hoạt động': 'inactive',
				'Tạm dừng': 'suspended',
				'Chờ duyệt': 'pending',
				'Khóa': 'locked'
			}
			return statusMap[status] || 'active'
		}

		// Parse array fields
		const parseArrayField = (field: string) => {
			if (!field) return []
			return field.split(',').map(item => item.trim()).filter(item => item.length > 0)
		}

		// Parse boolean fields
		const parseBoolean = (value: any) => {
			if (typeof value === 'boolean') return value
			if (typeof value === 'string') {
				return value.toLowerCase() === 'true' || value.toLowerCase() === 'yes' || value.toLowerCase() === '1'
			}
			return Boolean(value)
		}

		return {
			username: row['Username'] || `admin${index + 1}`,
			email: row['Email'] || `admin${index + 1}@example.com`,
			fullName: row['Full Name'] || `Admin ${index + 1}`,
			role: (mapRole(row['Role']) || 'support_admin') as any,
			status: (mapStatus(row['Status']) || 'active') as any,
			permissions: [], // Will be populated from permissions sheet if available
			preferences: {
				language: row['Language'] || 'vi',
				timezone: row['Timezone'] || 'Asia/Ho_Chi_Minh',
				theme: (row['Theme'] || 'light') as any,
				notifications: {
					email: parseBoolean(row['Email Notifications']),
					push: parseBoolean(row['Push Notifications']),
					sms: parseBoolean(row['SMS Notifications'])
				},
				dashboard: {
					layout: (row['Dashboard Layout'] || 'grid') as any,
					widgets: ['system_health', 'recent_logs'],
					refreshInterval: parseInt(row['Refresh Interval']) || 30
				},
				security: {
					sessionTimeout: parseInt(row['Session Timeout']) || 240,
					requirePasswordChange: parseBoolean(row['Require Password Change']),
					passwordExpiryDays: parseInt(row['Password Expiry Days']) || 90
				}
			},
			metadata: {
				department: row['Department'] || 'IT Department',
				phone: row['Phone'] || '',
				address: row['Address'] || '',
				bio: row['Bio'] || '',
				skills: parseArrayField(row['Skills']),
				certifications: parseArrayField(row['Certifications']),
				notes: row['Notes'] || '',
				tags: parseArrayField(row['Tags'])
			}
		}
	})
}

// Generate Excel Template
export function generateAdminExcelTemplate(): void {
	const workbook = XLSX.utils.book_new()

	// Admins template
	const adminsData = [
		{
			'Username': 'newadmin',
			'Email': 'newadmin@eduplatform.com',
			'Full Name': 'Nguyễn Văn Admin',
			'Role': 'Support Admin',
			'Status': 'Hoạt động',
			'Department': 'IT Department',
			'Phone': '+84 123 456 789',
			'Address': 'Hà Nội, Việt Nam',
			'Bio': 'System Administrator với kinh nghiệm quản lý hệ thống',
			'Skills': 'System Administration, Security, Database Management',
			'Certifications': 'AWS Certified Solutions Architect, CISSP',
			'Notes': 'New admin user for system management',
			'Tags': 'admin, system, security',
			'Language': 'vi',
			'Timezone': 'Asia/Ho_Chi_Minh',
			'Theme': 'light',
			'Email Notifications': true,
			'Push Notifications': false,
			'SMS Notifications': false,
			'Dashboard Layout': 'grid',
			'Refresh Interval': 30,
			'Session Timeout': 240,
			'Require Password Change': false,
			'Password Expiry Days': 90,
			'Two Factor Enabled': false,
			'Login Attempts': 0,
			'Last Login': '',
			'Created At': '',
			'Updated At': '',
			'Created By': ''
		}
	]

	const adminsSheet = XLSX.utils.json_to_sheet(adminsData)
	XLSX.utils.book_append_sheet(workbook, adminsSheet, 'Admin Users')

	// Permissions template
	const permissionsData = [
		{
			'Username': 'newadmin',
			'Full Name': 'Nguyễn Văn Admin',
			'Role': 'Support Admin',
			'Permission': 'user_management',
			'Permission Label': 'user management'
		},
		{
			'Username': 'newadmin',
			'Full Name': 'Nguyễn Văn Admin',
			'Role': 'Support Admin',
			'Permission': 'notification_management',
			'Permission Label': 'notification management'
		},
		{
			'Username': 'newadmin',
			'Full Name': 'Nguyễn Văn Admin',
			'Role': 'Support Admin',
			'Permission': 'analytics_access',
			'Permission Label': 'analytics access'
		}
	]

	const permissionsSheet = XLSX.utils.json_to_sheet(permissionsData)
	XLSX.utils.book_append_sheet(workbook, permissionsSheet, 'Permissions')

	// Dashboard widgets template
	const widgetsData = [
		{
			'Username': 'newadmin',
			'Full Name': 'Nguyễn Văn Admin',
			'Role': 'Support Admin',
			'Widget': 'system_health',
			'Dashboard Layout': 'grid',
			'Refresh Interval': 30
		},
		{
			'Username': 'newadmin',
			'Full Name': 'Nguyễn Văn Admin',
			'Role': 'Support Admin',
			'Widget': 'recent_logs',
			'Dashboard Layout': 'grid',
			'Refresh Interval': 30
		}
	]

	const widgetsSheet = XLSX.utils.json_to_sheet(widgetsData)
	XLSX.utils.book_append_sheet(workbook, widgetsSheet, 'Dashboard Widgets')

	// Save template
	const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
	const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
	const filename = `admin-template-${new Date().toISOString().split('T')[0]}.xlsx`
	saveAs(blob, filename)
}

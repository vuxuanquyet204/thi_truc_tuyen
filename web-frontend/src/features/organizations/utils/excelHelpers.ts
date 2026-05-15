// Excel export helper cho Organization Management

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { Organization, OrganizationForm, OrganizationType, OrganizationStatus, OrganizationSize, SubscriptionPlan, SubscriptionStatus, VerificationStatus } from '@/foundation/types'

// Export Organizations to Excel
export const exportOrganizationsToExcel = (organizations: Organization[], filename = 'organizations.xlsx') => {
	const exportData = organizations.map(org => ({
		'ID': org.id,
		'Tên tổ chức': org.name,
		'Mô tả ngắn': org.shortDescription,
		'Mô tả chi tiết': org.description,
		'Logo URL': org.logo,
		'Website': org.website,
		'Email': org.email,
		'Số điện thoại': org.phone,
		'Địa chỉ': org.address,
		'Thành phố': org.city,
		'Quốc gia': org.country,
		'Mã bưu điện': org.postalCode,
		'Loại tổ chức': getOrganizationTypeLabel(org.type),
		'Trạng thái': getOrganizationStatusLabel(org.status),
		'Quy mô': getOrganizationSizeLabel(org.size),
		'Ngành': org.industry,
		'Năm thành lập': org.foundedYear,
		'Doanh thu': org.revenue,
		'Đơn vị tiền tệ': org.currency,
		'Số nhân viên': org.employees,
		'Số phòng ban': org.departments,
		'Số khóa học': org.courses,
		'Số học viên': org.students,
		'Số giảng viên': org.instructors,
		'Số admin': org.admins,
		'Gói đăng ký': getSubscriptionPlanLabel(org.subscriptionPlan),
		'Trạng thái gói': getSubscriptionStatusLabel(org.subscriptionStatus),
		'Ngày hết hạn gói': new Date(org.subscriptionExpiry).toLocaleDateString('vi-VN'),
		'Tags': org.tags.join(', '),
		'Tên người liên hệ': org.contactPerson.name,
		'Chức vụ người liên hệ': org.contactPerson.title,
		'Email người liên hệ': org.contactPerson.email,
		'SĐT người liên hệ': org.contactPerson.phone,
		'Phòng ban người liên hệ': org.contactPerson.department,
		'Facebook': org.socialMedia.facebook || '',
		'Twitter': org.socialMedia.twitter || '',
		'LinkedIn': org.socialMedia.linkedin || '',
		'YouTube': org.socialMedia.youtube || '',
		'Instagram': org.socialMedia.instagram || '',
		'Ngày tạo': new Date(org.createdAt).toLocaleDateString('vi-VN'),
		'Ngày cập nhật': new Date(org.updatedAt).toLocaleDateString('vi-VN'),
		'Đăng nhập cuối': new Date(org.lastLoginAt).toLocaleDateString('vi-VN'),
		'Đang hoạt động': org.isActive ? 'Có' : 'Không',
		'Đã xác minh': org.isVerified ? 'Có' : 'Không',
		'Premium': org.isPremium ? 'Có' : 'Không',
		'Trạng thái xác minh': getVerificationStatusLabel(org.verificationStatus),
		'Ghi chú': org.notes || ''
	}))

	const worksheet = XLSX.utils.json_to_sheet(exportData)
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Organizations')

	// Generate Excel file and download
	const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
	const data = new Blob([excelBuffer], { type: 'application/octet-stream' })
	saveAs(data, filename)
}

// Import Organizations from Excel
export const importOrganizationsFromExcel = (file: File): Promise<OrganizationForm[]> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()

		reader.onload = (e) => {
			try {
				const data = e.target?.result
				const workbook = XLSX.read(data, { type: 'array' })
				const sheetName = workbook.SheetNames[0]
				const worksheet = workbook.Sheets[sheetName]

				// Convert to JSON
				const jsonData = XLSX.utils.sheet_to_json(worksheet)

				// Transform to OrganizationForm
				const organizations = jsonData.map((row: any, index: number): OrganizationForm => {
					// Validate required fields
					if (!row['Tên tổ chức'] || !row['Email']) {
						throw new Error(`Dòng ${index + 2}: Thiếu thông tin bắt buộc (Tên tổ chức, Email)`)
					}

					return {
						name: String(row['Tên tổ chức'] || ''),
						description: String(row['Mô tả chi tiết'] || row['Mô tả ngắn'] || ''),
						shortDescription: String(row['Mô tả ngắn'] || ''),
						logo: String(row['Logo URL'] || ''),
						website: String(row['Website'] || ''),
						email: String(row['Email'] || ''),
						phone: String(row['Số điện thoại'] || ''),
						address: String(row['Địa chỉ'] || ''),
						city: String(row['Thành phố'] || ''),
						country: String(row['Quốc gia'] || ''),
						postalCode: String(row['Mã bưu điện'] || ''),
						type: (mapOrganizationType(row['Loại tổ chức']) || 'other') as OrganizationType,
						status: (mapOrganizationStatus(row['Trạng thái']) || 'pending') as OrganizationStatus,
						size: (mapOrganizationSize(row['Quy mô']) || 'small') as OrganizationSize,
						industry: String(row['Ngành'] || ''),
						foundedYear: parseInt(String(row['Năm thành lập'])) || new Date().getFullYear(),
						revenue: parseInt(String(row['Doanh thu'])) || 0,
						currency: String(row['Đơn vị tiền tệ'] || 'VND'),
						employees: parseInt(String(row['Số nhân viên'])) || 0,
						subscriptionPlan: (mapSubscriptionPlan(row['Gói đăng ký']) || 'free') as SubscriptionPlan,
						contactPerson: {
							name: String(row['Tên người liên hệ'] || ''),
							title: String(row['Chức vụ người liên hệ'] || ''),
							email: String(row['Email người liên hệ'] || ''),
							phone: String(row['SĐT người liên hệ'] || ''),
							department: String(row['Phòng ban người liên hệ'] || ''),
							isPrimary: true
						},
						socialMedia: {
							website: String(row['Website'] || ''),
							facebook: String(row['Facebook'] || ''),
							twitter: String(row['Twitter'] || ''),
							linkedin: String(row['LinkedIn'] || ''),
							youtube: String(row['YouTube'] || ''),
							instagram: String(row['Instagram'] || '')
						},
						tags: row['Tags'] ? String(row['Tags']).split(',').map((tag: string) => tag.trim()) : [],
						notes: String(row['Ghi chú'] || '')
					}
				})

				resolve(organizations)
			} catch (error) {
				reject(error)
			}
		}

		reader.onerror = (error) => {
			reject(error)
		}

		reader.readAsArrayBuffer(file)
	})
}

// Generate Excel template
export const generateOrganizationExcelTemplate = (filename = 'organization_template.xlsx') => {
	const templateData = [
		{
			'Tên tổ chức': 'Công ty ABC',
			'Mô tả ngắn': 'Công ty công nghệ hàng đầu',
			'Mô tả chi tiết': 'Công ty chuyên về phát triển phần mềm và giải pháp công nghệ',
			'Logo URL': 'https://example.com/logo.png',
			'Website': 'https://abc.com',
			'Email': 'contact@abc.com',
			'Số điện thoại': '+84-24-7300-1886',
			'Địa chỉ': 'Số 123 Nguyễn Huệ, Quận 1',
			'Thành phố': 'TP. Hồ Chí Minh',
			'Quốc gia': 'Việt Nam',
			'Mã bưu điện': '700000',
			'Loại tổ chức': 'Doanh nghiệp',
			'Trạng thái': 'Hoạt động',
			'Quy mô': '51-200 nhân viên',
			'Ngành': 'Công nghệ thông tin',
			'Năm thành lập': 2015,
			'Doanh thu': 1000000000,
			'Đơn vị tiền tệ': 'VND',
			'Số nhân viên': 150,
			'Tên người liên hệ': 'Nguyễn Văn A',
			'Chức vụ người liên hệ': 'Giám đốc',
			'Email người liên hệ': 'a.nguyen@abc.com',
			'SĐT người liên hệ': '+84-24-7300-1886',
			'Phòng ban người liên hệ': 'Ban Giám đốc',
			'Facebook': 'https://facebook.com/abc',
			'LinkedIn': 'https://linkedin.com/company/abc',
			'Tags': 'Công nghệ, Phần mềm, HCM',
			'Ghi chú': 'Khách hàng VIP'
		}
	]

	const worksheet = XLSX.utils.json_to_sheet(templateData)
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Organization Template')

	const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
	const data = new Blob([excelBuffer], { type: 'application/octet-stream' })
	saveAs(data, filename)
}

// Helper functions for mapping
const mapOrganizationType = (type: string): OrganizationType | undefined => {
	const typeMap: Record<string, OrganizationType> = {
		'Đại học': 'university',
		'Cao đẳng': 'college',
		'Trường học': 'school',
		'Trung tâm đào tạo': 'training_center',
		'Doanh nghiệp': 'corporate',
		'Tổ chức phi lợi nhuận': 'ngo',
		'Cơ quan nhà nước': 'government',
		'Startup': 'startup',
		'Tập đoàn': 'enterprise',
		'Khác': 'other'
	}
	return typeMap[type] || undefined
}

const mapOrganizationStatus = (status: string): OrganizationStatus | undefined => {
	const statusMap: Record<string, OrganizationStatus> = {
		'Hoạt động': 'active',
		'Không hoạt động': 'inactive',
		'Tạm dừng': 'suspended',
		'Chờ duyệt': 'pending',
		'Lưu trữ': 'archived'
	}
	return statusMap[status] || undefined
}

const mapOrganizationSize = (size: string): OrganizationSize | undefined => {
	const sizeMap: Record<string, OrganizationSize> = {
		'1-10 nhân viên': 'startup',
		'11-50 nhân viên': 'small',
		'51-200 nhân viên': 'medium',
		'201-1000 nhân viên': 'large',
		'1000+ nhân viên': 'enterprise'
	}
	return sizeMap[size] || undefined
}

const mapSubscriptionPlan = (plan: string): SubscriptionPlan | undefined => {
	const planMap: Record<string, SubscriptionPlan> = {
		'Miễn phí': 'free',
		'Cơ bản': 'basic',
		'Chuyên nghiệp': 'professional',
		'Doanh nghiệp': 'enterprise',
		'Tùy chỉnh': 'custom'
	}
	return planMap[plan] || undefined
}

// Label functions
const getOrganizationTypeLabel = (type: OrganizationType): string => {
	const labels: Record<OrganizationType, string> = {
		'university': 'Đại học',
		'college': 'Cao đẳng',
		'school': 'Trường học',
		'training_center': 'Trung tâm đào tạo',
		'corporate': 'Doanh nghiệp',
		'ngo': 'Tổ chức phi lợi nhuận',
		'government': 'Cơ quan nhà nước',
		'startup': 'Startup',
		'enterprise': 'Tập đoàn',
		'other': 'Khác'
	}
	return labels[type] || type
}

const getOrganizationStatusLabel = (status: OrganizationStatus): string => {
	const labels: Record<OrganizationStatus, string> = {
		'active': 'Hoạt động',
		'inactive': 'Không hoạt động',
		'suspended': 'Tạm dừng',
		'pending': 'Chờ duyệt',
		'archived': 'Lưu trữ'
	}
	return labels[status] || status
}

const getOrganizationSizeLabel = (size: OrganizationSize): string => {
	const labels: Record<OrganizationSize, string> = {
		'startup': '1-10 nhân viên',
		'small': '11-50 nhân viên',
		'medium': '51-200 nhân viên',
		'large': '201-1000 nhân viên',
		'enterprise': '1000+ nhân viên'
	}
	return labels[size] || size
}

const getSubscriptionPlanLabel = (plan: SubscriptionPlan): string => {
	const labels: Record<SubscriptionPlan, string> = {
		'free': 'Miễn phí',
		'basic': 'Cơ bản',
		'professional': 'Chuyên nghiệp',
		'enterprise': 'Doanh nghiệp',
		'custom': 'Tùy chỉnh'
	}
	return labels[plan] || plan
}

const getSubscriptionStatusLabel = (status: SubscriptionStatus): string => {
	const labels: Record<SubscriptionStatus, string> = {
		'active': 'Hoạt động',
		'expired': 'Hết hạn',
		'cancelled': 'Đã hủy',
		'pending': 'Chờ duyệt',
		'trial': 'Dùng thử'
	}
	return labels[status] || status
}

const getVerificationStatusLabel = (status: VerificationStatus): string => {
	const labels: Record<VerificationStatus, string> = {
		'verified': 'Đã xác minh',
		'pending': 'Chờ xác minh',
		'rejected': 'Từ chối',
		'not_verified': 'Chưa xác minh'
	}
	return labels[status] || status
}

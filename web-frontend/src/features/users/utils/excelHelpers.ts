import * as XLSX from 'xlsx'
import { User, UserRole, UserStatus } from '@/foundation/types'

// Export users to Excel
export function exportUsersToExcel(users: User[], filename = 'danh-sach-nguoi-dung.xlsx') {
	// Prepare data for export
	const data = users.map(user => ({
		'ID': user.id,
		'Họ và tên': user.name,
		'Email': user.email,
		'Vai trò': getRoleLabel(user.role),
		'Trạng thái': getStatusLabel(user.status),
		'Số điện thoại': user.phone || '',
		'Ngày tạo': formatDate(user.createdAt),
		'Đăng nhập lần cuối': user.lastLogin ? formatDate(user.lastLogin) : 'Chưa đăng nhập'
	}))

	// Create workbook and worksheet
	const worksheet = XLSX.utils.json_to_sheet(data)
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Người dùng')

	// Set column widths
	worksheet['!cols'] = [
		{ wch: 10 },  // ID
		{ wch: 25 },  // Họ và tên
		{ wch: 30 },  // Email
		{ wch: 15 },  // Vai trò
		{ wch: 15 },  // Trạng thái
		{ wch: 15 },  // Số điện thoại
		{ wch: 20 },  // Ngày tạo
		{ wch: 20 }   // Đăng nhập lần cuối
	]

	// Write file
	XLSX.writeFile(workbook, filename)
}

// Import users from Excel
export function importUsersFromExcel(file: File): Promise<Partial<User>[]> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()

		reader.onload = (e) => {
			try {
				const data = e.target?.result
				const workbook = XLSX.read(data, { type: 'binary' })
				const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
				const jsonData = XLSX.utils.sheet_to_json(firstSheet)

				// Parse and validate data
				const users: Partial<User>[] = jsonData.map((row: any) => ({
					name: row['Họ và tên'] || row['Name'] || '',
					email: row['Email'] || '',
					phone: row['Số điện thoại'] || row['Phone'] || '',
					role: parseRole(row['Vai trò'] || row['Role']) || 'user',
					status: parseStatus(row['Trạng thái'] || row['Status']) || 'active'
				}))

				// Filter out invalid entries
				const validUsers = users.filter(user => user.name && user.email)

				resolve(validUsers)
			} catch (error) {
				reject(error)
			}
		}

		reader.onerror = (error) => reject(error)
		reader.readAsBinaryString(file)
	})
}

// Download Excel template
export function downloadExcelTemplate() {
	const template = [
		{
			'Họ và tên': 'Nguyễn Văn A',
			'Email': 'nguyen.van.a@example.com',
			'Số điện thoại': '0901234567',
			'Vai trò': 'Học viên',
			'Trạng thái': 'Hoạt động'
		},
		{
			'Họ và tên': 'Trần Thị B',
			'Email': 'tran.thi.b@example.com',
			'Số điện thoại': '0912345678',
			'Vai trò': 'Giảng viên',
			'Trạng thái': 'Hoạt động'
		}
	]

	const worksheet = XLSX.utils.json_to_sheet(template)
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')

	// Set column widths
	worksheet['!cols'] = [
		{ wch: 25 },  // Họ và tên
		{ wch: 30 },  // Email
		{ wch: 15 },  // Số điện thoại
		{ wch: 15 },  // Vai trò
		{ wch: 15 }   // Trạng thái
	]

	XLSX.writeFile(workbook, 'mau-danh-sach-nguoi-dung.xlsx')
}

// Helper functions
function getRoleLabel(role: UserRole): string {
	const labels: Record<UserRole, string> = {
		admin: 'Quản trị viên',
		teacher: 'Giảng viên',
		student: 'Học viên',
		user: 'Người dùng'
	}
	return labels[role] || role
}

function getStatusLabel(status: UserStatus): string {
	const labels: Record<UserStatus, string> = {
		active: 'Hoạt động',
		inactive: 'Không hoạt động',
		suspended: 'Bị khóa'
	}
	return labels[status] || status
}

function parseRole(roleString: string): UserRole | undefined {
	const normalized = roleString.toLowerCase().trim()
	
	if (normalized.includes('admin') || normalized.includes('quản trị')) return 'admin'
	if (normalized.includes('teacher') || normalized.includes('giảng viên')) return 'teacher'
	if (normalized.includes('student') || normalized.includes('học viên')) return 'student'
	if (normalized.includes('user') || normalized.includes('người dùng')) return 'user'
	
	return 'user'
}

function parseStatus(statusString: string): UserStatus | undefined {
	const normalized = statusString.toLowerCase().trim()
	
	if (normalized.includes('active') || normalized.includes('hoạt động')) return 'active'
	if (normalized.includes('inactive') || normalized.includes('không hoạt động')) return 'inactive'
	if (normalized.includes('suspend') || normalized.includes('khóa')) return 'suspended'
	
	return 'active'
}

function formatDate(dateString: string): string {
	try {
		const date = new Date(dateString)
		return date.toLocaleDateString('vi-VN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		})
	} catch {
		return dateString
	}
}


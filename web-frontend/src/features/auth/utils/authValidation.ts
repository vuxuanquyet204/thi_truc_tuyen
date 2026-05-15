export interface ValidationResult {
	isValid: boolean
	error: string | null
	suggestions?: string[]
}

export const validateEmail = (email: string): ValidationResult => {
	if (!email) {
		return { isValid: false, error: 'Email là bắt buộc' }
	}
	
	// More comprehensive email regex
	const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
	
	if (!emailRegex.test(email)) {
		return { 
			isValid: false, 
			error: 'Vui lòng nhập địa chỉ email hợp lệ',
			suggestions: ['Ví dụ: user@example.com']
		}
	}
	
	// Check email length
	if (email.length > 254) {
		return { isValid: false, error: 'Email quá dài (tối đa 254 ký tự)' }
	}
	
	return { isValid: true, error: null }
}

export const validatePassword = (password: string): ValidationResult => {
	if (!password) {
		return { isValid: false, error: 'Mật khẩu là bắt buộc' }
	}
	
	const errors: string[] = []
	const suggestions: string[] = []
	
	// Length check - increased to 8 characters
	if (password.length < 8) {
		errors.push('Mật khẩu phải có ít nhất 8 ký tự')
	}
	
	if (password.length > 128) {
		errors.push('Mật khẩu quá dài (tối đa 128 ký tự)')
	}
	
	// Character requirements
	if (!/(?=.*[a-z])/.test(password)) {
		errors.push('Phải có ít nhất 1 chữ thường')
		suggestions.push('Thêm chữ thường (a-z)')
	}
	
	if (!/(?=.*[A-Z])/.test(password)) {
		errors.push('Phải có ít nhất 1 chữ hoa')
		suggestions.push('Thêm chữ hoa (A-Z)')
	}
	
	if (!/(?=.*\d)/.test(password)) {
		errors.push('Phải có ít nhất 1 số')
		suggestions.push('Thêm số (0-9)')
	}
	
	if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
		errors.push('Phải có ít nhất 1 ký tự đặc biệt')
		suggestions.push('Thêm ký tự đặc biệt (!@#$%^&*)')
	}
	
	// Check for Vietnamese characters (có dấu)
	const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/
	if (vietnameseRegex.test(password)) {
		errors.push('Không được chứa ký tự tiếng Việt có dấu')
	}
	
	// Check for spaces
	if (password.includes(' ')) {
		errors.push('Không được chứa khoảng trắng')
	}
	
	// Check for common patterns
	if (/(.)\1{2,}/.test(password)) {
		errors.push('Không được có quá 2 ký tự giống nhau liên tiếp')
	}
	
	if (errors.length > 0) {
		return { 
			isValid: false, 
			error: errors[0], // Show first error
			suggestions 
		}
	}
	
	return { isValid: true, error: null }
}

export const validateName = (name: string, fieldName: string = 'Tên'): ValidationResult => {
	if (!name) {
		return { isValid: false, error: `${fieldName} là bắt buộc` }
	}
	
	if (name.length < 2) {
		return { isValid: false, error: `${fieldName} phải có ít nhất 2 ký tự` }
	}
	
	if (name.length > 50) {
		return { isValid: false, error: `${fieldName} quá dài (tối đa 50 ký tự)` }
	}
	
	// Check for valid name characters (letters, spaces, hyphens, apostrophes)
	const nameRegex = /^[a-zA-ZàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ\s'-]+$/
	if (!nameRegex.test(name)) {
		return { 
			isValid: false, 
			error: `${fieldName} chỉ được chứa chữ cái, khoảng trắng, dấu gạch ngang và dấu nháy`
		}
	}
	
	return { isValid: true, error: null }
}

export const validateUsername = (username: string): ValidationResult => {
	if (!username) {
		return { isValid: false, error: 'Tên đăng nhập là bắt buộc' }
	}
	
	if (username.length < 3) {
		return { isValid: false, error: 'Tên đăng nhập phải có ít nhất 3 ký tự' }
	}
	
	if (username.length > 30) {
		return { isValid: false, error: 'Tên đăng nhập quá dài (tối đa 30 ký tự)' }
	}
	
	// Username can contain letters, numbers, underscores, and hyphens
	const usernameRegex = /^[a-zA-Z0-9_-]+$/
	if (!usernameRegex.test(username)) {
		return { 
			isValid: false, 
			error: 'Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới và dấu gạch ngang',
			suggestions: ['Ví dụ: user123, my_username, user-name']
		}
	}
	
	// Must start with letter or number
	if (!/^[a-zA-Z0-9]/.test(username)) {
		return { isValid: false, error: 'Tên đăng nhập phải bắt đầu bằng chữ cái hoặc số' }
	}
	
	return { isValid: true, error: null }
}

export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
	if (!confirmPassword) {
		return { isValid: false, error: 'Vui lòng xác nhận mật khẩu' }
	}
	
	if (password !== confirmPassword) {
		return { isValid: false, error: 'Mật khẩu không khớp' }
	}
	
	return { isValid: true, error: null }
}

export const checkPasswordStrength = (password: string): 'weak' | 'fair' | 'good' | 'strong' => {
	if (!password) return 'weak'
	
	let score = 0
	
	// Length check
	if (password.length >= 8) score += 1
	if (password.length >= 12) score += 1
	
	// Character variety checks
	if (/[a-z]/.test(password)) score += 1
	if (/[A-Z]/.test(password)) score += 1
	if (/[0-9]/.test(password)) score += 1
	if (/[^a-zA-Z0-9]/.test(password)) score += 1
	
	// Penalty for Vietnamese characters or spaces
	const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/
	if (vietnameseRegex.test(password) || password.includes(' ')) {
		score = Math.max(0, score - 2) // Heavy penalty
	}
	
	if (score <= 2) return 'weak'
	if (score <= 4) return 'fair'
	if (score <= 5) return 'good'
	return 'strong'
}

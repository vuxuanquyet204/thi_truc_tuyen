/// Validators for form inputs
library;

/// Email validation — supports SIS/HUST emails
bool isValidEmail(String? value) {
  if (value == null || value.trim().isEmpty) return false;
  return RegExp(r'^[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}$').hasMatch(value.trim());
}

bool isValidSISEmail(String? value) {
  if (value == null || value.trim().isEmpty) return false;
  return RegExp(r'^[\w.+-]+@sis\.hust\.edu\.vn$', caseSensitive: false)
      .hasMatch(value.trim());
}

/// Phone validation — Vietnamese format
bool isValidPhone(String? value) {
  if (value == null || value.trim().isEmpty) return false;
  final cleaned = value.replaceAll(RegExp(r'[\s\-\(\)]'), '');
  return RegExp(r'^(0[0-9]{9}|84[0-9]{9})$').hasMatch(cleaned);
}

/// OTP validation
bool isValidOTP(String? value, {int length = 6}) {
  if (value == null) return false;
  return value.length == length && RegExp(r'^[0-9]+$').hasMatch(value);
}

/// Password validation
ValidationResult validatePassword(String? value) {
  if (value == null || value.isEmpty) {
    return const ValidationResult(success: false, message: 'Vui lòng nhập mật khẩu');
  }
  if (value.length < 8) {
    return const ValidationResult(
        success: false, message: 'Mật khẩu phải có ít nhất 8 ký tự');
  }
  if (!RegExp(r'[A-Z]').hasMatch(value)) {
    return const ValidationResult(
        success: false, message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa');
  }
  if (!RegExp(r'[0-9]').hasMatch(value)) {
    return const ValidationResult(
        success: false, message: 'Mật khẩu phải chứa ít nhất 1 số');
  }
  return const ValidationResult(success: true);
}

/// MSSV (Student ID) validation — HUST format
bool isValidMSSV(String? value) {
  if (value == null || value.trim().isEmpty) return false;
  return RegExp(r'^[0-9]{8,10}$').hasMatch(value.trim());
}

/// Name validation
ValidationResult validateName(String? value) {
  if (value == null || value.trim().isEmpty) {
    return const ValidationResult(
        success: false, message: 'Vui lòng nhập họ và tên');
  }
  if (value.trim().length < 2) {
    return const ValidationResult(
        success: false, message: 'Tên phải có ít nhất 2 ký tự');
  }
  if (!RegExp(r'^[a-zA-ZÀ-ỹ\s]+$').hasMatch(value.trim())) {
    return const ValidationResult(
        success: false, message: 'Tên không được chứa ký tự đặc biệt');
  }
  return const ValidationResult(success: true);
}

/// Score validation
bool isValidScore(int? score, {int max = 100, int min = 0}) {
  if (score == null) return false;
  return score >= min && score <= max;
}

/// Token amount validation
bool isValidTokenAmount(int? amount, {int minBalance = 0}) {
  if (amount == null || amount < 0) return false;
  return amount >= minBalance;
}

/// Validation result
class ValidationResult {
  const ValidationResult({required this.success, this.message});

  final bool success;
  final String? message;

  @override
  String toString() => message ?? '';
}

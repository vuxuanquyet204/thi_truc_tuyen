/// API Endpoint definitions - Academic Luminary
abstract final class ApiEndpoints {
  ApiEndpoints._();

  // ==================== AUTH ====================
  static const String login = '/auth/login';
  static const String verifyOTP = '/auth/verify-otp';
  static const String resendOTP = '/auth/resend-otp';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refresh';

  // ==================== USER ====================
  static const String userProfile = '/users/profile';
  static const String updateProfile = '/users/profile';
  static const String changePassword = '/users/password';
  static const String uploadAvatar = '/users/avatar';

  // ==================== EXAMS ====================
  static const String exams = '/exams';
  static const String examDetail = '/exams/{id}';
  static const String startExam = '/exams/{id}/start';
  static const String submitExam = '/exams/{id}/submit';
  static const String examQuestions = '/exams/{id}/questions';
  static const String examProgress = '/exams/{id}/progress';

  // ==================== RESULTS ====================
  static const String results = '/results';
  static const String resultDetail = '/results/{id}';
  static const String resultCertificate = '/results/{id}/certificate';

  // ==================== LEARNTOKEN ====================
  static const String tokenBalance = '/tokens/balance';
  static const String tokenHistory = '/tokens/history';
  static const String tokenRedeem = '/tokens/redeem';
  static const String rewards = '/rewards';
  static const String rewardDetail = '/rewards/{id}';

  // ==================== PROCTORING ====================
  static const String proctorSessions = '/proctoring/sessions';
  static const String proctorSessionDetail = '/proctoring/sessions/{id}';
  static const String proctorAlerts = '/proctoring/alerts';
  static const String proctorResolve = '/proctoring/alerts/{id}/resolve';

  // ==================== ADMIN ====================
  static const String adminStats = '/admin/stats';
  static const String adminCandidates = '/admin/candidates';
  static const String adminExams = '/admin/exams';
  static const String adminTokens = '/admin/tokens';
  static const String adminAuditLog = '/admin/audit-log';

  // ==================== CERTIFICATES ====================
  static const String certificates = '/certificates';
  static const String certificateDetail = '/certificates/{id}';

  /// Replace path parameter in endpoint
  static String replacePathParam(String endpoint, String param, dynamic value) {
    return endpoint.replaceAll('{$param}', value.toString());
  }
}
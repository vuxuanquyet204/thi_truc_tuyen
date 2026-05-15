/// App Configuration - Academic Luminary
abstract final class AppConfig {
  AppConfig._();

  /// App name
  static const String appName = 'Academic Luminary';

  /// Base URL for API
  /// TODO: Replace with actual backend URL
  static const String baseURL = 'https://api.academicluminary.edu.vn';

  /// API version prefix
  static const String apiVersion = '/api/v1';

  /// Full API base URL
  static String get apiBaseURL => '$baseURL$apiVersion';

  /// Timeout durations
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  /// OTP verification
  static const int otpLength = 6;
  static const Duration otpExpiry = Duration(minutes: 5);
  static const int otpMaxAttempts = 5;

  /// Exam session
  static const Duration examAutoSaveInterval = Duration(seconds: 30);

  /// Pagination
  static const int defaultPageSize = 20;

  /// Debug mode
  static const bool isDebug = true;
}
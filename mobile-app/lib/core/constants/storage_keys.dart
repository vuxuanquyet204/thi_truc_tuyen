/// Secure storage keys for sensitive data
abstract final class StorageKeys {
  StorageKeys._();

  static const String accessToken = 'access_token';
  static const String refreshToken = 'refresh_token';
  static const String userId = 'user_id';
  static const String userRole = 'user_role';
  static const String tokenExpiry = 'token_expiry';

  /// All keys as list for batch operations
  static const List<String> authKeys = [
    accessToken,
    refreshToken,
    userId,
    userRole,
    tokenExpiry,
  ];

  /// Clear all auth keys
  static Future<void> clearAuth() async {
    // Implemented in secure_storage.dart
  }
}
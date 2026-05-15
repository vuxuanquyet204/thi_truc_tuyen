import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/constants/storage_keys.dart';

/// Secure storage service for sensitive data (tokens, credentials)
class SecureStorageService {
  SecureStorageService._();

  static final _instance = SecureStorageService._();
  static SecureStorageService get instance => _instance;

  final FlutterSecureStorage _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );

  // ==================== TOKEN OPERATIONS ====================

  Future<void> saveAccessToken(String token) async {
    await _storage.write(key: StorageKeys.accessToken, value: token);
  }

  Future<String?> getAccessToken() async {
    return _storage.read(key: StorageKeys.accessToken);
  }

  Future<void> saveRefreshToken(String token) async {
    await _storage.write(key: StorageKeys.refreshToken, value: token);
  }

  Future<String?> getRefreshToken() async {
    return _storage.read(key: StorageKeys.refreshToken);
  }

  Future<void> saveTokenExpiry(DateTime expiry) async {
    await _storage.write(
      key: StorageKeys.tokenExpiry,
      value: expiry.toIso8601String(),
    );
  }

  Future<DateTime?> getTokenExpiry() async {
    final value = await _storage.read(key: StorageKeys.tokenExpiry);
    if (value == null) return null;
    return DateTime.tryParse(value);
  }

  // ==================== USER INFO ====================

  Future<void> saveUserId(String userId) async {
    await _storage.write(key: StorageKeys.userId, value: userId);
  }

  Future<String?> getUserId() async {
    return _storage.read(key: StorageKeys.userId);
  }

  Future<void> saveUserRole(String role) async {
    await _storage.write(key: StorageKeys.userRole, value: role);
  }

  Future<String?> getUserRole() async {
    return _storage.read(key: StorageKeys.userRole);
  }

  // ==================== BATCH OPERATIONS ====================

  Future<void> saveAuthData({
    required String accessToken,
    required String refreshToken,
    required String userId,
    required String role,
    required DateTime tokenExpiry,
  }) async {
    await Future.wait([
      saveAccessToken(accessToken),
      saveRefreshToken(refreshToken),
      saveUserId(userId),
      saveUserRole(role),
      saveTokenExpiry(tokenExpiry),
    ]);
  }

  Future<bool> hasValidToken() async {
    final token = await getAccessToken();
    final expiry = await getTokenExpiry();
    return token != null && token.isNotEmpty && expiry != null && expiry.isAfter(DateTime.now());
  }

  // ==================== CLEAR ====================

  Future<void> clearAuthData() async {
    await _storage.deleteAll();
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
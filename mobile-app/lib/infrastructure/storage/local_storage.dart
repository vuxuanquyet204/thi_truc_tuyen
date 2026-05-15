import 'package:shared_preferences/shared_preferences.dart';

/// Local storage service for non-sensitive data (preferences, cache)
class LocalStorageService {
  LocalStorageService._();

  static LocalStorageService? _instance;
  static LocalStorageService get instance {
    _instance ??= LocalStorageService._();
    return _instance!;
  }

  SharedPreferences? _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  SharedPreferences get _safePrefs {
    if (_prefs == null) {
      throw StateError('LocalStorage not initialized. Call init() first.');
    }
    return _prefs!;
  }

  // ==================== STRING ====================

  Future<bool> setString(String key, String value) async {
    return _safePrefs.setString(key, value);
  }

  String? getString(String key) {
    return _safePrefs.getString(key);
  }

  // ==================== INT ====================

  Future<bool> setInt(String key, int value) async {
    return _safePrefs.setInt(key, value);
  }

  int? getInt(String key) {
    return _safePrefs.getInt(key);
  }

  // ==================== BOOL ====================

  Future<bool> setBool(String key, bool value) async {
    return _safePrefs.setBool(key, value);
  }

  bool? getBool(String key) {
    return _safePrefs.getBool(key);
  }

  // ==================== DOUBLE ====================

  Future<bool> setDouble(String key, double value) async {
    return _safePrefs.setDouble(key, value);
  }

  double? getDouble(String key) {
    return _safePrefs.getDouble(key);
  }

  // ==================== STRING LIST ====================

  Future<bool> setStringList(String key, List<String> value) async {
    return _safePrefs.setStringList(key, value);
  }

  List<String>? getStringList(String key) {
    return _safePrefs.getStringList(key);
  }

  // ==================== REMOVE & CLEAR ====================

  Future<bool> remove(String key) async {
    return _safePrefs.remove(key);
  }

  Future<bool> clear() async {
    return _safePrefs.clear();
  }

  // ==================== HELPERS ====================

  bool hasKey(String key) {
    return _safePrefs.containsKey(key);
  }
}

// Storage keys for local preferences
abstract final class LocalKeys {
  LocalKeys._();

  static const String onboardingComplete = 'onboarding_complete';
  static const String themeMode = 'theme_mode';
  static const String locale = 'locale';
  static const String notificationEnabled = 'notification_enabled';
  static const String lastSyncTime = 'last_sync_time';
}
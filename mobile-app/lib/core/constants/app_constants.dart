/// App-wide constants
abstract final class AppConstants {
  AppConstants._();

  /// App version
  static const String appVersion = '1.0.0';

  /// App build number
  static const int buildNumber = 1;

  /// Default locale
  static const String defaultLocale = 'vi';

  /// Supported locales
  static const List<String> supportedLocales = ['vi', 'en'];

  /// Animation durations
  static const Duration animationFast = Duration(milliseconds: 150);
  static const Duration animationMedium = Duration(milliseconds: 300);
  static const Duration animationSlow = Duration(milliseconds: 500);

  /// Debounce durations
  static const Duration debounceShort = Duration(milliseconds: 300);
  static const Duration debounceLong = Duration(milliseconds: 500);

  /// Storage keys prefix
  static const String storagePrefix = 'al_';

  /// Image placeholders
  static const String avatarPlaceholder =
      'https://via.placeholder.com/150/F3FAFF/003178?text=U';

  /// Date formats
  static const String dateFormatFull = 'dd MMMM yyyy';
  static const String dateFormatShort = 'dd/MM/yyyy';
  static const String dateFormatTime = 'HH:mm';
  static const String dateFormatDateTime = 'dd/MM/yyyy HH:mm';

  /// Exam duration limits (minutes)
  static const int examMinDuration = 15;
  static const int examMaxDuration = 180;

  /// Score thresholds
  static const double passThreshold = 0.5; // 50%
  static const double distinctionThreshold = 0.9; // 90%
}
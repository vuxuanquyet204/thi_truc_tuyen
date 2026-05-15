/// Academic Luminary Spacing System
/// Based on 8px grid scale for consistent rhythm
abstract final class AppSpacing {
  AppSpacing._();

  // Base unit
  static const double unit = 8.0;

  // Spacing scale
  static const double xxs = 2.0;   // 2px
  static const double xs = 4.0;    // 4px
  static const double sm = 8.0;    // 8px
  static const double md = 12.0;   // 12px
  static const double base = 16.0;  // 16px (default)
  static const double lg = 20.0;   // 20px
  static const double xl = 24.0;   // 24px
  static const double xxl = 32.0;  // 32px
  static const double xxxl = 40.0; // 40px
  static const double huge = 48.0; // 48px - standard card padding
  static const double massive = 64.0; // 64px
  static const double giant = 80.0; // 80px

  // Padding presets
  static const double cardPadding = 24.0; // xl
  static const double screenPadding = 24.0; // xl
  static const double sectionGap = 32.0; // xxl
  static const double pageGap = 48.0; // huge

  // Icon sizes
  static const double iconSm = 16.0;
  static const double iconMd = 20.0;
  static const double iconLg = 24.0;
  static const double iconXl = 32.0;
  static const double iconXxl = 48.0;
  static const double iconGiant = 64.0;

  // Avatar sizes
  static const double avatarSm = 32.0;
  static const double avatarMd = 40.0;
  static const double avatarLg = 64.0;
  static const double avatarXl = 80.0;
  static const double avatarXxl = 128.0;

  // Screen padding helpers
  static const double safeAreaTop = 44.0;
  static const double bottomNavHeight = 80.0;
  static const double appBarHeight = 64.0;
  static const double progressRibbonHeight = 4.0;
}

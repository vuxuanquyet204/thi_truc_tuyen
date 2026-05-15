import 'package:flutter/material.dart';

/// Academic Luminary Color Palette
/// Based on the "Editorial Institution" design system
/// NO pure black for text — always use onSurface (#071e27)
abstract final class AppColors {
  AppColors._();

  // ==================== PRIMARY ====================
  /// Deep Blue - trust, authority, institutional feel
  static const Color primary = Color(0xFF003178);

  /// Primary Container - darker variant for gradients
  static const Color primaryContainer = Color(0xFF0D47A1);

  /// On Primary - white text on primary
  static const Color onPrimary = Color(0xFFFFFFFF);

  /// On Primary Container - text on container backgrounds
  static const Color onPrimaryContainer = Color(0xFFA1BBFF);

  /// Primary Fixed - soft primary for subtle highlights
  static const Color primaryFixed = Color(0xFFD9E2FF);

  /// Primary Fixed Dim - dimmed primary for subtle states
  static const Color primaryFixedDim = Color(0xFFB0C6FF);

  // ==================== SURFACE (Background Hierarchy) ====================
  /// Base background - lightest layer
  static const Color surface = Color(0xFFF3FAFF);

  /// Surface Container - secondary area
  static const Color surfaceContainer = Color(0xFFDBF1FE);

  /// Surface Container High - active component area
  static const Color surfaceContainerHigh = Color(0xFFD5ECF8);

  /// Surface Container Highest - navigation tint, selected states
  static const Color surfaceContainerHighest = Color(0xFFCFE6F2);

  /// Surface Container Low - secondary area (light)
  static const Color surfaceContainerLow = Color(0xFFE6F6FF);

  /// Surface Container Lowest - floating elements (white)
  static const Color surfaceContainerLowest = Color(0xFFFFFFFF);

  /// Surface Dim - dimmed surface for depth contrast
  static const Color surfaceDim = Color(0xFFC7DDE9);

  /// Surface Bright - brightest surface
  static const Color surfaceBright = Color(0xFFF3FAFF);

  /// Background - alias for surface
  static const Color background = Color(0xFFF3FAFF);

  // ==================== TEXT ====================
  /// On Surface - PRIMARY text color (NOT pure black)
  static const Color onSurface = Color(0xFF071E27);

  /// On Surface Variant - secondary text, labels
  static const Color onSurfaceVariant = Color(0xFF434652);

  /// On Background - text on background
  static const Color onBackground = Color(0xFF071E27);

  // ==================== SECONDARY (Achievement Teal) ====================
  /// Secondary - growth, success, achievement
  static const Color secondary = Color(0xFF006A6A);

  /// Secondary Container - soft teal background
  static const Color secondaryContainer = Color(0xFF90EFEF);

  /// On Secondary - white text on secondary
  static const Color onSecondary = Color(0xFFFFFFFF);

  /// On Secondary Container - text on teal backgrounds
  static const Color onSecondaryContainer = Color(0xFF006E6E);

  /// Secondary Fixed - fixed teal
  static const Color secondaryFixed = Color(0xFF93F2F2);

  /// Secondary Fixed Dim - dimmed fixed teal
  static const Color secondaryFixedDim = Color(0xFF76D6D5);

  /// On Secondary Fixed Variant - text on fixed variants
  static const Color onSecondaryFixedVariant = Color(0xFF004F4F);

  /// On Secondary Fixed - text on fixed secondary
  static const Color onSecondaryFixed = Color(0xFF002020);

  // ==================== TERTIARY / LEARNTOKEN (Achievement Gold) ====================
  /// Tertiary - bronze/dark gold for backgrounds
  static const Color tertiary = Color(0xFF453200);

  /// Tertiary Container - dark gold background
  static const Color tertiaryContainer = Color(0xFF614800);

  /// On Tertiary - white text on tertiary
  static const Color onTertiary = Color(0xFFFFFFFF);

  /// On Tertiary Fixed - text on fixed tertiary
  static const Color onTertiaryFixed = Color(0xFF261A00);

  /// Tertiary Fixed - light gold for backgrounds
  static const Color tertiaryFixed = Color(0xFFFFDF9E);

  /// Tertiary Fixed Dim - THE KEY GOLD for LearnToken
  /// USED ONLY for: LearnToken badges, achievement buttons, reward states
  static const Color tertiaryFixedDim = Color(0xFFFABD00);

  /// On Tertiary Fixed Variant - THE KEY GOLD TEXT
  static const Color onTertiaryFixedVariant = Color(0xFF5B4300);

  /// On Tertiary Container - text on tertiary container
  static const Color onTertiaryContainer = Color(0xFFEEB300);

  // ==================== ERROR ====================
  /// Error - alerts, failures, warnings
  static const Color error = Color(0xFFBA1A1A);

  /// Error Container - soft error background
  static const Color errorContainer = Color(0xFFFFDAD6);

  /// On Error - white text on error
  static const Color onError = Color(0xFFFFFFFF);

  /// On Error Container - text on error container
  static const Color onErrorContainer = Color(0xFF93000A);

  // ==================== OUTLINES ====================
  /// Outline - subtle borders (use sparingly)
  static const Color outline = Color(0xFF737783);

  /// Outline Variant - Ghost border fallback (15% opacity equivalent)
  /// USE ONLY when accessibility requires boundary definition
  static const Color outlineVariant = Color(0xFFC3C6D4);

  // ==================== INVERSE ====================
  /// Inverse Surface - dark backgrounds for contrast
  static const Color inverseSurface = Color(0xFF1E333C);

  /// Inverse On Surface - light text on dark backgrounds
  static const Color inverseOnSurface = Color(0xFFDFF4FF);

  /// Inverse Primary - primary on dark backgrounds
  static const Color inversePrimary = Color(0xFFB0C6FF);

  /// Surface Tint - tint overlay for depth
  static const Color surfaceTint = Color(0xFF2B5BB5);

  // ==================== GRADIENTS ====================
  /// Hero gradient: primary → primaryContainer at 135°
  static const LinearGradient heroGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary, primaryContainer],
  );

  /// Gold gradient for LearnToken hero sections
  static const LinearGradient goldGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [tertiaryFixed, tertiaryFixedDim],
  );

  // ==================== SHADOWS ====================
  /// Ambient shadow for floating elements
  /// BoxShadow(color: AppColors.onSurface.withValues(alpha: 0.06), blurRadius: 40, offset: Offset(0, 12))
  static List<BoxShadow> get ambientShadow => [
        BoxShadow(
          color: onSurface.withValues(alpha: 0.06),
          blurRadius: 40,
          offset: const Offset(0, 12),
        ),
      ];

  /// Soft shadow for cards
  static List<BoxShadow> get cardShadow => [
        BoxShadow(
          color: onSurface.withValues(alpha: 0.04),
          blurRadius: 12,
          offset: const Offset(0, 4),
        ),
      ];

  /// Glow shadow for secondary/teal elements
  static List<BoxShadow> get secondaryGlow => [
        BoxShadow(
          color: secondary.withValues(alpha: 0.3),
          blurRadius: 8,
          spreadRadius: 0,
        ),
      ];

  /// Glow shadow for error/flagged elements
  static List<BoxShadow> get errorGlow => [
        BoxShadow(
          color: error.withValues(alpha: 0.4),
          blurRadius: 12,
          spreadRadius: 0,
        ),
      ];
}

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// Typography System - Academic Luminary
/// Dual-font strategy:
/// - Manrope: Headlines, Display (editorial, authoritative)
/// - Inter: Body, Labels (legible, functional)
abstract final class AppTypography {
  AppTypography._();

  // ==================== MANROPE (Headlines) ====================

  /// Display Large - 57px ExtraBold, editorial headlines
  static TextStyle get displayLarge => GoogleFonts.manrope(
        fontSize: 57,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.02,
        color: AppColors.onSurface,
      );

  /// Display Medium - 45px ExtraBold
  static TextStyle get displayMedium => GoogleFonts.manrope(
        fontSize: 45,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.02,
        color: AppColors.onSurface,
      );

  /// Display Small - 36px ExtraBold
  static TextStyle get displaySmall => GoogleFonts.manrope(
        fontSize: 36,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.02,
        color: AppColors.onSurface,
      );

  /// Headline Large - 32px ExtraBold
  static TextStyle get headlineLarge => GoogleFonts.manrope(
        fontSize: 32,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.02,
        color: AppColors.onSurface,
      );

  /// Headline Medium - 28px Bold
  static TextStyle get headlineMedium => GoogleFonts.manrope(
        fontSize: 28,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.02,
        color: AppColors.onSurface,
      );

  /// Headline Small - 24px Bold
  static TextStyle get headlineSmall => GoogleFonts.manrope(
        fontSize: 24,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.01,
        color: AppColors.onSurface,
      );

  /// Title Large - 22px Bold (Manrope)
  static TextStyle get titleLarge => GoogleFonts.manrope(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        color: AppColors.onSurface,
      );

  /// Title Medium - 16px SemiBold (Manrope)
  static TextStyle get titleMedium => GoogleFonts.manrope(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: AppColors.onSurface,
      );

  // ==================== INTER (Body & Labels) ====================

  /// Title Small - 14px SemiBold
  static TextStyle get titleSmall => GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AppColors.onSurface,
      );

  /// Body Large - 16px Regular
  static TextStyle get bodyLarge => GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: AppColors.onSurface,
      );

  /// Body Medium - 14px Regular
  static TextStyle get bodyMedium => GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: AppColors.onSurface,
      );

  /// Body Small - 12px Regular, for secondary text
  static TextStyle get bodySmall => GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: AppColors.onSurfaceVariant,
      );

  /// Label Large - 14px SemiBold (buttons)
  static TextStyle get labelLarge => GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AppColors.onSurface,
      );

  /// Label Medium - 12px Medium (chips, tags)
  static TextStyle get labelMedium => GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: AppColors.onSurfaceVariant,
      );

  /// Label Small - 11px Medium, uppercase tracking
  static TextStyle get labelSmall => GoogleFonts.inter(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
        color: AppColors.onSurfaceVariant,
      );

  /// Label Small Bold - 11px SemiBold uppercase
  static TextStyle get labelSmallBold => GoogleFonts.inter(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.5,
        color: AppColors.onSurfaceVariant,
      );

  // ==================== SPECIAL STYLES ====================

  /// LearnToken Balance - 5xl ExtraBold
  static TextStyle get tokenBalance => GoogleFonts.manrope(
        fontSize: 48,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.02,
        color: AppColors.onTertiaryFixedVariant,
      );

  /// Score Display - 7xl ExtraBold for exam scores
  static TextStyle get scoreDisplay => GoogleFonts.manrope(
        fontSize: 72,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.02,
        color: AppColors.primary,
      );

  /// Date Number - 2xl ExtraBold for calendar dates
  static TextStyle get dateNumber => GoogleFonts.manrope(
        fontSize: 24,
        fontWeight: FontWeight.w800,
        color: AppColors.onSurface,
      );

  /// Editorial Text - headline with tighter tracking
  static TextStyle editorialText(String text) => GoogleFonts.manrope(
        fontSize: 40,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.02,
        color: AppColors.primary,
        height: 1.1,
      );

  // ==================== THEME DATA ====================

  /// Build complete TextTheme for ThemeData
  static TextTheme get textTheme => TextTheme(
        displayLarge: displayLarge,
        displayMedium: displayMedium,
        displaySmall: displaySmall,
        headlineLarge: headlineLarge,
        headlineMedium: headlineMedium,
        headlineSmall: headlineSmall,
        titleLarge: titleLarge,
        titleMedium: titleMedium,
        titleSmall: titleSmall,
        bodyLarge: bodyLarge,
        bodyMedium: bodyMedium,
        bodySmall: bodySmall,
        labelLarge: labelLarge,
        labelMedium: labelMedium,
        labelSmall: labelSmall,
      );
}

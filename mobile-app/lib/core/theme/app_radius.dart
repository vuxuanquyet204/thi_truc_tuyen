import 'package:flutter/material.dart';

/// Academic Luminary Border Radius System
/// Three tiers: Candidate (breathable) / Admin (dense) / Special (glassmorphism)
abstract final class AppRadius {
  AppRadius._();

  // ==================== CANDIDATE (Breathable) ====================
  /// Default small radius
  static const double sm = 4.0;

  /// Medium radius
  static const double md = 8.0;

  /// Large radius (candidate cards)
  static const double lg = 12.0;

  /// XL radius (notification banners)
  static const double xl = 16.0;

  /// Full pill shape (buttons, chips)
  static const double full = 9999.0;

  // ==================== SPECIAL COMPONENTS ====================
  /// Extra large for glass panels and hero cards
  static const double glassXl = 24.0;

  /// Bento grid cards (admin)
  static const double bentoCard = 32.0;

  /// Bottom navigation rounded top
  static const double bottomNav = 24.0;

  /// Profile avatar
  static const double avatar = 9999.0;

  /// Progress ribbon
  static const double ribbon = 0.0;

  // ==================== PREDEFINED BORDERRADIUS ====================

  static BorderRadius get radiusSm => BorderRadius.circular(sm);
  static BorderRadius get radiusMd => BorderRadius.circular(md);
  static BorderRadius get radiusLg => BorderRadius.circular(lg);
  static BorderRadius get radiusXl => BorderRadius.circular(xl);
  static BorderRadius get radiusFull => BorderRadius.circular(full);
  static BorderRadius get radiusGlassXl => BorderRadius.circular(glassXl);
  static BorderRadius get radiusBento => BorderRadius.circular(bentoCard);
  static BorderRadius get radiusBottomNav => const BorderRadius.only(
        topLeft: Radius.circular(bottomNav),
        topRight: Radius.circular(bottomNav),
      );

  // Card radius for candidate (lg = 12px)
  static BorderRadius get cardRadius => BorderRadius.circular(lg);

  // Card radius for admin (md = 8px) - denser
  static BorderRadius get adminCardRadius => BorderRadius.circular(md);

  // Pill button radius
  static BorderRadius get pillRadius => BorderRadius.circular(full);

  // Input field radius
  static BorderRadius get inputRadius => BorderRadius.circular(xl);
}

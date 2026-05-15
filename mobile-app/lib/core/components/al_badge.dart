import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';

/// Academic Luminary Badge Component
/// Used for status labels, achievement badges, category tags
enum ALBadgeVariant {
  primary,
  secondary,
  tertiary,
  success,
  warning,
  error,
  neutral,
}

class ALBadge extends StatelessWidget {
  const ALBadge({
    super.key,
    required this.label,
    this.variant = ALBadgeVariant.neutral,
    this.icon,
    this.onTap,
    this.small = false,
  });

  final String label;
  final ALBadgeVariant variant;
  final IconData? icon;
  final VoidCallback? onTap;
  final bool small;

  (Color, Color) get _colors => switch (variant) {
        ALBadgeVariant.primary => (AppColors.primary, AppColors.onPrimary),
        ALBadgeVariant.secondary => (AppColors.secondary, AppColors.onSecondary),
        ALBadgeVariant.tertiary => (AppColors.tertiaryFixedDim, AppColors.onTertiaryFixed),
        ALBadgeVariant.success => (AppColors.secondaryContainer, AppColors.onSecondaryContainer),
        ALBadgeVariant.warning => (AppColors.tertiaryFixedDim, AppColors.onTertiaryFixed),
        ALBadgeVariant.error => (AppColors.errorContainer, AppColors.onErrorContainer),
        ALBadgeVariant.neutral => (AppColors.surfaceContainerHighest, AppColors.onSurfaceVariant),
      };

  @override
  Widget build(BuildContext context) {
    final (bg, text) = _colors;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: small ? 6 : 10,
          vertical: small ? 3 : 5,
        ),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: AppRadius.radiusFull,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: small ? 10 : 12, color: text),
              SizedBox(width: small ? 3 : 4),
            ],
            Text(
              label.toUpperCase(),
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: small ? 8 : 10,
                fontWeight: FontWeight.w700,
                color: text,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Score badge — large display for result scores
class ALScoreBadge extends StatelessWidget {
  const ALScoreBadge({
    super.key,
    required this.score,
    this.maxScore = 100,
  });

  final int score;
  final int maxScore;

  Color get _badgeColor {
    if (score >= 90) return AppColors.secondary;
    if (score >= 70) return AppColors.primary;
    return AppColors.error;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 60,
      height: 60,
      decoration: BoxDecoration(
        color: _badgeColor.withValues(alpha: 0.1),
        borderRadius: AppRadius.radiusMd,
      ),
      child: Center(
        child: Text(
          '$score%',
          style: TextStyle(
            fontFamily: 'Manrope',
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: _badgeColor,
          ),
        ),
      ),
    );
  }
}
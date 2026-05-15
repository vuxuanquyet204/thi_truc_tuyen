import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';

/// Academic Luminary Status Chip Component
/// NO solid borders — uses color fills and pill shapes
class ALChip extends StatelessWidget {
  const ALChip({
    super.key,
    required this.label,
    this.variant = ALChipVariant.neutral,
    this.icon,
    this.size,
    this.pulse = false,
  });

  final String label;
  final ALChipVariant variant;
  final IconData? icon;
  final ALChipSize? size;
  final bool pulse;

  @override
  Widget build(BuildContext context) {
    final chipSize = size ?? ALChipSize.medium;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: chipSize.horizontalPadding,
        vertical: chipSize.verticalPadding,
      ),
      decoration: BoxDecoration(
        color: variant.backgroundColor,
        borderRadius: AppRadius.radiusFull,
        boxShadow: pulse ? variant.glowShadow : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (pulse)
            Padding(
              padding: const EdgeInsets.only(right: AppSpacing.xs),
              child: _buildPulsingDot(),
            ),
          if (icon != null) ...[
            Icon(
              icon,
              size: chipSize.iconSize,
              color: variant.textColor,
            ),
            const SizedBox(width: AppSpacing.xs),
          ],
          Text(
            label,
            style: AppTypography.labelMedium.copyWith(
              color: variant.textColor,
              fontWeight: FontWeight.w700,
              fontSize: chipSize.fontSize,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPulsingDot() {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.4, end: 1.0),
      duration: const Duration(milliseconds: 800),
      curve: Curves.easeInOut,
      builder: (context, value, child) {
        return Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(
            color: variant.textColor.withValues(alpha: value),
            shape: BoxShape.circle,
          ),
        );
      },
      onEnd: () {},
    );
  }
}

enum ALChipVariant {
  primary,
  secondary,
  tertiary,
  error,
  neutral,
  achievement,
  active,
  warning,
  flagged;

  Color get backgroundColor => switch (this) {
        primary => AppColors.primary,
        secondary => AppColors.secondary,
        tertiary => AppColors.tertiaryFixedDim,
        error => AppColors.error,
        neutral => AppColors.surfaceContainerLow,
        achievement => AppColors.tertiaryFixed,
        active => AppColors.secondary.withValues(alpha: 0.1),
        warning => AppColors.tertiaryFixedDim,
        flagged => AppColors.error,
      };

  Color get textColor => switch (this) {
        primary => AppColors.onPrimary,
        secondary => AppColors.onSecondary,
        tertiary => AppColors.onTertiaryFixed,
        error => AppColors.onError,
        neutral => AppColors.onSurfaceVariant,
        achievement => AppColors.onTertiaryFixedVariant,
        active => AppColors.secondary,
        warning => AppColors.onTertiaryFixed,
        flagged => AppColors.onError,
      };

  List<BoxShadow>? get glowShadow => switch (this) {
        flagged => [
              BoxShadow(
                color: AppColors.error.withValues(alpha: 0.4),
                blurRadius: 8,
              ),
            ],
        active => [
              BoxShadow(
                color: AppColors.secondary.withValues(alpha: 0.3),
                blurRadius: 8,
              ),
            ],
        _ => null,
      };
}

enum ALChipSize {
  small(8.0, 4.0, 10.0, 14.0),
  medium(12.0, 6.0, 12.0, 16.0),
  large(16.0, 8.0, 14.0, 20.0);

  const ALChipSize(
    this.horizontalPadding,
    this.verticalPadding,
    this.iconSize,
    this.fontSize,
  );

  final double horizontalPadding;
  final double verticalPadding;
  final double iconSize;
  final double fontSize;
}

/// Special chip for LearnToken display
class ALTokenChip extends StatelessWidget {
  const ALTokenChip({
    super.key,
    required this.balance,
    this.icon = Icons.stars,
    this.size,
  });

  final String balance;
  final IconData? icon;
  final ALChipSize? size;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: AppColors.tertiaryFixedDim,
        borderRadius: AppRadius.radiusFull,
        border: Border.all(
          color: AppColors.tertiaryFixedDim.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: AppSpacing.iconSm,
            color: AppColors.onTertiaryFixed,
          ),
          const SizedBox(width: AppSpacing.xs),
          Text(
            balance,
            style: AppTypography.labelLarge.copyWith(
              color: AppColors.onTertiaryFixed,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';

/// ALButton variants following Academic Luminary design system
enum ALButtonVariant { primary, secondary, achievement }

/// Academic Luminary Button Component
/// Three variants: primary, secondary, achievement (LearnToken gold)
class ALButton extends StatelessWidget {
  const ALButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = ALButtonVariant.primary,
    this.icon,
    this.isLoading = false,
    this.isFullWidth = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final ALButtonVariant variant;
  final IconData? icon;
  final bool isLoading;
  final bool isFullWidth;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: isFullWidth ? double.infinity : null,
      child: _buildButton(),
    );
  }

  Widget _buildButton() {
    return switch (variant) {
      ALButtonVariant.primary => _buildPrimary(),
      ALButtonVariant.secondary => _buildSecondary(),
      ALButtonVariant.achievement => _buildAchievement(),
    };
  }

  Widget _buildPrimary() => ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.onPrimary,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.xl,
            vertical: AppSpacing.md,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: AppRadius.radiusFull,
          ),
        ),
        child: _buildContent(AppColors.onPrimary),
      );

  Widget _buildSecondary() => ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.secondaryContainer,
          foregroundColor: AppColors.onSecondaryContainer,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.xl,
            vertical: AppSpacing.md,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: AppRadius.radiusFull,
          ),
        ),
        child: _buildContent(AppColors.onSecondaryContainer),
      );

  Widget _buildAchievement() => ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.tertiaryFixedDim,
          foregroundColor: AppColors.onTertiaryFixed,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.xl,
            vertical: AppSpacing.md,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: AppRadius.radiusFull,
          ),
        ),
        child: _buildContent(AppColors.onTertiaryFixed),
      );

  Widget _buildContent(Color textColor) {
    if (isLoading) {
      return SizedBox(
        height: 20,
        width: 20,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(textColor),
        ),
      );
    }

    if (icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: AppSpacing.iconMd),
          const SizedBox(width: AppSpacing.sm),
          Text(
            label,
            style: AppTypography.labelLarge.copyWith(
              color: textColor,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      );
    }

    return Text(
      label,
      style: AppTypography.labelLarge.copyWith(
        color: textColor,
        fontWeight: FontWeight.w700,
      ),
    );
  }
}

/// ALIconButton - circular icon button variant
class ALIconButton extends StatelessWidget {
  const ALIconButton({
    super.key,
    required this.icon,
    required this.onPressed,
    this.variant = ALButtonVariant.primary,
    this.size = 48,
  });

  final IconData icon;
  final VoidCallback? onPressed;
  final ALButtonVariant variant;
  final double size;

  Color get _backgroundColor => switch (variant) {
        ALButtonVariant.primary => AppColors.primary,
        ALButtonVariant.secondary => AppColors.secondaryContainer,
        ALButtonVariant.achievement => AppColors.tertiaryFixedDim,
      };

  Color get _iconColor => switch (variant) {
        ALButtonVariant.primary => AppColors.onPrimary,
        ALButtonVariant.secondary => AppColors.onSecondaryContainer,
        ALButtonVariant.achievement => AppColors.onTertiaryFixed,
      };

  @override
  Widget build(BuildContext context) {
    return Material(
      color: _backgroundColor,
      shape: const CircleBorder(),
      child: InkWell(
        onTap: onPressed,
        customBorder: const CircleBorder(),
        child: SizedBox(
          width: size,
          height: size,
          child: Icon(icon, color: _iconColor, size: size * 0.5),
        ),
      ),
    );
  }
}

/// ALTextButton variant for secondary actions
class ALTextButton extends StatelessWidget {
  const ALTextButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.color,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final textColor = color ?? AppColors.primary;

    return TextButton(
      onPressed: onPressed,
      style: TextButton.styleFrom(
        foregroundColor: textColor,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.base,
          vertical: AppSpacing.sm,
        ),
      ),
      child: icon != null
          ? Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: AppSpacing.iconMd, color: textColor),
                const SizedBox(width: AppSpacing.xs),
                Text(
                  label,
                  style: AppTypography.labelLarge.copyWith(color: textColor),
                ),
              ],
            )
          : Text(
              label,
              style: AppTypography.labelLarge.copyWith(color: textColor),
            ),
    );
  }
}

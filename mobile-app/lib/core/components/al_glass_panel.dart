import 'dart:ui';
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';

/// Academic Luminary Glass Panel Component
/// Glassmorphism effect with backdrop blur
/// Used for modals, overlays, floating panels
class ALGlassPanel extends StatelessWidget {
  const ALGlassPanel({
    super.key,
    required this.child,
    this.padding,
    this.radius,
    this.hasBorder = true,
    this.opacity,
    this.blur,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final double? radius;
  final bool hasBorder;
  final double? opacity;
  final double? blur;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(radius ?? AppRadius.glassXl),
      child: BackdropFilter(
        filter: ImageFilter.blur(
          sigmaX: blur ?? 16,
          sigmaY: blur ?? 16,
        ),
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.surfaceContainerLowest.withValues(
              alpha: opacity ?? 0.7,
            ),
            borderRadius: BorderRadius.circular(radius ?? AppRadius.glassXl),
            border: hasBorder
                ? Border.all(
                    color: Colors.white.withValues(alpha: 0.3),
                    width: 1,
                  )
                : null,
            boxShadow: AppColors.ambientShadow,
          ),
          padding: padding ?? const EdgeInsets.all(AppSpacing.cardPadding),
          child: child,
        ),
      ),
    );
  }
}

/// Simple glass effect without blur (lighter weight)
class ALSimpleGlassPanel extends StatelessWidget {
  const ALSimpleGlassPanel({
    super.key,
    required this.child,
    this.padding,
    this.radius,
    this.backgroundColor,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final double? radius;
  final Color? backgroundColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: backgroundColor ??
            AppColors.surfaceContainerLowest.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(radius ?? AppRadius.lg),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.4),
          width: 1,
        ),
        boxShadow: AppColors.ambientShadow,
      ),
      padding: padding ?? const EdgeInsets.all(AppSpacing.cardPadding),
      child: child,
    );
  }
}

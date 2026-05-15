import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';

/// Academic Luminary Card Component
/// NO solid borders — use surface color shifts for separation
/// Shadow: 0 12px 40px rgba(7,30,39,0.06)
class ALCard extends StatelessWidget {
  const ALCard({
    super.key,
    required this.child,
    this.backgroundColor,
    this.padding,
    this.margin,
    this.radius,
    this.onTap,
    this.hasShadow = true,
    this.glowColor,
    this.glowIntensity,
  });

  final Widget child;
  final Color? backgroundColor;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final double? radius;
  final VoidCallback? onTap;
  final bool hasShadow;
  final Color? glowColor;
  final double? glowIntensity;

  @override
  Widget build(BuildContext context) {
    Widget card = Container(
      margin: margin,
      decoration: BoxDecoration(
        color: backgroundColor ?? AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(radius ?? AppRadius.lg),
        boxShadow: hasShadow ? AppColors.ambientShadow : null,
      ),
      child: Padding(
        padding: padding ?? const EdgeInsets.all(AppSpacing.cardPadding),
        child: child,
      ),
    );

    // Apply glow effect if specified
    if (glowColor != null) {
      card = Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(radius ?? AppRadius.lg),
          boxShadow: [
            BoxShadow(
              color: glowColor!.withValues(alpha: glowIntensity ?? 0.2),
              blurRadius: 12,
              spreadRadius: 0,
            ),
          ],
        ),
        child: card,
      );
    }

    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(radius ?? AppRadius.lg),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(radius ?? AppRadius.lg),
          child: card,
        ),
      );
    }

    return card;
  }
}

/// ALBentoCard - Bento grid card with tonal layering
/// Used for dashboard stats and bento layouts
class ALBentoCard extends StatelessWidget {
  const ALBentoCard({
    super.key,
    required this.child,
    this.backgroundColor,
    this.padding,
    this.radius,
    this.onTap,
    this.isHero = false,
    this.span,
  });

  final Widget child;
  final Color? backgroundColor;
  final EdgeInsetsGeometry? padding;
  final double? radius;
  final VoidCallback? onTap;
  final bool isHero;
  final int? span;

  @override
  Widget build(BuildContext context) {
    final cardRadius = radius ?? (isHero ? AppRadius.bentoCard : AppRadius.lg);

    Widget card = Container(
      decoration: BoxDecoration(
        gradient: isHero ? AppColors.heroGradient : null,
        color: isHero ? null : (backgroundColor ?? AppColors.surfaceContainerLow),
        borderRadius: BorderRadius.circular(cardRadius),
        boxShadow: isHero ? null : AppColors.ambientShadow,
      ),
      padding: padding ?? const EdgeInsets.all(AppSpacing.cardPadding),
      child: child,
    );

    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(cardRadius),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(cardRadius),
          child: card,
        ),
      );
    }

    return card;
  }
}

/// ALStatCard - Statistics display card for bento grids
class ALStatCard extends StatelessWidget {
  const ALStatCard({
    super.key,
    required this.label,
    required this.value,
    this.icon,
    this.iconColor,
    this.valueColor,
    this.backgroundColor,
    this.isSmall = false,
  });

  final String label;
  final String value;
  final IconData? icon;
  final Color? iconColor;
  final Color? valueColor;
  final Color? backgroundColor;
  final bool isSmall;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(isSmall ? AppSpacing.md : AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: backgroundColor ?? AppColors.surfaceContainerLowest,
        borderRadius: AppRadius.radiusLg,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (label.isNotEmpty)
            Text(
              label.toUpperCase(),
              style: TextStyle(
                fontSize: isSmall ? 10 : 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.8,
                color: AppColors.onSurfaceVariant,
              ),
            ),
          if (label.isNotEmpty) const SizedBox(height: AppSpacing.xs),
          Text(
            value,
            style: TextStyle(
              fontFamily: 'Manrope',
              fontSize: isSmall ? 20 : 28,
              fontWeight: FontWeight.w800,
              color: valueColor ?? AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

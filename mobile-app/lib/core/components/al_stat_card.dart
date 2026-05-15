import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_spacing.dart';

/// Stat card — displays a single metric with label and optional trend
class ALStatCard extends StatelessWidget {
  const ALStatCard({
    super.key,
    required this.label,
    required this.value,
    this.subtitle,
    this.icon,
    this.iconColor,
    this.trend,
    this.trendUp = true,
    this.onTap,
    this.colored = false,
  });

  final String label;
  final String value;
  final String? subtitle;
  final IconData? icon;
  final Color? iconColor;
  final String? trend;
  final bool trendUp;
  final VoidCallback? onTap;
  final bool colored;

  @override
  Widget build(BuildContext context) {
    final color = colored ? AppColors.tertiaryFixedDim : AppColors.surfaceContainerLowest;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.base),
        decoration: BoxDecoration(
          color: color,
          borderRadius: AppRadius.radiusLg,
          boxShadow: AppColors.cardShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (icon != null) ...[
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: (iconColor ?? AppColors.primary).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(icon, size: 18, color: iconColor ?? AppColors.primary),
                  ),
                  const SizedBox(width: 8),
                  Text(label, style: TextStyle(
                    fontFamily: 'Inter', fontSize: 12, color: AppColors.onSurfaceVariant,
                  )),
                ],
              ),
              const SizedBox(height: 8),
            ] else ...[
              Text(label, style: TextStyle(
                fontFamily: 'Inter', fontSize: 11, fontWeight: FontWeight.w700,
                color: AppColors.onSurfaceVariant, letterSpacing: 0.5,
              )),
              const SizedBox(height: 4),
            ],
            Text(value, style: TextStyle(
              fontFamily: 'Manrope',
              fontSize: colored ? 22 : 20,
              fontWeight: FontWeight.w800,
              color: colored ? AppColors.onTertiaryFixedVariant : AppColors.primary,
            )),
            if (subtitle != null) ...[
              const SizedBox(height: 4),
              Text(subtitle!, style: TextStyle(
                fontFamily: 'Inter', fontSize: 11, color: AppColors.onSurfaceVariant,
              )),
            ],
            if (trend != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(
                    trendUp ? Icons.trending_up : Icons.trending_down,
                    size: 14,
                    color: trendUp ? AppColors.secondary : AppColors.error,
                  ),
                  const SizedBox(width: 4),
                  Text(trend!, style: TextStyle(
                    fontFamily: 'Inter', fontSize: 11, fontWeight: FontWeight.w700,
                    color: trendUp ? AppColors.secondary : AppColors.error,
                  )),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
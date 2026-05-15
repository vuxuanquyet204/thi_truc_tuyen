import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

/// Academic Luminary Progress Ribbon
/// 4px ribbon at the top of the viewport
/// Color: secondary (#006a6a) with optional glow
class ALProgressRibbon extends StatelessWidget {
  const ALProgressRibbon({
    super.key,
    this.progress,
    this.color,
    this.height,
    this.showGlow = true,
  });

  /// Progress from 0.0 to 1.0 (optional)
  final double? progress;
  final Color? color;
  final double? height;
  final bool showGlow;

  @override
  Widget build(BuildContext context) {
    final ribbonColor = color ?? AppColors.secondary;

    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: Container(
        height: height ?? AppSpacing.progressRibbonHeight,
        decoration: BoxDecoration(
          color: ribbonColor.withValues(alpha: 0.2),
          boxShadow: showGlow
              ? [
                  BoxShadow(
                    color: ribbonColor.withValues(alpha: 0.4),
                    blurRadius: 8,
                  ),
                ]
              : null,
        ),
        child: progress != null
            ? FractionallySizedBox(
                alignment: Alignment.centerLeft,
                widthFactor: progress!.clamp(0.0, 1.0),
                child: Container(
                  decoration: BoxDecoration(
                    color: ribbonColor,
                    boxShadow: showGlow
                        ? [
                            BoxShadow(
                              color: ribbonColor.withValues(alpha: 0.5),
                              blurRadius: 8,
                            ),
                          ]
                        : null,
                  ),
                ),
              )
            : Container(color: ribbonColor),
      ),
    );
  }
}

/// Full-width progress bar variant (not ribbon)
class ALProgressBar extends StatelessWidget {
  const ALProgressBar({
    super.key,
    required this.progress,
    this.height,
    this.backgroundColor,
    this.color,
    this.showLabel = false,
  });

  final double progress;
  final double? height;
  final Color? backgroundColor;
  final Color? color;
  final bool showLabel;

  @override
  Widget build(BuildContext context) {
    final barHeight = height ?? 8;
    final barColor = color ?? AppColors.secondary;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (showLabel)
          Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.xs),
            child: Text(
              '${(progress * 100).toInt()}%',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: barColor,
              ),
            ),
          ),
        Container(
          height: barHeight,
          decoration: BoxDecoration(
            color: backgroundColor ?? barColor.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(barHeight / 2),
          ),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: progress.clamp(0.0, 1.0),
            child: Container(
              decoration: BoxDecoration(
                color: barColor,
                borderRadius: BorderRadius.circular(barHeight / 2),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

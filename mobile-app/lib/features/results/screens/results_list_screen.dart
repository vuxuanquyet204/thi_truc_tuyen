import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/theme/app_spacing.dart';

/// Results List Screen
class ResultsListScreen extends StatelessWidget {
  const ResultsListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final results = [
      _ResultData('Advanced Cognitive Architecture', 85, 'Oct 20, 2024', '+450 LT'),
      _ResultData('Behavioral Economics', 92, 'Oct 12, 2024', '+350 LT'),
      _ResultData('Game Theory Basics', 88, 'Oct 05, 2024', '+280 LT'),
      _ResultData('Data Structures', 76, 'Sep 28, 2024', '+200 LT'),
    ];

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Container(
              height: AppSpacing.progressRibbonHeight,
              color: AppColors.secondary.withValues(alpha: 0.5),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.screenPadding),
              child: Row(
                children: [
                  const Expanded(
                    child: Text(
                      'Kết quả',
                      style: TextStyle(
                        fontFamily: 'Manrope',
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.02,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.tertiaryFixedDim,
                      borderRadius: AppRadius.radiusFull,
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.stars, size: 16, color: AppColors.onTertiaryFixed),
                        SizedBox(width: 4),
                        Text('1,250 LT', style: TextStyle(
                          fontFamily: 'Manrope', fontSize: 13, fontWeight: FontWeight.w700,
                          color: AppColors.onTertiaryFixed,
                        )),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.screenPadding),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final r = results[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: _ResultCard(result: r),
                  );
                },
                childCount: results.length,
              ),
            ),
          ),
          const SliverToBoxAdapter(
            child: SizedBox(height: 100),
          ),
        ],
      ),
    );
  }
}

class _ResultData {
  const _ResultData(this.title, this.score, this.date, this.tokens);
  final String title;
  final int score;
  final String date;
  final String tokens;
}

class _ResultCard extends StatelessWidget {
  const _ResultCard({required this.result});

  final _ResultData result;

  @override
  Widget build(BuildContext context) {
    final status = result.score >= 90 ? 'Xuất sắc'
        : result.score >= 70 ? 'Khá'
        : result.score >= 50 ? 'Trung bình'
        : 'Yếu';

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: AppRadius.radiusLg,
        boxShadow: AppColors.cardShadow,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: AppRadius.radiusLg,
        child: InkWell(
          onTap: () => context.go('/results/result_${result.title.hashCode}'),
          borderRadius: AppRadius.radiusLg,
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.base),
            child: Row(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: result.score >= 90
                        ? AppColors.secondary.withValues(alpha: 0.1)
                        : result.score >= 50
                            ? AppColors.primary.withValues(alpha: 0.1)
                            : AppColors.error.withValues(alpha: 0.1),
                    borderRadius: AppRadius.radiusMd,
                  ),
                  child: Center(
                    child: Text(
                      '${result.score}%',
                      style: TextStyle(
                        fontFamily: 'Manrope',
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: result.score >= 90
                            ? AppColors.secondary
                            : result.score >= 50
                                ? AppColors.primary
                                : AppColors.error,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        result.title,
                        style: const TextStyle(
                          fontFamily: 'Manrope',
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.onSurface,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${result.date} • $status',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 12,
                          color: AppColors.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        result.tokens,
                        style: const TextStyle(
                          fontFamily: 'Manrope',
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.secondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(Icons.chevron_right, color: AppColors.outline),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

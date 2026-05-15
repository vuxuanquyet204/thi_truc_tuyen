import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/theme/app_spacing.dart';

/// Result Detail Screen — Hero score + Radar chart + Career path
class ResultDetailScreen extends StatelessWidget {
  const ResultDetailScreen({super.key, required this.resultId});

  final String resultId;

  @override
  Widget build(BuildContext context) {
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
          SliverToBoxAdapter(child: _buildAppBar(context)),
          SliverPadding(
            padding: const EdgeInsets.all(AppSpacing.screenPadding),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Hero section
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.secondary.withValues(alpha: 0.1),
                              borderRadius: AppRadius.radiusFull,
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.check_circle, size: 14, color: AppColors.secondary),
                                SizedBox(width: 4),
                                Text('Hoàn thành', style: TextStyle(
                                  fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w600,
                                  color: AppColors.secondary,
                                )),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'Advanced Cognitive\nArchitecture',
                            style: TextStyle(
                              fontFamily: 'Manrope', fontSize: 28, fontWeight: FontWeight.w800,
                              letterSpacing: -0.02, color: AppColors.primary, height: 1.2,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              ElevatedButton.icon(
                                onPressed: () {},
                                icon: const Icon(Icons.download, size: 18),
                                label: const Text('Tải chứng chỉ'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primary,
                                  foregroundColor: AppColors.onPrimary,
                                  elevation: 0,
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: AppRadius.radiusFull),
                                ),
                              ),
                              const SizedBox(width: 8),
                              OutlinedButton.icon(
                                onPressed: () {},
                                icon: const Icon(Icons.share, size: 18),
                                label: const Text('Chia sẻ'),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: AppColors.secondary,
                                  side: const BorderSide(color: AppColors.secondaryContainer),
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: AppRadius.radiusFull),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    // Score glass card
                    _ScoreGlassCard(score: 85),
                  ],
                ),
                const SizedBox(height: 32),
                // Radar chart
                _SkillRadarChart(),
                const SizedBox(height: 32),
                // Insight card
                _InsightCard(),
                const SizedBox(height: 32),
                // Career path
                const Text(
                  'Lộ trình phát triển',
                  style: TextStyle(
                    fontFamily: 'Manrope', fontSize: 22, fontWeight: FontWeight.w700,
                    color: AppColors.primary, letterSpacing: -0.02,
                  ),
                ),
                const SizedBox(height: 16),
                _CareerPathGrid(),
                const SizedBox(height: 100),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      child: Row(
        children: [
          IconButton(
            onPressed: () => context.pop(),
            icon: const Icon(Icons.arrow_back, color: AppColors.primary),
          ),
          const Spacer(),
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
                Text('+450 LT', style: TextStyle(
                  fontFamily: 'Manrope', fontSize: 13, fontWeight: FontWeight.w700,
                  color: AppColors.onTertiaryFixed,
                )),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ScoreGlassCard extends StatelessWidget {
  const _ScoreGlassCard({required this.score});

  final int score;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 160,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest.withValues(alpha: 0.8),
        borderRadius: AppRadius.radiusGlassXl,
        border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
        boxShadow: AppColors.ambientShadow,
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Điểm tổng', style: TextStyle(
                fontFamily: 'Inter', fontSize: 11, fontWeight: FontWeight.w700,
                color: AppColors.onSurfaceVariant, letterSpacing: 0.5,
              )),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.secondary,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text('PASSED', style: TextStyle(
                  fontFamily: 'Manrope', fontSize: 9, fontWeight: FontWeight.w700,
                  color: AppColors.onSecondary,
                )),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('$score', style: const TextStyle(
                fontFamily: 'Manrope', fontSize: 56, fontWeight: FontWeight.w800,
                color: AppColors.primary, letterSpacing: -0.02,
              )),
              const Padding(
                padding: EdgeInsets.only(bottom: 8),
                child: Text('/100', style: TextStyle(
                  fontFamily: 'Manrope', fontSize: 18, fontWeight: FontWeight.w700,
                  color: AppColors.outline,
                )),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.tertiaryFixedDim.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.stars, size: 16, color: AppColors.onTertiaryFixedVariant),
                const SizedBox(width: 6),
                const Text('+450 LT', style: TextStyle(
                  fontFamily: 'Manrope', fontSize: 14, fontWeight: FontWeight.w800,
                  color: AppColors.onTertiaryFixedVariant,
                )),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SkillRadarChart extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLow,
        borderRadius: AppRadius.radiusBento,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Ma trận kỹ năng', style: TextStyle(
            fontFamily: 'Manrope', fontSize: 18, fontWeight: FontWeight.w700,
            color: AppColors.primary,
          )),
          const SizedBox(height: 8),
          Row(
            children: [
              Container(width: 10, height: 10, decoration: const BoxDecoration(
                color: AppColors.primary, shape: BoxShape.circle,
              )),
              const SizedBox(width: 6),
              const Text('Kết quả của bạn', style: TextStyle(
                fontFamily: 'Inter', fontSize: 11, fontWeight: FontWeight.w600,
                color: AppColors.primary,
              )),
              const SizedBox(width: 16),
              Container(width: 10, height: 10, decoration: BoxDecoration(
                color: AppColors.outline.withValues(alpha: 0.2), shape: BoxShape.circle,
              )),
              const SizedBox(width: 6),
              Text('Trung bình khóa', style: TextStyle(
                fontFamily: 'Inter', fontSize: 11, fontWeight: FontWeight.w600,
                color: AppColors.outline,
              )),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 200,
            child: RadarChart(
              RadarChartData(
                dataSets: [
                  RadarDataSet(
                    fillColor: AppColors.primary.withValues(alpha: 0.15),
                    borderColor: AppColors.primary,
                    borderWidth: 2,
                    dataEntries: const [
                      RadarEntry(value: 92),
                      RadarEntry(value: 78),
                      RadarEntry(value: 85),
                      RadarEntry(value: 80),
                      RadarEntry(value: 75),
                    ],
                  ),
                  RadarDataSet(
                    fillColor: AppColors.outline.withValues(alpha: 0.1),
                    borderColor: AppColors.outline,
                    borderWidth: 1,
                    dataEntries: const [
                      RadarEntry(value: 80),
                      RadarEntry(value: 80),
                      RadarEntry(value: 80),
                      RadarEntry(value: 80),
                      RadarEntry(value: 80),
                    ],
                  ),
                ],
                radarBackgroundColor: Colors.transparent,
                radarBorderData: const BorderSide(color: AppColors.outlineVariant, width: 1),
                gridBorderData: const BorderSide(color: AppColors.outlineVariant, width: 1),
                tickBorderData: const BorderSide(color: Colors.transparent),
                ticksTextStyle: const TextStyle(fontSize: 0),
                titleTextStyle: const TextStyle(
                  fontFamily: 'Inter', fontSize: 10, fontWeight: FontWeight.w700,
                  color: AppColors.outline, letterSpacing: 0.5,
                ),
                getTitle: (index, _) {
                  const titles = ['Logic', 'Knowledge', 'Speed', 'Critical', 'Synthesis'];
                  return RadarChartTitle(text: titles[index]);
                },
                titlePositionPercentageOffset: 0.2,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _InsightCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft, end: Alignment.bottomRight,
          colors: [AppColors.primary, AppColors.primaryContainer],
        ),
        borderRadius: AppRadius.radiusBento,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.psychology, color: AppColors.onPrimaryContainer),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text('Nhận xét chi tiết', style: TextStyle(
            fontFamily: 'Manrope', fontSize: 18, fontWeight: FontWeight.w700,
            color: AppColors.onPrimary,
          )),
          const SizedBox(height: 8),
          const Text(
            'Tốc độ giải quyết các vấn đề logic phức tạp của bạn nhanh hơn 15% so với trung bình. Hãy tập trung vào phần "Synthesis" để đạt hạng Luminary.',
            style: TextStyle(
              fontFamily: 'Inter', fontSize: 13, color: AppColors.onPrimaryContainer,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}

class _CareerPathGrid extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final items = [
      _CareerItem(Icons.work, 'Việc làm phù hợp', '8 vị trí hàng đầu', '94%'),
      _CareerItem(Icons.school, 'Nâng cao', 'Module Logic II', 'Token'),
      _CareerItem(Icons.people, 'Mentor', 'Đặt lịch 1:1', 'Gợi ý'),
      _CareerItem(Icons.leaderboard, 'Xếp hạng', 'Tăng 450 bậc', '#1,402'),
    ];

    return Column(
      children: List.generate(2, (row) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            children: List.generate(2, (col) {
              final i = row * 2 + col;
              return Expanded(
                child: Padding(
                  padding: EdgeInsets.only(left: col.isEven ? 0 : 8),
                  child: _CareerCard(item: items[i]),
                ),
              );
            }),
          ),
        );
      }),
    );
  }
}

class _CareerItem {
  const _CareerItem(this.icon, this.title, this.subtitle, this.tag);
  final IconData icon;
  final String title;
  final String subtitle;
  final String tag;
}

class _CareerCard extends StatelessWidget {
  const _CareerCard({required this.item});

  final _CareerItem item;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: AppRadius.radiusLg,
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(item.icon, color: AppColors.primary, size: 28),
          const SizedBox(height: 12),
          Text(item.title, style: const TextStyle(
            fontFamily: 'Manrope', fontSize: 14, fontWeight: FontWeight.w700,
            color: AppColors.primary,
          )),
          const SizedBox(height: 4),
          Text(item.subtitle, style: TextStyle(
            fontFamily: 'Inter', fontSize: 11, color: AppColors.onSurfaceVariant,
          )),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.secondary.withValues(alpha: 0.1),
              borderRadius: AppRadius.radiusFull,
            ),
            child: Text(
              item.tag,
              style: const TextStyle(
                fontFamily: 'Inter', fontSize: 10, fontWeight: FontWeight.w700,
                color: AppColors.secondary, letterSpacing: 0.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

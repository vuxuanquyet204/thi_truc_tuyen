import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/theme/app_spacing.dart';

/// Admin Dashboard Screen
class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.cardPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Phân tích hệ thống',
                      style: TextStyle(
                        fontFamily: 'Manrope', fontSize: 28, fontWeight: FontWeight.w800,
                        color: AppColors.primary, letterSpacing: -0.02,
                      ),
                    ),
                    Text(
                      'Metrics thời gian thực và tương tác ứng viên',
                      style: TextStyle(
                        fontFamily: 'Inter', fontSize: 13, color: AppColors.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    OutlinedButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.download, size: 18),
                      label: const Text('Xuất báo cáo'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        side: const BorderSide(color: Colors.transparent),
                        backgroundColor: AppColors.surfaceContainerLow,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: AppRadius.radiusFull),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.tertiaryFixedDim,
                        borderRadius: AppRadius.radiusFull,
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.generating_tokens, size: 18, color: AppColors.onTertiaryFixed),
                          SizedBox(width: 6),
                          Text('1,250 LT', style: TextStyle(
                            fontFamily: 'Manrope', fontSize: 13, fontWeight: FontWeight.w700,
                            color: AppColors.onTertiaryFixed,
                          )),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 32),
            // Bento Grid
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Active Candidates (hero)
                Expanded(
                  flex: 2,
                  child: _HeroCard(),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _AvgScoreCard(),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: _TokenVelocityCard(),
                ),
                const SizedBox(width: 16),
                const Expanded(
                  flex: 2,
                  child: SizedBox(),
                ),
              ],
            ),
            const SizedBox(height: 32),
            // Distribution chart
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  flex: 2,
                  child: _DistributionChart(),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _ActivityFeed(),
                ),
              ],
            ),
            const SizedBox(height: 32),
            // LearnToken Economy
            _LearnTokenEconomy(),
          ],
        ),
      ),
    );
  }
}

class _HeroCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primary, AppColors.primaryContainer],
        ),
        borderRadius: AppRadius.radiusBento,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Ứng viên đang hoạt động',
            style: TextStyle(
              fontFamily: 'Inter', fontSize: 13, fontWeight: FontWeight.w500,
              color: AppColors.onPrimaryContainer, letterSpacing: 0.5,
            ),
          ),
          const Text(
            '12,482',
            style: TextStyle(
              fontFamily: 'Manrope', fontSize: 56, fontWeight: FontWeight.w800,
              color: AppColors.onPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.trending_up, size: 18, color: AppColors.secondaryFixed),
              const SizedBox(width: 4),
              const Text('+12% so với kỳ trước', style: TextStyle(
                fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w700,
                color: AppColors.secondaryFixed,
              )),
            ],
          ),
        ],
      ),
    );
  }
}

class _AvgScoreCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: AppRadius.radiusBento,
        boxShadow: AppColors.ambientShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Điểm trung bình',
            style: TextStyle(
              fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w500,
              color: AppColors.onSurfaceVariant, letterSpacing: 0.5,
            ),
          ),
          const Text(
            '84.2%',
            style: TextStyle(
              fontFamily: 'Manrope', fontSize: 40, fontWeight: FontWeight.w800,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: 0.842,
              backgroundColor: AppColors.surfaceContainerLow,
              valueColor: const AlwaysStoppedAnimation(AppColors.primary),
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Hiện tại', style: TextStyle(
                fontFamily: 'Inter', fontSize: 11, color: AppColors.onSurfaceVariant,
              )),
              const Text('Mục tiêu: 90%', style: TextStyle(
                fontFamily: 'Inter', fontSize: 11, color: AppColors.onSurfaceVariant,
              )),
            ],
          ),
        ],
      ),
    );
  }
}

class _TokenVelocityCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: AppColors.tertiaryFixedDim,
        borderRadius: AppRadius.radiusBento,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Token Velocity',
            style: TextStyle(
              fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w500,
              color: AppColors.onTertiaryFixedVariant, letterSpacing: 0.5,
            ),
          ),
          const Text(
            '4.2k',
            style: TextStyle(
              fontFamily: 'Manrope', fontSize: 40, fontWeight: FontWeight.w800,
              color: AppColors.onTertiaryFixedVariant,
            ),
          ),
          const Text(
            'LT yêu cầu mỗi ngày',
            style: TextStyle(
              fontFamily: 'Inter', fontSize: 11, color: AppColors.onTertiaryFixedVariant,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _TinyAvatar('https://i.pravatar.cc/40?img=1'),
              _TinyAvatar('https://i.pravatar.cc/40?img=2'),
              _TinyAvatar('https://i.pravatar.cc/40?img=3'),
              Container(
                width: 32, height: 32,
                decoration: BoxDecoration(
                  color: AppColors.tertiary.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.tertiaryFixed, width: 2),
                ),
                child: const Center(
                  child: Text('+2k', style: TextStyle(
                    fontFamily: 'Inter', fontSize: 10, fontWeight: FontWeight.w700,
                    color: AppColors.onTertiaryFixedVariant,
                  )),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _TinyAvatar extends StatelessWidget {
  const _TinyAvatar(this.url);
  final String url;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 32, height: 32,
      margin: const EdgeInsets.only(right: -8),
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.tertiaryFixed, width: 2),
      ),
      child: CircleAvatar(
        radius: 14,
        backgroundImage: NetworkImage(url),
      ),
    );
  }
}

class _DistributionChart extends StatelessWidget {
  final _data = [40.0, 65.0, 90.0, 55.0, 75.0, 30.0, 25.0];

  @override
  Widget build(BuildContext context) {
    final maxVal = _data.reduce((a, b) => a > b ? a : b);
    final days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLow,
        borderRadius: AppRadius.radiusBento,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Phân bổ ứng viên', style: TextStyle(
                fontFamily: 'Manrope', fontSize: 18, fontWeight: FontWeight.w700,
                color: AppColors.primary,
              )),
              Row(
                children: [
                  _FilterChip(label: 'TUẦN', isActive: true),
                  const SizedBox(width: 8),
                  _FilterChip(label: 'THÁNG', isActive: false),
                ],
              ),
            ],
          ),
          const SizedBox(height: 32),
          SizedBox(
            height: 160,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: List.generate(7, (index) {
                final h = (_data[index] / maxVal * 140).clamp(20.0, 140.0);
                final isMax = _data[index] == maxVal;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Expanded(
                          child: Align(
                            alignment: Alignment.bottomCenter,
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              width: double.infinity,
                              height: h,
                              decoration: BoxDecoration(
                                color: isMax ? AppColors.primary : AppColors.primary.withValues(alpha: 0.4),
                                borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(days[index], style: TextStyle(
                          fontFamily: 'Inter', fontSize: 10, fontWeight: FontWeight.w700,
                          color: AppColors.outline,
                        )),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              _MiniStat(label: 'Giờ cao điểm', value: '14:00-16:00'),
              const SizedBox(width: 24),
              _MiniStat(label: 'TB phiên', value: '48.2 min'),
              const SizedBox(width: 24),
              _MiniStat(label: 'Tải', value: '1,204/s'),
            ],
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({required this.label, required this.isActive});
  final String label;
  final bool isActive;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: isActive ? AppColors.surfaceContainerHighest : Colors.transparent,
        borderRadius: AppRadius.radiusFull,
      ),
      child: Text(
        label,
        style: TextStyle(
          fontFamily: 'Inter', fontSize: 10, fontWeight: FontWeight.w700,
          color: isActive ? AppColors.primary : AppColors.outline,
        ),
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  const _MiniStat({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(), style: TextStyle(
          fontFamily: 'Inter', fontSize: 10, fontWeight: FontWeight.w700,
          color: AppColors.outline,
        )),
        Text(value, style: const TextStyle(
          fontFamily: 'Manrope', fontSize: 16, fontWeight: FontWeight.w800,
          color: AppColors.primary,
        )),
      ],
    );
  }
}

class _ActivityFeed extends StatelessWidget {
  final _activities = [
    _ActivityData('Kỳ thi Luật hoàn tất', '2,400 bài được AI xác minh.', 'secondary', 'Vừa xong'),
    _ActivityData('Token được mint', 'Admin phát hành 50,000 LT.', 'tertiary', '14 phút'),
    _ActivityData('Cảnh báo Toàn vẹn', 'Ứng viên #8492 được flag.', 'error', '2 giờ'),
    _ActivityData('Proctor mới', 'Sarah Jenkins tham gia.', 'primary', 'Hôm qua'),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: AppRadius.radiusBento,
        boxShadow: AppColors.ambientShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Hoạt động gần đây', style: TextStyle(
            fontFamily: 'Manrope', fontSize: 18, fontWeight: FontWeight.w700,
            color: AppColors.primary,
          )),
          const SizedBox(height: 24),
          ...List.generate(_activities.length, (index) {
            final a = _activities[index];
            return Padding(
              padding: const EdgeInsets.only(bottom: 20),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 8, height: 8,
                    margin: const EdgeInsets.only(top: 6),
                    decoration: BoxDecoration(
                      color: _getActivityColor(a.type),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(a.title, style: const TextStyle(
                          fontFamily: 'Inter', fontSize: 13, fontWeight: FontWeight.w600,
                          color: AppColors.onSurface,
                        )),
                        Text(a.desc, style: TextStyle(
                          fontFamily: 'Inter', fontSize: 11, color: AppColors.onSurfaceVariant,
                        )),
                        Text(a.time, style: TextStyle(
                          fontFamily: 'Inter', fontSize: 10, fontWeight: FontWeight.w500,
                          color: AppColors.outline,
                        )),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primary,
                side: BorderSide.none,
                backgroundColor: AppColors.surfaceContainerLow,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: AppRadius.radiusLg),
              ),
              child: const Text('Xem nhật ký kiểm toán'),
            ),
          ),
        ],
      ),
    );
  }

  Color _getActivityColor(String type) => switch (type) {
        'secondary' => AppColors.secondary,
        'tertiary' => AppColors.tertiaryFixedDim,
        'error' => AppColors.error,
        _ => AppColors.primary,
      };
}

class _ActivityData {
  const _ActivityData(this.title, this.desc, this.type, this.time);
  final String title;
  final String desc;
  final String type;
  final String time;
}

class _LearnTokenEconomy extends StatelessWidget {
  final _categories = [
    _TokenCategory('Thưởng hiệu suất', '42%', 0.42),
    _TokenCategory('Mentor đồng nghiệp', '18%', 0.18),
    _TokenCategory('Tạo tài nguyên', '25%', 0.25),
    _TokenCategory('Thưởng chuỗi', '15%', 0.15),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: AppRadius.radiusBento,
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.05)),
        boxShadow: AppColors.ambientShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Nền kinh tế LearnToken', style: TextStyle(
                fontFamily: 'Manrope', fontSize: 22, fontWeight: FontWeight.w700,
                color: AppColors.primary,
              )),
              Row(
                children: [
                  _TokenStat(label: 'Đã phát hành', value: '8.4M LT'),
                  Container(width: 1, height: 32, margin: const EdgeInsets.symmetric(horizontal: 16), color: AppColors.outlineVariant),
                  _TokenStat(label: 'Đang lưu hành', value: '1.2M LT'),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: List.generate(_categories.length, (index) {
              return Expanded(
                child: Padding(
                  padding: EdgeInsets.only(left: index > 0 ? 8 : 0),
                  child: _CategoryCard(category: _categories[index]),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}

class _TokenStat extends StatelessWidget {
  const _TokenStat({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(label.toUpperCase(), style: TextStyle(
          fontFamily: 'Inter', fontSize: 10, fontWeight: FontWeight.w700,
          color: AppColors.onTertiaryFixedVariant, letterSpacing: 0.5,
        )),
        Text(value, style: const TextStyle(
          fontFamily: 'Manrope', fontSize: 18, fontWeight: FontWeight.w800,
          color: AppColors.onTertiaryFixedVariant,
        )),
      ],
    );
  }
}

class _CategoryCard extends StatelessWidget {
  const _CategoryCard({required this.category});
  final _TokenCategory category;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: AppRadius.radiusLg,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(category.name.toUpperCase(), style: TextStyle(
            fontFamily: 'Inter', fontSize: 10, fontWeight: FontWeight.w700,
            color: AppColors.outline,
          )),
          const SizedBox(height: 8),
          Text(category.percent, style: const TextStyle(
            fontFamily: 'Manrope', fontSize: 22, fontWeight: FontWeight.w800,
            color: AppColors.primary,
          )),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: category.ratio,
              backgroundColor: AppColors.primary.withValues(alpha: 0.1),
              valueColor: const AlwaysStoppedAnimation(AppColors.primary),
              minHeight: 4,
            ),
          ),
        ],
      ),
    );
  }
}

class _TokenCategory {
  const _TokenCategory(this.name, this.percent, this.ratio);
  final String name;
  final String percent;
  final double ratio;
}

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/components/al_avatar.dart';
import '../../../core/components/al_card.dart';
import '../../../core/components/al_chip.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/types/user.model.dart';
import '../../../contexts/auth_context.dart';
import '../../../navigation/routes.dart';

/// Home Screen — Candidate Dashboard
/// Matches mockup: trang_ch_th_sinh.html
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthContext>();
    final user = auth.user;

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: CustomScrollView(
        slivers: [
          // Progress Ribbon
          SliverToBoxAdapter(
            child: Container(
              height: AppSpacing.progressRibbonHeight,
              color: AppColors.secondary.withValues(alpha: 0.5),
            ),
          ),
          // Top App Bar
          SliverToBoxAdapter(
            child: _buildTopBar(context, user),
          ),
          // Main content
          SliverPadding(
            padding: const EdgeInsets.all(AppSpacing.screenPadding),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Exam notification banner
                _ExamNotificationBanner(
                  examTitle: 'Advanced Quantum Mechanics IV',
                  time: '14:30 PM',
                  onAction: () => context.go(AppRoutes.exams),
                ),
                const SizedBox(height: AppSpacing.sectionGap),
                // Stats bento
                _AcademicJourneyCard(
                  activeExams: 4,
                  completed: 12,
                  rank: 142,
                ),
                const SizedBox(height: AppSpacing.sectionGap),
                // LearnToken card
                _LearnTokenCard(
                  balance: user?.learnTokenBalance ?? 0,
                  onRedeem: () => context.go(AppRoutes.learnTokens),
                  onHistory: () => context.go(AppRoutes.learnTokens),
                ),
                const SizedBox(height: AppSpacing.sectionGap),
                // Credential vault
                _CredentialVault(
                  certificates: [
                    _CertData('Data Ethics & Privacy', 'Oct 2023', Icons.verified),
                    _CertData('Algorithmic Logic', 'Sep 2023', Icons.terminal),
                    _CertData('Humanities Master', 'Aug 2023', Icons.history_edu),
                  ],
                ),
                const SizedBox(height: AppSpacing.sectionGap),
                // Upcoming schedule
                _UpcomingSchedule(
                  schedules: [
                    _ScheduleData(
                      title: 'Structural Engineering Dynamics',
                      date: 'Nov',
                      day: 18,
                      time: '09:00 AM - 11:30 AM',
                    ),
                    _ScheduleData(
                      title: 'Cognitive Psychology Foundations',
                      date: 'Nov',
                      day: 22,
                      time: '14:00 PM - 16:00 PM',
                    ),
                  ],
                ),
                const SizedBox(height: 100), // Bottom nav padding
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopBar(BuildContext context, User? user) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.screenPadding,
        vertical: AppSpacing.base,
      ),
      child: Row(
        children: [
          ALAvatar(
            imageUrl: user?.avatarUrl,
            name: user?.name ?? 'User',
            size: 40,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              user?.name ?? 'Academic Luminary',
              style: const TextStyle(
                fontFamily: 'Manrope',
                fontSize: 20,
                fontWeight: FontWeight.w700,
                letterSpacing: -0.02,
                color: AppColors.primary,
              ),
            ),
          ),
          ALTokenChip(balance: '${user?.learnTokenBalance ?? 0} LT'),
        ],
      ),
    );
  }
}

/// Notification banner for upcoming exam
class _ExamNotificationBanner extends StatelessWidget {
  const _ExamNotificationBanner({
    required this.examTitle,
    required this.time,
    required this.onAction,
  });

  final String examTitle;
  final String time;
  final VoidCallback onAction;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primary, AppColors.primaryContainer],
        ),
        borderRadius: AppRadius.radiusXl,
        boxShadow: AppColors.ambientShadow,
      ),
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppColors.secondary,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Kỳ thi sắp tới',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.onPrimaryContainer,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  examTitle,
                  style: const TextStyle(
                    fontFamily: 'Manrope',
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: AppColors.onPrimary,
                    letterSpacing: -0.02,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Hôm nay lúc $time • Đã sẵn sàng',
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 13,
                    color: AppColors.onPrimaryContainer.withValues(alpha: 0.8),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          ElevatedButton(
            onPressed: onAction,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.secondaryContainer,
              foregroundColor: AppColors.onSecondaryContainer,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: AppRadius.radiusFull,
              ),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Kiểm tra',
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(width: 4),
                Icon(Icons.arrow_forward, size: 18),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Academic journey stats card
class _AcademicJourneyCard extends StatelessWidget {
  const _AcademicJourneyCard({
    required this.activeExams,
    required this.completed,
    required this.rank,
  });

  final int activeExams;
  final int completed;
  final int rank;

  @override
  Widget build(BuildContext context) {
    return ALCard(
      backgroundColor: AppColors.surfaceContainerLow,
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Hành trình học tập',
                    style: TextStyle(
                      fontFamily: 'Manrope',
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Tổng quan thành tích học tập kỳ hiện tại',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      color: AppColors.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
              Icon(
                Icons.analytics,
                size: 36,
                color: AppColors.primaryFixedDim,
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              _StatItem(label: 'Bài thi', value: '$activeExams'),
              _StatItem(label: 'Hoàn thành', value: '$completed'),
              _StatItem(label: 'Xếp hạng', value: '#$rank', valueColor: AppColors.secondary),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  const _StatItem({
    required this.label,
    required this.value,
    this.valueColor,
  });

  final String label;
  final String value;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.only(right: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerLowest,
          borderRadius: AppRadius.radiusLg,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label.toUpperCase(),
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 10,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.8,
                color: AppColors.outline,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(
                fontFamily: 'Manrope',
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: valueColor ?? AppColors.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// LearnToken achievement card (gold theme)
class _LearnTokenCard extends StatelessWidget {
  const _LearnTokenCard({
    required this.balance,
    required this.onRedeem,
    required this.onHistory,
  });

  final int balance;
  final VoidCallback onRedeem;
  final VoidCallback onHistory;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerHighest,
        borderRadius: AppRadius.radiusLg,
        boxShadow: AppColors.ambientShadow,
      ),
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'LearnTokens',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.tertiaryContainer,
                    ),
                  ),
                  Text(
                    'Kiếm được từ thành tích',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      color: AppColors.onTertiaryFixedVariant.withValues(alpha: 0.8),
                    ),
                  ),
                ],
              ),
              const Icon(
                Icons.monetization_on,
                size: 36,
                color: AppColors.tertiaryFixedDim,
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            '$balance',
            style: const TextStyle(
              fontFamily: 'Manrope',
              fontSize: 48,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.02,
              color: AppColors.onTertiaryFixedVariant,
            ),
          ),
          Text(
            'LT BALANCE',
            style: TextStyle(
              fontFamily: 'Manrope',
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.onTertiaryFixedVariant,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: onRedeem,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.tertiaryFixedDim,
                    foregroundColor: AppColors.onTertiaryFixed,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: AppRadius.radiusFull,
                    ),
                  ),
                  child: const Text(
                    'Đổi quà',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: onHistory,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white.withValues(alpha: 0.4),
                    foregroundColor: AppColors.onTertiaryFixed,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: AppRadius.radiusFull,
                      side: BorderSide(
                        color: AppColors.onTertiaryFixed.withValues(alpha: 0.2),
                      ),
                    ),
                  ),
                  child: const Text(
                    'Lịch sử',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Credential vault — horizontal scroll certificates
class _CredentialVault extends StatelessWidget {
  const _CredentialVault({required this.certificates});

  final List<_CertData> certificates;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Kho chứng chỉ',
              style: TextStyle(
                fontFamily: 'Manrope',
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            ),
            TextButton(
              onPressed: () {},
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Xem tất cả',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.secondary,
                    ),
                  ),
                  SizedBox(width: 4),
                  Icon(Icons.open_in_new, size: 16, color: AppColors.secondary),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 100,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: certificates.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final cert = certificates[index];
              return Container(
                width: 280,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerLowest,
                  borderRadius: AppRadius.radiusLg,
                  border: Border.all(
                    color: AppColors.outlineVariant.withValues(alpha: 0.1),
                  ),
                  boxShadow: AppColors.cardShadow,
                ),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: AppColors.secondaryContainer,
                        borderRadius: AppRadius.radiusMd,
                      ),
                      child: Icon(
                        cert.icon,
                        size: 28,
                        color: AppColors.onSecondaryContainer,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            cert.title,
                            style: const TextStyle(
                              fontFamily: 'Manrope',
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.onSurface,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Phát hành: ${cert.date}',
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 11,
                              color: AppColors.outline,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _CertData {
  const _CertData(this.title, this.date, this.icon);
  final String title;
  final String date;
  final IconData icon;
}

/// Upcoming schedule list
class _UpcomingSchedule extends StatelessWidget {
  const _UpcomingSchedule({required this.schedules});

  final List<_ScheduleData> schedules;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Lịch kiểm tra sắp tới',
          style: TextStyle(
            fontFamily: 'Manrope',
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 12),
        ...schedules.map((s) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _ScheduleCard(schedule: s),
            )),
      ],
    );
  }
}

class _ScheduleCard extends StatelessWidget {
  const _ScheduleCard({required this.schedule});

  final _ScheduleData schedule;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLow,
        borderRadius: AppRadius.radiusLg,
      ),
      child: Row(
        children: [
          // Date block
          SizedBox(
            width: 56,
            child: Column(
              children: [
                Text(
                  schedule.date.toUpperCase(),
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: AppColors.secondary,
                    letterSpacing: 1,
                  ),
                ),
                Text(
                  '${schedule.day}',
                  style: const TextStyle(
                    fontFamily: 'Manrope',
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: AppColors.onSurface,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          // Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  schedule.title,
                  style: const TextStyle(
                    fontFamily: 'Manrope',
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.onSurface,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(
                      Icons.schedule,
                      size: 14,
                      color: AppColors.outline,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      schedule.time,
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        color: AppColors.outline,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          // Chevron
          Icon(
            Icons.chevron_right,
            color: AppColors.outline,
          ),
        ],
      ),
    );
  }
}

class _ScheduleData {
  const _ScheduleData({
    required this.title,
    required this.date,
    required this.day,
    required this.time,
  });

  final String title;
  final String date;
  final int day;
  final String time;
}

import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/theme/app_spacing.dart';

/// Proctoring Monitor Screen
class ProctoringMonitorScreen extends StatefulWidget {
  const ProctoringMonitorScreen({super.key});

  @override
  State<ProctoringMonitorScreen> createState() => _ProctoringMonitorScreenState();
}

class _ProctoringMonitorScreenState extends State<ProctoringMonitorScreen> {
  int _activeAlerts = 5;
  bool _showAlertOnly = false;

  final _sessions = [
    _SessionData(
      name: 'Benjamin Carter',
      exam: 'Advanced Microeconomics • Sec 4',
      status: SessionStatus.flagged,
      alertReason: 'Nhiều khuôn mặt phát hiện',
      imageUrl: 'https://i.pravatar.cc/300?img=1',
    ),
    _SessionData(
      name: 'Sarah Jenkins',
      exam: 'Modern World History • Sec 1',
      status: SessionStatus.normal,
      imageUrl: 'https://i.pravatar.cc/300?img=5',
    ),
    _SessionData(
      name: 'David Chen',
      exam: 'Quantum Physics I • Sec 2',
      status: SessionStatus.normal,
      imageUrl: 'https://i.pravatar.cc/300?img=3',
    ),
    _SessionData(
      name: 'Elena Rodriguez',
      exam: 'Cognitive Neuroscience • Sec 1',
      status: SessionStatus.warning,
      alertReason: 'Lệch nhìn',
      imageUrl: 'https://i.pravatar.cc/300?img=9',
    ),
    _SessionData(
      name: 'Maya Thompson',
      exam: 'Organic Chemistry II • Sec 5',
      status: SessionStatus.normal,
      imageUrl: 'https://i.pravatar.cc/300?img=16',
    ),
    _SessionData(
      name: 'James Wilson',
      exam: 'Ethics in AI • Sec 1',
      status: SessionStatus.flagged,
      alertReason: 'Âm thanh phát hiện',
      imageUrl: 'https://i.pravatar.cc/300?img=11',
    ),
    _SessionData(
      name: 'Lucas Miller',
      exam: 'Data Structures • Sec 3',
      status: SessionStatus.normal,
      imageUrl: 'https://i.pravatar.cc/300?img=12',
    ),
    _SessionData(
      name: 'Sophie Laurent',
      exam: 'Civil Law Fundamentals • Sec 2',
      status: SessionStatus.normal,
      imageUrl: 'https://i.pravatar.cc/300?img=25',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final filtered = _showAlertOnly
        ? _sessions.where((s) => s.status != SessionStatus.normal).toList()
        : _sessions;

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.cardPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Giám sát phiên thời gian thực',
                        style: TextStyle(
                          fontFamily: 'Manrope', fontSize: 28, fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                        ),
                      ),
                      Text(
                        'Giám sát các luồng ứng viên đang hoạt động.',
                        style: TextStyle(
                          fontFamily: 'Inter', fontSize: 13, color: AppColors.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainerHighest,
                    borderRadius: AppRadius.radiusFull,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 8, height: 8,
                        decoration: const BoxDecoration(
                          color: AppColors.secondary, shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Text('42 Kỳ thi đang hoạt động', style: TextStyle(
                        fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      )),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
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
                        fontFamily: 'Manrope', fontSize: 12, fontWeight: FontWeight.w700,
                        color: AppColors.onTertiaryFixed,
                      )),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            // Filters
            Row(
              children: [
                _FilterBadge(label: 'Tất cả môn', icon: Icons.filter_list),
                const SizedBox(width: 12),
                GestureDetector(
                  onTap: () => setState(() => _showAlertOnly = !_showAlertOnly),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: _activeAlerts > 0 ? AppColors.errorContainer : AppColors.surfaceContainerLow,
                      borderRadius: AppRadius.radiusFull,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.warning,
                          size: 18,
                          color: _activeAlerts > 0 ? AppColors.error : AppColors.onSurfaceVariant,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          '$_activeAlerts Cảnh báo đang hoạt động',
                          style: TextStyle(
                            fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w700,
                            color: _activeAlerts > 0 ? AppColors.error : AppColors.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            // Session Grid
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 0.8,
              ),
              itemCount: filtered.length,
              itemBuilder: (context, index) {
                return _SessionCard(session: filtered[index]);
              },
            ),
            const SizedBox(height: 24),
            // Footer
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLow,
                borderRadius: AppRadius.radiusLg,
              ),
              child: Row(
                children: [
                  Row(
                    children: [
                      _AvatarStack(),
                      const SizedBox(width: 8),
                      const Text('4 proctors đang hoạt động', style: TextStyle(
                        fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w500,
                        color: AppColors.onSurfaceVariant,
                      )),
                    ],
                  ),
                  const Spacer(),
                  Row(
                    children: [
                      _PageButton(Icons.chevron_left),
                      _PageButton(null, label: '1', isActive: true),
                      _PageButton(null, label: '2'),
                      _PageButton(null, label: '3'),
                      _PageButton(Icons.chevron_right),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterBadge extends StatelessWidget {
  const _FilterBadge({required this.label, required this.icon});
  final String label;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLow,
        borderRadius: AppRadius.radiusFull,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: AppColors.onSurfaceVariant),
          const SizedBox(width: 6),
          Text(label, style: TextStyle(
            fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w600,
            color: AppColors.onSurfaceVariant,
          )),
        ],
      ),
    );
  }
}

enum SessionStatus { normal, warning, flagged }

class _SessionData {
  const _SessionData({
    required this.name,
    required this.exam,
    required this.status,
    this.alertReason,
    required this.imageUrl,
  });
  final String name;
  final String exam;
  final SessionStatus status;
  final String? alertReason;
  final String imageUrl;
}

class _SessionCard extends StatelessWidget {
  const _SessionCard({required this.session});

  final _SessionData session;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: AppRadius.radiusLg,
        boxShadow: AppColors.ambientShadow,
        border: session.status == SessionStatus.flagged
            ? Border.all(color: AppColors.error.withValues(alpha: 0.1), width: 1)
            : session.status == SessionStatus.warning
                ? Border.all(color: AppColors.tertiaryFixedDim.withValues(alpha: 0.2), width: 1)
                : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Camera thumbnail
          Stack(
            children: [
              Container(
                height: 100,
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerHigh,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                ),
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                  child: Image.network(
                    session.imageUrl,
                    fit: BoxFit.cover,
                    width: double.infinity,
                    errorBuilder: (_, __, ___) => Container(
                      color: AppColors.surfaceContainerHigh,
                      child: const Icon(Icons.person, size: 40, color: AppColors.outline),
                    ),
                  ),
                ),
              ),
              // Ring effect
              if (session.status == SessionStatus.flagged)
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                      border: Border.all(color: AppColors.error.withValues(alpha: 0.5), width: 2),
                    ),
                  ),
                ),
              if (session.status == SessionStatus.warning)
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                      border: Border.all(color: AppColors.tertiaryFixedDim.withValues(alpha: 0.5), width: 2),
                    ),
                  ),
                ),
              // Status badge
              Positioned(
                top: 8,
                right: 8,
                child: _StatusBadge(status: session.status),
              ),
              // Camera label
              Positioned(
                bottom: 8,
                left: 8,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.6),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    'CAM 01',
                    style: TextStyle(
                      fontFamily: 'Inter', fontSize: 9, fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
          // Info
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    session.name,
                    style: const TextStyle(
                      fontFamily: 'Inter', fontSize: 13, fontWeight: FontWeight.w700,
                      color: AppColors.onSurface,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    session.exam,
                    style: TextStyle(
                      fontFamily: 'Inter', fontSize: 10, color: AppColors.onSurfaceVariant,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const Spacer(),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          session.status == SessionStatus.flagged
                              ? session.alertReason ?? ''
                              : session.status == SessionStatus.warning
                                  ? session.alertReason ?? ''
                                  : 'Đã xác minh',
                          style: TextStyle(
                            fontFamily: 'Inter', fontSize: 9, fontWeight: FontWeight.w700,
                            color: session.status == SessionStatus.flagged
                                ? AppColors.error
                                : session.status == SessionStatus.warning
                                    ? AppColors.onTertiaryFixedVariant
                                    : AppColors.secondary,
                          ),
                        ),
                      ),
                      Icon(
                        Icons.chevron_right,
                        size: 18,
                        color: AppColors.outline,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final SessionStatus status;

  @override
  Widget build(BuildContext context) {
    final (label, bgColor, textColor, isPulse) = switch (status) {
      SessionStatus.normal => ('BÌNH THƯỜNG', AppColors.secondary, AppColors.onSecondary, false),
      SessionStatus.warning => ('CẢNH BÁO', AppColors.tertiaryFixedDim, AppColors.onTertiaryFixed, false),
      SessionStatus.flagged => ('FLAGGED', AppColors.error, AppColors.onError, true),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: AppRadius.radiusFull,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (isPulse) ...[
            _PulsingDot(color: textColor),
            const SizedBox(width: 4),
          ],
          if (status == SessionStatus.normal)
            Icon(Icons.check_circle, size: 12, color: textColor),
          if (status == SessionStatus.normal) const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontFamily: 'Inter', fontSize: 9, fontWeight: FontWeight.w700,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}

class _PulsingDot extends StatefulWidget {
  const _PulsingDot({required this.color});
  final Color color;

  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (_, __) => Container(
        width: 6, height: 6,
        decoration: BoxDecoration(
          color: widget.color.withValues(alpha: _controller.value),
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}

class _AvatarStack extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 80,
      height: 32,
      child: Stack(
        children: List.generate(3, (i) {
          return Positioned(
            left: i * 20.0,
            child: Container(
              width: 28, height: 28,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.surface, width: 2),
              ),
              child: CircleAvatar(
                radius: 12,
                backgroundImage: NetworkImage('https://i.pravatar.cc/40?img=${i + 1}'),
              ),
            ),
          );
        }),
      ),
    );
  }
}

class _PageButton extends StatelessWidget {
  const _PageButton(this.icon, {this.label, this.isActive = false});
  final IconData? icon;
  final String? label;
  final bool isActive;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36, height: 36,
      margin: const EdgeInsets.only(left: 4),
      decoration: BoxDecoration(
        color: isActive ? AppColors.primary : AppColors.surfaceContainerLowest,
        borderRadius: AppRadius.radiusFull,
      ),
      child: Center(
        child: icon != null
            ? Icon(icon, size: 20, color: AppColors.outline)
            : Text(label!, style: TextStyle(
                fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w700,
                color: isActive ? AppColors.onPrimary : AppColors.onSurface,
              )),
      ),
    );
  }
}

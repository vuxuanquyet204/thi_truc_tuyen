import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/theme/app_spacing.dart';

/// Profile Screen
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

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
          SliverToBoxAdapter(child: _ProfileHeader()),
          SliverPadding(
            padding: const EdgeInsets.all(AppSpacing.screenPadding),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                _StatsRow(),
                const SizedBox(height: 24),
                _SettingsGroup(
                  title: 'THÔNG TIN CÁ NHÂN',
                  items: const [
                    _SettingsItemData(Icons.person, 'Họ và Tên', 'Nguyễn Minh Khôi'),
                    _SettingsItemData(Icons.mail, 'Email', 'khoi.nm214532@sis.hust.edu.vn'),
                    _SettingsItemData(Icons.call, 'Số điện thoại', '+84 90 ••• ••78'),
                  ],
                ),
                const SizedBox(height: 16),
                _SettingsGroup(
                  title: 'BẢO MẬT & TÀI KHOẢN',
                  items: const [
                    _SettingsItemData(Icons.lock_reset, 'Đổi mật khẩu', null),
                    _SettingsItemData(Icons.enhanced_encryption, 'Xác thực 2 lớp', 'Đang bật'),
                  ],
                ),
                const SizedBox(height: 16),
                _SettingsGroup(
                  title: 'CÀI ĐẶT ỨNG DỤNG',
                  items: const [
                    _SettingsItemData(Icons.notifications_active, 'Thông báo', null, hasToggle: true),
                    _SettingsItemData(Icons.language, 'Ngôn ngữ', 'Tiếng Việt'),
                  ],
                ),
                const SizedBox(height: 16),
                _SettingsGroup(
                  title: 'HỖ TRỢ',
                  items: const [
                    _SettingsItemData(Icons.help_center, 'Trung tâm trợ giúp', null, hasArrow: true),
                  ],
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => context.go('/login'),
                    icon: const Icon(Icons.logout, color: Color(0xFFBA1A1A)),
                    label: const Text('Đăng xuất'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFBA1A1A),
                      side: const BorderSide(color: Color(0xFFFFDAD6)),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: AppRadius.radiusLg),
                    ),
                  ),
                ),
                const SizedBox(height: 100),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.screenPadding),
      child: Column(
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.surfaceContainerHighest, width: 4),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.secondary.withValues(alpha: 0.2),
                      blurRadius: 20,
                    ),
                  ],
                ),
                child: const CircleAvatar(
                  radius: 48,
                  backgroundImage: NetworkImage('https://i.pravatar.cc/150?img=12'),
                ),
              ),
              Positioned(
                right: 0,
                bottom: 0,
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: const BoxDecoration(
                    color: AppColors.tertiaryFixedDim,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.verified, size: 16, color: AppColors.onTertiaryFixed,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.tertiaryFixed,
              borderRadius: AppRadius.radiusFull,
            ),
            child: const Text(
              'HỌC GIẢ ƯU TÚ',
              style: TextStyle(
                fontFamily: 'Inter', fontSize: 10, fontWeight: FontWeight.w700,
                color: AppColors.onTertiaryFixedVariant, letterSpacing: 0.5,
              ),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Nguyễn Minh Khôi',
            style: TextStyle(
              fontFamily: 'Manrope', fontSize: 24, fontWeight: FontWeight.w800,
              color: AppColors.primary,
            ),
          ),
          Text(
            'MSSV: 20214532 • SOICT',
            style: TextStyle(
              fontFamily: 'Inter', fontSize: 13, color: AppColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => context.go('/profile/edit'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.onPrimary,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: AppRadius.radiusFull),
            ),
            child: const Text('Chỉnh sửa hồ sơ'),
          ),
        ],
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _StatBox(label: 'Bài thi', value: '42'),
        const SizedBox(width: 12),
        _StatBox(label: 'GPA', value: '3.85'),
        const SizedBox(width: 12),
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.tertiaryFixedDim,
              borderRadius: AppRadius.radiusLg,
            ),
            child: Column(
              children: [
                const Icon(Icons.stars, color: AppColors.onTertiaryFixed, size: 24),
                const SizedBox(height: 4),
                const Text('1,250', style: TextStyle(
                  fontFamily: 'Manrope', fontSize: 22, fontWeight: FontWeight.w800,
                  color: AppColors.onTertiaryFixedVariant,
                )),
                Text('LT', style: TextStyle(
                  fontFamily: 'Inter', fontSize: 11, fontWeight: FontWeight.w600,
                  color: AppColors.onTertiaryFixedVariant,
                )),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _StatBox extends StatelessWidget {
  const _StatBox({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerLowest,
          borderRadius: AppRadius.radiusLg,
        ),
        child: Column(
          children: [
            Text(
              value,
              style: const TextStyle(
                fontFamily: 'Manrope', fontSize: 24, fontWeight: FontWeight.w800,
                color: AppColors.primary,
              ),
            ),
            Text(label, style: TextStyle(
              fontFamily: 'Inter', fontSize: 11, fontWeight: FontWeight.w600,
              color: AppColors.onSurfaceVariant, letterSpacing: 0.5,
            )),
          ],
        ),
      ),
    );
  }
}

class _SettingsGroup extends StatelessWidget {
  const _SettingsGroup({required this.title, required this.items});

  final String title;
  final List<_SettingsItemData> items;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 16, bottom: 8),
          child: Text(
            title,
            style: TextStyle(
              fontFamily: 'Inter', fontSize: 11, fontWeight: FontWeight.w700,
              color: AppColors.onSurfaceVariant, letterSpacing: 0.5,
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: AppColors.surfaceContainerLow,
            borderRadius: AppRadius.radiusLg,
          ),
          child: Column(
            children: List.generate(items.length, (index) {
              final item = items[index];
              return _SettingsItem(
                icon: item.icon,
                title: item.title,
                value: item.value,
                hasToggle: item.hasToggle,
                hasArrow: item.hasArrow,
                isLast: index == items.length - 1,
              );
            }),
          ),
        ),
      ],
    );
  }
}

class _SettingsItemData {
  const _SettingsItemData(this.icon, this.title, this.value, {this.hasToggle = false, this.hasArrow = false});
  final IconData icon;
  final String title;
  final String? value;
  final bool hasToggle;
  final bool hasArrow;
}

class _SettingsItem extends StatelessWidget {
  const _SettingsItem({
    required this.icon,
    required this.title,
    this.value,
    this.hasToggle = false,
    this.hasArrow = false,
    this.isLast = false,
  });

  final IconData icon;
  final String title;
  final String? value;
  final bool hasToggle;
  final bool hasArrow;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: isLast ? AppRadius.radiusLg : null,
      ),
      child: Row(
        children: [
          Icon(icon, size: 22, color: AppColors.primary),
          const SizedBox(width: 16),
          Expanded(
            child: Text(title, style: TextStyle(
              fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w600,
              color: AppColors.onSurface,
            )),
          ),
          if (value != null)
            Text(value!, style: TextStyle(
              fontFamily: 'Inter', fontSize: 13, color: AppColors.onSurfaceVariant,
            )),
          if (hasToggle) ...[
            const SizedBox(width: 12),
            Switch(
              value: true,
              onChanged: (_) {},
              activeTrackColor: AppColors.primary,
              activeThumbColor: AppColors.primaryContainer,
            ),
          ],
          if (hasArrow)
            const Icon(Icons.chevron_right, color: AppColors.outline),
        ],
      ),
    );
  }
}

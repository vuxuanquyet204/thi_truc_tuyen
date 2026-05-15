import 'dart:ui';
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';

/// Academic Luminary Bottom Navigation Bar
/// Glassmorphism style with backdrop blur
/// Fixed at bottom, rounded-top-3xl
class ALBottomNavBar extends StatelessWidget {
  const ALBottomNavBar({
    super.key,
    required this.items,
    required this.currentIndex,
    required this.onTap,
  });

  final List<ALNavItem> items;
  final int currentIndex;
  final ValueChanged<int> onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest.withValues(alpha: 0.85),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(AppRadius.bottomNav),
          topRight: Radius.circular(AppRadius.bottomNav),
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.onSurface.withValues(alpha: 0.06),
            blurRadius: 40,
            offset: const Offset(0, -12),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(AppRadius.bottomNav),
          topRight: Radius.circular(AppRadius.bottomNav),
        ),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            height: AppSpacing.bottomNavHeight,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.base,
              vertical: AppSpacing.sm,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(items.length, (index) {
                return _buildNavItem(index);
              }),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index) {
    final item = items[index];
    final isSelected = index == currentIndex;

    return Expanded(
      child: GestureDetector(
        onTap: () => onTap(index),
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.xs,
          ),
          decoration: BoxDecoration(
            color: isSelected
                ? AppColors.surfaceContainerHighest
                : Colors.transparent,
            borderRadius: isSelected ? AppRadius.radiusFull : null,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                item.icon,
                size: AppSpacing.iconLg,
                color: isSelected
                    ? AppColors.primary
                    : AppColors.onSurface.withValues(alpha: 0.5),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                item.label,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 11,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: isSelected
                      ? AppColors.primary
                      : AppColors.onSurface.withValues(alpha: 0.5),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Navigation item model
class ALNavItem {
  const ALNavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });

  final IconData icon;
  final IconData activeIcon;
  final String label;
}

/// Default candidate bottom nav items
const List<ALNavItem> candidateNavItems = [
  ALNavItem(
    icon: Icons.home_outlined,
    activeIcon: Icons.home,
    label: 'Trang chủ',
  ),
  ALNavItem(
    icon: Icons.quiz_outlined,
    activeIcon: Icons.quiz,
    label: 'Bài thi',
  ),
  ALNavItem(
    icon: Icons.analytics_outlined,
    activeIcon: Icons.analytics,
    label: 'Kết quả',
  ),
  ALNavItem(
    icon: Icons.person_outline,
    activeIcon: Icons.person,
    label: 'Hồ sơ',
  ),
];

/// LearnToken bottom nav items (candidate with rewards active)
const List<ALNavItem> learnTokenNavItems = [
  ALNavItem(
    icon: Icons.home_outlined,
    activeIcon: Icons.home,
    label: 'Trang chủ',
  ),
  ALNavItem(
    icon: Icons.military_tech_outlined,
    activeIcon: Icons.military_tech,
    label: 'Phần thưởng',
  ),
  ALNavItem(
    icon: Icons.leaderboard_outlined,
    activeIcon: Icons.leaderboard,
    label: 'Xếp hạng',
  ),
  ALNavItem(
    icon: Icons.person_outline,
    activeIcon: Icons.person,
    label: 'Cá nhân',
  ),
];

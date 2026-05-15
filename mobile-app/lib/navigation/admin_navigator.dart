import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../screens/admin_dashboard_screen.dart';
import '../screens/proctoring_monitor_screen.dart';
import '../../core/theme/app_colors.dart';

/// Admin navigator — sidebar shell for admin routes
class AdminNavigator extends StatelessWidget {
  const AdminNavigator({
    super.key,
    required this.child,
    required this.location,
  });

  final Widget child;
  final String location;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          _AdminSidebar(currentPath: location),
          Expanded(child: child),
        ],
      ),
    );
  }

  static final GoRouter router = GoRouter(
    initialLocation: '/admin',
    routes: [
      ShellRoute(
        builder: (context, state, child) {
          return AdminNavigator(
            location: state.uri.path,
            child: child,
          );
        },
        routes: [
          GoRoute(
            path: '/admin',
            name: 'admin-dashboard',
            builder: (context, state) => const AdminDashboardScreen(),
          ),
          GoRoute(
            path: '/admin/proctoring',
            name: 'proctoring-monitor',
            builder: (context, state) => const ProctoringMonitorScreen(),
          ),
        ],
      ),
    ],
  );
}

class _AdminSidebar extends StatelessWidget {
  const _AdminSidebar({required this.currentPath});

  final String currentPath;

  @override
  Widget build(BuildContext context) {
    final items = [
      _SidebarItem('Tổng quan', Icons.dashboard_outlined, '/admin', Icons.dashboard),
      _SidebarItem('Giám sát', Icons.visibility_outlined, '/admin/proctoring', Icons.visibility),
    ];

    return Container(
      width: 240,
      color: AppColors.surfaceContainerLowest,
      child: Column(
        children: [
          const SizedBox(height: 24),
          // Logo
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                Icon(Icons.school, color: AppColors.primary, size: 32),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Academic\nLuminary',
                    style: TextStyle(
                      fontFamily: 'Manrope',
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                      height: 1.2,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Divider(color: AppColors.outlineVariant),
          ),
          const SizedBox(height: 16),
          // Nav items
          ...items.map((item) => _SidebarNavItem(
                item: item,
                isActive: currentPath.startsWith(item.path),
                onTap: () => context.go(item.path),
              )),
          const Spacer(),
          // Logout
          Padding(
            padding: const EdgeInsets.all(16),
            child: ListTile(
              leading: const Icon(Icons.logout, color: AppColors.error),
              title: const Text(
                'Đăng xuất',
                style: TextStyle(fontFamily: 'Inter', fontSize: 13, color: AppColors.error),
              ),
              onTap: () => context.go('/login'),
            ),
          ),
        ],
      ),
    );
  }
}

class _SidebarItem {
  const _SidebarItem(this.label, this.icon, this.path, this.activeIcon);
  final String label;
  final IconData icon;
  final String path;
  final IconData activeIcon;
}

class _SidebarNavItem extends StatelessWidget {
  const _SidebarNavItem({
    required this.item,
    required this.isActive,
    required this.onTap,
  });

  final _SidebarItem item;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16),
        leading: Icon(
          isActive ? item.activeIcon : item.icon,
          color: isActive ? AppColors.primary : AppColors.onSurfaceVariant,
          size: 22,
        ),
        title: Text(
          item.label,
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 13,
            fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
            color: isActive ? AppColors.primary : AppColors.onSurfaceVariant,
          ),
        ),
        tileColor: isActive
            ? AppColors.primary.withValues(alpha: 0.08)
            : Colors.transparent,
        selected: isActive,
        selectedTileColor: AppColors.primary.withValues(alpha: 0.08),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        onTap: onTap,
      ),
    );
  }
}

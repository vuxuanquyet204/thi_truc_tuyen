import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../contexts/auth_context.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/otp_screen.dart';
import '../features/home/screens/home_screen.dart';
import '../features/exams/screens/exam_list_screen.dart';
import '../features/exams/screens/exam_detail_screen.dart';
import '../features/exams/screens/exam_session_screen.dart';
import '../features/results/screens/results_list_screen.dart';
import '../features/results/screens/result_detail_screen.dart';
import '../features/profile/screens/profile_screen.dart';
import '../features/profile/screens/edit_profile_screen.dart';
import '../features/learn_token/screens/learn_token_screen.dart';
import '../features/admin/screens/admin_dashboard_screen.dart';
import '../features/admin/screens/proctoring_monitor_screen.dart';
import 'routes.dart';

/// App Router configuration using GoRouter
class AppRouter {
  AppRouter._();

  static final navigatorKey = GlobalKey<NavigatorState>();

  static GoRouter createRouter(AuthContext authContext) {
    return GoRouter(
      navigatorKey: navigatorKey,
      initialLocation: AppRoutes.home,
      debugLogDiagnostics: true,
      redirect: (context, state) {
        final isLoggedIn = authContext.isLoggedIn;
        final needsOTP = authContext.needsOTPVerification;
        final currentPath = state.uri.path;

        // Allow auth routes without login
        if (currentPath == AppRoutes.login || currentPath == AppRoutes.otp) {
          if (needsOTP) return AppRoutes.otp;
          if (isLoggedIn) return AppRoutes.home;
          return null;
        }

        // Require login for all other routes
        if (!isLoggedIn) {
          return needsOTP ? AppRoutes.otp : AppRoutes.login;
        }

        // Require OTP verification
        if (needsOTP) return AppRoutes.otp;

        // Default redirect
        return null;
      },
      routes: [
        // Auth routes
        GoRoute(
          path: AppRoutes.login,
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: AppRoutes.otp,
          builder: (context, state) => const OTPScreen(),
        ),

        // Candidate routes (with bottom nav shell)
        ShellRoute(
          builder: (context, state, child) {
            return CandidateShell(child: child);
          },
          routes: [
            GoRoute(
              path: AppRoutes.home,
              builder: (context, state) => const HomeScreen(),
            ),
            GoRoute(
              path: AppRoutes.exams,
              builder: (context, state) => const ExamListScreen(),
            ),
            GoRoute(
              path: AppRoutes.examDetail,
              builder: (context, state) {
                final id = state.pathParameters['id']!;
                return ExamDetailScreen(examId: id);
              },
            ),
            GoRoute(
              path: AppRoutes.results,
              builder: (context, state) => const ResultsListScreen(),
            ),
            GoRoute(
              path: AppRoutes.resultDetail,
              builder: (context, state) {
                final id = state.pathParameters['id']!;
                return ResultDetailScreen(resultId: id);
              },
            ),
            GoRoute(
              path: AppRoutes.profile,
              builder: (context, state) => const ProfileScreen(),
            ),
            GoRoute(
              path: AppRoutes.editProfile,
              builder: (context, state) => const EditProfileScreen(),
            ),
            GoRoute(
              path: AppRoutes.learnTokens,
              builder: (context, state) => const LearnTokenScreen(),
            ),
          ],
        ),

        // Exam session (full screen, no shell)
        GoRoute(
          path: AppRoutes.examSession,
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return ExamSessionScreen(examId: id);
          },
        ),

        // Admin routes
        ShellRoute(
          builder: (context, state, child) {
            return AdminShell(child: child);
          },
          routes: [
            GoRoute(
              path: AppRoutes.admin,
              builder: (context, state) => const AdminDashboardScreen(),
            ),
            GoRoute(
              path: AppRoutes.adminMonitor,
              builder: (context, state) => const ProctoringMonitorScreen(),
            ),
          ],
        ),
      ],
      errorBuilder: (context, state) => Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text('Page not found: ${state.uri.path}'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => context.go(AppRoutes.home),
                child: const Text('Go Home'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Candidate shell with bottom navigation
class CandidateShell extends StatelessWidget {
  const CandidateShell({super.key, required this.child});

  final Widget child;

  int _getCurrentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    if (location.startsWith(AppRoutes.exams)) return 1;
    if (location.startsWith(AppRoutes.results)) return 2;
    if (location.startsWith(AppRoutes.profile)) return 3;
    return 0; // home
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: _buildBottomNav(context),
    );
  }

  Widget _buildBottomNav(BuildContext context) {
    final currentIndex = _getCurrentIndex(context);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.9),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF071E27).withValues(alpha: 0.06),
            blurRadius: 40,
            offset: const Offset(0, -12),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _NavItem(
                icon: Icons.home_outlined,
                activeIcon: Icons.home,
                label: 'Trang chủ',
                isSelected: currentIndex == 0,
                onTap: () => context.go(AppRoutes.home),
              ),
              _NavItem(
                icon: Icons.quiz_outlined,
                activeIcon: Icons.quiz,
                label: 'Bài thi',
                isSelected: currentIndex == 1,
                onTap: () => context.go(AppRoutes.exams),
              ),
              _NavItem(
                icon: Icons.analytics_outlined,
                activeIcon: Icons.analytics,
                label: 'Kết quả',
                isSelected: currentIndex == 2,
                onTap: () => context.go(AppRoutes.results),
              ),
              _NavItem(
                icon: Icons.person_outline,
                activeIcon: Icons.person,
                label: 'Hồ sơ',
                isSelected: currentIndex == 3,
                onTap: () => context.go(AppRoutes.profile),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: isSelected
                ? const Color(0xFFCFE6F2)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(9999),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isSelected ? activeIcon : icon,
                size: 24,
                color: isSelected
                    ? const Color(0xFF003178)
                    : const Color(0xFF071E27).withValues(alpha: 0.5),
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 11,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: isSelected
                      ? const Color(0xFF003178)
                      : const Color(0xFF071E27).withValues(alpha: 0.5),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Admin shell with sidebar navigation
class AdminShell extends StatefulWidget {
  const AdminShell({super.key, required this.child});

  final Widget child;

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // Sidebar
          Container(
            width: 280,
            decoration: BoxDecoration(
              color: const Color(0xFFE6F6FF),
              borderRadius: const BorderRadius.only(
                topRight: Radius.circular(16),
                bottomRight: Radius.circular(16),
              ),
            ),
            child: Column(
              children: [
                const SizedBox(height: 32),
                // Logo
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 24),
                  child: Row(
                    children: [
                      Icon(
                        Icons.school,
                        color: Color(0xFF003178),
                        size: 28,
                      ),
                      SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Academic Luminary',
                          style: TextStyle(
                            fontFamily: 'Manrope',
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF003178),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                // Admin info
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Row(
                    children: [
                      const CircleAvatar(
                        radius: 20,
                        backgroundColor: Color(0xFFCFE6F2),
                        child: Icon(Icons.person, color: Color(0xFF003178)),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Admin Portal',
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF003178),
                            ),
                          ),
                          Text(
                            'Institutional Lead',
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 11,
                              color: const Color(0xFF071E27).withValues(alpha: 0.5),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                // Navigation items
                _SidebarItem(
                  icon: Icons.dashboard,
                  label: 'Dashboard',
                  isSelected: _selectedIndex == 0,
                  onTap: () => setState(() => _selectedIndex = 0),
                ),
                _SidebarItem(
                  icon: Icons.edit_note,
                  label: 'Management',
                  isSelected: _selectedIndex == 1,
                  onTap: () => setState(() => _selectedIndex = 1),
                ),
                _SidebarItem(
                  icon: Icons.visibility,
                  label: 'Monitoring',
                  isSelected: _selectedIndex == 2,
                  onTap: () => setState(() => _selectedIndex = 2),
                ),
                const Spacer(),
                // System status
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFCFE6F2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 10,
                          height: 10,
                          decoration: const BoxDecoration(
                            color: Color(0xFF006A6A),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'System Optimal',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF006A6A),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Main content
          Expanded(
            child: widget.child,
          ),
        ],
      ),
    );
  }
}

class _SidebarItem extends StatelessWidget {
  const _SidebarItem({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
        padding: EdgeInsets.only(
          left: isSelected ? 16 : 20,
          right: 16,
          top: 12,
          bottom: 12,
        ),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFCFE6F2) : Colors.transparent,
          border: isSelected
              ? const Border(
                  left: BorderSide(
                    color: Color(0xFF003178),
                    width: 4,
                  ),
                )
              : null,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 22,
              color: isSelected
                  ? const Color(0xFF003178)
                  : const Color(0xFF071E27).withValues(alpha: 0.5),
            ),
            const SizedBox(width: 12),
            Text(
              label,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: isSelected
                    ? const Color(0xFF003178)
                    : const Color(0xFF071E27).withValues(alpha: 0.5),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../screens/home_screen.dart';
import '../screens/exam_list_screen.dart';
import '../screens/exam_detail_screen.dart';
import '../screens/exam_session_screen.dart';
import '../screens/results_list_screen.dart';
import '../screens/result_detail_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/edit_profile_screen.dart';
import '../screens/learn_token_screen.dart';
import '../../core/components/al_bottom_nav.dart';

/// Candidate navigator — bottom nav shell for candidate routes
class CandidateNavigator extends StatelessWidget {
  const CandidateNavigator({
    super.key,
    required this.child,
    required this.location,
  });

  final Widget child;
  final String location;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: ALBottomNavBar(currentPath: location),
    );
  }

  static final _routes = [
    '/home',
    '/exams',
    '/results',
    '/token',
    '/profile',
  ];

  static int _indexFromLocation(String location) {
    if (location.startsWith('/home')) return 0;
    if (location.startsWith('/exams')) return 1;
    if (location.startsWith('/results')) return 2;
    if (location.startsWith('/token')) return 3;
    if (location.startsWith('/profile')) return 4;
    return 0;
  }

  static String _locationFromIndex(int index) => _routes[index];

  static final GoRouter router = GoRouter(
    initialLocation: '/home',
    routes: [
      ShellRoute(
        builder: (context, state, child) {
          return CandidateNavigator(
            location: state.uri.path,
            child: child,
          );
        },
        routes: [
          GoRoute(
            path: '/home',
            name: 'home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/exams',
            name: 'exams',
            builder: (context, state) => const ExamListScreen(),
            routes: [
              GoRoute(
                path: ':examId',
                name: 'exam-detail',
                builder: (context, state) => ExamDetailScreen(
                  examId: state.pathParameters['examId']!,
                ),
                routes: [
                  GoRoute(
                    path: 'session',
                    name: 'exam-session',
                    builder: (context, state) => ExamSessionScreen(
                      examId: state.pathParameters['examId']!,
                    ),
                  ),
                ],
              ),
            ],
          ),
          GoRoute(
            path: '/results',
            name: 'results',
            builder: (context, state) => const ResultsListScreen(),
            routes: [
              GoRoute(
                path: ':resultId',
                name: 'result-detail',
                builder: (context, state) => ResultDetailScreen(
                  resultId: state.pathParameters['resultId']!,
                ),
              ),
            ],
          ),
          GoRoute(
            path: '/token',
            name: 'token',
            builder: (context, state) => const LearnTokenScreen(),
          ),
          GoRoute(
            path: '/profile',
            name: 'profile',
            builder: (context, state) => const ProfileScreen(),
            routes: [
              GoRoute(
                path: 'edit',
                name: 'edit-profile',
                builder: (context, state) => const EditProfileScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

/// Route name constants
abstract final class AppRoutes {
  AppRoutes._();

  // Auth
  static const String login = '/login';
  static const String otp = '/otp';

  // Candidate
  static const String home = '/home';
  static const String exams = '/exams';
  static const String examDetail = '/exams/:id';
  static const String examSession = '/exam-session/:id';
  static const String examRules = '/exam-rules/:id';
  static const String results = '/results';
  static const String resultDetail = '/results/:id';
  static const String profile = '/profile';
  static const String editProfile = '/profile/edit';
  static const String learnTokens = '/tokens';

  // Admin
  static const String admin = '/admin';
  static const String adminMonitor = '/admin/monitor';
}

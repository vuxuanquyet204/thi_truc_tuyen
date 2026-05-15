/// Admin statistics model
class AdminStats {
  const AdminStats({
    required this.activeCandidates,
    this.totalCandidates = 0,
    this.avgScore = 0,
    this.targetScore = 90,
    this.examsCompletedToday = 0,
    this.totalExamsToday = 0,
    this.tokenVelocity = 0,
    this.activeExams = 0,
    this.alertsActive = 0,
    this.distribution = const {},
    this.recentActivities = const [],
    this.tokenEconomy = const {},
  });

  final int activeCandidates;
  final int totalCandidates;
  final double avgScore;
  final double targetScore;
  final int examsCompletedToday;
  final int totalExamsToday;
  final int tokenVelocity;
  final int activeExams;
  final int alertsActive;
  final Map<String, double> distribution; // e.g. {'Mon': 40, 'Tue': 65}
  final List<ActivityEntry> recentActivities;
  final Map<String, dynamic> tokenEconomy;

  double get scoreProgress => targetScore > 0 ? (avgScore / targetScore).clamp(0.0, 1.0) : 0;

  factory AdminStats.fromJson(Map<String, dynamic> json) {
    return AdminStats(
      activeCandidates: json['active_candidates'] as int,
      totalCandidates: json['total_candidates'] as int? ?? 0,
      avgScore: (json['avg_score'] as num?)?.toDouble() ?? 0,
      targetScore: (json['target_score'] as num?)?.toDouble() ?? 90,
      examsCompletedToday: json['exams_completed_today'] as int? ?? 0,
      totalExamsToday: json['total_exams_today'] as int? ?? 0,
      tokenVelocity: json['token_velocity'] as int? ?? 0,
      activeExams: json['active_exams'] as int? ?? 0,
      alertsActive: json['alerts_active'] as int? ?? 0,
      distribution: (json['distribution'] as Map<String, dynamic>?)?.map(
            (key, value) => MapEntry(key, (value as num).toDouble()),
          ) ??
          {},
      recentActivities: (json['recent_activities'] as List<dynamic>?)
              ?.map((e) => ActivityEntry.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      tokenEconomy:
          json['token_economy'] as Map<String, dynamic>? ?? {},
    );
  }

  Map<String, dynamic> toJson() => {
        'active_candidates': activeCandidates,
        'total_candidates': totalCandidates,
        'avg_score': avgScore,
        'target_score': targetScore,
        'exams_completed_today': examsCompletedToday,
        'total_exams_today': totalExamsToday,
        'token_velocity': tokenVelocity,
        'active_exams': activeExams,
        'alerts_active': alertsActive,
        'distribution': distribution,
        'recent_activities': recentActivities.map((e) => e.toJson()).toList(),
        'token_economy': tokenEconomy,
      };
}

/// Activity log entry for admin dashboard
class ActivityEntry {
  const ActivityEntry({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.timestamp,
  });

  final String id;
  final String title;
  final String description;
  final ActivityType type;
  final DateTime timestamp;

  factory ActivityEntry.fromJson(Map<String, dynamic> json) {
    return ActivityEntry(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      type: ActivityType.fromString(json['type'] as String?),
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'type': type.name,
        'timestamp': timestamp.toIso8601String(),
      };
}

enum ActivityType {
  exam,
  token,
  integrity,
  proctor;

  static ActivityType fromString(String? value) => switch (value) {
        'exam' => ActivityType.exam,
        'token' => ActivityType.token,
        'integrity' => ActivityType.integrity,
        'proctor' => ActivityType.proctor,
        _ => ActivityType.exam,
      };
}

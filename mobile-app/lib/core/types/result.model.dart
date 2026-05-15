/// Result model for completed exams
class Result {
  const Result({
    required this.id,
    required this.examId,
    required this.examTitle,
    required this.score,
    this.maxScore = 100,
    this.passingScore = 50,
    required this.completedAt,
    this.durationMinutes,
    this.earnedTokens = 0,
    this.rank,
    this.totalParticipants,
    this.skillScores = const {},
    this.feedback,
    this.certificateUrl,
  });

  final String id;
  final String examId;
  final String examTitle;
  final int score;
  final int maxScore;
  final int passingScore;
  final DateTime completedAt;
  final int? durationMinutes;
  final int earnedTokens;
  final int? rank;
  final int? totalParticipants;
  final Map<String, int> skillScores; // e.g. {'logic': 92, 'speed': 78}
  final String? feedback;
  final String? certificateUrl;

  bool get isPassed => score >= passingScore;
  bool get isExcellent => score >= 90;

  String get gradeLabel {
    if (score >= 90) return 'Xuất sắc';
    if (score >= 70) return 'Khá';
    if (score >= 50) return 'Trung bình';
    return 'Yếu';
  }

  double get scorePercentage => maxScore > 0 ? (score / maxScore * 100) : 0;

  factory Result.fromJson(Map<String, dynamic> json) {
    return Result(
      id: json['id'] as String,
      examId: json['exam_id'] as String,
      examTitle: json['exam_title'] as String,
      score: json['score'] as int,
      maxScore: json['max_score'] as int? ?? 100,
      passingScore: json['passing_score'] as int? ?? 50,
      completedAt: DateTime.parse(json['completed_at'] as String),
      durationMinutes: json['duration_minutes'] as int?,
      earnedTokens: json['earned_tokens'] as int? ?? 0,
      rank: json['rank'] as int?,
      totalParticipants: json['total_participants'] as int?,
      skillScores:
          (json['skill_scores'] as Map<String, dynamic>?)?.map(
                (key, value) => MapEntry(key, value as int),
              ) ??
              {},
      feedback: json['feedback'] as String?,
      certificateUrl: json['certificate_url'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'exam_id': examId,
        'exam_title': examTitle,
        'score': score,
        'max_score': maxScore,
        'passing_score': passingScore,
        'completed_at': completedAt.toIso8601String(),
        'duration_minutes': durationMinutes,
        'earned_tokens': earnedTokens,
        'rank': rank,
        'total_participants': totalParticipants,
        'skill_scores': skillScores,
        'feedback': feedback,
        'certificate_url': certificateUrl,
      };
}

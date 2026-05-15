/// Exam model
class Exam {
  const Exam({
    required this.id,
    required this.title,
    required this.status,
    required this.questionCount,
    required this.durationMinutes,
    this.description,
    this.subject,
    this.remainingMinutes,
    this.scheduleDate,
    this.scheduleEndDate,
    this.score,
    this.maxScore = 100,
    this.passingScore = 50,
    this.rules = const [],
    this.proctored = false,
  });

  final String id;
  final String title;
  final String status; // ongoing, upcoming, completed
  final int questionCount;
  final int durationMinutes;
  final String? description;
  final String? subject;
  final int? remainingMinutes;
  final String? scheduleDate;
  final String? scheduleEndDate;
  final int? score;
  final int maxScore;
  final int passingScore;
  final List<String> rules;
  final bool proctored;

  bool get isOngoing => status == 'ongoing';
  bool get isUpcoming => status == 'upcoming';
  bool get isCompleted => status == 'completed';
  bool get isPassed => score != null && score! >= passingScore;
  bool get isExcellent => score != null && score! >= 90;

  String get statusLabel => switch (status) {
        'ongoing' => 'Đang diễn ra',
        'upcoming' => 'Sắp tới',
        'completed' => 'Đã hoàn thành',
        _ => status,
      };

  factory Exam.fromJson(Map<String, dynamic> json) {
    return Exam(
      id: json['id'] as String,
      title: json['title'] as String,
      status: json['status'] as String,
      questionCount: json['question_count'] as int,
      durationMinutes: json['duration_minutes'] as int,
      description: json['description'] as String?,
      subject: json['subject'] as String?,
      remainingMinutes: json['remaining_minutes'] as int?,
      scheduleDate: json['schedule_date'] as String?,
      scheduleEndDate: json['schedule_end_date'] as String?,
      score: json['score'] as int?,
      maxScore: json['max_score'] as int? ?? 100,
      passingScore: json['passing_score'] as int? ?? 50,
      rules: (json['rules'] as List<dynamic>?)?.cast<String>() ?? const [],
      proctored: json['proctored'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'status': status,
        'question_count': questionCount,
        'duration_minutes': durationMinutes,
        'description': description,
        'subject': subject,
        'remaining_minutes': remainingMinutes,
        'schedule_date': scheduleDate,
        'schedule_end_date': scheduleEndDate,
        'score': score,
        'max_score': maxScore,
        'passing_score': passingScore,
        'rules': rules,
        'proctored': proctored,
      };

  Exam copyWith({
    String? id,
    String? title,
    String? status,
    int? questionCount,
    int? durationMinutes,
    String? description,
    String? subject,
    int? remainingMinutes,
    String? scheduleDate,
    String? scheduleEndDate,
    int? score,
    int? maxScore,
    int? passingScore,
    List<String>? rules,
    bool? proctored,
  }) {
    return Exam(
      id: id ?? this.id,
      title: title ?? this.title,
      status: status ?? this.status,
      questionCount: questionCount ?? this.questionCount,
      durationMinutes: durationMinutes ?? this.durationMinutes,
      description: description ?? this.description,
      subject: subject ?? this.subject,
      remainingMinutes: remainingMinutes ?? this.remainingMinutes,
      scheduleDate: scheduleDate ?? this.scheduleDate,
      scheduleEndDate: scheduleEndDate ?? this.scheduleEndDate,
      score: score ?? this.score,
      maxScore: maxScore ?? this.maxScore,
      passingScore: passingScore ?? this.passingScore,
      rules: rules ?? this.rules,
      proctored: proctored ?? this.proctored,
    );
  }
}

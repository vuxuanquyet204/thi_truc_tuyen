/// Proctoring session model
class ProctorSession {
  const ProctorSession({
    required this.id,
    required this.examId,
    required this.examTitle,
    required this.candidateId,
    required this.candidateName,
    required this.status,
    this.startedAt,
    this.endedAt,
    this.cameraStreamUrl,
    this.candidateImageUrl,
    this.alertCount = 0,
    this.alerts = const [],
    this.suspicionScore = 0,
    this.proctorId,
    this.proctorName,
  });

  final String id;
  final String examId;
  final String examTitle;
  final String candidateId;
  final String candidateName;
  final ProctorStatus status;
  final DateTime? startedAt;
  final DateTime? endedAt;
  final String? cameraStreamUrl;
  final String? candidateImageUrl;
  final int alertCount;
  final List<ProctorAlert> alerts;
  final int suspicionScore; // 0-100
  final String? proctorId;
  final String? proctorName;

  bool get isActive => status == ProctorStatus.active;
  bool get isFlagged => status == ProctorStatus.flagged;
  bool get hasWarning => status == ProctorStatus.warning;

  String get suspicionLabel {
    if (suspicionScore >= 75) return 'Nghiêm trọng';
    if (suspicionScore >= 50) return 'Cao';
    if (suspicionScore >= 25) return 'Trung bình';
    return 'Bình thường';
  }

  factory ProctorSession.fromJson(Map<String, dynamic> json) {
    return ProctorSession(
      id: json['id'] as String,
      examId: json['exam_id'] as String,
      examTitle: json['exam_title'] as String,
      candidateId: json['candidate_id'] as String,
      candidateName: json['candidate_name'] as String,
      status: ProctorStatus.fromString(json['status'] as String?),
      startedAt: json['started_at'] != null
          ? DateTime.parse(json['started_at'] as String)
          : null,
      endedAt: json['ended_at'] != null
          ? DateTime.parse(json['ended_at'] as String)
          : null,
      cameraStreamUrl: json['camera_stream_url'] as String?,
      candidateImageUrl: json['candidate_image_url'] as String?,
      alertCount: json['alert_count'] as int? ?? 0,
      alerts: (json['alerts'] as List<dynamic>?)
              ?.map((e) => ProctorAlert.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      suspicionScore: json['suspicion_score'] as int? ?? 0,
      proctorId: json['proctor_id'] as String?,
      proctorName: json['proctor_name'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'exam_id': examId,
        'exam_title': examTitle,
        'candidate_id': candidateId,
        'candidate_name': candidateName,
        'status': status.name,
        'started_at': startedAt?.toIso8601String(),
        'ended_at': endedAt?.toIso8601String(),
        'camera_stream_url': cameraStreamUrl,
        'candidate_image_url': candidateImageUrl,
        'alert_count': alertCount,
        'alerts': alerts.map((e) => e.toJson()).toList(),
        'suspicion_score': suspicionScore,
        'proctor_id': proctorId,
        'proctor_name': proctorName,
      };

  ProctorSession copyWith({
    String? id,
    String? examId,
    String? examTitle,
    String? candidateId,
    String? candidateName,
    ProctorStatus? status,
    DateTime? startedAt,
    DateTime? endedAt,
    String? cameraStreamUrl,
    String? candidateImageUrl,
    int? alertCount,
    List<ProctorAlert>? alerts,
    int? suspicionScore,
    String? proctorId,
    String? proctorName,
  }) {
    return ProctorSession(
      id: id ?? this.id,
      examId: examId ?? this.examId,
      examTitle: examTitle ?? this.examTitle,
      candidateId: candidateId ?? this.candidateId,
      candidateName: candidateName ?? this.candidateName,
      status: status ?? this.status,
      startedAt: startedAt ?? this.startedAt,
      endedAt: endedAt ?? this.endedAt,
      cameraStreamUrl: cameraStreamUrl ?? this.cameraStreamUrl,
      candidateImageUrl: candidateImageUrl ?? this.candidateImageUrl,
      alertCount: alertCount ?? this.alertCount,
      alerts: alerts ?? this.alerts,
      suspicionScore: suspicionScore ?? this.suspicionScore,
      proctorId: proctorId ?? this.proctorId,
      proctorName: proctorName ?? this.proctorName,
    );
  }
}

enum ProctorStatus {
  pending,
  active,
  warning,
  flagged,
  completed;

  String get displayLabel => switch (this) {
        ProctorStatus.pending => 'CHỜ',
        ProctorStatus.active => 'BÌNH THƯỜNG',
        ProctorStatus.warning => 'CẢNH BÁO',
        ProctorStatus.flagged => 'FLAGGED',
        ProctorStatus.completed => 'HOÀN TẤT',
      };

  static ProctorStatus fromString(String? value) => switch (value) {
        'pending' => ProctorStatus.pending,
        'active' => ProctorStatus.active,
        'warning' => ProctorStatus.warning,
        'flagged' => ProctorStatus.flagged,
        'completed' => ProctorStatus.completed,
        _ => ProctorStatus.pending,
      };
}

/// Proctoring alert event
class ProctorAlert {
  const ProctorAlert({
    required this.id,
    required this.type,
    required this.description,
    required this.timestamp,
    required this.severity,
  });

  final String id;
  final String type; // multiple_faces, audio_detected, look_away, tab_switch
  final String description;
  final DateTime timestamp;
  final AlertSeverity severity;

  factory ProctorAlert.fromJson(Map<String, dynamic> json) {
    return ProctorAlert(
      id: json['id'] as String,
      type: json['type'] as String,
      description: json['description'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      severity: AlertSeverity.fromString(json['severity'] as String?),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'description': description,
        'timestamp': timestamp.toIso8601String(),
        'severity': severity.name,
      };
}

enum AlertSeverity {
  low,
  medium,
  high;

  static AlertSeverity fromString(String? value) => switch (value) {
        'medium' => AlertSeverity.medium,
        'high' => AlertSeverity.high,
        _ => AlertSeverity.low,
      };
}

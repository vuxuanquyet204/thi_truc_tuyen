/// Certificate model for completed exams
class Certificate {
  const Certificate({
    required this.id,
    required this.resultId,
    required this.examTitle,
    required this.userName,
    required this.issueDate,
    required this.score,
    this.credentialId,
    this.pdfUrl,
    this.verified = false,
    this.expiryDate,
    this.issuerName,
  });

  final String id;
  final String resultId;
  final String examTitle;
  final String userName;
  final DateTime issueDate;
  final int score;
  final String? credentialId;
  final String? pdfUrl;
  final bool verified;
  final DateTime? expiryDate;
  final String? issuerName;

  bool get isValid =>
      verified && (expiryDate == null || expiryDate!.isAfter(DateTime.now()));

  factory Certificate.fromJson(Map<String, dynamic> json) {
    return Certificate(
      id: json['id'] as String,
      resultId: json['result_id'] as String,
      examTitle: json['exam_title'] as String,
      userName: json['user_name'] as String,
      issueDate: DateTime.parse(json['issue_date'] as String),
      score: json['score'] as int,
      credentialId: json['credential_id'] as String?,
      pdfUrl: json['pdf_url'] as String?,
      verified: json['verified'] as bool? ?? false,
      expiryDate: json['expiry_date'] != null
          ? DateTime.parse(json['expiry_date'] as String)
          : null,
      issuerName: json['issuer_name'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'result_id': resultId,
        'exam_title': examTitle,
        'user_name': userName,
        'issue_date': issueDate.toIso8601String(),
        'score': score,
        'credential_id': credentialId,
        'pdf_url': pdfUrl,
        'verified': verified,
        'expiry_date': expiryDate?.toIso8601String(),
        'issuer_name': issuerName,
      };
}

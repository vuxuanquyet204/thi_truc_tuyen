import 'package:mock_exams/mock_exams.dart';

/// Mock result data
class MockResult {
  const MockResult({
    required this.id,
    required this.examId,
    required this.examTitle,
    required this.score,
    this.remainingMinutes,
    this.completedAt,
  });

  final String id;
  final String examId;
  final String examTitle;
  final int score;
  final int? remainingMinutes;
  final DateTime? completedAt;
}

final List<MockResult> mockResults = [
  const MockResult(
    id: 'result_001',
    examId: 'exam_004',
    examTitle: 'Behavioral Economics',
    score: 92,
    completedAt: null,
  ),
  const MockResult(
    id: 'result_002',
    examId: 'exam_005',
    examTitle: 'Game Theory Basics',
    score: 88,
    completedAt: null,
  ),
  const MockResult(
    id: 'result_003',
    examId: 'exam_001',
    examTitle: 'Advanced Macroeconomics II',
    score: 0,
    remainingMinutes: 45,
    completedAt: null,
  ),
];

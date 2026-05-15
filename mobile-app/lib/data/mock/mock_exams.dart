/// Mock exam data
class MockExam {
  const MockExam({
    required this.id,
    required this.title,
    required this.status,
    required this.questionCount,
    required this.durationMinutes,
    this.remainingMinutes,
    this.scheduleDate,
    this.score,
  });

  final String id;
  final String title;
  final String status; // ongoing, upcoming, completed
  final int questionCount;
  final int durationMinutes;
  final int? remainingMinutes;
  final String? scheduleDate;
  final int? score;
}

final List<MockExam> mockExams = [
  const MockExam(
    id: 'exam_001',
    title: 'Advanced Macroeconomics II',
    status: 'ongoing',
    questionCount: 40,
    durationMinutes: 60,
    remainingMinutes: 45,
  ),
  const MockExam(
    id: 'exam_002',
    title: 'Quantitative Analysis',
    status: 'upcoming',
    questionCount: 50,
    durationMinutes: 60,
    scheduleDate: 'Oct 24, 10:00 AM',
  ),
  const MockExam(
    id: 'exam_003',
    title: 'Ethics in AI',
    status: 'upcoming',
    questionCount: 30,
    durationMinutes: 45,
    scheduleDate: 'Oct 26, 02:00 PM',
  ),
  const MockExam(
    id: 'exam_004',
    title: 'Behavioral Economics',
    status: 'completed',
    questionCount: 35,
    durationMinutes: 50,
    score: 92,
  ),
  const MockExam(
    id: 'exam_005',
    title: 'Game Theory Basics',
    status: 'completed',
    questionCount: 25,
    durationMinutes: 40,
    score: 88,
  ),
  const MockExam(
    id: 'exam_006',
    title: 'Data Structures & Algorithms',
    status: 'upcoming',
    questionCount: 60,
    durationMinutes: 90,
    scheduleDate: 'Oct 28, 08:00 AM',
  ),
];

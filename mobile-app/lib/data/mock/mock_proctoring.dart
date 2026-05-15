import 'package:flutter/material.dart';

/// Mock proctoring data
class MockProctorSession {
  const MockProctorSession({
    required this.id,
    required this.examId,
    required this.examTitle,
    required this.candidateName,
    required this.status,
    this.alertCount = 0,
    this.suspicionScore = 0,
    this.cameraThumbnailUrl,
  });

  final String id;
  final String examId;
  final String examTitle;
  final String candidateName;
  final ProctorStatus status;
  final int alertCount;
  final int suspicionScore;
  final String? cameraThumbnailUrl;
}

enum ProctorStatus { normal, warning, flagged }

final List<MockProctorSession> mockProctorSessions = [
  const MockProctorSession(
    id: 'session_001',
    examId: 'exam_004',
    examTitle: 'Advanced Macroeconomics II',
    candidateName: 'Benjamin Carter',
    status: ProctorStatus.flagged,
    alertCount: 3,
    suspicionScore: 87,
    cameraThumbnailUrl: 'https://i.pravatar.cc/300?img=1',
  ),
  const MockProctorSession(
    id: 'session_002',
    examId: 'exam_005',
    examTitle: 'Ethics in AI',
    candidateName: 'Sarah Jenkins',
    status: ProctorStatus.normal,
    alertCount: 0,
    suspicionScore: 5,
    cameraThumbnailUrl: 'https://i.pravatar.cc/300?img=5',
  ),
  const MockProctorSession(
    id: 'session_003',
    examId: 'exam_006',
    examTitle: 'Cognitive Neuroscience',
    candidateName: 'Elena Rodriguez',
    status: ProctorStatus.warning,
    alertCount: 2,
    suspicionScore: 42,
    cameraThumbnailUrl: 'https://i.pravatar.cc/300?img=9',
  ),
  const MockProctorSession(
    id: 'session_004',
    examId: 'exam_001',
    examTitle: 'Quantitative Analysis',
    candidateName: 'David Chen',
    status: ProctorStatus.normal,
    alertCount: 0,
    suspicionScore: 2,
    cameraThumbnailUrl: 'https://i.pravatar.cc/300?img=3',
  ),
  const MockProctorSession(
    id: 'session_005',
    examId: 'exam_002',
    examTitle: 'Game Theory Basics',
    candidateName: 'Maya Thompson',
    status: ProctorStatus.normal,
    alertCount: 0,
    suspicionScore: 0,
    cameraThumbnailUrl: 'https://i.pravatar.cc/300?img=16',
  ),
  const MockProctorSession(
    id: 'session_006',
    examId: 'exam_003',
    examTitle: 'Data Structures & Algorithms',
    candidateName: 'James Wilson',
    status: ProctorStatus.flagged,
    alertCount: 5,
    suspicionScore: 92,
    cameraThumbnailUrl: 'https://i.pravatar.cc/300?img=11',
  ),
  const MockProctorSession(
    id: 'session_007',
    examId: 'exam_007',
    examTitle: 'Organic Chemistry II',
    candidateName: 'Lucas Miller',
    status: ProctorStatus.normal,
    alertCount: 0,
    suspicionScore: 1,
    cameraThumbnailUrl: 'https://i.pravatar.cc/300?img=12',
  ),
  const MockProctorSession(
    id: 'session_008',
    examId: 'exam_008',
    examTitle: 'Civil Law Fundamentals',
    candidateName: 'Sophie Laurent',
    status: ProctorStatus.normal,
    alertCount: 0,
    suspicionScore: 0,
    cameraThumbnailUrl: 'https://i.pravatar.cc/300?img=25',
  ),
];

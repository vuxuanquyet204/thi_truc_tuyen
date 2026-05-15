import 'package:dio/dio.dart';
import '../http/http_client.dart';

/// Exam API service
class ExamApi {
  ExamApi(this._client);

  final Dio _client;

  /// Get list of exams
  Future<Map<String, dynamic>> getExams({String? status}) async {
    final query = status != null ? '?status=$status' : '';
    final response = await _client.get('/exams$query');
    return response.data;
  }

  /// Get single exam details
  Future<Map<String, dynamic>> getExam(String examId) async {
    final response = await _client.get('/exams/$examId');
    return response.data;
  }

  /// Start exam session
  Future<Map<String, dynamic>> startExam(String examId) async {
    final response = await _client.post('/exams/$examId/start');
    return response.data;
  }

  /// Submit answer
  Future<Map<String, dynamic>> submitAnswer(
    String examId,
    String questionId,
    Map<String, dynamic> answer,
  ) async {
    final response = await _client.post(
      '/exams/$examId/answers',
      data: {'question_id': questionId, ...answer},
    );
    return response.data;
  }

  /// Submit entire exam
  Future<Map<String, dynamic>> submitExam(String examId) async {
    final response = await _client.post('/exams/$examId/submit');
    return response.data;
  }
}

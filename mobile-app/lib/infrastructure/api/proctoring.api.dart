import 'package:dio/dio.dart';
import '../http/http_client.dart';

/// Proctoring API service
class ProctoringApi {
  ProctoringApi(this._client);

  final Dio _client;

  /// Get list of active proctoring sessions (admin only)
  Future<Map<String, dynamic>> getActiveSessions() async {
    final response = await _client.get('/proctoring/sessions');
    return response.data;
  }

  /// Get single session details
  Future<Map<String, dynamic>> getSession(String sessionId) async {
    final response = await _client.get('/proctoring/sessions/$sessionId');
    return response.data;
  }

  /// Flag a session
  Future<Map<String, dynamic>> flagSession(String sessionId, String reason) async {
    final response = await _client.post('/proctoring/sessions/$sessionId/flag', data: {
      'reason': reason,
    });
    return response.data;
  }

  /// Review flagged incident
  Future<Map<String, dynamic>> reviewFlag(
    String sessionId,
    String alertId,
    bool confirmed,
  ) async {
    final response = await _client.post(
      '/proctoring/sessions/$sessionId/alerts/$alertId/review',
      data: {'confirmed': confirmed},
    );
    return response.data;
  }
}

import 'package:dio/dio.dart';
import '../http/http_client.dart';

/// Admin API service
class AdminApi {
  AdminApi(this._client);

  final Dio _client;

  /// Get all candidates
  Future<Map<String, dynamic>> getCandidates({int? page}) async {
    final query = page != null ? '?page=$page' : '';
    final response = await _client.get('/admin/candidates$query');
    return response.data;
  }

  /// Get all proctors
  Future<Map<String, dynamic>> getProctors() async {
    final response = await _client.get('/admin/proctors');
    return response.data;
  }

  /// Mint LearnTokens to user
  Future<Map<String, dynamic>> mintTokens(String userId, int amount, String reason) async {
    final response = await _client.post('/admin/tokens/mint', data: {
      'user_id': userId,
      'amount': amount,
      'reason': reason,
    });
    return response.data;
  }

  /// Get audit log
  Future<Map<String, dynamic>> getAuditLog({int? limit}) async {
    final query = limit != null ? '?limit=$limit' : '';
    final response = await _client.get('/admin/audit-log$query');
    return response.data;
  }
}

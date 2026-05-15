import 'package:dio/dio.dart';
import '../http/http_client.dart';

/// Result API service
class ResultApi {
  ResultApi(this._client);

  final Dio _client;

  /// Get list of user's results
  Future<Map<String, dynamic>> getResults() async {
    final response = await _client.get('/results');
    return response.data;
  }

  /// Get single result details
  Future<Map<String, dynamic>> getResult(String resultId) async {
    final response = await _client.get('/results/$resultId');
    return response.data;
  }
}

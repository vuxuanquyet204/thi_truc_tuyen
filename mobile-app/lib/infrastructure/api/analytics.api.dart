import 'package:dio/dio.dart';
import '../http/http_client.dart';

/// Analytics API service (admin)
class AnalyticsApi {
  AnalyticsApi(this._client);

  final Dio _client;

  /// Get admin dashboard stats
  Future<Map<String, dynamic>> getDashboardStats() async {
    final response = await _client.get('/analytics/dashboard');
    return response.data;
  }

  /// Get LearnToken economy data
  Future<Map<String, dynamic>> getTokenEconomy() async {
    final response = await _client.get('/analytics/token-economy');
    return response.data;
  }

  /// Get candidate distribution over time
  Future<Map<String, dynamic>> getDistribution({String period = 'week'}) async {
    final response = await _client.get('/analytics/distribution?period=$period');
    return response.data;
  }
}

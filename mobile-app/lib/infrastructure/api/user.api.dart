import 'package:dio/dio.dart';
import '../http/http_client.dart';

/// User API service
class UserApi {
  UserApi(this._client);

  final Dio _client;

  /// Get current user profile
  Future<Map<String, dynamic>> getProfile() async {
    final response = await _client.get('/user/profile');
    return response.data;
  }

  /// Update user profile
  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final response = await _client.put('/user/profile', data: data);
    return response.data;
  }

  /// Get user LearnToken balance
  Future<Map<String, dynamic>> getTokenBalance() async {
    final response = await _client.get('/user/tokens');
    return response.data;
  }
}

import 'package:dio/dio.dart';
import '../http/http_client.dart';

/// Auth API service
class AuthApi {
  AuthApi(this._client);

  final Dio _client;

  /// Login with email
  Future<Map<String, dynamic>> login(String email) async {
    final response = await _client.post('/auth/login', data: {'email': email});
    return response.data;
  }

  /// Verify OTP
  Future<Map<String, dynamic>> verifyOTP(String phone, String otp) async {
    final response = await _client.post('/auth/verify-otp', data: {
      'phone': phone,
      'otp': otp,
    });
    return response.data;
  }

  /// Refresh access token
  Future<Map<String, dynamic>> refreshToken(String refreshToken) async {
    final response = await _client.post('/auth/refresh', data: {
      'refresh_token': refreshToken,
    });
    return response.data;
  }

  /// Logout
  Future<void> logout() async {
    await _client.post('/auth/logout');
  }
}

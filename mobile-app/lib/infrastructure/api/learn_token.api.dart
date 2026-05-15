import 'package:dio/dio.dart';
import '../http/http_client.dart';

/// LearnToken API service
class LearnTokenApi {
  LearnTokenApi(this._client);

  final Dio _client;

  /// Get user's LearnToken balance and history
  Future<Map<String, dynamic>> getTokenInfo() async {
    final response = await _client.get('/tokens');
    return response.data;
  }

  /// Get transaction history
  Future<Map<String, dynamic>> getTransactions({int? limit}) async {
    final query = limit != null ? '?limit=$limit' : '';
    final response = await _client.get('/tokens/transactions$query');
    return response.data;
  }

  /// Get available rewards
  Future<Map<String, dynamic>> getRewards() async {
    final response = await _client.get('/tokens/rewards');
    return response.data;
  }

  /// Redeem a reward
  Future<Map<String, dynamic>> redeemReward(String rewardId) async {
    final response = await _client.post('/tokens/redeem', data: {
      'reward_id': rewardId,
    });
    return response.data;
  }
}

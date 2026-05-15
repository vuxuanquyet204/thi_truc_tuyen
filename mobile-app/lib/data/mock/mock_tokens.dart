import 'package:flutter/material.dart';
import '../user.model.dart' show UserRole;

/// Mock token (LearnToken) data
class MockLearnTokenData {
  const MockLearnTokenData({
    required this.id,
    required this.balance,
    required this.userId,
    this.totalEarned = 0,
    this.totalSpent = 0,
  });

  final String id;
  final int balance;
  final String userId;
  final int totalEarned;
  final int totalSpent;
}

final List<MockLearnTokenData> mockTokenBalances = [
  const MockLearnTokenData(
    id: 'token_001',
    userId: 'user_001',
    balance: 1250,
    totalEarned: 4850,
    totalSpent: 3600,
  ),
  const MockLearnTokenData(
    id: 'token_002',
    userId: 'user_002',
    balance: 890,
    totalEarned: 2100,
    totalSpent: 1210,
  ),
  const MockLearnTokenData(
    id: 'token_003',
    userId: 'user_003',
    balance: 2100,
    totalEarned: 5000,
    totalSpent: 2900,
  ),
];

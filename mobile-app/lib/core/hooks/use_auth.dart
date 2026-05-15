import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/types/user.model.dart';
import '../../contexts/auth_context.dart';

/// useAuth — hook for accessing auth context in widgets
///
/// Usage:
/// ```dart
/// final auth = useAuth(context);
/// auth.login(email);
/// ```
AuthContext useAuth(BuildContext context) {
  return context.read<AuthContext>();
}

/// useAuthState — watch auth state reactively
class AuthState {
  const AuthState({
    required this.user,
    required this.isLoggedIn,
    required this.isLoading,
    this.error,
    required this.isAdmin,
    required this.isCandidate,
    required this.needsOTP,
  });

  final User? user;
  final bool isLoggedIn;
  final bool isLoading;
  final String? error;
  final bool isAdmin;
  final bool isCandidate;
  final bool needsOTP;
}

/// Reactive auth state stream — use with `context.watch` or `Consumer`
AuthState useAuthState(BuildContext context) {
  final auth = context.watch<AuthContext>();
  return AuthState(
    user: auth.user,
    isLoggedIn: auth.isLoggedIn,
    isLoading: auth.isLoading,
    error: auth.error,
    isAdmin: auth.isAdmin,
    isCandidate: auth.isCandidate,
    needsOTP: auth.needsOTPVerification,
  );
}
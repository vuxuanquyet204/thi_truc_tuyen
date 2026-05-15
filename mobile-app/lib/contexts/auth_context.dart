import 'package:flutter/material.dart';
import '../core/types/user.model.dart';
import '../infrastructure/storage/secure_storage.dart';

/// Authentication context for managing user state
class AuthContext extends ChangeNotifier {
  AuthContext(this._secureStorage);

  final SecureStorageService _secureStorage;

  User? _user;
  String? _accessToken;
  bool _needsOTPVerification = false;
  String? _pendingPhone;
  bool _isLoading = false;
  String? _error;

  // ==================== GETTERS ====================

  User? get user => _user;
  String? get accessToken => _accessToken;
  bool get isLoggedIn => _accessToken != null && _user != null;
  bool get needsOTPVerification => _needsOTPVerification;
  String? get pendingPhone => _pendingPhone;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAdmin => _user?.role == UserRole.admin;
  bool get isCandidate => _user?.role == UserRole.candidate;

  // ==================== ACTIONS ====================

  /// Check if user has valid token on app start
  Future<bool> checkAuthState() async {
    _setLoading(true);
    try {
      final hasValidToken = await _secureStorage.hasValidToken();
      final storedUserId = await _secureStorage.getUserId();

      if (hasValidToken && storedUserId != null) {
        _accessToken = await _secureStorage.getAccessToken();
        // TODO: Fetch user data from API
        // _user = await _fetchUser();
        _needsOTPVerification = false;
      } else {
        _user = null;
        _accessToken = null;
      }

      notifyListeners();
      return isLoggedIn;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Initiate login with email
  Future<void> login(String email) async {
    _setLoading(true);
    _clearError();

    try {
      // TODO: Call API
      // final response = await _api.login(email);

      // Mock: simulate OTP being sent
      _needsOTPVerification = true;
      _pendingPhone = email;
      _error = null;
    } catch (e) {
      _error = 'Đăng nhập thất bại. Vui lòng thử lại.';
    } finally {
      _setLoading(false);
    }

    notifyListeners();
  }

  /// Verify OTP and complete login
  Future<bool> verifyOTP(String otp) async {
    _setLoading(true);
    _clearError();

    try {
      // TODO: Call API
      // final response = await _api.verifyOTP(_pendingPhone, otp);

      // Mock: accept any 6-digit OTP
      if (otp.length != 6) {
        throw Exception('Mã OTP không hợp lệ');
      }

      // Create mock user
      _user = User(
        id: 'user_001',
        email: _pendingPhone ?? 'demo@academicluminary.edu.vn',
        name: 'Nguyễn Minh Khôi',
        role: UserRole.candidate,
        mssv: '20214532',
        avatarUrl: 'https://i.pravatar.cc/150?img=12',
        faculty: 'Trường Công nghệ Thông tin và Truyền thông',
        learnTokenBalance: 1250,
        rank: 142,
      );

      _accessToken = 'mock_access_token_${DateTime.now().millisecondsSinceEpoch}';
      _needsOTPVerification = false;

      // Save tokens
      await _secureStorage.saveAuthData(
        accessToken: _accessToken!,
        refreshToken: 'mock_refresh_token',
        userId: _user!.id,
        role: _user!.role.name,
        tokenExpiry: DateTime.now().add(const Duration(days: 7)),
      );

      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Mã OTP không đúng. Vui lòng thử lại.';
      notifyListeners();
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Resend OTP
  Future<void> resendOTP() async {
    _setLoading(true);
    try {
      // TODO: Call API to resend OTP
      await Future.delayed(const Duration(seconds: 1));
    } finally {
      _setLoading(false);
    }
    notifyListeners();
  }

  /// Cancel OTP verification and go back to login
  void cancelOTPVerification() {
    _needsOTPVerification = false;
    _pendingPhone = null;
    notifyListeners();
  }

  /// Logout
  Future<void> logout() async {
    _setLoading(true);
    try {
      // TODO: Call API to logout
      await _secureStorage.clearAuthData();
      _user = null;
      _accessToken = null;
      _needsOTPVerification = false;
      _pendingPhone = null;
    } finally {
      _setLoading(false);
    }
    notifyListeners();
  }

  /// Update user profile
  Future<void> updateUser(User updatedUser) async {
    _user = updatedUser;
    notifyListeners();
  }

  /// Update LearnToken balance
  void updateTokenBalance(int newBalance) {
    if (_user != null) {
      _user = _user!.copyWith(learnTokenBalance: newBalance);
      notifyListeners();
    }
  }

  // ==================== PRIVATE HELPERS ====================

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
  }
}

import 'dart:async';
import 'package:flutter/foundation.dart';

/// OTP Timer hook — manages countdown timer for OTP resend
class UseOTPtimer extends ChangeNotifier {
  UseOTPtimer({this.initialSeconds = 300});

  final int initialSeconds;
  late int _remainingSeconds;
  Timer? _timer;
  bool _isRunning = false;

  int get remainingSeconds => _remainingSeconds;
  bool get isRunning => _isRunning;
  bool get canResend => _remainingSeconds <= 0;

  String get displayTime {
    final m = _remainingSeconds ~/ 60;
    final s = _remainingSeconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  void start() {
    _remainingSeconds = initialSeconds;
    _isRunning = true;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_remainingSeconds > 0) {
        _remainingSeconds--;
        notifyListeners();
      } else {
        stop();
      }
    });
    notifyListeners();
  }

  void stop() {
    _timer?.cancel();
    _isRunning = false;
    notifyListeners();
  }

  void reset([int? seconds]) {
    stop();
    _remainingSeconds = seconds ?? initialSeconds;
    notifyListeners();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
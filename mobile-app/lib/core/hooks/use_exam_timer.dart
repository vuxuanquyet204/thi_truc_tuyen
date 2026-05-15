import 'dart:async';
import 'package:flutter/foundation.dart';

/// Exam timer hook — countdown for active exam session
class UseExamTimer extends ChangeNotifier {
  UseExamTimer({this.initialMinutes = 60});

  final int initialMinutes;
  late int _remainingSeconds;
  Timer? _timer;
  bool _isRunning = false;
  bool _isPaused = false;

  int get remainingSeconds => _remainingSeconds;
  int get remainingMinutes => _remainingSeconds ~/ 60;
  bool get isRunning => _isRunning;
  bool get isPaused => _isPaused;
  bool get isExpired => _remainingSeconds <= 0;

  String get displayTime {
    final m = _remainingSeconds ~/ 60;
    final s = _remainingSeconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  void start([int? minutes]) {
    _remainingSeconds = (minutes ?? initialMinutes) * 60;
    _isRunning = true;
    _isPaused = false;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!_isPaused && _remainingSeconds > 0) {
        _remainingSeconds--;
        notifyListeners();
      } else if (_remainingSeconds <= 0) {
        stop();
        _onExpired?.call();
      }
    });
    notifyListeners();
  }

  void pause() {
    _isPaused = true;
    notifyListeners();
  }

  void resume() {
    _isPaused = false;
    notifyListeners();
  }

  void stop() {
    _timer?.cancel();
    _isRunning = false;
    _isPaused = false;
    notifyListeners();
  }

  void addTime(int seconds) {
    _remainingSeconds += seconds;
    notifyListeners();
  }

  void subtractTime(int seconds) {
    _remainingSeconds = (_remainingSeconds - seconds).clamp(0, _remainingSeconds);
    notifyListeners();
  }

  VoidCallback? _onExpired;
  void setOnExpired(VoidCallback? callback) {
    _onExpired = callback;
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
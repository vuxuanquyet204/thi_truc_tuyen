import 'dart:async';
import 'package:flutter/material.dart';

/// OTP Timer display with countdown and resend button
class OTPTimer extends StatefulWidget {
  const OTPTimer({
    super.key,
    this.seconds = 300,
    required this.onResend,
    this.enabled = false,
  });

  final int seconds;
  final VoidCallback onResend;
  final bool enabled;

  @override
  State<OTPTimer> createState() => _OTPTimerState();
}

class _OTPTimerState extends State<OTPTimer> {
  late int _remaining;
  late bool _canResend;

  @override
  void initState() {
    super.initState();
    _remaining = widget.seconds;
    _canResend = _remaining <= 0;
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  void didUpdateWidget(OTPTimer old) {
    super.didUpdateWidget(old);
    if (old.seconds != widget.seconds && widget.enabled) {
      _timer?.cancel();
      _remaining = widget.seconds;
      _canResend = false;
      _startTimer();
    }
  }

  Timer? _timer;

  void _startTimer() {
    _timer?.cancel();
    _remaining = widget.seconds;
    _canResend = false;

    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!widget.enabled) return;
      if (_remaining > 0) {
        setState(() => _remaining--);
      } else {
        setState(() => _canResend = true);
        _timer?.cancel();
      }
    });
  }

  String get _displayTime {
    final m = _remaining ~/ 60;
    final s = _remaining % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          'Bạn chưa nhận được mã? ',
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 13,
            color: const Color(0xFF434652),
          ),
        ),
        GestureDetector(
          onTap: _canResend ? widget.onResend : null,
          child: Text(
            'Gửi lại mã',
            style: TextStyle(
              fontFamily: 'Manrope',
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: _canResend
                  ? const Color(0xFF003178)
                  : const Color(0xFF434652).withValues(alpha: 0.5),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0xFFE6F6FF),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.timer, size: 16, color: Color(0xFF006A6A)),
              const SizedBox(width: 6),
              Text(
                _displayTime,
                style: const TextStyle(
                  fontFamily: 'Manrope',
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF006A6A),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
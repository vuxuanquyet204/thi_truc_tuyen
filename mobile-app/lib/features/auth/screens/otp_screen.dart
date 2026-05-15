import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/components/al_button.dart';
import '../../../contexts/auth_context.dart';
import '../components/otp_input.dart';
import '../components/otp_timer.dart';

/// OTP Verification Screen — 6 digit code
class OTPScreen extends StatefulWidget {
  const OTPScreen({super.key});

  @override
  State<OTPScreen> createState() => _OTPScreenState();
}

class _OTPScreenState extends State<OTPScreen> {
  bool _isEnabled = false;

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) setState(() => _isEnabled = true);
    });
  }

  Future<void> _onOTPCompleted(String otp) async {
    final auth = context.read<AuthContext>();
    await auth.verifyOTP(otp);
  }

  Future<void> _onResend() async {
    final auth = context.read<AuthContext>();
    await auth.resendOTP();
    setState(() => _isEnabled = false);
    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) setState(() => _isEnabled = true);
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthContext>();
    final phone = auth.pendingPhone ?? '+84 9...678';

    return Scaffold(
      backgroundColor: const Color(0xFFF3FAFF),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: const BackButton(color: Color(0xFF0D47A1)),
        title: const Text(
          'Xác thực OTP',
          style: TextStyle(
            fontFamily: 'Manrope',
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Color(0xFF003178),
          ),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Spacer(),
              // Icon
              Container(
                width: 80,
                height: 80,
                decoration: const BoxDecoration(
                  color: Color(0xFFCFE6F2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.shield_outlined,
                  size: 40,
                  color: Color(0xFF003178),
                ),
              ),
              const SizedBox(height: 24),
              // Title
              const Text(
                'Xác thực OTP',
                style: TextStyle(
                  fontFamily: 'Manrope',
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF071E27),
                  letterSpacing: -0.02,
                ),
              ),
              const SizedBox(height: 12),
              // Description
              Text(
                'Mã xác thực đã được gửi đến\n$phone',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  color: Color(0xFF434652),
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 40),
              // OTP Input
              OTPInput(
                length: 6,
                onCompleted: _onOTPCompleted,
                onChanged: (_) {},
              ),
              const SizedBox(height: 32),
              // Timer + Resend
              OTPTimer(
                enabled: _isEnabled,
                onResend: _onResend,
              ),
              const Spacer(),
              // Verify button
              ALButton(
                label: 'Xác nhận',
                variant: ALButtonVariant.primary,
                isFullWidth: true,
                isLoading: auth.isLoading,
                onPressed: auth.isLoading ? null : () {},
              ),
              const SizedBox(height: 16),
              // Info card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFE6F6FF),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.info_outline, size: 20, color: Color(0xFF006A6A)),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Mã OTP có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 12,
                          color: Color(0xFF434652),
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
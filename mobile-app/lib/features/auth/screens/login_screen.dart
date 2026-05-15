import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/components/al_button.dart';
import '../../../core/components/al_text_field.dart';
import '../../../contexts/auth_context.dart';

/// Login Screen — Email based authentication
/// Matches design: simple login with email input
class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final emailController = TextEditingController();

    return Scaffold(
      backgroundColor: const Color(0xFFF3FAFF),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Đăng nhập',
          style: TextStyle(
            fontFamily: 'Manrope',
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: Color(0xFF003178),
          ),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 40),
              // Logo / Title
              const Row(
                children: [
                  Icon(
                    Icons.school,
                    size: 48,
                    color: Color(0xFF0D47A1),
                  ),
                  SizedBox(width: 16),
                  Text(
                    'Academic\nLuminary',
                    style: TextStyle(
                      fontFamily: 'Manrope',
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF003178),
                      height: 1.2,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 48),
              // Welcome text
              const Text(
                'Chào mừng trở lại',
                style: TextStyle(
                  fontFamily: 'Manrope',
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF071E27),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Đăng nhập bằng email SIS để tiếp tục',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  color: const Color(0xFF434652),
                ),
              ),
              const SizedBox(height: 32),
              // Email input
              ALTextField(
                controller: emailController,
                hintText: 'Nhập email của bạn',
                labelText: 'Email',
                keyboardType: TextInputType.emailAddress,
                prefixIcon: Icons.email_outlined,
                onChanged: (value) {},
              ),
              const SizedBox(height: 24),
              // Continue button
              Consumer<AuthContext>(
                builder: (context, auth, child) {
                  return ALButton(
                    label: 'Tiếp tục',
                    variant: ALButtonVariant.primary,
                    isFullWidth: true,
                    isLoading: auth.isLoading,
                    onPressed: () {
                      final email = emailController.text.trim();
                      if (email.isEmpty) return;
                      if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(email)) return;
                      auth.login(email);
                    },
                  );
                },
              ),
              const SizedBox(height: 16),
              // Error message
              Consumer<AuthContext>(
                builder: (context, auth, child) {
                  if (auth.error != null) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.error_outline,
                            size: 16,
                            color: Color(0xFFBA1A1A),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              auth.error!,
                              style: const TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 13,
                                color: Color(0xFFBA1A1A),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }
                  return const SizedBox.shrink();
                },
              ),
              const Spacer(),
              // Footer
              Text(
                '© 2024 Academic Luminary. All rights reserved.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 11,
                  color: const Color(0xFF434652).withValues(alpha: 0.6),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}

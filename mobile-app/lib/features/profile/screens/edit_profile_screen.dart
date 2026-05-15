import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/components/al_text_field.dart';
import '../../../core/components/al_button.dart';

/// Edit Profile Screen
class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _mssvController;
  String _selectedFaculty = 'soict';

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: 'Nguyễn Minh Khôi');
    _phoneController = TextEditingController(text: '0912345678');
    _mssvController = TextEditingController(text: '20214532');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _mssvController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Column(
          children: [
            // App bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => context.pop(),
                    icon: const Icon(Icons.arrow_back, color: AppColors.primary),
                  ),
                  const Expanded(
                    child: Text('Chỉnh sửa hồ sơ', style: TextStyle(
                      fontFamily: 'Manrope', fontSize: 18, fontWeight: FontWeight.w700,
                      color: AppColors.onSurface,
                    )),
                  ),
                  ElevatedButton(
                    onPressed: () => context.pop(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: AppColors.onPrimary,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: AppRadius.radiusFull),
                    ),
                    child: const Text('Lưu'),
                  ),
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.screenPadding),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Avatar
                    Stack(
                      clipBehavior: Clip.none,
                      children: [
                        Container(
                          width: 100, height: 100,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.surfaceContainerHighest, width: 4),
                          ),
                          child: const CircleAvatar(
                            radius: 48,
                            backgroundImage: NetworkImage('https://i.pravatar.cc/150?img=12'),
                          ),
                        ),
                        Positioned(
                          right: 0, bottom: 0,
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: const BoxDecoration(
                              color: AppColors.primary, shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.camera_alt, size: 18, color: AppColors.onPrimary),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Text('Cập nhật ảnh đại diện', style: TextStyle(
                      fontFamily: 'Manrope', fontSize: 13, fontWeight: FontWeight.w600,
                      color: AppColors.onSurfaceVariant,
                    )),
                    const SizedBox(height: 32),
                    // Form
                    ALTextField(
                      controller: _nameController,
                      labelText: 'Họ và tên',
                      prefixIcon: Icons.person,
                    ),
                    const SizedBox(height: 20),
                    ALTextField(
                      controller: TextEditingController(text: 'khoi.nm214532@sis.hust.edu.vn'),
                      labelText: 'Email',
                      prefixIcon: Icons.lock,
                      readOnly: true,
                      helperText: 'Email sinh viên không thể thay đổi trực tiếp.',
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(
                          child: ALTextField(
                            controller: _phoneController,
                            labelText: 'Số điện thoại',
                            prefixIcon: Icons.call,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ALTextField(
                            controller: _mssvController,
                            labelText: 'MSSV',
                            prefixIcon: Icons.badge,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    // Faculty dropdown
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Padding(
                          padding: EdgeInsets.only(left: 8, bottom: 8),
                          child: Text('Khoa/Viện', style: TextStyle(
                            fontFamily: 'Manrope', fontSize: 12, fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          )),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceContainerLow,
                            borderRadius: AppRadius.inputRadius,
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: _selectedFaculty,
                              isExpanded: true,
                              items: const [
                                DropdownMenuItem(value: 'soict', child: Text('Trường Công nghệ Thông tin và Truyền thông')),
                                DropdownMenuItem(value: 'see', child: Text('Trường Điện - Điện tử')),
                                DropdownMenuItem(value: 'sme', child: Text('Trường Cơ khí')),
                              ],
                              onChanged: (v) => setState(() => _selectedFaculty = v!),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                    ALButton(
                      label: 'Lưu thay đổi',
                      variant: ALButtonVariant.primary,
                      isFullWidth: true,
                      onPressed: () => context.pop(),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton(
                      onPressed: () => context.pop(),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.error,
                        side: const BorderSide(color: AppColors.error),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        minimumSize: const Size(double.infinity, 52),
                        shape: RoundedRectangleBorder(borderRadius: AppRadius.radiusFull),
                      ),
                      child: const Text('Hủy bỏ và quay lại'),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

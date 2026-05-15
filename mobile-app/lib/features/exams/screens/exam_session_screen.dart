import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/theme/app_spacing.dart';

/// Exam Session Screen — Full screen exam with timer
class ExamSessionScreen extends StatefulWidget {
  const ExamSessionScreen({super.key, required this.examId});

  final String examId;

  @override
  State<ExamSessionScreen> createState() => _ExamSessionScreenState();
}

class _ExamSessionScreenState extends State<ExamSessionScreen> {
  int _remainingSeconds = 45 * 60; // 45 minutes
  int _currentQuestion = 0;
  int? _selectedAnswer;
  Timer? _timer;
  bool _isSubmitting = false;

  final List<_QuestionData> _questions = List.generate(
    10,
    (i) => _QuestionData(
      id: i,
      text: 'Câu hỏi ${i + 1}: Đâu là đáp án đúng cho vấn đề này?',
      options: [
        'Đáp án A: Lựa chọn đầu tiên',
        'Đáp án B: Lựa chọn thứ hai',
        'Đáp án C: Lựa chọn thứ ba',
        'Đáp án D: Lựa chọn thứ tư',
      ],
    ),
  );

  @override
  void initState() {
    super.initState();
    _startTimer();
    // Hide status bar for immersive exam
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  }

  @override
  void dispose() {
    _timer?.cancel();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        setState(() => _remainingSeconds--);
      } else {
        timer.cancel();
        _showTimeUpDialog();
      }
    });
  }

  void _showTimeUpDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: AppRadius.radiusLg),
        title: const Text('Hết giờ!'),
        content: const Text('Thời gian làm bài đã kết thúc. Bài thi sẽ được nộp tự động.'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _submitExam();
            },
            child: const Text('Nộp bài'),
          ),
        ],
      ),
    );
  }

  Future<void> _submitExam() async {
    setState(() => _isSubmitting = true);
    // TODO: Call API to submit exam
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      context.go('/results/result_001');
    }
  }

  String get _formattedTime {
    final minutes = _remainingSeconds ~/ 60;
    final seconds = _remainingSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final question = _questions[_currentQuestion];

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Column(
          children: [
            // Top bar
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.base,
                vertical: AppSpacing.sm,
              ),
              decoration: BoxDecoration(
                color: AppColors.surface,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.onSurface.withValues(alpha: 0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => _showExitConfirm(),
                    icon: const Icon(Icons.close, color: AppColors.primary),
                  ),
                  Expanded(
                    child: Text(
                      'Advanced Economics',
                      style: const TextStyle(
                        fontFamily: 'Manrope',
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  // Timer
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: _remainingSeconds < 300
                          ? AppColors.errorContainer
                          : AppColors.surfaceContainerLow,
                      borderRadius: AppRadius.radiusFull,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.timer,
                          size: 18,
                          color: _remainingSeconds < 300
                              ? AppColors.error
                              : AppColors.secondary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          _formattedTime,
                          style: TextStyle(
                            fontFamily: 'Manrope',
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: _remainingSeconds < 300
                                ? AppColors.error
                                : AppColors.secondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            // Progress bar
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.screenPadding,
                vertical: AppSpacing.sm,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Câu ${_currentQuestion + 1} / ${_questions.length}',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.onSurfaceVariant,
                        ),
                      ),
                      Text(
                        '${((_currentQuestion + 1) / _questions.length * 100).toInt()}%',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.secondary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: (_currentQuestion + 1) / _questions.length,
                      backgroundColor: AppColors.surfaceContainerLow,
                      valueColor: const AlwaysStoppedAnimation(AppColors.secondary),
                      minHeight: 6,
                    ),
                  ),
                ],
              ),
            ),
            // Question content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.screenPadding),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      question.text,
                      style: const TextStyle(
                        fontFamily: 'Manrope',
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppColors.onSurface,
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Answer options
                    ...List.generate(question.options.length, (index) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _AnswerOption(
                          index: index,
                          text: question.options[index],
                          isSelected: _selectedAnswer == index,
                          onTap: () {
                            setState(() => _selectedAnswer = index);
                          },
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),
            // Bottom navigation
            Container(
              padding: const EdgeInsets.all(AppSpacing.screenPadding),
              decoration: BoxDecoration(
                color: AppColors.surface,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.onSurface.withValues(alpha: 0.06),
                    blurRadius: 20,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  // Question navigator
                  Expanded(
                    child: SizedBox(
                      height: 44,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _questions.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 6),
                        itemBuilder: (context, index) {
                          final isAnswered = index < _currentQuestion ||
                              (index == _currentQuestion && _selectedAnswer != null);
                          final isCurrent = index == _currentQuestion;

                          return GestureDetector(
                            onTap: () {
                              setState(() => _currentQuestion = index);
                            },
                            child: Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: isCurrent
                                    ? AppColors.primary
                                    : isAnswered
                                        ? AppColors.secondaryContainer
                                        : AppColors.surfaceContainerLow,
                                borderRadius: AppRadius.radiusMd,
                              ),
                              child: Center(
                                child: Text(
                                  '${index + 1}',
                                  style: TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: isCurrent
                                        ? AppColors.onPrimary
                                        : isAnswered
                                            ? AppColors.onSecondaryContainer
                                            : AppColors.onSurfaceVariant,
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  // Nav buttons
                  if (_currentQuestion > 0)
                    IconButton(
                      onPressed: () {
                        setState(() => _currentQuestion--);
                      },
                      icon: const Icon(Icons.chevron_left),
                      color: AppColors.primary,
                    ),
                  if (_currentQuestion < _questions.length - 1)
                    IconButton(
                      onPressed: () {
                        if (_selectedAnswer != null) {
                          setState(() {
                            _currentQuestion++;
                            _selectedAnswer = null;
                          });
                        }
                      },
                      icon: const Icon(Icons.chevron_right),
                      color: AppColors.primary,
                    )
                  else
                    ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitExam,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.tertiaryFixedDim,
                        foregroundColor: AppColors.onTertiaryFixed,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 12,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: AppRadius.radiusFull,
                        ),
                      ),
                      child: _isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: AppColors.onTertiaryFixed,
                              ),
                            )
                          : const Text(
                              'Nộp bài',
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showExitConfirm() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: AppRadius.radiusLg),
        title: const Text('Thoát kỳ thi?'),
        content: const Text(
          'Bạn có chắc muốn thoát? Tiến độ sẽ không được lưu.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              context.go('/exams');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
            ),
            child: const Text('Thoát'),
          ),
        ],
      ),
    );
  }
}

class _QuestionData {
  const _QuestionData({
    required this.id,
    required this.text,
    required this.options,
  });

  final int id;
  final String text;
  final List<String> options;
}

class _AnswerOption extends StatelessWidget {
  const _AnswerOption({
    required this.index,
    required this.text,
    required this.isSelected,
    required this.onTap,
  });

  final int index;
  final String text;
  final bool isSelected;
  final VoidCallback onTap;

  String get _label => String.fromCharCode(65 + index);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(AppSpacing.base),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.1)
              : AppColors.surfaceContainerLow,
          borderRadius: AppRadius.radiusLg,
          border: Border.all(
            color: isSelected ? AppColors.primary : Colors.transparent,
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primary
                    : AppColors.surfaceContainerHighest,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  _label,
                  style: TextStyle(
                    fontFamily: 'Manrope',
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: isSelected
                        ? AppColors.onPrimary
                        : AppColors.onSurfaceVariant,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                text,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: AppColors.onSurface,
                ),
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check_circle,
                color: AppColors.primary,
                size: 22,
              ),
          ],
        ),
      ),
    );
  }
}

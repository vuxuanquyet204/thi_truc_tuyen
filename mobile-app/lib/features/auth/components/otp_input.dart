import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// OTP input widget — 6-digit auto-advance input
class OTPInput extends StatefulWidget {
  const OTPInput({
    super.key,
    required this.length,
    required this.onCompleted,
    this.onChanged,
    this.autoFocus = true,
  });

  final int length;
  final ValueChanged<String> onCompleted;
  final ValueChanged<String>? onChanged;
  final bool autoFocus;

  @override
  State<OTPInput> createState() => _OTPInputState();
}

class _OTPInputState extends State<OTPInput> {
  late List<TextEditingController> _controllers;
  late List<FocusNode> _focusNodes;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(widget.length, (_) => TextEditingController());
    _focusNodes = List.generate(widget.length, (_) => FocusNode());
    if (widget.autoFocus) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _focusNodes[0].requestFocus();
      });
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) c.dispose();
    for (final f in _focusNodes) f.dispose();
    super.dispose();
  }

  String get _otp => _controllers.map((c) => c.text).join();

  void _onDigitChanged(String value, int index) {
    // Handle paste
    if (value.length > 1) {
      _pasteCode(value);
      return;
    }

    if (value.length == 1 && index < widget.length - 1) {
      _focusNodes[index + 1].requestFocus();
    }

    widget.onChanged?.call(_otp);
    if (_controllers.every((c) => c.text.isNotEmpty)) {
      widget.onCompleted(_otp);
    }
  }

  void _pasteCode(String code) {
    final digits = code.replaceAll(RegExp(r'[^0-9]'), '').substring(0, widget.length);
    for (var i = 0; i < widget.length; i++) {
      _controllers[i].text = i < digits.length ? digits[i] : '';
    }
    if (digits.length == widget.length) {
      widget.onCompleted(digits);
    }
    _focusNodes[widget.length - 1].requestFocus();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: List.generate(widget.length, (index) {
        return SizedBox(
          width: 48,
          height: 56,
          child: KeyboardListener(
            focusNode: FocusNode(),
            onKeyEvent: (event) {
              if (event is KeyDownEvent &&
                  event.logicalKey == LogicalKeyboardKey.backspace &&
                  _controllers[index].text.isEmpty &&
                  index > 0) {
                _focusNodes[index - 1].requestFocus();
              }
            },
            child: TextField(
              controller: _controllers[index],
              focusNode: _focusNodes[index],
              textAlign: TextAlign.center,
              keyboardType: TextInputType.number,
              textInputAction: index < widget.length - 1
                  ? TextInputAction.next
                  : TextInputAction.done,
              maxLength: 1,
              style: const TextStyle(
                fontFamily: 'Manrope',
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: Color(0xFF003178),
                letterSpacing: 4,
              ),
              decoration: const InputDecoration(
                counterText: '',
                filled: true,
                fillColor: Color(0xFFFFFFFF),
              ),
              onChanged: (v) => _onDigitChanged(v, index),
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            ),
          ),
        );
      }),
    );
  }
}
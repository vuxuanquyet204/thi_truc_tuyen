/// Formatters for displaying data consistently
library;

/// Date & Time formatters
String formatDate(DateTime date) {
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
  ];
  return '${date.day} ${months[date.month - 1]}, ${date.year}';
}

String formatDateShort(DateTime date) {
  return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
}

String formatTime(DateTime date) {
  return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
}

String formatDateTime(DateTime date) {
  return '${formatDateShort(date)}, ${formatTime(date)}';
}

String formatRelativeTime(DateTime date) {
  final now = DateTime.now();
  final diff = now.difference(date);

  if (diff.inSeconds < 60) return 'Vừa xong';
  if (diff.inMinutes < 60) return '${diff.inMinutes} phút trước';
  if (diff.inHours < 24) return '${diff.inHours} giờ trước';
  if (diff.inDays < 7) return '${diff.inDays} ngày trước';
  return formatDateShort(date);
}

String formatDuration(int minutes) {
  if (minutes < 60) return '$minutes phút';
  final h = minutes ~/ 60;
  final m = minutes % 60;
  if (m == 0) return '$h giờ';
  return '$h giờ $m phút';
}

String formatTimer(int seconds) {
  final m = seconds ~/ 60;
  final s = seconds % 60;
  return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
}

/// Number formatters
String formatNumber(int number) {
  if (number >= 1000000) {
    return '${(number / 1000000).toStringAsFixed(1)}M';
  }
  if (number >= 1000) {
    return '${(number / 1000).toStringAsFixed(1)}k';
  }
  return number.toString();
}

String formatScore(int score, [int maxScore = 100]) {
  return '$score/$maxScore';
}

String formatPercent(double value) {
  return '${(value * 100).toStringAsFixed(0)}%';
}

/// Token formatters
String formatLearnToken(int tokens) {
  if (tokens >= 1000) {
    return '${(tokens / 1000).toStringAsFixed(1)}k LT';
  }
  return '$tokens LT';
}

String formatTokenDelta(int delta) {
  if (delta >= 0) return '+$delta LT';
  return '$delta LT';
}

/// Text formatters
String capitalize(String text) {
  if (text.isEmpty) return text;
  return text[0].toUpperCase() + text.substring(1).toLowerCase();
}

String truncate(String text, int maxLength) {
  if (text.length <= maxLength) return text;
  return '${text.substring(0, maxLength)}...';
}

String maskEmail(String email) {
  if (!email.contains('@')) return email;
  final parts = email.split('@');
  final username = parts[0];
  if (username.length <= 2) return '${username[0]}***@${parts[1]}';
  return '${username[0]}${'*' * (username.length - 2)}${username[username.length - 1]}@${parts[1]}';
}

String maskPhone(String phone) {
  if (phone.length < 4) return phone;
  return '${phone.substring(0, phone.length - 4)}••••';
}

String initials(String name) {
  final parts = name.trim().split(' ');
  if (parts.isEmpty) return '';
  if (parts.length == 1) return parts[0][0].toUpperCase();
  return '${parts[0][0]}${parts[parts.length - 1][0]}'.toUpperCase();
}

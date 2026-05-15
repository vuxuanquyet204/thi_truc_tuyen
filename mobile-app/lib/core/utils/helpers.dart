/// Helper utilities
library;

/// Debounce utility
class Debouncer {
  Debouncer({this.milliseconds = 300});

  final int milliseconds;
  DateTime? _lastRun;

  bool shouldRun() {
    final now = DateTime.now();
    if (_lastRun == null ||
        now.difference(_lastRun!).inMilliseconds >= milliseconds) {
      _lastRun = now;
      return true;
    }
    return false;
  }

  void reset() {
    _lastRun = null;
  }
}

/// Retry utility with exponential backoff
Future<T> retry<T>(
  Future<T> Function() fn, {
  int maxRetries = 3,
  int initialDelayMs = 500,
}) async {
  int attempts = 0;
  int delay = initialDelayMs;

  while (true) {
    try {
      return await fn();
    } catch (e) {
      attempts++;
      if (attempts >= maxRetries) rethrow;
      await Future.delayed(Duration(milliseconds: delay));
      delay *= 2;
    }
  }
}

/// Safe JSON access with default
T? tryGet<T>(Map<String, dynamic>? map, String key, T? defaultValue) {
  try {
    final value = map?[key];
    if (value == null) return defaultValue;
    if (T == int && value is num) return value.toInt() as T;
    if (T == double && value is num) return value.toDouble() as T;
    return value as T?;
  } catch (_) {
    return defaultValue;
  }
}

/// Platform detection
bool get isMobile => true; // Flutter default — override with platform check if needed

/// Clamp value between min and max
T clamp<T extends num>(T value, T min, T max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/// Shuffle a list (for mock data)
List<T> shuffleList<T>(List<T> list) {
  final result = List<T>.from(list);
  for (var i = result.length - 1; i > 0; i--) {
    final j = (i + 1) % (i + 1);
    final temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

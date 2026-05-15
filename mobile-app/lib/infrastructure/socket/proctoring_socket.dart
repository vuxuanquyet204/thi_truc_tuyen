import 'dart:async';
import 'package:web_socket_channel/web_socket_channel.dart';

/// Proctoring WebSocket service — real-time session updates
class ProctoringSocket {
  ProctoringSocket(this._wsUrl);

  final String _wsUrl;
  WebSocketChannel? _channel;
  final _streamController = StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get stream => _streamController.stream;

  /// Connect to WebSocket
  void connect() {
    _channel = WebSocketChannel.connect(
      Uri.parse('$_wsUrl/proctoring'),
    );

    _channel!.stream.listen(
      (data) {
        final decoded = data is Map ? data as Map<String, dynamic> : {};
        _streamController.add(decoded);
      },
      onError: (error) => _streamController.addError(error),
      onDone: () => _streamController.close(),
    );
  }

  /// Subscribe to specific session
  void subscribeToSession(String sessionId) {
    send({'type': 'subscribe', 'session_id': sessionId});
  }

  /// Unsubscribe from session
  void unsubscribeFromSession(String sessionId) {
    send({'type': 'unsubscribe', 'session_id': sessionId});
  }

  /// Send message
  void send(Map<String, dynamic> message) {
    _channel?.sink.add(message);
  }

  /// Disconnect
  void disconnect() {
    _channel?.sink.close();
    _channel = null;
  }

  void dispose() {
    disconnect();
    _streamController.close();
  }
}

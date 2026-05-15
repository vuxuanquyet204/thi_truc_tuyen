import 'package:dio/dio.dart';
import '../../core/config/app_config.dart';
import '../storage/secure_storage.dart';

/// HTTP Client with Dio - Academic Luminary
class HttpClient {
  HttpClient._();

  static HttpClient? _instance;
  static HttpClient get instance {
    _instance ??= HttpClient._();
    return _instance!;
  }

  late final Dio _dio;
  final _secureStorage = SecureStorageService.instance;

  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return;

    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseURL,
        connectTimeout: AppConfig.connectionTimeout,
        receiveTimeout: AppConfig.receiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(_AuthInterceptor(_secureStorage));
    _dio.interceptors.add(_ErrorInterceptor());

    _initialized = true;
  }

  Dio get dio {
    if (!_initialized) {
      throw StateError('HttpClient not initialized. Call init() first.');
    }
    return _dio;
  }

  // ==================== REQUEST METHODS ====================

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.get<T>(
      path,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.put<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.patch<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.delete<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }
}

/// Auth interceptor for adding token to requests
class _AuthInterceptor extends Interceptor {
  _AuthInterceptor(this._secureStorage);

  final SecureStorageService _secureStorage;

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _secureStorage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Token expired, attempt refresh
      try {
        final refreshToken = await _secureStorage.getRefreshToken();
        if (refreshToken != null) {
          // TODO: Implement token refresh
          // final newToken = await _refreshToken(refreshToken);
          // Retry original request with new token
        }
      } catch (_) {
        // Refresh failed, clear auth
        await _secureStorage.clearAuthData();
      }
    }
    handler.next(err);
  }
}

/// Error interceptor for logging and error handling
class _ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // Log error in debug mode
    if (AppConfig.isDebug) {
      print('API Error: ${err.message}');
      print('URL: ${err.requestOptions.uri}');
      print('Status: ${err.response?.statusCode}');
    }
    handler.next(err);
  }
}

/// API exception wrapper
class ApiException implements Exception {
  ApiException({
    required this.message,
    this.code,
    this.statusCode,
    this.data,
  });

  final String message;
  final String? code;
  final int? statusCode;
  final dynamic data;

  @override
  String toString() => 'ApiException: $message (code: $code, status: $statusCode)';
}
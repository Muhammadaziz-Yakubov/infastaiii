import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../core/config/app_config.dart';
import '../../core/utils/helpers.dart';
import '../services/storage_service.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();
  
  late Dio _dio;
  
  void initialize() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConfig.baseUrl,
      connectTimeout: Duration(milliseconds: AppConfig.connectTimeout),
      receiveTimeout: Duration(milliseconds: AppConfig.receiveTimeout),
      sendTimeout: Duration(milliseconds: AppConfig.sendTimeout),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
    
    // Add interceptors
    _dio.interceptors.add(AuthInterceptor());
    _dio.interceptors.add(ErrorInterceptor());
    _dio.interceptors.add(LogInterceptor(
      requestBody: kDebugMode,
      responseBody: kDebugMode,
      requestHeader: kDebugMode,
      responseHeader: kDebugMode,
    ));
  }
  
  // GET request
  Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: options,
      );
      return ApiResponse<T>.success(response.data as T);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // POST request
  Future<ApiResponse<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return ApiResponse<T>.success(response.data as T);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // PUT request
  Future<ApiResponse<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.put<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return ApiResponse<T>.success(response.data as T);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // PATCH request
  Future<ApiResponse<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.patch<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return ApiResponse<T>.success(response.data as T);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // DELETE request
  Future<ApiResponse<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.delete<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return ApiResponse<T>.success(response.data as T);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Upload file
  Future<ApiResponse<T>> upload<T>(
    String path, {
    required File file,
    Map<String, dynamic>? data,
    ProgressCallback? onSendProgress,
  }) async {
    try {
      final fileName = file.path.split('/').last;
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(
          file.path,
          filename: fileName,
        ),
        ...?data,
      });
      
      final response = await _dio.post<T>(
        path,
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
        ),
        onSendProgress: onSendProgress,
      );
      
      return ApiResponse<T>.success(response.data as T);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Download file
  Future<void> download(
    String url,
    String savePath, {
    ProgressCallback? onReceiveProgress,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      await _dio.download(
        url,
        savePath,
        onReceiveProgress: onReceiveProgress,
        queryParameters: queryParameters,
      );
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Handle errors
  ApiException _handleError(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return ApiException(
            message: 'Internet ulanishida xatolik. Iltimos, qayta urinib ko\'ring.',
            type: ApiExceptionType.timeout,
          );
        
        case DioExceptionType.connectionError:
          return ApiException(
            message: 'Internetga ulanmagan. Iltimos, aloqani tekshiring.',
            type: ApiExceptionType.network,
          );
        
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          final responseData = error.response?.data;
          
          String message = 'Noma\'lum xatolik';
          
          if (responseData is Map<String, dynamic>) {
            message = responseData['message'] ?? responseData['error'] ?? message;
          } else if (responseData is String) {
            try {
              final decoded = jsonDecode(responseData);
              message = decoded['message'] ?? decoded['error'] ?? message;
            } catch (e) {
              message = responseData;
            }
          }
          
          switch (statusCode) {
            case 400:
              return ApiException(
                message: message,
                type: ApiExceptionType.badRequest,
              );
            case 401:
              return ApiException(
                message: 'Avtorizatsiya xatosi. Iltimos, qayta kiring.',
                type: ApiExceptionType.unauthorized,
              );
            case 403:
              return ApiException(
                message: 'Sizda bu amalni bajarish uchun ruxsat yo\'q.',
                type: ApiExceptionType.forbidden,
              );
            case 404:
              return ApiException(
                message: 'So\'ralgan ma\'lumot topilmadi.',
                type: ApiExceptionType.notFound,
              );
            case 429:
              return ApiException(
                message: 'Juda ko\'p so\'rov. Iltimos, biroz kutib turing.',
                type: ApiExceptionType.tooManyRequests,
              );
            case 500:
              return ApiException(
                message: 'Server xatolik. Iltimos, keyinroq urinib ko\'ring.',
                type: ApiExceptionType.serverError,
              );
            default:
              return ApiException(
                message: message,
                type: ApiExceptionType.unknown,
              );
          }
        
        case DioExceptionType.cancel:
          return ApiException(
            message: 'So\'rov bekor qilindi.',
            type: ApiExceptionType.cancelled,
          );
        
        case DioExceptionType.unknown:
          return ApiException(
            message: 'Noma\'lum xatolik yuz berdi.',
            type: ApiExceptionType.unknown,
          );
      }
    }
    
    return ApiException(
      message: 'Noma\'lum xatolik yuz berdi.',
      type: ApiExceptionType.unknown,
    );
  }
}

// API Response wrapper
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final int? statusCode;
  
  ApiResponse({
    required this.success,
    this.data,
    this.message,
    this.statusCode,
  });
  
  factory ApiResponse.success(T data, {String? message, int? statusCode}) {
    return ApiResponse(
      success: true,
      data: data,
      message: message,
      statusCode: statusCode,
    );
  }
  
  factory ApiResponse.error(String message, {int? statusCode}) {
    return ApiResponse(
      success: false,
      message: message,
      statusCode: statusCode,
    );
  }
}

// API Exception
class ApiException implements Exception {
  final String message;
  final ApiExceptionType type;
  final int? statusCode;
  
  ApiException({
    required this.message,
    required this.type,
    this.statusCode,
  });
  
  @override
  String toString() {
    return 'ApiException: $message (Type: $type, StatusCode: $statusCode)';
  }
}

enum ApiExceptionType {
  network,
  timeout,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  tooManyRequests,
  serverError,
  cancelled,
  unknown,
}

// Auth Interceptor
class AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    // Add auth token if available
    final token = await StorageService.getToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    
    // Add language header
    final language = await StorageService.getLanguage();
    options.headers['Accept-Language'] = language;
    
    handler.next(options);
  }
  
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    // Handle token refresh
    if (err.response?.statusCode == 401) {
      try {
        final refreshToken = await StorageService.getRefreshToken();
        if (refreshToken != null) {
          // Attempt to refresh token
          final newToken = await _refreshToken(refreshToken);
          if (newToken != null) {
            // Save new token
            await StorageService.saveToken(newToken);
            
            // Retry the original request with new token
            final originalRequest = err.requestOptions;
            originalRequest.headers['Authorization'] = 'Bearer $newToken';
            
            try {
              final response = await Dio().fetch(originalRequest);
              handler.resolve(response);
              return;
            } catch (e) {
              // If retry fails, continue with error
            }
          }
        }
        
        // If refresh fails, logout user
        await _handleAuthFailure();
      } catch (e) {
        await _handleAuthFailure();
      }
    }
    
    handler.next(err);
  }
  
  Future<String?> _refreshToken(String refreshToken) async {
    try {
      final dio = Dio();
      final response = await dio.post(
        '${AppConfig.baseUrl}${AppConfig.authEndpoint}/refresh',
        data: {'refreshToken': refreshToken},
      );
      
      if (response.statusCode == 200) {
        return response.data['token'];
      }
    } catch (e) {
      // Refresh failed
    }
    return null;
  }
  
  Future<void> _handleAuthFailure() async {
    // Clear stored tokens and user data
    await StorageService.removeToken();
    await StorageService.removeRefreshToken();
    await StorageService.removeUserData();
    
    // Navigate to login screen (this should be handled by the app state)
    // You might want to use a callback or event system here
  }
}

// Error Interceptor
class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // Log errors in debug mode
    if (kDebugMode) {
      print('API Error: ${err.message}');
      print('Response: ${err.response?.data}');
    }
    
    handler.next(err);
  }
}

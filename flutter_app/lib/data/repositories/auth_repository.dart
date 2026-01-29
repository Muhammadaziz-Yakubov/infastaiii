import '../models/user_model.dart';
import '../services/api_service.dart';
import '../../core/config/app_config.dart';

class AuthRepository {
  final ApiService _apiService = ApiService();
  
  // Check phone number
  Future<PhoneCheckResponse> checkPhone(String phone) async {
    final response = await _apiService.post<Map<String, dynamic>>(
      '${AppConfig.authEndpoint}/check-phone',
      data: {'phone': phone},
    );
    
    return PhoneCheckResponse.fromJson(response.data!);
  }
  
  // Send OTP to phone
  Future<void> sendPhoneOTP(String phone) async {
    await _apiService.post(
      '${AppConfig.authEndpoint}/send-sms-code',
      data: {'phone': phone},
    );
  }
  
  // Verify phone OTP
  Future<void> verifyPhoneOTP(String phone, String otp) async {
    await _apiService.post(
      '${AppConfig.authEndpoint}/verify-phone-otp',
      data: {'phone': phone, 'otp': otp},
    );
  }
  
  // Create password for new user
  Future<AuthResponse> createPassword({
    required String phone,
    required String password,
    required String firstName,
    required String lastName,
    DateTime? birthday,
    String? avatar,
  }) async {
    final response = await _apiService.post<Map<String, dynamic>>(
      '${AppConfig.authEndpoint}/create-password',
      data: {
        'phone': phone,
        'password': password,
        'firstName': firstName,
        'lastName': lastName,
        if (birthday != null) 'birthday': birthday.toIso8601String(),
        if (avatar != null) 'avatar': avatar,
      },
    );
    
    return AuthResponse.fromJson(response.data!);
  }
  
  // Login with email and password
  Future<AuthResponse> loginWithEmail(String email, String password) async {
    final response = await _apiService.post<Map<String, dynamic>>(
      '${AppConfig.authEndpoint}/login',
      data: {'email': email, 'password': password},
    );
    
    return AuthResponse.fromJson(response.data!);
  }
  
  // Login with phone and password
  Future<AuthResponse> loginWithPhone(String phone, String password) async {
    final response = await _apiService.post<Map<String, dynamic>>(
      '${AppConfig.authEndpoint}/login-phone',
      data: {'phone': phone, 'password': password},
    );
    
    return AuthResponse.fromJson(response.data!);
  }
  
  // Get current user profile
  Future<User> getCurrentUser() async {
    final response = await _apiService.get<Map<String, dynamic>>(
      '${AppConfig.authEndpoint}/profile',
    );
    
    return User.fromJson(response.data!['user']);
  }
  
  // Update user profile
  Future<User> updateProfile({
    String? firstName,
    String? lastName,
    String? email,
    String? phone,
    DateTime? birthday,
    String? avatar,
  }) async {
    final response = await _apiService.put<Map<String, dynamic>>(
      '${AppConfig.authEndpoint}/profile',
      data: {
        if (firstName != null) 'firstName': firstName,
        if (lastName != null) 'lastName': lastName,
        if (email != null) 'email': email,
        if (phone != null) 'phone': phone,
        if (birthday != null) 'birthday': birthday.toIso8601String(),
        if (avatar != null) 'avatar': avatar,
      },
    );
    
    return User.fromJson(response.data!['user']);
  }
  
  // Logout
  Future<void> logout() async {
    await _apiService.post('${AppConfig.authEndpoint}/logout');
  }
  
  // Forgot password
  Future<void> forgotPassword(String phone) async {
    await _apiService.post(
      '${AppConfig.authEndpoint}/forgot-password',
      data: {'phone': phone},
    );
  }
  
  // Reset password
  Future<void> resetPassword({
    required String phone,
    required String code,
    required String newPassword,
  }) async {
    await _apiService.post(
      '${AppConfig.authEndpoint}/reset-password',
      data: {
        'phone': phone,
        'code': code,
        'newPassword': newPassword,
      },
    );
  }
  
  // Change password
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    await _apiService.post(
      '${AppConfig.authEndpoint}/change-password',
      data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      },
    );
  }
  
  // Delete account
  Future<void> deleteAccount() async {
    await _apiService.delete('${AppConfig.authEndpoint}/account');
  }
  
  // Refresh token
  Future<String> refreshToken(String refreshToken) async {
    final response = await _apiService.post<Map<String, dynamic>>(
      '${AppConfig.authEndpoint}/refresh',
      data: {'refreshToken': refreshToken},
    );
    
    return response.data!['token'];
  }
  
  // Verify email
  Future<void> verifyEmail(String email, String code) async {
    await _apiService.post(
      '${AppConfig.authEndpoint}/verify-email',
      data: {'email': email, 'code': code},
    );
  }
  
  // Resend email verification
  Future<void> resendEmailVerification(String email) async {
    await _apiService.post(
      '${AppConfig.authEndpoint}/resend-email-verification',
      data: {'email': email},
    );
  }
  
  // Google OAuth
  Future<String> getGoogleAuthUrl() async {
    final response = await _apiService.get<Map<String, dynamic>>(
      '${AppConfig.authEndpoint}/google',
    );
    
    return response.data!['url'];
  }
  
  Future<AuthResponse> handleGoogleCallback(String code, String state) async {
    final response = await _apiService.get<Map<String, dynamic>>(
      '${AppConfig.authEndpoint}/google/callback',
      queryParameters: {'code': code, 'state': state},
    );
    
    return AuthResponse.fromJson(response.data!);
  }
}

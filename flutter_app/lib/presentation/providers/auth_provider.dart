import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/user_model.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/services/storage_service.dart';
import '../../core/utils/helpers.dart';
import '../../core/utils/validators.dart';

// Auth state
class AuthState {
  final bool isLoading;
  final bool isAuthenticated;
  final User? user;
  final String? error;
  final bool isCheckingAuth;
  
  const AuthState({
    this.isLoading = false,
    this.isAuthenticated = false,
    this.user,
    this.error,
    this.isCheckingAuth = false,
  });
  
  AuthState copyWith({
    bool? isLoading,
    bool? isAuthenticated,
    User? user,
    String? error,
    bool? isCheckingAuth,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      error: error ?? this.error,
      isCheckingAuth: isCheckingAuth ?? this.isCheckingAuth,
    );
  }
}

// Auth provider
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;
  
  AuthNotifier(this._repository) : super(const AuthState()) {
    _checkAuthStatus();
  }
  
  // Check authentication status on app start
  Future<void> _checkAuthStatus() async {
    state = state.copyWith(isCheckingAuth: true);
    
    try {
      final token = await StorageService.getToken();
      if (token != null) {
        final user = await _repository.getCurrentUser();
        state = state.copyWith(
          isAuthenticated: true,
          user: user,
          isCheckingAuth: false,
        );
      } else {
        state = state.copyWith(isCheckingAuth: false);
      }
    } catch (e) {
      // Clear invalid token
      await StorageService.removeToken();
      state = state.copyWith(
        isAuthenticated: false,
        user: null,
        isCheckingAuth: false,
      );
    }
  }
  
  // Check phone number
  Future<bool> checkPhone(String phone) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final phoneError = Validators.validatePhone(phone);
      if (phoneError != null) {
        state = state.copyWith(isLoading: false, error: phoneError);
        return false;
      }
      
      final response = await _repository.checkPhone(phone);
      state = state.copyWith(isLoading: false);
      return response.exists;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }
  
  // Send OTP
  Future<bool> sendOTP(String phone) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      await _repository.sendPhoneOTP(phone);
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }
  
  // Verify OTP
  Future<bool> verifyOTP(String phone, String otp) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final otpError = Validators.validateOTP(otp);
      if (otpError != null) {
        state = state.copyWith(isLoading: false, error: otpError);
        return false;
      }
      
      await _repository.verifyPhoneOTP(phone, otp);
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }
  
  // Create password (registration)
  Future<bool> createPassword({
    required String phone,
    required String password,
    required String firstName,
    required String lastName,
    DateTime? birthday,
    String? avatar,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      // Validate inputs
      final passwordError = Validators.validatePassword(password);
      if (passwordError != null) {
        state = state.copyWith(isLoading: false, error: passwordError);
        return false;
      }
      
      final nameError = Validators.validateName(firstName);
      if (nameError != null) {
        state = state.copyWith(isLoading: false, error: nameError);
        return false;
      }
      
      final lastNameError = Validators.validateName(lastName, fieldName: 'Familiya');
      if (lastNameError != null) {
        state = state.copyWith(isLoading: false, error: lastNameError);
        return false;
      }
      
      final response = await _repository.createPassword(
        phone: phone,
        password: password,
        firstName: firstName,
        lastName: lastName,
        birthday: birthday,
        avatar: avatar,
      );
      
      // Save tokens and user data
      await StorageService.saveToken(response.token);
      await StorageService.saveRefreshToken(response.refreshToken);
      await StorageService.saveUserData(response.user.toJson());
      
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: response.user,
      );
      
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }
  
  // Login with email
  Future<bool> loginWithEmail(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      // Validate inputs
      final emailError = Validators.validateEmail(email);
      if (emailError != null) {
        state = state.copyWith(isLoading: false, error: emailError);
        return false;
      }
      
      final passwordError = Validators.validatePassword(password);
      if (passwordError != null) {
        state = state.copyWith(isLoading: false, error: passwordError);
        return false;
      }
      
      final response = await _repository.loginWithEmail(email, password);
      
      // Save tokens and user data
      await StorageService.saveToken(response.token);
      await StorageService.saveRefreshToken(response.refreshToken);
      await StorageService.saveUserData(response.user.toJson());
      
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: response.user,
      );
      
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }
  
  // Login with phone
  Future<bool> loginWithPhone(String phone, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      // Validate inputs
      final phoneError = Validators.validatePhone(phone);
      if (phoneError != null) {
        state = state.copyWith(isLoading: false, error: phoneError);
        return false;
      }
      
      final passwordError = Validators.validatePassword(password);
      if (passwordError != null) {
        state = state.copyWith(isLoading: false, error: passwordError);
        return false;
      }
      
      final response = await _repository.loginWithPhone(phone, password);
      
      // Save tokens and user data
      await StorageService.saveToken(response.token);
      await StorageService.saveRefreshToken(response.refreshToken);
      await StorageService.saveUserData(response.user.toJson());
      
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: response.user,
      );
      
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }
  
  // Update profile
  Future<bool> updateProfile({
    String? firstName,
    String? lastName,
    String? email,
    String? phone,
    DateTime? birthday,
    String? avatar,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final updatedUser = await _repository.updateProfile(
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        birthday: birthday,
        avatar: avatar,
      );
      
      // Update stored user data
      await StorageService.saveUserData(updatedUser.toJson());
      
      state = state.copyWith(
        isLoading: false,
        user: updatedUser,
      );
      
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }
  
  // Logout
  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    
    try {
      await _repository.logout();
    } catch (e) {
      // Continue with logout even if API call fails
    }
    
    // Clear local storage
    await StorageService.removeToken();
    await StorageService.removeRefreshToken();
    await StorageService.removeUserData();
    
    state = const AuthState();
  }
  
  // Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }
  
  // Refresh user data
  Future<void> refreshUser() async {
    if (!state.isAuthenticated) return;
    
    try {
      final user = await _repository.getCurrentUser();
      await StorageService.saveUserData(user.toJson());
      state = state.copyWith(user: user);
    } catch (e) {
      // Don't update state on error
    }
  }
}

// Provider
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository();
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repository = ref.read(authRepositoryProvider);
  return AuthNotifier(repository);
});

// Convenience providers
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});

final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authProvider).user;
});

final authLoadingProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isLoading;
});

final authErrorProvider = Provider<String?>((ref) {
  return ref.watch(authProvider).error;
});

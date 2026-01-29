import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage();
  static SharedPreferences? _prefs;
  
  static Future<void> initialize() async {
    _prefs = await SharedPreferences.getInstance();
  }
  
  // Secure storage methods (for sensitive data)
  
  // JWT Token
  static Future<void> saveToken(String token) async {
    await _secureStorage.write(key: 'auth_token', value: token);
  }
  
  static Future<String?> getToken() async {
    return await _secureStorage.read(key: 'auth_token');
  }
  
  static Future<void> removeToken() async {
    await _secureStorage.delete(key: 'auth_token');
  }
  
  // Refresh Token
  static Future<void> saveRefreshToken(String refreshToken) async {
    await _secureStorage.write(key: 'refresh_token', value: refreshToken);
  }
  
  static Future<String?> getRefreshToken() async {
    return await _secureStorage.read(key: 'refresh_token');
  }
  
  static Future<void> removeRefreshToken() async {
    await _secureStorage.delete(key: 'refresh_token');
  }
  
  // User credentials (for auto-login)
  static Future<void> saveUserCredentials({
    required String phone,
    required String password,
  }) async {
    await _secureStorage.write(key: 'user_phone', value: phone);
    await _secureStorage.write(key: 'user_password', value: password);
  }
  
  static Future<Map<String, String?>> getUserCredentials() async {
    final phone = await _secureStorage.read(key: 'user_phone');
    final password = await _secureStorage.read(key: 'user_password');
    return {'phone': phone, 'password': password};
  }
  
  static Future<void> removeUserCredentials() async {
    await _secureStorage.delete(key: 'user_phone');
    await _secureStorage.delete(key: 'user_password');
  }
  
  // Biometric settings
  static Future<void> saveBiometricEnabled(bool enabled) async {
    await _secureStorage.write(key: 'biometric_enabled', value: enabled.toString());
  }
  
  static Future<bool> isBiometricEnabled() async {
    final value = await _secureStorage.read(key: 'biometric_enabled');
    return value == 'true';
  }
  
  // PIN code
  static Future<void> savePinCode(String pin) async {
    await _secureStorage.write(key: 'pin_code', value: pin);
  }
  
  static Future<String?> getPinCode() async {
    return await _secureStorage.read(key: 'pin_code');
  }
  
  static Future<void> removePinCode() async {
    await _secureStorage.delete(key: 'pin_code');
  }
  
  // Local storage methods (for non-sensitive data)
  
  // User data
  static Future<void> saveUserData(Map<String, dynamic> userData) async {
    await _prefs?.setString('user_data', jsonEncode(userData));
  }
  
  static Future<Map<String, dynamic>?> getUserData() async {
    final userDataString = _prefs?.getString('user_data');
    if (userDataString != null) {
      return jsonDecode(userDataString);
    }
    return null;
  }
  
  static Future<void> removeUserData() async {
    await _prefs?.remove('user_data');
  }
  
  // App settings
  static Future<void> saveLanguage(String language) async {
    await _prefs?.setString('app_language', language);
  }
  
  static Future<String> getLanguage() async {
    return _prefs?.getString('app_language') ?? 'uz';
  }
  
  static Future<void> saveThemeMode(String themeMode) async {
    await _prefs?.setString('theme_mode', themeMode);
  }
  
  static Future<String> getThemeMode() async {
    return _prefs?.getString('theme_mode') ?? 'system';
  }
  
  static Future<void> saveNotificationsEnabled(bool enabled) async {
    await _prefs?.setBool('notifications_enabled', enabled);
  }
  
  static Future<bool> isNotificationsEnabled() async {
    return _prefs?.getBool('notifications_enabled') ?? true;
  }
  
  // Onboarding status
  static Future<void> setOnboardingCompleted(bool completed) async {
    await _prefs?.setBool('onboarding_completed', completed);
  }
  
  static Future<bool> isOnboardingCompleted() async {
    return _prefs?.getBool('onboarding_completed') ?? false;
  }
  
  // First launch
  static Future<void> setFirstLaunch(bool isFirst) async {
    await _prefs?.setBool('first_launch', isFirst);
  }
  
  static Future<bool> isFirstLaunch() async {
    return _prefs?.getBool('first_launch') ?? true;
  }
  
  // Cache management
  static Future<void> cacheData(String key, dynamic data) async {
    await _prefs?.setString('cache_$key', jsonEncode(data));
  }
  
  static Future<T?> getCachedData<T>(String key) async {
    final dataString = _prefs?.getString('cache_$key');
    if (dataString != null) {
      return jsonDecode(dataString);
    }
    return null;
  }
  
  static Future<void> removeCachedData(String key) async {
    await _prefs?.remove('cache_$key');
  }
  
  static Future<void> clearAllCache() async {
    final keys = _prefs?.getKeys();
    if (keys != null) {
      for (final key in keys) {
        if (key.startsWith('cache_')) {
          await _prefs?.remove(key);
        }
      }
    }
  }
  
  // Task filters
  static Future<void> saveTaskFilters(Map<String, dynamic> filters) async {
    await _prefs?.setString('task_filters', jsonEncode(filters));
  }
  
  static Future<Map<String, dynamic>?> getTaskFilters() async {
    final filtersString = _prefs?.getString('task_filters');
    if (filtersString != null) {
      return jsonDecode(filtersString);
    }
    return null;
  }
  
  // Finance filters
  static Future<void> saveFinanceFilters(Map<String, dynamic> filters) async {
    await _prefs?.setString('finance_filters', jsonEncode(filters));
  }
  
  static Future<Map<String, dynamic>?> getFinanceFilters() async {
    final filtersString = _prefs?.getString('finance_filters');
    if (filtersString != null) {
      return jsonDecode(filtersString);
    }
    return null;
  }
  
  // Dashboard preferences
  static Future<void> saveDashboardLayout(List<String> widgets) async {
    await _prefs?.setStringList('dashboard_layout', widgets);
  }
  
  static Future<List<String>> getDashboardLayout() async {
    return _prefs?.getStringList('dashboard_layout') ?? [
      'daily_summary',
      'task_progress',
      'finance_balance',
      'goal_completion',
      'ai_tips',
    ];
  }
  
  // Analytics and tracking
  static Future<void> saveAnalyticsConsent(bool consent) async {
    await _prefs?.setBool('analytics_consent', consent);
  }
  
  static Future<bool> getAnalyticsConsent() async {
    return _prefs?.getBool('analytics_consent') ?? false;
  }
  
  // App version tracking
  static Future<void> saveAppVersion(String version) async {
    await _prefs?.setString('app_version', version);
  }
  
  static Future<String?> getAppVersion() async {
    return _prefs?.getString('app_version');
  }
  
  // Last sync time
  static Future<void> saveLastSyncTime(DateTime time) async {
    await _prefs?.setString('last_sync_time', time.toIso8601String());
  }
  
  static Future<DateTime?> getLastSyncTime() async {
    final timeString = _prefs?.getString('last_sync_time');
    if (timeString != null) {
      return DateTime.parse(timeString);
    }
    return null;
  }
  
  // Clear all data (for logout)
  static Future<void> clearAll() async {
    // Clear secure storage
    await _secureStorage.deleteAll();
    
    // Clear preferences except some settings
    final keysToKeep = [
      'app_language',
      'theme_mode',
      'notifications_enabled',
      'analytics_consent',
      'onboarding_completed',
      'first_launch',
    ];
    
    final allKeys = _prefs?.getKeys();
    if (allKeys != null) {
      for (final key in allKeys) {
        if (!keysToKeep.contains(key)) {
          await _prefs?.remove(key);
        }
      }
    }
  }
  
  // Debug method to print all stored data (remove in production)
  static Future<void> debugPrintAllData() async {
    print('=== SECURE STORAGE ===');
    final secureData = await _secureStorage.readAll();
    secureData.forEach((key, value) {
      print('$key: $value');
    });
    
    print('=== SHARED PREFERENCES ===');
    final prefData = _prefs?.getKeys();
    if (prefData != null) {
      for (final key in prefData) {
        final value = _prefs?.get(key);
        print('$key: $value');
      }
    }
  }
}

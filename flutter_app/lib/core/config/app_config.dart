class AppConfig {
  // App Information
  static const String appName = 'InFast AI';
  static const String appVersion = '1.0.0';
  
  // API Configuration
  static const String baseUrl = 'http://localhost:5000/api'; // Development
  // static const String baseUrl = 'https://api.infast.uz/api'; // Production
  
  // API Endpoints
  static const String authEndpoint = '/auth';
  static const String tasksEndpoint = '/tasks';
  static const String goalsEndpoint = '/goals';
  static const String financeEndpoint = '/finance';
  static const String challengesEndpoint = '/challenges';
  static const String infastAIEndpoint = '/infast-ai';
  static const String userEndpoint = '/user';
  
  // Timeouts
  static const int connectTimeout = 30000; // 30 seconds
  static const int receiveTimeout = 30000; // 30 seconds
  static const int sendTimeout = 30000; // 30 seconds
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // Cache Configuration
  static const int maxCacheSize = 100 * 1024 * 1024; // 100MB
  static const Duration cacheExpiration = Duration(hours: 24);
  
  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);
  
  // UI Constants
  static const double borderRadius = 12.0;
  static const double smallBorderRadius = 8.0;
  static const double largeBorderRadius = 16.0;
  
  // Spacing
  static const double spacingXS = 4.0;
  static const double spacingS = 8.0;
  static const double spacingM = 16.0;
  static const double spacingL = 24.0;
  static const double spacingXL = 32.0;
  static const double spacingXXL = 48.0;
  
  // Typography
  static const double fontSizeXS = 12.0;
  static const double fontSizeS = 14.0;
  static const double fontSizeM = 16.0;
  static const double fontSizeL = 18.0;
  static const double fontSizeXL = 20.0;
  static const double fontSizeXXL = 24.0;
  static const double fontSizeXXXL = 32.0;
  
  // Phone format for Uzbekistan
  static const String phonePattern = r'^\+998\d{9}$';
  static const String phoneHint = '+998 __ ___ __ __';
  
  // OTP Configuration
  static const int otpLength = 6;
  static const Duration otpResendDelay = Duration(seconds: 60);
  
  // Security
  static const int maxLoginAttempts = 5;
  static const Duration lockoutDuration = Duration(minutes: 15);
  
  // Features
  static const bool enableAnalytics = true;
  static const bool enableCrashlytics = true;
  static const bool enablePushNotifications = true;
  
  // Telegram Bot
  static const String telegramBotUsername = 'InFastAI_bot';
  
  // App Store URLs (for future)
  static const String appStoreUrl = 'https://apps.apple.com/app/infast-ai';
  static const String playStoreUrl = 'https://play.google.com/store/apps/details?id=com.infast.ai';
  
  // Support
  static const String supportEmail = 'support@infast.uz';
  static const String privacyPolicyUrl = 'https://infast.uz/privacy';
  static const String termsOfServiceUrl = 'https://infast.uz/terms';
}

class Environment {
  static const String development = 'development';
  static const String staging = 'staging';
  static const String production = 'production';
  
  static String get current {
    // This can be configured based on build flavors
    return development;
  }
  
  static bool get isDevelopment => current == development;
  static bool get isStaging => current == staging;
  static bool get isProduction => current == production;
}

import 'package:flutter/material.dart';

class AppColors {
  // Primary Brand Colors
  static const Color primary = Color(0xFF3B82F6); // Blue 500
  static const Color primaryLight = Color(0xFF60A5FA); // Blue 400
  static const Color primaryDark = Color(0xFF2563EB); // Blue 600
  static const Color primarySurface = Color(0xFFEFF6FF); // Blue 50
  
  // Secondary Brand Colors
  static const Color secondary = Color(0xFF8B5CF6); // Purple 500
  static const Color secondaryLight = Color(0xFFA78BFA); // Purple 400
  static const Color secondaryDark = Color(0xFF7C3AED); // Purple 600
  static const Color secondarySurface = Color(0xFFF5F3FF); // Purple 50
  
  // Status Colors
  static const Color success = Color(0xFF10B981); // Emerald 500
  static const Color successLight = Color(0xFF34D399); // Emerald 400
  static const Color successDark = Color(0xFF059669); // Emerald 600
  static const Color successSurface = Color(0xFFECFDF5); // Emerald 50
  
  static const Color warning = Color(0xFFF59E0B); // Amber 500
  static const Color warningLight = Color(0xFFFBBf24); // Amber 400
  static const Color warningDark = Color(0xFFD97706); // Amber 600
  static const Color warningSurface = Color(0xFFFEF3C7); // Amber 50
  
  static const Color error = Color(0xFFEF4444); // Red 500
  static const Color errorLight = Color(0xFFF87171); // Red 400
  static const Color errorDark = Color(0xFFDC2626); // Red 600
  static const Color errorSurface = Color(0xFFFEF2F2); // Red 50
  
  // Neutral Colors
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
  
  static const Color grey50 = Color(0xFFF9FAFB);
  static const Color grey100 = Color(0xFFF3F4F6);
  static const Color grey200 = Color(0xFFE5E7EB);
  static const Color grey300 = Color(0xFFD1D5DB);
  static const Color grey400 = Color(0xFF9CA3AF);
  static const Color grey500 = Color(0xFF6B7280);
  static const Color grey600 = Color(0xFF4B5563);
  static const Color grey700 = Color(0xFF374151);
  static const Color grey800 = Color(0xFF1F2937);
  static const Color grey900 = Color(0xFF111827);
  
  // Semantic Colors
  static const Color background = Color(0xFFFAFAFA);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF5F5F5);
  
  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color onSecondary = Color(0xFFFFFFFF);
  static const Color onSuccess = Color(0xFFFFFFFF);
  static const Color onWarning = Color(0xFFFFFFFF);
  static const Color onError = Color(0xFFFFFFFF);
  
  static const Color onBackground = Color(0xFF1F2937);
  static const Color onSurface = Color(0xFF1F2937);
  static const Color onSurfaceVariant = Color(0xFF6B7280);
  
  // Task Priority Colors
  static const Color priorityHigh = error;
  static const Color priorityMedium = warning;
  static const Color priorityLow = success;
  
  // Goal Status Colors
  static const Color goalActive = primary;
  static const Color goalCompleted = success;
  static const Color goalPaused = warning;
  static const Color goalCancelled = grey400;
  
  // Finance Colors
  static const Color income = success;
  static const Color expense = error;
  static const Color balance = primary;
  
  // Challenge Colors
  static const Color challengeGold = Color(0xFFFFD700);
  static const Color challengeSilver = Color(0xFFC0C0C0);
  static const Color challengeBronze = Color(0xFFCD7F32);
  
  // Gradient Colors
  static const List<Color> primaryGradient = [
    primary,
    primaryLight,
  ];
  
  static const List<Color> secondaryGradient = [
    secondary,
    secondaryLight,
  ];
  
  static const List<Color> successGradient = [
    success,
    successLight,
  ];
  
  static const List<Color> warningGradient = [
    warning,
    warningLight,
  ];
  
  static const List<Color> errorGradient = [
    error,
    errorLight,
  ];
  
  // Dark Theme Colors
  static const Color darkBackground = Color(0xFF0F172A);
  static const Color darkSurface = Color(0xFF1E293B);
  static const Color darkSurfaceVariant = Color(0xFF334155);
  
  static const Color darkOnBackground = Color(0xFFF8FAFC);
  static const Color darkOnSurface = Color(0xFFF8FAFC);
  static const Color darkOnSurfaceVariant = Color(0xFFCBD5E1);
  
  // Shadow Colors
  static const Color shadowLight = Color(0x1A000000);
  static const Color shadowMedium = Color(0x33000000);
  static const Color shadowDark = Color(0x4D000000);
}

extension ColorExtensions on Color {
  /// Get the opposite color (light/dark variant)
  Color get opposite {
    if (this == AppColors.primary) return AppColors.primaryDark;
    if (this == AppColors.primaryLight) return AppColors.primary;
    if (this == AppColors.secondary) return AppColors.secondaryDark;
    if (this == AppColors.secondaryLight) return AppColors.secondary;
    if (this == AppColors.success) return AppColors.successDark;
    if (this == AppColors.successLight) return AppColors.success;
    if (this == AppColors.warning) return AppColors.warningDark;
    if (this == AppColors.warningLight) return AppColors.warning;
    if (this == AppColors.error) return AppColors.errorDark;
    if (this == AppColors.errorLight) return AppColors.error;
    return this;
  }
  
  /// Get surface color for this color
  Color get surface {
    if (this == AppColors.primary) return AppColors.primarySurface;
    if (this == AppColors.secondary) return AppColors.secondarySurface;
    if (this == AppColors.success) return AppColors.successSurface;
    if (this == AppColors.warning) return AppColors.warningSurface;
    if (this == AppColors.error) return AppColors.errorSurface;
    return AppColors.surface;
  }
  
  /// Check if color is light
  bool get isLight {
    return computeLuminance() > 0.5;
  }
  
  /// Check if color is dark
  bool get isDark {
    return computeLuminance() <= 0.5;
  }
}

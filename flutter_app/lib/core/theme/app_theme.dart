import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants/app_colors.dart';
import '../config/app_config.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      
      // Color Scheme
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        primaryContainer: AppColors.primarySurface,
        secondary: AppColors.secondary,
        secondaryContainer: AppColors.secondarySurface,
        error: AppColors.error,
        errorContainer: AppColors.errorSurface,
        surface: AppColors.surface,
        background: AppColors.background,
        onPrimary: AppColors.onPrimary,
        onSecondary: AppColors.onSecondary,
        onError: AppColors.onError,
        onSurface: AppColors.onSurface,
        onBackground: AppColors.onBackground,
        outline: AppColors.grey300,
        outlineVariant: AppColors.grey200,
      ),
      
      // App Bar Theme
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.onSurface,
        elevation: 0,
        scrolledUnderElevation: 1,
        shadowColor: AppColors.shadowLight,
        surfaceTintColor: AppColors.primary,
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
          statusBarBrightness: Brightness.light,
        ),
        titleTextStyle: TextStyle(
          color: AppColors.onSurface,
          fontSize: AppConfig.fontSizeL,
          fontWeight: FontWeight.w600,
          fontFamily: 'Inter',
        ),
      ),
      
      // Card Theme
      cardTheme: CardTheme(
        color: AppColors.surface,
        elevation: 2,
        shadowColor: AppColors.shadowLight,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConfig.borderRadius),
        ),
        margin: EdgeInsets.zero,
      ),
      
      // Elevated Button Theme
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.onPrimary,
          elevation: 2,
          shadowColor: AppColors.shadowLight,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppConfig.borderRadius),
          ),
          padding: const EdgeInsets.symmetric(
            horizontal: AppConfig.spacingL,
            vertical: AppConfig.spacingM,
          ),
          textStyle: const TextStyle(
            fontSize: AppConfig.fontSizeM,
            fontWeight: FontWeight.w600,
            fontFamily: 'Inter',
          ),
        ),
      ),
      
      // Outlined Button Theme
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.primary, width: 1.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppConfig.borderRadius),
          ),
          padding: const EdgeInsets.symmetric(
            horizontal: AppConfig.spacingL,
            vertical: AppConfig.spacingM,
          ),
          textStyle: const TextStyle(
            fontSize: AppConfig.fontSizeM,
            fontWeight: FontWeight.w600,
            fontFamily: 'Inter',
          ),
        ),
      ),
      
      // Text Button Theme
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppConfig.borderRadius),
          ),
          padding: const EdgeInsets.symmetric(
            horizontal: AppConfig.spacingM,
            vertical: AppConfig.spacingS,
          ),
          textStyle: const TextStyle(
            fontSize: AppConfig.fontSizeM,
            fontWeight: FontWeight.w600,
            fontFamily: 'Inter',
          ),
        ),
      ),
      
      // Input Decoration Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceVariant,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConfig.borderRadius),
          borderSide: const BorderSide(color: AppColors.grey300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConfig.borderRadius),
          borderSide: const BorderSide(color: AppColors.grey300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConfig.borderRadius),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConfig.borderRadius),
          borderSide: const BorderSide(color: AppColors.error, width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConfig.borderRadius),
          borderSide: const BorderSide(color: AppColors.error, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppConfig.spacingM,
          vertical: AppConfig.spacingM,
        ),
        hintStyle: TextStyle(
          color: AppColors.grey500,
          fontSize: AppConfig.fontSizeM,
          fontFamily: 'Inter',
        ),
        labelStyle: TextStyle(
          color: AppColors.grey700,
          fontSize: AppConfig.fontSizeM,
          fontFamily: 'Inter',
        ),
        errorStyle: TextStyle(
          color: AppColors.error,
          fontSize: AppConfig.fontSizeS,
          fontFamily: 'Inter',
        ),
      ),
      
      // Bottom Navigation Bar Theme
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.surface,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.grey500,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
        selectedLabelStyle: TextStyle(
          fontSize: AppConfig.fontSizeXS,
          fontWeight: FontWeight.w600,
          fontFamily: 'Inter',
        ),
        unselectedLabelStyle: TextStyle(
          fontSize: AppConfig.fontSizeXS,
          fontWeight: FontWeight.w500,
          fontFamily: 'Inter',
        ),
      ),
      
      // Floating Action Button Theme
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.onPrimary,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
        ),
      ),
      
      // Chip Theme
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.grey100,
        selectedColor: AppColors.primarySurface,
        disabledColor: AppColors.grey200,
        labelStyle: const TextStyle(
          color: AppColors.onSurface,
          fontSize: AppConfig.fontSizeS,
          fontFamily: 'Inter',
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConfig.smallBorderRadius),
        ),
        side: const BorderSide(color: AppColors.grey300),
      ),
      
      // Progress Indicator Theme
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.primary,
        linearTrackColor: AppColors.grey200,
        circularTrackColor: AppColors.grey200,
      ),
      
      // Switch Theme
      switchTheme: SwitchThemeData(
        thumbColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return AppColors.primary;
          }
          return AppColors.grey400;
        }),
        trackColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return AppColors.primary.withOpacity(0.5);
          }
          return AppColors.grey300;
        }),
      ),
      
      // Checkbox Theme
      checkboxTheme: CheckboxThemeData(
        fillColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return AppColors.primary;
          }
          return Colors.transparent;
        }),
        checkColor: MaterialStateProperty.all(AppColors.onPrimary),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4),
        ),
      ),
      
      // Radio Theme
      radioTheme: RadioThemeData(
        fillColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return AppColors.primary;
          }
          return AppColors.grey400;
        }),
      ),
      
      // Text Theme
      textTheme: _buildTextTheme(Brightness.light),
      
      // Bottom Sheet Theme
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColors.surface,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(AppConfig.largeBorderRadius),
          ),
        ),
      ),
      
      // Dialog Theme
      dialogTheme: DialogTheme(
        backgroundColor: AppColors.surface,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConfig.borderRadius),
        ),
        titleTextStyle: const TextStyle(
          color: AppColors.onSurface,
          fontSize: AppConfig.fontSizeXL,
          fontWeight: FontWeight.w600,
          fontFamily: 'Inter',
        ),
        contentTextStyle: const TextStyle(
          color: AppColors.onSurface,
          fontSize: AppConfig.fontSizeM,
          fontFamily: 'Inter',
        ),
      ),
      
      // Divider Theme
      dividerTheme: const DividerThemeData(
        color: AppColors.grey200,
        thickness: 1,
        space: 1,
      ),
      
      // Splash Factory
      splashFactory: InkRipple.splashFactory,
      
      // Page Transitions
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: CupertinoPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
        },
      ),
    );
  }
  
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      
      // Color Scheme
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        primaryContainer: Color(0xFF1E3A8A),
        secondary: AppColors.secondary,
        secondaryContainer: Color(0xFF4C1D95),
        error: AppColors.error,
        errorContainer: Color(0xFF7F1D1D),
        surface: AppColors.darkSurface,
        background: AppColors.darkBackground,
        onPrimary: AppColors.onPrimary,
        onSecondary: AppColors.onSecondary,
        onError: AppColors.onError,
        onSurface: AppColors.darkOnSurface,
        onBackground: AppColors.darkOnBackground,
        outline: AppColors.grey600,
        outlineVariant: AppColors.grey700,
      ),
      
      // App Bar Theme
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.darkSurface,
        foregroundColor: AppColors.darkOnSurface,
        elevation: 0,
        scrolledUnderElevation: 1,
        shadowColor: Colors.black,
        surfaceTintColor: AppColors.primary,
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.light,
          statusBarBrightness: Brightness.dark,
        ),
        titleTextStyle: TextStyle(
          color: AppColors.darkOnSurface,
          fontSize: AppConfig.fontSizeL,
          fontWeight: FontWeight.w600,
          fontFamily: 'Inter',
        ),
      ),
      
      // Card Theme
      cardTheme: CardTheme(
        color: AppColors.darkSurface,
        elevation: 4,
        shadowColor: Colors.black,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConfig.borderRadius),
        ),
        margin: EdgeInsets.zero,
      ),
      
      // Text Theme
      textTheme: _buildTextTheme(Brightness.dark),
      
      // Input Decoration Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkSurfaceVariant,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConfig.borderRadius),
          borderSide: const BorderSide(color: AppColors.grey600),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConfig.borderRadius),
          borderSide: const BorderSide(color: AppColors.grey600),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConfig.borderRadius),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConfig.borderRadius),
          borderSide: const BorderSide(color: AppColors.error, width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConfig.borderRadius),
          borderSide: const BorderSide(color: AppColors.error, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppConfig.spacingM,
          vertical: AppConfig.spacingM,
        ),
        hintStyle: TextStyle(
          color: AppColors.grey500,
          fontSize: AppConfig.fontSizeM,
          fontFamily: 'Inter',
        ),
        labelStyle: TextStyle(
          color: AppColors.grey400,
          fontSize: AppConfig.fontSizeM,
          fontFamily: 'Inter',
        ),
        errorStyle: TextStyle(
          color: AppColors.error,
          fontSize: AppConfig.fontSizeS,
          fontFamily: 'Inter',
        ),
      ),
      
      // Bottom Navigation Bar Theme
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.darkSurface,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.grey400,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
        selectedLabelStyle: TextStyle(
          fontSize: AppConfig.fontSizeXS,
          fontWeight: FontWeight.w600,
          fontFamily: 'Inter',
        ),
        unselectedLabelStyle: TextStyle(
          fontSize: AppConfig.fontSizeXS,
          fontWeight: FontWeight.w500,
          fontFamily: 'Inter',
        ),
      ),
      
      // Bottom Sheet Theme
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColors.darkSurface,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(AppConfig.largeBorderRadius),
          ),
        ),
      ),
      
      // Dialog Theme
      dialogTheme: DialogTheme(
        backgroundColor: AppColors.darkSurface,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConfig.borderRadius),
        ),
        titleTextStyle: const TextStyle(
          color: AppColors.darkOnSurface,
          fontSize: AppConfig.fontSizeXL,
          fontWeight: FontWeight.w600,
          fontFamily: 'Inter',
        ),
        contentTextStyle: const TextStyle(
          color: AppColors.darkOnSurface,
          fontSize: AppConfig.fontSizeM,
          fontFamily: 'Inter',
        ),
      ),
      
      // Divider Theme
      dividerTheme: const DividerThemeData(
        color: AppColors.grey700,
        thickness: 1,
        space: 1,
      ),
    );
  }
  
  static TextTheme _buildTextTheme(Brightness brightness) {
    final Color textColor = brightness == Brightness.light 
        ? AppColors.onSurface 
        : AppColors.darkOnSurface;
    
    return TextTheme(
      displayLarge: TextStyle(
        color: textColor,
        fontSize: AppConfig.fontSizeXXXL,
        fontWeight: FontWeight.w700,
        fontFamily: 'Inter',
        height: 1.2,
      ),
      displayMedium: TextStyle(
        color: textColor,
        fontSize: AppConfig.fontSizeXXL,
        fontWeight: FontWeight.w600,
        fontFamily: 'Inter',
        height: 1.3,
      ),
      displaySmall: TextStyle(
        color: textColor,
        fontSize: AppConfig.fontSizeXL,
        fontWeight: FontWeight.w600,
        fontFamily: 'Inter',
        height: 1.3,
      ),
      headlineLarge: TextStyle(
        color: textColor,
        fontSize: AppConfig.fontSizeXL,
        fontWeight: FontWeight.w600,
        fontFamily: 'Inter',
        height: 1.3,
      ),
      headlineMedium: TextStyle(
        color: textColor,
        fontSize: AppConfig.fontSizeL,
        fontWeight: FontWeight.w600,
        fontFamily: 'Inter',
        height: 1.3,
      ),
      headlineSmall: TextStyle(
        color: textColor,
        fontSize: AppConfig.fontSizeM,
        fontWeight: FontWeight.w600,
        fontFamily: 'Inter',
        height: 1.3,
      ),
      titleLarge: TextStyle(
        color: textColor,
        fontSize: AppConfig.fontSizeM,
        fontWeight: FontWeight.w600,
        fontFamily: 'Inter',
        height: 1.4,
      ),
      titleMedium: TextStyle(
        color: textColor,
        fontSize: AppConfig.fontSizeM,
        fontWeight: FontWeight.w500,
        fontFamily: 'Inter',
        height: 1.4,
      ),
      titleSmall: TextStyle(
        color: textColor,
        fontSize: AppConfig.fontSizeS,
        fontWeight: FontWeight.w500,
        fontFamily: 'Inter',
        height: 1.4,
      ),
      bodyLarge: TextStyle(
        color: textColor,
        fontSize: AppConfig.fontSizeM,
        fontWeight: FontWeight.w400,
        fontFamily: 'Inter',
        height: 1.5,
      ),
      bodyMedium: TextStyle(
        color: textColor,
        fontSize: AppConfig.fontSizeS,
        fontWeight: FontWeight.w400,
        fontFamily: 'Inter',
        height: 1.5,
      ),
      bodySmall: TextStyle(
        color: textColor,
        fontSize: AppConfig.fontSizeXS,
        fontWeight: FontWeight.w400,
        fontFamily: 'Inter',
        height: 1.4,
      ),
      labelLarge: TextStyle(
        color: textColor,
        fontSize: AppConfig.fontSizeS,
        fontWeight: FontWeight.w600,
        fontFamily: 'Inter',
        height: 1.3,
      ),
      labelMedium: TextStyle(
        color: textColor,
        fontSize: AppConfig.fontSizeXS,
        fontWeight: FontWeight.w600,
        fontFamily: 'Inter',
        height: 1.3,
      ),
      labelSmall: TextStyle(
        color: textColor,
        fontSize: 10,
        fontWeight: FontWeight.w600,
        fontFamily: 'Inter',
        height: 1.3,
      ),
    );
  }
}

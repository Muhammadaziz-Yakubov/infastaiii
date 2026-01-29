import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:vibration/vibration.dart';
import '../config/app_config.dart';
import '../constants/app_colors.dart';

class Helpers {
  // Date formatting utilities
  static String formatDate(DateTime date, {String format = 'dd.MM.yyyy'}) {
    return DateFormat(format).format(date);
  }
  
  static String formatTime(DateTime time, {String format = 'HH:mm'}) {
    return DateFormat(format).format(time);
  }
  
  static String formatDateTime(DateTime dateTime, {String format = 'dd.MM.yyyy HH:mm'}) {
    return DateFormat(format).format(dateTime);
  }
  
  static String getRelativeTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inDays == 0) {
      if (difference.inHours == 0) {
        if (difference.inMinutes == 0) {
          return 'hozirgina';
        }
        return '${difference.inMinutes} daqiqa oldin';
      }
      return '${difference.inHours} soat oldin';
    } else if (difference.inDays == 1) {
      return 'kecha';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} kun oldin';
    } else if (difference.inDays < 30) {
      return '${(difference.inDays / 7).floor()} hafta oldin';
    } else if (difference.inDays < 365) {
      return '${(difference.inDays / 30).floor()} oy oldin';
    } else {
      return '${(difference.inDays / 365).floor()} yil oldin';
    }
  }
  
  // Haptic feedback
  static Future<void> hapticFeedback({HapticType type = HapticType.light}) async {
    try {
      bool hasVibrator = await Vibration.hasVibrator() ?? false;
      if (!hasVibrator) return;
      
      switch (type) {
        case HapticType.light:
          await Vibration.vibrate(duration: 50);
          break;
        case HapticType.medium:
          await Vibration.vibrate(duration: 100);
          break;
        case HapticType.heavy:
          await Vibration.vibrate(duration: 200);
          break;
        case HapticType.success:
          await Vibration.vibrate(pattern: [0, 100, 50, 100]);
          break;
        case HapticType.error:
          await Vibration.vibrate(pattern: [0, 200, 100, 200]);
          break;
        case HapticType.warning:
          await Vibration.vibrate(pattern: [0, 150]);
          break;
      }
    } catch (e) {
      // Ignore vibration errors
    }
  }
  
  // Show snackbar
  static void showSnackBar(
    BuildContext context, {
    required String message,
    Color? backgroundColor,
    Color? textColor,
    IconData? icon,
    Duration duration = const Duration(seconds: 3),
  }) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            if (icon != null) ...[
              Icon(icon, color: textColor ?? AppColors.white, size: 20),
              const SizedBox(width: AppConfig.spacingS),
            ],
            Expanded(
              child: Text(
                message,
                style: TextStyle(
                  color: textColor ?? AppColors.white,
                  fontSize: AppConfig.fontSizeS,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: backgroundColor ?? AppColors.grey800,
        duration: duration,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConfig.borderRadius),
        ),
        margin: const EdgeInsets.all(AppConfig.spacingM),
      ),
    );
  }
  
  // Show success snackbar
  static void showSuccessSnackBar(BuildContext context, String message) {
    showSnackBar(
      context,
      message: message,
      backgroundColor: AppColors.success,
      icon: Icons.check_circle,
    );
  }
  
  // Show error snackbar
  static void showErrorSnackBar(BuildContext context, String message) {
    showSnackBar(
      context,
      message: message,
      backgroundColor: AppColors.error,
      icon: Icons.error,
    );
  }
  
  // Show warning snackbar
  static void showWarningSnackBar(BuildContext context, String message) {
    showSnackBar(
      context,
      message: message,
      backgroundColor: AppColors.warning,
      icon: Icons.warning,
    );
  }
  
  // Show loading dialog
  static void showLoadingDialog(BuildContext context, {String message = 'Yuklanmoqda...'}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        content: Row(
          children: [
            const CircularProgressIndicator(),
            const SizedBox(width: AppConfig.spacingM),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(fontSize: AppConfig.fontSizeM),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  // Hide loading dialog
  static void hideLoadingDialog(BuildContext context) {
    Navigator.of(context, pop: true);
  }
  
  // Show confirmation dialog
  static Future<bool> showConfirmationDialog(
    BuildContext context, {
    required String title,
    required String message,
    String confirmText = 'Ha',
    String cancelText = 'Yo\'q',
    Color confirmColor = AppColors.primary,
  }) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(cancelText),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: confirmColor),
            child: Text(confirmText),
          ),
        ],
      ),
    );
    return result ?? false;
  }
  
  // Copy to clipboard
  static void copyToClipboard(BuildContext context, String text) {
    Clipboard.setData(ClipboardData(text: text));
    showSuccessSnackBar(context, 'Nusxalandi');
  }
  
  // Capitalize first letter
  static String capitalize(String text) {
    if (text.isEmpty) return text;
    return text[0].toUpperCase() + text.substring(1).toLowerCase();
  }
  
  // Get initials from name
  static String getInitials(String name, {int maxLetters = 2}) {
    final parts = name.trim().split(' ');
    String initials = '';
    
    for (int i = 0; i < parts.length && initials.length < maxLetters; i++) {
      if (parts[i].isNotEmpty) {
        initials += parts[i][0].toUpperCase();
      }
    }
    
    return initials;
  }
  
  // Generate random color
  static Color getRandomColor() {
    final colors = [
      AppColors.primary,
      AppColors.secondary,
      AppColors.success,
      AppColors.warning,
      AppColors.error,
    ];
    return colors[(DateTime.now().millisecondsSinceEpoch) % colors.length];
  }
  
  // Check if email is valid
  static bool isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }
  
  // Check if phone is valid
  static bool isValidPhone(String phone) {
    return RegExp(AppConfig.phonePattern).hasMatch(phone);
  }
  
  // Format duration
  static String formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    
    if (duration.inHours > 0) {
      return '${twoDigits(duration.inHours)}:${twoDigits(duration.inMinutes.remainder(60))}:${twoDigits(duration.inSeconds.remainder(60))}';
    } else {
      return '${twoDigits(duration.inMinutes)}:${twoDigits(duration.inSeconds.remainder(60))}';
    }
  }
  
  // Calculate percentage
  static double calculatePercentage(double value, double total) {
    if (total == 0) return 0;
    return (value / total) * 100;
  }
  
  // Truncate text
  static String truncateText(String text, int maxLength) {
    if (text.length <= maxLength) return text;
    return '${text.substring(0, maxLength)}...';
  }
  
  // Debounce utility
  static VoidCallback debounce(VoidCallback callback, Duration delay) {
    Timer? timer;
    return () {
      timer?.cancel();
      timer = Timer(delay, callback);
    };
  }
  
  // Throttle utility
  static VoidCallback throttle(VoidCallback callback, Duration delay) {
    bool isThrottled = false;
    return () {
      if (isThrottled) return;
      isThrottled = true;
      callback();
      Future.delayed(delay, () => isThrottled = false);
    };
  }
}

enum HapticType {
  light,
  medium,
  heavy,
  success,
  error,
  warning,
}

// Extension for Color to get contrast color
extension ColorExtension on Color {
  Color getContrastColor() {
    final luminance = computeLuminance();
    return luminance > 0.5 ? AppColors.black : AppColors.white;
  }
}

// Extension for DateTime to check if it's today
extension DateTimeExtension on DateTime {
  bool get isToday {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }
  
  bool get isYesterday {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return year == yesterday.year && month == yesterday.month && day == yesterday.day;
  }
  
  bool get isTomorrow {
    final tomorrow = DateTime.now().add(const Duration(days: 1));
    return year == tomorrow.year && month == tomorrow.month && day == tomorrow.day;
  }
  
  DateTime get startOfDay {
    return DateTime(year, month, day);
  }
  
  DateTime get endOfDay {
    return DateTime(year, month, day, 23, 59, 59, 999);
  }
  
  DateTime get startOfWeek {
    final start = startOfDay;
    return start.subtract(Duration(days: start.weekday - 1));
  }
  
  DateTime get endOfWeek {
    final end = endOfDay;
    return end.add(Duration(days: 7 - end.weekday));
  }
  
  DateTime get startOfMonth {
    return DateTime(year, month, 1);
  }
  
  DateTime get endOfMonth {
    return DateTime(year, month + 1, 0, 23, 59, 59, 999);
  }
}

// Extension for String to capitalize sentences
extension StringExtension on String {
  String capitalizeSentences() {
    return split('. ').map((sentence) {
      if (sentence.trim().isEmpty) return sentence;
      return sentence.trim()[0].toUpperCase() + sentence.trim().substring(1);
    }).join('. ');
  }
  
  String get initials {
    return split(' ').map((word) => word.isNotEmpty ? word[0].toUpperCase() : '').take(2).join();
  }
}

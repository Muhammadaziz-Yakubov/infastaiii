import 'package:flutter/material.dart';
import '../config/app_config.dart';

class Validators {
  // Phone validation for Uzbekistan format
  static String? validatePhone(String? value) {
    if (value == null || value.isEmpty) {
      return 'Telefon raqam kiritilishi shart';
    }
    
    // Remove all non-digit characters except +
    String cleanPhone = value.replaceAll(RegExp(r'[^\d+]'), '');
    
    // Check if it matches Uzbekistan format
    if (!RegExp(AppConfig.phonePattern).hasMatch(cleanPhone)) {
      return 'Telefon raqam +998 bilan boshlanishi va 12 ta belgidan iborat bo\'lishi kerak';
    }
    
    return null;
  }
  
  // Email validation
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email kiritilishi shart';
    }
    
    // Basic email regex
    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
      return 'To\'g\'ri email formatini kiriting';
    }
    
    return null;
  }
  
  // Password validation
  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Parol kiritilishi shart';
    }
    
    if (value.length < 6) {
      return 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak';
    }
    
    // You can add more complex password requirements here
    // if (!RegExp(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)').hasMatch(value)) {
    //   return 'Parol kamida bitta katta harf, kichik harf va raqamdan iborat bo\'lishi kerak';
    // }
    
    return null;
  }
  
  // OTP validation
  static String? validateOTP(String? value) {
    if (value == null || value.isEmpty) {
      return 'Kod kiritilishi shart';
    }
    
    if (value.length != AppConfig.otpLength) {
      return 'Kod ${AppConfig.otpLength} ta raqamdan iborat bo\'lishi kerak';
    }
    
    if (!RegExp(r'^\d+$').hasMatch(value)) {
      return 'Faqat raqamlardan foydalaning';
    }
    
    return null;
  }
  
  // Name validation
  static String? validateName(String? value, {String fieldName = 'Ism'}) {
    if (value == null || value.isEmpty) {
      return '$fieldName kiritilishi shart';
    }
    
    if (value.length < 2) {
      return '$fieldName kamida 2 ta belgidan iborat bo\'lishi kerak';
    }
    
    if (value.length > 50) {
      return '$fieldName 50 ta belgidan oshmasligi kerak';
    }
    
    // Allow only letters, spaces, and some special characters for Uzbek names
    if (!RegExp(r'^[a-zA-Zа-яА-ЯёЁқғҳқӯʼ\'`\- ]+$').hasMatch(value)) {
      return '$fieldName faqat harflardan iborat bo\'lishi kerak';
    }
    
    return null;
  }
  
  // Required field validation
  static String? validateRequired(String? value, {String fieldName = 'Maydon'}) {
    if (value == null || value.isEmpty) {
      return '$fieldName to\'ldirilishi shart';
    }
    return null;
  }
  
  // Amount validation (for finance)
  static String? validateAmount(String? value) {
    if (value == null || value.isEmpty) {
      return 'Summa kiritilishi shart';
    }
    
    // Remove commas and spaces
    String cleanAmount = value.replaceAll(RegExp(r'[,\s]'), '');
    
    if (!RegExp(r'^\d+(\.\d{1,2})?$').hasMatch(cleanAmount)) {
      return 'To\'g\'ri summa formatini kiriting';
    }
    
    double amount = double.tryParse(cleanAmount) ?? 0;
    if (amount <= 0) {
      return 'Summa 0 dan katta bo\'lishi kerak';
    }
    
    if (amount > 999999999) {
      return 'Summa juda katta';
    }
    
    return null;
  }
  
  // Date validation
  static String? validateDate(DateTime? value) {
    if (value == null) {
      return 'Sana tanlanishi shart';
    }
    
    if (value.isBefore(DateTime(1900))) {
      return 'Sana noto\'g\'ri';
    }
    
    if (value.isAfter(DateTime.now().add(const Duration(days: 365 * 100)))) {
      return 'Sana juda uzoq kelajakda';
    }
    
    return null;
  }
  
  // Goal target amount validation
  static String? validateGoalTarget(String? value) {
    if (value == null || value.isEmpty) {
      return 'Maqsad summasi kiritilishi shart';
    }
    
    String cleanAmount = value.replaceAll(RegExp(r'[,\s]'), '');
    
    if (!RegExp(r'^\d+$').hasMatch(cleanAmount)) {
      return 'Faqat butun son kiriting';
    }
    
    int amount = int.tryParse(cleanAmount) ?? 0;
    if (amount <= 0) {
      return 'Maqsad summasi 0 dan katta bo\'lishi kerak';
    }
    
    if (amount < 1000) {
      return 'Maqsad summasi kamida 1000 so\'m bo\'lishi kerak';
    }
    
    return null;
  }
  
  // Task title validation
  static String? validateTaskTitle(String? value) {
    if (value == null || value.isEmpty) {
      return 'Vazifa sarlavhasi kiritilishi shart';
    }
    
    if (value.length < 3) {
      return 'Sarlavha kamida 3 ta belgidan iborat bo\'lishi kerak';
    }
    
    if (value.length > 100) {
      return 'Sarlavha 100 ta belgidan oshmasligi kerak';
    }
    
    return null;
  }
  
  // Task description validation
  static String? validateTaskDescription(String? value) {
    if (value != null && value.length > 500) {
      return 'Tavsif 500 ta belgidan oshmasligi kerak';
    }
    return null;
  }
  
  // Challenge name validation
  static String? validateChallengeName(String? value) {
    if (value == null || value.isEmpty) {
      return 'Challenj nomi kiritilishi shart';
    }
    
    if (value.length < 3) {
      return 'Nom kamida 3 ta belgidan iborat bo\'lishi kerak';
    }
    
    if (value.length > 50) {
      return 'Nom 50 ta belgidan oshmasligi kerak';
    }
    
    return null;
  }
  
  // Invite code validation
  static String? validateInviteCode(String? value) {
    if (value == null || value.isEmpty) {
      return 'Taklif kodi kiritilishi shart';
    }
    
    if (value.length != 6) {
      return 'Taklif kodi 6 ta belgidan iborat bo\'lishi kerak';
    }
    
    if (!RegExp(r'^[A-Z0-9]+$').hasMatch(value)) {
      return 'Kod faqat harflar va raqamlardan iborat bo\'lishi kerak';
    }
    
    return null;
  }
}

// Extension for formatting phone numbers
extension PhoneFormatter on String {
  String formatPhoneNumber() {
    // Remove all non-digit characters
    String clean = replaceAll(RegExp(r'[^\d]'), '');
    
    // Check if it's a valid Uzbekistan number
    if (clean.length == 12 && clean.startsWith('998')) {
      return '+$clean';
    }
    
    // If it's 9 digits (without 998), add it
    if (clean.length == 9) {
      return '+998$clean';
    }
    
    // Return as is if format is unexpected
    return this;
  }
  
  String formatDisplayPhone() {
    String formatted = formatPhoneNumber();
    if (formatted.length == 13) {
      return '+998 (${formatted.substring(4, 6)}) ${formatted.substring(6, 9)} ${formatted.substring(9, 11)} ${formatted.substring(11)}';
    }
    return formatted;
  }
}

// Extension for formatting amounts
extension AmountFormatter on double {
  String formatCurrency({String symbol = 'so\'m'}) {
    return '${toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]} ')} $symbol';
  }
}

extension StringAmountFormatter on String {
  String formatCurrency({String symbol = 'so\'m'}) {
    double? amount = double.tryParse(replaceAll(RegExp(r'[^\d.]'), ''));
    if (amount == null) return this;
    return amount.formatCurrency(symbol: symbol);
  }
}

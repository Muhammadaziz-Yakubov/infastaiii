import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class User {
  final String id;
  final String firstName;
  final String lastName;
  final String? email;
  final String? phone;
  final String? avatar;
  final DateTime? birthday;
  final bool isEmailVerified;
  final bool isPhoneVerified;
  final String? telegramChatId;
  final String? telegramUsername;
  final String? telegramFirstName;
  final DateTime? telegramLinkedAt;
  final TelegramNotifications? telegramNotifications;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  const User({
    required this.id,
    required this.firstName,
    required this.lastName,
    this.email,
    this.phone,
    this.avatar,
    this.birthday,
    this.isEmailVerified = false,
    this.isPhoneVerified = false,
    this.telegramChatId,
    this.telegramUsername,
    this.telegramFirstName,
    this.telegramLinkedAt,
    this.telegramNotifications,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
  
  // Getters
  String get fullName => '$firstName $lastName';
  String get initials => '${firstName[0]}${lastName[0]}'.toUpperCase();
  bool get isTelegramLinked => telegramChatId != null;
  
  // Copy with
  User copyWith({
    String? id,
    String? firstName,
    String? lastName,
    String? email,
    String? phone,
    String? avatar,
    DateTime? birthday,
    bool? isEmailVerified,
    bool? isPhoneVerified,
    String? telegramChatId,
    String? telegramUsername,
    String? telegramFirstName,
    DateTime? telegramLinkedAt,
    TelegramNotifications? telegramNotifications,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      avatar: avatar ?? this.avatar,
      birthday: birthday ?? this.birthday,
      isEmailVerified: isEmailVerified ?? this.isEmailVerified,
      isPhoneVerified: isPhoneVerified ?? this.isPhoneVerified,
      telegramChatId: telegramChatId ?? this.telegramChatId,
      telegramUsername: telegramUsername ?? this.telegramUsername,
      telegramFirstName: telegramFirstName ?? this.telegramFirstName,
      telegramLinkedAt: telegramLinkedAt ?? this.telegramLinkedAt,
      telegramNotifications: telegramNotifications ?? this.telegramNotifications,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
  
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is User && runtimeType == other.runtimeType && id == other.id;
  
  @override
  int get hashCode => id.hashCode;
  
  @override
  String toString() {
    return 'User{id: $id, firstName: $firstName, lastName: $lastName, email: $email, phone: $phone}';
  }
}

@JsonSerializable()
class TelegramNotifications {
  final bool enabled;
  final bool debts;
  final bool tasks;
  final bool goals;
  final bool dailyReport;
  
  const TelegramNotifications({
    this.enabled = true,
    this.debts = true,
    this.tasks = true,
    this.goals = true,
    this.dailyReport = false,
  });
  
  factory TelegramNotifications.fromJson(Map<String, dynamic> json) =>
      _$TelegramNotificationsFromJson(json);
  Map<String, dynamic> toJson() => _$TelegramNotificationsToJson(this);
  
  TelegramNotifications copyWith({
    bool? enabled,
    bool? debts,
    bool? tasks,
    bool? goals,
    bool? dailyReport,
  }) {
    return TelegramNotifications(
      enabled: enabled ?? this.enabled,
      debts: debts ?? this.debts,
      tasks: tasks ?? this.tasks,
      goals: goals ?? this.goals,
      dailyReport: dailyReport ?? this.dailyReport,
    );
  }
}

// User registration request model
@JsonSerializable()
class UserRegistrationRequest {
  final String firstName;
  final String lastName;
  final String? email;
  final String? phone;
  final String password;
  final DateTime? birthday;
  final String? avatar;
  
  const UserRegistrationRequest({
    required this.firstName,
    required this.lastName,
    required this.password,
    this.email,
    this.phone,
    this.birthday,
    this.avatar,
  });
  
  factory UserRegistrationRequest.fromJson(Map<String, dynamic> json) =>
      _$UserRegistrationRequestFromJson(json);
  Map<String, dynamic> toJson() => _$UserRegistrationRequestToJson(this);
}

// User login request model
@JsonSerializable()
class UserLoginRequest {
  final String? email;
  final String? phone;
  final String password;
  
  const UserLoginRequest({
    this.email,
    this.phone,
    required this.password,
  });
  
  factory UserLoginRequest.fromJson(Map<String, dynamic> json) =>
      _$UserLoginRequestFromJson(json);
  Map<String, dynamic> toJson() => _$UserLoginRequestToJson(this);
}

// User update request model
@JsonSerializable()
class UserUpdateRequest {
  final String? firstName;
  final String? lastName;
  final String? email;
  final String? phone;
  final DateTime? birthday;
  final String? avatar;
  
  const UserUpdateRequest({
    this.firstName,
    this.lastName,
    this.email,
    this.phone,
    this.birthday,
    this.avatar,
  });
  
  factory UserUpdateRequest.fromJson(Map<String, dynamic> json) =>
      _$UserUpdateRequestFromJson(json);
  Map<String, dynamic> toJson() => _$UserUpdateRequestToJson(this);
}

// Auth response model
@JsonSerializable()
class AuthResponse {
  final User user;
  final String token;
  final String refreshToken;
  
  const AuthResponse({
    required this.user,
    required this.token,
    required this.refreshToken,
  });
  
  factory AuthResponse.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseFromJson(json);
  Map<String, dynamic> toJson() => _$AuthResponseToJson(this);
}

// Phone check response model
@JsonSerializable()
class PhoneCheckResponse {
  final bool exists;
  final bool isEmailUser;
  final bool isPhoneUser;
  final String? maskedEmail;
  final String? maskedPhone;
  
  const PhoneCheckResponse({
    required this.exists,
    this.isEmailUser = false,
    this.isPhoneUser = false,
    this.maskedEmail,
    this.maskedPhone,
  });
  
  factory PhoneCheckResponse.fromJson(Map<String, dynamic> json) =>
      _$PhoneCheckResponseFromJson(json);
  Map<String, dynamic> toJson() => _$PhoneCheckResponseToJson(this);
}

// OTP verification request model
@JsonSerializable()
class OTPVerificationRequest {
  final String phone;
  final String otp;
  
  const OTPVerificationRequest({
    required this.phone,
    required this.otp,
  });
  
  factory OTPVerificationRequest.fromJson(Map<String, dynamic> json) =>
      _$OTPVerificationRequestFromJson(json);
  Map<String, dynamic> toJson() => _$OTPVerificationRequestToJson(this);
}

// Password creation request model
@JsonSerializable()
class PasswordCreationRequest {
  final String phone;
  final String password;
  final String firstName;
  final String lastName;
  final DateTime? birthday;
  final String? avatar;
  
  const PasswordCreationRequest({
    required this.phone,
    required this.password,
    required this.firstName,
    required this.lastName,
    this.birthday,
    this.avatar,
  });
  
  factory PasswordCreationRequest.fromJson(Map<String, dynamic> json) =>
      _$PasswordCreationRequestFromJson(json);
  Map<String, dynamic> toJson() => _$PasswordCreationRequestToJson(this);
}

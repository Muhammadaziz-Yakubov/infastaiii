import '../../data/models/user_model.dart';

class UserEntity {
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
  final TelegramNotificationsEntity? telegramNotifications;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  const UserEntity({
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
  
  // Convert from model
  factory UserEntity.fromModel(User model) {
    return UserEntity(
      id: model.id,
      firstName: model.firstName,
      lastName: model.lastName,
      email: model.email,
      phone: model.phone,
      avatar: model.avatar,
      birthday: model.birthday,
      isEmailVerified: model.isEmailVerified,
      isPhoneVerified: model.isPhoneVerified,
      telegramChatId: model.telegramChatId,
      telegramUsername: model.telegramUsername,
      telegramFirstName: model.telegramFirstName,
      telegramLinkedAt: model.telegramLinkedAt,
      telegramNotifications: model.telegramNotifications != null
          ? TelegramNotificationsEntity.fromModel(model.telegramNotifications!)
          : null,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    );
  }
  
  // Getters
  String get fullName => '$firstName $lastName';
  String get initials => '${firstName[0]}${lastName[0]}'.toUpperCase();
  bool get isTelegramLinked => telegramChatId != null;
  
  // Copy with
  UserEntity copyWith({
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
    TelegramNotificationsEntity? telegramNotifications,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserEntity(
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
      other is UserEntity && runtimeType == other.runtimeType && id == other.id;
  
  @override
  int get hashCode => id.hashCode;
  
  @override
  String toString() {
    return 'UserEntity{id: $id, firstName: $firstName, lastName: $lastName, email: $email, phone: $phone}';
  }
}

class TelegramNotificationsEntity {
  final bool enabled;
  final bool debts;
  final bool tasks;
  final bool goals;
  final bool dailyReport;
  
  const TelegramNotificationsEntity({
    this.enabled = true,
    this.debts = true,
    this.tasks = true,
    this.goals = true,
    this.dailyReport = false,
  });
  
  // Convert from model
  factory TelegramNotificationsEntity.fromModel(TelegramNotifications model) {
    return TelegramNotificationsEntity(
      enabled: model.enabled,
      debts: model.debts,
      tasks: model.tasks,
      goals: model.goals,
      dailyReport: model.dailyReport,
    );
  }
  
  // Copy with
  TelegramNotificationsEntity copyWith({
    bool? enabled,
    bool? debts,
    bool? tasks,
    bool? goals,
    bool? dailyReport,
  }) {
    return TelegramNotificationsEntity(
      enabled: enabled ?? this.enabled,
      debts: debts ?? this.debts,
      tasks: tasks ?? this.tasks,
      goals: goals ?? this.goals,
      dailyReport: dailyReport ?? this.dailyReport,
    );
  }
  
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TelegramNotificationsEntity &&
          runtimeType == other.runtimeType &&
          enabled == other.enabled &&
          debts == other.debts &&
          tasks == other.tasks &&
          goals == other.goals &&
          dailyReport == other.dailyReport;
  
  @override
  int get hashCode {
    return enabled.hashCode ^
        debts.hashCode ^
        tasks.hashCode ^
        goals.hashCode ^
        dailyReport.hashCode;
  }
}

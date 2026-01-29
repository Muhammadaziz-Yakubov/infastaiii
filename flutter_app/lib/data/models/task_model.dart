import 'package:json_annotation/json_annotation.dart';

part 'task_model.g.dart';

@JsonSerializable()
class Task {
  final String id;
  final String title;
  final String? description;
  final String? categoryId;
  final TaskPriority priority;
  final TaskStatus status;
  final DateTime? deadline;
  final List<String> tags;
  final bool isPomodoroEnabled;
  final int? pomodoroSessions;
  final int? completedPomodoroSessions;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? completedAt;
  final Category? category;
  
  const Task({
    required this.id,
    required this.title,
    this.description,
    this.categoryId,
    this.priority = TaskPriority.medium,
    this.status = TaskStatus.pending,
    this.deadline,
    this.tags = const [],
    this.isPomodoroEnabled = false,
    this.pomodoroSessions,
    this.completedPomodoroSessions,
    required this.createdAt,
    required this.updatedAt,
    this.completedAt,
    this.category,
  });
  
  factory Task.fromJson(Map<String, dynamic> json) => _$TaskFromJson(json);
  Map<String, dynamic> toJson() => _$TaskToJson(this);
  
  // Getters
  bool get isCompleted => status == TaskStatus.completed;
  bool get isOverdue => deadline != null && deadline!.isBefore(DateTime.now()) && !isCompleted;
  bool get isDueToday => deadline != null && deadline!.isToday;
  bool get isDueTomorrow => deadline != null && deadline!.isTomorrow;
  int get pomodoroProgress => completedPomodoroSessions != null && pomodoroSessions != null
      ? ((completedPomodoroSessions! / pomodoroSessions!) * 100).round()
      : 0;
  
  // Copy with
  Task copyWith({
    String? id,
    String? title,
    String? description,
    String? categoryId,
    TaskPriority? priority,
    TaskStatus? status,
    DateTime? deadline,
    List<String>? tags,
    bool? isPomodoroEnabled,
    int? pomodoroSessions,
    int? completedPomodoroSessions,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? completedAt,
    Category? category,
  }) {
    return Task(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      categoryId: categoryId ?? this.categoryId,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      deadline: deadline ?? this.deadline,
      tags: tags ?? this.tags,
      isPomodoroEnabled: isPomodoroEnabled ?? this.isPomodoroEnabled,
      pomodoroSessions: pomodoroSessions ?? this.pomodoroSessions,
      completedPomodoroSessions: completedPomodoroSessions ?? this.completedPomodoroSessions,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      completedAt: completedAt ?? this.completedAt,
      category: category ?? this.category,
    );
  }
  
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Task && runtimeType == other.runtimeType && id == other.id;
  
  @override
  int get hashCode => id.hashCode;
  
  @override
  String toString() {
    return 'Task{id: $id, title: $title, status: $status, priority: $priority}';
  }
}

@JsonEnum()
enum TaskPriority {
  @JsonValue('low')
  low,
  @JsonValue('medium')
  medium,
  @JsonValue('high')
  high,
}

@JsonEnum()
enum TaskStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('in_progress')
  inProgress,
  @JsonValue('completed')
  completed,
  @JsonValue('cancelled')
  cancelled,
}

@JsonSerializable()
class Category {
  final String id;
  final String name;
  final String? icon;
  final String? color;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  const Category({
    required this.id,
    required this.name,
    this.icon,
    this.color,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory Category.fromJson(Map<String, dynamic> json) => _$CategoryFromJson(json);
  Map<String, dynamic> toJson() => _$CategoryToJson(this);
  
  Category copyWith({
    String? id,
    String? name,
    String? icon,
    String? color,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Category(
      id: id ?? this.id,
      name: name ?? this.name,
      icon: icon ?? this.icon,
      color: color ?? this.color,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
  
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Category && runtimeType == other.runtimeType && id == other.id;
  
  @override
  int get hashCode => id.hashCode;
}

// Task creation request model
@JsonSerializable()
class TaskCreateRequest {
  final String title;
  final String? description;
  final String? categoryId;
  final TaskPriority priority;
  final DateTime? deadline;
  final List<String> tags;
  final bool isPomodoroEnabled;
  final int? pomodoroSessions;
  
  const TaskCreateRequest({
    required this.title,
    this.description,
    this.categoryId,
    this.priority = TaskPriority.medium,
    this.deadline,
    this.tags = const [],
    this.isPomodoroEnabled = false,
    this.pomodoroSessions,
  });
  
  factory TaskCreateRequest.fromJson(Map<String, dynamic> json) =>
      _$TaskCreateRequestFromJson(json);
  Map<String, dynamic> toJson() => _$TaskCreateRequestToJson(this);
}

// Task update request model
@JsonSerializable()
class TaskUpdateRequest {
  final String? title;
  final String? description;
  final String? categoryId;
  final TaskPriority? priority;
  final TaskStatus? status;
  final DateTime? deadline;
  final List<String>? tags;
  final bool? isPomodoroEnabled;
  final int? pomodoroSessions;
  final int? completedPomodoroSessions;
  
  const TaskUpdateRequest({
    this.title,
    this.description,
    this.categoryId,
    this.priority,
    this.status,
    this.deadline,
    this.tags,
    this.isPomodoroEnabled,
    this.pomodoroSessions,
    this.completedPomodoroSessions,
  });
  
  factory TaskUpdateRequest.fromJson(Map<String, dynamic> json) =>
      _$TaskUpdateRequestFromJson(json);
  Map<String, dynamic> toJson() => _$TaskUpdateRequestToJson(this);
}

// Task search request model
@JsonSerializable()
class TaskSearchRequest {
  final String? query;
  final String? categoryId;
  final TaskPriority? priority;
  final TaskStatus? status;
  final DateTime? startDate;
  final DateTime? endDate;
  final List<String>? tags;
  final bool? isOverdue;
  final int page;
  final int limit;
  
  const TaskSearchRequest({
    this.query,
    this.categoryId,
    this.priority,
    this.status,
    this.startDate,
    this.endDate,
    this.tags,
    this.isOverdue,
    this.page = 1,
    this.limit = 20,
  });
  
  factory TaskSearchRequest.fromJson(Map<String, dynamic> json) =>
      _$TaskSearchRequestFromJson(json);
  Map<String, dynamic> toJson() => _$TaskSearchRequestToJson(this);
}

// Task statistics model
@JsonSerializable()
class TaskStatistics {
  final int total;
  final int completed;
  final int pending;
  final int inProgress;
  final int overdue;
  final int todayTasks;
  final int thisWeekTasks;
  final int thisMonthTasks;
  final double completionRate;
  final Map<TaskPriority, int> priorityBreakdown;
  final Map<String, int> categoryBreakdown;
  
  const TaskStatistics({
    required this.total,
    required this.completed,
    required this.pending,
    required this.inProgress,
    required this.overdue,
    required this.todayTasks,
    required this.thisWeekTasks,
    required this.thisMonthTasks,
    required this.completionRate,
    required this.priorityBreakdown,
    required this.categoryBreakdown,
  });
  
  factory TaskStatistics.fromJson(Map<String, dynamic> json) =>
      _$TaskStatisticsFromJson(json);
  Map<String, dynamic> toJson() => _$TaskStatisticsToJson(this);
}

// Pomodoro session model
@JsonSerializable()
class PomodoroSession {
  final String id;
  final String taskId;
  final int duration; // in minutes
  final DateTime startTime;
  final DateTime? endTime;
  final bool isCompleted;
  final DateTime createdAt;
  
  const PomodoroSession({
    required this.id,
    required this.taskId,
    required this.duration,
    required this.startTime,
    this.endTime,
    this.isCompleted = false,
    required this.createdAt,
  });
  
  factory PomodoroSession.fromJson(Map<String, dynamic> json) =>
      _$PomodoroSessionFromJson(json);
  Map<String, dynamic> toJson() => _$PomodoroSessionToJson(this);
  
  Duration get elapsed => endTime != null 
      ? endTime!.difference(startTime)
      : DateTime.now().difference(startTime);
  
  bool get isRunning => endTime == null && !isCompleted;
  
  PomodoroSession copyWith({
    String? id,
    String? taskId,
    int? duration,
    DateTime? startTime,
    DateTime? endTime,
    bool? isCompleted,
    DateTime? createdAt,
  }) {
    return PomodoroSession(
      id: id ?? this.id,
      taskId: taskId ?? this.taskId,
      duration: duration ?? this.duration,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      isCompleted: isCompleted ?? this.isCompleted,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

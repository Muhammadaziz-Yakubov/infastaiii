import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/config/app_config.dart';
import '../common/custom_card.dart';

class RecentTasksList extends StatelessWidget {
  final Function(String)? onTaskTap;
  final List<TaskItem>? tasks;

  const RecentTasksList({
    super.key,
    this.onTaskTap,
    this.tasks,
  });

  @override
  Widget build(BuildContext context) {
    final taskList = tasks ?? _getMockTasks();

    return Column(
      children: taskList.map((task) => Padding(
        padding: EdgeInsets.only(bottom: AppConfig.spacingM.h),
        child: TaskItemCard(
          task: task,
          onTap: () => onTaskTap?.call(task.id),
        ),
      )).toList(),
    );
  }

  List<TaskItem> _getMockTasks() {
    return [
      TaskItem(
        id: '1',
        title: 'InFast AI mobil ilovasini ishga tushirish',
        description: 'Flutter ilovasini backend bilan integratsiya qilish',
        priority: TaskPriority.high,
        status: TaskStatus.inProgress,
        deadline: DateTime.now().add(const Duration(hours: 3)),
        category: 'Ish',
      ),
      TaskItem(
        id: '2',
        title: 'Kunlik rejalarni tekshirish',
        description: 'Bugungi vazifalarning bajarilishini nazorat qilish',
        priority: TaskPriority.medium,
        status: TaskStatus.completed,
        category: 'Shaxsiy',
      ),
      TaskItem(
        id: '3',
        title: 'Moliyaviy hisobot tayyorlash',
        description: 'Oylik xarajatlar va daromadlar jadvalini tuzish',
        priority: TaskPriority.low,
        status: TaskStatus.pending,
        deadline: DateTime.now().add(const Duration(days: 1)),
        category: 'Moliya',
      ),
    ];
  }
}

class TaskItemCard extends StatelessWidget {
  final TaskItem task;
  final VoidCallback? onTap;

  const TaskItemCard({
    super.key,
    required this.task,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return CustomCard(
      onTap: onTap,
      isClickable: onTap != null,
      child: Row(
        children: [
          // Priority indicator
          Container(
            width: 4.w,
            height: 40.h,
            decoration: BoxDecoration(
              color: _getPriorityColor(task.priority),
              borderRadius: BorderRadius.circular(2.r),
            ),
          ),
          SizedBox(width: AppConfig.spacingM.w),
          
          // Checkbox
          Container(
            width: 24.w,
            height: 24.w,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: task.status == TaskStatus.completed
                    ? AppColors.success
                    : AppColors.grey300,
                width: 2,
              ),
              color: task.status == TaskStatus.completed
                  ? AppColors.success
                  : Colors.transparent,
            ),
            child: task.status == TaskStatus.completed
                ? Icon(
                    Icons.check,
                    color: AppColors.white,
                    size: 16.w,
                  )
                : null,
          ),
          
          SizedBox(width: AppConfig.spacingM.w),
          
          // Task content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  task.title,
                  style: TextStyle(
                    fontSize: AppConfig.fontSizeM.sp,
                    fontWeight: FontWeight.w500,
                    color: task.status == TaskStatus.completed
                        ? AppColors.grey500
                        : AppColors.onSurface,
                    decoration: task.status == TaskStatus.completed
                        ? TextDecoration.lineThrough
                        : null,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (task.description != null) ...[
                  SizedBox(height: AppConfig.spacingXS.h),
                  Text(
                    task.description!,
                    style: TextStyle(
                      fontSize: AppConfig.fontSizeS.sp,
                      color: AppColors.grey600,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                SizedBox(height: AppConfig.spacingXS.h),
                Row(
                  children: [
                    // Category
                    if (task.category != null) ...[
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: AppConfig.spacingXS.w,
                          vertical: 2.h,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.grey100,
                          borderRadius: BorderRadius.circular(10.r),
                        ),
                        child: Text(
                          task.category!,
                          style: TextStyle(
                            fontSize: AppConfig.fontSizeXS.sp,
                            color: AppColors.grey600,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      SizedBox(width: AppConfig.spacingS.w),
                    ],
                    
                    // Deadline
                    if (task.deadline != null) ...[
                      Row(
                        children: [
                          Icon(
                            Icons.schedule,
                            size: 12.w,
                            color: _getDeadlineColor(task.deadline!),
                          ),
                          SizedBox(width: 4.w),
                          Text(
                            _formatDeadline(task.deadline!),
                            style: TextStyle(
                              fontSize: AppConfig.fontSizeXS.sp,
                              color: _getDeadlineColor(task.deadline!),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          
          // Status indicator
          Container(
            padding: EdgeInsets.symmetric(
              horizontal: AppConfig.spacingXS.w,
              vertical: 4.h,
            ),
            decoration: BoxDecoration(
              color: _getStatusColor(task.status).withOpacity(0.1),
              borderRadius: BorderRadius.circular(10.r),
            ),
            child: Text(
              _getStatusText(task.status),
              style: TextStyle(
                fontSize: AppConfig.fontSizeXS.sp,
                color: _getStatusColor(task.status),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getPriorityColor(TaskPriority priority) {
    switch (priority) {
      case TaskPriority.high:
        return AppColors.error;
      case TaskPriority.medium:
        return AppColors.warning;
      case TaskPriority.low:
        return AppColors.success;
    }
  }

  Color _getStatusColor(TaskStatus status) {
    switch (status) {
      case TaskStatus.pending:
        return AppColors.grey500;
      case TaskStatus.inProgress:
        return AppColors.primary;
      case TaskStatus.completed:
        return AppColors.success;
      case TaskStatus.cancelled:
        return AppColors.error;
    }
  }

  String _getStatusText(TaskStatus status) {
    switch (status) {
      case TaskStatus.pending:
        return 'Kutilmoqda';
      case TaskStatus.inProgress:
        return 'Jarayonda';
      case TaskStatus.completed:
        return 'Bajarildi';
      case TaskStatus.cancelled:
        return 'Bekor qilindi';
    }
  }

  Color _getDeadlineColor(DateTime deadline) {
    final now = DateTime.now();
    final difference = deadline.difference(now);
    
    if (difference.isNegative) {
      return AppColors.error;
    } else if (difference.inHours < 3) {
      return AppColors.warning;
    } else {
      return AppColors.grey500;
    }
  }

  String _formatDeadline(DateTime deadline) {
    final now = DateTime.now();
    final difference = deadline.difference(now);
    
    if (difference.isNegative) {
      return 'Kechikkan';
    } else if (difference.inDays == 0) {
      if (difference.inHours == 0) {
        return '${difference.inMinutes} daqiqa';
      }
      return '${difference.inHours} soat';
    } else if (difference.inDays == 1) {
      return 'Ertaga';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} kun';
    } else {
      return '${deadline.day}.${deadline.month}';
    }
  }
}

class TaskItem {
  final String id;
  final String title;
  final String? description;
  final TaskPriority priority;
  final TaskStatus status;
  final DateTime? deadline;
  final String? category;

  const TaskItem({
    required this.id,
    required this.title,
    this.description,
    this.priority = TaskPriority.medium,
    this.status = TaskStatus.pending,
    this.deadline,
    this.category,
  });
}

enum TaskPriority {
  high,
  medium,
  low,
}

enum TaskStatus {
  pending,
  inProgress,
  completed,
  cancelled,
}

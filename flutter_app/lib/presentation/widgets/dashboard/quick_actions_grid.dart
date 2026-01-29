import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/config/app_config.dart';
import '../common/custom_card.dart';

class QuickActionsGrid extends StatelessWidget {
  final VoidCallback onTaskTap;
  final VoidCallback onGoalTap;
  final VoidCallback onFinanceTap;
  final VoidCallback onChallengeTap;

  const QuickActionsGrid({
    super.key,
    required this.onTaskTap,
    required this.onGoalTap,
    required this.onFinanceTap,
    required this.onChallengeTap,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: AppConfig.spacingM.w,
      mainAxisSpacing: AppConfig.spacingM.h,
      childAspectRatio: 1.2,
      children: [
        _buildActionItem(
          icon: Icons.task_alt,
          title: 'Vazifalar',
          subtitle: '8/12 bajarildi',
          color: AppColors.primary,
          onTap: onTaskTap,
        ),
        _buildActionItem(
          icon: Icons.flag,
          title: 'Maqsadlar',
          subtitle: '3 ta faol',
          color: AppColors.success,
          onTap: onGoalTap,
        ),
        _buildActionItem(
          icon: Icons.account_balance_wallet,
          title: 'Moliya',
          subtitle: '2.5M so\'m',
          color: AppColors.secondary,
          onTap: onFinanceTap,
        ),
        _buildActionItem(
          icon: Icons.emoji_events,
          title: 'Challenjlar',
          subtitle: '2 ta faol',
          color: AppColors.warning,
          onTap: onChallengeTap,
        ),
      ],
    );
  }

  Widget _buildActionItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return CustomCard(
      onTap: onTap,
      isClickable: true,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 56.w,
            height: 56.w,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppConfig.borderRadius),
            ),
            child: Icon(
              icon,
              color: color,
              size: 28.w,
            ),
          ),
          SizedBox(height: AppConfig.spacingM.h),
          Text(
            title,
            style: TextStyle(
              fontSize: AppConfig.fontSizeM.sp,
              fontWeight: FontWeight.w600,
              color: AppColors.onSurface,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: AppConfig.spacingXS.h),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: AppConfig.fontSizeS.sp,
              color: AppColors.grey600,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

// Extended quick actions with more options
class ExtendedQuickActionsGrid extends StatelessWidget {
  final VoidCallback? onTaskTap;
  final VoidCallback? onGoalTap;
  final VoidCallback? onFinanceTap;
  final VoidCallback? onChallengeTap;
  final VoidCallback? onCalendarTap;
  final VoidCallback? onNotesTap;
  final VoidCallback? onHabitsTap;
  final VoidCallback? onReportsTap;

  const ExtendedQuickActionsGrid({
    super.key,
    this.onTaskTap,
    this.onGoalTap,
    this.onFinanceTap,
    this.onChallengeTap,
    this.onCalendarTap,
    this.onNotesTap,
    this.onHabitsTap,
    this.onReportsTap,
  });

  @override
  Widget build(BuildContext context) {
    final actions = [
      ActionItem(
        icon: Icons.task_alt,
        title: 'Vazifalar',
        subtitle: '8/12 bajarildi',
        color: AppColors.primary,
        onTap: onTaskTap,
      ),
      ActionItem(
        icon: Icons.flag,
        title: 'Maqsadlar',
        subtitle: '3 ta faol',
        color: AppColors.success,
        onTap: onGoalTap,
      ),
      ActionItem(
        icon: Icons.account_balance_wallet,
        title: 'Moliya',
        subtitle: '2.5M so\'m',
        color: AppColors.secondary,
        onTap: onFinanceTap,
      ),
      ActionItem(
        icon: Icons.emoji_events,
        title: 'Challenjlar',
        subtitle: '2 ta faol',
        color: AppColors.warning,
        onTap: onChallengeTap,
      ),
      ActionItem(
        icon: Icons.calendar_today,
        title: 'Kalendar',
        subtitle: '5 ta tadbir',
        color: AppColors.info,
        onTap: onCalendarTap,
      ),
      ActionItem(
        icon: Icons.note_alt,
        title: 'Eslatmalar',
        subtitle: '12 ta eslatma',
        color: AppColors.purple,
        onTap: onNotesTap,
      ),
      ActionItem(
        icon: Icons.repeat,
        title: 'Odatlar',
        subtitle: '7 kunlik seriya',
        color: AppColors.teal,
        onTap: onHabitsTap,
      ),
      ActionItem(
        icon: Icons.analytics,
        title: 'Hisobotlar',
        subtitle: 'Oylik hisobot',
        color: AppColors.indigo,
        onTap: onReportsTap,
      ),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 1.1,
        crossAxisSpacing: AppConfig.spacingM.w,
        mainAxisSpacing: AppConfig.spacingM.h,
      ),
      itemCount: actions.length,
      itemBuilder: (context, index) {
        final action = actions[index];
        return _buildActionItem(action);
      },
    );
  }

  Widget _buildActionItem(ActionItem action) {
    return CustomCard(
      onTap: action.onTap,
      isClickable: action.onTap != null,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 48.w,
            height: 48.w,
            decoration: BoxDecoration(
              color: action.color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppConfig.smallBorderRadius),
            ),
            child: Icon(
              action.icon,
              color: action.color,
              size: 24.w,
            ),
          ),
          SizedBox(height: AppConfig.spacingM.h),
          Text(
            action.title,
            style: TextStyle(
              fontSize: AppConfig.fontSizeM.sp,
              fontWeight: FontWeight.w600,
              color: AppColors.onSurface,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: AppConfig.spacingXS.h),
          Text(
            action.subtitle,
            style: TextStyle(
              fontSize: AppConfig.fontSizeXS.sp,
              color: AppColors.grey600,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class ActionItem {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback? onTap;

  const ActionItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    this.onTap,
  });
}

// Quick action button for floating menu
class QuickActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  final bool isExpanded;

  const QuickActionButton({
    super.key,
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
    this.isExpanded = false,
  });

  @override
  Widget build(BuildContext context) {
    if (isExpanded) {
      return Container(
        margin: EdgeInsets.only(bottom: AppConfig.spacingS.h),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.symmetric(
                horizontal: AppConfig.spacingM.w,
                vertical: AppConfig.spacingS.h,
              ),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(AppConfig.borderRadius),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.shadowMedium,
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Text(
                label,
                style: TextStyle(
                  fontSize: AppConfig.fontSizeS.sp,
                  fontWeight: FontWeight.w500,
                  color: AppColors.onSurface,
                ),
              ),
            ),
            SizedBox(width: AppConfig.spacingS.w),
            Container(
              width: 48.w,
              height: 48.w,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(AppConfig.borderRadius),
                boxShadow: [
                  BoxShadow(
                    color: color.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Icon(
                icon,
                color: AppColors.white,
                size: 24.w,
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      width: 48.w,
      height: 48.w,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(AppConfig.borderRadius),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppConfig.borderRadius),
          child: Icon(
            icon,
            color: AppColors.white,
            size: 24.w,
          ),
        ),
      ),
    );
  }
}

// Additional color constants
extension AppColorsExtension on AppColors {
  static const Color info = Color(0xFF3B82F6);
  static const Color purple = Color(0xFF8B5CF6);
  static const Color teal = Color(0xFF14B8A6);
  static const Color indigo = Color(0xFF6366F1);
}

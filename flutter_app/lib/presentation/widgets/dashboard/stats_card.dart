import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/config/app_config.dart';
import '../common/custom_card.dart';

class StatsCard extends StatelessWidget {
  final String title;
  final Widget child;
  final Widget? action;
  final Color? backgroundColor;
  final Color? titleColor;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;

  const StatsCard({
    super.key,
    required this.title,
    required this.child,
    this.action,
    this.backgroundColor,
    this.titleColor,
    this.padding,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    return CustomCard(
      backgroundColor: backgroundColor,
      padding: padding,
      margin: margin,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: AppConfig.fontSizeL.sp,
                  fontWeight: FontWeight.w600,
                  color: titleColor ?? AppColors.onSurface,
                ),
              ),
              if (action != null) action!,
            ],
          ),
          SizedBox(height: AppConfig.spacingM.h),
          child,
        ],
      ),
    );
  }
}

// Stats number card
class StatsNumberCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  final String? subtitle;
  final VoidCallback? onTap;

  const StatsNumberCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
    this.subtitle,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return StatsCard(
      title: title,
      backgroundColor: color.withOpacity(0.1),
      titleColor: color,
      onTap: onTap,
      child: Row(
        children: [
          Container(
            width: 48.w,
            height: 48.w,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(AppConfig.smallBorderRadius),
            ),
            child: Icon(
              icon,
              color: AppColors.white,
              size: 24.w,
            ),
          ),
          SizedBox(width: AppConfig.spacingM.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: TextStyle(
                    fontSize: AppConfig.fontSizeXXXL.sp,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
                if (subtitle != null) ...[
                  SizedBox(height: AppConfig.spacingXS.h),
                  Text(
                    subtitle!,
                    style: TextStyle(
                      fontSize: AppConfig.fontSizeS.sp,
                      color: AppColors.grey600,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Progress stats card
class ProgressStatsCard extends StatelessWidget {
  final String title;
  final double progress;
  final Color color;
  final String progressText;
  final String? subtitle;
  final bool showPercentage;

  const ProgressStatsCard({
    super.key,
    required this.title,
    required this.progress,
    required this.color,
    required this.progressText,
    this.subtitle,
    this.showPercentage = true,
  });

  @override
  Widget build(BuildContext context) {
    return StatsCard(
      title: title,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                progressText,
                style: TextStyle(
                  fontSize: AppConfig.fontSizeL.sp,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              if (showPercentage)
                Text(
                  '${(progress * 100).toInt()}%',
                  style: TextStyle(
                    fontSize: AppConfig.fontSizeM.sp,
                    fontWeight: FontWeight.w600,
                    color: color,
                  ),
                ),
            ],
          ),
          SizedBox(height: AppConfig.spacingM.h),
          LinearProgressIndicator(
            value: progress,
            backgroundColor: AppColors.grey200,
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 8.h,
            borderRadius: BorderRadius.circular(4.r),
          ),
          if (subtitle != null) ...[
            SizedBox(height: AppConfig.spacingXS.h),
            Text(
              subtitle!,
              style: TextStyle(
                fontSize: AppConfig.fontSizeS.sp,
                color: AppColors.grey600,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// Comparison stats card
class ComparisonStatsCard extends StatelessWidget {
  final String title;
  final String currentValue;
  final String previousValue;
  final double changePercentage;
  final IconData icon;
  final Color color;

  const ComparisonStatsCard({
    super.key,
    required this.title,
    required this.currentValue,
    required this.previousValue,
    required this.changePercentage,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final isPositive = changePercentage >= 0;
    
    return StatsCard(
      title: title,
      child: Row(
        children: [
          Container(
            width: 48.w,
            height: 48.w,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppConfig.smallBorderRadius),
            ),
            child: Icon(
              icon,
              color: color,
              size: 24.w,
            ),
          ),
          SizedBox(width: AppConfig.spacingM.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  currentValue,
                  style: TextStyle(
                    fontSize: AppConfig.fontSizeXL.sp,
                    fontWeight: FontWeight.bold,
                    color: AppColors.onSurface,
                  ),
                ),
                Text(
                  'Oldingi: $previousValue',
                  style: TextStyle(
                    fontSize: AppConfig.fontSizeS.sp,
                    color: AppColors.grey600,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Icon(
                isPositive ? Icons.trending_up : Icons.trending_down,
                color: isPositive ? AppColors.success : AppColors.error,
                size: 16.w,
              ),
              Text(
                '${isPositive ? '+' : ''}${changePercentage.toStringAsFixed(1)}%',
                style: TextStyle(
                  fontSize: AppConfig.fontSizeS.sp,
                  fontWeight: FontWeight.w600,
                  color: isPositive ? AppColors.success : AppColors.error,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// Grid stats card
class GridStatsCard extends StatelessWidget {
  final String title;
  final List<StatItem> items;

  const GridStatsCard({
    super.key,
    required this.title,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    return StatsCard(
      title: title,
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 1.5,
          crossAxisSpacing: AppConfig.spacingM.w,
          mainAxisSpacing: AppConfig.spacingM.h,
        ),
        itemCount: items.length,
        itemBuilder: (context, index) {
          final item = items[index];
          return Container(
            padding: EdgeInsets.all(AppConfig.spacingM.w),
            decoration: BoxDecoration(
              color: item.color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppConfig.smallBorderRadius),
              border: Border.all(color: item.color.withOpacity(0.3)),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  item.icon,
                  color: item.color,
                  size: 24.w,
                ),
                SizedBox(height: AppConfig.spacingXS.h),
                Text(
                  item.value,
                  style: TextStyle(
                    fontSize: AppConfig.fontSizeL.sp,
                    fontWeight: FontWeight.bold,
                    color: item.color,
                  ),
                ),
                Text(
                  item.label,
                  style: TextStyle(
                    fontSize: AppConfig.fontSizeXS.sp,
                    color: AppColors.grey600,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class StatItem {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const StatItem({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });
}

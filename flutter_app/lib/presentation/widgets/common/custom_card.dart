import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/config/app_config.dart';

class CustomCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Color? backgroundColor;
  final Color? shadowColor;
  final double? elevation;
  final BorderRadius? borderRadius;
  final Border? border;
  final VoidCallback? onTap;
  final bool isClickable;

  const CustomCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.backgroundColor,
    this.shadowColor,
    this.elevation,
    this.borderRadius,
    this.border,
    this.onTap,
    this.isClickable = false,
  });

  @override
  Widget build(BuildContext context) {
    final card = Container(
      margin: margin ?? EdgeInsets.zero,
      decoration: BoxDecoration(
        color: backgroundColor ?? AppColors.surface,
        borderRadius: borderRadius ?? BorderRadius.circular(AppConfig.borderRadius),
        border: border,
        boxShadow: [
          BoxShadow(
            color: shadowColor ?? AppColors.shadowLight,
            blurRadius: elevation ?? 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: padding ?? EdgeInsets.all(AppConfig.spacingM.w),
        child: child,
      ),
    );

    if (isClickable || onTap != null) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: borderRadius ?? BorderRadius.circular(AppConfig.borderRadius),
          child: card,
        ),
      );
    }

    return card;
  }
}

// Card with title
class TitledCard extends StatelessWidget {
  final String title;
  final Widget child;
  final Widget? action;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Color? backgroundColor;
  final Color? shadowColor;
  final double? elevation;
  final BorderRadius? borderRadius;
  final Border? border;
  final VoidCallback? onTap;
  final bool isClickable;

  const TitledCard({
    super.key,
    required this.title,
    required this.child,
    this.action,
    this.padding,
    this.margin,
    this.backgroundColor,
    this.shadowColor,
    this.elevation,
    this.borderRadius,
    this.border,
    this.onTap,
    this.isClickable = false,
  });

  @override
  Widget build(BuildContext context) {
    return CustomCard(
      padding: padding,
      margin: margin,
      backgroundColor: backgroundColor,
      shadowColor: shadowColor,
      elevation: elevation,
      borderRadius: borderRadius,
      border: border,
      onTap: onTap,
      isClickable: isClickable,
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
                  color: AppColors.onSurface,
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

// Gradient card
class GradientCard extends StatelessWidget {
  final Widget child;
  final List<Color> gradientColors;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final BorderRadius? borderRadius;
  final VoidCallback? onTap;
  final bool isClickable;

  const GradientCard({
    super.key,
    required this.child,
    this.gradientColors = AppColors.primaryGradient,
    this.padding,
    this.margin,
    this.borderRadius,
    this.onTap,
    this.isClickable = false,
  });

  @override
  Widget build(BuildContext context) {
    final card = Container(
      margin: margin ?? EdgeInsets.zero,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: borderRadius ?? BorderRadius.circular(AppConfig.borderRadius),
        boxShadow: [
          BoxShadow(
            color: gradientColors.first.withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: padding ?? EdgeInsets.all(AppConfig.spacingM.w),
        child: child,
      ),
    );

    if (isClickable || onTap != null) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: borderRadius ?? BorderRadius.circular(AppConfig.borderRadius),
          child: card,
        ),
      );
    }

    return card;
  }
}

// Stats card
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

// List item card
class ListItemCard extends StatelessWidget {
  final Widget leading;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;
  final Color? backgroundColor;
  final EdgeInsetsGeometry? padding;

  const ListItemCard({
    super.key,
    required this.leading,
    required this.title,
    this.subtitle,
    this.trailing,
    this.onTap,
    this.backgroundColor,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    return CustomCard(
      backgroundColor: backgroundColor,
      padding: padding ?? EdgeInsets.symmetric(
        horizontal: AppConfig.spacingM.w,
        vertical: AppConfig.spacingS.h,
      ),
      onTap: onTap,
      isClickable: onTap != null,
      child: Row(
        children: [
          leading,
          SizedBox(width: AppConfig.spacingM.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: AppConfig.fontSizeM.sp,
                    fontWeight: FontWeight.w500,
                    color: AppColors.onSurface,
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
          if (trailing != null) ...[
            SizedBox(width: AppConfig.spacingM.w),
            trailing!,
          ],
        ],
      ),
    );
  }
}

// Icon card
class IconCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Color? iconColor;
  final Color? backgroundColor;
  final VoidCallback? onTap;
  final double? iconSize;

  const IconCard({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.iconColor,
    this.backgroundColor,
    this.onTap,
    this.iconSize,
  });

  @override
  Widget build(BuildContext context) {
    return CustomCard(
      backgroundColor: backgroundColor,
      onTap: onTap,
      isClickable: onTap != null,
      child: Column(
        children: [
          Container(
            width: 48.w,
            height: 48.w,
            decoration: BoxDecoration(
              color: (iconColor ?? AppColors.primary).withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppConfig.smallBorderRadius),
            ),
            child: Icon(
              icon,
              color: iconColor ?? AppColors.primary,
              size: iconSize ?? 24.w,
            ),
          ),
          SizedBox(height: AppConfig.spacingM.h),
          Text(
            title,
            style: TextStyle(
              fontSize: AppConfig.fontSizeM.sp,
              fontWeight: FontWeight.w500,
              color: AppColors.onSurface,
            ),
            textAlign: TextAlign.center,
          ),
          if (subtitle != null) ...[
            SizedBox(height: AppConfig.spacingXS.h),
            Text(
              subtitle!,
              style: TextStyle(
                fontSize: AppConfig.fontSizeS.sp,
                color: AppColors.grey600,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }
}

// Achievement card
class AchievementCard extends StatelessWidget {
  final String title;
  final String description;
  final IconData icon;
  final Color color;
  final bool isUnlocked;
  final DateTime? unlockedAt;

  const AchievementCard({
    super.key,
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    this.isUnlocked = false,
    this.unlockedAt,
  });

  @override
  Widget build(BuildContext context) {
    return CustomCard(
      backgroundColor: isUnlocked ? color.withOpacity(0.1) : AppColors.grey100,
      border: Border.all(
        color: isUnlocked ? color.withOpacity(0.3) : AppColors.grey300,
      ),
      child: Row(
        children: [
          Container(
            width: 48.w,
            height: 48.w,
            decoration: BoxDecoration(
              color: isUnlocked ? color : AppColors.grey400,
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
                  title,
                  style: TextStyle(
                    fontSize: AppConfig.fontSizeM.sp,
                    fontWeight: FontWeight.w600,
                    color: isUnlocked ? color : AppColors.grey600,
                  ),
                ),
                SizedBox(height: AppConfig.spacingXS.h),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: AppConfig.fontSizeS.sp,
                    color: AppColors.grey600,
                  ),
                ),
                if (unlockedAt != null) ...[
                  SizedBox(height: AppConfig.spacingXS.h),
                  Text(
                    'Yopilgan: ${Helpers.formatDate(unlockedAt!)}',
                    style: TextStyle(
                      fontSize: AppConfig.fontSizeXS.sp,
                      color: AppColors.grey500,
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

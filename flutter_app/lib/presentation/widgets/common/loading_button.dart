import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/config/app_config.dart';
import '../../../core/utils/helpers.dart';

class LoadingButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final bool isLoading;
  final String text;
  final IconData? icon;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final double? width;
  final double? height;
  final EdgeInsets? padding;
  final BorderRadius? borderRadius;
  final bool isOutlined;
  final bool isTextButton;

  const LoadingButton({
    super.key,
    required this.onPressed,
    this.isLoading = false,
    required this.text,
    this.icon,
    this.backgroundColor,
    this.foregroundColor,
    this.width,
    this.height,
    this.padding,
    this.borderRadius,
    this.isOutlined = false,
    this.isTextButton = false,
  });

  @override
  Widget build(BuildContext context) {
    final buttonColor = backgroundColor ?? (isOutlined ? Colors.transparent : AppColors.primary);
    final textColor = foregroundColor ?? (isOutlined ? AppColors.primary : AppColors.white);
    final borderSide = isOutlined ? BorderSide(color: AppColors.primary, width: 1.5) : null;

    Widget child;
    if (isLoading) {
      child = Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: 20.w,
            height: 20.w,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(textColor),
            ),
          ),
          SizedBox(width: AppConfig.spacingS.w),
          Text(
            'Yuklanmoqda...',
            style: TextStyle(
              fontSize: AppConfig.fontSizeM.sp,
              fontWeight: FontWeight.w600,
              color: textColor,
            ),
          ),
        ],
      );
    } else {
      child = Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (icon != null) ...[
            Icon(
              icon,
              size: 20.w,
              color: textColor,
            ),
            SizedBox(width: AppConfig.spacingS.w),
          ],
          Text(
            text,
            style: TextStyle(
              fontSize: AppConfig.fontSizeM.sp,
              fontWeight: FontWeight.w600,
              color: textColor,
            ),
          ),
        ],
      );
    }

    if (isTextButton) {
      return TextButton(
        onPressed: isLoading ? null : onPressed,
        style: TextButton.styleFrom(
          padding: padding ?? EdgeInsets.symmetric(
            horizontal: AppConfig.spacingL.w,
            vertical: AppConfig.spacingM.h,
          ),
          minimumSize: Size(width ?? double.infinity, height ?? 56.h),
          shape: RoundedRectangleBorder(
            borderRadius: borderRadius ?? BorderRadius.circular(AppConfig.borderRadius),
          ),
        ),
        child: child,
      );
    }

    return SizedBox(
      width: width ?? double.infinity,
      height: height ?? 56.h,
      child: isOutlined
          ? OutlinedButton(
              onPressed: isLoading ? null : onPressed,
              style: OutlinedButton.styleFrom(
                side: borderSide,
                padding: padding ?? EdgeInsets.symmetric(
                  horizontal: AppConfig.spacingL.w,
                  vertical: AppConfig.spacingM.h,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: borderRadius ?? BorderRadius.circular(AppConfig.borderRadius),
                ),
              ),
              child: child,
            )
          : ElevatedButton(
              onPressed: isLoading ? null : onPressed,
              style: ElevatedButton.styleFrom(
                backgroundColor: buttonColor,
                foregroundColor: textColor,
                elevation: 2,
                shadowColor: AppColors.shadowLight,
                padding: padding ?? EdgeInsets.symmetric(
                  horizontal: AppConfig.spacingL.w,
                  vertical: AppConfig.spacingM.h,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: borderRadius ?? BorderRadius.circular(AppConfig.borderRadius),
                ),
              ),
              child: child,
            ),
    );
  }
}

// Icon button with loading state
class LoadingIconButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData icon;
  final Color? iconColor;
  final Color? backgroundColor;
  final double? size;
  final EdgeInsets? padding;
  final BorderRadius? borderRadius;
  final String? tooltip;

  const LoadingIconButton({
    super.key,
    required this.onPressed,
    this.isLoading = false,
    required this.icon,
    this.iconColor,
    this.backgroundColor,
    this.size,
    this.padding,
    this.borderRadius,
    this.tooltip,
  });

  @override
  Widget build(BuildContext context) {
    Widget child;
    if (isLoading) {
      child = SizedBox(
        width: size ?? 24.w,
        height: size ?? 24.w,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(
            iconColor ?? Theme.of(context).colorScheme.onSurface,
          ),
        ),
      );
    } else {
      child = Icon(
        icon,
        size: size ?? 24.w,
        color: iconColor ?? Theme.of(context).colorScheme.onSurface,
      );
    }

    final button = Container(
      width: size != null ? size! + 16.w : 48.w,
      height: size != null ? size! + 16.h : 48.h,
      padding: padding ?? EdgeInsets.all(AppConfig.spacingS.w),
      decoration: BoxDecoration(
        color: backgroundColor ?? Colors.transparent,
        borderRadius: borderRadius ?? BorderRadius.circular(AppConfig.borderRadius),
      ),
      child: Center(child: child),
    );

    if (tooltip != null) {
      return Tooltip(
        message: tooltip!,
        child: InkWell(
          onTap: isLoading ? null : onPressed,
          borderRadius: borderRadius ?? BorderRadius.circular(AppConfig.borderRadius),
          child: button,
        ),
      );
    }

    return InkWell(
      onTap: isLoading ? null : onPressed,
      borderRadius: borderRadius ?? BorderRadius.circular(AppConfig.borderRadius),
      child: button,
    );
  }
}

// Floating action button with loading state
class LoadingFab extends StatelessWidget {
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData icon;
  final String? tooltip;
  final Color? backgroundColor;
  final Color? foregroundColor;

  const LoadingFab({
    super.key,
    required this.onPressed,
    this.isLoading = false,
    required this.icon,
    this.tooltip,
    this.backgroundColor,
    this.foregroundColor,
  });

  @override
  Widget build(BuildContext context) {
    Widget child;
    if (isLoading) {
      child = SizedBox(
        width: 24.w,
        height: 24.w,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(
            foregroundColor ?? AppColors.white,
          ),
        ),
      );
    } else {
      child = Icon(
        icon,
        color: foregroundColor ?? AppColors.white,
      );
    }

    final fab = FloatingActionButton(
      onPressed: isLoading ? null : onPressed,
      backgroundColor: backgroundColor ?? AppColors.primary,
      child: child,
    );

    if (tooltip != null) {
      return FloatingActionButton.extended(
        onPressed: isLoading ? null : onPressed,
        backgroundColor: backgroundColor ?? AppColors.primary,
        icon: child,
        label: Text(tooltip!),
      );
    }

    return fab;
  }
}

// Gradient button
class GradientButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final bool isLoading;
  final String text;
  final IconData? icon;
  final List<Color> gradientColors;
  final double? width;
  final double? height;
  final EdgeInsets? padding;
  final BorderRadius? borderRadius;

  const GradientButton({
    super.key,
    required this.onPressed,
    this.isLoading = false,
    required this.text,
    this.icon,
    this.gradientColors = AppColors.primaryGradient,
    this.width,
    this.height,
    this.padding,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    Widget child;
    if (isLoading) {
      child = Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: 20.w,
            height: 20.w,
            child: const CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.white),
            ),
          ),
          SizedBox(width: AppConfig.spacingS.w),
          Text(
            'Yuklanmoqda...',
            style: TextStyle(
              fontSize: AppConfig.fontSizeM.sp,
              fontWeight: FontWeight.w600,
              color: AppColors.white,
            ),
          ),
        ],
      );
    } else {
      child = Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (icon != null) ...[
            Icon(
              icon,
              size: 20.w,
              color: AppColors.white,
            ),
            SizedBox(width: AppConfig.spacingS.w),
          ],
          Text(
            text,
            style: TextStyle(
              fontSize: AppConfig.fontSizeM.sp,
              fontWeight: FontWeight.w600,
              color: AppColors.white,
            ),
          ),
        ],
      );
    }

    return Container(
      width: width ?? double.infinity,
      height: height ?? 56.h,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradientColors,
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: borderRadius ?? BorderRadius.circular(AppConfig.borderRadius),
        boxShadow: [
          BoxShadow(
            color: gradientColors.first.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isLoading ? null : onPressed,
          borderRadius: borderRadius ?? BorderRadius.circular(AppConfig.borderRadius),
          child: Center(
            child: Padding(
              padding: padding ?? EdgeInsets.symmetric(
                horizontal: AppConfig.spacingL.w,
                vertical: AppConfig.spacingM.h,
              ),
              child: child,
            ),
          ),
        ),
      ),
    );
  }
}

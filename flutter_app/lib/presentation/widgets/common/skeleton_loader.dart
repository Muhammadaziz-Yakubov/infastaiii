import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:shimmer/shimmer.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/config/app_config.dart';

class SkeletonLoader extends StatelessWidget {
  final double? height;
  final double? width;
  final BorderRadius? borderRadius;
  final Color? baseColor;
  final Color? highlightColor;

  const SkeletonLoader({
    super.key,
    this.height,
    this.width,
    this.borderRadius,
    this.baseColor,
    this.highlightColor,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: baseColor ?? AppColors.grey200,
      highlightColor: highlightColor ?? AppColors.grey100,
      child: Container(
        height: height,
        width: width ?? double.infinity,
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: borderRadius ?? BorderRadius.circular(AppConfig.borderRadius),
        ),
      ),
    );
  }
}

// Skeleton card
class SkeletonCard extends StatelessWidget {
  final double? height;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;

  const SkeletonCard({
    super.key,
    this.height,
    this.padding,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin ?? EdgeInsets.zero,
      child: SkeletonLoader(
        height: height ?? 100.h,
        borderRadius: BorderRadius.circular(AppConfig.borderRadius),
      ),
    );
  }
}

// Skeleton list item
class SkeletonListItem extends StatelessWidget {
  final bool showAvatar;
  final bool showSubtitle;
  final double? height;

  const SkeletonListItem({
    super.key,
    this.showAvatar = true,
    this.showSubtitle = true,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: AppConfig.spacingL.w,
        vertical: AppConfig.spacingS.h,
      ),
      child: Row(
        children: [
          if (showAvatar) ...[
            SkeletonLoader(
              width: 48.w,
              height: 48.w,
              borderRadius: BorderRadius.circular(24.r),
            ),
            SizedBox(width: AppConfig.spacingM.w),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SkeletonLoader(
                  height: 16.h,
                  width: double.infinity,
                  borderRadius: BorderRadius.circular(4.r),
                ),
                if (showSubtitle) ...[
                  SizedBox(height: AppConfig.spacingXS.h),
                  SkeletonLoader(
                    height: 14.h,
                    width: 200.w,
                    borderRadius: BorderRadius.circular(4.r),
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

// Skeleton stats card
class SkeletonStatsCard extends StatelessWidget {
  final String? title;

  const SkeletonStatsCard({
    super.key,
    this.title,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(bottom: AppConfig.spacingL.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null) ...[
            SkeletonLoader(
              height: 20.h,
              width: 120.w,
              borderRadius: BorderRadius.circular(4.r),
            ),
            SizedBox(height: AppConfig.spacingM.h),
          ],
          SkeletonLoader(
            height: 120.h,
            borderRadius: BorderRadius.circular(AppConfig.borderRadius),
          ),
        ],
      ),
    );
  }
}

// Skeleton grid
class SkeletonGrid extends StatelessWidget {
  final int itemCount;
  final int crossAxisCount;
  final double childAspectRatio;
  final double? height;

  const SkeletonGrid({
    super.key,
    this.itemCount = 6,
    this.crossAxisCount = 2,
    this.childAspectRatio = 1.0,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        childAspectRatio: childAspectRatio,
        crossAxisSpacing: AppConfig.spacingM.w,
        mainAxisSpacing: AppConfig.spacingM.h,
      ),
      itemCount: itemCount,
      itemBuilder: (context, index) {
        return SkeletonLoader(
          height: height,
          borderRadius: BorderRadius.circular(AppConfig.borderRadius),
        );
      },
    );
  }
}

// Skeleton dashboard
class SkeletonDashboard extends StatelessWidget {
  const SkeletonDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Header skeleton
        Padding(
          padding: EdgeInsets.all(AppConfig.spacingL.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SkeletonLoader(
                height: 24.h,
                width: 100.w,
                borderRadius: BorderRadius.circular(4.r),
              ),
              SizedBox(height: AppConfig.spacingXS.h),
              SkeletonLoader(
                height: 32.h,
                width: 150.w,
                borderRadius: BorderRadius.circular(4.r),
              ),
            ],
          ),
        ),
        
        // Stats cards skeleton
        Padding(
          padding: EdgeInsets.symmetric(horizontal: AppConfig.spacingL.w),
          child: Row(
            children: [
              Expanded(
                child: SkeletonLoader(
                  height: 80.h,
                  borderRadius: BorderRadius.circular(AppConfig.borderRadius),
                ),
              ),
              SizedBox(width: AppConfig.spacingM.w),
              Expanded(
                child: SkeletonLoader(
                  height: 80.h,
                  borderRadius: BorderRadius.circular(AppConfig.borderRadius),
                ),
              ),
            ],
          ),
        ),
        
        SizedBox(height: AppConfig.spacingL.h),
        
        // Quick actions skeleton
        Padding(
          padding: EdgeInsets.symmetric(horizontal: AppConfig.spacingL.w),
          child: SkeletonGrid(
            itemCount: 4,
            crossAxisCount: 2,
            childAspectRatio: 1.2,
          ),
        ),
        
        SizedBox(height: AppConfig.spacingL.h),
        
        // Recent items skeleton
        Padding(
          padding: EdgeInsets.symmetric(horizontal: AppConfig.spacingL.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SkeletonLoader(
                height: 20.h,
                width: 120.w,
                borderRadius: BorderRadius.circular(4.r),
              ),
              SizedBox(height: AppConfig.spacingM.h),
              ...List.generate(3, (index) => SkeletonListItem()),
            ],
          ),
        ),
      ],
    );
  }
}

// Skeleton task list
class SkeletonTaskList extends StatelessWidget {
  final int itemCount;

  const SkeletonTaskList({
    super.key,
    this.itemCount = 5,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(
        itemCount,
        (index) => Padding(
          padding: EdgeInsets.only(bottom: AppConfig.spacingM.h),
          child: SkeletonListItem(
            showAvatar: false,
            showSubtitle: true,
            height: 60.h,
          ),
        ),
      ),
    );
  }
}

// Skeleton profile
class SkeletonProfile extends StatelessWidget {
  const SkeletonProfile({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Avatar skeleton
        SkeletonLoader(
          width: 80.w,
          height: 80.w,
          borderRadius: BorderRadius.circular(40.r),
        ),
        SizedBox(height: AppConfig.spacingM.h),
        
        // Name skeleton
        SkeletonLoader(
          height: 24.h,
          width: 150.w,
          borderRadius: BorderRadius.circular(4.r),
        ),
        SizedBox(height: AppConfig.spacingXS.h),
        
        // Email skeleton
        SkeletonLoader(
          height: 16.h,
          width: 200.w,
          borderRadius: BorderRadius.circular(4.r),
        ),
        SizedBox(height: AppConfig.spacingL.h),
        
        // Stats skeleton
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            Column(
              children: [
                SkeletonLoader(
                  height: 20.h,
                  width: 40.w,
                  borderRadius: BorderRadius.circular(4.r),
                ),
                SizedBox(height: AppConfig.spacingXS.h),
                SkeletonLoader(
                  height: 14.h,
                  width: 60.w,
                  borderRadius: BorderRadius.circular(4.r),
                ),
              ],
            ),
            Column(
              children: [
                SkeletonLoader(
                  height: 20.h,
                  width: 40.w,
                  borderRadius: BorderRadius.circular(4.r),
                ),
                SizedBox(height: AppConfig.spacingXS.h),
                SkeletonLoader(
                  height: 14.h,
                  width: 60.w,
                  borderRadius: BorderRadius.circular(4.r),
                ),
              ],
            ),
            Column(
              children: [
                SkeletonLoader(
                  height: 20.h,
                  width: 40.w,
                  borderRadius: BorderRadius.circular(4.r),
                ),
                SizedBox(height: AppConfig.spacingXS.h),
                SkeletonLoader(
                  height: 14.h,
                  width: 60.w,
                  borderRadius: BorderRadius.circular(4.r),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }
}

// Skeleton chart
class SkeletonChart extends StatelessWidget {
  final double? height;

  const SkeletonChart({
    super.key,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height ?? 200.h,
      padding: EdgeInsets.all(AppConfig.spacingM.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SkeletonLoader(
            height: 16.h,
            width: 80.w,
            borderRadius: BorderRadius.circular(4.r),
          ),
          SizedBox(height: AppConfig.spacingM.h),
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: List.generate(
                6,
                (index) => Expanded(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 2.w),
                    child: SkeletonLoader(
                      height: (index + 1) * 20.h,
                      borderRadius: BorderRadius.circular(4.r),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

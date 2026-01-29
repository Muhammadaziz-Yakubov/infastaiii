import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/constants/app_colors.dart';
import '../../core/config/app_config.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo
            Container(
              width: 120.w,
              height: 120.w,
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(30.r),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.shadowDark,
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Center(
                child: Text(
                  'AI',
                  style: TextStyle(
                    fontSize: 48.sp,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ).animate().scale(
              duration: AppConfig.mediumAnimation,
              curve: Curves.elasticOut,
            ).then().shimmer(
              duration: AppConfig.longAnimation,
            ),
            
            SizedBox(height: AppConfig.spacingXL.h),
            
            // App name
            Text(
              AppConfig.appName,
              style: TextStyle(
                fontSize: AppConfig.fontSizeXXXL.sp,
                fontWeight: FontWeight.bold,
                color: AppColors.white,
                letterSpacing: 1.2,
              ),
            ).animate().slideY(
              begin: 50,
              duration: AppConfig.mediumAnimation,
              curve: Curves.easeOut,
            ).then().fadeIn(
              duration: AppConfig.shortAnimation,
            ),
            
            SizedBox(height: AppConfig.spacingS.h),
            
            // Tagline
            Text(
              'Productivity & Life Manager',
              style: TextStyle(
                fontSize: AppConfig.fontSizeS.sp,
                color: AppColors.white.withOpacity(0.8),
                letterSpacing: 0.5,
              ),
            ).animate().slideY(
              begin: 30,
              duration: AppConfig.mediumAnimation,
              curve: Curves.easeOut,
              delay: 200.ms,
            ).then().fadeIn(
              duration: AppConfig.shortAnimation,
            ),
            
            SizedBox(height: AppConfig.spacingXXL.h),
            
            // Loading indicator
            SizedBox(
              width: 40.w,
              height: 40.w,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.white),
              ).animate().rotate(
                duration: AppConfig.longAnimation,
                curve: Curves.linear,
                repeat: true,
              ),
            ).animate().fadeIn(
              duration: AppConfig.shortAnimation,
              delay: 400.ms,
            ),
          ],
        ),
      ),
    );
  }
}

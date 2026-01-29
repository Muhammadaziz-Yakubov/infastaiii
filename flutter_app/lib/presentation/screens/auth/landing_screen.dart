import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/config/app_config.dart';
import '../../../core/utils/helpers.dart';
import '../../routes/app_router.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(AppConfig.spacingL.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top section with logo and title
              Expanded(
                flex: 2,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Logo
                    Container(
                      width: 80.w,
                      height: 80.w,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: AppColors.primaryGradient,
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20.r),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Center(
                        child: Text(
                          'AI',
                          style: TextStyle(
                            fontSize: 32.sp,
                            fontWeight: FontWeight.bold,
                            color: AppColors.white,
                          ),
                        ),
                      ),
                    ).animate().scale(
                      duration: AppConfig.mediumAnimation,
                      curve: Curves.elasticOut,
                    ),
                    
                    SizedBox(height: AppConfig.spacingXL.h),
                    
                    // App name
                    Text(
                      AppConfig.appName,
                      style: TextStyle(
                        fontSize: AppConfig.fontSizeXXXL.sp,
                        fontWeight: FontWeight.bold,
                        color: AppColors.onBackground,
                        letterSpacing: 1.2,
                      ),
                    ).animate().slideX(
                      begin: -50,
                      duration: AppConfig.mediumAnimation,
                      curve: Curves.easeOut,
                      delay: 200.ms,
                    ),
                    
                    SizedBox(height: AppConfig.spacingM.h),
                    
                    // Tagline
                    Text(
                      'Productivity & Life Manager\nfor Uzbekistan',
                      style: TextStyle(
                        fontSize: AppConfig.fontSizeM.sp,
                        color: AppColors.grey600,
                        height: 1.4,
                      ),
                    ).animate().slideX(
                      begin: -30,
                      duration: AppConfig.mediumAnimation,
                      curve: Curves.easeOut,
                      delay: 400.ms,
                    ),
                  ],
                ),
              ),
              
              // Features section
              Expanded(
                flex: 1,
                child: Column(
                  children: [
                    _buildFeatureItem(
                      icon: Icons.task_alt,
                      title: 'Tasks',
                      description: 'Vazifalarni boshqaring',
                      delay: 600.ms,
                    ),
                    SizedBox(height: AppConfig.spacingM.h),
                    _buildFeatureItem(
                      icon: Icons.flag,
                      title: 'Goals',
                      description: 'Maqsadlarga erishing',
                      delay: 800.ms,
                    ),
                    SizedBox(height: AppConfig.spacingM.h),
                    _buildFeatureItem(
                      icon: Icons.account_balance_wallet,
                      title: 'Finance',
                      description: 'Moliyangizni nazorat qiling',
                      delay: 1000.ms,
                    ),
                  ],
                ),
              ),
              
              // Bottom section with buttons
              Column(
                children: [
                  // Phone authentication button
                  SizedBox(
                    width: double.infinity,
                    height: 56.h,
                    child: ElevatedButton(
                      onPressed: () {
                        NavigationHelper.navigateToPhoneInput(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: AppColors.white,
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppConfig.borderRadius),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.phone, size: 20.w),
                          SizedBox(width: AppConfig.spacingS.w),
                          Text(
                            'Telefon orqali kirish',
                            style: TextStyle(
                              fontSize: AppConfig.fontSizeM.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ).animate().slideY(
                      begin: 50,
                      duration: AppConfig.mediumAnimation,
                      curve: Curves.easeOut,
                      delay: 1200.ms,
                    ).then().shimmer(
                      duration: AppConfig.longAnimation,
                ),
                  ),
                  
                  SizedBox(height: AppConfig.spacingM.h),
                  
                  // Email authentication button
                  SizedBox(
                    width: double.infinity,
                    height: 56.h,
                    child: OutlinedButton(
                      onPressed: () {
                        NavigationHelper.navigateToLogin(context);
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        side: const BorderSide(color: AppColors.primary, width: 1.5),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppConfig.borderRadius),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.email_outlined, size: 20.w),
                          SizedBox(width: AppConfig.spacingS.w),
                          Text(
                            'Email orqali kirish',
                            style: TextStyle(
                              fontSize: AppConfig.fontSizeM.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ).animate().slideY(
                      begin: 30,
                      duration: AppConfig.mediumAnimation,
                      curve: Curves.easeOut,
                      delay: 1400.ms,
                    ),
                  ),
                  
                  SizedBox(height: AppConfig.spacingL.h),
                  
                  // Terms and privacy
                  Center(
                    child: Text.rich(
                      TextSpan(
                        text: 'Davom etish orqali siz ',
                        style: TextStyle(
                          fontSize: AppConfig.fontSizeXS.sp,
                          color: AppColors.grey500,
                        ),
                        children: [
                          WidgetSpan(
                            child: GestureDetector(
                              onTap: () {
                                // Open terms of service
                              },
                              child: Text(
                                'Foydalanish shartlari',
                                style: TextStyle(
                                  fontSize: AppConfig.fontSizeXS.sp,
                                  color: AppColors.primary,
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ),
                          ),
                          const TextSpan(text: ' va '),
                          WidgetSpan(
                            child: GestureDetector(
                              onTap: () {
                                // Open privacy policy
                              },
                              child: Text(
                                'Maxfiylik siyosati',
                                style: TextStyle(
                                  fontSize: AppConfig.fontSizeXS.sp,
                                  color: AppColors.primary,
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ),
                          ),
                          const TextSpan(text: ' ga rozilik bildirasiz'),
                        ],
                      ),
                      textAlign: TextAlign.center,
                    ).animate().fadeIn(
                      duration: AppConfig.shortAnimation,
                      delay: 1600.ms,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildFeatureItem({
    required IconData icon,
    required String title,
    required String description,
    required Duration delay,
  }) {
    return Row(
      children: [
        Container(
          width: 40.w,
          height: 40.w,
          decoration: BoxDecoration(
            color: AppColors.primarySurface,
            borderRadius: BorderRadius.circular(10.r),
          ),
          child: Icon(
            icon,
            color: AppColors.primary,
            size: 20.w,
          ),
        ).animate().scale(
          duration: AppConfig.shortAnimation,
          curve: Curves.elasticOut,
          delay: delay,
        ),
        SizedBox(width: AppConfig.spacingM.w),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: AppConfig.fontSizeM.sp,
                fontWeight: FontWeight.w600,
                color: AppColors.onBackground,
              ),
            ).animate().slideX(
              begin: 20,
              duration: AppConfig.shortAnimation,
              curve: Curves.easeOut,
              delay: delay + 100.ms,
            ),
            Text(
              description,
              style: TextStyle(
                fontSize: AppConfig.fontSizeS.sp,
                color: AppColors.grey600,
              ),
            ).animate().slideX(
              begin: 15,
              duration: AppConfig.shortAnimation,
              curve: Curves.easeOut,
              delay: delay + 200.ms,
            ),
          ],
        ),
      ],
    );
  }
}

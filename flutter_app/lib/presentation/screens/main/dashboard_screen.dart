import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/config/app_config.dart';
import '../../../core/utils/helpers.dart';
import '../../routes/app_router.dart';
import '../../widgets/common/custom_card.dart';
import '../../widgets/common/skeleton_loader.dart';
import '../../widgets/dashboard/stats_card.dart';
import '../../widgets/dashboard/quick_actions_grid.dart';
import '../../widgets/dashboard/ai_tips_card.dart';
import '../../widgets/dashboard/recent_tasks_list.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: AppConfig.longAnimation,
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutCubic,
    ));

    _loadData();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    // Simulate loading data
    await Future.delayed(const Duration(seconds: 1));
    
    if (mounted) {
      setState(() => _isLoading = false);
      _animationController.forward();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadData,
          color: AppColors.primary,
          child: CustomScrollView(
            slivers: [
              // App Bar
              SliverAppBar(
                backgroundColor: AppColors.background,
                elevation: 0,
                floating: true,
                pinned: true,
                expandedHeight: 120.h,
                flexibleSpace: FlexibleSpaceBar(
                  titlePadding: EdgeInsets.only(
                    left: AppConfig.spacingL.w,
                    bottom: AppConfig.spacingM.h,
                  ),
                  title: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Salom, 👋',
                        style: TextStyle(
                          fontSize: AppConfig.fontSizeS.sp,
                          color: AppColors.grey600,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Text(
                        _getGreeting(),
                        style: TextStyle(
                          fontSize: AppConfig.fontSizeXL.sp,
                          color: AppColors.onBackground,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                actions: [
                  IconButton(
                    onPressed: () {
                      NavigationHelper.navigateToNotifications(context);
                    },
                    icon: const Icon(Icons.notifications_outlined),
                  ),
                  IconButton(
                    onPressed: () {
                      NavigationHelper.navigateToProfile(context);
                    },
                    icon: const Icon(Icons.person_outline),
                  ),
                ],
              ),
              
              // Content
              SliverPadding(
                padding: EdgeInsets.all(AppConfig.spacingL.w),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    // Daily Summary Card
                    FadeTransition(
                      opacity: _fadeAnimation,
                      child: SlideTransition(
                        position: _slideAnimation,
                        child: StatsCard(
                          title: 'Kunlik yig\'indisi',
                          child: _buildDailySummary(),
                        ),
                      ),
                    ),
                    
                    SizedBox(height: AppConfig.spacingL.h),
                    
                    // Quick Actions Grid
                    FadeTransition(
                      opacity: _fadeAnimation,
                      child: SlideTransition(
                        position: _slideAnimation,
                        child: QuickActionsGrid(
                          onTaskTap: () => NavigationHelper.navigateToTasks(context),
                          onGoalTap: () => NavigationHelper.navigateToGoals(context),
                          onFinanceTap: () => NavigationHelper.navigateToFinance(context),
                          onChallengeTap: () => NavigationHelper.navigateToChallenges(context),
                        ),
                      ),
                    ),
                    
                    SizedBox(height: AppConfig.spacingL.h),
                    
                    // Progress Overview
                    FadeTransition(
                      opacity: _fadeAnimation,
                      child: SlideTransition(
                        position: _slideAnimation,
                        child: StatsCard(
                          title: 'Jarayon ko\'rsatkichlari',
                          child: _buildProgressOverview(),
                        ),
                      ),
                    ),
                    
                    SizedBox(height: AppConfig.spacingL.h),
                    
                    // Recent Tasks
                    FadeTransition(
                      opacity: _fadeAnimation,
                      child: SlideTransition(
                        position: _slideAnimation,
                        child: StatsCard(
                          title: 'So\'nggi vazifalar',
                          child: _isLoading
                              ? const SkeletonLoader(height: 200)
                              : RecentTasksList(
                                  onTaskTap: (taskId) {
                                    NavigationHelper.navigateToTaskDetail(context, taskId);
                                  },
                                ),
                        ),
                      ),
                    ),
                    
                    SizedBox(height: AppConfig.spacingL.h),
                    
                    // AI Tips Card
                    FadeTransition(
                      opacity: _fadeAnimation,
                      child: SlideTransition(
                        position: _slideAnimation,
                        child: const AITipsCard(),
                      ),
                    ),
                    
                    SizedBox(height: AppConfig.spacingXXL.h),
                  ]),
                ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          NavigationHelper.navigateToCreateTask(context);
        },
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add),
      ),
    );
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) {
      return 'Xayrli tong!';
    } else if (hour < 17) {
      return 'Xayrli kun!';
    } else {
      return 'Xayrli kech!';
    }
  }

  Widget _buildDailySummary() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildSummaryItem(
                'Vazifalar',
                '8/12',
                AppColors.primary,
                Icons.task_alt,
              ),
            ),
            SizedBox(width: AppConfig.spacingM.w),
            Expanded(
              child: _buildSummaryItem(
                'Maqsadlar',
                '3/5',
                AppColors.success,
                Icons.flag,
              ),
            ),
          ],
        ),
        SizedBox(height: AppConfig.spacingM.h),
        Row(
          children: [
            Expanded(
              child: _buildSummaryItem(
                'Challenjlar',
                '2/4',
                AppColors.warning,
                Icons.emoji_events,
              ),
            ),
            SizedBox(width: AppConfig.spacingM.w),
            Expanded(
              child: _buildSummaryItem(
                'Balans',
                '2.5M',
                AppColors.secondary,
                Icons.account_balance_wallet,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSummaryItem(String title, String value, Color color, IconData icon) {
    return Container(
      padding: EdgeInsets.all(AppConfig.spacingM.w),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppConfig.smallBorderRadius),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 16.w),
              SizedBox(width: AppConfig.spacingXS.w),
              Text(
                title,
                style: TextStyle(
                  fontSize: AppConfig.fontSizeS.sp,
                  color: AppColors.grey600,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          SizedBox(height: AppConfig.spacingXS.h),
          Text(
            value,
            style: TextStyle(
              fontSize: AppConfig.fontSizeL.sp,
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressOverview() {
    return Column(
      children: [
        _buildProgressItem(
          'Kunlik vazifalar',
          0.75,
          AppColors.primary,
          '8/12 bajarildi',
        ),
        SizedBox(height: AppConfig.spacingM.h),
        _buildProgressItem(
          'Haftalik maqsadlar',
          0.60,
          AppColors.success,
          '3/5 yakunlandi',
        ),
        SizedBox(height: AppConfig.spacingM.h),
        _buildProgressItem(
          'Oylik byudjet',
          0.45,
          AppColors.warning,
          '45% ishlatildi',
        ),
      ],
    );
  }

  Widget _buildProgressItem(String title, double progress, Color color, String subtitle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: AppConfig.fontSizeM.sp,
                color: AppColors.onSurface,
                fontWeight: FontWeight.w500,
              ),
            ),
            Text(
              '${(progress * 100).toInt()}%',
              style: TextStyle(
                fontSize: AppConfig.fontSizeS.sp,
                color: color,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        SizedBox(height: AppConfig.spacingXS.h),
        LinearProgressIndicator(
          value: progress,
          backgroundColor: AppColors.grey200,
          valueColor: AlwaysStoppedAnimation<Color>(color),
          minHeight: 8.h,
          borderRadius: BorderRadius.circular(4.r),
        ),
        SizedBox(height: AppConfig.spacingXS.h),
        Text(
          subtitle,
          style: TextStyle(
            fontSize: AppConfig.fontSizeS.sp,
            color: AppColors.grey600,
          ),
        ),
      ],
    );
  }
}

// Navigation helper extension
extension NavigationHelperExtension on NavigationHelper {
  static void navigateToNotifications(BuildContext context) {
    // TODO: Implement notifications screen
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Notifications screen coming soon')),
    );
  }
}

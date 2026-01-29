import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/config/app_config.dart';
import '../../../core/utils/helpers.dart';
import '../../widgets/common/custom_card.dart';
import '../../widgets/common/skeleton_loader.dart';
import '../../widgets/common/loading_button.dart';

class GoalsScreen extends StatefulWidget {
  const GoalsScreen({super.key});

  @override
  State<GoalsScreen> createState() => _GoalsScreenState();
}

class _GoalsScreenState extends State<GoalsScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadGoals();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadGoals() async {
    // Simulate loading goals
    await Future.delayed(const Duration(seconds: 1));
    
    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: Text(
          'Maqsadlar',
          style: TextStyle(
            fontSize: AppConfig.fontSizeXL.sp,
            fontWeight: FontWeight.bold,
            color: AppColors.onBackground,
          ),
        ),
        actions: [
          IconButton(
            onPressed: () {
              // TODO: Show statistics
              Helpers.showSuccessSnackBar(context, 'Statistics coming soon');
            },
            icon: const Icon(Icons.analytics, color: AppColors.onBackground),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.grey600,
          indicatorColor: AppColors.primary,
          labelStyle: TextStyle(
            fontSize: AppConfig.fontSizeM.sp,
            fontWeight: FontWeight.w600,
          ),
          unselectedLabelStyle: TextStyle(
            fontSize: AppConfig.fontSizeM.sp,
            fontWeight: FontWeight.w500,
          ),
          tabs: const [
            Tab(text: 'Faol'),
            Tab(text: 'Yakunlangan'),
            Tab(text: 'Barchasi'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildGoalsList(GoalStatus.active),
          _buildGoalsList(GoalStatus.completed),
          _buildGoalsList(GoalStatus.all),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Navigate to create goal
          Helpers.showSuccessSnackBar(context, 'Create goal coming soon');
        },
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildGoalsList(GoalStatus status) {
    return _isLoading
        ? const SkeletonGoalList()
        : RefreshIndicator(
            onRefresh: _loadGoals,
            color: AppColors.primary,
            child: _buildGoalItems(status),
          );
  }

  Widget _buildGoalItems(GoalStatus status) {
    final goals = _getMockGoals(status);

    if (goals.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.flag,
              size: 64.w,
              color: AppColors.grey400,
            ),
            SizedBox(height: AppConfig.spacingM.h),
            Text(
              'Maqsadlar topilmadi',
              style: TextStyle(
                fontSize: AppConfig.fontSizeL.sp,
                color: AppColors.grey600,
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: AppConfig.spacingS.h),
            Text(
              'Birinchi maqsadni yarating',
              style: TextStyle(
                fontSize: AppConfig.fontSizeM.sp,
                color: AppColors.grey500,
              ),
            ),
            SizedBox(height: AppConfig.spacingL.h),
            LoadingButton(
              onPressed: () {
                // TODO: Navigate to create goal
                Helpers.showSuccessSnackBar(context, 'Create goal coming soon');
              },
              text: 'Maqsad yaratish',
              icon: Icons.add,
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: EdgeInsets.all(AppConfig.spacingL.w),
      itemCount: goals.length,
      itemBuilder: (context, index) {
        final goal = goals[index];
        return Padding(
          padding: EdgeInsets.only(bottom: AppConfig.spacingL.h),
          child: GoalCard(
            goal: goal,
            onTap: () {
              // TODO: Navigate to goal detail
              Helpers.showSuccessSnackBar(context, 'Goal detail: ${goal.title}');
            },
          ),
        );
      },
    );
  }

  List<GoalItem> _getMockGoals(GoalStatus status) {
    final allGoals = [
      GoalItem(
        id: '1',
        title: 'Yangi kompyuter sotib olish',
        description: 'MacBook Pro 16" uchun pul yig\'ish',
        targetAmount: 25000000,
        currentAmount: 15000000,
        deadline: DateTime.now().add(const Duration(days: 90)),
        category: GoalCategory.financial,
        status: GoalStatus.active,
        icon: Icons.laptop,
        color: AppColors.primary,
      ),
      GoalItem(
        id: '2',
        title: 'Vazni kamaytirish',
        description: '10 kg vazn yo\'qotish',
        targetAmount: 10,
        currentAmount: 4,
        deadline: DateTime.now().add(const Duration(days: 60)),
        category: GoalCategory.health,
        status: GoalStatus.active,
        icon: Icons.fitness_center,
        color: AppColors.success,
      ),
      GoalItem(
        id: '3',
        title: 'Ingliz tilini o\'rganish',
        description: 'IELTS 7.0 ball olish',
        targetAmount: 100,
        currentAmount: 65,
        deadline: DateTime.now().add(const Duration(days: 180)),
        category: GoalCategory.education,
        status: GoalStatus.active,
        icon: Icons.language,
        color: AppColors.secondary,
      ),
      GoalItem(
        id: '4',
        title: 'Kitob o\'qish',
        description: 'Yiliga 24 ta kitob o\'qish',
        targetAmount: 24,
        currentAmount: 18,
        deadline: DateTime.now().add(const Duration(days: 120)),
        category: GoalCategory.personal,
        status: GoalStatus.active,
        icon: Icons.menu_book,
        color: AppColors.warning,
      ),
      GoalItem(
        id: '5',
        title: 'Sayohat qilish',
        description: 'Dubayga sayohat',
        targetAmount: 15000000,
        currentAmount: 15000000,
        deadline: DateTime.now().subtract(const Duration(days: 30)),
        category: GoalCategory.travel,
        status: GoalStatus.completed,
        icon: Icons.flight,
        color: AppColors.teal,
      ),
    ];

    switch (status) {
      case GoalStatus.active:
        return allGoals.where((goal) => goal.status == GoalStatus.active).toList();
      case GoalStatus.completed:
        return allGoals.where((goal) => goal.status == GoalStatus.completed).toList();
      case GoalStatus.all:
        return allGoals;
      default:
        return allGoals;
    }
  }
}

class GoalCard extends StatelessWidget {
  final GoalItem goal;
  final VoidCallback onTap;

  const GoalCard({
    super.key,
    required this.goal,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final progress = goal.currentAmount / goal.targetAmount;
    final daysLeft = goal.deadline?.difference(DateTime.now()).inDays ?? 0;

    return CustomCard(
      onTap: onTap,
      isClickable: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                width: 48.w,
                height: 48.w,
                decoration: BoxDecoration(
                  color: goal.color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppConfig.smallBorderRadius),
                ),
                child: Icon(
                  goal.icon,
                  color: goal.color,
                  size: 24.w,
                ),
              ),
              SizedBox(width: AppConfig.spacingM.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      goal.title,
                      style: TextStyle(
                        fontSize: AppConfig.fontSizeL.sp,
                        fontWeight: FontWeight.w600,
                        color: AppColors.onSurface,
                      ),
                    ),
                    SizedBox(height: AppConfig.spacingXS.h),
                    Text(
                      goal.description,
                      style: TextStyle(
                        fontSize: AppConfig.fontSizeS.sp,
                        color: AppColors.grey600,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: AppConfig.spacingXS.w,
                  vertical: 4.h,
                ),
                decoration: BoxDecoration(
                  color: goal.status == GoalStatus.completed
                      ? AppColors.success
                      : goal.color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10.r),
                ),
                child: Text(
                  goal.status == GoalStatus.completed ? 'Yakunlandi' : 'Faol',
                  style: TextStyle(
                    fontSize: AppConfig.fontSizeXS.sp,
                    color: goal.status == GoalStatus.completed
                        ? AppColors.white
                        : goal.color,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: AppConfig.spacingM.h),

          // Progress section
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Jarayon',
                      style: TextStyle(
                        fontSize: AppConfig.fontSizeS.sp,
                        color: AppColors.grey600,
                      ),
                    ),
                    SizedBox(height: AppConfig.spacingXS.h),
                    LinearProgressIndicator(
                      value: progress,
                      backgroundColor: AppColors.grey200,
                      valueColor: AlwaysStoppedAnimation<Color>(goal.color),
                      minHeight: 8.h,
                      borderRadius: BorderRadius.circular(4.r),
                    ),
                  ],
                ),
              ),
              SizedBox(width: AppConfig.spacingM.w),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '${(progress * 100).toInt()}%',
                    style: TextStyle(
                      fontSize: AppConfig.fontSizeL.sp,
                      fontWeight: FontWeight.bold,
                      color: goal.color,
                    ),
                  ),
                  Text(
                    _formatAmount(goal.currentAmount, goal.category),
                    style: TextStyle(
                      fontSize: AppConfig.fontSizeS.sp,
                      color: AppColors.grey600,
                    ),
                  ),
                ],
              ),
            ],
          ),
          SizedBox(height: AppConfig.spacingM.h),

          // Footer
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Maqsad: ${_formatAmount(goal.targetAmount, goal.category)}',
                style: TextStyle(
                  fontSize: AppConfig.fontSizeS.sp,
                  color: AppColors.grey600,
                ),
              ),
              if (goal.deadline != null)
                Text(
                  daysLeft > 0 ? '$daysLeft kun qoldi' : 'Muddati o\'tgan',
                  style: TextStyle(
                    fontSize: AppConfig.fontSizeS.sp,
                    color: daysLeft > 0 ? AppColors.grey600 : AppColors.error,
                    fontWeight: FontWeight.w500,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatAmount(double amount, GoalCategory category) {
    switch (category) {
      case GoalCategory.financial:
      case GoalCategory.travel:
        return '${amount.toInt().toString()} so\'m';
      case GoalCategory.health:
      case GoalCategory.education:
      case GoalCategory.personal:
        return '${amount.toInt()}';
      default:
        return amount.toInt().toString();
    }
  }
}

class GoalItem {
  final String id;
  final String title;
  final String description;
  final double targetAmount;
  final double currentAmount;
  final DateTime? deadline;
  final GoalCategory category;
  final GoalStatus status;
  final IconData icon;
  final Color color;

  const GoalItem({
    required this.id,
    required this.title,
    required this.description,
    required this.targetAmount,
    required this.currentAmount,
    this.deadline,
    required this.category,
    required this.status,
    required this.icon,
    required this.color,
  });
}

enum GoalCategory {
  financial,
  health,
  education,
  personal,
  travel,
}

enum GoalStatus {
  active,
  completed,
  paused,
  cancelled,
  all,
}

class SkeletonGoalList extends StatelessWidget {
  const SkeletonGoalList({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: EdgeInsets.all(AppConfig.spacingL.w),
      itemCount: 3,
      itemBuilder: (context, index) {
        return Padding(
          padding: EdgeInsets.only(bottom: AppConfig.spacingL.h),
          child: SkeletonCard(height: 160.h),
        );
      },
    );
  }
}

// Additional color constants
extension AppColorsExtension on AppColors {
  static const Color teal = Color(0xFF14B8A6);
}

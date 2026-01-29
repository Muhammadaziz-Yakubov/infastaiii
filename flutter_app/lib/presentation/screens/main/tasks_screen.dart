import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/config/app_config.dart';
import '../../../core/utils/helpers.dart';
import '../../widgets/common/custom_card.dart';
import '../../widgets/common/skeleton_loader.dart';
import '../../widgets/common/loading_button.dart';
import '../../widgets/tasks/task_filter_chip.dart';
import '../../widgets/tasks/task_list_item.dart';

class TasksScreen extends ConsumerStatefulWidget {
  const TasksScreen({super.key});

  @override
  ConsumerState<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends ConsumerState<TasksScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;
  late AnimationController _animationController;
  bool _isLoading = true;
  TaskFilter _selectedFilter = TaskFilter.all;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _animationController = AnimationController(
      duration: AppConfig.mediumAnimation,
      vsync: this,
    );
    _loadTasks();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadTasks() async {
    // Simulate loading tasks
    await Future.delayed(const Duration(seconds: 1));
    
    if (mounted) {
      setState(() => _isLoading = false);
      _animationController.forward();
    }
  }

  void _onFilterChanged(TaskFilter filter) {
    setState(() {
      _selectedFilter = filter;
    });
    _loadTasks(); // Reload tasks with new filter
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: Text(
          'Vazifalar',
          style: TextStyle(
            fontSize: AppConfig.fontSizeXL.sp,
            fontWeight: FontWeight.bold,
            color: AppColors.onBackground,
          ),
        ),
        actions: [
          IconButton(
            onPressed: () {
              // TODO: Show search
            },
            icon: const Icon(Icons.search, color: AppColors.onBackground),
          ),
          IconButton(
            onPressed: () {
              // TODO: Show filter options
            },
            icon: const Icon(Icons.filter_list, color: AppColors.onBackground),
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
            Tab(text: 'Barchasi'),
            Tab(text: 'Jarayonda'),
            Tab(text: 'Bajarildi'),
            Tab(text: 'Kechikkan'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildTasksList(TaskStatus.all),
          _buildTasksList(TaskStatus.inProgress),
          _buildTasksList(TaskStatus.completed),
          _buildTasksList(TaskStatus.overdue),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Navigate to create task
          Helpers.showSuccessSnackBar(context, 'Create task coming soon');
        },
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildTasksList(TaskStatus status) {
    return Column(
      children: [
        // Filter chips
        Container(
          height: 60.h,
          padding: EdgeInsets.symmetric(horizontal: AppConfig.spacingL.w),
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: [
              TaskFilterChip(
                filter: TaskFilter.all,
                label: 'Barchasi',
                isSelected: _selectedFilter == TaskFilter.all,
                onTap: () => _onFilterChanged(TaskFilter.all),
              ),
              SizedBox(width: AppConfig.spacingS.w),
              TaskFilterChip(
                filter: TaskFilter.today,
                label: 'Bugun',
                isSelected: _selectedFilter == TaskFilter.today,
                onTap: () => _onFilterChanged(TaskFilter.today),
              ),
              SizedBox(width: AppConfig.spacingS.w),
              TaskFilterChip(
                filter: TaskFilter.week,
                label: 'Hafta',
                isSelected: _selectedFilter == TaskFilter.week,
                onTap: () => _onFilterChanged(TaskFilter.week),
              ),
              SizedBox(width: AppConfig.spacingS.w),
              TaskFilterChip(
                filter: TaskFilter.highPriority,
                label: 'Muhim',
                isSelected: _selectedFilter == TaskFilter.highPriority,
                onTap: () => _onFilterChanged(TaskFilter.highPriority),
              ),
            ],
          ),
        ),
        SizedBox(height: AppConfig.spacingS.h),
        
        // Tasks list
        Expanded(
          child: _isLoading
              ? const SkeletonTaskList()
              : RefreshIndicator(
                  onRefresh: _loadTasks,
                  color: AppColors.primary,
                  child: _buildTaskItems(status),
                ),
        ),
      ],
    );
  }

  Widget _buildTaskItems(TaskStatus status) {
    final tasks = _getMockTasks(status);

    if (tasks.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.task_alt,
              size: 64.w,
              color: AppColors.grey400,
            ),
            SizedBox(height: AppConfig.spacingM.h),
            Text(
              'Vazifalar topilmadi',
              style: TextStyle(
                fontSize: AppConfig.fontSizeL.sp,
                color: AppColors.grey600,
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: AppConfig.spacingS.h),
            Text(
              'Birinchi vazifani yarating',
              style: TextStyle(
                fontSize: AppConfig.fontSizeM.sp,
                color: AppColors.grey500,
              ),
            ),
            SizedBox(height: AppConfig.spacingL.h),
            LoadingButton(
              onPressed: () {
                // TODO: Navigate to create task
                Helpers.showSuccessSnackBar(context, 'Create task coming soon');
              },
              text: 'Vazifa yaratish',
              icon: Icons.add,
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: EdgeInsets.symmetric(horizontal: AppConfig.spacingL.w),
      itemCount: tasks.length,
      itemBuilder: (context, index) {
        final task = tasks[index];
        return Padding(
          padding: EdgeInsets.only(bottom: AppConfig.spacingM.h),
          child: TaskListItem(
            task: task,
            onTap: () {
              // TODO: Navigate to task detail
              Helpers.showSuccessSnackBar(context, 'Task detail: ${task.title}');
            },
            onToggle: () {
              // TODO: Toggle task completion
              Helpers.hapticFeedback();
            },
          ),
        );
      },
    );
  }

  List<TaskItem> _getMockTasks(TaskStatus status) {
    final allTasks = [
      TaskItem(
        id: '1',
        title: 'InFast AI mobil ilovasini ishga tushirish',
        description: 'Flutter ilovasini backend bilan integratsiya qilish',
        priority: TaskPriority.high,
        status: TaskStatus.inProgress,
        deadline: DateTime.now().add(const Duration(hours: 3)),
        category: 'Ish',
        isCompleted: false,
      ),
      TaskItem(
        id: '2',
        title: 'Kunlik rejalarni tekshirish',
        description: 'Bugungi vazifalarning bajarilishini nazorat qilish',
        priority: TaskPriority.medium,
        status: TaskStatus.completed,
        category: 'Shaxsiy',
        isCompleted: true,
      ),
      TaskItem(
        id: '3',
        title: 'Moliyaviy hisobot tayyorlash',
        description: 'Oylik xarajatlar va daromadlar jadvalini tuzish',
        priority: TaskPriority.low,
        status: TaskStatus.pending,
        deadline: DateTime.now().add(const Duration(days: 1)),
        category: 'Moliya',
        isCompleted: false,
      ),
      TaskItem(
        id: '4',
        title: 'Telegram botni sozlash',
        description: 'InFast AI bot konfiguratsiyasini tugatish',
        priority: TaskPriority.high,
        status: TaskStatus.overdue,
        deadline: DateTime.now().subtract(const Duration(hours: 2)),
        category: 'Ish',
        isCompleted: false,
      ),
      TaskItem(
        id: '5',
        title: 'Sport mashqlari',
        description: 'Kechki 30 daqiqa yugurish',
        priority: TaskPriority.medium,
        status: TaskStatus.pending,
        category: 'Salomatlik',
        isCompleted: false,
      ),
    ];

    switch (status) {
      case TaskStatus.all:
        return allTasks;
      case TaskStatus.inProgress:
        return allTasks.where((task) => task.status == TaskStatus.inProgress).toList();
      case TaskStatus.completed:
        return allTasks.where((task) => task.status == TaskStatus.completed).toList();
      case TaskStatus.overdue:
        return allTasks.where((task) => task.status == TaskStatus.overdue).toList();
      default:
        return allTasks;
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
  final bool isCompleted;

  const TaskItem({
    required this.id,
    required this.title,
    this.description,
    this.priority = TaskPriority.medium,
    this.status = TaskStatus.pending,
    this.deadline,
    this.category,
    this.isCompleted = false,
  });
}

enum TaskPriority {
  high,
  medium,
  low,
}

enum TaskStatus {
  all,
  pending,
  inProgress,
  completed,
  overdue,
}

enum TaskFilter {
  all,
  today,
  week,
  highPriority,
}

class SkeletonTaskList extends StatelessWidget {
  const SkeletonTaskList({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: EdgeInsets.symmetric(horizontal: AppConfig.spacingL.w),
      itemCount: 5,
      itemBuilder: (context, index) {
        return Padding(
          padding: EdgeInsets.only(bottom: AppConfig.spacingM.h),
          child: SkeletonCard(height: 80.h),
        );
      },
    );
  }
}

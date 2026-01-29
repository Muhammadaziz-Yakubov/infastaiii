import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../screens/auth/landing_screen.dart';
import '../screens/auth/phone_input_screen.dart';
import '../screens/auth/otp_verification_screen.dart';
import '../screens/auth/password_creation_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/main/dashboard_screen.dart';
import '../screens/main/tasks_screen.dart';
import '../screens/main/goals_screen.dart';
import '../screens/main/finance_screen.dart';
import '../screens/main/challenges_screen.dart';
import '../screens/main/profile_screen.dart';
import '../screens/main/settings_screen.dart';
import '../screens/splash_screen.dart';

// App router configuration
final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);
  
  return GoRouter(
    initialLocation: '/splash',
    debugLogDiagnostics: true,
    
    // Redirect logic
    redirect: (context, state) {
      final isCheckingAuth = authState.isCheckingAuth;
      final isAuthenticated = authState.isAuthenticated;
      
      // If checking auth status, show splash
      if (isCheckingAuth) {
        return '/splash';
      }
      
      // If not authenticated and not on auth pages, redirect to landing
      if (!isAuthenticated && !state.location.path.startsWith('/auth')) {
        return '/auth/landing';
      }
      
      // If authenticated and on auth pages, redirect to dashboard
      if (isAuthenticated && state.location.path.startsWith('/auth')) {
        return '/dashboard';
      }
      
      // If authenticated and on splash, redirect to dashboard
      if (isAuthenticated && state.location.path == '/splash') {
        return '/dashboard';
      }
      
      // Otherwise, no redirect
      return null;
    },
    
    // Routes
    routes: [
      // Splash screen
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      
      // Authentication routes
      GoRoute(
        path: '/auth',
        name: 'auth',
        builder: (context, state) => const LandingScreen(),
        routes: [
          GoRoute(
            path: '/landing',
            name: 'landing',
            builder: (context, state) => const LandingScreen(),
          ),
          GoRoute(
            path: '/phone',
            name: 'phone-input',
            builder: (context, state) => const PhoneInputScreen(),
          ),
          GoRoute(
            path: '/otp',
            name: 'otp-verification',
            builder: (context, state) {
              final phone = state.extra as String? ?? '';
              return OTPVerificationScreen(phone: phone);
            },
          ),
          GoRoute(
            path: '/create-password',
            name: 'create-password',
            builder: (context, state) {
              final phone = state.extra as String? ?? '';
              return PasswordCreationScreen(phone: phone);
            },
          ),
          GoRoute(
            path: '/login',
            name: 'login',
            builder: (context, state) => const LoginScreen(),
          ),
        ],
      ),
      
      // Main app routes (authenticated)
      GoRoute(
        path: '/',
        name: 'home',
        builder: (context, state) => const DashboardScreen(),
        routes: [
          GoRoute(
            path: '/dashboard',
            name: 'dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/tasks',
            name: 'tasks',
            builder: (context, state) => const TasksScreen(),
            routes: [
              GoRoute(
                path: '/:taskId',
                name: 'task-detail',
                builder: (context, state) {
                  final taskId = state.pathParameters['taskId']!;
                  return TaskDetailScreen(taskId: taskId);
                },
              ),
              GoRoute(
                path: '/create',
                name: 'create-task',
                builder: (context, state) => const CreateTaskScreen(),
              ),
              GoRoute(
                path: '/edit/:taskId',
                name: 'edit-task',
                builder: (context, state) {
                  final taskId = state.pathParameters['taskId']!;
                  return EditTaskScreen(taskId: taskId);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/goals',
            name: 'goals',
            builder: (context, state) => const GoalsScreen(),
            routes: [
              GoRoute(
                path: '/:goalId',
                name: 'goal-detail',
                builder: (context, state) {
                  final goalId = state.pathParameters['goalId']!;
                  return GoalDetailScreen(goalId: goalId);
                },
              ),
              GoRoute(
                path: '/create',
                name: 'create-goal',
                builder: (context, state) => const CreateGoalScreen(),
              ),
              GoRoute(
                path: '/edit/:goalId',
                name: 'edit-goal',
                builder: (context, state) {
                  final goalId = state.pathParameters['goalId']!;
                  return EditGoalScreen(goalId: goalId);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/finance',
            name: 'finance',
            builder: (context, state) => const FinanceScreen(),
            routes: [
              GoRoute(
                path: '/transactions',
                name: 'transactions',
                builder: (context, state) => const TransactionsScreen(),
              ),
              GoRoute(
                path: '/transactions/:transactionId',
                name: 'transaction-detail',
                builder: (context, state) {
                  final transactionId = state.pathParameters['transactionId']!;
                  return TransactionDetailScreen(transactionId: transactionId);
                },
              ),
              GoRoute(
                path: '/add-transaction',
                name: 'add-transaction',
                builder: (context, state) => const AddTransactionScreen(),
              ),
              GoRoute(
                path: '/categories',
                name: 'categories',
                builder: (context, state) => const CategoriesScreen(),
              ),
              GoRoute(
                path: '/statistics',
                name: 'finance-statistics',
                builder: (context, state) => const FinanceStatisticsScreen(),
              ),
            ],
          ),
          GoRoute(
            path: '/challenges',
            name: 'challenges',
            builder: (context, state) => const ChallengesScreen(),
            routes: [
              GoRoute(
                path: '/:challengeId',
                name: 'challenge-detail',
                builder: (context, state) {
                  final challengeId = state.pathParameters['challengeId']!;
                  return ChallengeDetailScreen(challengeId: challengeId);
                },
              ),
              GoRoute(
                path: '/create',
                name: 'create-challenge',
                builder: (context, state) => const CreateChallengeScreen(),
              ),
              GoRoute(
                path: '/join',
                name: 'join-challenge',
                builder: (context, state) => const JoinChallengeScreen(),
              ),
            ],
          ),
          GoRoute(
            path: '/profile',
            name: 'profile',
            builder: (context, state) => const ProfileScreen(),
            routes: [
              GoRoute(
                path: '/edit',
                name: 'edit-profile',
                builder: (context, state) => const EditProfileScreen(),
              ),
              GoRoute(
                path: '/settings',
                name: 'settings',
                builder: (context, state) => const SettingsScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
    
    // Error handling
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              'Xatolik yuz berdi',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              state.error?.toString() ?? 'Noma\'lum xatolik',
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go('/'),
              child: const Text('Bosh sahifaga qaytish'),
            ),
          ],
        ),
      ),
    ),
  );
});

// Navigation helper class
class NavigationHelper {
  static void navigateToLanding(BuildContext context) {
    context.go('/auth/landing');
  }
  
  static void navigateToPhoneInput(BuildContext context) {
    context.go('/auth/phone');
  }
  
  static void navigateToOTPVerification(BuildContext context, String phone) {
    context.go('/auth/otp', extra: phone);
  }
  
  static void navigateToPasswordCreation(BuildContext context, String phone) {
    context.go('/auth/create-password', extra: phone);
  }
  
  static void navigateToLogin(BuildContext context) {
    context.go('/auth/login');
  }
  
  static void navigateToDashboard(BuildContext context) {
    context.go('/dashboard');
  }
  
  static void navigateToTasks(BuildContext context) {
    context.go('/tasks');
  }
  
  static void navigateToTaskDetail(BuildContext context, String taskId) {
    context.go('/tasks/$taskId');
  }
  
  static void navigateToCreateTask(BuildContext context) {
    context.go('/tasks/create');
  }
  
  static void navigateToEditTask(BuildContext context, String taskId) {
    context.go('/tasks/edit/$taskId');
  }
  
  static void navigateToGoals(BuildContext context) {
    context.go('/goals');
  }
  
  static void navigateToGoalDetail(BuildContext context, String goalId) {
    context.go('/goals/$goalId');
  }
  
  static void navigateToCreateGoal(BuildContext context) {
    context.go('/goals/create');
  }
  
  static void navigateToFinance(BuildContext context) {
    context.go('/finance');
  }
  
  static void navigateToTransactions(BuildContext context) {
    context.go('/finance/transactions');
  }
  
  static void navigateToChallenges(BuildContext context) {
    context.go('/challenges');
  }
  
  static void navigateToProfile(BuildContext context) {
    context.go('/profile');
  }
  
  static void navigateToSettings(BuildContext context) {
    context.go('/profile/settings');
  }
  
  static void navigateAndReplace(BuildContext context, String path) {
    context.go(path);
  }
  
  static void pop(BuildContext context) {
    context.pop();
  }
  
  static void popUntil(BuildContext context, String path) {
    while (context.canPop() && context.router.location != path) {
      context.pop();
    }
  }
}

// Placeholder screens (to be implemented)
class TaskDetailScreen extends StatelessWidget {
  final String taskId;
  
  const TaskDetailScreen({super.key, required this.taskId});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Task $taskId')),
      body: Center(child: Text('Task Detail: $taskId')),
    );
  }
}

class CreateTaskScreen extends StatelessWidget {
  const CreateTaskScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AppBar(title: Text('Create Task')),
      body: Center(child: Text('Create Task')),
    );
  }
}

class EditTaskScreen extends StatelessWidget {
  final String taskId;
  
  const EditTaskScreen({super.key, required this.taskId});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Edit Task $taskId')),
      body: Center(child: Text('Edit Task: $taskId')),
    );
  }
}

class GoalDetailScreen extends StatelessWidget {
  final String goalId;
  
  const GoalDetailScreen({super.key, required this.goalId});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Goal $goalId')),
      body: Center(child: Text('Goal Detail: $goalId')),
    );
  }
}

class CreateGoalScreen extends StatelessWidget {
  const CreateGoalScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AppBar(title: Text('Create Goal')),
      body: Center(child: Text('Create Goal')),
    );
  }
}

class EditGoalScreen extends StatelessWidget {
  final String goalId;
  
  const EditGoalScreen({super.key, required this.goalId});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Edit Goal $goalId')),
      body: Center(child: Text('Edit Goal: $goalId')),
    );
  }
}

class TransactionsScreen extends StatelessWidget {
  const TransactionsScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AppBar(title: Text('Transactions')),
      body: Center(child: Text('Transactions')),
    );
  }
}

class TransactionDetailScreen extends StatelessWidget {
  final String transactionId;
  
  const TransactionDetailScreen({super.key, required this.transactionId});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Transaction $transactionId')),
      body: Center(child: Text('Transaction Detail: $transactionId')),
    );
  }
}

class AddTransactionScreen extends StatelessWidget {
  const AddTransactionScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AppBar(title: Text('Add Transaction')),
      body: Center(child: Text('Add Transaction')),
    );
  }
}

class CategoriesScreen extends StatelessWidget {
  const CategoriesScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AppBar(title: Text('Categories')),
      body: Center(child: Text('Categories')),
    );
  }
}

class FinanceStatisticsScreen extends StatelessWidget {
  const FinanceStatisticsScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AppBar(title: Text('Finance Statistics')),
      body: Center(child: Text('Finance Statistics')),
    );
  }
}

class ChallengeDetailScreen extends StatelessWidget {
  final String challengeId;
  
  const ChallengeDetailScreen({super.key, required this.challengeId});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Challenge $challengeId')),
      body: Center(child: Text('Challenge Detail: $challengeId')),
    );
  }
}

class CreateChallengeScreen extends StatelessWidget {
  const CreateChallengeScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AppBar(title: Text('Create Challenge')),
      body: Center(child: Text('Create Challenge')),
    );
  }
}

class JoinChallengeScreen extends StatelessWidget {
  const JoinChallengeScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AppBar(title: Text('Join Challenge')),
      body: Center(child: Text('Join Challenge')),
    );
  }
}

class EditProfileScreen extends StatelessWidget {
  const EditProfileScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AppBar(title: Text('Edit Profile')),
      body: Center(child: Text('Edit Profile')),
    );
  }
}

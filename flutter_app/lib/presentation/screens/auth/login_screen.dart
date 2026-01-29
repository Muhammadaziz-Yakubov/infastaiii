import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/config/app_config.dart';
import '../../../core/utils/helpers.dart';
import '../../../core/utils/validators.dart';
import '../../providers/auth_provider.dart';
import '../../routes/app_router.dart';
import '../../widgets/common/custom_text_field.dart';
import '../../widgets/common/loading_button.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _isEmailLogin = true;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: AppConfig.mediumAnimation,
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _animationController.forward();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      bool success;

      if (_isEmailLogin) {
        success = await ref.read(authProvider.notifier).loginWithEmail(
          _emailController.text.trim(),
          _passwordController.text.trim(),
        );
      } else {
        success = await ref.read(authProvider.notifier).loginWithPhone(
          _phoneController.text.trim(),
          _passwordController.text.trim(),
        );
      }

      if (success && mounted) {
        NavigationHelper.navigateToDashboard(context);
      }
    } catch (e) {
      if (mounted) {
        Helpers.showErrorSnackBar(context, e.toString());
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _toggleLoginType() {
    setState(() {
      _isEmailLogin = !_isEmailLogin;
      _formKey.currentState?.reset();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Navigator.of(context).pop(),
          icon: const Icon(Icons.arrow_back, color: AppColors.onBackground),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(AppConfig.spacingL.w),
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Text(
                    'Xush kelibsiz!',
                    style: TextStyle(
                      fontSize: AppConfig.fontSizeXXXL.sp,
                      fontWeight: FontWeight.bold,
                      color: AppColors.onBackground,
                    ),
                  ),
                  SizedBox(height: AppConfig.spacingM.h),
                  Text(
                    'InFast AI ga kirish uchun ma\'lumotlaringizni kiriting.',
                    style: TextStyle(
                      fontSize: AppConfig.fontSizeM.sp,
                      color: AppColors.grey600,
                      height: 1.4,
                    ),
                  ),
                  SizedBox(height: AppConfig.spacingXL.h),

                  // Login type toggle
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(AppConfig.borderRadius),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: _toggleLoginType,
                            child: Container(
                              padding: EdgeInsets.symmetric(vertical: AppConfig.spacingM.h),
                              decoration: BoxDecoration(
                                color: _isEmailLogin ? AppColors.primary : Colors.transparent,
                                borderRadius: BorderRadius.circular(AppConfig.borderRadius),
                              ),
                              child: Text(
                                'Email',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: AppConfig.fontSizeM.sp,
                                  fontWeight: FontWeight.w600,
                                  color: _isEmailLogin ? AppColors.white : AppColors.grey600,
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: _toggleLoginType,
                            child: Container(
                              padding: EdgeInsets.symmetric(vertical: AppConfig.spacingM.h),
                              decoration: BoxDecoration(
                                color: !_isEmailLogin ? AppColors.primary : Colors.transparent,
                                borderRadius: BorderRadius.circular(AppConfig.borderRadius),
                              ),
                              child: Text(
                                'Telefon',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: AppConfig.fontSizeM.sp,
                                  fontWeight: FontWeight.w600,
                                  color: !_isEmailLogin ? AppColors.white : AppColors.grey600,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: AppConfig.spacingXL.h),

                  // Email/Phone field
                  if (_isEmailLogin)
                    CustomTextField(
                      controller: _emailController,
                      labelText: 'Email',
                      hintText: 'email@example.com',
                      keyboardType: TextInputType.emailAddress,
                      prefixIcon: Icons.email,
                      validator: Validators.validateEmail,
                    )
                  else
                    PhoneTextField(
                      controller: _phoneController,
                      labelText: 'Telefon raqam',
                      validator: Validators.validatePhone,
                    ),
                  SizedBox(height: AppConfig.spacingL.h),

                  // Password field
                  CustomTextField(
                    controller: _passwordController,
                    labelText: 'Parol',
                    hintText: 'Parolingizni kiriting',
                    obscureText: _obscurePassword,
                    prefixIcon: Icons.lock,
                    validator: Validators.validatePassword,
                    suffix: IconButton(
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                      icon: Icon(
                        _obscurePassword ? Icons.visibility_off : Icons.visibility,
                        color: AppColors.grey400,
                      ),
                    ),
                  ),
                  SizedBox(height: AppConfig.spacingM.h),

                  // Forgot password
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () {
                        // TODO: Implement forgot password
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Forgot password coming soon')),
                        );
                      },
                      child: Text(
                        'Parolni unutdingiz?',
                        style: TextStyle(
                          fontSize: AppConfig.fontSizeS.sp,
                          color: AppColors.primary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(height: AppConfig.spacingXL.h),

                  // Error message
                  if (authState.error != null)
                    Container(
                      padding: EdgeInsets.all(AppConfig.spacingM.w),
                      decoration: BoxDecoration(
                        color: AppColors.errorSurface,
                        borderRadius: BorderRadius.circular(AppConfig.borderRadius),
                        border: Border.all(color: AppColors.error.withOpacity(0.3)),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.error_outline,
                            color: AppColors.error,
                            size: 20.w,
                          ),
                          SizedBox(width: AppConfig.spacingS.w),
                          Expanded(
                            child: Text(
                              authState.error!,
                              style: TextStyle(
                                fontSize: AppConfig.fontSizeS.sp,
                                color: AppColors.error,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  SizedBox(height: AppConfig.spacingL.h),

                  // Login button
                  LoadingButton(
                    onPressed: _isLoading || authState.isLoading ? null : _login,
                    isLoading: _isLoading || authState.isLoading,
                    text: 'Kirish',
                    icon: Icons.login,
                  ),
                  SizedBox(height: AppConfig.spacingL.h),

                  // Sign up link
                  Center(
                    child: Text.rich(
                      TextSpan(
                        text: 'Hisobingiz yo\'qmi? ',
                        style: TextStyle(
                          fontSize: AppConfig.fontSizeS.sp,
                          color: AppColors.grey600,
                        ),
                        children: [
                          WidgetSpan(
                            child: GestureDetector(
                              onTap: () {
                                NavigationHelper.navigateToPhoneInput(context);
                              },
                              child: Text(
                                'Ro\'yxatdan o\'tish',
                                style: TextStyle(
                                  fontSize: AppConfig.fontSizeS.sp,
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

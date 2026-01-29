import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/config/app_config.dart';
import '../../../core/utils/helpers.dart';
import '../../../core/utils/validators.dart';
import '../../providers/auth_provider.dart';
import '../../routes/app_router.dart';
import '../../widgets/common/custom_text_field.dart';
import '../../widgets/common/loading_button.dart';

class PasswordCreationScreen extends ConsumerStatefulWidget {
  final String phone;

  const PasswordCreationScreen({
    super.key,
    required this.phone,
  });

  @override
  ConsumerState<PasswordCreationScreen> createState() => _PasswordCreationScreenState();
}

class _PasswordCreationScreenState extends ConsumerState<PasswordCreationScreen>
    with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  String? _avatarPath;

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
    _firstNameController.dispose();
    _lastNameController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 512,
        maxHeight: 512,
        imageQuality: 80,
      );

      if (image != null) {
        setState(() {
          _avatarPath = image.path;
        });
      }
    } catch (e) {
      if (mounted) {
        Helpers.showErrorSnackBar(context, 'Rasm tanlashda xatolik: $e');
      }
    }
  }

  Future<void> _createAccount() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final success = await ref.read(authProvider.notifier).createPassword(
        phone: widget.phone,
        password: _passwordController.text.trim(),
        firstName: _firstNameController.text.trim(),
        lastName: _lastNameController.text.trim(),
        avatar: _avatarPath,
      );

      if (success) {
        if (mounted) {
          NavigationHelper.navigateToDashboard(context);
        }
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
                    'Hisob yarating',
                    style: TextStyle(
                      fontSize: AppConfig.fontSizeXXXL.sp,
                      fontWeight: FontWeight.bold,
                      color: AppColors.onBackground,
                    ),
                  ),
                  SizedBox(height: AppConfig.spacingM.h),
                  Text(
                    'InFast AI dan to\'liq foydalanish uchun hisob ma\'lumotlarini kiriting.',
                    style: TextStyle(
                      fontSize: AppConfig.fontSizeM.sp,
                      color: AppColors.grey600,
                      height: 1.4,
                    ),
                  ),
                  SizedBox(height: AppConfig.spacingXL.h),

                  // Avatar
                  Center(
                    child: GestureDetector(
                      onTap: _pickImage,
                      child: Container(
                        width: 100.w,
                        height: 100.w,
                        decoration: BoxDecoration(
                          color: AppColors.primarySurface,
                          borderRadius: BorderRadius.circular(50.r),
                          border: Border.all(
                            color: AppColors.primary.withOpacity(0.3),
                            width: 2,
                          ),
                        ),
                        child: _avatarPath != null
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(50.r),
                                child: Image.network(
                                  _avatarPath!,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return _buildAvatarPlaceholder();
                                  },
                                ),
                              )
                            : _buildAvatarPlaceholder(),
                      ),
                    ),
                  ),
                  SizedBox(height: AppConfig.spacingM.h),
                  Center(
                    child: TextButton(
                      onPressed: _pickImage,
                      child: Text(
                        'Avatar tanlash',
                        style: TextStyle(
                          fontSize: AppConfig.fontSizeS.sp,
                          color: AppColors.primary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(height: AppConfig.spacingL.h),

                  // Name fields
                  Row(
                    children: [
                      Expanded(
                        child: CustomTextField(
                          controller: _firstNameController,
                          labelText: 'Ism',
                          hintText: 'Ismingiz',
                          textCapitalization: TextCapitalization.words,
                          validator: (value) => Validators.validateName(value),
                        ),
                      ),
                      SizedBox(width: AppConfig.spacingM.w),
                      Expanded(
                        child: CustomTextField(
                          controller: _lastNameController,
                          labelText: 'Familiya',
                          hintText: 'Familiyangiz',
                          textCapitalization: TextCapitalization.words,
                          validator: (value) => Validators.validateName(value, fieldName: 'Familiya'),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: AppConfig.spacingL.h),

                  // Password field
                  CustomTextField(
                    controller: _passwordController,
                    labelText: 'Parol',
                    hintText: 'Kamida 6 ta belgi',
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
                  SizedBox(height: AppConfig.spacingL.h),

                  // Confirm password field
                  CustomTextField(
                    controller: _confirmPasswordController,
                    labelText: 'Parolni tasdiqlang',
                    hintText: 'Parolni qayta kiriting',
                    obscureText: _obscureConfirmPassword,
                    prefixIcon: Icons.lock_outline,
                    validator: (value) {
                      if (value != _passwordController.text) {
                        return 'Parollar mos kelmadi';
                      }
                      return Validators.validatePassword(value);
                    },
                    suffix: IconButton(
                      onPressed: () {
                        setState(() {
                          _obscureConfirmPassword = !_obscureConfirmPassword;
                        });
                      },
                      icon: Icon(
                        _obscureConfirmPassword ? Icons.visibility_off : Icons.visibility,
                        color: AppColors.grey400,
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

                  // Create account button
                  LoadingButton(
                    onPressed: _isLoading || authState.isLoading ? null : _createAccount,
                    isLoading: _isLoading || authState.isLoading,
                    text: 'Hisob yaratish',
                    icon: Icons.person_add,
                  ),
                  SizedBox(height: AppConfig.spacingM.h),

                  // Terms and conditions
                  Center(
                    child: Text.rich(
                      TextSpan(
                        text: 'Hisob yaratish orqali siz ',
                        style: TextStyle(
                          fontSize: AppConfig.fontSizeS.sp,
                          color: AppColors.grey600,
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
                                  fontSize: AppConfig.fontSizeS.sp,
                                  color: AppColors.primary,
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ),
                          ),
                          const TextSpan(text: ' ga rozilik bildirasiz'),
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

  Widget _buildAvatarPlaceholder() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.camera_alt,
          size: 32.w,
          color: AppColors.grey400,
        ),
        SizedBox(height: AppConfig.spacingXS.h),
        Text(
          'Avatar',
          style: TextStyle(
            fontSize: AppConfig.fontSizeS.sp,
            color: AppColors.grey400,
          ),
        ),
      ],
    );
  }
}

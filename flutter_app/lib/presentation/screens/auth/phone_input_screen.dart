import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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

class PhoneInputScreen extends ConsumerStatefulWidget {
  const PhoneInputScreen({super.key});

  @override
  ConsumerState<PhoneInputScreen> createState() => _PhoneInputScreenState();
}

class _PhoneInputScreenState extends ConsumerState<PhoneInputScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _checkPhone() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final phone = _phoneController.text.trim();
      final exists = await ref.read(authProvider.notifier).checkPhone(phone);

      if (exists) {
        // Phone exists, navigate to login
        NavigationHelper.navigateToLogin(context);
      } else {
        // New phone, send OTP and navigate to verification
        final otpSent = await ref.read(authProvider.notifier).sendOTP(phone);
        if (otpSent) {
          NavigationHelper.navigateToOTPVerification(context, phone);
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
        child: Padding(
          padding: EdgeInsets.all(AppConfig.spacingL.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Expanded(
                flex: 2,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Telefon raqamingizni kiriting',
                      style: TextStyle(
                        fontSize: AppConfig.fontSizeXXXL.sp,
                        fontWeight: FontWeight.bold,
                        color: AppColors.onBackground,
                      ),
                    ),
                    SizedBox(height: AppConfig.spacingM.h),
                    Text(
                      'InFast AI ga kirish uchun telefon raqamingizni kiriting. '
                      'Biz sizga 6 xonali tasdiqlash kodini yuboramiz.',
                      style: TextStyle(
                        fontSize: AppConfig.fontSizeM.sp,
                        color: AppColors.grey600,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),

              // Form
              Expanded(
                flex: 3,
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      // Phone input
                      CustomTextField(
                        controller: _phoneController,
                        labelText: 'Telefon raqam',
                        hintText: AppConfig.phoneHint,
                        keyboardType: TextInputType.phone,
                        prefixIcon: const Icon(Icons.phone),
                        inputFormatters: [
                          FilteringTextInputFormatter.allow(RegExp(r'[+\d]')),
                          LengthLimitingTextInputFormatter(13),
                        ],
                        validator: Validators.validatePhone,
                        onChanged: (value) {
                          // Clear any previous errors
                          if (authState.error != null) {
                            ref.read(authProvider.notifier).clearError();
                          }
                        },
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
                    ],
                  ),
                ),
              ),

              // Bottom section
              Column(
                children: [
                  // Continue button
                  LoadingButton(
                    onPressed: _isLoading || authState.isLoading ? null : _checkPhone,
                    isLoading: _isLoading || authState.isLoading,
                    text: 'Davom etish',
                    icon: Icons.arrow_forward,
                  ),
                  
                  SizedBox(height: AppConfig.spacingM.h),
                  
                  // Help text
                  Center(
                    child: Text.rich(
                      TextSpan(
                        text: 'Raqamingiz xavfsiz qoladi. ',
                        style: TextStyle(
                          fontSize: AppConfig.fontSizeS.sp,
                          color: AppColors.grey600,
                        ),
                        children: [
                          WidgetSpan(
                            child: GestureDetector(
                              onTap: () {
                                // Show privacy policy
                              },
                              child: Text(
                                'Batafsil',
                                style: TextStyle(
                                  fontSize: AppConfig.fontSizeS.sp,
                                  color: AppColors.primary,
                                  decoration: TextDecoration.underline,
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
            ],
          ),
        ),
      ),
    );
  }
}

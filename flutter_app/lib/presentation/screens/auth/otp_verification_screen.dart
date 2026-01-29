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

class OTPVerificationScreen extends ConsumerStatefulWidget {
  final String phone;

  const OTPVerificationScreen({
    super.key,
    required this.phone,
  });

  @override
  ConsumerState<OTPVerificationScreen> createState() => _OTPVerificationScreenState();
}

class _OTPVerificationScreenState extends ConsumerState<OTPVerificationScreen>
    with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _otpController = TextEditingController();
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  bool _isLoading = false;
  bool _canResend = false;
  int _resendCountdown = 0;

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
    _startResendCountdown();
  }

  @override
  void dispose() {
    _otpController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  void _startResendCountdown() {
    setState(() {
      _canResend = false;
      _resendCountdown = AppConfig.otpResendDelay.inSeconds;
    });

    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) {
        setState(() {
          _resendCountdown--;
        });
      }
      return _resendCountdown > 0;
    }).then((_) {
      if (mounted) {
        setState(() {
          _canResend = true;
        });
      }
    });
  }

  Future<void> _verifyOTP() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final success = await ref.read(authProvider.notifier).verifyOTP(
        widget.phone,
        _otpController.text.trim(),
      );

      if (success) {
        if (mounted) {
          NavigationHelper.navigateToPasswordCreation(context, widget.phone);
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

  Future<void> _resendOTP() async {
    if (!_canResend) return;

    setState(() => _isLoading = true);

    try {
      final success = await ref.read(authProvider.notifier).sendOTP(widget.phone);

      if (success) {
        if (mounted) {
          Helpers.showSuccessSnackBar(context, 'Kod qayta yuborildi');
          _startResendCountdown();
          _otpController.clear();
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
          child: FadeTransition(
            opacity: _fadeAnimation,
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
                        'Tasdiqlash kodini kiriting',
                        style: TextStyle(
                          fontSize: AppConfig.fontSizeXXXL.sp,
                          fontWeight: FontWeight.bold,
                          color: AppColors.onBackground,
                        ),
                      ),
                      SizedBox(height: AppConfig.spacingM.h),
                      Text(
                        'Biz ${widget.phone.formatDisplayPhone()} raqamiga ${AppConfig.otpLength} xonali kod yubordik. '
                        'Kodni kiriting va davom eting.',
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
                        // OTP Input
                        OTPTextField(
                          controller: _otpController,
                          validator: Validators.validateOTP,
                          onCompleted: (value) {
                            // Auto-submit when OTP is complete
                            _verifyOTP();
                          },
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
                    // Verify button
                    LoadingButton(
                      onPressed: _isLoading || authState.isLoading ? null : _verifyOTP,
                      isLoading: _isLoading || authState.isLoading,
                      text: 'Tasdiqlash',
                      icon: Icons.check_circle,
                    ),
                    
                    SizedBox(height: AppConfig.spacingM.h),
                    
                    // Resend OTP
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Kod kelmadi?',
                          style: TextStyle(
                            fontSize: AppConfig.fontSizeS.sp,
                            color: AppColors.grey600,
                          ),
                        ),
                        TextButton(
                          onPressed: _canResend && !_isLoading ? _resendOTP : null,
                          style: TextButton.styleFrom(
                            foregroundColor: _canResend ? AppColors.primary : AppColors.grey400,
                            padding: EdgeInsets.zero,
                          ),
                          child: Text(
                            _canResend ? 'Qayta yuborish' : '$_resendCountdown soniya',
                            style: TextStyle(
                              fontSize: AppConfig.fontSizeS.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// OTP input widget with multiple fields
class OTPInputFields extends StatefulWidget {
  final Function(String) onComplete;
  final String? errorText;

  const OTPInputFields({
    super.key,
    required this.onComplete,
    this.errorText,
  });

  @override
  State<OTPInputFields> createState() => _OTPInputFieldsState();
}

class _OTPInputFieldsState extends State<OTPInputFields> {
  final List<TextEditingController> _controllers = List.generate(
    AppConfig.otpLength,
    (index) => TextEditingController(),
  );
  final List<FocusNode> _focusNodes = List.generate(
    AppConfig.otpLength,
    (index) => FocusNode(),
  );

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    for (final focusNode in _focusNodes) {
      focusNode.dispose();
    }
    super.dispose();
  }

  void _onChanged(String value, int index) {
    if (value.isNotEmpty) {
      if (index < _controllers.length - 1) {
        _focusNodes[index + 1].requestFocus();
      }
    } else if (value.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
    }

    _checkCompletion();
  }

  void _checkCompletion() {
    final otp = _controllers.map((c) => c.text).join();
    if (otp.length == AppConfig.otpLength) {
      widget.onComplete(otp);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: List.generate(
        AppConfig.otpLength,
        (index) => SizedBox(
          width: 50.w,
          height: 60.h,
          child: TextFormField(
            controller: _controllers[index],
            focusNode: _focusNodes[index],
            textAlign: TextAlign.center,
            keyboardType: TextInputType.number,
            maxLength: 1,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            onChanged: (value) => _onChanged(value, index),
            style: TextStyle(
              fontSize: AppConfig.fontSizeXXL.sp,
              fontWeight: FontWeight.bold,
              color: AppColors.onSurface,
            ),
            decoration: InputDecoration(
              counterText: '',
              filled: true,
              fillColor: widget.errorText != null
                  ? AppColors.errorSurface
                  : AppColors.surfaceVariant,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppConfig.borderRadius),
                borderSide: BorderSide(
                  color: widget.errorText != null ? AppColors.error : AppColors.grey300,
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppConfig.borderRadius),
                borderSide: BorderSide(
                  color: widget.errorText != null ? AppColors.error : AppColors.grey300,
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppConfig.borderRadius),
                borderSide: BorderSide(
                  color: widget.errorText != null ? AppColors.error : AppColors.primary,
                  width: 2,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

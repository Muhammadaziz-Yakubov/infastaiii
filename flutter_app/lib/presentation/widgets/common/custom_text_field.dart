import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/config/app_config.dart';

class CustomTextField extends StatefulWidget {
  final TextEditingController controller;
  final String? labelText;
  final String? hintText;
  final String? errorText;
  final IconData? prefixIcon;
  final IconData? suffixIcon;
  final bool obscureText;
  final TextInputType keyboardType;
  final List<TextInputFormatter>? inputFormatters;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;
  final void Function()? onTap;
  final void Function(String)? onSubmitted;
  final bool readOnly;
  final int? maxLines;
  final int? minLines;
  final bool enabled;
  final FocusNode? focusNode;
  final TextCapitalization textCapitalization;
  final TextInputAction? textInputAction;
  final bool autofocus;
  final int? maxLength;
  final Widget? suffix;
  final EdgeInsets? contentPadding;

  const CustomTextField({
    super.key,
    required this.controller,
    this.labelText,
    this.hintText,
    this.errorText,
    this.prefixIcon,
    this.suffixIcon,
    this.obscureText = false,
    this.keyboardType = TextInputType.text,
    this.inputFormatters,
    this.validator,
    this.onChanged,
    this.onTap,
    this.onSubmitted,
    this.readOnly = false,
    this.maxLines = 1,
    this.minLines,
    this.enabled = true,
    this.focusNode,
    this.textCapitalization = TextCapitalization.none,
    this.textInputAction,
    this.autofocus = false,
    this.maxLength,
    this.suffix,
    this.contentPadding,
  });

  @override
  State<CustomTextField> createState() => _CustomTextFieldState();
}

class _CustomTextFieldState extends State<CustomTextField> {
  bool _obscureText = false;
  late FocusNode _focusNode;

  @override
  void initState() {
    super.initState();
    _obscureText = widget.obscureText;
    _focusNode = widget.focusNode ?? FocusNode();
  }

  @override
  void dispose() {
    if (widget.focusNode == null) {
      _focusNode.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.labelText != null) ...[
          Text(
            widget.labelText!,
            style: TextStyle(
              fontSize: AppConfig.fontSizeM.sp,
              fontWeight: FontWeight.w500,
              color: AppColors.onSurface,
            ),
          ),
          SizedBox(height: AppConfig.spacingS.h),
        ],
        TextFormField(
          controller: widget.controller,
          focusNode: _focusNode,
          obscureText: _obscureText,
          keyboardType: widget.keyboardType,
          inputFormatters: widget.inputFormatters,
          validator: widget.validator,
          onChanged: widget.onChanged,
          onTap: widget.onTap,
          onFieldSubmitted: widget.onSubmitted,
          readOnly: widget.readOnly,
          maxLines: widget.maxLines,
          minLines: widget.minLines,
          enabled: widget.enabled,
          textCapitalization: widget.textCapitalization,
          textInputAction: widget.textInputAction,
          autofocus: widget.autofocus,
          maxLength: widget.maxLength,
          style: TextStyle(
            fontSize: AppConfig.fontSizeM.sp,
            color: AppColors.onSurface,
          ),
          decoration: InputDecoration(
            hintText: widget.hintText,
            errorText: widget.errorText,
            prefixIcon: widget.prefixIcon != null
                ? Icon(
                    widget.prefixIcon,
                    color: _focusNode.hasFocus ? AppColors.primary : AppColors.grey400,
                    size: 20.w,
                  )
                : null,
            suffix: widget.suffix ??
                (widget.obscureText
                    ? IconButton(
                        onPressed: () {
                          setState(() {
                            _obscureText = !_obscureText;
                          });
                        },
                        icon: Icon(
                          _obscureText ? Icons.visibility_off : Icons.visibility,
                          color: AppColors.grey400,
                          size: 20.w,
                        ),
                      )
                    : (widget.suffixIcon != null
                        ? Icon(
                            widget.suffixIcon,
                            color: AppColors.grey400,
                            size: 20.w,
                          )
                        : null)),
            contentPadding: widget.contentPadding ??
                EdgeInsets.symmetric(
                  horizontal: AppConfig.spacingM.w,
                  vertical: widget.maxLines! > 1 ? AppConfig.spacingM.h : AppConfig.spacingM.h,
                ),
            filled: true,
            fillColor: widget.enabled ? AppColors.surfaceVariant : AppColors.grey100,
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
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppConfig.borderRadius),
              borderSide: const BorderSide(
                color: AppColors.error,
                width: 1.5,
              ),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppConfig.borderRadius),
              borderSide: const BorderSide(
                color: AppColors.error,
                width: 2,
              ),
            ),
            disabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppConfig.borderRadius),
              borderSide: const BorderSide(
                color: AppColors.grey200,
              ),
            ),
            hintStyle: TextStyle(
              color: AppColors.grey500,
              fontSize: AppConfig.fontSizeM.sp,
            ),
            counterText: widget.maxLength != null ? null : '',
          ),
        ),
      ],
    );
  }
}

// Phone number formatter widget
class PhoneTextField extends StatefulWidget {
  final TextEditingController controller;
  final String? labelText;
  final String? hintText;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;

  const PhoneTextField({
    super.key,
    required this.controller,
    this.labelText,
    this.hintText,
    this.validator,
    this.onChanged,
  });

  @override
  State<PhoneTextField> createState() => _PhoneTextFieldState();
}

class _PhoneTextFieldState extends State<PhoneTextField> {
  @override
  Widget build(BuildContext context) {
    return CustomTextField(
      controller: widget.controller,
      labelText: widget.labelText,
      hintText: widget.hintText ?? AppConfig.phoneHint,
      keyboardType: TextInputType.phone,
      prefixIcon: Icons.phone,
      inputFormatters: [
        FilteringTextInputFormatter.allow(RegExp(r'[+\d]')),
        LengthLimitingTextInputFormatter(13),
      ],
      validator: widget.validator,
      onChanged: (value) {
        // Format phone number as user types
        if (value.isNotEmpty && !value.startsWith('+')) {
          widget.controller.text = '+$value';
          widget.controller.selection = TextSelection.fromPosition(
            TextPosition(offset: widget.controller.text.length),
          );
        }
        widget.onChanged?.call(value);
      },
    );
  }
}

// OTP input field widget
class OTPTextField extends StatefulWidget {
  final TextEditingController controller;
  final String? labelText;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;
  final void Function(String)? onCompleted;

  const OTPTextField({
    super.key,
    required this.controller,
    this.labelText,
    this.validator,
    this.onChanged,
    this.onCompleted,
  });

  @override
  State<OTPTextField> createState() => _OTPTextFieldState();
}

class _OTPTextFieldState extends State<OTPTextField> {
  @override
  Widget build(BuildContext context) {
    return CustomTextField(
      controller: widget.controller,
      labelText: widget.labelText ?? 'Tasdiqlash kodi',
      hintText: '000000',
      keyboardType: TextInputType.number,
      textAlign: TextAlign.center,
      maxLength: AppConfig.otpLength,
      inputFormatters: [
        FilteringTextInputFormatter.digitsOnly,
      ],
      validator: widget.validator,
      onChanged: (value) {
        widget.onChanged?.call(value);
        
        // Auto-submit when OTP is complete
        if (value.length == AppConfig.otpLength) {
          widget.onCompleted?.call(value);
        }
      },
    );
  }
}

// Password field widget
class PasswordTextField extends StatefulWidget {
  final TextEditingController controller;
  final String? labelText;
  final String? hintText;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;

  const PasswordTextField({
    super.key,
    required this.controller,
    this.labelText,
    this.hintText,
    this.validator,
    this.onChanged,
  });

  @override
  State<PasswordTextField> createState() => _PasswordTextFieldState();
}

class _PasswordTextFieldState extends State<PasswordTextField> {
  @override
  Widget build(BuildContext context) {
    return CustomTextField(
      controller: widget.controller,
      labelText: widget.labelText ?? 'Parol',
      hintText: widget.hintText ?? 'Kamida 6 ta belgi',
      obscureText: true,
      keyboardType: TextInputType.visiblePassword,
      prefixIcon: Icons.lock,
      validator: widget.validator,
      onChanged: widget.onChanged,
    );
  }
}

// Search field widget
class SearchTextField extends StatelessWidget {
  final TextEditingController controller;
  final String? hintText;
  final void Function(String)? onChanged;
  final void Function()? onClear;
  final VoidCallback? onTap;

  const SearchTextField({
    super.key,
    required this.controller,
    this.hintText,
    this.onChanged,
    this.onClear,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return CustomTextField(
      controller: controller,
      hintText: hintText ?? 'Qidirish...',
      keyboardType: TextInputType.text,
      prefixIcon: Icons.search,
      suffixIcon: controller.text.isNotEmpty ? Icons.clear : null,
      onTap: onTap,
      onChanged: (value) {
        widget.onChanged?.call(value);
      },
      suffix: controller.text.isNotEmpty
          ? IconButton(
              onPressed: () {
                widget.controller.clear();
                widget.onClear?.call();
              },
              icon: const Icon(Icons.clear),
            )
          : null,
    );
  }
}

// Multi-line text field widget
class MultilineTextField extends StatelessWidget {
  final TextEditingController controller;
  final String? labelText;
  final String? hintText;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;
  final int maxLines;
  final int minLines;

  const MultilineTextField({
    super.key,
    required this.controller,
    this.labelText,
    this.hintText,
    this.validator,
    this.onChanged,
    this.maxLines = 3,
    this.minLines = 1,
  });

  @override
  Widget build(BuildContext context) {
    return CustomTextField(
      controller: controller,
      labelText: widget.labelText,
      hintText: widget.hintText,
      maxLines: widget.maxLines,
      minLines: widget.minLines,
      keyboardType: TextInputType.multiline,
      textCapitalization: TextCapitalization.sentences,
      validator: widget.validator,
      onChanged: widget.onChanged,
    );
  }
}

import 'package:flutter/services.dart';

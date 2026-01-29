import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/config/app_config.dart';
import '../common/custom_card.dart';

class AITipsCard extends StatefulWidget {
  const AITipsCard({super.key});

  @override
  State<AITipsCard> createState() => _AITipsCardState();
}

class _AITipsCardState extends State<AITipsCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _pulseAnimation;
  int _currentTipIndex = 0;

  final List<AITip> _tips = [
    AITip(
      title: 'Kunlik rejalaringizni yarating',
      description: 'Har kuni ertalab 5 ta asosiy vazifani belgilang. Bu kuningizni samarali boshlashga yordam beradi.',
      icon: Icons.lightbulb,
      color: AppColors.warning,
    ),
    AITip(
      title: 'Pomodoro texnikasidan foydalaning',
      description: '25 daqiqa ishlang, 5 daqiqa dam oling. Bu diqqatni jamlashga va charchashni kamaytirishga yordam beradi.',
      icon: Icons.timer,
      color: AppColors.primary,
    ),
    AITip(
      title: 'Maqsadlarni bo\'laklarga ajrating',
      description: 'Katta maqsadni kichik, boshqariladigan qismlarga bo\'ling. Har bir qism uchun muddat belgilang.',
      icon: Icons.flag,
      color: AppColors.success,
    ),
    AITip(
      title: 'Moliyangizni kuzating',
      description: 'Har kuni xarajatlaringizni yozib boring. Bu byudjetingizni nazorat qilishga yordam beradi.',
      icon: Icons.account_balance_wallet,
      color: AppColors.secondary,
    ),
    AITip(
      title: 'Dam olishni unutmang',
      description: 'Muntazam dam olish ish samaradorligini oshiradi. Har 2 soatda 15 daqiqa tanaffus qiling.',
      icon: Icons.self_improvement,
      color: AppColors.teal,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.1,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _animationController.repeat(reverse: true);
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _nextTip() {
    setState(() {
      _currentTipIndex = (_currentTipIndex + 1) % _tips.length;
    });
  }

  void _previousTip() {
    setState(() {
      _currentTipIndex = (_currentTipIndex - 1 + _tips.length) % _tips.length;
    });
  }

  @override
  Widget build(BuildContext context) {
    final currentTip = _tips[_currentTipIndex];

    return CustomCard(
      backgroundColor: currentTip.color.withOpacity(0.05),
      border: Border.all(color: currentTip.color.withOpacity(0.2)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              AnimatedBuilder(
                animation: _pulseAnimation,
                builder: (context, child) {
                  return Transform.scale(
                    scale: _pulseAnimation.value,
                    child: Container(
                      width: 40.w,
                      height: 40.w,
                      decoration: BoxDecoration(
                        color: currentTip.color,
                        borderRadius: BorderRadius.circular(AppConfig.smallBorderRadius),
                      ),
                      child: Icon(
                        currentTip.icon,
                        color: AppColors.white,
                        size: 20.w,
                      ),
                    ),
                  );
                },
              ),
              SizedBox(width: AppConfig.spacingM.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'InFast AI Maslahati',
                      style: TextStyle(
                        fontSize: AppConfig.fontSizeM.sp,
                        fontWeight: FontWeight.w600,
                        color: currentTip.color,
                      ),
                    ),
                    Text(
                      '${_currentTipIndex + 1} / ${_tips.length}',
                      style: TextStyle(
                        fontSize: AppConfig.fontSizeXS.sp,
                        color: AppColors.grey600,
                      ),
                    ),
                  ],
                ),
              ),
              // Navigation buttons
              Row(
                children: [
                  IconButton(
                    onPressed: _previousTip,
                    icon: Icon(
                      Icons.arrow_back_ios,
                      size: 16.w,
                      color: currentTip.color,
                    ),
                    splashRadius: 20,
                  ),
                  IconButton(
                    onPressed: _nextTip,
                    icon: Icon(
                      Icons.arrow_forward_ios,
                      size: 16.w,
                      color: currentTip.color,
                    ),
                    splashRadius: 20,
                  ),
                ],
              ),
            ],
          ),
          
          SizedBox(height: AppConfig.spacingM.h),
          
          // Tip content
          Text(
            currentTip.title,
            style: TextStyle(
              fontSize: AppConfig.fontSizeL.sp,
              fontWeight: FontWeight.w600,
              color: AppColors.onSurface,
            ),
          ),
          SizedBox(height: AppConfig.spacingS.h),
          Text(
            currentTip.description,
            style: TextStyle(
              fontSize: AppConfig.fontSizeM.sp,
              color: AppColors.grey600,
              height: 1.4,
            ),
          ),
          
          SizedBox(height: AppConfig.spacingM.h),
          
          // Action buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _nextTip,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: currentTip.color,
                    side: BorderSide(color: currentTip.color),
                    padding: EdgeInsets.symmetric(vertical: AppConfig.spacingS.h),
                  ),
                  child: Text(
                    'Keyingi maslahat',
                    style: TextStyle(
                      fontSize: AppConfig.fontSizeS.sp,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
              SizedBox(width: AppConfig.spacingM.w),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    // TODO: Implement AI chat
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('AI chat soon!')),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: currentTip.color,
                    foregroundColor: AppColors.white,
                    padding: EdgeInsets.symmetric(vertical: AppConfig.spacingS.h),
                  ),
                  child: Text(
                    'AI bilan suhbat',
                    style: TextStyle(
                      fontSize: AppConfig.fontSizeS.sp,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class AITip {
  final String title;
  final String description;
  final IconData icon;
  final Color color;

  const AITip({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
  });
}

// Simple AI tips card without animation
class SimpleAITipsCard extends StatelessWidget {
  final AITip tip;
  final VoidCallback? onAction;

  const SimpleAITipsCard({
    super.key,
    required this.tip,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return CustomCard(
      backgroundColor: tip.color.withOpacity(0.05),
      border: Border.all(color: tip.color.withOpacity(0.2)),
      child: Row(
        children: [
          Container(
            width: 48.w,
            height: 48.w,
            decoration: BoxDecoration(
              color: tip.color,
              borderRadius: BorderRadius.circular(AppConfig.smallBorderRadius),
            ),
            child: Icon(
              tip.icon,
              color: AppColors.white,
              size: 24.w,
            ),
          ),
          SizedBox(width: AppConfig.spacingM.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tip.title,
                  style: TextStyle(
                    fontSize: AppConfig.fontSizeM.sp,
                    fontWeight: FontWeight.w600,
                    color: AppColors.onSurface,
                  ),
                ),
                SizedBox(height: AppConfig.spacingXS.h),
                Text(
                  tip.description,
                  style: TextStyle(
                    fontSize: AppConfig.fontSizeS.sp,
                    color: AppColors.grey600,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          if (onAction != null)
            IconButton(
              onPressed: onAction,
              icon: Icon(
                Icons.arrow_forward,
                color: tip.color,
                size: 20.w,
              ),
            ),
        ],
      ),
    );
  }
}

// AI tips list widget
class AITipsList extends StatelessWidget {
  final List<AITip> tips;
  final Function(AITip)? onTipTap;

  const AITipsList({
    super.key,
    required this.tips,
    this.onTipTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'AI Maslahatlari',
          style: TextStyle(
            fontSize: AppConfig.fontSizeL.sp,
            fontWeight: FontWeight.w600,
            color: AppColors.onSurface,
          ),
        ),
        SizedBox(height: AppConfig.spacingM.h),
        ...tips.map((tip) => Padding(
          padding: EdgeInsets.only(bottom: AppConfig.spacingM.h),
          child: SimpleAITipsCard(
            tip: tip,
            onAction: () => onTipTap?.call(tip),
          ),
        )),
      ],
    );
  }
}

// Additional color constants
extension AppColorsExtension on AppColors {
  static const Color teal = Color(0xFF14B8A6);
}

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const Card = ({ 
  children, 
  style, 
  onPress, 
  variant = 'default',
  padding = 'md',
}) => {
  const getCardStyle = () => {
    const base = [styles.card, styles[`padding_${padding}`]];
    
    switch (variant) {
      case 'primary':
        base.push(styles.primary);
        break;
      case 'success':
        base.push(styles.success);
        break;
      case 'warning':
        base.push(styles.warning);
        break;
      case 'error':
        base.push(styles.error);
        break;
      default:
        base.push(styles.default);
    }
    
    return base;
  };

  if (onPress) {
    return (
      <TouchableOpacity 
        style={[...getCardStyle(), style]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[...getCardStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.md,
  },
  
  padding_sm: {
    padding: SIZES.padding.sm,
  },
  padding_md: {
    padding: SIZES.padding.base,
  },
  padding_lg: {
    padding: SIZES.padding.xl,
  },
  
  default: {
    backgroundColor: COLORS.white,
  },
  primary: {
    backgroundColor: COLORS.primaryBg,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  success: {
    backgroundColor: COLORS.successBg,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  warning: {
    backgroundColor: COLORS.warningBg,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  error: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
});

export default Card;

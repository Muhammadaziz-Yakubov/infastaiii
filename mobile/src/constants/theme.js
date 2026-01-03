import { Platform } from 'react-native';

export const COLORS = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',
  primaryBg: '#EFF6FF',
  
  secondary: '#8B5CF6',
  secondaryDark: '#7C3AED',
  
  success: '#10B981',
  successBg: '#D1FAE5',
  
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  
  error: '#EF4444',
  errorBg: '#FEE2E2',
  
  white: '#FFFFFF',
  black: '#000000',
  
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  background: '#F9FAFB',
  backgroundDark: '#111827',
  
  card: '#FFFFFF',
  cardDark: '#1F2937',
  
  text: '#111827',
  textDark: '#F9FAFB',
  textSecondary: '#6B7280',
  textSecondaryDark: '#9CA3AF',
  
  border: '#E5E7EB',
  borderDark: '#374151',
};

export const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  
  padding: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
  },
};

export const SHADOWS = Platform.select({
  ios: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
  },
  android: {
    sm: { elevation: 1 },
    md: { elevation: 3 },
    lg: { elevation: 5 },
  },
  web: {
    sm: { boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    md: { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    lg: { boxShadow: '0 4px 8px rgba(0,0,0,0.15)' },
  },
  default: {
    sm: {},
    md: {},
    lg: {},
  },
});

export default { COLORS, SIZES, SHADOWS };

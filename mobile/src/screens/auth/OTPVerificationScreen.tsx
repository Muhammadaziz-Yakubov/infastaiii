import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '@/theme/ThemeProvider';
import { verifyPhoneOTP } from '@/store/slices/authSlice';
import { RootState, AppDispatch } from '@/store/store';

interface OTPVerificationScreenProps {
  route: {
    params: {
      phone: string;
    };
  };
  navigation: any;
}

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({ route, navigation }) => {
  const { phone } = route.params;
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle OTP input change
  const handleOtpChange = (value: string, index: number) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '');
    
    const newOtp = [...otp];
    newOtp[index] = digit.slice(-1); // Take only last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key press for backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP verification
  const handleVerify = async () => {
    const otpString = otp.join('');
    
    console.log('🔍 DEBUG: OTP submitted:', otpString);
    console.log('📱 DEBUG: Phone:', phone);

    // Validation
    if (otpString.length !== 6) {
      Alert.alert('Xatolik', 'Iltimos, 6 xonali kodni kiriting');
      return;
    }

    try {
      console.log('📡 DEBUG: Sending OTP verification request...');
      const result = await dispatch(verifyPhoneOTP({ phone, otp: otpString })).unwrap();
      
      console.log('✅ DEBUG: OTP verification successful:', result);
      
      // Navigate to Create Password screen
      navigation.navigate('CreatePassword', { phone, otp: otpString });
    } catch (err: any) {
      console.error('❌ DEBUG: OTP verification failed:', err);
      Alert.alert('Xatolik', err || 'Kodni tasdiqlashda xatolik yuz berdi');
    }
  };

  // Handle resend OTP
  const handleResend = async () => {
    console.log('🔄 DEBUG: Resending OTP...');
    
    // Reset timer
    setTimeLeft(60);
    setCanResend(false);
    
    // Clear OTP inputs
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    
    // Here you would typically call an API to resend OTP
    // For now, we'll just show a message
    Alert.alert('Muvaffaqiyatli', 'Kod qayta yuborildi');
  };

  // Debug function
  const handleDebug = () => {
    console.log('🐛 DEBUG INFO:');
    console.log('- Phone:', phone);
    console.log('- OTP:', otp.join(''));
    console.log('- Time Left:', timeLeft);
    console.log('- Can Resend:', canResend);
    console.log('- Is Loading:', isLoading);
    console.log('- Error:', error);
    
    Alert.alert(
      'Debug Info',
      `Phone: ${phone}\nOTP: ${otp.join('')}\nTime Left: ${timeLeft}s\nCan Resend: ${canResend}`,
      [{ text: 'OK' }]
    );
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={[styles.iconText, { color: theme.colors.primary }]}>
              📱
            </Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Kodni tasdiqlang
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            {phone} raqamiga yuborilgan 6 xonali kodni kiriting
          </Text>
        </View>

        {/* OTP Inputs */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                { 
                  borderColor: digit ? theme.colors.primary : theme.colors.outline,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.onSurface,
                }
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              returnKeyType="done"
              secureTextEntry={false}
              editable={!isLoading}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Error Display */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            { 
              backgroundColor: theme.colors.primary,
              opacity: (isLoading || otp.join('').length !== 6) ? 0.6 : 1,
            }
          ]}
          onPress={handleVerify}
          disabled={isLoading || otp.join('').length !== 6}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.onPrimary} size="small" />
          ) : (
            <Text style={[styles.verifyButtonText, { color: theme.colors.onPrimary }]}>
              Tasdiqlash
            </Text>
          )}
        </TouchableOpacity>

        {/* Resend Section */}
        <View style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: theme.colors.onSurfaceVariant }]}>
            Kod kelmadimi?
          </Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={[styles.resendLink, { color: theme.colors.primary }]}>
                Qayta yuborish
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.timerText, { color: theme.colors.onSurfaceVariant }]}>
              {formatTime(timeLeft)}
            </Text>
          )}
        </View>

        {/* Debug Button - Development Only */}
        {__DEV__ && (
          <TouchableOpacity
            style={[styles.debugButton, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={handleDebug}
          >
            <Text style={[styles.debugButtonText, { color: theme.colors.onSurfaceVariant }]}>
              🐛 Debug Info
            </Text>
          </TouchableOpacity>
        )}

        {/* Change Phone */}
        <TouchableOpacity
          style={styles.changePhoneContainer}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.changePhoneText, { color: theme.colors.primary }]}>
            Raqamni o'zgartirish
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  verifyButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    marginBottom: 8,
  },
  resendLink: {
    fontSize: 16,
    fontWeight: '600',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  debugButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  debugButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  changePhoneContainer: {
    alignItems: 'center',
  },
  changePhoneText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OTPVerificationScreen;

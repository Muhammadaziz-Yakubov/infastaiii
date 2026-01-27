import React, { useState, useRef } from 'react';
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
import { checkPhone } from '@/store/slices/authSlice';
import { RootState, AppDispatch } from '@/store/store';

const PhoneInputScreen: React.FC = ({ navigation }: any) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Phone number validation
  const validatePhoneNumber = (phone: string): boolean => {
    // Uzbekistan phone format: +998XXXXXXXXX
    const phoneRegex = /^\+998\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Format phone number as user types
  const formatPhoneNumber = (text: string): string => {
    // Remove all non-digit characters except +
    let cleaned = text.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +998
    if (!cleaned.startsWith('+998')) {
      if (cleaned.startsWith('998')) {
        cleaned = '+' + cleaned;
      } else if (!cleaned.startsWith('+')) {
        cleaned = '+998' + cleaned;
      }
    }
    
    // Limit to 13 characters (+998 + 9 digits)
    return cleaned.slice(0, 13);
  };

  // Handle phone number change
  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  // Handle continue button press
  const handleContinue = async () => {
    console.log('🔍 DEBUG: Phone number submitted:', phoneNumber);
    
    // Validation
    if (!phoneNumber) {
      Alert.alert('Xatolik', 'Iltimos, telefon raqamingizni kiriting');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Xatolik', "Telefon raqami noto'g'ri formatda. Iltimos, +998XXXXXXXXX ko'rinishida kiriting");
      return;
    }

    console.log('✅ DEBUG: Phone number validation passed');

    try {
      // Dispatch checkPhone action
      console.log('📡 DEBUG: Sending phone check request...');
      const result = await dispatch(checkPhone(phoneNumber)).unwrap();
      
      console.log('✅ DEBUG: Phone check successful:', result);
      
      // Navigate to OTP screen
      navigation.navigate('OTPVerification', { phone: phoneNumber });
    } catch (err: any) {
      console.error('❌ DEBUG: Phone check failed:', err);
      Alert.alert('Xatolik', err || 'Telefon raqamini tekshirishda xatolik yuz berdi');
    }
  };

  // Debug function
  const handleDebug = () => {
    console.log('🐛 DEBUG INFO:');
    console.log('- Phone Number:', phoneNumber);
    console.log('- Is Valid:', validatePhoneNumber(phoneNumber));
    console.log('- Is Loading:', isLoading);
    console.log('- Error:', error);
    console.log('- Theme:', theme.colors.primary);
    
    Alert.alert(
      'Debug Info',
      `Phone: ${phoneNumber}\nValid: ${validatePhoneNumber(phoneNumber)}\nLoading: ${isLoading}`,
      [{ text: 'OK' }]
    );
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
          <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={[styles.logoText, { color: theme.colors.primary }]}>
              InFast AI
            </Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Xush kelibsiz!
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Productivity va Life Manager Platform
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            Telefon raqamingiz
          </Text>
          
          {/* Phone Input */}
          <View style={[
            styles.inputContainer,
            { 
              borderColor: isFocused ? theme.colors.primary : theme.colors.outline,
              backgroundColor: theme.colors.surface,
            }
          ]}>
            <Text style={[styles.countryCode, { color: theme.colors.onSurface }]}>
              🇺🇿 +998
            </Text>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                { 
                  color: theme.colors.onSurface,
                  backgroundColor: 'transparent',
                }
              ]}
              placeholder="XX XXX XX XX"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={phoneNumber.replace('+998', '')}
              onChangeText={handlePhoneChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              keyboardType="phone-pad"
              maxLength={9}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              editable={!isLoading}
            />
          </View>

          {/* Phone Format Helper */}
          <Text style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}>
            Format: +998 XX XXX XX XX
          </Text>

          {/* Error Display */}
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            </View>
          )}

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              { 
                backgroundColor: theme.colors.primary,
                opacity: (isLoading || !phoneNumber) ? 0.6 : 1,
              }
            ]}
            onPress={handleContinue}
            disabled={isLoading || !phoneNumber}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.onPrimary} size="small" />
            ) : (
              <Text style={[styles.continueButtonText, { color: theme.colors.onPrimary }]}>
                Davom etish
              </Text>
            )}
          </TouchableOpacity>

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
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
            Hisobingiz bormi?{' '}
            <Text 
              style={[styles.linkText, { color: theme.colors.primary }]}
              onPress={() => navigation.navigate('Login')}
            >
              Kirish
            </Text>
          </Text>
        </View>
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
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 1,
  },
  helperText: {
    fontSize: 14,
    marginBottom: 16,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  continueButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
  linkText: {
    fontWeight: '600',
  },
});

export default PhoneInputScreen;

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
import { login, loginWithPhone } from '@/store/slices/authSlice';
import { RootState, AppDispatch } from '@/store/store';

const LoginScreen: React.FC = ({ navigation }: any) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [loginType, setLoginType] = useState<'phone' | 'email'>('phone');
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const passwordRef = useRef<TextInput>(null);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (loginType === 'phone') {
      if (!formData.phone) {
        newErrors.phone = 'Telefon raqami kiritilishi shart';
      } else if (!/^\+998\d{9}$/.test(formData.phone)) {
        newErrors.phone = "Telefon raqami noto'g'ri formatda";
      }
    } else {
      if (!formData.email) {
        newErrors.email = 'Email kiritilishi shart';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email noto\'g\'ri formatda';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Parol kiritilishi shart';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log('🔍 DEBUG: Login submitted:', { loginType, formData });

    if (!validateForm()) {
      console.log('❌ DEBUG: Form validation failed');
      return;
    }

    try {
      console.log('📡 DEBUG: Sending login request...');
      
      let result;
      if (loginType === 'phone') {
        result = await dispatch(loginWithPhone({
          phone: formData.phone,
          password: formData.password,
        })).unwrap();
      } else {
        result = await dispatch(login({
          email: formData.email,
          password: formData.password,
        })).unwrap();
      }
      
      console.log('✅ DEBUG: Login successful:', result);
      
      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (err: any) {
      console.error('❌ DEBUG: Login failed:', err);
      Alert.alert('Xatolik', err || 'Login qilishda xatolik yuz berdi');
    }
  };

  // Handle input change
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Format phone number
  const formatPhoneNumber = (text: string): string => {
    let cleaned = text.replace(/[^\d+]/g, '');
    
    if (!cleaned.startsWith('+998')) {
      if (cleaned.startsWith('998')) {
        cleaned = '+' + cleaned;
      } else if (!cleaned.startsWith('+')) {
        cleaned = '+998' + cleaned;
      }
    }
    
    return cleaned.slice(0, 13);
  };

  // Handle phone input change
  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    handleInputChange('phone', formatted);
  };

  // Debug function
  const handleDebug = () => {
    console.log('🐛 DEBUG INFO:');
    console.log('- Login Type:', loginType);
    console.log('- Form Data:', formData);
    console.log('- Errors:', errors);
    console.log('- Is Loading:', isLoading);
    console.log('- Error:', error);
    
    Alert.alert(
      'Debug Info',
      `Type: ${loginType}\nPhone/Email: ${loginType === 'phone' ? formData.phone : formData.email}\nLoading: ${isLoading}`,
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
              🔐
            </Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Kirish
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Hisobingizga kiring
          </Text>
        </View>

        {/* Login Type Selector */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              { 
                backgroundColor: loginType === 'phone' ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.outline,
              }
            ]}
            onPress={() => setLoginType('phone')}
          >
            <Text style={[
              styles.typeButtonText,
              { color: loginType === 'phone' ? theme.colors.onPrimary : theme.colors.onSurface }
            ]}>
              📱 Telefon
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeButton,
              { 
                backgroundColor: loginType === 'email' ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.outline,
              }
            ]}
            onPress={() => setLoginType('email')}
          >
            <Text style={[
              styles.typeButtonText,
              { color: loginType === 'email' ? theme.colors.onPrimary : theme.colors.onSurface }
            ]}>
              📧 Email
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Phone/Email Input */}
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            {loginType === 'phone' ? 'Telefon raqami' : 'Email'}
          </Text>
          
          {loginType === 'phone' ? (
            <View style={[
              styles.inputContainer,
              { 
                borderColor: errors.phone ? theme.colors.error : theme.colors.outline,
                backgroundColor: theme.colors.surface,
              }
            ]}>
              <Text style={[styles.countryCode, { color: theme.colors.onSurface }]}>
                🇺🇿 +998
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: theme.colors.onSurface,
                    backgroundColor: 'transparent',
                  }
                ]}
                value={formData.phone.replace('+998', '')}
                onChangeText={handlePhoneChange}
                placeholder="XX XXX XX XX"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                keyboardType="phone-pad"
                maxLength={9}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                editable={!isLoading}
              />
            </View>
          ) : (
            <TextInput
              style={[
                styles.input,
                { 
                  borderColor: errors.email ? theme.colors.error : theme.colors.outline,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.onSurface,
                }
              ]}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="email@example.com"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!isLoading}
            />
          )}

          {(errors.phone || errors.email) && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.phone || errors.email}
            </Text>
          )}

          {/* Password Field */}
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            Parol
          </Text>
          <View style={[
            styles.passwordContainer,
            { 
              borderColor: errors.password ? theme.colors.error : theme.colors.outline,
              backgroundColor: theme.colors.surface,
            }
          ]}>
            <TextInput
              ref={passwordRef}
              style={[
                styles.passwordInput,
                { color: theme.colors.onSurface }
              ]}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Parolingiz"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={[styles.eyeText, { color: theme.colors.onSurfaceVariant }]}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          </View>

          {errors.password && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.password}
            </Text>
          )}

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
              Parolni unutdingizmi?
            </Text>
          </TouchableOpacity>

          {/* Error Display */}
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              { 
                backgroundColor: theme.colors.primary,
                opacity: isLoading ? 0.6 : 1,
              }
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.onPrimary} size="small" />
            ) : (
              <Text style={[styles.loginButtonText, { color: theme.colors.onPrimary }]}>
                Kirish
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
            Hisobingiz yo'qmi?{' '}
            <Text 
              style={[styles.linkText, { color: theme.colors.primary }]}
              onPress={() => navigation.navigate('PhoneInput')}
            >
              Ro'yxatdan o'tish
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
    marginBottom: 32,
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
    fontSize: 32,
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
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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
  input: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  eyeButton: {
    marginLeft: 12,
  },
  eyeText: {
    fontSize: 20,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 8,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
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

export default LoginScreen;

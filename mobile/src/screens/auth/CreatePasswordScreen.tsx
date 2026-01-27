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
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '@/theme/ThemeProvider';
import { createPassword } from '@/store/slices/authSlice';
import { RootState, AppDispatch } from '@/store/store';

interface CreatePasswordScreenProps {
  route: {
    params: {
      phone: string;
      otp: string;
    };
  };
  navigation: any;
}

const CreatePasswordScreen: React.FC<CreatePasswordScreenProps> = ({ route, navigation }) => {
  const { phone, otp } = route.params;
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // Password strength checker
  const checkPasswordStrength = (password: string): { score: number; message: string } => {
    let score = 0;
    let message = '';

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    switch (score) {
      case 0:
      case 1:
        message = 'Juda zaif';
        break;
      case 2:
      case 3:
        message = 'O\'rtacha';
        break;
      case 4:
        message = 'Kuchli';
        break;
      case 5:
        message = 'Juda kuchli';
        break;
    }

    return { score, message };
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ism kiritilishi shart';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Familiya kiritilishi shart';
    }

    if (!formData.password) {
      newErrors.password = 'Parol kiritilishi shart';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Parolni tasdiqlang';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Parollar mos kelmadi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log('🔍 DEBUG: Form submitted:', { phone, otp, formData });

    if (!validateForm()) {
      console.log('❌ DEBUG: Form validation failed');
      return;
    }

    try {
      console.log('📡 DEBUG: Sending create password request...');
      
      const result = await dispatch(createPassword({
        phone,
        otp,
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      })).unwrap();
      
      console.log('✅ DEBUG: Password creation successful:', result);
      
      Alert.alert(
        'Muvaffaqiyatli!',
        'Hisobingiz muvaffaqiyatli yaratildi. Endi dasturdan foydalanishingiz mumkin!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to main app
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            },
          },
        ]
      );
    } catch (err: any) {
      console.error('❌ DEBUG: Password creation failed:', err);
      Alert.alert('Xatolik', err || 'Parol yaratishda xatolik yuz berdi');
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

  // Debug function
  const handleDebug = () => {
    console.log('🐛 DEBUG INFO:');
    console.log('- Phone:', phone);
    console.log('- OTP:', otp);
    console.log('- Form Data:', formData);
    console.log('- Errors:', errors);
    console.log('- Is Loading:', isLoading);
    console.log('- Error:', error);
    
    const passwordStrength = checkPasswordStrength(formData.password);
    console.log('- Password Strength:', passwordStrength);
    
    Alert.alert(
      'Debug Info',
      `Phone: ${phone}\nName: ${formData.firstName} ${formData.lastName}\nPassword Strength: ${passwordStrength.message}`,
      [{ text: 'OK' }]
    );
  };

  const passwordStrength = checkPasswordStrength(formData.password);

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
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
              👤
            </Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Hisob yarating
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Shaxsiy ma'lumotlaringizni kiriting
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name Fields */}
          <View style={styles.nameRow}>
            <View style={styles.nameInputContainer}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                Ism
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    borderColor: errors.firstName ? theme.colors.error : theme.colors.outline,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.onSurface,
                  }
                ]}
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                placeholder="Ismingiz"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                editable={!isLoading}
              />
              {errors.firstName && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.firstName}
                </Text>
              )}
            </View>

            <View style={styles.nameInputContainer}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                Familiya
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    borderColor: errors.lastName ? theme.colors.error : theme.colors.outline,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.onSurface,
                  }
                ]}
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                placeholder="Familiyangiz"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                editable={!isLoading}
              />
              {errors.lastName && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.lastName}
                </Text>
              )}
            </View>
          </View>

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
              placeholder="Kamida 6 ta belgi"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              secureTextEntry={!showPassword}
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
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
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <View style={styles.strengthContainer}>
              <Text style={[styles.strengthText, { color: theme.colors.onSurfaceVariant }]}>
                Parol kuchiligi: {passwordStrength.message}
              </Text>
              <View style={styles.strengthBarContainer}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.strengthBar,
                      { 
                        backgroundColor: level <= passwordStrength.score 
                          ? theme.colors.primary 
                          : theme.colors.outline,
                      }
                    ]}
                  />
                ))}
              </View>
            </View>
          )}

          {errors.password && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.password}
            </Text>
          )}

          {/* Confirm Password Field */}
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            Parolni tasdiqlang
          </Text>
          <View style={[
            styles.passwordContainer,
            { 
              borderColor: errors.confirmPassword ? theme.colors.error : theme.colors.outline,
              backgroundColor: theme.colors.surface,
            }
          ]}>
            <TextInput
              ref={confirmPasswordRef}
              style={[
                styles.passwordInput,
                { color: theme.colors.onSurface }
              ]}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              placeholder="Parolni qayta kiriting"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              secureTextEntry={!showConfirmPassword}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={[styles.eyeText, { color: theme.colors.onSurfaceVariant }]}>
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          </View>

          {errors.confirmPassword && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.confirmPassword}
            </Text>
          )}

          {/* Error Display */}
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
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
              <Text style={[styles.submitButtonText, { color: theme.colors.onPrimary }]}>
                Hisobni yarating
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
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
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
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  nameInputContainer: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  strengthContainer: {
    marginBottom: 16,
  },
  strengthText: {
    fontSize: 14,
    marginBottom: 8,
  },
  strengthBarContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
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
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
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
});

export default CreatePasswordScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { Button, Input } from '../../components/common';
import { useAuthStore } from '../../store/authStore';

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuthStore();

  const validate = () => {
    const newErrors = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = 'Ismingizni kiriting';
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = 'Familiyangizni kiriting';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email kiriting';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email formati noto'g'ri";
    }
    
    if (!password) {
      newErrors.password = 'Parol kiriting';
    } else if (password.length < 6) {
      newErrors.password = "Parol kamida 6 ta belgidan iborat bo'lishi kerak";
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Parollar mos kelmaydi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (!result.success) {
        Alert.alert('Xatolik', result.message || "Ro'yxatdan o'tish muvaffaqiyatsiz bo'ldi");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Serverga ulanib bo'lmadi";
      Alert.alert('Xatolik', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.gray700} />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Ionicons name="flash" size={32} color={COLORS.white} />
            </View>
            <Text style={styles.logoText}>InFast AI</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Ro'yxatdan o'tish</Text>
            <Text style={styles.subtitle}>
              Yangi hisob yarating va boshlang
            </Text>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Ism"
                  placeholder="Ismingiz"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  error={errors.firstName}
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Familiya"
                  placeholder="Familiyangiz"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  error={errors.lastName}
                />
              </View>
            </View>

            <Input
              label="Email"
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
              error={errors.email}
            />

            <Input
              label="Parol"
              placeholder="Kamida 6 ta belgi"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.password}
            />

            <Input
              label="Parolni tasdiqlang"
              placeholder="Parolni qayta kiriting"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.confirmPassword}
            />

            <Button
              title="Ro'yxatdan o'tish"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
              size="lg"
            />
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Hisobingiz bormi? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Kirish</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 12,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.xl,
    padding: 24,
    ...SHADOWS.md,
  },
  title: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.gray500,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  halfInput: {
    flex: 1,
    paddingHorizontal: 6,
  },
  registerButton: {
    marginTop: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  loginText: {
    fontSize: SIZES.base,
    color: COLORS.gray600,
  },
  loginLink: {
    fontSize: SIZES.base,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;

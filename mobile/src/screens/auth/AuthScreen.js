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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { Button, Input } from '../../components/common';
import { useAuthStore } from '../../store/authStore';

// Auth steps
const STEPS = {
  PHONE: 'phone',           // Telefon raqam kiritish
  PASSWORD: 'password',     // Mavjud foydalanuvchi - parol kiritish
  OTP: 'otp',               // Yangi foydalanuvchi - Telegram OTP
  REGISTER: 'register',     // Yangi foydalanuvchi - ma'lumotlar kiritish
};

const AuthScreen = () => {
  const [step, setStep] = useState(STEPS.PHONE);
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { 
    checkPhone, 
    loginWithPhone, 
    verifyPhoneOTP, 
    createPassword,
    resetAuthFlow 
  } = useAuthStore();

  // Format phone number
  const formatPhone = (text) => {
    // Remove all non-digits except +
    let cleaned = text.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +998
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    if (!cleaned.startsWith('+998')) {
      cleaned = '+998';
    }
    
    // Limit to +998 + 9 digits
    if (cleaned.length > 13) {
      cleaned = cleaned.substring(0, 13);
    }
    
    return cleaned;
  };

  // Step 1: Check phone
  const handleCheckPhone = async () => {
    const cleanPhone = phone.replace(/\s/g, '');
    
    if (cleanPhone.length !== 13) {
      setErrors({ phone: "To'liq telefon raqam kiriting (+998xxxxxxxxx)" });
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      const result = await checkPhone(cleanPhone);
      
      if (result.success) {
        if (result.userExists) {
          // Mavjud foydalanuvchi - parol so'rash
          setStep(STEPS.PASSWORD);
        } else {
          // Yangi foydalanuvchi - Telegram botga yo'naltirish
          Alert.alert(
            'Telegram Bot',
            'Ro\'yxatdan o\'tish uchun Telegram botga o\'ting va /start bosing, keyin kontaktingizni ulashing. Kod olganingizdan so\'ng shu yerga kiriting.',
            [
              { 
                text: 'Telegram ochish', 
                onPress: () => {
                  Linking.openURL('https://t.me/infastai_bot');
                  setStep(STEPS.OTP);
                }
              },
              { 
                text: 'Kodim bor', 
                onPress: () => setStep(STEPS.OTP) 
              },
            ]
          );
        }
      } else {
        Alert.alert('Xatolik', result.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      const message = error.response?.data?.message || "Serverga ulanib bo'lmadi";
      Alert.alert('Xatolik', message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2a: Login with password
  const handleLogin = async () => {
    if (!password) {
      setErrors({ password: 'Parol kiriting' });
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      const result = await loginWithPhone(phone, password);
      
      if (!result.success) {
        Alert.alert('Xatolik', result.message || 'Parol noto\'g\'ri');
      }
      // Success - auth store will update isAuthenticated
    } catch (error) {
      const message = error.response?.data?.message || "Parol noto'g'ri";
      Alert.alert('Xatolik', message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2b: Verify OTP
  const handleVerifyOTP = async () => {
    const cleanOtp = otp.replace(/\s/g, '');
    
    if (cleanOtp.length !== 6) {
      setErrors({ otp: '6 xonali kod kiriting' });
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      const result = await verifyPhoneOTP(phone, cleanOtp);
      
      if (result.success) {
        setStep(STEPS.REGISTER);
      } else {
        Alert.alert('Xatolik', result.message || 'Kod noto\'g\'ri');
      }
    } catch (error) {
      const message = error.response?.data?.message || "Kod noto'g'ri";
      Alert.alert('Xatolik', message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Create password and register
  const handleRegister = async () => {
    const newErrors = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = 'Ism kiriting';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Familiya kiriting';
    }
    if (!newPassword || newPassword.length < 6) {
      newErrors.newPassword = 'Parol kamida 6 ta belgi';
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Parollar mos kelmaydi';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      const result = await createPassword(newPassword, firstName.trim(), lastName.trim());
      
      if (!result.success) {
        Alert.alert('Xatolik', result.message || 'Ro\'yxatdan o\'tishda xatolik');
      }
      // Success - auth store will update isAuthenticated
    } catch (error) {
      const message = error.response?.data?.message || "Xatolik yuz berdi";
      Alert.alert('Xatolik', message);
    } finally {
      setLoading(false);
    }
  };

  // Go back
  const handleBack = () => {
    if (step === STEPS.PASSWORD || step === STEPS.OTP) {
      setStep(STEPS.PHONE);
      setPassword('');
      setOtp('');
    } else if (step === STEPS.REGISTER) {
      setStep(STEPS.OTP);
    }
    setErrors({});
  };

  // Render phone input step
  const renderPhoneStep = () => (
    <>
      <Text style={styles.title}>Kirish</Text>
      <Text style={styles.subtitle}>
        Telefon raqamingizni kiriting
      </Text>

      <Input
        label="Telefon raqam"
        placeholder="+998 90 123 45 67"
        value={phone}
        onChangeText={(text) => setPhone(formatPhone(text))}
        keyboardType="phone-pad"
        icon="call-outline"
        error={errors.phone}
      />

      <Button
        title="Davom etish"
        onPress={handleCheckPhone}
        loading={loading}
        style={styles.button}
        size="lg"
      />
    </>
  );

  // Render password step (existing user)
  const renderPasswordStep = () => (
    <>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color={COLORS.gray700} />
      </TouchableOpacity>

      <Text style={styles.title}>Parol kiriting</Text>
      <Text style={styles.subtitle}>
        {phone} uchun parolingizni kiriting
      </Text>

      <Input
        label="Parol"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        icon="lock-closed-outline"
        error={errors.password}
      />

      <Button
        title="Kirish"
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
        size="lg"
      />
    </>
  );

  // Render OTP step (new user)
  const renderOTPStep = () => (
    <>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color={COLORS.gray700} />
      </TouchableOpacity>

      <Text style={styles.title}>Kodni kiriting</Text>
      <Text style={styles.subtitle}>
        Telegram botdan olgan 6 xonali kodni kiriting
      </Text>

      <Input
        label="Tasdiqlash kodi"
        placeholder="123456"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        icon="key-outline"
        error={errors.otp}
      />

      <Button
        title="Tasdiqlash"
        onPress={handleVerifyOTP}
        loading={loading}
        style={styles.button}
        size="lg"
      />

      <TouchableOpacity 
        style={styles.resendButton}
        onPress={() => Linking.openURL('https://t.me/infastai_bot')}
      >
        <Text style={styles.resendText}>Telegram botni ochish</Text>
      </TouchableOpacity>
    </>
  );

  // Render register step (new user)
  const renderRegisterStep = () => (
    <>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color={COLORS.gray700} />
      </TouchableOpacity>

      <Text style={styles.title}>Ro'yxatdan o'tish</Text>
      <Text style={styles.subtitle}>
        Ma'lumotlaringizni kiriting
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
        label="Parol"
        placeholder="Kamida 6 ta belgi"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        icon="lock-closed-outline"
        error={errors.newPassword}
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
        style={styles.button}
        size="lg"
      />
    </>
  );

  // Render current step
  const renderStep = () => {
    switch (step) {
      case STEPS.PHONE:
        return renderPhoneStep();
      case STEPS.PASSWORD:
        return renderPasswordStep();
      case STEPS.OTP:
        return renderOTPStep();
      case STEPS.REGISTER:
        return renderRegisterStep();
      default:
        return renderPhoneStep();
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
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Ionicons name="flash" size={40} color={COLORS.white} />
            </View>
            <Text style={styles.logoText}>InFast AI</Text>
            <Text style={styles.tagline}>Hayotingizni AI bilan boshqaring</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {renderStep()}
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            Davom etish orqali siz foydalanish shartlariga rozilik bildirasiz
          </Text>
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
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 16,
  },
  tagline: {
    fontSize: SIZES.md,
    color: COLORS.gray500,
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.xl,
    padding: 24,
    ...SHADOWS.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
  button: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  halfInput: {
    flex: 1,
    paddingHorizontal: 6,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    fontSize: SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  footerText: {
    fontSize: SIZES.sm,
    color: COLORS.gray400,
    textAlign: 'center',
    marginTop: 32,
  },
});

export default AuthScreen;

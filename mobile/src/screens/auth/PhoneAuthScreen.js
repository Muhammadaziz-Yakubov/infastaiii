import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';

const { width, height } = Dimensions.get('window');

const STEPS = {
  PHONE: 'phone',
  PASSWORD: 'password',
  TELEGRAM: 'telegram',
  OTP: 'otp',
  REGISTER: 'register',
};

const PhoneAuthScreen = () => {
  const [step, setStep] = useState(STEPS.PHONE);
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const otpRefs = useRef([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const { checkPhone, loginWithPhone, verifyPhoneOTP, createPassword } = useAuthStore();

  const animateTransition = (callback) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    setTimeout(callback, 150);
  };

  const formatPhone = (text) => {
    let cleaned = text.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+')) cleaned = '+' + cleaned;
    if (!cleaned.startsWith('+998')) cleaned = '+998';
    if (cleaned.length > 13) cleaned = cleaned.substring(0, 13);
    return cleaned;
  };

  const handleCheckPhone = async () => {
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length !== 13) {
      setError("To'liq telefon raqam kiriting");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await checkPhone(cleanPhone);
      if (result.success) {
        if (result.userExists) {
          animateTransition(() => setStep(STEPS.PASSWORD));
        } else {
          animateTransition(() => setStep(STEPS.TELEGRAM));
        }
      } else {
        setError(result.message || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Serverga ulanib bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!password) {
      setError('Parol kiriting');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await loginWithPhone(phone, password);
      if (!result.success) {
        setError(result.message || "Parol noto'g'ri");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (value && index === 5) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        handleVerifyOTP(fullOtp);
      }
    }
  };

  const handleOtpKeyPress = (index, key) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6) {
      setError('6 xonali kod kiriting');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyPhoneOTP(phone, code);
      if (result.success) {
        animateTransition(() => setStep(STEPS.REGISTER));
      } else {
        setError(result.message || "Kod noto'g'ri");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Kod noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!firstName.trim()) {
      setError('Ism kiriting');
      return;
    }
    if (!lastName.trim()) {
      setError('Familiya kiriting');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Parol kamida 6 ta belgi');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Parollar mos kelmaydi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await createPassword(newPassword, firstName.trim(), lastName.trim());
      if (!result.success) {
        setError(result.message || "Ro'yxatdan o'tishda xatolik");
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setError('');
    if (step === STEPS.PASSWORD || step === STEPS.TELEGRAM) {
      animateTransition(() => setStep(STEPS.PHONE));
    } else if (step === STEPS.OTP) {
      animateTransition(() => setStep(STEPS.TELEGRAM));
    } else if (step === STEPS.REGISTER) {
      animateTransition(() => setStep(STEPS.OTP));
    }
  };

  const openTelegram = () => {
    Linking.openURL('https://t.me/infastai_bot');
    setTimeout(() => animateTransition(() => setStep(STEPS.OTP)), 500);
  };

  const renderPhoneStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Kirish</Text>
      <Text style={styles.subtitle}>Telefon raqamingizni kiriting</Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputIcon}>
          <Ionicons name="call-outline" size={22} color="#6B7280" />
        </View>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={(t) => setPhone(formatPhone(t))}
          placeholder="+998 90 123 45 67"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          autoFocus
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleCheckPhone}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>Davom etish</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderPasswordStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={24} color="#374151" />
      </TouchableOpacity>

      <Text style={styles.title}>Parol kiriting</Text>
      <Text style={styles.subtitle}>{phone} uchun parolingizni kiriting</Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputIcon}>
          <Ionicons name="lock-closed-outline" size={22} color="#6B7280" />
        </View>
        <TextInput
          style={[styles.input, { paddingRight: 50 }]}
          value={password}
          onChangeText={setPassword}
          placeholder="Parolingiz"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!showPassword}
          autoFocus
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Kirish</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderTelegramStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={24} color="#374151" />
      </TouchableOpacity>

      <Text style={styles.title}>Telegram Bot</Text>
      <Text style={styles.subtitle}>Tasdiqlash kodi olish uchun:</Text>

      <View style={styles.telegramCard}>
        <View style={styles.telegramIconBox}>
          <Ionicons name="paper-plane" size={32} color="#3B82F6" />
        </View>
        <View style={styles.telegramSteps}>
          <View style={styles.telegramStep}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <Text style={styles.stepText}>Telegram botni oching</Text>
          </View>
          <View style={styles.telegramStep}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <Text style={styles.stepText}>/start buyrug'ini bosing</Text>
          </View>
          <View style={styles.telegramStep}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <Text style={styles.stepText}>Kontaktingizni ulashing</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={openTelegram}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="paper-plane" size={20} color="#fff" />
          <Text style={styles.buttonText}>Telegram ochish</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => animateTransition(() => setStep(STEPS.OTP))}
      >
        <Text style={styles.secondaryButtonText}>Kodim bor</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOtpStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={24} color="#374151" />
      </TouchableOpacity>

      <Text style={styles.title}>Kodni kiriting</Text>
      <Text style={styles.subtitle}>Telegram botdan olgan 6 xonali kod</Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (otpRefs.current[index] = ref)}
            style={[styles.otpInput, digit && styles.otpInputFilled]}
            value={digit}
            onChangeText={(value) => handleOtpChange(index, value)}
            onKeyPress={({ nativeEvent }) => handleOtpKeyPress(index, nativeEvent.key)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={() => handleVerifyOTP()}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Tasdiqlash</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={openTelegram}>
        <Text style={styles.linkText}>Qayta kod olish</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRegisterStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={24} color="#374151" />
      </TouchableOpacity>

      <Text style={styles.title}>Ro'yxatdan o'tish</Text>
      <Text style={styles.subtitle}>Ma'lumotlaringizni kiriting</Text>

      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <TextInput
            style={styles.inputSmall}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Ism"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <TextInput
            style={styles.inputSmall}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Familiya"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputIcon}>
          <Ionicons name="lock-closed-outline" size={22} color="#6B7280" />
        </View>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Parol (kamida 6 ta belgi)"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputIcon}>
          <Ionicons name="lock-closed-outline" size={22} color="#6B7280" />
        </View>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Parolni tasdiqlang"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Ro'yxatdan o'tish</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case STEPS.PHONE: return renderPhoneStep();
      case STEPS.PASSWORD: return renderPasswordStep();
      case STEPS.TELEGRAM: return renderTelegramStep();
      case STEPS.OTP: return renderOtpStep();
      case STEPS.REGISTER: return renderRegisterStep();
      default: return renderPhoneStep();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EFF6FF', '#F9FAFB', '#EFF6FF']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
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
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.logoBox}
              >
                <Ionicons name="flash" size={36} color="#fff" />
              </LinearGradient>
              <Text style={styles.logoText}>InFast AI</Text>
              <Text style={styles.logoSubtext}>Sizning shaxsiy AI yordamchingiz</Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Animated.View style={{ opacity: fadeAnim }}>
                {renderStep()}
              </Animated.View>
            </View>

            <Text style={styles.footer}>
              Davom etish orqali foydalanish shartlariga rozilik bildirasiz
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#3B82F6',
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: 15,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      },
    }),
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  stepContainer: {},
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  inputIcon: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
  },
  inputSmall: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  eyeButton: {
    padding: 12,
  },
  primaryButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  linkText: {
    color: '#3B82F6',
    fontSize: 15,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
  },
  telegramCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  telegramIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  telegramSteps: {
    width: '100%',
  },
  telegramStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  otpInputFilled: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  footer: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 24,
  },
});

export default PhoneAuthScreen;

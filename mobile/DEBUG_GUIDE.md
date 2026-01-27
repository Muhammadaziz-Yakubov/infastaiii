# 🔍 Debug Qilish Yo'riqnomasi - InFast AI Mobile App

## 📋 Debug Qilish Nima Uchun Kerak?

Debug qilish - bu dasturdagi xatoliklarni topish, tushunish va tuzatish jarayoni. React Native da debug qilish juda muhim, chunki mobil ilovalarda xatoliklar ko'proq ko'rinmaydi.

## 🛠️ Debug Vositalari

### 1. **Console.log() - Asosiy Debug Vosita**
```javascript
// Har bir sahifada console.log() ishlatamiz
console.log('🔍 DEBUG: Phone number submitted:', phoneNumber);
console.log('✅ DEBUG: Validation passed');
console.log('❌ DEBUG: Error occurred:', error);
```

### 2. **React Native Debugger**
- **Qanday yoqiladi?**
  - Terminalda `npx react-native start` 
  - Shimiyada `d` tugmasini bosing
  - Chrome Developer Tools ochiladi

- **Nima qilish mumkin?**
  - Console loglarni ko'rish
  - Network requestlarni kuzatish
  - State o'zgarishlarini tekshirish
  - Component props va state ni ko'rish

### 3. **Flipper** (Advanced Debug Tool)
```bash
npm install -g flipper
npx react-native run-android  # Flipper avtomatik ochiladi
```

### 4. **Expo Dev Tools**
- Expo Go ilovasida
- Web browserda: `http://localhost:8081`

## 🐛 Xatoliklarni Topish Usullari

### 1. **Form Validatsiya Xatoliklari**
```javascript
// ❌ Xato yondash
if (!phoneNumber) {
  Alert.alert('Xatolik', 'Telefon raqami kiritilmadi');
}

// ✅ To'g'ri yondash
if (!phoneNumber) {
  console.log('❌ DEBUG: Phone number is empty');
  Alert.alert('Xatolik', 'Iltimos, telefon raqamingizni kiriting');
  return; // Funksiyani to'xtatish
}
```

### 2. **API Request Xatoliklari**
```javascript
// PhoneInputScreen misoli
const handleContinue = async () => {
  console.log('🔍 DEBUG: Starting phone check...');
  
  try {
    console.log('📡 DEBUG: Sending request to:', API_BASE_URL);
    const result = await dispatch(checkPhone(phoneNumber)).unwrap();
    console.log('✅ DEBUG: API Response:', result);
  } catch (err) {
    console.error('❌ DEBUG: API Error:', err);
    console.error('❌ DEBUG: Error details:', {
      message: err.message,
      stack: err.stack,
      phone: phoneNumber
    });
    Alert.alert('Xatolik', err.message || 'API xatolik');
  }
};
```

### 3. **Navigation Xatoliklari**
```javascript
// ❌ Xato - parametrlarni tekshirmaslik
navigation.navigate('OTPVerification');

// ✅ To'g'ri - parametrlarni tekshirish
const handleNavigate = () => {
  console.log('🔍 DEBUG: Navigating to OTP with phone:', phone);
  
  if (!phone) {
    console.log('❌ DEBUG: No phone number provided');
    Alert.alert('Xatolik', 'Telefon raqami mavjud emas');
    return;
  }
  
  navigation.navigate('OTPVerification', { phone });
};
```

### 4. **State Management Xatoliklari**
```javascript
// Redux store ni tekshirish
const DebugInfo = () => {
  const state = useSelector((state) => state.auth);
  console.log('🐛 DEBUG STATE:');
  console.log('- User:', state.user);
  console.log('- Token:', state.token);
  console.log('- Is Loading:', state.isLoading);
  console.log('- Error:', state.error);
  console.log('- Is Authenticated:', state.isAuthenticated);
};
```

## 📱 Mobile-Specific Debug Masalalari

### 1. **Keyboard Issues**
```javascript
// KeyboardAvoidingView to'g'ri ishlash
<KeyboardAvoidingView 
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>
  {/* Content */}
</KeyboardAvoidingView>
```

### 2. **TextInput Focus Issues**
```javascript
// Auto-focus management
useEffect(() => {
  // Component mount bo'lganda birinchi inputga focus
  inputRefs.current[0]?.focus();
}, []);

const handleOtpChange = (value: string, index: number) => {
  // Qiymat o'zgarganda keyingi inputga focus
  if (value && index < 5) {
    inputRefs.current[index + 1]?.focus();
  }
};
```

### 3. **Platform-Specific Issues**
```javascript
// Platformni tekshirish
console.log('📱 DEBUG: Platform:', Platform.OS);
console.log('📱 DEBUG: Version:', Platform.Version);

// Platformga qarab farqli logic
if (Platform.OS === 'ios') {
  // iOS uchun kod
} else {
  // Android uchun kod
}
```

## 🔧 Debug Buttonlari

Har bir development screenida debug button qo'shing:

```javascript
// Development uchun debug button
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
```

## 📊 Performance Debug

### 1. **Render Performance**
```javascript
// Component render次数ini kuzatish
const renderCount = useRef(0);
renderCount.current++;
console.log('🔄 DEBUG: Render count:', renderCount.current);
```

### 2. **Memory Usage**
```javascript
// Flipper da memory usage ni kuzatish
// React DevTools Profiler dan foydalaning
```

## 🌐 Network Debug

### 1. **API Request Monitoring**
```javascript
// API client da interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log('📡 DEBUG: API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });
    return config;
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ DEBUG: API Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ DEBUG: API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);
```

## 🚨 Common Xatoliklar va Yechimlari

### 1. **"Cannot find module" Xatoligi**
```bash
# Node_modulesni o'chirib qayta o'rnatish
rm -rf node_modules
npm install

# Yoki
npm start -- --reset-cache
```

### 2. **Metro Bundler Issues**
```bash
# Metro cache ni tozalash
npx react-native start --reset-cache

# Yoki
npx expo start --clear
```

### 3. **Navigation Typescript Errors**
```typescript
// Navigation props to'gri tipini berish
interface Props {
  navigation: StackNavigationProp<AuthStackParamList>;
  route: RouteProp<AuthStackParamList, 'PhoneInput'>;
}

const PhoneInputScreen: React.FC<Props> = ({ navigation, route }) => {
  // Component logic
};
```

## 📝 Debug Loglarni Yozish Qoidalari

### 1. **Log Format**
```javascript
// ✅ Yaxshi format
console.log('🔍 DEBUG: [ScreenName] [Action] [Details]');
console.log('📡 DEBUG: [API] [Method] [URL]');
console.log('✅ DEBUG: [Success] [Result]');
console.log('❌ DEBUG: [Error] [Details]');

// Misollar:
console.log('🔍 DEBUG: [PhoneInput] User typed:', phoneNumber);
console.log('📡 DEBUG: [API] POST /api/auth/check-phone');
console.log('✅ DEBUG: [PhoneInput] Validation passed');
console.log('❌ DEBUG: [PhoneInput] API Error:', error);
```

### 2. **Conditional Logging**
```javascript
// Faqat development da log qilish
if (__DEV__) {
  console.log('🐛 DEBUG: Development only log');
}

// Environment ga qarab log
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 DEBUG: Development mode');
}
```

## 🔍 Debug Qilish Checklist

### [ ] Form Validation
- [ ] Barcha inputlar validatsiyadan o'tadi
- [ ] Error messages to'gri ko'rsatiladi
- [ ] Form submit bloklanadi xatolikda

### [ ] API Integration
- [ ] Request URL to'g'ri
- [ ] Request body to'g'ri formatda
- [ ] Response handling to'g'ri
- [ ] Error handling to'g'ri

### [ ] Navigation
- [ ] Parametrlar to'g'ri o'tadi
- [ ] Navigation to'g'ri ishlaydi
- [ ] Back navigation ishlaydi

### [ ] State Management
- [ ] Redux state to'g'ri yangilanadi
- [ ] Loading states to'g'ri
- [ ] Error states to'g'ri

### [ ] UI/UX
- [ ] Keyboard muammolari yo'q
- [ ] Responsive design
- [ ] Loading indicators ko'rsatiladi
- [ ] Error messages ko'rsatiladi

## 🎯 Real-time Debug Masalalari

### 1. **OTP Input Auto-focus**
```javascript
// OTP inputlarda auto-focus ishlash
const handleOtpChange = (value: string, index: number) => {
  const digit = value.replace(/\D/g, '');
  const newOtp = [...otp];
  newOtp[index] = digit.slice(-1);
  setOtp(newOtp);

  // Auto-focus next input
  if (digit && index < 5) {
    console.log('🎯 DEBUG: Auto-focusing input', index + 1);
    inputRefs.current[index + 1]?.focus();
  }
};
```

### 2. **Phone Number Formatting**
```javascript
// Telefon raqamini formatlash
const formatPhoneNumber = (text: string): string => {
  console.log('🎯 DEBUG: Formatting phone:', text);
  
  let cleaned = text.replace(/[^\d+]/g, '');
  
  if (!cleaned.startsWith('+998')) {
    if (cleaned.startsWith('998')) {
      cleaned = '+' + cleaned;
    } else {
      cleaned = '+998' + cleaned;
    }
  }
  
  const formatted = cleaned.slice(0, 13);
  console.log('🎯 DEBUG: Formatted phone:', formatted);
  
  return formatted;
};
```

## 📚 Qo'shimcha Resurslar

1. **React Native Debugging Guide**: https://reactnative.dev/docs/debugging
2. **Expo Debugging**: https://docs.expo.dev/debugging/
3. **Flipper Documentation**: https://fbflipper.com/
4. **React DevTools**: https://reactjs.org/blog/2019/08/15/new-react-devtools/

---

**Eslatma:** Har doim development rejimida debug buttonlarini qo'shing va console.log() larni yozish odatini rivojlantiring. Bu sizning vaqtini tejashga va xatoliklarni tezroq topishga yordam beradi! 🚀

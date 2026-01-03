# InFast AI Mobile App

O'zbek tilidagi professional React Native ilova - vazifalar, maqsadlar va moliyani boshqarish uchun.

## 🚀 O'rnatish

### 1. Dependencylarni o'rnatish

```bash
cd mobile
npm install
```

### 2. Ilovani ishga tushirish

```bash
# Expo development server
npx expo start

# Android uchun
npx expo start --android

# iOS uchun
npx expo start --ios
```

### 3. Expo Go ilovasi orqali ko'rish

1. Telefoningizga **Expo Go** ilovasini o'rnating (App Store / Play Store)
2. QR kodni skanerlang
3. Ilova telefoningizda ochiladi

## 📱 Xususiyatlar

- ✅ **Vazifalar boshqaruvi** - Qo'shish, tahrirlash, o'chirish, bajarish
- 🎯 **Maqsadlar tracking** - Moliyaviy maqsadlar va progress
- 💰 **Moliya menejment** - Daromad va xarajatlarni kuzatish
- 👤 **Profil** - Foydalanuvchi sozlamalari
- 🔐 **Autentifikatsiya** - Login/Register

## 🎨 Dizayn

- **Asosiy rang**: Ko'k (#3B82F6)
- **Modern UI** - Gradient, shadow, animatsiyalar
- **Responsive** - Barcha ekran o'lchamlariga moslashgan

## 🔧 Texnologiyalar

- React Native + Expo
- React Navigation
- Zustand (state management)
- Axios (API)
- Expo SecureStore (token saqlash)
- Expo Linear Gradient

## 📁 Struktura

```
mobile/
├── App.js                 # Asosiy kirish nuqtasi
├── src/
│   ├── components/        # UI komponentlar
│   │   └── common/        # Button, Input, Card, Loading
│   ├── constants/         # Theme, API config
│   ├── navigation/        # React Navigation
│   ├── screens/           # Ekranlar
│   │   ├── auth/          # Login, Register
│   │   └── main/          # Dashboard, Tasks, Goals, Finance, Profile
│   ├── services/          # API services
│   └── store/             # Zustand stores
└── assets/                # Rasmlar, ikonlar
```

## 🔗 Backend

Ilova `https://infastaiii.onrender.com` backend serveriga ulangan.

## 📝 Eslatmalar

- `assets/` papkasiga `icon.png`, `splash.png`, `adaptive-icon.png` qo'shing
- Production uchun `eas build` ishlatiladi

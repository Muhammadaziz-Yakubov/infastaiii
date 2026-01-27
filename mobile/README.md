# InFast AI - Mobile Application

🚀 **Production-ready React Native mobile app for InFast AI Productivity & Life Manager Platform (Uzbekistan)**

## 📱 Overview

InFast AI is a comprehensive productivity and life management mobile application built with React Native and Expo. The app integrates with the existing InFast AI backend to provide users with a seamless experience for managing tasks, goals, finances, challenges, and AI-powered assistance.

## ✨ Features

### 🎯 Core Functionality
- **📊 Dashboard** - Daily summary with quick insights and actions
- **✅ Task Management** - Create, organize, and track tasks with priorities and deadlines
- **🎯 Goals** - Set and monitor personal and financial goals with progress tracking
- **💰 Finance Tracking** - Manage income, expenses, and budgets with AI insights
- **🏆 Challenges** - Participate in individual and team challenges
- **🤖 AI Assistant** - Voice commands and intelligent suggestions via Telegram integration

### 🔐 Authentication
- Phone-based authentication with OTP verification
- Password creation and login
- Secure JWT token management
- Auto-login functionality

### 🎨 UI/UX Features
- **🌙 Dark/Light Theme** - System-aware theme switching
- **📱 Mobile-First Design** - Optimized for both Android and iOS
- **⚡ Smooth Animations** - 60fps animations with React Native Reanimated
- **🎯 Intuitive Navigation** - Bottom tab navigation with stack navigators
- **🔔 Push Notifications** - Real-time notifications and reminders
- **🌐 Offline Support** - Basic offline functionality with sync

## 🏗️ Architecture

### 📁 Project Structure
```
src/
├── api/            # API layer with Axios
├── auth/           # Authentication logic
├── components/     # Reusable UI components
├── screens/        # App screens
│   ├── auth/       # Authentication screens
│   └── main/       # Main app screens
├── navigation/     # Navigation configuration
├── store/          # Redux Toolkit store
│   └── slices/     # Feature slices
├── services/       # Business logic services
├── utils/          # Helper functions
├── theme/          # Theme configuration
└── types/          # TypeScript type definitions
```

### 🛠️ Technology Stack
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Redux Toolkit with Redux Persist
- **Navigation**: React Navigation 6
- **UI Library**: React Native Paper (Material Design 3)
- **Animations**: React Native Reanimated 3
- **Icons**: Lucide React Native
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **Notifications**: Expo Notifications

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd infastai-main/mobile
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment Configuration**
Create a `.env` file in the root directory:
```env
# API Configuration
API_BASE_URL=http://localhost:5000/api
EXPO_PUBLIC_API_URL=https://infastaiii.onrender.com/api

# Firebase (optional for notifications)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_project_id

# Expo Configuration
EXPO_PUBLIC_APP_NAME=InFast AI
```

4. **Start the development server**
```bash
npm start
# or
yarn start
```

5. **Run on device/simulator**
```bash
# Android
npm run android

# iOS
npm run ios
```

## 🔧 Configuration

### API Integration
The app is configured to work with the existing InFast AI backend. Update the API endpoints in `src/api/client.ts`:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api' 
  : 'https://infastaiii.onrender.com/api';
```

### Theme Customization
Modify the theme in `src/theme/ThemeProvider.tsx`:
```typescript
const lightTheme = {
  colors: {
    primary: '#3B82F6',    // InFast AI Blue
    secondary: '#8B5CF6',  // Purple
    // ... other colors
  },
};
```

## 📱 Build & Deployment

### Development Build
```bash
# Android APK
npm run build:apk

# iOS Simulator
npm run build:ios
```

### Production Build
```bash
# Preview build
npm run build:preview

# Production build
npm run build:production
```

### App Store Submission
```bash
# Submit to stores
npm run submit
```

## 🔐 Authentication Flow

1. **Phone Input** → User enters phone number (+998XXXXXXXXX)
2. **OTP Verification** → 6-digit code verification
3. **Password Creation** → Create secure password
4. **Login** → Access with phone/password
5. **Dashboard** → Main app interface

## 📡 API Integration

The app integrates with all backend APIs:

### Authentication APIs
- `POST /api/auth/check-phone` - Validate phone number
- `POST /api/auth/verify-phone-otp` - Verify OTP
- `POST /api/auth/create-password` - Create password
- `POST /api/auth/login` - User login

### Feature APIs
- `GET /api/tasks` - Fetch tasks
- `GET /api/goals` - Fetch goals
- `GET /api/finance` - Fetch financial data
- `GET /api/challenges` - Fetch challenges
- `POST /api/infast-ai/generate-link-code` - Telegram integration

## 🎨 UI Components

### Reusable Components
- **Loading States** - Skeleton loaders and spinners
- **Form Components** - Input fields, buttons, forms
- **List Components** - Task lists, goal cards, finance items
- **Modal Components** - Bottom sheets, dialogs
- **Chart Components** - Progress bars, statistics

### Design System
- **Colors**: Primary (#3B82F6), Secondary (#8B5CF6), Success (#10B981), Warning (#F59E0B), Error (#EF4444)
- **Typography**: System fonts with consistent sizing
- **Spacing**: 8dp grid system
- **Icons**: Lucide React Native icons

## 🔔 Notifications

### Push Notifications
- Task reminders
- Goal progress updates
- Challenge notifications
- AI insights and tips

### Local Notifications
- Daily summaries
- Deadline reminders
- Achievement celebrations

## 🌐 Internationalization

### Supported Languages
- **Uzbek (Primary)** - Default language
- **English** - Secondary language

### Implementation
- Language switching in settings
- Localized UI strings
- Date/time formatting
- Number formatting

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Testing
```bash
# Install Detox for E2E testing
npm install --save-dev detox
```

## 📊 Performance

### Optimization
- **Lazy Loading** - Screen and component lazy loading
- **Memoization** - React.memo and useMemo optimizations
- **Image Optimization** - Compressed images and caching
- **Bundle Size** - Code splitting and tree shaking

### Monitoring
- **Crashlytics** - Error tracking
- **Analytics** - User behavior tracking
- **Performance** - App performance metrics

## 🔒 Security

### Data Protection
- **JWT Tokens** - Secure authentication
- **HTTPS** - Encrypted API communication
- **Local Storage** - Secure data storage
- **Input Validation** - Form validation and sanitization

### Best Practices
- **API Security** - Request/response validation
- **Token Management** - Secure token storage and refresh
- **Data Encryption** - Sensitive data encryption

## 🚀 Deployment

### Android
1. **Generate APK** - `npm run build:apk`
2. **Upload to Play Store** - Use Google Play Console
3. **Configure Release** - Set up production settings

### iOS
1. **Build IPA** - `npm run build:ios`
2. **Upload to App Store** - Use App Store Connect
3. **Configure Release** - Set up production settings

## 📝 Contributing

### Development Guidelines
1. **Code Style** - Follow TypeScript and React Native best practices
2. **Git Flow** - Use feature branches and pull requests
3. **Testing** - Write tests for new features
4. **Documentation** - Update documentation for changes

### Code Review
- **TypeScript** - Strict type checking
- **Performance** - Review performance implications
- **Security** - Check for security vulnerabilities
- **UX/UI** - Ensure consistent design

## 🐛 Troubleshooting

### Common Issues
1. **Metro bundler issues** - Clear cache: `npx react-native start --reset-cache`
2. **Dependency conflicts** - Delete node_modules and reinstall
3. **Build errors** - Check Xcode/Android Studio setup
4. **API connection** - Verify backend server is running

### Debug Tools
- **React Native Debugger** - Debug React Native apps
- **Flipper** - Mobile app debugging platform
- **Expo Dev Tools** - Development and debugging tools

## 📚 Documentation

### API Documentation
- [Backend API Documentation](../backend/README.md)
- [Authentication Flow](./docs/authentication.md)
- [Component Library](./docs/components.md)

### Guides
- [Setup Guide](./docs/setup.md)
- [Deployment Guide](./docs/deployment.md)
- [Testing Guide](./docs/testing.md)

## 🤝 Support

### Getting Help
- **Issues** - Report bugs on GitHub
- **Discussions** - Ask questions and share ideas
- **Documentation** - Check docs and examples
- **Community** - Join our developer community

### Contact
- **Email** - support@infastproject.uz
- **Website** - https://infastproject.uz
- **Telegram** - @InFastAIBot

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the InFast AI Team for Uzbekistan**

@echo off
REM InFast AI Mobile App Setup Script for Windows
REM This script helps set up the development environment for the InFast AI mobile app

echo 🚀 Setting up InFast AI Mobile App...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm detected

REM Check if Expo CLI is installed
expo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Expo CLI globally...
    npm install -g @expo/cli
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Expo CLI
        pause
        exit /b 1
    )
) else (
    echo ✅ Expo CLI detected
)

REM Install project dependencies
echo 📦 Installing project dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    (
        echo # API Configuration
        echo API_BASE_URL=http://localhost:5000/api
        echo EXPO_PUBLIC_API_URL=https://infastaiii.onrender.com/api
        echo.
        echo # Firebase ^(optional for notifications^)
        echo FIREBASE_API_KEY=your_firebase_api_key
        echo FIREBASE_PROJECT_ID=your_project_id
        echo.
        echo # Expo Configuration
        echo EXPO_PUBLIC_APP_NAME=InFast AI
    ) > .env
    echo ✅ .env file created. Please update the values as needed.
) else (
    echo ✅ .env file already exists
)

REM Check for Android development tools
adb version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Android development tools not found. Install Android Studio for Android development.
) else (
    echo ✅ Android development tools detected
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📱 Next steps:
echo 1. Update the .env file with your configuration
echo 2. Start the development server: npm start
echo 3. Run on Android: npm run android
echo 4. Run on iOS: npm run ios
echo.
echo 📚 For more information, see the README.md file
echo.
echo 🔗 Useful links:
echo - Expo Dev Tools: https://expo.dev
echo - React Native Docs: https://reactnative.dev
echo - InFast AI Backend: https://github.com/your-repo/backend
echo.
pause

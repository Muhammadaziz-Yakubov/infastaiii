#!/bin/bash

# InFast AI Mobile App Setup Script
# This script helps set up the development environment for the InFast AI mobile app

echo "🚀 Setting up InFast AI Mobile App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="16.0.0"

if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js $REQUIRED_VERSION or higher."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm detected"

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI globally..."
    npm install -g @expo/cli
else
    echo "✅ Expo CLI detected"
fi

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
# API Configuration
API_BASE_URL=http://localhost:5000/api
EXPO_PUBLIC_API_URL=https://infastaiii.onrender.com/api

# Firebase (optional for notifications)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_project_id

# Expo Configuration
EXPO_PUBLIC_APP_NAME=InFast AI
EOL
    echo "✅ .env file created. Please update the values as needed."
else
    echo "✅ .env file already exists"
fi

# Check for Android Studio (for Android development)
if command -v adb &> /dev/null; then
    echo "✅ Android development tools detected"
else
    echo "⚠️  Android development tools not found. Install Android Studio for Android development."
fi

# Check for Xcode (for iOS development) - macOS only
if [[ "$OSTYPE" == "darwin"* ]]; then
    if xcode-select -p &> /dev/null; then
        echo "✅ Xcode detected"
    else
        echo "⚠️  Xcode not found. Install Xcode for iOS development."
    fi
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📱 Next steps:"
echo "1. Update the .env file with your configuration"
echo "2. Start the development server: npm start"
echo "3. Run on Android: npm run android"
echo "4. Run on iOS: npm run ios"
echo ""
echo "📚 For more information, see the README.md file"
echo ""
echo "🔗 Useful links:"
echo "- Expo Dev Tools: https://expo.dev"
echo "- React Native Docs: https://reactnative.dev"
echo "- InFast AI Backend: https://github.com/your-repo/backend"

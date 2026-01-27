import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import PhoneInputScreen from '@/screens/auth/PhoneInputScreen';
import OTPVerificationScreen from '@/screens/auth/OTPVerificationScreen';
import CreatePasswordScreen from '@/screens/auth/CreatePasswordScreen';
import LoginScreen from '@/screens/auth/LoginScreen';

export type AuthStackParamList = {
  PhoneInput: undefined;
  OTPVerification: { phone: string };
  CreatePassword: { phone: string; otp: string };
  Login: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Navigator
        initialRouteName="PhoneInput"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="PhoneInput" 
          component={PhoneInputScreen}
          options={{ title: 'Kirish' }}
        />
        <Stack.Screen 
          name="OTPVerification" 
          component={OTPVerificationScreen}
          options={{ title: 'Tasdiqlash' }}
        />
        <Stack.Screen 
          name="CreatePassword" 
          component={CreatePasswordScreen}
          options={{ title: 'Parol yaratish' }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ title: 'Login' }}
        />
      </Stack.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AuthNavigator;

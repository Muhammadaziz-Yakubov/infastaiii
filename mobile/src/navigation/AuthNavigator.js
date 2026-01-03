import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PhoneAuthScreen from '../screens/auth/PhoneAuthScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Auth" component={PhoneAuthScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;

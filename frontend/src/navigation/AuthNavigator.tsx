import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  LoginScreen, 
  RegisterScreen, 
  DashboardScreen,
  LanguageScreen,
  OtpVerificationScreen,
  IdirSetupScreen,
} from '../screens';

export type AuthStackParamList = {
  Language: undefined;
  Auth: { selectedLanguage: 'en' | 'am' };
  Login: undefined;
  Register: undefined;
  OtpVerification: { phoneNumber: string };
  IdirSetup: undefined;
  Dashboard: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Language"
    >
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="Auth" component={AuthStackNavigator} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="IdirSetup" component={IdirSetupScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  );
};

// Separate stack for Login/Register screens
const AuthStack = createStackNavigator();

const AuthStackNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Login"
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

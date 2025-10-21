// navigation/AuthNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SigninScreen from '../screens/SigninScreen';
import RegisterScreen from '../screens/RegisterScreen';
import StartScreen from '../screens/StartScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyOtpScreen from '../screens/VerifyOtpScreen';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    // Ensure NO spaces/chars here
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Ensure NO spaces/chars here */}
      <Stack.Screen name="Start" component={StartScreen} />
      {/* Ensure NO spaces/chars here */}
      <Stack.Screen name="Signin" component={SigninScreen} />
      {/* Ensure NO spaces/chars here */}
      <Stack.Screen name="Register" component={RegisterScreen} />
      {/* Ensure NO spaces/chars here */}
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      {/* Ensure NO spaces/chars here */}
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      {/* Ensure NO spaces/chars here */}
    </Stack.Navigator> // <--- NO space/newline before this
  );
}
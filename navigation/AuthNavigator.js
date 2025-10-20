// navigation/AuthNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SigninScreen from '../screens/SigninScreen';
import RegisterScreen from '../screens/RegisterScreen';
import StartScreen from '../screens/StartScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyOtpScreen from '../screens/VerifyOtpScreen'; // <-- Import the new screen

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Start" component={StartScreen} />
      <Stack.Screen name="Signin" component={SigninScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} /> {/* <-- Add the screen */}
    </Stack.Navigator>
  );
}
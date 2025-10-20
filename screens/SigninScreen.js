// screens/SigninScreen.js
import {
  StyleSheet,
  View,
  SafeAreaView,
  Dimensions,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import colors from 'config/colors';
import { useState } from 'react';
import { radius, spacingX, spacingY } from 'config/spacing';
import Typo from 'components/Typo';
import { normalizeY } from 'utils/normalize';
import { Octicons } from '@expo/vector-icons';
import AppButton from 'components/AppButton';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('screen');
let paddingTop = Platform.OS === 'ios' ? height * 0.07 : spacingY._10;

// --- REMOVED SignInMethods Enum ---

function SigninScreen(props) {
  const navigation = useNavigation();
  // --- REMOVED route and related useEffects ---
  // --- REMOVED signInMethod state ---
  const [email, setEmail] = useState(''); // Keep email state
  const [password, setPassword] = useState('');
  // --- REMOVED otp state ---
  const [isSecure, setIsSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const clearForm = () => {
    setEmail('');
    setPassword('');
    // --- REMOVED otp clearing ---
  };

  // --- Sign in with Password ---
  const handlePasswordSignIn = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Input Error', text2: 'Please enter both email and password.' });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    setLoading(false);

    if (error) {
      // --- ADJUSTED Error Handling ---
      if (error.message.includes('Email not confirmed') || error.code === 'USER_NOT_CONFIRMED') {
        // Tell user to check email, but don't switch UI here
        Toast.show({
          type: 'info',
          text1: 'Email Not Verified',
          text2: 'Please check your email for a verification OTP and use it on the verification screen.',
          visibilityTime: 5000
        });
        // Optionally navigate them back to OTP screen if needed, or let them trigger resend from there.
        // navigation.navigate('VerifyOtp', { email: email, otpType: OtpType.SIGNUP });
      } else if (error.message.includes('Invalid login credentials')) {
        Toast.show({ type: 'error', text1: 'Sign In Failed', text2: 'Incorrect email or password.' });
      } else {
        Toast.show({ type: 'error', text1: 'Sign In Failed', text2: error.message });
      }
    }
    // Success is handled by App.js listener
  };

  // --- REMOVED handleSendOtp and handleVerifyOtp ---

  const navigateToRegister = () => {
    clearForm();
    navigation.navigate('Register');
  };

  const navigateToForgotPassword = () => {
    clearForm();
    navigation.navigate('ForgotPassword');
  };

  // --- Simplified Render Content ---
  const renderContent = () => {
    return (
      <>
        <Typo size={26} style={styles.text}>Hello Again!</Typo>
        <Typo size={20} style={styles.body}>Welcome back!</Typo>
        <View style={styles.inputView}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            placeholderTextColor="grey"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputView}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="grey"
            style={styles.passwordInput}
            secureTextEntry={isSecure}
          />
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)} style={styles.eyeIcon}>
            <Octicons name={isSecure ? "eye-closed" : "eye"} size={20} color="grey" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={navigateToForgotPassword}>
          <Typo style={styles.recoverTxt}>Forgot Password?</Typo>
        </TouchableOpacity>
        <AppButton
          onPress={handlePasswordSignIn}
          label={loading ? "Signing In..." : "Sign in"}
          loading={loading} // Pass loading state if AppButton supports it
          disabled={loading}
          style={styles.actionButton}
        />
        {/* Removed switch method button */}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        <View style={[styles.c1, { opacity: 0.5 }]} />
        <View style={[styles.orangeCircle, { bottom: '25%', left: '5%', opacity: 0.5 }]} />
        <View style={[styles.orangeCircle, { opacity: 0.4 }]} />
        <View style={styles.c2} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <BlurView intensity={80} tint="light" style={styles.blurView}>
          {renderContent()}

          {!loading && (
            <TouchableOpacity
              style={styles.bottomText}
              onPress={navigateToRegister}>
              <Typo>Not a member?</Typo>
              <Typo style={{ color: colors.blue }}> Register now</Typo>
            </TouchableOpacity>
          )}
        </BlurView>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles (Removed styles related to OTP elements if any, keep rest) ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  blurView: {
    paddingHorizontal: spacingX._20,
    paddingTop: paddingTop * 0.5,
    paddingBottom: spacingY._60,
    borderRadius: radius._20,
    marginHorizontal: spacingX._15,
    marginVertical: spacingY._10,
    overflow: 'hidden',
  },
  background: { flex: 1, ...StyleSheet.absoluteFillObject, backgroundColor: colors.white },
  inputView: {
    backgroundColor: '#ffffffaa', borderRadius: radius._15, marginTop: spacingY._15,
    shadowColor: colors.lightBlue, shadowOffset: { height: 1, width: 0 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
    flexDirection: 'row', alignItems: 'center', paddingRight: spacingX._5,
    borderWidth: Platform.OS === 'android' ? 0.5 : 0, borderColor: '#0000001A',
  },
  input: {
    paddingVertical: spacingY._15, paddingHorizontal: spacingX._20,
    fontSize: normalizeY(16), flex: 1, color: colors.black, height: 55,
  },
  passwordInput: {
    paddingVertical: spacingY._15, paddingHorizontal: spacingX._20,
    fontSize: normalizeY(16), flex: 1, color: colors.black, height: 55,
  },
  eyeIcon: {
    paddingHorizontal: spacingX._15,
  },
  text: {
    fontWeight: '600', textAlign: 'center', alignSelf: 'center', marginTop: spacingY._10, marginBottom: spacingY._5,
  },
  body: {
    textAlign: 'center', alignSelf: 'center', margin: 2, marginBottom: spacingY._15,
    color: colors.gray, paddingHorizontal: spacingX._10,
  },
  recoverTxt: {
    alignSelf: 'flex-end', marginTop: spacingY._15, marginBottom: spacingY._15,
    color: colors.blue,
  },
  actionButton: {
    backgroundColor: colors.primary, borderRadius: radius._12, marginTop: spacingY._20,
  },
  bottomText: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: spacingY._30,
  },
  // Background circles
  c1: { width: width / 1.5, height: width / 1.5, borderRadius: width / 2, backgroundColor: colors.lightBlue + '50', position: 'absolute', top: '10%', right: '-25%' },
  c2: { width: width / 1.2, height: width / 1.2, borderRadius: width / 2, backgroundColor: '#fee2e2' + '80', position: 'absolute', bottom: '-20%', left: '-15%', opacity: 0.8 },
  orangeCircle: { width: width / 1.5, height: width / 1.5, borderRadius: width / 2, backgroundColor: '#fed7aa' + '50', position: 'absolute', right: '-10%', bottom: '5%', opacity: 0.4 },
});

export default SigninScreen;
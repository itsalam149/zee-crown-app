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
import colors from '../config/colors'; // Adjusted path
import { useState } from 'react';
import { radius, spacingX, spacingY } from '../config/spacing'; // Adjusted path
import Typo from '../components/Typo'; // Adjusted path
import { normalizeY } from '../utils/normalize'; // Adjusted path
import { Octicons } from '@expo/vector-icons';
import AppButton from '../components/AppButton'; // Adjusted path
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase'; // Adjusted path
import Toast from 'react-native-toast-message';
// Import OtpType only if needed for navigation hint (optional)
import { OtpType } from './VerifyOtpScreen'; // Adjust path if needed

const { width, height } = Dimensions.get('screen');
let paddingTop = Platform.OS === 'ios' ? height * 0.07 : spacingY._10;

function SigninScreen(props) {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSecure, setIsSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const clearForm = () => {
    setEmail('');
    setPassword('');
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
      // --- Handle Unconfirmed Email Error ---
      if (error.message.includes('Email not confirmed') || error.code === 'USER_NOT_CONFIRMED') {
        // Tell user to verify their email via OTP using the dedicated screen
        Toast.show({
          type: 'info',
          text1: 'Email Not Verified',
          text2: 'Please check your email for the verification OTP and enter it on the verification screen.',
          visibilityTime: 5000 // Show message longer
        });
        // Optional: Navigate to VerifyOtpScreen automatically if desired
        // Consider adding a small delay if navigating automatically
        // setTimeout(() => {
        //    navigation.navigate('VerifyOtp', { email: email, otpType: OtpType.SIGNUP });
        // }, 100);
      } else if (error.message.includes('Invalid login credentials')) {
        Toast.show({ type: 'error', text1: 'Sign In Failed', text2: 'Incorrect email or password.' });
      } else {
        Toast.show({ type: 'error', text1: 'Sign In Failed', text2: error.message });
      }
    }
    // Success: onAuthStateChange listener in App.js will handle navigation
  };

  const navigateToRegister = () => {
    clearForm();
    navigation.navigate('Register');
  };

  const navigateToForgotPassword = () => {
    clearForm();
    navigation.navigate('ForgotPassword');
  };

  // --- Render Only Password Login ---
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
        {/* Removed OTP switch method button */}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background elements */}
      <View style={styles.background}>
        <View style={[styles.c1, { opacity: 0.5 }]} />
        <View style={[styles.orangeCircle, { bottom: '25%', left: '5%', opacity: 0.5 }]} />
        <View style={[styles.orangeCircle, { opacity: 0.4 }]} />
        <View style={styles.c2} />
      </View>
      {/* Scrollable Form Area */}
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <BlurView intensity={80} tint="light" style={styles.blurView}>
          {renderContent()}

          {/* Register Link */}
          {!loading && (
            <TouchableOpacity
              style={styles.bottomText}
              onPress={navigateToRegister}>
              <Typo>Not a member?</Typo>
              <Typo style={{ color: colors.blue }}> Register now</Typo>
            </TouchableOpacity>
          )}
          {/* Loading indicator can be shown inside AppButton if configured */}
        </BlurView>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { // Ensures content can scroll and centers if screen is tall
    flexGrow: 1,
    justifyContent: 'center',
  },
  blurView: { // Styling for the blurred container
    paddingHorizontal: spacingX._20,
    paddingTop: paddingTop * 0.5, // Reduced top padding inside scroll view
    paddingBottom: spacingY._60, // Space at the bottom for the register link
    borderRadius: radius._20,
    marginHorizontal: spacingX._15, // Side margins
    marginVertical: spacingY._10, // Top/bottom margins
    overflow: 'hidden',
  },
  background: { // Background styling (absolute positioning)
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white // Base background color
  },
  inputView: { // Container for TextInput and icons
    backgroundColor: '#ffffffaa', // Semi-transparent white
    borderRadius: radius._15,
    marginTop: spacingY._15,
    shadowColor: colors.lightBlue, // Shadow for depth
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // Android shadow
    flexDirection: 'row', // Align icon and input horizontally
    alignItems: 'center', // Center items vertically
    paddingRight: spacingX._5, // Space for eye icon
    borderWidth: Platform.OS === 'android' ? 0.5 : 0, // Subtle border on Android
    borderColor: '#0000001A',
  },
  input: { // Style for the email TextInput
    paddingVertical: spacingY._10, // FIX: Reduced vertical padding
    paddingHorizontal: spacingX._20, // Horizontal padding
    fontSize: normalizeY(16), // Dynamic font size
    flex: 1, // Take available horizontal space
    color: colors.black,
    height: 55, // Fixed height for consistency
  },
  passwordInput: { // Style for the password TextInput
    paddingVertical: spacingY._10, // FIX: Reduced vertical padding
    paddingHorizontal: spacingX._20,
    fontSize: normalizeY(16),
    flex: 1,
    color: colors.black,
    height: 55,
  },
  eyeIcon: { // Style for the password visibility toggle touchable area
    paddingHorizontal: spacingX._15,
  },
  text: { // Style for the main title ("Hello Again!")
    fontWeight: '600',
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: spacingY._10,
    marginBottom: spacingY._5,
  },
  body: { // Style for the subtitle ("Welcome back!")
    textAlign: 'center',
    alignSelf: 'center',
    margin: 2,
    marginBottom: spacingY._15,
    color: colors.gray,
    paddingHorizontal: spacingX._10,
  },
  recoverTxt: { // Style for the "Forgot Password?" text
    alignSelf: 'flex-end', // Align to the right
    marginTop: spacingY._15,
    marginBottom: spacingY._15,
    color: colors.blue, // Make it look like a link
  },
  actionButton: { // Style for the main "Sign in" button
    backgroundColor: colors.primary,
    borderRadius: radius._12,
    marginTop: spacingY._20,
  },
  bottomText: { // Style for the "Not a member? Register now" text container
    flexDirection: 'row', // Align text horizontally
    alignItems: 'center',
    justifyContent: 'center', // Center horizontally
    marginTop: spacingY._30, // Space above the text
  },
  // Background decorative circles (position absolutely)
  c1: { width: width / 1.5, height: width / 1.5, borderRadius: width / 2, backgroundColor: colors.lightBlue + '50', position: 'absolute', top: '10%', right: '-25%' },
  c2: { width: width / 1.2, height: width / 1.2, borderRadius: width / 2, backgroundColor: '#fee2e2' + '80', position: 'absolute', bottom: '-20%', left: '-15%', opacity: 0.8 },
  orangeCircle: { width: width / 1.5, height: width / 1.5, borderRadius: width / 2, backgroundColor: '#fed7aa' + '50', position: 'absolute', right: '-10%', bottom: '5%', opacity: 0.4 },
});

export default SigninScreen;
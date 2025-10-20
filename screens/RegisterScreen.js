// screens/RegisterScreen.js
import {
  StyleSheet,
  View,
  SafeAreaView,
  Dimensions,
  Platform,
  TextInput,
  TouchableOpacity,
  ScrollView, // <-- Import ScrollView
  ActivityIndicator, // Added for loading
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
// Import the OTP type enum from VerifyOtpScreen
import { OtpType } from './VerifyOtpScreen'; // Adjust path if needed

const { width, height } = Dimensions.get('screen');
let paddingTop = Platform.OS === 'ios' ? height * 0.07 : spacingY._10;

function RegisterScreen(props) {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSecure, setIsSecure] = useState(true);
  const [isConfirmSecure, setIsConfirmSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const clearForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleRegister = async () => {
    // --- Input Validation ---
    if (!name || !email || !password || !confirmPassword || !phone) {
      Toast.show({ type: 'error', text1: 'Input Error', text2: 'Please fill in all fields.' });
      return;
    }
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail(email)) {
      Toast.show({ type: 'error', text1: 'Input Error', text2: 'Please enter a valid email address.' });
      return;
    }
    const isValidPassword = (password) => password.length >= 6;
    if (!isValidPassword(password)) {
      Toast.show({ type: 'error', text1: 'Password Error', text2: 'Password must be at least 6 characters.' });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Password Error', text2: 'Passwords do not match.' });
      return;
    }
    // --- End Validation ---

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name,
          phone_number: phone,
        },
        // No emailRedirectTo needed here when Confirm Email is OFF
      },
    });

    setLoading(false);

    if (error) {
      Toast.show({ type: 'error', text1: 'Registration Error', text2: error.message });
    } else if (data.user && !data.session) {
      // User created, OTP sent (because "Confirm email" is OFF in Supabase settings)
      Toast.show({
        type: 'info', // Use info, as action is still needed
        text1: 'Check Your Email',
        text2: 'An OTP has been sent. Please enter it on the next screen.',
        visibilityTime: 5000,
      });
      const registeredEmail = email; // Capture email before clearing
      clearForm();
      // --- NAVIGATE TO VerifyOtpScreen ---
      // Use setTimeout to allow state updates to settle before navigating
      setTimeout(() => {
        navigation.navigate('VerifyOtp', { // Navigate to the new screen
          email: registeredEmail,
          otpType: OtpType.SIGNUP, // Specify the type
        });
      }, 0);
    } else if (data.user && data.session) {
      // This case might happen if auto-confirm is somehow enabled or during testing.
      // Treat as successful, but maybe log a warning.
      console.warn("User signed up and received a session immediately - check Supabase email confirmation settings.");
      Toast.show({ type: 'success', text1: 'Registration Successful!', text2: 'You are now signed in.' });
      clearForm(); // Still clear form
      // Let the Auth listener in App.js handle navigation
    }
    else {
      // Handle unexpected cases
      Toast.show({ type: 'error', text1: 'Registration Issue', text2: 'An unexpected issue occurred.' });
    }
  };

  const navigateToSignIn = () => {
    clearForm();
    navigation.navigate('Signin'); // Go to Signin in default (password) mode
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background elements */}
      <View style={styles.background}>
        <View style={[styles.c1, { opacity: 0.7 }]} />
        <View style={[styles.pinkCircle, { opacity: 0.7 }]} />
        <View style={[styles.c2, { opacity: 0.7 }]} />
      </View>
      {/* Scrollable Form Area */}
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <BlurView intensity={80} tint="light" style={styles.blurView}>
          <Typo size={26} style={styles.text}>
            Hello There!
          </Typo>
          <Typo size={20} style={styles.body}>
            Join Us to Unlock a World of Shopping Delights!
          </Typo>

          {/* Form Inputs */}
          <View style={styles.inputView}>
            <TextInput value={name} onChangeText={setName} placeholder="Enter name" placeholderTextColor="grey" style={styles.input} autoCapitalize="words" />
          </View>
          <View style={styles.inputView}>
            <TextInput value={email} onChangeText={setEmail} placeholder="Enter email" placeholderTextColor="grey" style={styles.input} autoCapitalize="none" keyboardType="email-address" />
          </View>
          <View style={styles.inputView}>
            <TextInput value={phone} onChangeText={setPhone} placeholder="Enter mobile number" placeholderTextColor="grey" style={styles.input} keyboardType="phone-pad" />
          </View>
          <View style={styles.inputView}>
            <TextInput value={password} onChangeText={setPassword} placeholder="Password (min 6 chars)" placeholderTextColor="grey" style={styles.passwordInput} secureTextEntry={isSecure} />
            <TouchableOpacity onPress={() => setIsSecure(!isSecure)} style={styles.eyeIcon}>
              <Octicons name={isSecure ? "eye-closed" : "eye"} size={20} color="grey" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputView}>
            <TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm Password" placeholderTextColor="grey" style={styles.passwordInput} secureTextEntry={isConfirmSecure} />
            <TouchableOpacity onPress={() => setIsConfirmSecure(!isConfirmSecure)} style={styles.eyeIcon}>
              <Octicons name={isConfirmSecure ? "eye-closed" : "eye"} size={20} color="grey" />
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <AppButton
            onPress={handleRegister}
            label={loading ? 'Registering...' : 'Register'}
            loading={loading} // Pass loading state to AppButton if enhanced
            disabled={loading}
            style={styles.registerButton}
          />

          {/* Sign In Link */}
          <TouchableOpacity
            style={styles.bottomText}
            onPress={navigateToSignIn}>
            <Typo>Already a member?</Typo>
            <Typo style={{ color: colors.blue }}> Signin</Typo>
          </TouchableOpacity>
        </BlurView>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1, // Allows content to take height if needed
    justifyContent: 'center', // Center content vertically if screen is tall
  },
  blurView: { // Apply blur styling here
    paddingHorizontal: spacingX._20,
    paddingTop: paddingTop * 0.5, // Adjust padding inside scroll
    paddingBottom: spacingY._40, // Ensure space at the bottom
    borderRadius: radius._20,
    marginHorizontal: spacingX._15, // Add margin to see background effect
    marginVertical: spacingY._10,
    overflow: 'hidden',
  },
  background: {
    flex: 1, ...StyleSheet.absoluteFillObject, backgroundColor: colors.white // Optional: set a base background
  },
  inputView: {
    backgroundColor: '#ffffffaa', borderRadius: radius._15, marginTop: spacingY._15,
    shadowColor: colors.lightPink, shadowOffset: { height: 1, width: 0 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, // Softer shadow
    flexDirection: 'row', alignItems: 'center', paddingRight: spacingX._5, // Reduced padding for icon
    borderWidth: Platform.OS === 'android' ? 0.5 : 0, // Hairline border for Android
    borderColor: '#0000001A',
  },
  input: {
    paddingVertical: spacingY._15, paddingHorizontal: spacingX._20, // Slightly reduced padding
    fontSize: normalizeY(16), flex: 1, color: colors.black, height: 55, // Fixed height
  },
  passwordInput: {
    paddingVertical: spacingY._15, paddingHorizontal: spacingX._20, // Slightly reduced padding
    fontSize: normalizeY(16), flex: 1, color: colors.black, height: 55, // Fixed height
  },
  eyeIcon: {
    paddingHorizontal: spacingX._15,
  },
  text: {
    fontWeight: '600', textAlign: 'center', alignSelf: 'center', marginTop: spacingY._20, // Adjusted top margin
    marginBottom: spacingY._5,
  },
  body: {
    textAlign: 'center', alignSelf: 'center', marginVertical: spacingY._10, color: colors.gray,
  },
  registerButton: {
    backgroundColor: colors.primary, borderRadius: radius._12, marginTop: spacingY._25, // Reduced top margin
  },
  bottomText: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: spacingX._5,
    marginTop: spacingY._25, // Increased margin
  },
  // Background circles - adjusted for better visuals
  c1: { width: width, height: width / 1.8, borderRadius: width / 2, backgroundColor: colors.lightBlue + '50', position: 'absolute', top: '-10%', right: '-30%' },
  c2: { height: normalizeY(150), backgroundColor: colors.lightPink + '50', width: '100%', position: 'absolute', bottom: 0, left: 0 },
  pinkCircle: { width: width / 1.6, height: width / 1.6, borderRadius: width / 2, backgroundColor: colors.lightPink + '50', position: 'absolute', top: '5%', left: '-25%' },
});

export default RegisterScreen;
// screens/RegisterScreen.js
import {
  StyleSheet,
  View,
  SafeAreaView,
  Dimensions,
  Platform,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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
import { OtpType } from './VerifyOtpScreen'; // Adjust path if needed

const { width, height } = Dimensions.get('screen');
let paddingTop = Platform.OS === 'ios' ? height * 0.07 : spacingY._10;

function RegisterScreen() {
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
    if (!name || !email || !password || !confirmPassword || !phone) {
      Toast.show({
        type: 'error',
        text1: 'Input Error',
        text2: 'Please fill in all fields.',
      });
      return;
    }

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail(email)) {
      Toast.show({
        type: 'error',
        text1: 'Input Error',
        text2: 'Please enter a valid email address.',
      });
      return;
    }

    const isValidPassword = (password) => password.length >= 6;
    if (!isValidPassword(password)) {
      Toast.show({
        type: 'error',
        text1: 'Password Error',
        text2: 'Password must be at least 6 characters.',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Error',
        text2: 'Passwords do not match.',
      });
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name,
          phone_number: phone,
        },
      },
    });

    setLoading(false);

    if (error) {
      console.error('Registration Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Registration Error',
        text2: error.message,
      });
    } else if (data.user && !data.session) {
      Toast.show({
        type: 'info',
        text1: 'Check Your Email',
        text2: 'An OTP has been sent. Please verify your email.',
        visibilityTime: 5000,
      });

      const registeredEmail = email;
      clearForm();

      setTimeout(() => {
        navigation.navigate('VerifyOtp', {
          email: registeredEmail,
          otpType: OtpType.SIGNUP,
        });
      }, 0);
    } else if (data.user && data.session) {
      console.warn(
        "User registered and received session immediately. Check Supabase 'Email Auto Confirmation' setting."
      );
      Toast.show({
        type: 'success',
        text1: 'Registration Successful!',
        text2: 'You are now signed in.',
      });
      clearForm();
    } else {
      console.error('Registration: Unexpected response', data);
      Toast.show({
        type: 'error',
        text1: 'Registration Issue',
        text2: 'An unexpected issue occurred.',
      });
    }
  };

  const navigateToSignIn = () => {
    clearForm();
    navigation.navigate('Signin');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background */}
      <View style={styles.background}>
        <View style={[styles.c1, { opacity: 0.7 }]} />
        <View style={[styles.pinkCircle, { opacity: 0.7 }]} />
        <View style={[styles.c2, { opacity: 0.7 }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <BlurView intensity={80} tint="light" style={styles.blurView}>
          <Typo size={26} style={styles.text}>
            Hello There!
          </Typo>
          <Typo size={20} style={styles.body}>
            Join Us to Unlock a World of Shopping Delights!
          </Typo>

          {/* Form Inputs */}
          <View style={styles.inputView}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              placeholderTextColor="grey"
              style={styles.input}
              autoCapitalize="words"
            />
          </View>

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
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter mobile number"
              placeholderTextColor="grey"
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputView}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password (min 6 chars)"
              placeholderTextColor="grey"
              style={styles.passwordInput}
              secureTextEntry={isSecure}
            />
            <TouchableOpacity
              onPress={() => setIsSecure(!isSecure)}
              style={styles.eyeIcon}
            >
              <Octicons
                name={isSecure ? 'eye-closed' : 'eye'}
                size={20}
                color="grey"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputView}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              placeholderTextColor="grey"
              style={styles.passwordInput}
              secureTextEntry={isConfirmSecure}
            />
            <TouchableOpacity
              onPress={() => setIsConfirmSecure(!isConfirmSecure)}
              style={styles.eyeIcon}
            >
              <Octicons
                name={isConfirmSecure ? 'eye-closed' : 'eye'}
                size={20}
                color="grey"
              />
            </TouchableOpacity>
          </View>

          <AppButton
            onPress={handleRegister}
            label={loading ? 'Registering...' : 'Register'}
            loading={loading}
            disabled={loading}
            style={styles.registerButton}
          />

          <TouchableOpacity style={styles.bottomText} onPress={navigateToSignIn}>
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
    flexGrow: 1,
    justifyContent: 'center',
  },
  blurView: {
    paddingHorizontal: spacingX._20,
    paddingTop: paddingTop * 0.5,
    paddingBottom: spacingY._40,
    borderRadius: radius._20,
    marginHorizontal: spacingX._15,
    marginVertical: spacingY._10,
    overflow: 'hidden',
  },
  background: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
  },
  inputView: {
    backgroundColor: '#ffffffaa',
    borderRadius: radius._15,
    marginTop: spacingY._15,
    shadowColor: colors.lightPink,
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacingX._5,
    borderWidth: Platform.OS === 'android' ? 0.5 : 0,
    borderColor: '#0000001A',
  },
  input: {
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._20,
    fontSize: normalizeY(16),
    flex: 1,
    color: colors.black,
    height: 55,
  },
  passwordInput: {
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._20,
    fontSize: normalizeY(16),
    flex: 1,
    color: colors.black,
    height: 55,
  },
  eyeIcon: {
    paddingHorizontal: spacingX._15,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: spacingY._20,
    marginBottom: spacingY._5,
  },
  body: {
    textAlign: 'center',
    alignSelf: 'center',
    marginVertical: spacingY._10,
    color: colors.gray,
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: radius._12,
    marginTop: spacingY._25,
  },
  bottomText: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacingX._5,
    marginTop: spacingY._25,
  },
  c1: {
    width: width,
    height: width / 1.8,
    borderRadius: width / 2,
    backgroundColor: colors.lightBlue + '50',
    position: 'absolute',
    top: '-10%',
    right: '-30%',
  },
  c2: {
    height: normalizeY(150),
    backgroundColor: colors.lightPink + '50',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  pinkCircle: {
    width: width / 1.6,
    height: width / 1.6,
    borderRadius: width / 2,
    backgroundColor: colors.lightPink + '50',
    position: 'absolute',
    top: '5%',
    left: '-25%',
  },
});

export default RegisterScreen;

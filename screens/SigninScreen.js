// screens/SigninScreen.js
import {
  StyleSheet,
  View,
  SafeAreaView,
  Dimensions,
  Platform,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { BlurView } from 'expo-blur';
import colors from '../config/colors';
import { useState } from 'react';
import { radius, spacingX, spacingY } from '../config/spacing';
import Typo from '../components/Typo';
import { normalizeY } from '../utils/normalize';
import { Octicons } from '@expo/vector-icons';
import AppButton from '../components/AppButton';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import Toast from 'react-native-toast-message';
import { OtpType } from './VerifyOtpScreen';

const { width, height } = Dimensions.get('screen');

// Responsive helper functions
const isSmallDevice = height < 700;
const isMediumDevice = height >= 700 && height < 900;
const isLargeDevice = height >= 900;

// Responsive spacing
const getResponsiveSpacing = () => {
  if (isSmallDevice) {
    return {
      topPadding: Platform.OS === 'ios' ? height * 0.02 : spacingY._5,
      titleSize: 22,
      subtitleSize: 16,
      inputHeight: 48,
      fontSize: 14,
      verticalGap: spacingY._10,
      buttonMargin: spacingY._15,
      blurPaddingVertical: spacingY._15,
      bottomMargin: spacingY._20,
    };
  } else if (isMediumDevice) {
    return {
      topPadding: Platform.OS === 'ios' ? height * 0.04 : spacingY._10,
      titleSize: 26,
      subtitleSize: 18,
      inputHeight: 55,
      fontSize: 16,
      verticalGap: spacingY._15,
      buttonMargin: spacingY._20,
      blurPaddingVertical: spacingY._25,
      bottomMargin: spacingY._30,
    };
  } else {
    return {
      topPadding: Platform.OS === 'ios' ? height * 0.05 : spacingY._15,
      titleSize: 30,
      subtitleSize: 20,
      inputHeight: 60,
      fontSize: 18,
      verticalGap: spacingY._20,
      buttonMargin: spacingY._25,
      blurPaddingVertical: spacingY._30,
      bottomMargin: spacingY._35,
    };
  }
};

const responsiveValues = getResponsiveSpacing();

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
        Toast.show({
          type: 'info',
          text1: 'Email Not Verified',
          text2: 'Please check your email for the verification OTP and enter it on the verification screen.',
          visibilityTime: 5000
        });
      } else if (error.message.includes('Invalid login credentials')) {
        Toast.show({ type: 'error', text1: 'Sign In Failed', text2: 'Incorrect email or password.' });
      } else {
        Toast.show({ type: 'error', text1: 'Sign In Failed', text2: error.message });
      }
    }
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
        <Typo size={responsiveValues.titleSize} style={styles.text}>Hello Again!</Typo>
        <Typo size={responsiveValues.subtitleSize} style={styles.body}>Welcome back!</Typo>
        <View style={styles.inputView}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            placeholderTextColor="grey"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
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
            returnKeyType="done"
            onSubmitEditing={handlePasswordSignIn}
          />
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)} style={styles.eyeIcon}>
            <Octicons name={isSecure ? "eye-closed" : "eye"} size={responsiveValues.fontSize + 4} color="grey" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={navigateToForgotPassword}>
          <Typo style={styles.recoverTxt}>Forgot Password?</Typo>
        </TouchableOpacity>
        <AppButton
          onPress={handlePasswordSignIn}
          label={loading ? "Signing In..." : "Sign in"}
          loading={loading}
          disabled={loading}
          style={styles.actionButton}
        />
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

      {/* KeyboardAvoidingView for iOS keyboard handling */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* TouchableWithoutFeedback to dismiss keyboard when tapping outside */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <BlurView intensity={80} tint="light" style={styles.blurView}>
              {renderContent()}

              {/* Register Link */}
              {!loading && (
                <TouchableOpacity
                  style={styles.bottomText}
                  onPress={navigateToRegister}>
                  <Typo size={responsiveValues.fontSize - 2}>Not a member?</Typo>
                  <Typo size={responsiveValues.fontSize - 2} style={{ color: colors.blue }}> Register now</Typo>
                </TouchableOpacity>
              )}
            </BlurView>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: isSmallDevice ? spacingY._10 : responsiveValues.blurPaddingVertical,
  },
  blurView: {
    paddingHorizontal: width < 375 ? spacingX._15 : spacingX._20,
    paddingTop: responsiveValues.topPadding,
    paddingBottom: responsiveValues.blurPaddingVertical,
    borderRadius: radius._20,
    marginHorizontal: width < 375 ? spacingX._10 : spacingX._15,
    marginVertical: spacingY._10,
    overflow: 'hidden',
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  background: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white
  },
  inputView: {
    backgroundColor: '#ffffffaa',
    borderRadius: radius._15,
    marginTop: responsiveValues.verticalGap,
    shadowColor: colors.lightBlue,
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacingX._5,
    borderWidth: Platform.OS === 'android' ? 0.5 : 0,
    borderColor: '#0000001A',
    minHeight: responsiveValues.inputHeight,
  },
  input: {
    paddingVertical: Platform.OS === 'ios' ? spacingY._8 : spacingY._5,
    paddingHorizontal: width < 375 ? spacingX._15 : spacingX._20,
    fontSize: responsiveValues.fontSize,
    flex: 1,
    color: colors.black,
    height: responsiveValues.inputHeight,
  },
  passwordInput: {
    paddingVertical: Platform.OS === 'ios' ? spacingY._8 : spacingY._5,
    paddingHorizontal: width < 375 ? spacingX._15 : spacingX._20,
    fontSize: responsiveValues.fontSize,
    flex: 1,
    color: colors.black,
    height: responsiveValues.inputHeight,
  },
  eyeIcon: {
    paddingHorizontal: width < 375 ? spacingX._10 : spacingX._15,
    paddingVertical: spacingY._10,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: spacingY._10,
    marginBottom: spacingY._5,
  },
  body: {
    textAlign: 'center',
    alignSelf: 'center',
    margin: 2,
    marginBottom: responsiveValues.verticalGap,
    color: colors.gray,
    paddingHorizontal: spacingX._10,
  },
  recoverTxt: {
    alignSelf: 'flex-end',
    marginTop: responsiveValues.verticalGap,
    marginBottom: responsiveValues.verticalGap,
    color: colors.blue,
    fontSize: responsiveValues.fontSize - 2,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: radius._12,
    marginTop: responsiveValues.buttonMargin,
    minHeight: responsiveValues.inputHeight,
  },
  bottomText: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: responsiveValues.bottomMargin,
    flexWrap: 'wrap',
  },
  // Background decorative circles (responsive sizing)
  c1: {
    width: width / 1.5,
    height: width / 1.5,
    borderRadius: width / 2,
    backgroundColor: colors.lightBlue + '50',
    position: 'absolute',
    top: '10%',
    right: '-25%'
  },
  c2: {
    width: width / 1.2,
    height: width / 1.2,
    borderRadius: width / 2,
    backgroundColor: '#fee2e2' + '80',
    position: 'absolute',
    bottom: '-20%',
    left: '-15%',
    opacity: 0.8
  },
  orangeCircle: {
    width: width / 1.5,
    height: width / 1.5,
    borderRadius: width / 2,
    backgroundColor: '#fed7aa' + '50',
    position: 'absolute',
    right: '-10%',
    bottom: '5%',
    opacity: 0.4
  },
});

export default SigninScreen;
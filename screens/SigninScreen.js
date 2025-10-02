// screens/SigninScreen.js
import {
  StyleSheet,
  View,
  SafeAreaView,
  Dimensions,
  Platform,
  TextInput,
  TouchableOpacity,
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

  const handleSignIn = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Input Error', text2: 'Please enter both email and password.' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Toast.show({ type: 'error', text1: 'Sign In Error', text2: error.message });
    }
    setLoading(false);
  };

  const navigateToRegister = () => {
    clearForm();
    navigation.navigate('Register');
  };

  const navigateToForgotPassword = () => {
    clearForm();
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        <View style={[styles.c1, { opacity: 0.5 }]} />
        <View style={[styles.orangeCircle, { bottom: '25%', left: '5%', opacity: 0.5 }]} />
        <View style={[styles.orangeCircle, { opacity: 0.4 }]} />
        <View style={styles.c2} />
      </View>
      <BlurView intensity={100} tint="light" style={styles.blurContainer}>
        <Typo size={26} style={styles.text}>
          Hello Again!
        </Typo>
        <View style={{ marginVertical: '5%' }}>
          <Typo size={20} style={styles.body}>
            Welcome back you've
          </Typo>
          <Typo size={20} style={styles.body}>
            been missed!
          </Typo>
        </View>
        <View style={styles.inputView}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
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
            style={styles.input}
            secureTextEntry={isSecure}
          />
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)}>
            <Octicons name={isSecure ? "eye-closed" : "eye"} size={20} color="grey" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={navigateToForgotPassword}>
          <Typo style={styles.recoverTxt}>Recovery Password</Typo>
        </TouchableOpacity>
        <AppButton
          onPress={handleSignIn}
          label={loading ? "Signing In..." : "Sign in"}
          disabled={loading}
          style={{ backgroundColor: colors.primary, borderRadius: radius._12 }}
        />
        <TouchableOpacity
          style={styles.bottomText}
          onPress={navigateToRegister}>
          <Typo>Not a member?</Typo>
          <Typo style={{ color: colors.blue }}>Register now</Typo>
        </TouchableOpacity>
      </BlurView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurContainer: {
    ...StyleSheet.absoluteFill,
    paddingTop: paddingTop,
    padding: spacingY._20,
    paddingBottom: '10%',
    textAlign: 'center',
    overflow: 'hidden',
    borderRadius: radius._20,
  },
  background: {
    flex: 1,
    paddingBottom: '10%',
    justifyContent: 'flex-end',
    ...StyleSheet.absoluteFill,
  },
  inputView: {
    backgroundColor: colors.white,
    borderRadius: radius._15,
    borderCurve: 'continuous',
    marginTop: spacingY._15,
    shadowColor: colors.lightBlue,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.9,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacingX._15,
  },
  input: {
    paddingVertical: spacingY._20,
    paddingHorizontal: spacingX._20,
    fontSize: normalizeY(16),
    flex: 1,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: '15%',
  },
  body: {
    textAlign: 'center',
    alignSelf: 'center',
    margin: 2,
  },
  recoverTxt: {
    alignSelf: 'flex-end',
    marginTop: spacingY._15,
    marginBottom: '7%',
  },
  c1: {
    width: width / 1.5,
    height: width / 1.5,
    borderRadius: width / 2,
    backgroundColor: colors.lightBlue,
    alignSelf: 'flex-end',
  },
  c2: {
    width: width / 1.2,
    height: width / 1.2,
    borderRadius: width / 2,
    backgroundColor: '#fee2e2',
    opacity: 0.8,
    marginBottom: 50,
    alignSelf: 'flex-end',
  },
  orangeCircle: {
    width: width / 1.5,
    height: width / 1.5,
    borderRadius: width / 2,
    backgroundColor: '#fed7aa',
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  bottomText: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacingX._5,
    marginTop: 'auto',
    paddingBottom: spacingY._15,
  },
});

export default SigninScreen;
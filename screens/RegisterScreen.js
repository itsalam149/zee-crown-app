// screens/RegisterScreen.js
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

function RegisterScreen(props) {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSecure, setIsSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const clearForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      Toast.show({ type: 'error', text1: 'Input Error', text2: 'Please fill in all fields.' });
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
      Toast.show({ type: 'error', text1: 'Registration Error', text2: error.message });
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      Toast.show({ type: 'error', text1: 'Registration Failed', text2: 'This email is already in use.' });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Registration Successful!',
        text2: 'Please check your email to verify your account.',
      });
      clearForm();
      navigation.navigate('Signin');
    }
  };

  const navigateToSignIn = () => {
    clearForm();
    navigation.navigate('Signin');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        <View style={[styles.c1, { opacity: 0.7 }]} />
        <View style={[styles.pinkCircle, { opacity: 0.7 }]} />
        <View style={[styles.c2, { opacity: 0.7 }]} />
      </View>
      <BlurView intensity={100} tint="light" style={styles.blurContainer}>
        <Typo size={26} style={styles.text}>
          Hello There!
        </Typo>
        <View style={{ marginVertical: '5%' }}>
          <Typo size={20} style={styles.body}>
            Join Us to Unlock a World
          </Typo>
          <Typo size={20} style={styles.body}>
            of Shopping Delights!
          </Typo>
        </View>
        <View style={styles.inputView}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            style={styles.input}
            autoCapitalize="words"
          />
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
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter mobile number"
            style={styles.input}
            keyboardType="phone-pad"
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
        <AppButton
          onPress={handleRegister}
          label={loading ? 'Registering...' : 'Register'}
          disabled={loading}
          style={{
            backgroundColor: colors.primary,
            borderRadius: radius._12,
            marginTop: spacingY._40,
          }}
        />

        <TouchableOpacity
          style={styles.bottomText}
          onPress={navigateToSignIn}>
          <Typo>Already a member?</Typo>
          <Typo style={{ color: colors.blue }}>Signin</Typo>
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
    padding: spacingX._20,
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
    marginTop: spacingY._15,
    shadowColor: colors.lightPink,
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
  c1: {
    width: width / 1.5,
    height: width / 1.5,
    borderRadius: width / 2,
    backgroundColor: colors.lightBlue,
    alignSelf: 'flex-end',
    position: 'absolute',
    top: '25%',
  },
  c2: {
    height: normalizeY(100),
    backgroundColor: colors.lightPink,
    width: '90%',
    alignSelf: 'center',
    bottom: '25%',
  },
  pinkCircle: {
    width: width / 1.5,
    height: width / 1.5,
    borderRadius: width / 2,
    backgroundColor: colors.lightPink,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bottomText: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacingX._5,
    marginTop: 'auto',
    paddingBottom: spacingY._20,
  },
});

export default RegisterScreen;
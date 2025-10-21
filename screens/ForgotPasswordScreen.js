// screens/ForgotPasswordScreen.js
import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Dimensions,
    Platform,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import colors from '../config/colors'; // Adjust path
import { radius, spacingX, spacingY } from '../config/spacing'; // Adjust path
import Typo from '../components/Typo'; // Adjust path
import AppButton from '../components/AppButton'; // Adjust path
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase'; // Adjust path
import { normalizeY } from '../utils/normalize'; // Adjust path
import Toast from 'react-native-toast-message';
// Import OtpType from VerifyOtpScreen
import { OtpType } from './VerifyOtpScreen'; // Adjust path if needed

const { width, height } = Dimensions.get('screen');
let paddingTop = Platform.OS === 'ios' ? height * 0.07 : spacingY._10;

function ForgotPasswordScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // --- Send OTP to Email ---
    const handleSendOtp = async () => {
        if (!email) {
            Toast.show({ type: 'error', text1: 'Input Error', text2: 'Please enter your email address.' });
            return;
        }
        setLoading(true);
        console.log("ForgotPasswordScreen: Sending password reset OTP for", email); // Log
        const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: { shouldCreateUser: false, }
        });

        setLoading(false);
        if (error) {
            console.error("ForgotPasswordScreen: Error sending OTP:", error); // Log
            Toast.show({ type: 'error', text1: 'Error Sending OTP', text2: error.message });
        } else {
            console.log("ForgotPasswordScreen: OTP sent successfully."); // Log
            Toast.show({
                type: 'success',
                text1: 'Check your email',
                text2: 'An OTP has been sent to reset your password.',
            });
            // Navigate to VerifyOtpScreen
            console.log("ForgotPasswordScreen: Navigating to VerifyOtp with nextScreen='SetNewPassword'"); // Log
            navigation.navigate('VerifyOtp', {
                email: email,
                otpType: OtpType.PASSWORD_RESET,
                nextScreen: 'SetNewPassword', // <-- Ensure this matches AuthNavigator name
            });
        }
    };

    // --- Render ---
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.background}>
                <View style={[styles.c1, { opacity: 0.5 }]} />
                <View style={[styles.orangeCircle, { bottom: '25%', left: '5%', opacity: 0.5 }]} />
                <View style={[styles.orangeCircle, { opacity: 0.4 }]} />
                <View style={styles.c2} />
            </View>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <BlurView intensity={100} tint="light" style={styles.blurContainer}>
                    <View style={styles.contentView}>
                        <Typo size={26} style={styles.text}>Forgot Password?</Typo>
                        <Typo size={16} style={styles.body}>
                            Enter your email address below and we'll send you an OTP to reset your password.
                        </Typo>
                        <View style={styles.inputView}>
                            <TextInput
                                value={email} onChangeText={setEmail}
                                placeholder="Enter your email" style={styles.input}
                                autoCapitalize="none" keyboardType="email-address"
                            />
                        </View>
                        <AppButton
                            onPress={handleSendOtp}
                            label={loading ? 'Sending OTP...' : 'Send OTP'}
                            loading={loading}
                            disabled={loading}
                            style={styles.actionButton}
                        />
                    </View>
                    {!loading && (
                        <TouchableOpacity
                            style={styles.bottomText}
                            onPress={() => navigation.navigate('Signin')}>
                            <Typo style={{ color: colors.blue }}>Back to Sign In</Typo>
                        </TouchableOpacity>
                    )}
                </BlurView>
            </ScrollView>
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    blurContainer: {
        flexGrow: 1, paddingHorizontal: spacingX._20, paddingTop: paddingTop,
        paddingBottom: spacingY._20, borderRadius: radius._20,
        marginHorizontal: spacingX._10, marginVertical: spacingY._10,
        overflow: 'hidden', justifyContent: 'space-between',
    },
    contentView: { alignItems: 'center', },
    background: { flex: 1, ...StyleSheet.absoluteFillObject, backgroundColor: colors.white },
    inputView: {
        backgroundColor: colors.white, borderRadius: radius._15, marginTop: spacingY._15,
        shadowColor: colors.lightBlue, shadowOffset: { height: 1, width: 0 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
        flexDirection: 'row', alignItems: 'center', paddingRight: spacingX._15,
        borderWidth: Platform.OS === 'android' ? 0.5 : 0, borderColor: '#0000001A',
        width: '95%',
    },
    input: {
        paddingVertical: spacingY._10, // Reduced padding
        paddingHorizontal: spacingX._20,
        fontSize: normalizeY(16), flex: 1, color: colors.black, height: 55,
    },
    text: {
        fontWeight: '600', textAlign: 'center', alignSelf: 'center',
        marginTop: spacingY._10, marginBottom: spacingY._10,
    },
    body: {
        textAlign: 'center', alignSelf: 'center', marginBottom: spacingY._20,
        color: colors.gray, paddingHorizontal: spacingX._10, width: '95%',
    },
    actionButton: {
        backgroundColor: colors.primary, borderRadius: radius._12, marginTop: spacingY._20, width: '95%',
    },
    bottomText: { alignSelf: 'center', paddingBottom: spacingY._10, },
    // Background circles
    c1: { width: width / 1.5, height: width / 1.5, borderRadius: width / 2, backgroundColor: colors.lightBlue + '50', position: 'absolute', top: '10%', right: '-25%' },
    c2: { width: width / 1.2, height: width / 1.2, borderRadius: width / 2, backgroundColor: '#fee2e2' + '80', position: 'absolute', bottom: '-20%', left: '-15%', opacity: 0.8 },
    orangeCircle: { width: width / 1.5, height: width / 1.5, borderRadius: width / 2, backgroundColor: '#fed7aa' + '50', position: 'absolute', right: '-10%', bottom: '5%', opacity: 0.4 },
});

export default ForgotPasswordScreen;
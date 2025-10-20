// screens/VerifyOtpScreen.js
import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Dimensions,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';
import Typo from 'components/Typo';
import AppButton from 'components/AppButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { normalizeY } from 'utils/normalize';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('screen');
let paddingTop = Platform.OS === 'ios' ? height * 0.07 : spacingY._10;

// Define OTP types
export const OtpType = {
    SIGNUP: 'signup',
    PASSWORD_RESET: 'email', // Supabase uses 'email' type for password reset OTPs sent via email
};

function VerifyOtpScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { email, otpType, nextScreen, nextScreenParams } = route.params; // Get email and type from navigation

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const isSignupOtp = otpType === OtpType.SIGNUP;
    const title = isSignupOtp ? 'Verify Your Email' : 'Enter Password Reset Code';
    const description = `Enter the 6-digit code sent to ${email}.`;

    // --- Verify OTP ---
    const handleVerifyOtp = async () => {
        if (!email || !otp || otp.length !== 6) {
            Toast.show({ type: 'error', text1: 'Input Error', text2: 'Please enter the 6-digit OTP.' });
            return;
        }
        setLoading(true);
        const { data, error } = await supabase.auth.verifyOtp({
            email: email,
            token: otp,
            type: otpType, // Use the type passed via navigation ('signup' or 'email')
        });
        setLoading(false);

        if (error) {
            Toast.show({ type: 'error', text1: 'OTP Verification Failed', text2: error.message });
        } else if (data.session) {
            // For signup: Auth listener in App.js will handle navigation into the app.
            // For password reset: Navigate to the next step (Set New Password).
            if (!isSignupOtp && nextScreen) {
                Toast.show({ type: 'success', text1: 'OTP Verified', text2: 'You can now set a new password.' });
                // Navigate to the screen specified by ForgotPasswordScreen
                navigation.navigate(nextScreen, { email: email, ...(nextScreenParams || {}) });
            } else if (isSignupOtp) {
                Toast.show({ type: 'success', text1: 'Email Verified!', text2: 'Sign in successful.' });
                // App.js listener will handle navigating into the app
            }
        } else {
            Toast.show({ type: 'error', text1: 'Verification Issue', text2: 'Could not verify OTP. Please try again.' });
        }
    };

    // --- Resend OTP ---
    const handleResendOtp = async () => {
        if (!email) return;
        setResendLoading(true);

        let error = null;
        if (isSignupOtp) {
            // Resend confirmation OTP
            ({ error } = await supabase.auth.resend({ type: 'signup', email: email }));
        } else {
            // Resend password reset OTP
            ({ error } = await supabase.auth.signInWithOtp({
                email: email,
                options: { shouldCreateUser: false } // Important for password reset
            }));
        }

        setResendLoading(false);
        if (error) {
            Toast.show({ type: 'error', text1: 'Error Resending OTP', text2: error.message });
        } else {
            Toast.show({ type: 'success', text1: 'OTP Resent', text2: 'Check your email for a new OTP.' });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.background}>
                {/* Background Circles */}
                <View style={[styles.c1, { opacity: 0.5 }]} />
                <View style={[styles.orangeCircle, { bottom: '25%', left: '5%', opacity: 0.5 }]} />
                <View style={[styles.orangeCircle, { opacity: 0.4 }]} />
                <View style={styles.c2} />
            </View>
            <BlurView intensity={100} tint="light" style={styles.blurContainer}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
                    <Typo size={26} style={styles.text}>{title}</Typo>
                    <Typo size={16} style={styles.body}>{description}</Typo>

                    <View style={styles.inputView}>
                        <TextInput
                            value={otp}
                            onChangeText={setOtp}
                            placeholder="Enter 6-digit OTP"
                            placeholderTextColor="grey"
                            style={styles.input}
                            autoCapitalize="none"
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                    </View>
                    <AppButton
                        onPress={handleVerifyOtp}
                        label={loading ? 'Verifying...' : 'Verify Code'}
                        loading={loading} // Pass loading state if AppButton supports it
                        disabled={loading || resendLoading}
                        style={styles.actionButton}
                    />
                    <TouchableOpacity style={styles.linkButton} onPress={handleResendOtp} disabled={loading || resendLoading}>
                        <Typo style={{ color: colors.gray }}>{resendLoading ? 'Resending...' : 'Resend OTP'}</Typo>
                    </TouchableOpacity>

                    {/* Allow navigating back for password reset */}
                    {!isSignupOtp && (
                        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
                            <Typo style={{ color: colors.blue }}>Enter different email?</Typo>
                        </TouchableOpacity>
                    )}
                </ScrollView>
                {/* Back to Sign In button (always visible except during loading) */}
                {!loading && !resendLoading && (
                    <TouchableOpacity
                        style={styles.bottomText}
                        onPress={() => navigation.navigate('Signin')}>
                        <Typo style={{ color: colors.blue }}>Back to Sign In</Typo>
                    </TouchableOpacity>
                )}
            </BlurView>
        </SafeAreaView>
    );
}

// --- Styles (similar to ForgotPasswordScreen, adjust as needed) ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    blurContainer: {
        ...StyleSheet.absoluteFillObject,
        paddingTop: paddingTop,
        padding: spacingY._20,
        overflow: 'hidden',
        borderRadius: radius._20,
    },
    background: { flex: 1, ...StyleSheet.absoluteFillObject },
    inputView: {
        backgroundColor: colors.white, borderRadius: radius._15, marginTop: spacingY._15,
        shadowColor: colors.lightBlue, shadowOffset: { height: 0, width: 0 }, shadowOpacity: 0.9,
        flexDirection: 'row', alignItems: 'center', paddingRight: spacingX._15,
    },
    input: {
        paddingVertical: spacingY._20, paddingHorizontal: spacingX._20,
        fontSize: normalizeY(16), flex: 1,
    },
    text: {
        fontWeight: '600', textAlign: 'center', alignSelf: 'center',
        marginTop: '10%', marginBottom: spacingY._10,
    },
    body: {
        textAlign: 'center', alignSelf: 'center', marginBottom: spacingY._20,
        color: colors.gray, paddingHorizontal: spacingX._10,
    },
    actionButton: {
        backgroundColor: colors.primary, borderRadius: radius._12, marginTop: spacingY._20,
    },
    linkButton: {
        alignSelf: 'center', marginTop: spacingY._15,
    },
    bottomText: {
        alignSelf: 'center', marginTop: 'auto', // Push to bottom
        paddingBottom: spacingY._20,
    },
    // Background circles
    c1: { width: width / 1.5, height: width / 1.5, borderRadius: width / 2, backgroundColor: colors.lightBlue + '50', position: 'absolute', top: '10%', right: '-25%' },
    c2: { width: width / 1.2, height: width / 1.2, borderRadius: width / 2, backgroundColor: '#fee2e2' + '80', position: 'absolute', bottom: '-20%', left: '-15%', opacity: 0.8 },
    orangeCircle: { width: width / 1.5, height: width / 1.5, borderRadius: width / 2, backgroundColor: '#fed7aa' + '50', position: 'absolute', right: '-10%', bottom: '5%', opacity: 0.4 },
});

export default VerifyOtpScreen;
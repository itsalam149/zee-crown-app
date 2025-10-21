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
    ScrollView, // Added
} from 'react-native';
import { BlurView } from 'expo-blur';
import colors from '../config/colors'; // Adjusted path
import { radius, spacingX, spacingY } from '../config/spacing'; // Adjusted path
import Typo from '../components/Typo'; // Adjusted path
import AppButton from '../components/AppButton'; // Adjusted path
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase'; // Adjusted path
import { normalizeY } from '../utils/normalize'; // Adjusted path
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('screen');
let paddingTop = Platform.OS === 'ios' ? height * 0.07 : spacingY._10;

// Define OTP types (Export for use in other screens)
export const OtpType = {
    SIGNUP: 'signup',
    PASSWORD_RESET: 'email', // Supabase uses 'email' type for password reset OTPs sent via email
};

function VerifyOtpScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    // Get parameters passed during navigation
    const { email, otpType, nextScreen, nextScreenParams } = route.params || {};

    // Ensure required parameters exist
    if (!email || !otpType) {
        console.error("VerifyOtpScreen requires 'email' and 'otpType' parameters.");
        // Optionally navigate back or show an error message
        useEffect(() => {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Missing required information.' });
            if (navigation.canGoBack()) navigation.goBack();
        }, []);
        return null; // Don't render if params are missing
    }

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const isSignupOtp = otpType === OtpType.SIGNUP;
    const title = isSignupOtp ? 'Verify Your Email' : 'Enter Password Reset Code';
    const description = `Enter the 6-digit code sent to ${email}.`;

    // --- Verify OTP ---
    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
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
                // Navigate to the screen specified (e.g., back to ForgotPassword with params)
                navigation.navigate(nextScreen, { email: email, ...(nextScreenParams || {}) });
            } else if (isSignupOtp) {
                Toast.show({ type: 'success', text1: 'Email Verified!', text2: 'Sign in successful.' });
                // App.js listener will handle navigating into the main app
            }
        } else {
            // Handle case where verification succeeds but doesn't return a session
            Toast.show({ type: 'error', text1: 'Verification Issue', text2: 'Could not verify OTP. Please try again or resend.' });
        }
    };

    // --- Resend OTP ---
    const handleResendOtp = async () => {
        if (!email) return;
        setResendLoading(true);

        let error = null;
        if (isSignupOtp) {
            // Resend confirmation/signup OTP
            ({ error } = await supabase.auth.resend({ type: 'signup', email: email }));
        } else {
            // Resend password reset OTP using signInWithOtp
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
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <BlurView intensity={100} tint="light" style={styles.blurContainer}>
                    <View style={styles.contentView}> {/* Added wrapper view */}
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
                                testID="otpInput" // Added for testing
                            />
                        </View>
                        <AppButton
                            onPress={handleVerifyOtp}
                            label={loading ? 'Verifying...' : 'Verify Code'}
                            loading={loading}
                            disabled={loading || resendLoading}
                            style={styles.actionButton}
                        />
                        <TouchableOpacity style={styles.linkButton} onPress={handleResendOtp} disabled={loading || resendLoading}>
                            <Typo style={{ color: colors.gray }}>{resendLoading ? 'Resending...' : 'Resend OTP'}</Typo>
                        </TouchableOpacity>

                        {/* Button to go back to email entry for password reset */}
                        {!isSignupOtp && (
                            <TouchableOpacity style={styles.linkButton} onPress={() => navigation.canGoBack() && navigation.goBack()}>
                                <Typo style={{ color: colors.blue }}>Enter different email?</Typo>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Back to Sign In button */}
                    {!loading && !resendLoading && (
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
        flexGrow: 1, // Make blur view grow
        paddingHorizontal: spacingX._20,
        paddingTop: paddingTop,
        paddingBottom: spacingY._20, // Padding at bottom
        borderRadius: radius._20,
        marginHorizontal: spacingX._10, // Add some margin
        marginVertical: spacingY._10,
        overflow: 'hidden',
        justifyContent: 'space-between', // Push bottom text down
    },
    contentView: {
        alignItems: 'center', // Center content horizontally
    },
    background: { flex: 1, ...StyleSheet.absoluteFillObject, backgroundColor: colors.white },
    inputView: {
        backgroundColor: colors.white, borderRadius: radius._15, marginTop: spacingY._15,
        shadowColor: colors.lightBlue, shadowOffset: { height: 1, width: 0 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
        flexDirection: 'row', alignItems: 'center', paddingRight: spacingX._15,
        width: '90%', // Make input wider
        borderWidth: Platform.OS === 'android' ? 0.5 : 0, borderColor: '#0000001A',
    },
    input: {
        paddingVertical: spacingY._15, paddingHorizontal: spacingX._20,
        fontSize: normalizeY(16), flex: 1, color: colors.black, height: 55,
        textAlign: 'center', // Center OTP input text
        letterSpacing: 3, // Add spacing for OTP digits
    },
    text: {
        fontWeight: '600', textAlign: 'center', alignSelf: 'center',
        marginTop: spacingY._20, marginBottom: spacingY._10, // Adjusted margins
    },
    body: {
        textAlign: 'center', alignSelf: 'center', marginBottom: spacingY._20,
        color: colors.gray, paddingHorizontal: spacingX._10,
        width: '90%', // Limit width
    },
    actionButton: {
        backgroundColor: colors.primary, borderRadius: radius._12, marginTop: spacingY._20,
        width: '90%', // Match input width
    },
    linkButton: {
        alignSelf: 'center', marginTop: spacingY._15,
    },
    bottomText: {
        alignSelf: 'center',
        paddingBottom: spacingY._10, // Adjust padding
    },
    // Background circles
    c1: { width: width / 1.5, height: width / 1.5, borderRadius: width / 2, backgroundColor: colors.lightBlue + '50', position: 'absolute', top: '10%', right: '-25%' },
    c2: { width: width / 1.2, height: width / 1.2, borderRadius: width / 2, backgroundColor: '#fee2e2' + '80', position: 'absolute', bottom: '-20%', left: '-15%', opacity: 0.8 },
    orangeCircle: { width: width / 1.5, height: width / 1.5, borderRadius: width / 2, backgroundColor: '#fed7aa' + '50', position: 'absolute', right: '-10%', bottom: '5%', opacity: 0.4 },
});

export default VerifyOtpScreen;
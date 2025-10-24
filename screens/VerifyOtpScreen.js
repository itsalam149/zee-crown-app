// screens/VerifyOtpScreen.js
import React, { useState, useEffect } from 'react';
import {
    StyleSheet, View, SafeAreaView, TextInput, TouchableOpacity, Dimensions,
    Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import colors from '../config/colors'; // Adjust path
import { radius, spacingX, spacingY } from '../config/spacing'; // Adjust path
import Typo from '../components/Typo'; // Adjust path
import AppButton from '../components/AppButton'; // Adjust path
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase'; // Adjust path
import { normalizeY } from '../utils/normalize'; // Adjust path
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('screen');
let paddingTop = Platform.OS === 'ios' ? height * 0.07 : spacingY._10;

// Define OTP types
export const OtpType = {
    SIGNUP: 'signup',
    PASSWORD_RESET: 'recovery',
};

function VerifyOtpScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { email, otpType: logicalOtpType, nextScreen } = route.params || {};

    console.log("[VerifyOtpScreen] Params Received:", route.params);

    if (!email || !logicalOtpType) {
        console.error("[VerifyOtpScreen] Requires 'email' and 'otpType' parameters.");
        useEffect(() => {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Missing required information.' });
            if (navigation.canGoBack()) navigation.goBack();
        }, []);
        return null;
    }

    const [otp, setOtp] = useState('');
    const [loadingVerify, setLoadingVerify] = useState(false); // Renamed
    const [loadingResend, setLoadingResend] = useState(false); // Renamed

    // Determine the *verification* type based on the logical type passed in params
    const verificationType = (logicalOtpType === 'PASSWORD_RESET' || logicalOtpType === OtpType.PASSWORD_RESET)
        ? OtpType.PASSWORD_RESET
        : OtpType.SIGNUP;
    const isSignupOtp = verificationType === OtpType.SIGNUP;

    const title = isSignupOtp ? 'Verify Your Email' : 'Enter Password Reset Code';
    const description = `Enter the 6-digit code sent to ${email}.`;

    // --- Verify OTP ---
    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) { // Added regex check
            Toast.show({ type: 'error', text1: 'Input Error', text2: 'Please enter a valid 6-digit OTP.' });
            return;
        }
        setLoadingVerify(true);
        console.log(`[VerifyOtpScreen] Verifying OTP (${otp}) for user: ${email}, Verification Type: ${verificationType}`);

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email: email,
                token: otp,
                type: verificationType,
            });

            console.log("[VerifyOtpScreen] Verification Response:", { data: data ? 'Exists' : 'Null', error: error?.message });

            if (error) {
                console.error("[VerifyOtpScreen] OTP Verification Error:", error);
                Toast.show({ type: 'error', text1: 'OTP Verification Failed', text2: error.message || 'Invalid or expired OTP.' });
            } else {
                // Verification successful
                console.log("[VerifyOtpScreen] OTP Verification Successful.");

                if (isSignupOtp) {
                    // *** MODIFICATION START ***
                    // Signup verified. Navigate immediately to the authenticated flow.
                    // The App.js listener will eventually pick up the confirmed session too.
                    console.log("[VerifyOtpScreen] Signup OTP success - Navigating to main app flow.");
                    Toast.show({ type: 'success', text1: 'Email Verified!', text2: 'Welcome!' });
                    // Reset the navigation stack to the authenticated state
                    // Navigate to CategoryNavigator first if category selection is required
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'CategoryNavigator' }], // Or 'AppNavigator' if category selection isn't the next step
                    });
                    // *** MODIFICATION END ***

                } else if (verificationType === OtpType.PASSWORD_RESET) {
                    // Password Reset verified. Navigate to the next screen if provided.
                    if (nextScreen) {
                        console.log("[VerifyOtpScreen] Password Reset OTP success - Navigating to:", nextScreen);
                        Toast.show({ type: 'success', text1: 'OTP Verified', text2: 'You can now set a new password.' });
                        navigation.navigate(nextScreen, { email: email });
                    } else {
                        console.error("[VerifyOtpScreen] Password reset OTP verified but 'nextScreen' parameter is missing.");
                        Toast.show({ type: 'error', text1: 'Error', text2: 'Navigation configuration error.' });
                        navigation.navigate('Signin'); // Fallback
                    }
                } else {
                    console.log("[VerifyOtpScreen] OTP verified for an unspecified purpose.");
                    navigation.navigate('Signin'); // Fallback
                }
            }
        } catch (verificationError) {
            console.error("[VerifyOtpScreen] Caught error during verification block:", verificationError);
            Toast.show({ type: 'error', text1: 'Error', text2: 'An unexpected error occurred during verification.' });
        } finally {
            // Only set loadingVerify to false if NOT a successful signup navigation
            // to prevent UI flicker before navigation happens.
            if (!isSignupOtp || (isSignupOtp && !data?.session)) { // Keep loading if signup nav happens
                setLoadingVerify(false);
            }
            console.log("[VerifyOtpScreen] handleVerifyOtp finished.");
        }
    };

    // --- Resend OTP --- (Keep existing logic)
    const handleResendOtp = async () => {
        if (!email) return;
        setLoadingResend(true);
        console.log(`[VerifyOtpScreen] Resending OTP for logical type: ${logicalOtpType} to email: ${email}`);
        let error = null;
        let data = null;

        try {
            if (isSignupOtp) {
                ({ data, error } = await supabase.auth.resend({ type: 'signup', email: email }));
                console.log("[VerifyOtpScreen] Resend Signup OTP Response:", { data: data ? 'Exists' : 'Null', error: error?.message });
            } else if (verificationType === OtpType.PASSWORD_RESET) {
                ({ data, error } = await supabase.auth.resetPasswordForEmail(email));
                console.log("[VerifyOtpScreen] Resend Password Reset Request Response:", { data: data ? 'Exists' : 'Null', error: error?.message });
            } else {
                console.warn("[VerifyOtpScreen] Unknown logicalOtpType for resend:", logicalOtpType);
                error = { message: "Cannot resend OTP for this type." };
            }
            if (error) throw error;
            console.log("[VerifyOtpScreen] Resend Request Success.");
            Toast.show({ type: 'success', text1: 'Request Sent', text2: 'Check your email for instructions or a new code.' });
        } catch (resendError) {
            console.error("[VerifyOtpScreen] Resend OTP Error:", resendError);
            Toast.show({ type: 'error', text1: 'Error Resending Code', text2: resendError.message || 'Could not send a new code.' });
        } finally {
            setLoadingResend(false);
        }
    };

    // --- Render --- (Keep existing render logic)
    return (
        <SafeAreaView style={styles.container}>
            {/* Background */}
            <View style={styles.background}>
                <View style={[styles.c1, { opacity: 0.5 }]} />
                <View style={[styles.orangeCircle, { bottom: '25%', left: '5%', opacity: 0.5 }]} />
                <View style={[styles.orangeCircle, { opacity: 0.4 }]} />
                <View style={styles.c2} />
            </View>

            {/* Scrollable Content */}
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <BlurView intensity={100} tint="light" style={styles.blurContainer}>
                    {/* Main Content Area */}
                    <View style={styles.contentView}>
                        <Typo size={26} style={styles.text}>{title}</Typo>
                        <Typo size={16} style={styles.body}>{description}</Typo>

                        {/* OTP Input */}
                        <View style={styles.inputView}>
                            <TextInput
                                value={otp} onChangeText={setOtp}
                                placeholder="Enter 6-digit OTP" placeholderTextColor={colors.gray} // Use consistent color
                                style={styles.input} autoCapitalize="none"
                                keyboardType="number-pad" maxLength={6} textContentType="oneTimeCode" // Helps autofill
                                testID="otpInput"
                            />
                        </View>

                        {/* Verify Button */}
                        <AppButton
                            onPress={handleVerifyOtp}
                            label={loadingVerify ? 'Verifying...' : 'Verify Code'}
                            loading={loadingVerify}
                            disabled={loadingVerify || loadingResend || otp.length !== 6} // Disable logic
                            style={styles.actionButton}
                        />

                        {/* Resend Link */}
                        <TouchableOpacity style={styles.linkButton} onPress={handleResendOtp} disabled={loadingVerify || loadingResend}>
                            <Typo style={{ color: loadingResend ? colors.gray : colors.primary }}> {/* Indicate loading */}
                                {loadingResend ? 'Sending...' : 'Resend Code'}
                            </Typo>
                        </TouchableOpacity>

                        {/* Different Email Link (only for password reset) */}
                        {verificationType === OtpType.PASSWORD_RESET && (
                            <TouchableOpacity
                                style={styles.linkButton}
                                onPress={() => navigation.canGoBack() && navigation.goBack()}
                                disabled={loadingVerify || loadingResend}
                            >
                                <Typo style={{ color: colors.blue }}>Entered wrong email?</Typo>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Back to Sign In Link */}
                    {!loadingVerify && !loadingResend && (
                        <TouchableOpacity
                            style={styles.bottomLink}
                            onPress={() => navigation.navigate('Signin')}
                        >
                            <Typo style={{ color: colors.blue }}>Back to Sign In</Typo>
                        </TouchableOpacity>
                    )}
                </BlurView>
            </ScrollView>
        </SafeAreaView>
    );
}

// --- Styles --- (Keep existing styles)
const styles = StyleSheet.create({
    container: { flex: 1 },
    blurContainer: {
        flexGrow: 1, paddingHorizontal: spacingX._20, paddingTop: paddingTop,
        paddingBottom: spacingY._20, borderRadius: radius._20,
        marginHorizontal: spacingX._10, marginVertical: spacingY._10,
        overflow: 'hidden', justifyContent: 'space-between',
    },
    contentView: { alignItems: 'center', paddingBottom: spacingY._40, },
    background: { flex: 1, ...StyleSheet.absoluteFillObject, backgroundColor: colors.white },
    inputView: {
        backgroundColor: colors.white, borderRadius: radius._15, marginTop: spacingY._20,
        shadowColor: colors.lightBlue, shadowOffset: { height: 2, width: 0 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
        flexDirection: 'row', alignItems: 'center',
        width: '90%',
        borderWidth: 1, borderColor: colors.lighterGray,
    },
    input: {
        paddingVertical: spacingY._15,
        paddingHorizontal: spacingX._20,
        fontSize: normalizeY(16), flex: 1, color: colors.black,
        height: 55,
        textAlign: 'center', letterSpacing: 3,
    },
    text: {
        fontWeight: '600', textAlign: 'center', alignSelf: 'center',
        marginTop: spacingY._20, marginBottom: spacingY._10,
    },
    body: {
        textAlign: 'center', alignSelf: 'center', marginBottom: spacingY._20,
        color: colors.gray, paddingHorizontal: spacingX._10, width: '90%',
        lineHeight: normalizeY(22),
    },
    actionButton: {
        marginTop: spacingY._25,
        width: '90%',
    },
    linkButton: {
        alignSelf: 'center',
        marginTop: spacingY._20,
        paddingVertical: spacingY._5,
    },
    bottomLink: {
        alignSelf: 'center',
        paddingVertical: spacingY._10,
        marginTop: spacingY._20,
    },
    // Background circles
    c1: { width: width / 1.5, height: width / 1.5, borderRadius: width / 2, backgroundColor: colors.lightBlue + '50', position: 'absolute', top: '10%', right: '-25%' },
    c2: { width: width / 1.2, height: width / 1.2, borderRadius: width / 2, backgroundColor: '#fee2e2' + '80', position: 'absolute', bottom: '-20%', left: '-15%', opacity: 0.8 },
    orangeCircle: { width: width / 1.5, height: width / 1.5, borderRadius: width / 2, backgroundColor: '#fed7aa' + '50', position: 'absolute', right: '-10%', bottom: '5%', opacity: 0.4 },
});


export default VerifyOtpScreen;
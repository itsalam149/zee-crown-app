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
    ScrollView,
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
let paddingTop = Platform.OS === 'ios' ? height * 0.07 : spacingY._10; //

// Define OTP types
export const OtpType = {
    SIGNUP: 'signup', //
    PASSWORD_RESET: 'email', // Type used when *requesting* reset OTP via signInWithOtp
};

function VerifyOtpScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    // Get parameters passed during navigation
    const { email, otpType, nextScreen } = route.params || {}; //

    console.log("VerifyOtpScreen Params Received:", route.params);

    // Basic validation for required params
    if (!email || !otpType) {
        console.error("VerifyOtpScreen requires 'email' and 'otpType' parameters.");
        useEffect(() => {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Missing required information.' });
            if (navigation.canGoBack()) navigation.goBack(); //
        }, []);
        return null; // Render nothing if params are missing
    }

    const [otp, setOtp] = useState(''); //
    const [loading, setLoading] = useState(false); //
    const [resendLoading, setResendLoading] = useState(false); //

    const isSignupOtp = otpType === OtpType.SIGNUP; //
    const title = isSignupOtp ? 'Verify Your Email' : 'Enter Password Reset Code'; //
    const description = `Enter the 6-digit code sent to ${email}.`; //

    // --- Verify OTP ---
    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) { //
            Toast.show({ type: 'error', text1: 'Input Error', text2: 'Please enter the 6-digit OTP.' }); //
            return;
        }
        setLoading(true);
        console.log(`VerifyOtpScreen: Verifying OTP (${otp}) for user: ${email}, type from params: ${otpType}`);

        try {
            // *** FIX: Determine the correct 'type' for Supabase verifyOtp ***
            // For password reset flow initiated by signInWithOtp({ type: 'email' }),
            // the verification step requires type 'recovery'.
            const verifyType = otpType === OtpType.PASSWORD_RESET ? 'recovery' : otpType; // Use 'recovery' for password reset
            console.log(`VerifyOtpScreen: Using verify type: ${verifyType}`);

            const { data, error } = await supabase.auth.verifyOtp({ //
                email: email,
                token: otp,
                type: verifyType, // Pass the determined type
            });

            console.log("VerifyOtpScreen: Verification Response:", { data: data ? 'Exists' : 'Null', error });

            if (error) {
                console.error("VerifyOtpScreen: OTP Verification Error:", error);
                Toast.show({ type: 'error', text1: 'OTP Verification Failed', text2: error.message }); //
            } else {
                // Verification successful (no error)
                console.log("VerifyOtpScreen: OTP Verification Successful.");

                if (isSignupOtp) {
                    // Sign up verification successful, user's email_confirmed_at is set.
                    // The onAuthStateChange listener in App.js will now see the confirmed user
                    // and allow navigation into the main app.
                    console.log("VerifyOtpScreen: Signup OTP success - User email confirmed.");
                    Toast.show({ type: 'success', text1: 'Email Verified!', text2: 'Sign in successful.' }); //
                    // No explicit navigation needed here; App.js handles it.
                } else if (otpType === OtpType.PASSWORD_RESET && nextScreen) {
                    // Password reset OTP successful. User is temporarily authenticated to allow password update.
                    console.log("VerifyOtpScreen: Password Reset OTP success - Navigating to:", nextScreen);
                    Toast.show({ type: 'success', text1: 'OTP Verified', text2: 'You can now set a new password.' }); //
                    // *** Navigate immediately to the next screen (SetNewPasswordScreen) ***
                    navigation.navigate(nextScreen, { email: email }); //
                } else if (otpType === OtpType.PASSWORD_RESET && !nextScreen) {
                    console.error("VerifyOtpScreen: Password reset OTP verified but 'nextScreen' parameter is missing.");
                    Toast.show({ type: 'error', text1: 'Error', text2: 'Navigation configuration error.' }); //
                    navigation.navigate('Signin'); // Fallback
                } else {
                    console.log("VerifyOtpScreen: OTP verified for an unspecified purpose.");
                    navigation.navigate('Signin'); // Fallback
                }
            }
        } catch (verificationError) {
            console.error("VerifyOtpScreen: Caught error during verification block:", verificationError);
            Toast.show({ type: 'error', text1: 'Error', text2: 'An unexpected error occurred.' }); //
        } finally {
            setLoading(false); // Ensure loading is always stopped
            console.log("VerifyOtpScreen: handleVerifyOtp finished.");
        }
    };


    // --- Resend OTP ---
    const handleResendOtp = async () => {
        if (!email) return;
        setResendLoading(true);
        console.log(`VerifyOtpScreen: Resending OTP for type: ${otpType} to email: ${email}`);
        let error = null;
        let data = null; // To capture response data for logging

        if (isSignupOtp) {
            // For signup verification, use the resend endpoint.
            ({ data, error } = await supabase.auth.resend({ //
                type: 'signup',
                email: email,
            }));
            console.log("VerifyOtpScreen: Resend Signup OTP Response:", { data: data ? 'Exists' : 'Null', error });
        } else if (otpType === OtpType.PASSWORD_RESET) {
            // For password reset, use resetPasswordForEmail.
            // Note: By default this sends a LINK. If you need OTP, ensure your email template sends one.
            // OR use signInWithOtp if your setup uses that for password reset OTPs.
            ({ data, error } = await supabase.auth.resetPasswordForEmail(email)); // Sends link by default
            // If using signInWithOtp for password reset OTPs instead:
            // ({ data, error } = await supabase.auth.signInWithOtp({
            //    email: email,
            //    options: { shouldCreateUser: false } // Important!
            // }));
            console.log("VerifyOtpScreen: Resend Password Reset Request Response:", { data: data ? 'Exists' : 'Null', error });
        } else {
            console.warn("VerifyOtpScreen: Unknown otpType for resend:", otpType);
        }

        setResendLoading(false);
        if (error) {
            console.error("VerifyOtpScreen: Resend OTP Error:", error);
            Toast.show({ type: 'error', text1: 'Error Resending Code', text2: error.message }); //
        } else {
            console.log("VerifyOtpScreen: Resend Request Success.");
            Toast.show({ type: 'success', text1: 'Request Sent', text2: 'Check your email for instructions or a new code.' }); //
        }
    };

    // --- Render ---
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
                                value={otp} onChangeText={setOtp} //
                                placeholder="Enter 6-digit OTP" placeholderTextColor="grey"
                                style={styles.input} autoCapitalize="none"
                                keyboardType="number-pad" maxLength={6} testID="otpInput" //
                            />
                        </View>

                        {/* Verify Button */}
                        <AppButton
                            onPress={handleVerifyOtp} //
                            label={loading ? 'Verifying...' : 'Verify Code'}
                            loading={loading} disabled={loading || resendLoading} //
                            style={styles.actionButton}
                        />

                        {/* Resend Link */}
                        <TouchableOpacity style={styles.linkButton} onPress={handleResendOtp} disabled={loading || resendLoading}>
                            <Typo style={{ color: colors.gray }}>{resendLoading ? 'Sending...' : 'Resend Code'}</Typo>
                        </TouchableOpacity>

                        {/* Different Email Link (only for password reset) */}
                        {!isSignupOtp && (
                            <TouchableOpacity style={styles.linkButton} onPress={() => navigation.canGoBack() && navigation.goBack()}>
                                <Typo style={{ color: colors.blue }}>Entered wrong email?</Typo>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Back to Sign In Link */}
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
// Styles remain unchanged
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
        width: '90%', borderWidth: Platform.OS === 'android' ? 0.5 : 0, borderColor: '#0000001A',
    },
    input: {
        paddingVertical: spacingY._10, // Reduced padding
        paddingHorizontal: spacingX._20,
        fontSize: normalizeY(16), flex: 1, color: colors.black, height: 55,
        textAlign: 'center', letterSpacing: 3,
    },
    text: {
        fontWeight: '600', textAlign: 'center', alignSelf: 'center',
        marginTop: spacingY._20, marginBottom: spacingY._10,
    },
    body: {
        textAlign: 'center', alignSelf: 'center', marginBottom: spacingY._20,
        color: colors.gray, paddingHorizontal: spacingX._10, width: '90%',
    },
    actionButton: {
        backgroundColor: colors.primary, borderRadius: radius._12, marginTop: spacingY._20, width: '90%',
    },
    linkButton: { alignSelf: 'center', marginTop: spacingY._15, },
    bottomText: { alignSelf: 'center', paddingBottom: spacingY._10, },
    // Background circles
    c1: { width: width / 1.5, height: width / 1.5, borderRadius: width / 2, backgroundColor: colors.lightBlue + '50', position: 'absolute', top: '10%', right: '-25%' },
    c2: { width: width / 1.2, height: width / 1.2, borderRadius: width / 2, backgroundColor: '#fee2e2' + '80', position: 'absolute', bottom: '-20%', left: '-15%', opacity: 0.8 },
    orangeCircle: { width: width / 1.5, height: width / 1.5, borderRadius: width / 2, backgroundColor: '#fed7aa' + '50', position: 'absolute', right: '-10%', bottom: '5%', opacity: 0.4 },
});

export default VerifyOtpScreen;
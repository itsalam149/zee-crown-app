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
    ScrollView, // Added
} from 'react-native';
import { BlurView } from 'expo-blur';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';
import Typo from 'components/Typo';
import AppButton from 'components/AppButton';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { normalizeY } from 'utils/normalize';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons'; // For eye icon
// Import OtpType from VerifyOtpScreen
import { OtpType } from './VerifyOtpScreen'; // Adjust path if needed

const { width, height } = Dimensions.get('screen');
let paddingTop = Platform.OS === 'ios' ? height * 0.07 : spacingY._10;

// --- State Enum for managing steps ---
const ResetSteps = {
    ENTER_EMAIL: 'ENTER_EMAIL',
    // ENTER_OTP step is now handled by VerifyOtpScreen
    ENTER_NEW_PASSWORD: 'ENTER_NEW_PASSWORD', // New state for password entry
};

function ForgotPasswordScreen() {
    const navigation = useNavigation();
    // --- Current Step now starts at ENTER_EMAIL ---
    const [currentStep, setCurrentStep] = useState(ResetSteps.ENTER_EMAIL);
    const [email, setEmail] = useState('');
    // --- OTP state is removed, handled by VerifyOtpScreen ---
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordSecure, setIsPasswordSecure] = useState(true);
    const [isConfirmSecure, setIsConfirmSecure] = useState(true);

    // --- Send OTP to Email ---
    const handleSendOtp = async () => {
        if (!email) {
            Toast.show({ type: 'error', text1: 'Input Error', text2: 'Please enter your email address.' });
            return;
        }
        setLoading(true);
        // Use signInWithOtp for password reset
        const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                shouldCreateUser: false, // Don't create user if email doesn't exist
            }
        });

        setLoading(false);
        if (error) {
            Toast.show({ type: 'error', text1: 'Error Sending OTP', text2: error.message });
        } else {
            Toast.show({
                type: 'success',
                text1: 'Check your email',
                text2: 'An OTP has been sent to reset your password.',
            });
            // --- NAVIGATE TO VerifyOtpScreen ---
            navigation.navigate('VerifyOtp', {
                email: email,
                otpType: OtpType.PASSWORD_RESET, // Specify the type
                nextScreen: 'ForgotPassword', // Tell VerifyOtp to come back here on success
                nextScreenParams: { nextStep: ResetSteps.ENTER_NEW_PASSWORD } // Pass params for next step
            });
        }
    };

    // --- Check if we need to move to the next step based on navigation params ---
    React.useEffect(() => {
        if (route.params?.nextStep === ResetSteps.ENTER_NEW_PASSWORD && route.params?.email === email) {
            setCurrentStep(ResetSteps.ENTER_NEW_PASSWORD);
        }
    }, [route.params]);

    // --- Verify OTP is REMOVED (handled by VerifyOtpScreen) ---

    // --- Set New Password (remains largely the same) ---
    const handleSetNewPassword = async () => {
        if (!newPassword || !confirmNewPassword) { /* ... validation ... */ return; }
        if (newPassword !== confirmNewPassword) { /* ... validation ... */ return; }
        if (newPassword.length < 6) { /* ... validation ... */ return; }

        setLoading(true);
        // User should be authenticated via OTP from VerifyOtpScreen,
        // so updateUser should work.
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        setLoading(false);
        if (error) {
            Toast.show({ type: 'error', text1: 'Password Reset Failed', text2: error.message });
            // Might need to sign out if the session is stuck
            await supabase.auth.signOut().catch(console.error);
            setCurrentStep(ResetSteps.ENTER_EMAIL); // Go back to start
        } else {
            Toast.show({
                type: 'success',
                text1: 'Password Reset Successful',
                text2: 'You can now sign in with your new password.',
            });
            await supabase.auth.signOut(); // Sign out the temporary session
            // Use setTimeout for navigation stability
            setTimeout(() => {
                navigation.navigate('Signin');
            }, 0);
        }
    };

    // --- Render different UI based on the current step ---
    const renderContent = () => {
        switch (currentStep) {
            // --- ENTER_OTP case is REMOVED ---
            case ResetSteps.ENTER_NEW_PASSWORD:
                return (
                    <>
                        <Typo size={26} style={styles.text}>Set New Password</Typo>
                        <Typo size={16} style={styles.body}>
                            Enter your new password below for {email}.
                        </Typo>
                        <View style={styles.inputView}>
                            <TextInput
                                value={newPassword} onChangeText={setNewPassword}
                                placeholder="New Password" style={styles.input}
                                secureTextEntry={isPasswordSecure} autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setIsPasswordSecure(!isPasswordSecure)} style={styles.eyeIcon}>
                                <Ionicons name={isPasswordSecure ? "eye-off-outline" : "eye-outline"} size={24} color="grey" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputView}>
                            <TextInput
                                value={confirmNewPassword} onChangeText={setConfirmNewPassword}
                                placeholder="Confirm New Password" style={styles.input}
                                secureTextEntry={isConfirmSecure} autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setIsConfirmSecure(!isConfirmSecure)} style={styles.eyeIcon}>
                                <Ionicons name={isConfirmSecure ? "eye-off-outline" : "eye-outline"} size={24} color="grey" />
                            </TouchableOpacity>
                        </View>
                        <AppButton
                            onPress={handleSetNewPassword}
                            label={loading ? 'Saving...' : 'Set New Password'}
                            disabled={loading}
                            style={styles.actionButton}
                        />
                        {/* Optional: Button to go back if needed, though usually not required here */}
                        {/* <TouchableOpacity style={styles.linkButton} onPress={() => setCurrentStep(ResetSteps.ENTER_EMAIL)}>
                            <Typo style={{ color: colors.blue }}>Start Over?</Typo>
                         </TouchableOpacity> */}
                    </>
                );
            case ResetSteps.ENTER_EMAIL:
            default:
                return (
                    <>
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
                            disabled={loading}
                            style={styles.actionButton}
                        />
                    </>
                );
        }
    };

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
                    {renderContent()}
                    {!loading && (
                        <TouchableOpacity
                            style={styles.bottomText}
                            onPress={() => navigation.navigate('Signin')}>
                            <Typo style={{ color: colors.blue }}>Back to Sign In</Typo>
                        </TouchableOpacity>
                    )}
                    {/* {loading && <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />} */}
                </BlurView>
            </ScrollView>
        </SafeAreaView>
    );
}

// --- Styles (Add eyeIcon style) ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    blurContainer: {
        // Use flexGrow instead of absoluteFill with ScrollView
        flexGrow: 1,
        paddingTop: paddingTop * 0.8, // Adjust padding as needed
        padding: spacingY._20,
        paddingBottom: spacingY._60, // Ensure space for bottom text
        borderRadius: radius._20,
        marginHorizontal: spacingX._10, // Add some margin
        marginVertical: spacingY._10,
        overflow: 'hidden',
    },
    background: { flex: 1, ...StyleSheet.absoluteFillObject, backgroundColor: colors.white },
    inputView: {
        backgroundColor: colors.white, borderRadius: radius._15, marginTop: spacingY._15,
        shadowColor: colors.lightBlue, shadowOffset: { height: 1, width: 0 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
        flexDirection: 'row', alignItems: 'center', paddingRight: spacingX._5,
        borderWidth: Platform.OS === 'android' ? 0.5 : 0, borderColor: '#0000001A',
    },
    input: {
        paddingVertical: spacingY._15, paddingHorizontal: spacingX._20,
        fontSize: normalizeY(16), flex: 1, color: colors.black, height: 55,
    },
    eyeIcon: { // Added style for eye icon touchable area
        paddingHorizontal: spacingX._15,
    },
    text: {
        fontWeight: '600', textAlign: 'center', alignSelf: 'center',
        marginTop: spacingY._10, marginBottom: spacingY._10,
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
        alignSelf: 'center', marginTop: spacingY._30, // Increased spacing
        paddingBottom: spacingY._10, // Reduced bottom padding inside blur
    },
    loadingIndicator: {
        marginTop: spacingY._20,
    },
    // Background circles
    c1: { width: width / 1.5, height: width / 1.5, borderRadius: width / 2, backgroundColor: colors.lightBlue + '50', position: 'absolute', top: '10%', right: '-25%' },
    c2: { width: width / 1.2, height: width / 1.2, borderRadius: width / 2, backgroundColor: '#fee2e2' + '80', position: 'absolute', bottom: '-20%', left: '-15%', opacity: 0.8 },
    orangeCircle: { width: width / 1.5, height: width / 1.5, borderRadius: width / 2, backgroundColor: '#fed7aa' + '50', position: 'absolute', right: '-10%', bottom: '5%', opacity: 0.4 },
});

export default ForgotPasswordScreen;
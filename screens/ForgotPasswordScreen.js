// screens/ForgotPasswordScreen.js
import React, { useState, useEffect } from 'react'; // Added useEffect
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
import colors from '../config/colors'; // Adjusted path
import { radius, spacingX, spacingY } from '../config/spacing'; // Adjusted path
import Typo from '../components/Typo'; // Adjusted path
import AppButton from '../components/AppButton'; // Adjusted path
// *** FIX: Import useNavigation and useRoute ***
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase'; // Adjusted path
import { normalizeY } from '../utils/normalize'; // Adjusted path
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons'; // For eye icon
// Import OtpType from VerifyOtpScreen
import { OtpType } from './VerifyOtpScreen'; // Adjust path if needed

const { width, height } = Dimensions.get('screen');
let paddingTop = Platform.OS === 'ios' ? height * 0.07 : spacingY._10;

// State Enum for managing steps
const ResetSteps = {
    ENTER_EMAIL: 'ENTER_EMAIL',
    ENTER_NEW_PASSWORD: 'ENTER_NEW_PASSWORD',
};

function ForgotPasswordScreen() {
    const navigation = useNavigation();
    // *** FIX: Get the route object using the hook ***
    const route = useRoute();

    const [currentStep, setCurrentStep] = useState(ResetSteps.ENTER_EMAIL);
    const [email, setEmail] = useState('');
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
        const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                shouldCreateUser: false,
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
            // Navigate to VerifyOtpScreen
            navigation.navigate('VerifyOtp', {
                email: email,
                otpType: OtpType.PASSWORD_RESET,
                nextScreen: 'ForgotPassword', // Come back here on success
                nextScreenParams: { nextStep: ResetSteps.ENTER_NEW_PASSWORD } // Tell it to go to password entry
            });
        }
    };

    // --- Effect to check if returning from VerifyOtpScreen ---
    // *** FIX: This now correctly uses the 'route' object ***
    useEffect(() => {
        // Check if navigation parameters indicate returning from successful OTP verification
        if (route.params?.nextStep === ResetSteps.ENTER_NEW_PASSWORD && route.params?.email) {
            setEmail(route.params.email); // Ensure email state matches param
            setCurrentStep(ResetSteps.ENTER_NEW_PASSWORD);
        }
    }, [route.params]); // Rerun effect if route params change

    // --- Set New Password ---
    const handleSetNewPassword = async () => {
        // Validation
        if (!newPassword || !confirmNewPassword) {
            Toast.show({ type: 'error', text1: 'Input Error', text2: 'Please enter and confirm password.' }); return;
        }
        if (newPassword !== confirmNewPassword) {
            Toast.show({ type: 'error', text1: 'Password Mismatch', text2: 'Passwords do not match.' }); return;
        }
        if (newPassword.length < 6) {
            Toast.show({ type: 'error', text1: 'Password Too Short', text2: 'Password must be >= 6 characters.' }); return;
        }

        setLoading(true);
        // User should be authenticated via OTP session from VerifyOtpScreen
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        setLoading(false);
        if (error) {
            Toast.show({ type: 'error', text1: 'Password Reset Failed', text2: error.message });
            // Sign out just in case the session is invalid
            await supabase.auth.signOut().catch(console.error);
            setCurrentStep(ResetSteps.ENTER_EMAIL); // Go back to start
            setEmail(''); // Clear email
        } else {
            Toast.show({
                type: 'success',
                text1: 'Password Reset Successful',
                text2: 'You can now sign in with your new password.',
            });
            await supabase.auth.signOut(); // Sign out the temporary OTP session
            // Use setTimeout for navigation stability
            setTimeout(() => {
                navigation.navigate('Signin');
            }, 0);
        }
    };

    // --- Render UI based on current step ---
    const renderContent = () => {
        switch (currentStep) {
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
                            loading={loading}
                            disabled={loading}
                            style={styles.actionButton}
                        />
                        {/* Optional: Button to restart the process */}
                        {/* <TouchableOpacity style={styles.linkButton} onPress={() => { setEmail(''); setCurrentStep(ResetSteps.ENTER_EMAIL); }}>
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
                            loading={loading}
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
                    <View style={styles.contentView}>
                        {renderContent()}
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
        flexGrow: 1,
        paddingHorizontal: spacingX._20,
        paddingTop: paddingTop,
        paddingBottom: spacingY._20,
        borderRadius: radius._20,
        marginHorizontal: spacingX._10,
        marginVertical: spacingY._10,
        overflow: 'hidden',
        justifyContent: 'space-between', // Push bottom text down
    },
    contentView: { // Center the main form content
        alignItems: 'center',
    },
    background: { flex: 1, ...StyleSheet.absoluteFillObject, backgroundColor: colors.white },
    inputView: {
        backgroundColor: colors.white, borderRadius: radius._15, marginTop: spacingY._15,
        shadowColor: colors.lightBlue, shadowOffset: { height: 1, width: 0 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
        flexDirection: 'row', alignItems: 'center', paddingRight: spacingX._5,
        borderWidth: Platform.OS === 'android' ? 0.5 : 0, borderColor: '#0000001A',
        width: '95%', // Make inputs slightly wider
    },
    input: {
        paddingVertical: spacingY._10, // Reduced padding
        paddingHorizontal: spacingX._20,
        fontSize: normalizeY(16), flex: 1, color: colors.black, height: 55,
    },
    eyeIcon: {
        paddingHorizontal: spacingX._15,
    },
    text: {
        fontWeight: '600', textAlign: 'center', alignSelf: 'center',
        marginTop: spacingY._10, marginBottom: spacingY._10,
    },
    body: {
        textAlign: 'center', alignSelf: 'center', marginBottom: spacingY._20,
        color: colors.gray, paddingHorizontal: spacingX._10,
        width: '95%', // Match input width
    },
    actionButton: {
        backgroundColor: colors.primary, borderRadius: radius._12, marginTop: spacingY._20,
        width: '95%', // Match input width
    },
    linkButton: {
        alignSelf: 'center', marginTop: spacingY._15,
    },
    bottomText: {
        alignSelf: 'center',
        paddingBottom: spacingY._10,
    },
    loadingIndicator: { // If needed separately
        marginTop: spacingY._20,
    },
    // Background circles
    c1: { width: width / 1.5, height: width / 1.5, borderRadius: width / 2, backgroundColor: colors.lightBlue + '50', position: 'absolute', top: '10%', right: '-25%' },
    c2: { width: width / 1.2, height: width / 1.2, borderRadius: width / 2, backgroundColor: '#fee2e2' + '80', position: 'absolute', bottom: '-20%', left: '-15%', opacity: 0.8 },
    orangeCircle: { width: width / 1.5, height: width / 1.5, borderRadius: width / 2, backgroundColor: '#fed7aa' + '50', position: 'absolute', right: '-10%', bottom: '5%', opacity: 0.4 },
});

export default ForgotPasswordScreen;
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
import colors from '../config/colors';
import { radius, spacingX, spacingY } from '../config/spacing';
import Typo from '../components/Typo';
import AppButton from '../components/AppButton';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { normalizeY } from '../utils/normalize';
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
            topPadding: Platform.OS === 'ios' ? height * 0.03 : spacingY._5,
            titleSize: 22,
            bodySize: 14,
            inputHeight: 48,
            fontSize: 14,
            verticalGap: spacingY._10,
            buttonMargin: spacingY._15,
            blurPaddingVertical: spacingY._20,
        };
    } else if (isMediumDevice) {
        return {
            topPadding: Platform.OS === 'ios' ? height * 0.05 : spacingY._10,
            titleSize: 26,
            bodySize: 16,
            inputHeight: 55,
            fontSize: 16,
            verticalGap: spacingY._15,
            buttonMargin: spacingY._20,
            blurPaddingVertical: spacingY._30,
        };
    } else {
        return {
            topPadding: Platform.OS === 'ios' ? height * 0.07 : spacingY._15,
            titleSize: 30,
            bodySize: 18,
            inputHeight: 60,
            fontSize: 18,
            verticalGap: spacingY._20,
            buttonMargin: spacingY._25,
            blurPaddingVertical: spacingY._40,
        };
    }
};

const responsiveValues = getResponsiveSpacing();

function ForgotPasswordScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        if (!email) {
            Toast.show({ type: 'error', text1: 'Input Error', text2: 'Please enter your email address.' });
            return;
        }
        setLoading(true);
        console.log("ForgotPasswordScreen: Requesting password reset for", email);

        // Use resetPasswordForEmail for password reset flow
        const { error } = await supabase.auth.resetPasswordForEmail(email);

        setLoading(false);
        if (error) {
            console.error("ForgotPasswordScreen: Error requesting reset:", error);
            Toast.show({ type: 'error', text1: 'Error Sending Request', text2: error.message });
        } else {
            console.log("ForgotPasswordScreen: Password reset request successful.");
            Toast.show({
                type: 'success',
                text1: 'Check your email',
                text2: 'Instructions to reset your password have been sent.',
            });
            console.log("ForgotPasswordScreen: Navigating to VerifyOtp with nextScreen='SetNewPassword'");
            navigation.navigate('VerifyOtp', {
                email: email,
                otpType: OtpType.PASSWORD_RESET,
                nextScreen: 'SetNewPassword',
            });
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
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <BlurView intensity={100} tint="light" style={styles.blurContainer}>
                    <View style={styles.contentView}>
                        <Typo size={responsiveValues.titleSize} style={styles.text}>Forgot Password?</Typo>
                        <Typo size={responsiveValues.bodySize} style={styles.body}>
                            Enter your email address below and we'll send you instructions to reset your password.
                        </Typo>
                        <View style={styles.inputView}>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                placeholderTextColor="grey"
                                style={styles.input}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                        <AppButton
                            onPress={handleSendOtp}
                            label={loading ? 'Sending...' : 'Send OTP'}
                            loading={loading}
                            disabled={loading}
                            style={styles.actionButton}
                        />
                    </View>
                    {!loading && (
                        <TouchableOpacity
                            style={styles.bottomText}
                            onPress={() => navigation.navigate('Signin')}>
                            <Typo size={responsiveValues.fontSize - 2} style={{ color: colors.blue }}>Back to Sign In</Typo>
                        </TouchableOpacity>
                    )}
                </BlurView>
            </ScrollView>
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: responsiveValues.blurPaddingVertical,
    },
    blurContainer: {
        paddingHorizontal: width < 375 ? spacingX._15 : spacingX._20,
        paddingTop: responsiveValues.topPadding,
        paddingBottom: responsiveValues.blurPaddingVertical,
        borderRadius: radius._20,
        marginHorizontal: width < 375 ? spacingX._10 : spacingX._15,
        marginVertical: spacingY._10,
        overflow: 'hidden',
        justifyContent: 'space-between',
        maxWidth: 500,
        alignSelf: 'center',
        width: '100%',
        minHeight: isSmallDevice ? 400 : 500,
    },
    contentView: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
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
        paddingRight: spacingX._15,
        borderWidth: Platform.OS === 'android' ? 0.5 : 0,
        borderColor: '#0000001A',
        width: '100%',
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
    text: {
        fontWeight: '600',
        textAlign: 'center',
        alignSelf: 'center',
        marginTop: spacingY._10,
        marginBottom: spacingY._10,
    },
    body: {
        textAlign: 'center',
        alignSelf: 'center',
        marginBottom: responsiveValues.verticalGap,
        color: colors.gray,
        paddingHorizontal: spacingX._10,
        width: '100%',
        lineHeight: responsiveValues.bodySize * 1.5,
    },
    actionButton: {
        backgroundColor: colors.primary,
        borderRadius: radius._12,
        marginTop: responsiveValues.buttonMargin,
        width: '100%',
        minHeight: responsiveValues.inputHeight,
    },
    bottomText: {
        alignSelf: 'center',
        paddingBottom: spacingY._10,
        marginTop: responsiveValues.verticalGap,
    },
    // Background decorative circles
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

export default ForgotPasswordScreen;
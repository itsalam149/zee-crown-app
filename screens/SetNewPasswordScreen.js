// screens/SetNewPasswordScreen.js
import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Dimensions,
    Platform,
    ScrollView,
    KeyboardAvoidingView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import colors from '../config/colors';
import { radius, spacingX, spacingY } from '../config/spacing';
import Typo from '../components/Typo';
import AppButton from '../components/AppButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { normalizeY } from '../utils/normalize';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('screen');
const isSmallDevice = height < 700;
let paddingTop = Platform.OS === 'ios' ? height * 0.07 : spacingY._10;

function SetNewPasswordScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { email } = route.params || {};

    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordSecure, setIsPasswordSecure] = useState(true);
    const [isConfirmSecure, setIsConfirmSecure] = useState(true);

    const handleSetNewPassword = async () => {
        // Validations
        if (!newPassword || !confirmNewPassword) {
            Toast.show({ type: 'error', text1: 'Input Error', text2: 'Please enter and confirm password.' });
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Toast.show({ type: 'error', text1: 'Password Mismatch', text2: 'Passwords do not match.' });
            return;
        }
        if (newPassword.length < 6) {
            Toast.show({ type: 'error', text1: 'Password Too Short', text2: 'Password must be at least 6 characters.' });
            return;
        }

        setLoading(true);

        // Session check
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("[SetNewPassword] Session Check:", session ? `User: ${session.user.id}` : 'No session', "Error:", sessionError);

        if (sessionError || !session?.user) {
            Toast.show({
                type: 'error',
                text1: 'Authentication Error',
                text2: 'Session expired or invalid. Please try resetting again.'
            });
            navigation.navigate('Signin');
            await supabase.auth.signOut().catch(console.error);
            setLoading(false);
            return;
        }

        // Password update
        console.log("[SetNewPassword] Attempting password update...");
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (updateError) {
            console.error("[SetNewPassword] Password update failed:", updateError);
            Toast.show({
                type: 'error',
                text1: 'Password Reset Failed',
                text2: updateError.message
            });
            navigation.navigate('Signin');
            await supabase.auth.signOut().catch(console.error);
            setLoading(false);
        } else {
            console.log("[SetNewPassword] Password reset successful.");
            Toast.show({
                type: 'success',
                text1: 'Password Reset Successful',
                text2: 'You can now sign in with your new password.',
            });

            // Navigate and sign out
            navigation.navigate('Signin');
            await supabase.auth.signOut();
            setLoading(false);
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

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <BlurView intensity={100} tint="light" style={styles.blurContainer}>
                        <View style={styles.contentView}>
                            <Typo size={isSmallDevice ? 22 : 26} style={styles.text}>
                                Set New Password
                            </Typo>
                            <Typo size={isSmallDevice ? 14 : 16} style={styles.body}>
                                Enter your new password{email ? ` for ${email}` : ''}.
                            </Typo>

                            {/* New Password */}
                            <View style={styles.inputView}>
                                <TextInput
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="New Password"
                                    placeholderTextColor={colors.gray + '80'}
                                    style={styles.input}
                                    secureTextEntry={isPasswordSecure}
                                    autoCapitalize="none"
                                    autoComplete="password-new"
                                    textContentType="newPassword"
                                />
                                <TouchableOpacity
                                    onPress={() => setIsPasswordSecure(!isPasswordSecure)}
                                    style={styles.eyeIcon}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={isPasswordSecure ? 'eye-off-outline' : 'eye-outline'}
                                        size={24}
                                        color={colors.gray}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Confirm Password */}
                            <View style={styles.inputView}>
                                <TextInput
                                    value={confirmNewPassword}
                                    onChangeText={setConfirmNewPassword}
                                    placeholder="Confirm New Password"
                                    placeholderTextColor={colors.gray + '80'}
                                    style={styles.input}
                                    secureTextEntry={isConfirmSecure}
                                    autoCapitalize="none"
                                    autoComplete="password-new"
                                    textContentType="newPassword"
                                />
                                <TouchableOpacity
                                    onPress={() => setIsConfirmSecure(!isConfirmSecure)}
                                    style={styles.eyeIcon}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={isConfirmSecure ? 'eye-off-outline' : 'eye-outline'}
                                        size={24}
                                        color={colors.gray}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Password Requirements */}
                            <View style={styles.requirementsView}>
                                <Typo size={12} style={styles.requirementText}>
                                    • Password must be at least 6 characters
                                </Typo>
                                <Typo size={12} style={styles.requirementText}>
                                    • Both passwords must match
                                </Typo>
                            </View>

                            <AppButton
                                onPress={handleSetNewPassword}
                                label={loading ? 'Saving...' : 'Set New Password'}
                                loading={loading}
                                disabled={loading || !newPassword || !confirmNewPassword}
                                style={styles.actionButton}
                            />
                        </View>

                        {!loading && (
                            <TouchableOpacity
                                style={styles.bottomText}
                                onPress={() => navigation.navigate('Signin')}
                            >
                                <Typo size={isSmallDevice ? 13 : 15} style={{ color: colors.blue }}>
                                    Back to Sign In
                                </Typo>
                            </TouchableOpacity>
                        )}
                    </BlurView>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        minHeight: height * 0.9,
    },
    blurContainer: {
        flexGrow: 1,
        paddingHorizontal: spacingX._20,
        paddingTop: paddingTop,
        paddingBottom: spacingY._20,
        borderRadius: radius._20,
        marginHorizontal: spacingX._10,
        marginVertical: spacingY._10,
        overflow: 'hidden',
        justifyContent: 'space-between',
    },
    contentView: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        paddingBottom: spacingY._20,
    },
    background: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.white,
    },
    inputView: {
        backgroundColor: colors.white,
        borderRadius: radius._15,
        marginTop: spacingY._15,
        shadowColor: colors.lightBlue,
        shadowOffset: { height: 2, width: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: spacingX._5,
        borderWidth: 1,
        borderColor: colors.lighterGray,
        width: '90%',
        maxWidth: 400,
        minHeight: isSmallDevice ? 56 : 60,
    },
    input: {
        paddingVertical: Platform.OS === 'ios' ? spacingY._12 : spacingY._10,
        paddingHorizontal: spacingX._20,
        fontSize: isSmallDevice ? normalizeY(14) : normalizeY(16),
        flex: 1,
        color: colors.black,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    eyeIcon: {
        paddingHorizontal: spacingX._15,
        paddingVertical: spacingY._10,
    },
    text: {
        fontWeight: '600',
        textAlign: 'center',
        alignSelf: 'center',
        marginTop: spacingY._20,
        marginBottom: spacingY._10,
        color: colors.black,
    },
    body: {
        textAlign: 'center',
        alignSelf: 'center',
        marginBottom: spacingY._20,
        color: colors.gray,
        paddingHorizontal: spacingX._20,
        width: '90%',
        maxWidth: 400,
        lineHeight: normalizeY(22),
    },
    requirementsView: {
        width: '90%',
        maxWidth: 400,
        marginTop: spacingY._10,
        paddingHorizontal: spacingX._10,
    },
    requirementText: {
        color: colors.gray,
        marginVertical: spacingY._2,
        lineHeight: normalizeY(18),
    },
    actionButton: {
        marginTop: spacingY._20,
        width: '90%',
        maxWidth: 400,
    },
    bottomText: {
        alignSelf: 'center',
        paddingVertical: spacingY._12,
        marginTop: spacingY._10,
    },
    c1: {
        width: width / 1.5,
        height: width / 1.5,
        borderRadius: width / 2,
        backgroundColor: colors.lightBlue + '50',
        position: 'absolute',
        top: '10%',
        right: '-25%',
    },
    c2: {
        width: width / 1.2,
        height: width / 1.2,
        borderRadius: width / 2,
        backgroundColor: '#fee2e2' + '80',
        position: 'absolute',
        bottom: '-20%',
        left: '-15%',
        opacity: 0.8,
    },
    orangeCircle: {
        width: width / 1.5,
        height: width / 1.5,
        borderRadius: width / 2,
        backgroundColor: '#fed7aa' + '50',
        position: 'absolute',
        right: '-10%',
        bottom: '5%',
        opacity: 0.4,
    },
});

export default SetNewPasswordScreen;
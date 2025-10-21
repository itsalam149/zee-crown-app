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
        if (!newPassword || !confirmNewPassword) {
            Toast.show({
                type: 'error',
                text1: 'Input Error',
                text2: 'Please enter and confirm password.',
            });
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Toast.show({
                type: 'error',
                text1: 'Password Mismatch',
                text2: 'Passwords do not match.',
            });
            return;
        }
        if (newPassword.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Password Too Short',
                text2: 'Password must be at least 6 characters.',
            });
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        setLoading(false);

        if (error) {
            Toast.show({
                type: 'error',
                text1: 'Password Reset Failed',
                text2: error.message,
            });
            await supabase.auth.signOut().catch(console.error);
            navigation.navigate('Signin');
        } else {
            Toast.show({
                type: 'success',
                text1: 'Password Reset Successful',
                text2: 'You can now sign in with your new password.',
            });
            await supabase.auth.signOut();
            navigation.navigate('Signin');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.background}>
                <View style={[styles.c1, { opacity: 0.5 }]} />
                <View
                    style={[styles.orangeCircle, { bottom: '25%', left: '5%', opacity: 0.5 }]}
                />
                <View style={[styles.orangeCircle, { opacity: 0.4 }]} />
                <View style={styles.c2} />
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <BlurView intensity={100} tint="light" style={styles.blurContainer}>
                    <View style={styles.contentView}>
                        <Typo size={26} style={styles.text}>Set New Password</Typo>
                        <Typo size={16} style={styles.body}>
                            Enter your new password {email ? `for ${email}` : ''}.
                        </Typo>

                        {/* New Password */}
                        <View style={styles.inputView}>
                            <TextInput
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="New Password"
                                style={styles.input}
                                secureTextEntry={isPasswordSecure}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                onPress={() => setIsPasswordSecure(!isPasswordSecure)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={isPasswordSecure ? 'eye-off-outline' : 'eye-outline'}
                                    size={24}
                                    color="grey"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputView}>
                            <TextInput
                                value={confirmNewPassword}
                                onChangeText={setConfirmNewPassword}
                                placeholder="Confirm New Password"
                                style={styles.input}
                                secureTextEntry={isConfirmSecure}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                onPress={() => setIsConfirmSecure(!isConfirmSecure)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={isConfirmSecure ? 'eye-off-outline' : 'eye-outline'}
                                    size={24}
                                    color="grey"
                                />
                            </TouchableOpacity>
                        </View>

                        <AppButton
                            onPress={handleSetNewPassword}
                            label={loading ? 'Saving...' : 'Set New Password & Sign In'}
                            loading={loading}
                            disabled={loading}
                            style={styles.actionButton}
                        />
                    </View>

                    {!loading && (
                        <TouchableOpacity
                            style={styles.bottomText}
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
        justifyContent: 'space-between',
    },
    contentView: { alignItems: 'center' },
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
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: spacingX._5,
        borderWidth: Platform.OS === 'android' ? 0.5 : 0,
        borderColor: '#0000001A',
        width: '95%',
    },
    input: {
        paddingVertical: spacingY._10,
        paddingHorizontal: spacingX._20,
        fontSize: normalizeY(16),
        flex: 1,
        color: colors.black,
        height: 55,
    },
    eyeIcon: { paddingHorizontal: spacingX._15 },
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
        marginBottom: spacingY._20,
        color: colors.gray,
        paddingHorizontal: spacingX._10,
        width: '95%',
    },
    actionButton: {
        backgroundColor: colors.primary,
        borderRadius: radius._12,
        marginTop: spacingY._20,
        width: '95%',
    },
    bottomText: { alignSelf: 'center', paddingBottom: spacingY._10 },
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

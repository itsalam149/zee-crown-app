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
} from 'react-native';
import { BlurView } from 'expo-blur';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';
import Typo from 'components/Typo';
import AppButton from 'components/AppButton';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { normalizeY } from 'utils/normalize';
import { makeRedirectUri } from 'expo-auth-session';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('screen');
let paddingTop = Platform.OS === 'ios' ? height * 0.07 : spacingY._10;

const redirectTo = makeRedirectUri();

function ForgotPasswordScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordReset = async () => {
        if (!email) {
            Toast.show({ type: 'error', text1: 'Input Error', text2: 'Please enter your email address.' });
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectTo,
        });

        setLoading(false);
        if (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: error.message });
        } else {
            Toast.show({
                type: 'success',
                text1: 'Check your email',
                text2: 'A password reset link has been sent.',
            });
            navigation.navigate('Signin');
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
            <BlurView intensity={100} tint="light" style={styles.blurContainer}>
                <Typo size={26} style={styles.text}>
                    Forgot Password?
                </Typo>
                <View style={{ marginVertical: '5%' }}>
                    <Typo size={16} style={styles.body}>
                        No worries! Enter your email address below and we'll send you a link to reset your password.
                    </Typo>
                </View>
                <View style={styles.inputView}>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        style={styles.input}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>
                <AppButton
                    onPress={handlePasswordReset}
                    label={loading ? 'Sending...' : 'Send Reset Link'}
                    disabled={loading}
                    style={{ backgroundColor: colors.primary, borderRadius: radius._12, marginTop: spacingY._20 }}
                />
                <TouchableOpacity
                    style={styles.bottomText}
                    onPress={() => navigation.navigate('Signin')}>
                    <Typo style={{ color: colors.blue }}>Back to Sign In</Typo>
                </TouchableOpacity>
            </BlurView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    blurContainer: {
        ...StyleSheet.absoluteFillObject,
        paddingTop: paddingTop,
        padding: spacingY._20,
        paddingBottom: '10%',
        textAlign: 'center',
        overflow: 'hidden',
        borderRadius: radius._20,
    },
    background: {
        flex: 1,
        paddingBottom: '10%',
        justifyContent: 'flex-end',
        ...StyleSheet.absoluteFillObject,
    },
    inputView: {
        backgroundColor: colors.white,
        borderRadius: radius._15,
        marginTop: spacingY._15,
        shadowColor: colors.lightBlue,
        shadowOffset: { height: 0, width: 0 },
        shadowOpacity: 0.9,
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: spacingX._15,
    },
    input: {
        paddingVertical: spacingY._20,
        paddingHorizontal: spacingX._20,
        fontSize: normalizeY(16),
        flex: 1,
    },
    text: {
        fontWeight: '600',
        textAlign: 'center',
        alignSelf: 'center',
        marginTop: '15%',
    },
    body: {
        textAlign: 'center',
        alignSelf: 'center',
        margin: 2,
        color: colors.gray,
    },
    bottomText: {
        alignSelf: 'center',
        marginTop: 'auto',
        paddingBottom: spacingY._20,
    },
    c1: {
        width: width / 1.5,
        height: width / 1.5,
        borderRadius: width / 2,
        backgroundColor: colors.lightBlue,
        alignSelf: 'flex-end',
    },
    c2: {
        width: width / 1.2,
        height: width / 1.2,
        borderRadius: width / 2,
        backgroundColor: '#fee2e2',
        opacity: 0.8,
        marginBottom: 50,
        alignSelf: 'flex-end',
    },
    orangeCircle: {
        width: width / 1.5,
        height: width / 1.5,
        borderRadius: width / 2,
        backgroundColor: '#fed7aa',
        position: 'absolute',
        right: 0,
        bottom: 0,
    },
});

export default ForgotPasswordScreen;
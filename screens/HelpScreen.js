// screens/HelpScreen.js
import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Linking,
    Alert,
    Animated,
} from 'react-native';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { spacingX, spacingY, radius } from 'config/spacing';
import { Ionicons, MaterialIcons, Feather, FontAwesome } from '@expo/vector-icons';
import Header from 'components/Header';
import { normalizeY } from 'utils/normalize';

function HelpScreen({ navigation }) {
    const phoneNumber = '+91 9999050773';
    const email = 'zubairsheikh15@gmail.com';

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // Continuous pulse animation for attention
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleCall = async () => {
        try {
            const url = `tel:${phoneNumber}`;
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Calling is not supported on your device.');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong while trying to call.');
        }
    };

    const handleEmail = async () => {
        try {
            const url = `mailto:${email}`;
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Email is not supported on your device.');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong while trying to send email.');
        }
    };

    const handleWhatsApp = async () => {
        try {
            const message = 'Hello! I need some help regarding Zee Crown.';
            const url = `whatsapp://send?phone=${phoneNumber.replace(/\s+/g, '')}&text=${encodeURIComponent(message)}`;
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'WhatsApp is not installed on your device.');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong while opening WhatsApp.');
        }
    };

    const AnimatedRow = ({ icon, label, onPress, delay, iconBg, iconColor }) => {
        const rowScale = useRef(new Animated.Value(0.95)).current;
        const rowOpacity = useRef(new Animated.Value(0)).current;
        const rowTranslate = useRef(new Animated.Value(30)).current;
        const pressScale = useRef(new Animated.Value(1)).current;

        useEffect(() => {
            Animated.parallel([
                Animated.timing(rowOpacity, {
                    toValue: 1,
                    duration: 500,
                    delay: delay,
                    useNativeDriver: true,
                }),
                Animated.spring(rowTranslate, {
                    toValue: 0,
                    tension: 50,
                    friction: 7,
                    delay: delay,
                    useNativeDriver: true,
                }),
                Animated.spring(rowScale, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    delay: delay,
                    useNativeDriver: true,
                }),
            ]).start();
        }, []);

        const handlePressIn = () => {
            Animated.spring(pressScale, {
                toValue: 0.95,
                tension: 100,
                friction: 3,
                useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
            Animated.spring(pressScale, {
                toValue: 1,
                tension: 100,
                friction: 3,
                useNativeDriver: true,
            }).start();
        };

        return (
            <Animated.View
                style={{
                    opacity: rowOpacity,
                    transform: [
                        { translateY: rowTranslate },
                        { scale: Animated.multiply(rowScale, pressScale) },
                    ],
                }}
            >
                <TouchableOpacity
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={styles.row}
                    activeOpacity={1}
                >
                    <Animated.View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                        {icon}
                    </Animated.View>
                    <Typo size={16} style={{ flex: 1, fontWeight: '500' }}>
                        {label}
                    </Typo>
                    <Feather name="chevron-right" size={20} color={colors.gray} />
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <ScreenComponent style={styles.container}>
            <Header label="Help" onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Animated Header Section */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                        alignItems: 'center',
                        marginBottom: spacingY._20,
                    }}
                >
                    <Animated.View
                        style={{
                            transform: [{ scale: pulseAnim }],
                            marginBottom: spacingY._15,
                        }}
                    >
                        <View style={styles.mainIconContainer}>
                            <Ionicons name="help-circle" size={60} color={colors.primary} />
                        </View>
                    </Animated.View>

                    <Typo size={24} style={styles.title}>
                        We're Here to Help
                    </Typo>
                    <Typo size={16} style={styles.subtitle}>
                        Contact us anytime through call, WhatsApp or email
                    </Typo>
                </Animated.View>

                {/* Animated Card */}
                <Animated.View
                    style={[
                        styles.card,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
                        },
                    ]}
                >
                    <AnimatedRow
                        icon={<Ionicons name="call" size={24} color={colors.primary} />}
                        label="Call Us"
                        onPress={handleCall}
                        delay={200}
                        iconBg="#e3f2fd"
                    />

                    <View style={styles.divider} />

                    <AnimatedRow
                        icon={<FontAwesome name="whatsapp" size={24} color="#25D366" />}
                        label="Chat on WhatsApp"
                        onPress={handleWhatsApp}
                        delay={350}
                        iconBg="#e8f5e9"
                    />

                    <View style={styles.divider} />

                    <AnimatedRow
                        icon={<MaterialIcons name="email" size={24} color={colors.primary} />}
                        label="Send an Email"
                        onPress={handleEmail}
                        delay={500}
                        iconBg="#e3f2fd"
                    />
                </Animated.View>

                {/* Contact Info Card */}
                <Animated.View
                    style={[
                        styles.infoCard,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <Typo size={14} style={styles.infoTitle}>
                        Quick Contact Details
                    </Typo>
                    <View style={styles.infoRow}>
                        <Ionicons name="call" size={16} color={colors.primary} />
                        <Typo size={14} style={styles.infoText}>
                            {phoneNumber}
                        </Typo>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialIcons name="email" size={16} color={colors.primary} />
                        <Typo size={14} style={styles.infoText}>
                            {email}
                        </Typo>
                    </View>
                </Animated.View>
            </ScrollView>
        </ScreenComponent>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white
    },
    scrollContent: {
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._20,
        alignItems: 'center',
    },
    mainIconContainer: {
        width: normalizeY(100),
        height: normalizeY(100),
        borderRadius: normalizeY(50),
        backgroundColor: '#e3f2fd',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontWeight: '700',
        marginBottom: spacingY._8,
        textAlign: 'center',
        color: colors.black,
    },
    subtitle: {
        color: colors.gray,
        textAlign: 'center',
        lineHeight: 22,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: radius._15,
        padding: spacingY._20,
        width: '100%',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: spacingY._20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._12,
        paddingVertical: spacingY._12,
    },
    iconContainer: {
        width: normalizeY(50),
        height: normalizeY(50),
        borderRadius: radius._12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: spacingY._5,
    },
    infoCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: radius._12,
        padding: spacingY._15,
        width: '100%',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    infoTitle: {
        fontWeight: '600',
        marginBottom: spacingY._10,
        color: colors.black,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._8,
        marginBottom: spacingY._8,
    },
    infoText: {
        color: colors.gray,
        flex: 1,
    },
});

export default HelpScreen;
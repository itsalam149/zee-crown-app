// screens/HelpScreen.js
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Linking,
    Alert,
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

    const Row = ({ icon, label, onPress }) => (
        <TouchableOpacity onPress={onPress} style={styles.row} activeOpacity={0.7}>
            <View style={styles.iconContainer}>{icon}</View>
            <Typo size={16} style={{ flex: 1, fontWeight: '500' }}>
                {label}
            </Typo>
            <Feather name="chevron-right" size={20} color={colors.gray} />
        </TouchableOpacity>
    );

    return (
        <ScreenComponent style={styles.container}>
            <Header label="Help" onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Typo size={20} style={styles.title}>
                    We are available for help
                </Typo>
                <Typo size={16} style={styles.subtitle}>
                    Contact us anytime through call, WhatsApp or email
                </Typo>

                <View style={styles.card}>
                    <Row
                        icon={<Ionicons name="call-outline" size={24} color={colors.primary} />}
                        label="Call Us"
                        onPress={handleCall}
                    />
                    <Row
                        icon={<FontAwesome name="whatsapp" size={24} color="#25D366" />}
                        label="Chat on WhatsApp"
                        onPress={handleWhatsApp}
                    />
                    <Row
                        icon={<MaterialIcons name="email" size={24} color={colors.primary} />}
                        label={email}
                        onPress={handleEmail}
                    />
                </View>
            </ScrollView>
        </ScreenComponent>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    scrollContent: {
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._20,
        alignItems: 'center',
    },
    title: {
        fontWeight: '700',
        marginBottom: spacingY._10,
        textAlign: 'center',
    },
    subtitle: {
        color: colors.gray,
        textAlign: 'center',
        marginBottom: spacingY._20,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: radius._15,
        padding: spacingY._15,
        width: '100%',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        gap: spacingY._15,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._10,
        paddingVertical: spacingY._10,
    },
    iconContainer: {
        width: normalizeY(40),
        height: normalizeY(40),
        borderRadius: radius._12,
        backgroundColor: '#e8f0fe',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default HelpScreen;

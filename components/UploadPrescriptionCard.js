// components/UploadPrescriptionCard.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../config/colors';
import { radius, spacingX, spacingY } from '../config/spacing';
import Typo from './Typo';

const { width } = Dimensions.get('screen');

function UploadPrescriptionCard() {
    const handlePress = () => {
        Linking.openURL('https://wa.me/919999050773');
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="camera" size={40} color={colors.primary} />
            </View>
            <Typo size={16} style={styles.title}>
                Upload your prescription
            </Typo>
            <Typo style={styles.subtitle}>
                We'll get back to you shortly
            </Typo>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: width / 2 - spacingX._30,
        borderRadius: radius._15,
        backgroundColor: colors.white,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        padding: spacingY._20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200, // to match product card height
    },
    iconContainer: {
        marginBottom: spacingY._15,
    },
    title: {
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: spacingY._5,
    },
    subtitle: {
        color: colors.gray,
        textAlign: 'center',
        fontSize: 12,
    },
});

export default UploadPrescriptionCard;
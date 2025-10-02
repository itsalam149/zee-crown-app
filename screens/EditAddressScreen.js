// screens/EditAddressScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import ScreenComponent from '../components/ScreenComponent';
import Header from '../components/Header';
import AppButton from '../components/AppButton';
import Typo from '../components/Typo';
import { supabase } from '../lib/supabase';
import colors from '../config/colors';
import { spacingY, radius, spacingX } from '../config/spacing';
import Toast from 'react-native-toast-message';

function EditAddressScreen({ route, navigation }) {
    const { address } = route.params;
    const [loading, setLoading] = useState(false);

    const [houseNo, setHouseNo] = useState(address.house_no);
    const [street, setStreet] = useState(address.street_address);
    const [landmark, setLandmark] = useState(address.landmark || ''); // Added landmark
    const [city, setCity] = useState(address.city);
    const [state, setState] = useState(address.state);
    const [postalCode, setPostalCode] = useState(address.postal_code);
    const [country, setCountry] = useState(address.country);
    const [mobileNumber, setMobileNumber] = useState(address.mobile_number);

    const handleUpdateAddress = async () => {
        if (!houseNo || !street || !city || !state || !postalCode || !country || !mobileNumber) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all required address fields.' });
            return;
        }
        setLoading(true);
        const { error } = await supabase
            .from('addresses')
            .update({
                house_no: houseNo,
                street_address: street,
                landmark, // Added landmark
                city,
                state,
                postal_code: postalCode,
                country,
                mobile_number: mobileNumber
            })
            .eq('id', address.id);

        setLoading(false);

        if (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Could not update the address.' });
        } else {
            Toast.show({ type: 'success', text1: 'Success!', text2: 'Address updated successfully.' });
            navigation.goBack();
        }
    };

    return (
        <ScreenComponent style={styles.container}>
            <Header label="Edit Address" />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Typo style={styles.label}>House No. / Flat No.</Typo>
                <TextInput style={styles.input} value={houseNo} onChangeText={setHouseNo} />

                <Typo style={styles.label}>Street Address / Area</Typo>
                <TextInput style={styles.input} value={street} onChangeText={setStreet} />

                <Typo style={styles.label}>Landmark (Optional)</Typo>
                <TextInput style={styles.input} value={landmark} onChangeText={setLandmark} />

                <Typo style={styles.label}>City</Typo>
                <TextInput style={styles.input} value={city} onChangeText={setCity} />

                <Typo style={styles.label}>State / Province</Typo>
                <TextInput style={styles.input} value={state} onChangeText={setState} />

                <Typo style={styles.label}>Postal Code</Typo>
                <TextInput style={styles.input} value={postalCode} onChangeText={setPostalCode} keyboardType="numeric" />

                <Typo style={styles.label}>Country</Typo>
                <TextInput style={styles.input} value={country} onChangeText={setCountry} />

                <Typo style={styles.label}>Mobile Number</Typo>
                <TextInput style={styles.input} value={mobileNumber} onChangeText={setMobileNumber} keyboardType="phone-pad" />
            </ScrollView>

            <View style={styles.buttonContainer}>
                <AppButton
                    label={loading ? 'Saving...' : 'Save Changes'}
                    onPress={handleUpdateAddress}
                    disabled={loading}
                />
            </View>
        </ScreenComponent>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacingX._20,
        paddingBottom: 100,
    },
    label: {
        marginBottom: spacingY._10,
        fontWeight: '600',
        fontSize: 16,
        color: colors.gray,
    },
    input: {
        backgroundColor: colors.lighterGray,
        padding: spacingY._15,
        borderRadius: radius._10,
        fontSize: 16,
        marginBottom: spacingY._20,
    },
    buttonContainer: {
        padding: spacingX._20,
        paddingBottom: spacingY._30,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.lighterGray,
    },
});

export default EditAddressScreen;
// screens/AddressesScreen.js
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import useAuth from '../auth/useAuth';
import ScreenComponent from 'components/ScreenComponent';
import Header from 'components/Header';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AppButton from 'components/AppButton';
import Toast from 'react-native-toast-message';

function AddressesScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAddAddress, setShowAddAddress] = useState(false);

    const [houseNo, setHouseNo] = useState('');
    const [street, setStreet] = useState('');
    const [landmark, setLandmark] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');

    // FIXED: Correctly implemented useFocusEffect
    useFocusEffect(
        useCallback(() => {
            async function getAddresses() {
                if (!user) { setLoading(false); return; };
                setLoading(true);
                const { data, error } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', user.id);

                if (error) {
                    Toast.show({ type: 'error', text1: 'Error', text2: 'Could not fetch addresses.' });
                } else {
                    setAddresses(data);
                }
                setLoading(false);
            }
            getAddresses();
        }, [user])
    );

    const clearForm = () => {
        setHouseNo('');
        setStreet('');
        setLandmark('');
        setCity('');
        setState('');
        setPostalCode('');
        setCountry('');
        setMobileNumber('');
    };

    const handleAddAddress = async () => {
        if (!houseNo || !street || !city || !state || !postalCode || !country || !mobileNumber) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all address fields.' });
            return;
        }
        setIsSubmitting(true);
        const { error } = await supabase.from('addresses').insert({
            user_id: user.id, house_no: houseNo, street_address: street, landmark, city, state, postal_code: postalCode, country, mobile_number: mobileNumber
        });
        setIsSubmitting(false);

        if (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Could not save address.' });
        } else {
            Toast.show({ type: 'success', text1: 'Success!', text2: 'Address added successfully.' });
            clearForm();
            setShowAddAddress(false);
            const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id);
            if (data) setAddresses(data);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        Alert.alert("Delete Address", "Are you sure you want to delete this address?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    const { error } = await supabase.from('addresses').delete().eq('id', addressId);
                    if (error) {
                        Toast.show({ type: 'error', text1: 'Error', text2: 'Could not delete address.' });
                    } else {
                        Toast.show({ type: 'success', text1: 'Success!', text2: 'Address deleted.' });
                        const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id);
                        if (data) setAddresses(data);
                    }
                }
            }
        ]);
    };

    const AddressCard = ({ item }) => (
        <View style={styles.addressCard}>
            <View style={{ flex: 1 }}>
                <Typo style={{ fontWeight: 'bold' }}>{item.house_no}, {item.street_address}</Typo>
                {item.landmark && <Typo>Near {item.landmark}</Typo>}
                <Typo>{item.city}, {item.state} {item.postal_code}</Typo>
                <Typo>{item.country}</Typo>
                <Typo style={{ marginTop: 5, color: colors.gray }}>Mobile: {item.mobile_number}</Typo>
            </View>
            <View style={styles.iconContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('EditAddress', { address: item })}>
                    <MaterialIcons name="edit" size={24} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteAddress(item.id)}>
                    <MaterialIcons name="delete-outline" size={24} color={colors.red} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScreenComponent style={{ backgroundColor: colors.white }}>
            <Header label="My Addresses" />
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
                <TouchableOpacity style={styles.addAddressButton} onPress={() => setShowAddAddress(!showAddAddress)}>
                    <Ionicons name={showAddAddress ? "remove-circle" : "add-circle"} size={20} color={colors.primary} />
                    <Typo style={{ color: colors.primary, fontWeight: 'bold' }}>
                        {showAddAddress ? "Cancel" : "Add New Address"}
                    </Typo>
                </TouchableOpacity>

                {showAddAddress && (
                    <View style={styles.form}>
                        <TextInput placeholder="House No. / Flat No." value={houseNo} placeholderTextColor={colors.gray} onChangeText={setHouseNo} style={styles.input} />
                        <TextInput placeholder="Street Address / Area" value={street} placeholderTextColor={colors.gray} onChangeText={setStreet} style={styles.input} />
                        <TextInput placeholder="Landmark (Optional)" value={landmark} onChangeText={setLandmark} placeholderTextColor={colors.gray} style={styles.input} />
                        <TextInput placeholder="City" value={city} onChangeText={setCity} placeholderTextColor={colors.gray} style={styles.input} />
                        <TextInput placeholder="State / Province" value={state} onChangeText={setState} placeholderTextColor={colors.gray} style={styles.input} />
                        <TextInput placeholder="Postal Code" value={postalCode} onChangeText={setPostalCode} placeholderTextColor={colors.gray} style={styles.input} keyboardType="numeric" />
                        <TextInput placeholder="Country" value={country} onChangeText={setCountry} placeholderTextColor={colors.gray} style={styles.input} />
                        <TextInput placeholder="Mobile Number" value={mobileNumber} onChangeText={setMobileNumber} placeholderTextColor={colors.gray} style={styles.input} keyboardType="phone-pad" />
                        <AppButton
                            label={isSubmitting ? "Saving..." : "Save Address"}
                            onPress={handleAddAddress}
                            disabled={isSubmitting}
                            style={{ marginTop: spacingY._10 }}
                        />
                    </View>
                )}

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={addresses}
                        renderItem={({ item }) => <AddressCard item={item} />}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={<Typo style={{ textAlign: 'center', marginTop: 50 }}>No saved addresses found.</Typo>}
                        scrollEnabled={false}
                    />
                )}
            </ScrollView>
        </ScreenComponent>
    );
}

const styles = StyleSheet.create({
    container: { padding: spacingX._20 },
    addressCard: {
        flexDirection: 'row',
        padding: spacingX._15,
        borderWidth: 1,
        borderColor: colors.lighterGray,
        borderRadius: radius._10,
        marginBottom: spacingY._15,
        alignItems: 'center',
        backgroundColor: colors.white,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconContainer: {
        flexDirection: 'row',
        gap: spacingX._15,
        marginLeft: spacingX._10,
    },
    addAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._10,
        alignSelf: 'center',
        marginVertical: spacingY._10
    },
    form: {
        padding: spacingX._15,
        backgroundColor: colors.lighterGray,
        borderRadius: radius._10,
        marginBottom: spacingY._20,
    },
    input: {
        backgroundColor: colors.white,
        padding: spacingX._12,
        borderRadius: radius._5,
        marginBottom: spacingY._10,
        fontSize: 16,
    },
});

export default AddressesScreen;
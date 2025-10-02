// screens/CheckoutScreen.js
import React, { useState, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
// FIXED: Added Platform to the import list
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, ScrollView, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import useAuth from '../auth/useAuth';

import AppButton from 'components/AppButton';
import Header from 'components/Header';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('screen');

function CheckoutScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);

  // Form State
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [addressRes, cartRes] = await Promise.all([
      supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }),
      supabase.from('cart_items').select('*, products(*)').eq('user_id', user.id)
    ]);

    if (addressRes.data) {
      setAddresses(addressRes.data);
      if (addressRes.data.length > 0) {
        setSelectedAddress(addressRes.data[0].id);
      }
    }

    if (cartRes.data) setCartItems(cartRes.data);
    setLoading(false);
  }, [user]);

  useFocusEffect(fetchData);

  const handleAddAddress = async () => {
    if (!houseNo || !street || !city || !state || !postalCode || !country || !mobileNumber) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all address fields.' });
      return;
    }
    const { error } = await supabase.from('addresses').insert({
      user_id: user.id, house_no: houseNo, street_address: street, landmark, city, state, postal_code: postalCode, country, mobile_number: mobileNumber
    });
    if (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not save address.' });
    } else {
      Toast.show({ type: 'success', text1: 'Success!', text2: 'Address added successfully.' });
      setShowAddAddress(false);
      fetchData();
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
  const shippingFee = subtotal > 0 ? 50.00 : 0;
  const total = subtotal + shippingFee;

  const handleConfirmOrder = async () => {
    if (!selectedAddress) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please select a shipping address.' });
      return;
    }
    setIsProcessingOrder(true);
    const { data, error } = await supabase.functions.invoke('create-order', {
      body: { address_id: selectedAddress, payment_method: 'COD' },
    });
    setIsProcessingOrder(false);

    if (error) {
      Toast.show({ type: 'error', text1: 'Order Error', text2: 'There was a problem placing your order.' });
      console.error(error);
    } else {
      Toast.show({ type: 'success', text1: 'Order Placed!', text2: `Your COD order has been placed successfully.` });
      navigation.navigate('Home');
    }
  };

  const renderAddressCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.addressCard, selectedAddress === item.id && styles.selectedAddressCard]}
      onPress={() => setSelectedAddress(item.id)}
    >
      <View style={{ flex: 1 }}>
        <Typo style={{ fontWeight: 'bold' }}>{item.house_no}, {item.street_address}</Typo>
        {item.landmark && <Typo>Near {item.landmark}</Typo>}
        <Typo>{item.city}, {item.state} {item.postal_code}</Typo>
        <Typo>{item.country}</Typo>
        <Typo style={{ marginTop: 5, color: colors.gray }}>Mobile: {item.mobile_number}</Typo>
      </View>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('EditAddress', { address: item })}
      >
        <MaterialIcons name="edit" size={20} color={colors.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScreenComponent style={{ backgroundColor: colors.white }}>
      <Header label={'Checkout'} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 200 }}>
        <Typo size={18} style={styles.sectionTitle}>Shipping Address</Typo>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : addresses.length > 0 ? (
          <FlatList
            data={addresses}
            renderItem={renderAddressCard}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: spacingY._10 }}
          />
        ) : !showAddAddress && (
          <Typo style={{ textAlign: 'center', marginVertical: spacingY._20 }}>No addresses found. Add one to continue.</Typo>
        )}

        {/* ... (Add Address Button and Form UI remains the same) ... */}

        <Typo size={18} style={styles.sectionTitle}>Payment Method</Typo>
        <View style={[styles.paymentCard, styles.selectedPaymentCard]}>
          <View style={styles.radioCircle}><View style={styles.radioDot} /></View>
          <Typo style={{ fontWeight: 'bold', flex: 1, marginLeft: spacingX._15 }}>Cash on Delivery (COD)</Typo>
        </View>

        <Typo size={18} style={styles.sectionTitle}>Order Summary</Typo>
        {cartItems.map(item => (
          <View key={item.id} style={styles.summaryRow}>
            <Typo style={{ flex: 1 }} numberOfLines={1}>{item.products?.name || 'Product'} (x{item.quantity})</Typo>
            <Typo>₹{((item.products?.price || 0) * item.quantity).toFixed(2)}</Typo>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceRow}>
          <Typo style={styles.priceLabel}>Total</Typo>
          <Typo style={styles.priceValue}>₹{total.toFixed(2)}</Typo>
        </View>
        <AppButton label={isProcessingOrder ? "Placing Order..." : "Confirm Order (COD)"} onPress={handleConfirmOrder} disabled={isProcessingOrder || loading} />
      </View>
    </ScreenComponent>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacingX._20 },
  sectionTitle: { fontWeight: 'bold', marginTop: spacingY._20, marginBottom: spacingY._10 },
  addressCard: {
    padding: spacingX._15,
    borderWidth: 1,
    borderColor: colors.lighterGray,
    borderRadius: radius._10,
    marginRight: spacingX._10,
    width: width * 0.75,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedAddressCard: { borderColor: colors.primary, borderWidth: 2 },
  editButton: {
    backgroundColor: colors.primary,
    padding: spacingX._10,
    borderRadius: radius._30,
    marginLeft: spacingX._10,
  },
  addAddressButton: { flexDirection: 'row', alignItems: 'center', gap: spacingX._10, alignSelf: 'center', marginVertical: spacingY._10 },
  form: { padding: spacingX._10, backgroundColor: colors.lighterGray, borderRadius: radius._10 },
  input: {
    backgroundColor: colors.white,
    padding: spacingX._12,
    borderRadius: radius._5,
    marginBottom: spacingY._10,
    fontSize: 16,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacingX._15,
    borderWidth: 1,
    borderColor: colors.lighterGray,
    borderRadius: radius._10,
    marginBottom: spacingY._10,
  },
  selectedPaymentCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  radioCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacingY._5 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacingX._20,
    paddingBottom: Platform.OS === 'ios' ? spacingY._30 : spacingY._20,
    borderTopWidth: 1,
    borderColor: colors.lighterGray,
    backgroundColor: colors.white,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacingY._15,
  },
  priceLabel: { color: colors.gray, fontWeight: '500' },
  priceValue: { fontWeight: 'bold', fontSize: 20 },
});

export default CheckoutScreen;
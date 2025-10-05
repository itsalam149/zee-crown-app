// screens/CheckoutScreen.js
import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
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

  const [shippingFee, setShippingFee] = useState(0);

  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        if (!user) {
          setLoading(false);
          return;
        }
        setLoading(true);

        const [addressRes, cartRes] = await Promise.all([
          supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false }),
          supabase
            .from('cart_items')
            .select('*, products(*)')
            .eq('user_id', user.id),
        ]);

        if (addressRes.data) {
          setAddresses(addressRes.data);
          if (addressRes.data.length > 0) {
            setSelectedAddress(addressRes.data[0].id);
            setShowAddAddress(false);
          } else {
            setShowAddAddress(true);
          }
        }

        if (cartRes.data) setCartItems(cartRes.data);
        setLoading(false);
      }

      fetchData();
    }, [user])
  );

  const handleAddAddress = async () => {
    if (
      !houseNo ||
      !street ||
      !city ||
      !state ||
      !postalCode ||
      !country ||
      !mobileNumber
    ) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill all address fields.',
      });
      return;
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: user.id,
        house_no: houseNo,
        street_address: street,
        landmark,
        city,
        state,
        postal_code: postalCode,
        country,
        mobile_number: mobileNumber,
      })
      .select();

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not save address.',
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: 'Address added successfully.',
      });
      const newAddress = data[0];
      setAddresses(prev => [newAddress, ...prev]);
      setSelectedAddress(newAddress.id);
      setShowAddAddress(false);

      // clear form
      setHouseNo('');
      setStreet('');
      setLandmark('');
      setCity('');
      setState('');
      setPostalCode('');
      setCountry('');
      setMobileNumber('');
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + ((item.products?.price || 0) * item.quantity),
    0
  );

  // ✅ fetch shipping fee from table based on subtotal
  useEffect(() => {
    async function fetchShipping() {
      if (subtotal <= 0) {
        setShippingFee(0);
        return;
      }

      const { data, error } = await supabase
        .from('shipping_rules')
        .select('*')
        .eq('is_active', true)
        .lte('min_order_value', subtotal)
        .or(`max_order_value.is.null,max_order_value.gte.${subtotal}`)
        .order('min_order_value', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Shipping fetch error:', error);
        setShippingFee(subtotal < 500 ? 50 : 0); // fallback
      } else if (data && data.length > 0) {
        setShippingFee(data[0].charge);
      } else {
        setShippingFee(subtotal < 500 ? 50 : 0); // fallback
      }
    }

    fetchShipping();
  }, [subtotal]);

  const total = subtotal + shippingFee;

  // ✅ FIXED confirm order
  const handleConfirmOrder = async () => {
    if (!selectedAddress) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a shipping address.',
      });
      return;
    }

    setIsProcessingOrder(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setIsProcessingOrder(false);
      Toast.show({
        type: 'error',
        text1: 'Not Logged In',
        text2: 'Please log in again to place your order.',
      });
      navigation.navigate('Login');
      return;
    }

    const { data, error } = await supabase.functions.invoke('create-order', {
      body: { address_id: selectedAddress, payment_method: 'COD' },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    setIsProcessingOrder(false);

    if (error) {
      console.error('Order function error:', error);
      Toast.show({
        type: 'error',
        text1: 'Order Error',
        text2:
          error.message || error.error || 'There was a problem placing your order.',
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Order Placed!',
        text2: `Your COD order has been placed successfully.`,
      });
      navigation.navigate('Home');
    }
  };

  const renderAddressCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.addressCard,
        selectedAddress === item.id && styles.selectedAddressCard,
      ]}
      onPress={() => setSelectedAddress(item.id)}
    >
      <View style={{ flex: 1 }}>
        <Typo style={{ fontWeight: 'bold' }}>
          {item.house_no}, {item.street_address}
        </Typo>
        {item.landmark && <Typo>Near {item.landmark}</Typo>}
        <Typo>
          {item.city}, {item.state} {item.postal_code}
        </Typo>
        <Typo>{item.country}</Typo>
        <Typo style={{ marginTop: 5, color: colors.gray }}>
          Mobile: {item.mobile_number}
        </Typo>
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
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 200 }}
      >
        <Typo size={18} style={styles.sectionTitle}>
          Shipping Address
        </Typo>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginVertical: 20 }}
          />
        ) : addresses.length > 0 && !showAddAddress ? (
          <>
            <FlatList
              data={addresses}
              renderItem={renderAddressCard}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: spacingY._10 }}
            />
            <TouchableOpacity
              style={styles.addAddressButton}
              onPress={() => setShowAddAddress(true)}
            >
              <Ionicons name="add-circle" size={22} color={colors.primary} />
              <Typo
                style={{ fontWeight: 'bold', color: colors.primary }}
              >
                Add New Address
              </Typo>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.form}>
            {/* address form inputs */}
            <TextInput
              style={styles.input}
              placeholder="House No."
              value={houseNo}
              onChangeText={setHouseNo}
            />
            <TextInput
              style={styles.input}
              placeholder="Street Address"
              value={street}
              onChangeText={setStreet}
            />
            <TextInput
              style={styles.input}
              placeholder="Landmark"
              value={landmark}
              onChangeText={setLandmark}
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              value={city}
              onChangeText={setCity}
            />
            <TextInput
              style={styles.input}
              placeholder="State"
              value={state}
              onChangeText={setState}
            />
            <TextInput
              style={styles.input}
              placeholder="Postal Code"
              value={postalCode}
              onChangeText={setPostalCode}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Country"
              value={country}
              onChangeText={setCountry}
            />
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
            />
            <AppButton label="Save Address" onPress={handleAddAddress} />
            {addresses.length > 0 && (
              <AppButton
                label="Cancel"
                style={{
                  marginTop: spacingY._10,
                  backgroundColor: colors.gray,
                }}
                onPress={() => setShowAddAddress(false)}
              />
            )}
          </View>
        )}

        <Typo size={18} style={styles.sectionTitle}>
          Payment Method
        </Typo>
        <View style={[styles.paymentCard, styles.selectedPaymentCard]}>
          <View style={styles.radioCircle}>
            <View style={styles.radioDot} />
          </View>
          <Typo
            style={{
              fontWeight: 'bold',
              flex: 1,
              marginLeft: spacingX._15,
            }}
          >
            Cash on Delivery (COD)
          </Typo>
        </View>

        <Typo size={18} style={styles.sectionTitle}>
          Order Summary
        </Typo>
        {cartItems.map(item => (
          <View key={item.id} style={styles.summaryRow}>
            <Typo style={{ flex: 1 }} numberOfLines={1}>
              {item.products?.name || 'Product'} (x{item.quantity})
            </Typo>
            <Typo>
              ₹{((item.products?.price || 0) * item.quantity).toFixed(2)}
            </Typo>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceRow}>
          <Typo style={styles.priceLabel}>Total</Typo>
          <Typo style={styles.priceValue}>₹{total.toFixed(2)}</Typo>
        </View>
        <AppButton
          label={
            isProcessingOrder ? 'Placing Order...' : 'Confirm Order (COD)'
          }
          onPress={handleConfirmOrder}
          disabled={isProcessingOrder || loading}
        />
      </View>
    </ScreenComponent>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacingX._20 },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: spacingY._20,
    marginBottom: spacingY._10,
  },
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
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._10,
    alignSelf: 'center',
    marginVertical: spacingY._10,
  },
  form: {
    padding: spacingX._10,
    backgroundColor: colors.lighterGray,
    borderRadius: radius._10,
  },
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacingY._5,
  },
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

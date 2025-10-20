// screens/CheckoutScreen.js
import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
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
import RazorpayCheckout from 'react-native-razorpay';
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

const FreeShippingBar = ({ subtotal, threshold }) => {
  if (!threshold || subtotal <= 0) return null;
  const remainingAmount = threshold - subtotal;

  if (remainingAmount > 0) {
    return (
      <View style={styles.shippingBar}>
        <Typo style={styles.shippingBarText}>
          Add <Typo style={{ fontWeight: 'bold' }}>₹{remainingAmount.toFixed(2)}</Typo> more for FREE delivery!
        </Typo>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${(subtotal / threshold) * 100}%` }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.shippingBar, styles.shippingBarSuccess]}>
      <Typo style={[styles.shippingBarText, styles.shippingBarSuccessText]}>
        🎉 Yay! You've got FREE delivery!
      </Typo>
    </View>
  );
};

function CheckoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);

  const { buyNowItem } = route.params || {};

  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        if (!user) {
          setLoading(false);
          return;
        }
        setLoading(true);

        if (buyNowItem) {
          setCartItems([buyNowItem]);
        } else {
          const { data: cartData, error: cartError } = await supabase
            .from('cart_items')
            .select('*, products(*)')
            .eq('user_id', user.id);
          if (cartError) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Could not fetch cart.' });
          } else {
            setCartItems(cartData || []);
          }
        }

        const { data: addressData, error: addressError } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });

        if (addressError) {
          Toast.show({ type: 'error', text1: 'Error', text2: 'Could not fetch addresses.' });
        } else if (addressData) {
          setAddresses(addressData);
          if (addressData.length > 0) {
            setSelectedAddress(addressData[0].id);
            setShowAddAddress(false);
          } else {
            setShowAddAddress(true);
          }
        }
        setLoading(false);
      }
      fetchData();
    }, [user, buyNowItem])
  );

  const handleAddAddress = async () => {
    if (!houseNo || !street || !city || !state || !postalCode || !country || !mobileNumber) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all address fields.' });
      return;
    }
    const { data, error } = await supabase.from('addresses').insert({
      user_id: user.id, house_no: houseNo, street_address: street, landmark, city, state, postal_code: postalCode, country, mobile_number: mobileNumber,
    }).select();
    if (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not save address.' });
    } else {
      Toast.show({ type: 'success', text1: 'Success!', text2: 'Address added successfully.' });
      const newAddress = data[0];
      setAddresses(prev => [newAddress, ...prev]);
      setSelectedAddress(newAddress.id);
      setShowAddAddress(false);
      setHouseNo(''); setStreet(''); setLandmark(''); setCity(''); setState(''); setPostalCode(''); setCountry(''); setMobileNumber('');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + ((item.products?.price || 0) * item.quantity), 0);

  useEffect(() => {
    async function fetchShippingRules() {
      const { data, error } = await supabase.from('shipping_rules').select('min_order_value, charge').eq('is_active', true).order('min_order_value', { ascending: false });
      if (error) {
        setFreeShippingThreshold(299);
        setShippingFee(subtotal > 0 && subtotal < 299 ? 40 : 0);
      } else if (data && data.length > 0) {
        const freeShippingRule = data.find(rule => rule.charge === 0);
        setFreeShippingThreshold(freeShippingRule?.min_order_value || 0);
        if (subtotal > 0) {
          const applicableRule = data.find(rule => subtotal >= rule.min_order_value);
          setShippingFee(applicableRule ? applicableRule.charge : 40);
        } else {
          setShippingFee(0);
        }
      } else {
        setFreeShippingThreshold(299);
        setShippingFee(subtotal > 0 && subtotal < 299 ? 40 : 0);
      }
    }
    fetchShippingRules();
  }, [subtotal]);

  const total = subtotal + shippingFee;

  const createStandardOrder = async (paymentMethod) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke('create-order', {
      body: {
        address_id: selectedAddress,
        payment_method: paymentMethod
      },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (error) {
      throw new Error(error.message || "Failed to create order.");
    }

    Toast.show({
      type: 'success',
      text1: 'Order Placed!',
      text2: `Your ${paymentMethod} order has been placed successfully.`
    });
    navigation.navigate('Home');
  };

  const handleConfirmOrder = async () => {
    if (!selectedAddress) {
      Toast.show({ type: 'error', text1: 'Please select an address.' });
      return;
    }

    setIsProcessingOrder(true);
    let originalCart = null;

    try {
      // --- BUY NOW LOGIC: CART MANIPULATION ---
      if (buyNowItem) {
        const { data: currentCart, error: backupError } = await supabase.from('cart_items').select('*').eq('user_id', user.id);
        if (backupError) throw new Error("Could not back up cart.");
        originalCart = currentCart;

        if (originalCart && originalCart.length > 0) {
          const { error: deleteError } = await supabase.from('cart_items').delete().eq('user_id', user.id);
          if (deleteError) throw new Error("Could not clear cart for Buy Now.");
        }

        const { error: insertError } = await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: buyNowItem.product_id,
          quantity: buyNowItem.quantity
        });
        if (insertError) throw new Error("Could not add item to cart for Buy Now.");
      }

      // --- PAYMENT AND ORDER CREATION ---
      if (selectedPaymentMethod === 'ONLINE') {
        const { data: orderData, error: orderError } = await supabase.functions.invoke(
          'create-razorpay-order', { body: { amount: total, currency: 'INR', receipt: `receipt_${Date.now()}` } }
        );
        if (orderError) throw new Error(orderError.message);

        const addressDetails = addresses.find(addr => addr.id === selectedAddress);

        const options = {
          description: 'Payment for your order',
          image: 'https://drive.google.com/file/d/1q_wnJhaUg1zSFsXV4ImVbi_M-QEK5iiV/view?usp=sharing',
          currency: 'INR',
          key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID, 
          amount: orderData.amount,
          name: 'Zee Crown',
          order_id: orderData.id,
          prefill: {
            email: user.email,
            contact: addressDetails?.mobile_number || '',
            name: user.user_metadata?.full_name || 'Customer'
          },
          theme: { color: colors.primary },
        };

        await new Promise((resolve, reject) => {
          RazorpayCheckout.open(options)
            .then(async () => {
              try {
                await createStandardOrder('Paid');
                resolve();
              } catch (e) {
                reject(e);
              }
            })
            .catch((error) => {
              if (error.code !== 2) { // 2 = Payment Cancelled
                Toast.show({ type: 'error', text1: 'Payment Failed', text2: error.description || 'An unknown error occurred.' });
              }
              reject(new Error(error.description || 'Payment Failed'));
            });
        });
      } else { // COD
        await createStandardOrder('COD');
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Order Error', text2: err.message });
    } finally {
      // --- CART RESTORE LOGIC ---
      if (buyNowItem && originalCart !== null) {
        await supabase.from('cart_items').delete().eq('user_id', user.id);
        if (originalCart.length > 0) {
          const itemsToRestore = originalCart.map(({ id, created_at, ...rest }) => rest);
          await supabase.from('cart_items').insert(itemsToRestore);
        }
      }
      setIsProcessingOrder(false);
    }
  };

  // ... render methods and styles are unchanged ...
  const renderAddressCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.addressCard, selectedAddress === item.id && styles.selectedAddressCard]}
      onPress={() => {
        setSelectedAddress(item.id);
      }}
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
        onPress={(e) => {
          e.stopPropagation();
          navigation.navigate('EditAddress', { address: item });
        }}
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
        ) : addresses.length > 0 && !showAddAddress ? (
          <>
            <FlatList
              data={addresses}
              renderItem={renderAddressCard}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: spacingY._10 }}
              extraData={selectedAddress}
            />
            <TouchableOpacity style={styles.addAddressButton} onPress={() => setShowAddAddress(true)}>
              <Ionicons name="add-circle" size={22} color={colors.primary} />
              <Typo style={{ fontWeight: 'bold', color: colors.primary }}>Add New Address</Typo>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.form}>
            <TextInput style={styles.input} placeholder="House No." value={houseNo} placeholderTextColor={colors.gray} onChangeText={setHouseNo} />
            <TextInput style={styles.input} placeholder="Street Address" value={street} placeholderTextColor={colors.gray} onChangeText={setStreet} />
            <TextInput style={styles.input} placeholder="Landmark" value={landmark} placeholderTextColor={colors.gray} onChangeText={setLandmark} />
            <TextInput style={styles.input} placeholder="City" value={city} placeholderTextColor={colors.gray} onChangeText={setCity} />
            <TextInput style={styles.input} placeholder="State" value={state} placeholderTextColor={colors.gray} onChangeText={setState} />
            <TextInput style={styles.input} placeholder="Postal Code" value={postalCode} placeholderTextColor={colors.gray} onChangeText={setPostalCode} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Country" value={country} placeholderTextColor={colors.gray} onChangeText={setCountry} />
            <TextInput style={styles.input} placeholder="Mobile Number" value={mobileNumber} placeholderTextColor={colors.gray} onChangeText={setMobileNumber} keyboardType="phone-pad" />
            <AppButton label="Save Address" onPress={handleAddAddress} />
            {addresses.length > 0 && <AppButton label="Cancel" style={{ marginTop: spacingY._10, backgroundColor: colors.gray }} onPress={() => setShowAddAddress(false)} />}
          </View>
        )}
        <Typo size={18} style={styles.sectionTitle}>Payment Method</Typo>
        <TouchableOpacity style={[styles.paymentCard, selectedPaymentMethod === 'COD' && styles.selectedPaymentCard]} onPress={() => setSelectedPaymentMethod('COD')}>
          <View style={styles.radioCircle}>{selectedPaymentMethod === 'COD' && <View style={styles.radioDot} />}</View>
          <Typo style={styles.paymentText}>Cash on Delivery (COD)</Typo>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.paymentCard, selectedPaymentMethod === 'ONLINE' && styles.selectedPaymentCard]} onPress={() => setSelectedPaymentMethod('ONLINE')}>
          <View style={styles.radioCircle}>{selectedPaymentMethod === 'ONLINE' && <View style={styles.radioDot} />}</View>
          <Typo style={styles.paymentText}>Pay Online</Typo>
        </TouchableOpacity>
        <Typo size={18} style={styles.sectionTitle}>Order Summary</Typo>
        <FreeShippingBar subtotal={subtotal} threshold={freeShippingThreshold} />
        {cartItems.map((item, index) => (
          <View key={item.id || index} style={styles.summaryRow}>
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
        <AppButton
          label={isProcessingOrder ? 'Placing Order...' : `Confirm Order (${selectedPaymentMethod})`}
          onPress={handleConfirmOrder}
          disabled={isProcessingOrder || loading}
        />
      </View>
    </ScreenComponent>
  );
}


const styles = StyleSheet.create({
  container: { paddingHorizontal: spacingX._20 },
  sectionTitle: { fontWeight: 'bold', marginTop: spacingY._20, marginBottom: spacingY._10 },
  addressCard: { padding: spacingX._15, borderWidth: 1, borderColor: colors.lighterGray, borderRadius: radius._10, marginRight: spacingX._10, width: width * 0.75, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' },
  selectedAddressCard: { borderColor: colors.primary, borderWidth: 2 },
  editButton: { backgroundColor: colors.primary, padding: spacingX._10, borderRadius: radius._30, marginLeft: spacingX._10 },
  addAddressButton: { flexDirection: 'row', alignItems: 'center', gap: spacingX._10, alignSelf: 'center', marginVertical: spacingY._10 },
  form: { padding: spacingX._10, backgroundColor: colors.lighterGray, borderRadius: radius._10 },
  input: { backgroundColor: colors.white, padding: spacingX._12, borderRadius: radius._5, marginBottom: spacingY._10, fontSize: 16 },
  paymentCard: { flexDirection: 'row', alignItems: 'center', padding: spacingX._15, borderWidth: 1, borderColor: colors.lighterGray, borderRadius: radius._10, marginBottom: spacingY._10 },
  selectedPaymentCard: { borderColor: colors.primary, borderWidth: 2 },
  radioCircle: { height: 24, width: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  radioDot: { height: 12, width: 12, borderRadius: 6, backgroundColor: colors.primary },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacingY._5 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacingX._20, paddingBottom: Platform.OS === 'ios' ? spacingY._30 : spacingY._20, borderTopWidth: 1, borderColor: colors.lighterGray, backgroundColor: colors.white },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacingY._15 },
  priceLabel: { color: colors.gray, fontWeight: '500' },
  priceValue: { fontWeight: 'bold', fontSize: 20 },
  shippingBar: { backgroundColor: '#E3F2FD', padding: spacingX._15, borderRadius: radius._10, marginBottom: spacingY._15, borderWidth: 1, borderColor: '#BBDEFB' },
  shippingBarText: { textAlign: 'center', color: '#1565C0', fontWeight: '500' },
  shippingBarSuccess: { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' },
  shippingBarSuccessText: { color: '#2E7D32', fontWeight: '600' },
  progressBarBackground: { height: 6, backgroundColor: 'rgba(21, 101, 192, 0.2)', borderRadius: 3, marginTop: spacingY._10, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#1976D2', borderRadius: 3 },
  paymentText: { fontWeight: 'bold', flex: 1, marginLeft: spacingX._15 },
});

export default CheckoutScreen;
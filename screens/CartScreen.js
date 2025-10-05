// screens/CartScreen.js
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import useAuth from '../auth/useAuth';

import AppButton from 'components/AppButton';
import CartCard from 'components/CartCard';
import Header from 'components/Header';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { spacingX, spacingY, radius } from 'config/spacing';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';

function CartScreen({ navigation }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shippingFee, setShippingFee] = useState(0);

  const fetchCartItems = useCallback(() => {
    async function getItems() {
      if (!user) {
        setCartItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);

      const { data, error } = await supabase
        .from('cart_items')
        .select('id, quantity, products(*)')
        .eq('user_id', user.id)
        .order('id', { ascending: true });

      if (error) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Could not fetch cart items.' });
      } else {
        setCartItems(data || []);
      }
      setLoading(false);
    }
    getItems();
  }, [user]);

  useFocusEffect(fetchCartItems);

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return removeItem(cartItemId);

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', cartItemId);

    if (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not update quantity.' });
      fetchCartItems();
    }
  };

  const removeItem = async (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));

    const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
    if (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not remove item.' });
      fetchCartItems();
    } else {
      Toast.show({ type: 'success', text1: 'Item removed from cart.' });
    }
  };

  // ✅ Calculate subtotal safely
  const subtotal = cartItems.reduce(
    (sum, item) => sum + ((item.products?.price || 0) * item.quantity),
    0
  );

  // ✅ Fetch shipping rule from table
  React.useEffect(() => {
    async function fetchShippingRule() {
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
        console.error('Shipping rule fetch error:', error);
        setShippingFee(subtotal < 500 ? 50 : 0); // fallback
      } else if (data && data.length > 0) {
        setShippingFee(data[0].charge);
      } else {
        setShippingFee(subtotal < 500 ? 50 : 0); // fallback if no rule
      }
    }

    fetchShippingRule();
  }, [subtotal]);

  const total = subtotal + shippingFee;

  const renderEmptyCart = () => (
    <View style={styles.centerContent}>
      <View style={styles.emptyCartIconBg}>
        <Feather name="shopping-cart" size={40} color={colors.primary} />
      </View>
      <Typo size={18} style={{ fontWeight: '600', marginTop: spacingY._20 }}>Your Cart is Empty</Typo>
      <Typo style={{ color: colors.gray, textAlign: 'center', marginTop: spacingY._10 }}>
        Looks like you haven't added anything to your cart yet.
      </Typo>
      <AppButton
        label="Start Shopping"
        onPress={() => navigation.navigate('Home')}
        style={{ marginTop: spacingY._30, width: '60%' }}
      />
    </View>
  );

  return (
    <ScreenComponent style={styles.container}>
      <Header label={'My Cart'} />
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : cartItems.length === 0 ? (
        renderEmptyCart()
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={cartItems}
            contentContainerStyle={styles.listContainer}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <CartCard
                item={item}
                onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                onRemove={() => removeItem(item.id)}
              />
            )}
          />
          <View style={styles.checkoutContainer}>
            <Row title={'Subtotal'} price={`₹${subtotal.toFixed(2)}`} />
            <Row title={'Shipping fee'} price={`₹${shippingFee.toFixed(2)}`} />
            <Row title={'Total'} price={`₹${total.toFixed(2)}`} />
            <AppButton
              label={'Proceed to Checkout'}
              onPress={() => navigation.navigate('Checkout')}
            />
          </View>
        </View>
      )}
    </ScreenComponent>
  );
}

const Row = ({ title, price }) => (
  <View style={styles.row}>
    <Typo size={16} style={{ color: title === 'Total' ? colors.black : colors.gray, fontWeight: '500' }}>
      {title}
    </Typo>
    <Typo size={18} style={{ fontWeight: '700' }}>
      {price}
    </Typo>
  </View>
);

const styles = StyleSheet.create({
  container: { backgroundColor: colors.white },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacingX._40 },
  emptyCartIconBg: {
    backgroundColor: colors.lighterGray,
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._15,
    paddingBottom: 230,
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 85,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._30,
    borderTopRightRadius: radius._30,
    padding: spacingY._20,
    paddingHorizontal: spacingX._30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacingY._10,
  },
});

export default CartScreen;

// screens/ItemDetailsScreen.js
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import useAuth from '../auth/useAuth';
import ItemImageSlider from '../components/ItemImageSlider';
import { supabase } from '../lib/supabase';

const { height, width } = Dimensions.get('screen');

// A less intrusive "Toast" notification for success messages
const SuccessToast = ({ message, visible }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8);
    }
  }, [visible]);

  return (
    <View style={styles.toastWrapper} pointerEvents="none">
      <Animated.View style={[styles.toastContainer, animatedStyle]}>
        <MaterialIcons name="check-circle" size={32} color={colors.white} />
        <Typo style={styles.toastText}>{message}</Typo>
      </Animated.View>
    </View>
  );
};

function ItemDetailsScreen({ route, navigation }) {
  const iconSize = 22;
  const { item } = route.params;
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const modalScale = useSharedValue(0);

  // Calculate discount percentage
  const discount = item.mrp && item.mrp > item.price
    ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
    : 0;

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
  }));

  const showLoginPrompt = () => {
    setShowLoginPopup(true);
    modalScale.value = withSpring(1, { tension: 50, friction: 7 });
  };

  const hideLoginPrompt = () => {
    modalScale.value = withTiming(0, { duration: 200 });
    setTimeout(() => setShowLoginPopup(false), 200);
  };

  const triggerSuccessToast = () => {
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2000);
  };

  const handleAddToCart = async () => {
    if (!user) return showLoginPrompt();
    setLoading(true);
    const { error } = await supabase.from('cart_items').upsert({
      user_id: user.id,
      product_id: item.id,
      quantity: quantity,
    }, { onConflict: 'user_id, product_id' });

    if (error) {
      console.error('Error adding to cart:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not add item to cart.' });
    } else {
      triggerSuccessToast();
    }
    setLoading(false);
  };

  const handleBuyNow = () => {
    if (!user) return showLoginPrompt();

    // Create an item structure that CheckoutScreen can use
    const buyNowItem = {
      product_id: item.id,
      quantity: quantity,
      products: item // Pass the full product object for display
    };

    // Navigate to checkout with the special 'buyNowItem' param
    navigation.navigate('Checkout', { buyNowItem });
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <ItemImageSlider images={item.image_url} />

          <View style={styles.detailsContainer}>
            <Typo size={24} style={styles.titleText}>{item.name}</Typo>

            <View style={styles.subHeaderContainer}>
              <Typo size={28} style={styles.priceText}>
                ₹{item.price}
              </Typo>
              {item.mrp && item.mrp > item.price && (
                <Typo size={20} style={styles.mrpText}>
                  ₹{item.mrp}
                </Typo>
              )}
              {discount > 0 && (
                <View style={styles.discountBadge}>
                  <Typo style={styles.discountText}>{discount}% OFF</Typo>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            <Typo size={18} style={styles.sectionTitle}>Description</Typo>
            <Typo style={styles.descriptionText}>{item.description}</Typo>

            <View style={styles.divider} />

            <View style={styles.quantityContainer}>
              <Typo size={18} style={styles.sectionTitle}>Quantity</Typo>
              <View style={styles.countView}>
                <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Typo size={22} style={styles.countButton}>-</Typo>
                </TouchableOpacity>
                <Typo size={20} style={styles.countText}>{quantity}</Typo>
                <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                  <Typo size={22} style={styles.countButton}>+</Typo>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={({ pressed }) => [styles.addToCartButton, { transform: [{ scale: pressed ? 0.98 : 1 }] }]} onPress={handleAddToCart} disabled={loading || isBuyingNow}>
            {loading ? <ActivityIndicator size="small" color={colors.black} /> : <Typo style={styles.addToCartLabel}>Add to Cart</Typo>}
          </Pressable>
          <Pressable style={({ pressed }) => [styles.buyNowButton, { transform: [{ scale: pressed ? 0.98 : 1 }] }]} onPress={handleBuyNow} disabled={loading || isBuyingNow}>
            {isBuyingNow ? <ActivityIndicator size="small" color={colors.white} /> : <Typo style={styles.buyNowLabel}>Buy Now</Typo>}
          </Pressable>
        </View>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BlurView intensity={80} tint="light" style={styles.iconBg}>
              <MaterialIcons name="arrow-back-ios-new" size={iconSize} color="black" />
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>

      {showSuccessToast && <SuccessToast message={`Added to Cart!`} visible={showSuccessToast} />}

      <Modal visible={showLoginPopup} transparent={true} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={hideLoginPrompt}>
          <Animated.View style={[styles.popupContainer, animatedModalStyle]}>
            <View style={[styles.popupIconContainer, { backgroundColor: '#F44336' }]}>
              <MaterialIcons name={'error'} size={50} color="white" />
            </View>
            <Typo size={24} style={styles.popupTitle}>Please Sign In</Typo>
            <Typo size={16} style={styles.popupMessage}>You need to be logged in to add items to your cart.</Typo>
            <TouchableOpacity style={[styles.popupButton, { backgroundColor: '#F44336' }]} onPress={hideLoginPrompt}>
              <Typo size={16} style={styles.popupButtonText}>OK</Typo>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 20,
    left: 0,
    width: '100%',
    paddingHorizontal: spacingX._20,
    zIndex: 1
  },
  iconBg: { height: 44, width: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  detailsContainer: {
    backgroundColor: colors.white,
    marginTop: -spacingY._30,
    borderTopLeftRadius: radius._30,
    borderTopRightRadius: radius._30,
    padding: spacingX._20,
  },
  titleText: {
    fontWeight: '800',
  },
  subHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacingY._10,
    marginBottom: spacingY._20,
    gap: spacingX._15,
  },
  priceText: {
    fontWeight: '800',
    color: colors.primary,
  },
  mrpText: {
    fontSize: 20,
    color: colors.gray,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._5,
    borderRadius: radius._6,
    marginLeft: 'auto',
  },
  discountText: {
    color: '#388E3C',
    fontWeight: 'bold',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: spacingY._20,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: spacingY._10
  },
  descriptionText: {
    color: colors.gray,
    lineHeight: 26,
    fontSize: 16
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._20,
  },
  countView: {
    flexDirection: 'row',
    backgroundColor: colors.lighterGray,
    width: 120,
    height: 45,
    borderRadius: radius._30,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacingX._15
  },
  countButton: { color: colors.black, fontWeight: '600', fontSize: 24 },
  countText: { color: colors.black, fontWeight: '700', fontSize: 20 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._10,
    paddingBottom: Platform.OS === 'ios' ? 0 : spacingY._15,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    flexDirection: 'row',
    gap: spacingX._15,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: colors.lighterGray,
    height: 55,
    borderRadius: radius._30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartLabel: { color: colors.black, fontSize: 16, fontWeight: '700' },
  buyNowButton: {
    flex: 1,
    backgroundColor: colors.primary,
    height: 55,
    borderRadius: radius._30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buyNowLabel: { color: colors.white, fontSize: 16, fontWeight: '700' },
  toastWrapper: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  toastContainer: { backgroundColor: 'rgba(0, 0, 0, 0.8)', borderRadius: radius._20, paddingVertical: spacingY._15, paddingHorizontal: spacingX._20, flexDirection: 'column', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10 },
  toastText: { color: colors.white, fontWeight: '700', fontSize: 16, marginTop: spacingY._10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' },
  popupContainer: { width: width * 0.85, backgroundColor: colors.white, borderRadius: radius._30, padding: spacingY._30, alignItems: 'center' },
  popupIconContainer: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: spacingY._20, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10 },
  popupTitle: { fontWeight: '700', marginBottom: spacingY._15 },
  popupMessage: { color: colors.gray, textAlign: 'center', lineHeight: 24, marginBottom: spacingY._25 },
  popupButton: { width: '100%', paddingVertical: spacingY._15, borderRadius: radius._20, alignItems: 'center' },
  popupButtonText: { color: colors.white, fontWeight: '700' },
});

export default ItemDetailsScreen;
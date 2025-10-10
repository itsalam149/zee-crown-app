// screens/OrderDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator, Pressable } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import ScreenComponent from '../components/ScreenComponent';
import Header from '../components/Header';
import Typo from '../components/Typo';
import colors from '../config/colors';
import { radius, spacingX, spacingY } from '../config/spacing';
import useAuth from '../auth/useAuth';
import Toast from 'react-native-toast-message';

const getStatusStyle = (status) => {
    // ... (rest of the function is unchanged)
    switch (status?.toLowerCase()) {
        case 'delivered':
            return {
                backgroundColor: '#E8F5E9',
                color: '#2E7D32',
                icon: 'checkmark-done-circle',
                gradient: ['#81C784', '#66BB6A']
            };
        case 'shipped':
            return {
                backgroundColor: '#E3F2FD',
                color: '#1565C0',
                icon: 'airplane',
                gradient: ['#64B5F6', '#42A5F5']
            };
        case 'cancelled':
            return {
                backgroundColor: '#FFEBEE',
                color: '#C62828',
                icon: 'close-circle',
                gradient: ['#E57373', '#EF5350']
            };
        case 'processing':
        default:
            return {
                backgroundColor: '#FFF3E0',
                color: '#EF6C00',
                icon: 'time',
                gradient: ['#FFB74D', '#FFA726']
            };
    }
};

const getPaymentTypeDisplay = (paymentMethod) => {
    // ... (rest of the function is unchanged)
    if (!paymentMethod) return { text: 'N/A', icon: 'help-circle' };
    const lower = paymentMethod.toLowerCase();
    if (lower === 'online' || lower === 'card' || lower === 'upi')
        return { text: 'Paid Online', icon: 'card' };
    if (lower === 'cod' || lower === 'cash')
        return { text: 'Cash on Delivery', icon: 'cash' };
    return { text: paymentMethod, icon: 'wallet' };
};

function OrderDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { user } = useAuth();
    const { order: initialOrder } = route.params;

    const [order, setOrder] = useState(initialOrder);
    const [address, setAddress] = useState(null);
    const [billDetails, setBillDetails] = useState({ subtotal: 0, shipping: 0 });
    const [loading, setLoading] = useState(true);
    const [isBuying, setIsBuying] = useState(false);

    const statusStyle = getStatusStyle(order.status);
    const paymentInfo = getPaymentTypeDisplay(order.payment_method);

    useEffect(() => {
        if (initialOrder.id) {
            fetchCompleteOrderData();
        }
    }, [initialOrder.id]);

    const handleBuyAgain = async () => {
        if (!user || !order.order_items) return;

        setIsBuying(true);
        try {
            const itemsToUpsert = order.order_items.map(item => ({
                user_id: user.id,
                product_id: item.products.id,
                quantity: item.quantity,
            }));

            // This will either insert new items or update quantities if they already exist in the cart
            const { error } = await supabase.from('cart_items').upsert(itemsToUpsert, {
                onConflict: 'user_id, product_id'
            });

            if (error) {
                throw error;
            }

            Toast.show({
                type: 'success',
                text1: 'Items Added to Cart',
                text2: 'Proceed to checkout to complete your purchase.'
            });

            navigation.navigate('Checkout');

        } catch (error) {
            console.error('Error in Buy Again:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not add items to cart.'
            });
        } finally {
            setIsBuying(false);
        }
    };


    const fetchCompleteOrderData = async () => {
        try {
            setLoading(true);

            // Fetch the core order details with its items
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        id, quantity, price_at_purchase,
                        products (id, name, image_url, category)
                    )
                `)
                .eq('id', initialOrder.id)
                .single();

            if (orderError) throw orderError;

            // Calculate billing details from order items
            if (orderData?.order_items) {
                const subtotal = orderData.order_items.reduce((acc, item) =>
                    acc + item.quantity * item.price_at_purchase, 0);
                const shipping = orderData.total_price - subtotal;
                setBillDetails({ subtotal, shipping: shipping >= 0 ? shipping : 0 });
            }

            let fetchedAddress = null;
            // ✅ Fetch the address using the address_id from the order
            if (orderData.shipping_address) {
                const { data: orderAddress, error: addressError } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('id', orderData.shipping_address)
                    .single();

                if (addressError) {
                    console.error("Error fetching order address:", addressError.message);
                }
                fetchedAddress = orderAddress;
            }

            setOrder(orderData);
            setAddress(fetchedAddress);
        } catch (err) {
            console.error('Error fetching order details:', err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        // ... (loading component is unchanged)
        return (
            <ScreenComponent style={{ backgroundColor: colors.white }}>
                <Header label="Order Details" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Typo style={{ marginTop: 16, color: colors.gray }}>Loading order details...</Typo>
                </View>
            </ScreenComponent>
        );
    }

    const getFormattedAddress = () => {
        if (!address) return order.shipping_address || 'Address not available';
        const parts = [
            address.house_no,
            address.street_address,
            address.landmark,
            address.city,
            address.state,
            address.postal_code
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'Address not available';
    };

    const getMobileNumber = () => {
        // This will now correctly get the number from the fetched address
        return address?.mobile_number || 'Not available';
    };

    return (
        // ... (The rest of your JSX and styles are unchanged)
        <ScreenComponent style={{ backgroundColor: '#F8F9FA' }}>
            <Header label="Order Details" />
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Status Card */}
                <Animated.View entering={FadeInDown.delay(100).duration(600).springify()}>
                    <LinearGradient
                        colors={statusStyle.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.statusCard}
                    >
                        <View style={styles.statusContent}>
                            <Ionicons name={statusStyle.icon} size={40} color="white" />
                            <View style={styles.statusTextContainer}>
                                <Typo style={styles.statusLabel}>Order Status</Typo>
                                <Typo style={styles.statusValue}>{order.status || 'Processing'}</Typo>
                            </View>
                        </View>
                        <View style={styles.orderIdBadge}>
                            <Typo style={styles.orderIdText}>
                                #{order.id.toString().slice(-8).toUpperCase()}
                            </Typo>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Order Info Card */}
                <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="document-text" size={24} color={colors.primary} />
                            <Typo size={18} style={styles.cardTitle}>Order Information</Typo>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoIconContainer}>
                                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Typo style={styles.infoLabel}>Order Date</Typo>
                                <Typo style={styles.infoValue}>
                                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </Typo>
                            </View>
                        </View>

                        <View style={styles.infoDivider} />

                        <View style={styles.infoRow}>
                            <View style={styles.infoIconContainer}>
                                <Ionicons name={paymentInfo.icon} size={20} color={colors.primary} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Typo style={styles.infoLabel}>Payment Method</Typo>
                                <Typo style={styles.infoValue}>{paymentInfo.text}</Typo>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Delivery Info Card */}
                <Animated.View entering={FadeInDown.delay(300).duration(600).springify()}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="location" size={24} color={colors.primary} />
                            <Typo size={18} style={styles.cardTitle}>Delivery Information</Typo>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoIconContainer}>
                                <Ionicons name="call-outline" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Typo style={styles.infoLabel}>Contact Number</Typo>
                                <Typo style={styles.infoValue} selectable>{getMobileNumber()}</Typo>
                            </View>
                        </View>

                        <View style={styles.infoDivider} />

                        <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
                            <View style={styles.infoIconContainer}>
                                <Ionicons name="home-outline" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Typo style={styles.infoLabel}>Shipping Address</Typo>
                                <Typo style={styles.addressValue} selectable>
                                    {getFormattedAddress()}
                                </Typo>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Items Card */}
                <Animated.View entering={FadeInDown.delay(400).duration(600).springify()}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="basket" size={24} color={colors.primary} />
                            <Typo size={18} style={styles.cardTitle}>Order Items</Typo>
                        </View>

                        {order.order_items?.map((orderItem, index) => (
                            <Animated.View
                                key={orderItem.id}
                                entering={FadeIn.delay(100 * index).duration(400)}
                            >
                                <View style={styles.productCard}>
                                    <Image
                                        source={orderItem.products?.image_url
                                            ? { uri: orderItem.products.image_url }
                                            : require('../assets/startImage.png')}
                                        style={styles.productImage}
                                    />
                                    <View style={styles.productInfo}>
                                        <Typo style={styles.productName} numberOfLines={2}>
                                            {orderItem.products?.name || 'Product'}
                                        </Typo>
                                        <View style={styles.productMeta}>
                                            <View style={styles.qtyBadge}>
                                                <Typo style={styles.qtyText}>
                                                    Qty: {orderItem.quantity}
                                                </Typo>
                                            </View>
                                            <Typo style={styles.pricePerUnit}>
                                                ₹{orderItem.price_at_purchase.toFixed(2)} each
                                            </Typo>
                                        </View>
                                    </View>
                                    <View style={styles.productPriceContainer}>
                                        <Typo style={styles.productPrice}>
                                            ₹{(orderItem.price_at_purchase * orderItem.quantity).toFixed(2)}
                                        </Typo>
                                    </View>
                                </View>
                                {index < order.order_items.length - 1 && <View style={styles.productDivider} />}
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                {/* Price Summary Card */}
                <Animated.View entering={FadeInDown.delay(500).duration(600).springify()}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="receipt" size={24} color={colors.primary} />
                            <Typo size={18} style={styles.cardTitle}>Price Summary</Typo>
                        </View>

                        <View style={styles.billRow}>
                            <Typo style={styles.billLabel}>Subtotal</Typo>
                            <Typo style={styles.billValue}>₹{billDetails.subtotal.toFixed(2)}</Typo>
                        </View>

                        <View style={styles.billRow}>
                            <Typo style={styles.billLabel}>Shipping Fee</Typo>
                            <Typo style={[styles.billValue, billDetails.shipping === 0 && { color: '#4CAF50' }]}>
                                {billDetails.shipping === 0 ? 'FREE' : `₹${billDetails.shipping.toFixed(2)}`}
                            </Typo>
                        </View>

                        <View style={styles.totalDivider} />

                        <View style={styles.totalRow}>
                            <Typo style={styles.totalLabel}>Grand Total</Typo>
                            <Typo style={styles.totalValue}>
                                ₹{(order.total_price || 0).toFixed(2)}
                            </Typo>
                        </View>
                    </View>
                </Animated.View>

                <View style={{ height: 20 }} />
            </ScrollView>
            <View style={styles.footer}>
                <Pressable
                    style={({ pressed }) => [
                        styles.buyAgainButton,
                        { transform: [{ scale: pressed ? 0.98 : 1 }] }
                    ]}
                    onPress={handleBuyAgain}
                    disabled={isBuying}
                >
                    {isBuying ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <Typo style={styles.buyAgainLabel}>Buy Again</Typo>
                    )}
                </Pressable>
            </View>
        </ScreenComponent>
    );
}

const styles = StyleSheet.create({
    // ... (styles are unchanged)
    container: {
        padding: spacingX._20,
        paddingTop: spacingY._15
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    statusCard: {
        borderRadius: radius._20,
        padding: spacingX._20,
        marginBottom: spacingY._20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    statusContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacingY._15,
    },
    statusTextContainer: {
        marginLeft: spacingX._15,
        flex: 1,
    },
    statusLabel: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
        fontWeight: '500',
    },
    statusValue: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 4,
        textTransform: 'capitalize',
    },
    orderIdBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingVertical: spacingY._8,
        paddingHorizontal: spacingX._15,
        borderRadius: radius._20,
        alignSelf: 'flex-start',
    },
    orderIdText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: radius._15,
        padding: spacingX._20,
        marginBottom: spacingY._15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacingY._20,
    },
    cardTitle: {
        fontWeight: '700',
        marginLeft: spacingX._10,
        color: colors.black,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacingY._10,
    },
    infoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: radius._10,
        backgroundColor: '#F0F7FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoTextContainer: {
        flex: 1,
        marginLeft: spacingX._15,
    },
    infoLabel: {
        fontSize: 12,
        color: colors.gray,
        fontWeight: '500',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.black,
    },
    addressValue: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.black,
        lineHeight: 20,
    },
    infoDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: spacingY._10,
    },
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacingY._12,
    },
    productImage: {
        width: 70,
        height: 70,
        borderRadius: radius._12,
        backgroundColor: '#F5F5F5',
    },
    productInfo: {
        flex: 1,
        marginLeft: spacingX._15,
    },
    productName: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.black,
        marginBottom: spacingY._8,
    },
    productMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._10,
    },
    qtyBadge: {
        backgroundColor: '#F0F7FF',
        paddingVertical: 4,
        paddingHorizontal: spacingX._10,
        borderRadius: radius._8,
    },
    qtyText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.primary,
    },
    pricePerUnit: {
        fontSize: 12,
        color: colors.gray,
        fontWeight: '500',
    },
    productPriceContainer: {
        alignItems: 'flex-end',
    },
    productPrice: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.black,
    },
    productDivider: {
        height: 1,
        backgroundColor: '#F5F5F5',
        marginVertical: spacingY._5,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacingY._10,
    },
    billLabel: {
        fontSize: 15,
        color: colors.gray,
        fontWeight: '500',
    },
    billValue: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.black,
    },
    totalDivider: {
        height: 2,
        backgroundColor: '#F0F0F0',
        marginVertical: spacingY._15,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacingY._10,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.black,
    },
    totalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    footer: {
        padding: spacingX._20,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.lighterGray,
    },
    buyAgainButton: {
        backgroundColor: colors.primary,
        height: 55,
        borderRadius: radius._30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 8
    },
    buyAgainLabel: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700'
    },
});

export default OrderDetailScreen;
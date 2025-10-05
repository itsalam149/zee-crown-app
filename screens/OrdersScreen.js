// screens/OrdersScreen.js
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import useAuth from '../auth/useAuth';
import ScreenComponent from 'components/ScreenComponent';
import Header from 'components/Header';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';
import { Feather } from '@expo/vector-icons';
import AppButton from 'components/AppButton';
import Toast from 'react-native-toast-message';

function OrdersScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(() => {
        async function getOrders() {
            if (!user) {
                setLoading(false);
                return;
            }
            setLoading(true);

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id, created_at, status, total_price, shipping_address,
                    order_items (
                        id, quantity, price_at_purchase,
                        products ( name, image_url )
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching orders:", error);
                Toast.show({ type: 'error', text1: 'Error', text2: 'Could not fetch your orders.' });
            } else {
                setOrders(data || []);
            }
            setLoading(false);
        }
        getOrders();
    }, [user]);

    useFocusEffect(fetchOrders);

    // Status badge styles
    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return { bg: '#FFF3E0', color: '#FB8C00' };
            case 'paid': return { bg: '#E3F2FD', color: '#1976D2' };
            case 'processing': return { bg: '#FFFDE7', color: '#FBC02D' };
            case 'shipped': return { bg: '#E1F5FE', color: '#0288D1' };
            case 'delivered': return { bg: '#E8F5E9', color: '#388E3C' };
            case 'cancelled': return { bg: '#FFEBEE', color: '#D32F2F' };
            default: return { bg: colors.lighterGray, color: colors.gray };
        }
    };

    // Payment label
    const getPaymentLabel = (status) => {
        if (status?.toLowerCase() === 'pending') return 'COD';
        if (status?.toLowerCase() === 'paid') return 'Paid';
        return '';
    };

    const OrderCard = ({ item }) => {
        const statusStyle = getStatusStyle(item.status);
        const paymentLabel = getPaymentLabel(item.status);

        return (
            <TouchableOpacity onPress={() => navigation.navigate('OrderDetail', { order: item })}>
                <View style={styles.orderCard}>
                    {/* Header */}
                    <View style={styles.cardHeader}>
                        <Typo style={styles.orderId}>
                            Order #{item.id.substring(0, 8).toUpperCase()}
                        </Typo>
                        <Typo style={styles.orderDate}>
                            {new Date(item.created_at).toLocaleDateString()}
                        </Typo>
                    </View>

                    {/* Products */}
                    <View style={styles.cardBody}>
                        {item.order_items.map(orderItem => (
                            <View key={orderItem.id} style={styles.productRow}>
                                <Image
                                    source={orderItem.products?.image_url
                                        ? { uri: orderItem.products.image_url }
                                        : require('../assets/startImage.png')}
                                    style={styles.productImage}
                                />
                                <View style={{ flex: 1, marginLeft: spacingX._10 }}>
                                    <Typo style={{ fontWeight: '600' }} numberOfLines={1}>
                                        {orderItem.products?.name}
                                    </Typo>
                                    <Typo style={{ color: colors.gray }}>
                                        Qty: {orderItem.quantity}
                                    </Typo>
                                </View>
                                <Typo>
                                    ₹{(orderItem.price_at_purchase * orderItem.quantity).toFixed(2)}
                                </Typo>
                            </View>
                        ))}
                    </View>

                    {/* Footer */}
                    <View style={styles.cardFooter}>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                            <Typo style={{ color: statusStyle.color, fontWeight: '600', fontSize: 12 }}>
                                {item.status} {paymentLabel ? `• ${paymentLabel}` : ''}
                            </Typo>
                        </View>
                        <Typo style={styles.totalText}>
                            Total: ₹{(item.total_price || 0).toFixed(2)}
                        </Typo>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.centerContent}>
            <View style={styles.emptyIconBg}>
                <Feather name="box" size={40} color={colors.primary} />
            </View>
            <Typo size={18} style={styles.emptyTitle}>No Orders Yet</Typo>
            <Typo style={styles.emptySubtitle}>
                You haven't placed any orders. When you do, they will appear here.
            </Typo>
            <AppButton
                label="Start Shopping"
                onPress={() => navigation.navigate('Home')}
                style={{ marginTop: spacingY._20, width: '60%' }}
            />
        </View>
    );

    return (
        <ScreenComponent style={styles.container}>
            <Header label="My Orders" />
            {loading ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : orders.length === 0 ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={orders}
                    renderItem={({ item }) => <OrderCard item={item} />}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </ScreenComponent>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: colors.grayBG },
    list: { padding: spacingX._20 },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacingX._40
    },
    emptyIconBg: {
        backgroundColor: colors.lighterGray,
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTitle: { fontWeight: '600', marginTop: spacingY._20 },
    emptySubtitle: { color: colors.gray, textAlign: 'center', marginTop: spacingY._10 },

    orderCard: {
        backgroundColor: colors.white,
        borderRadius: radius._15,
        marginBottom: spacingY._20,
        padding: spacingX._15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: spacingY._10,
        borderBottomWidth: 1,
        borderBottomColor: colors.lighterGray,
    },
    orderId: { fontWeight: 'bold', color: colors.primary },
    orderDate: { color: colors.gray },

    cardBody: { paddingVertical: spacingY._10 },
    productRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacingY._5 },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: radius._10,
        backgroundColor: colors.lighterGray,
    },

    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: spacingY._10,
        borderTopWidth: 1,
        borderTopColor: colors.lighterGray,
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: spacingX._10,
        paddingVertical: spacingY._5,
        borderRadius: radius._20,
    },
    totalText: { fontWeight: 'bold', fontSize: 16 },
});

export default OrdersScreen;

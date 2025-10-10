// screens/OrdersScreen.js
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import useAuth from '../auth/useAuth';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenComponent from '../components/ScreenComponent';
import Header from '../components/Header';
import Typo from '../components/Typo';
import colors from '../config/colors';
import { radius, spacingX, spacingY } from '../config/spacing';
import AppButton from '../components/AppButton';
import Toast from 'react-native-toast-message';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function OrdersScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = useCallback(async (isRefresh = false) => {
        if (!user) {
            setLoading(false);
            return;
        }

        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id, created_at, status, total_price, shipping_address, payment_method,
                    order_items (
                        id, quantity, price_at_purchase,
                        products ( name, image_url, category )
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not fetch your orders.'
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [fetchOrders])
    );

    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return {
                    bg: '#FFF3E0',
                    color: '#EF6C00',
                    gradient: ['#FFE082', '#FFB300'],
                    icon: 'time-outline'
                };
            case 'processing':
                return {
                    bg: '#FFF8E1',
                    color: '#F57F17',
                    gradient: ['#FFF59D', '#FBC02D'],
                    icon: 'sync-outline'
                };
            case 'shipped':
                return {
                    bg: '#E1F5FE',
                    color: '#01579B',
                    gradient: ['#81D4FA', '#0288D1'],
                    icon: 'airplane-outline'
                };
            case 'delivered':
                return {
                    bg: '#E8F5E9',
                    color: '#1B5E20',
                    gradient: ['#81C784', '#388E3C'],
                    icon: 'checkmark-done-circle-outline'
                };
            case 'cancelled':
                return {
                    bg: '#FFEBEE',
                    color: '#B71C1C',
                    gradient: ['#E57373', '#D32F2F'],
                    icon: 'close-circle-outline'
                };
            default:
                return {
                    bg: '#F5F5F5',
                    color: '#757575',
                    gradient: ['#E0E0E0', '#9E9E9E'],
                    icon: 'help-circle-outline'
                };
        }
    };

    const getPaymentIcon = (method) => {
        const lower = method?.toLowerCase();
        if (lower === 'online' || lower === 'card' || lower === 'upi') return 'card-outline';
        if (lower === 'cod' || lower === 'cash') return 'cash-outline';
        return 'wallet-outline';
    };

    const OrderCard = ({ item, index }) => {
        const statusConfig = getStatusConfig(item.status);
        const totalItems = item.order_items?.reduce((sum, oi) => sum + oi.quantity, 0) || 0;

        return (
            <AnimatedTouchable
                entering={FadeInDown.delay(index * 100).duration(500).springify()}
                layout={Layout.springify()}
                onPress={() => navigation.navigate('OrderDetail', { order: item })}
                activeOpacity={0.95}
            >
                <View style={styles.orderCard}>
                    {/* Header with Gradient */}
                    <LinearGradient
                        colors={[statusConfig.bg, '#FFFFFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardHeader}
                    >
                        <View style={styles.headerTop}>
                            <View style={styles.orderIdContainer}>
                                <Ionicons name="receipt-outline" size={16} color={colors.primary} />
                                <Typo style={styles.orderId}>
                                    #{item.id.toString().slice(-8).toUpperCase()}
                                </Typo>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                                <Ionicons name={statusConfig.icon} size={14} color={statusConfig.color} />
                                <Typo style={[styles.statusText, { color: statusConfig.color }]}>
                                    {item.status}
                                </Typo>
                            </View>
                        </View>

                        <View style={styles.headerBottom}>
                            <View style={styles.infoItem}>
                                <Ionicons name="calendar-outline" size={14} color={colors.gray} />
                                <Typo style={styles.infoText}>
                                    {new Date(item.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </Typo>
                            </View>
                            <View style={styles.infoItem}>
                                <Ionicons name={getPaymentIcon(item.payment_method)} size={14} color={colors.gray} />
                                <Typo style={styles.infoText}>
                                    {item.payment_method?.toUpperCase() || 'COD'}
                                </Typo>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Products Section */}
                    <View style={styles.cardBody}>
                        <View style={styles.itemsHeader}>
                            <Ionicons name="basket-outline" size={18} color={colors.primary} />
                            <Typo style={styles.itemsTitle}>
                                {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
                            </Typo>
                        </View>

                        {item.order_items?.slice(0, 2).map((orderItem, idx) => (
                            <View key={orderItem.id} style={styles.productRow}>
                                <View style={styles.productImageContainer}>
                                    <Image
                                        source={orderItem.products?.image_url
                                            ? { uri: orderItem.products.image_url }
                                            : require('../assets/startImage.png')}
                                        style={styles.productImage}
                                    />
                                    <View style={styles.qtyBadge}>
                                        <Typo style={styles.qtyText}>{orderItem.quantity}</Typo>
                                    </View>
                                </View>
                                <View style={styles.productInfo}>
                                    <Typo style={styles.productName} numberOfLines={1}>
                                        {orderItem.products?.name}
                                    </Typo>
                                    <Typo style={styles.productPrice}>
                                        ₹{orderItem.price_at_purchase} × {orderItem.quantity}
                                    </Typo>
                                </View>
                                <Typo style={styles.itemTotal}>
                                    ₹{(orderItem.price_at_purchase * orderItem.quantity).toFixed(2)}
                                </Typo>
                            </View>
                        ))}

                        {item.order_items?.length > 2 && (
                            <View style={styles.moreItemsContainer}>
                                <Ionicons name="ellipsis-horizontal" size={20} color={colors.gray} />
                                <Typo style={styles.moreItemsText}>
                                    +{item.order_items.length - 2} more {item.order_items.length - 2 === 1 ? 'item' : 'items'}
                                </Typo>
                            </View>
                        )}
                    </View>

                    {/* Footer */}
                    <View style={styles.cardFooter}>
                        <View>
                            <Typo style={styles.totalLabel}>Order Total</Typo>
                            <Typo style={styles.totalValue}>
                                ₹{(item.total_price || 0).toFixed(2)}
                            </Typo>
                        </View>
                        <View style={styles.viewDetailsButton}>
                            <Typo style={styles.viewDetailsText}>View Details</Typo>
                            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                        </View>
                    </View>
                </View>
            </AnimatedTouchable>
        );
    };

    const renderEmptyState = () => (
        <Animated.View
            entering={FadeIn.duration(600)}
            style={styles.emptyContainer}
        >
            <LinearGradient
                colors={['#E3F2FD', '#BBDEFB']}
                style={styles.emptyIconBg}
            >
                <Ionicons name="cart-outline" size={60} color={colors.primary} />
            </LinearGradient>
            <Typo size={22} style={styles.emptyTitle}>No Orders Yet</Typo>
            <Typo style={styles.emptySubtitle}>
                Start shopping and your orders will appear here!
            </Typo>
            <AppButton
                label="Start Shopping"
                onPress={() => navigation.navigate('Home')}
                style={styles.shopButton}
            />
        </Animated.View>
    );

    const ListHeader = () => (
        <Animated.View entering={FadeInDown.duration(500)} style={styles.headerCard}>
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Ionicons name="bag-check-outline" size={24} color="#4CAF50" />
                    <View style={styles.statTextContainer}>
                        <Typo style={styles.statValue}>{orders.length}</Typo>
                        <Typo style={styles.statLabel}>Total Orders</Typo>
                    </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Ionicons name="checkmark-done-outline" size={24} color="#2196F3" />
                    <View style={styles.statTextContainer}>
                        <Typo style={styles.statValue}>
                            {orders.filter(o => o.status === 'delivered').length}
                        </Typo>
                        <Typo style={styles.statLabel}>Delivered</Typo>
                    </View>
                </View>
            </View>
        </Animated.View>
    );

    return (
        <ScreenComponent style={styles.container}>
            <Header label="My Orders" />
            {loading ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Typo style={styles.loadingText}>Loading your orders...</Typo>
                </View>
            ) : orders.length === 0 ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={orders}
                    renderItem={({ item, index }) => <OrderCard item={item} index={index} />}
                    keyExtractor={item => item.id}
                    ListHeaderComponent={ListHeader}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={() => fetchOrders(true)}
                />
            )}
        </ScreenComponent>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: '#F8F9FA' },
    list: { padding: spacingX._20, paddingTop: spacingY._15 },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacingY._15,
        color: colors.gray,
        fontSize: 14,
    },

    // Header Stats Card
    headerCard: {
        backgroundColor: colors.white,
        borderRadius: radius._15,
        padding: spacingX._20,
        marginBottom: spacingY._20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    statTextContainer: {
        marginLeft: spacingX._12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.black,
    },
    statLabel: {
        fontSize: 12,
        color: colors.gray,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E0E0E0',
    },

    // Order Card
    orderCard: {
        backgroundColor: colors.white,
        borderRadius: radius._20,
        marginBottom: spacingY._20,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },

    // Card Header
    cardHeader: {
        padding: spacingX._15,
        paddingBottom: spacingY._12,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacingY._10,
    },
    orderIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._8,
    },
    orderId: {
        fontWeight: '700',
        fontSize: 15,
        color: colors.black,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacingX._12,
        paddingVertical: spacingY._6,
        borderRadius: radius._20,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    headerBottom: {
        flexDirection: 'row',
        gap: spacingX._15,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._5,
    },
    infoText: {
        fontSize: 12,
        color: colors.gray,
        fontWeight: '500',
    },

    // Card Body
    cardBody: {
        padding: spacingX._15,
        paddingTop: spacingY._12,
    },
    itemsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacingY._12,
        gap: spacingX._8,
    },
    itemsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.black,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacingY._10,
        paddingBottom: spacingY._10,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    productImageContainer: {
        position: 'relative',
    },
    productImage: {
        width: 55,
        height: 55,
        borderRadius: radius._12,
        backgroundColor: '#F5F5F5',
    },
    qtyBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: colors.primary,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.white,
    },
    qtyText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    productInfo: {
        flex: 1,
        marginLeft: spacingX._12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.black,
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 12,
        color: colors.gray,
        fontWeight: '500',
    },
    itemTotal: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.black,
    },
    moreItemsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacingY._8,
        gap: spacingX._8,
    },
    moreItemsText: {
        fontSize: 13,
        color: colors.gray,
        fontWeight: '500',
    },

    // Card Footer
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacingX._15,
        paddingTop: spacingY._12,
        backgroundColor: '#FAFAFA',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    totalLabel: {
        fontSize: 12,
        color: colors.gray,
        fontWeight: '500',
        marginBottom: 4,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    viewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._5,
    },
    viewDetailsText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacingX._40,
    },
    emptyIconBg: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacingY._25,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    emptyTitle: {
        fontWeight: '700',
        marginBottom: spacingY._10,
        color: colors.black,
    },
    emptySubtitle: {
        color: colors.gray,
        textAlign: 'center',
        fontSize: 15,
        lineHeight: 22,
        marginBottom: spacingY._30,
    },
    shopButton: {
        minWidth: '70%',
        elevation: 3,
    },
});

export default OrdersScreen;
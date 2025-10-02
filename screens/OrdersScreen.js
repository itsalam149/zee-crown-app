// screens/OrdersScreen.js
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import useAuth from '../auth/useAuth';
import ScreenComponent from 'components/ScreenComponent';
import Header from 'components/Header';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';

function OrdersScreen() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, products(*))') // Fetch orders with items and product details
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching orders:", error);
        } else {
            setOrders(data);
        }
        setLoading(false);
    };

    useFocusEffect(useCallback(() => { fetchOrders(); }, [user]));

    const OrderCard = ({ item }) => (
        <View style={styles.orderCard}>
            <View style={styles.cardHeader}>
                <Typo style={styles.orderId}>Order #{item.id.substring(0, 8)}</Typo>
                <Typo style={styles.orderDate}>{new Date(item.created_at).toLocaleDateString()}</Typo>
            </View>
            <View style={styles.cardBody}>
                {item.order_items.map(orderItem => (
                    <View key={orderItem.id} style={styles.productRow}>
                        <Typo style={{ flex: 1 }}>{orderItem.products.name} (x{orderItem.quantity})</Typo>
                        <Typo>₹{(orderItem.price * orderItem.quantity).toFixed(2)}</Typo>
                    </View>
                ))}
            </View>
            <View style={styles.cardFooter}>
                <Typo style={styles.totalText}>Total: ₹{item.total_amount}</Typo>
            </View>
        </View>
    );

    return (
        <ScreenComponent style={styles.container}>
            <Header label="My Orders" />
            {loading ? (
                <View style={styles.centerContent}><Typo>Loading orders...</Typo></View>
            ) : orders.length === 0 ? (
                <View style={styles.centerContent}><Typo>You haven't placed any orders yet.</Typo></View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={({ item }) => <OrderCard item={item} />}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </ScreenComponent>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: colors.white },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: spacingX._20 },
    orderCard: {
        backgroundColor: colors.lighterGray,
        borderRadius: radius._15,
        marginBottom: spacingY._20,
        padding: spacingX._15,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: spacingY._10,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    orderId: { fontWeight: 'bold' },
    orderDate: { color: colors.gray },
    cardBody: {
        paddingVertical: spacingY._10,
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 2,
    },
    cardFooter: {
        paddingTop: spacingY._10,
        borderTopWidth: 1,
        borderTopColor: colors.lightGray,
        alignItems: 'flex-end',
    },
    totalText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default OrdersScreen;
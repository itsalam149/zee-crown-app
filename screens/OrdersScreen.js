// screens/OrdersScreen.js
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import useAuth from '../auth/useAuth';
import ScreenComponent from 'components/ScreenComponent';
import Header from 'components/Header';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { spacingX, spacingY } from 'config/spacing';
import { Feather } from '@expo/vector-icons';
import AppButton from 'components/AppButton';
import OrderCard from '../components/OrderCard';
import OrderCardSkeleton from '../components/OrderCardSkeleton';

function OrdersScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // FIXED: Correctly implemented useFocusEffect
    useFocusEffect(
        useCallback(() => {
            async function fetchOrders() {
                if (!user) {
                    setLoading(false);
                    return;
                };
                setLoading(true);
                const { data, error } = await supabase
                    .from('orders')
                    .select('*, order_items(*, products(name, image_url))')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error("Error fetching orders:", error);
                } else {
                    setOrders(data);
                }
                setLoading(false);
            }

            fetchOrders();
        }, [user])
    );

    const renderSkeleton = () => (
        <View style={styles.list}>
            {[...Array(3)].map((_, index) => <OrderCardSkeleton key={index} />)}
        </View>
    );

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
                renderSkeleton()
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
    emptyTitle: {
        fontWeight: '600',
        marginTop: spacingY._20
    },
    emptySubtitle: {
        color: colors.gray,
        textAlign: 'center',
        marginTop: spacingY._10
    },
});

export default OrdersScreen;
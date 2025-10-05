// screens/OrderDetailScreen.js
import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import ScreenComponent from 'components/ScreenComponent';
import Header from 'components/Header';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';

const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
        case 'delivered': return { backgroundColor: '#E8F5E9', color: '#388E3C' };
        case 'shipped': return { backgroundColor: '#E3F2FD', color: '#1976D2' };
        case 'cancelled': return { backgroundColor: '#FFEBEE', color: '#D32F2F' };
        case 'processing':
        default: return { backgroundColor: '#FFF8E1', color: '#FFA000' };
    }
};

function OrderDetailScreen() {
    const route = useRoute();
    const { order } = route.params; // order object is passed from OrdersScreen
    const statusStyle = getStatusStyle(order.status);

    return (
        <ScreenComponent style={{ backgroundColor: colors.white }}>
            <Header label={`Order #${order.id.toString().slice(-6)}`} />
            <ScrollView contentContainerStyle={styles.container}>

                {/* Order Info */}
                <View style={styles.section}>
                    <View style={styles.headerRow}>
                        <Typo size={16} style={styles.sectionTitle}>Order Details</Typo>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                            <Typo style={[styles.statusText, { color: statusStyle.color }]}>
                                {order.status || 'Status Unknown'}
                            </Typo>
                        </View>
                    </View>
                    <View style={styles.detailRow}>
                        <Typo style={styles.detailLabel}>Order Date:</Typo>
                        <Typo style={styles.detailValue}>
                            {new Date(order.created_at).toLocaleDateString()}
                        </Typo>
                    </View>
                    <View style={styles.detailRow}>
                        <Typo style={styles.detailLabel}>Shipping Address:</Typo>
                        <Typo style={styles.detailValue} selectable>
                            {order.shipping_address || 'N/A'}
                        </Typo>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Items */}
                <View style={styles.section}>
                    <Typo size={16} style={styles.sectionTitle}>Items in this Order</Typo>
                    {order.order_items.map(orderItem => (
                        <View key={orderItem.id} style={styles.itemRow}>
                            <Image
                                source={orderItem.products?.image_url
                                    ? { uri: orderItem.products.image_url }
                                    : require('../assets/startImage.png')}
                                style={styles.productImage}
                            />
                            <View style={styles.itemDetails}>
                                <Typo style={styles.productName} numberOfLines={2}>
                                    {orderItem.products?.name || 'Product'}
                                </Typo>
                                <Typo style={styles.productInfo}>
                                    Qty: {orderItem.quantity}
                                </Typo>
                            </View>
                            <Typo style={styles.itemPrice}>
                                ₹{(orderItem.price_at_purchase || 0).toFixed(2)}
                            </Typo>
                        </View>
                    ))}
                </View>

                <View style={styles.divider} />

                {/* Total */}
                <View style={styles.section}>
                    <View style={styles.totalRow}>
                        <Typo style={styles.totalLabel}>Total</Typo>
                        <Typo style={styles.totalValue}>
                            ₹{(order.total_price || 0).toFixed(2)}
                        </Typo>
                    </View>
                </View>
            </ScrollView>
        </ScreenComponent>
    );
}

const styles = StyleSheet.create({
    container: { padding: spacingX._20 },
    section: { marginVertical: spacingY._10 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacingY._15 },
    sectionTitle: { fontWeight: '700' },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacingY._5 },
    detailLabel: { color: colors.gray, fontWeight: '500' },
    detailValue: { fontWeight: '600', flex: 1, textAlign: 'right', marginLeft: spacingX._10 },
    divider: { height: 1, backgroundColor: colors.lighterGray, marginVertical: spacingY._20 },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacingY._10 },
    productImage: { width: 60, height: 60, borderRadius: radius._10, backgroundColor: colors.lighterGray },
    itemDetails: { flex: 1, marginLeft: spacingX._15 },
    productName: { fontWeight: '600', marginBottom: 4 },
    productInfo: { color: colors.gray, fontSize: 12 },
    itemPrice: { fontWeight: '700', fontSize: 16 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacingY._10 },
    totalLabel: { fontSize: 18, fontWeight: '500', color: colors.gray },
    totalValue: { fontSize: 22, fontWeight: 'bold' },
    statusBadge: { paddingVertical: spacingY._5, paddingHorizontal: spacingX._10, borderRadius: radius._20 },
    statusText: { fontWeight: '600', fontSize: 12 },
});

export default OrderDetailScreen;

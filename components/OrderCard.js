// components/OrderCard.js
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Typo from './Typo';
import colors from '../config/colors';
import { radius, spacingX, spacingY } from '../config/spacing';

const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
        case 'delivered':
            return { backgroundColor: '#E8F5E9', color: '#388E3C' };
        case 'shipped':
            return { backgroundColor: '#E3F2FD', color: '#1976D2' };
        case 'cancelled':
            return { backgroundColor: '#FFEBEE', color: '#D32F2F' };
        case 'processing':
        default:
            return { backgroundColor: '#FFF8E1', color: '#FFA000' };
    }
};

function OrderCard({ item: order }) {
    const statusStyle = getStatusStyle(order.status);

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Typo style={styles.orderId}>Order #{order.id.toString().slice(-6)}</Typo>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                    <Typo style={[styles.statusText, { color: statusStyle.color }]}>{order.status || 'Status Unknown'}</Typo>
                </View>
            </View>

            <View style={styles.itemContainer}>
                {order.order_items.map(orderItem => {
                    const imageUrls = orderItem.products?.image_url;
                    const finalImageUrl = Array.isArray(imageUrls) && imageUrls.length > 0 ? imageUrls[0] : null;

                    return (
                        <View key={orderItem.id} style={styles.itemRow}>
                            <Image
                                // FINAL FIX: Using a known existing asset as a fallback
                                source={finalImageUrl ? { uri: finalImageUrl } : require('../assets/startImage.png')}
                                style={styles.productImage}
                            />
                            <View style={styles.itemDetails}>
                                <Typo style={styles.productName} numberOfLines={1}>{orderItem.products?.name || 'Product'}</Typo>
                                <Typo style={styles.productInfo}>Qty: {orderItem.quantity}</Typo>
                            </View>
                            <Typo style={styles.itemPrice}>₹{orderItem.price_at_purchase.toFixed(2)}</Typo>
                        </View>
                    );
                })}
            </View>

            <View style={styles.footer}>
                <Typo style={styles.dateText}>{new Date(order.created_at).toLocaleDateString()}</Typo>
                <Typo style={styles.totalText}>Total: ₹{order.total_price.toFixed(2)}</Typo>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: radius._15,
        padding: spacingX._15,
        marginBottom: spacingY._20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: spacingY._10,
        borderBottomWidth: 1,
        borderBottomColor: colors.lighterGray,
    },
    orderId: { fontWeight: '700', fontSize: 16 },
    statusBadge: {
        paddingVertical: spacingY._5,
        paddingHorizontal: spacingX._10,
        borderRadius: radius._20,
    },
    statusText: { fontWeight: '600', fontSize: 12 },
    itemContainer: {
        paddingVertical: spacingY._10,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacingY._10,
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: radius._10,
        backgroundColor: colors.lighterGray,
    },
    itemDetails: {
        flex: 1,
        marginLeft: spacingX._10,
    },
    productName: { fontWeight: '600' },
    productInfo: { color: colors.gray, fontSize: 12 },
    itemPrice: { fontWeight: '600' },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacingY._10,
        borderTopWidth: 1,
        borderTopColor: colors.lighterGray,
    },
    dateText: { color: colors.gray, fontSize: 12 },
    totalText: { fontWeight: 'bold', fontSize: 16 },
});

export default OrderCard;
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const OrderCard = ({ orderItem }) => {
    const product = orderItem.products || {};
    const productName = product.name || 'Unknown Product';
    const productPrice = product.price || 'N/A';
    const finalImageUrl = product.image_url; // already full URL from DB

    return (
        <View style={styles.card}>
            <Image
                source={
                    finalImageUrl
                        ? { uri: finalImageUrl } // Directly use full URL
                        : require('../assets/placeholder.png') // fallback local image
                }
                style={styles.productImage}
            />

            <View style={styles.details}>
                <Text style={styles.productName}>{productName}</Text>
                <Text style={styles.productPrice}>₹ {productPrice}</Text>
                <Text style={styles.orderStatus}>
                    Status: {orderItem.status || 'Pending'}
                </Text>
            </View>
        </View>
    );
};

export default OrderCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 12,
        marginVertical: 8,
        marginHorizontal: 12,
        borderRadius: 10,
        elevation: 2,
        alignItems: 'center',
    },
    productImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginRight: 12,
    },
    details: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        color: '#444',
        marginBottom: 4,
    },
    orderStatus: {
        fontSize: 13,
        color: 'green',
    },
});

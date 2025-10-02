// components/OrderCardSkeleton.js
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolateColor } from 'react-native-reanimated';
import colors from '../config/colors';
import { radius, spacingX, spacingY } from '../config/spacing';

const SkeletonPiece = ({ style }) => {
    const progress = useSharedValue(0);
    useEffect(() => {
        progress.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
    }, []);
    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(progress.value, [0, 1], [colors.lighterGray, '#f0f0f0']);
        return { backgroundColor };
    });
    return <Animated.View style={[style, animatedStyle]} />;
};

function OrderCardSkeleton() {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <SkeletonPiece style={{ height: 20, width: '40%', borderRadius: radius._6 }} />
                <SkeletonPiece style={{ height: 24, width: '25%', borderRadius: radius._20 }} />
            </View>
            <View style={styles.itemRow}>
                <SkeletonPiece style={styles.productImage} />
                <View style={{ flex: 1, marginLeft: spacingX._10 }}>
                    <SkeletonPiece style={{ height: 16, width: '80%', borderRadius: radius._6, marginBottom: 8 }} />
                    <SkeletonPiece style={{ height: 12, width: '30%', borderRadius: radius._6 }} />
                </View>
                <SkeletonPiece style={{ height: 16, width: '20%', borderRadius: radius._6 }} />
            </View>
            <View style={styles.footer}>
                <SkeletonPiece style={{ height: 12, width: '35%', borderRadius: radius._6 }} />
                <SkeletonPiece style={{ height: 16, width: '30%', borderRadius: radius._6 }} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: colors.white, borderRadius: radius._15, padding: spacingX._15, marginBottom: spacingY._20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: spacingY._10, borderBottomWidth: 1, borderBottomColor: colors.lighterGray },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacingY._10, paddingTop: spacingY._10 },
    productImage: { width: 50, height: 50, borderRadius: radius._10 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacingY._10, borderTopWidth: 1, borderTopColor: colors.lighterGray, marginTop: spacingY._10 },
});

export default OrderCardSkeleton;
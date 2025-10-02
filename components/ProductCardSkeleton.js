// components/ProductCardSkeleton.js
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    interpolateColor,
} from 'react-native-reanimated';
import colors from '../config/colors';
import { radius, spacingX, spacingY } from '../config/spacing';

const { width, height } = Dimensions.get('screen');

const ProductCardSkeleton = () => {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withRepeat(
            withTiming(1, { duration: 1000 }),
            -1, // Infinite repeat
            true // Reverse direction
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            [colors.lighterGray, '#e0e0e0']
        );
        return {
            backgroundColor,
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.imagePlaceholder, animatedStyle]} />
            <Animated.View style={[styles.textPlaceholder, { width: '80%' }, animatedStyle]} />
            <Animated.View style={[styles.textPlaceholder, { width: '40%' }, animatedStyle]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: width / 2 - spacingX._30,
        backgroundColor: '#f9f9f9',
        borderRadius: radius._15,
        padding: spacingY._10,
        overflow: 'hidden',
    },
    imagePlaceholder: {
        height: height * 0.15,
        width: '100%',
        borderRadius: radius._15,
        marginBottom: spacingY._10,
    },
    textPlaceholder: {
        height: 15,
        borderRadius: radius._5,
        marginBottom: spacingY._10,
    },
});

export default ProductCardSkeleton;
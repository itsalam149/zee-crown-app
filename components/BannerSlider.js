// components/BannerSlider.js
import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Dimensions, StyleSheet, Image, ActivityIndicator } from 'react-native';
import colors from '../config/colors';
import { normalizeX } from '../utils/normalize';
import { radius, spacingX, spacingY } from 'config/spacing';
import { supabase } from '../lib/supabase';

const { width: screenWidth, height } = Dimensions.get('window');
// CHANGED: Increased the horizontal margin to make the banner narrower
const adjustedWidth = screenWidth - normalizeX(50);

function BannerSlider() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef(null);

    useEffect(() => {
        const fetchBanners = async () => {
            const { data, error } = await supabase
                .from('banners')
                .select('image_url')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            if (error) {
                console.error('Error fetching banners:', error);
            } else {
                setBanners(data);
            }
            setLoading(false);
        };

        fetchBanners();
    }, []);

    useEffect(() => {
        if (banners.length > 1) {
            const interval = setInterval(() => {
                scrollToNextImage();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [currentIndex, banners]);

    const scrollToNextImage = () => {
        if (banners.length > 1) {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= banners.length) {
                nextIndex = 0;
            }
            scrollViewRef.current?.scrollTo({
                x: nextIndex * adjustedWidth,
                animated: true,
            });
            setCurrentIndex(nextIndex);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    }

    if (banners.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onMomentumScrollEnd={(ev) => {
                    const index = Math.floor(ev.nativeEvent.contentOffset.x / adjustedWidth);
                    setCurrentIndex(index);
                }}>
                {banners.map((banner, index) => (
                    <Image key={index} source={{ uri: banner.image_url }} style={styles.image} />
                ))}
            </ScrollView>
            <View style={styles.indicatorContainer}>
                {banners.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            {
                                width: index === currentIndex ? 15 : 8,
                                backgroundColor: index === currentIndex ? colors.black : colors.transparent,
                            },
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // CHANGED: Reduced the height from 0.2 to 0.18
        height: height * 0.18,
        width: adjustedWidth,
        borderRadius: radius._20,
        overflow: 'hidden',
        // CHANGED: Reduced the vertical margin from 15 to 10
        marginVertical: spacingY._10,
        alignSelf: 'center',
        backgroundColor: colors.lighterGray,
    },
    image: {
        resizeMode: 'cover',
        height: '100%',
        width: adjustedWidth,
    },
    indicatorContainer: {
        position: 'absolute',
        bottom: spacingY._10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: radius._6,
        marginHorizontal: spacingX._3,
        borderWidth: 1,
        borderColor: colors.black,
    },
});

export default BannerSlider;
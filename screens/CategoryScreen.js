// screens/CategoryScreen.js
import React, { useRef, useEffect, useContext } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
    Image,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthContext from '../auth/AuthContext'; // Adjust path if needed
import { useNavigation } from '@react-navigation/native'; // <-- Import useNavigation

const { width } = Dimensions.get('window');

// Assuming these assets are correctly placed relative to this file
const categories = [
    {
        name: "medicine",
        phrase: "Health & Wellness",
        description: "Your trusted pharmacy partner",
        colors: ['#10B981', '#34D399', '#6EE7B7'],
        darkColor: '#059669',
        icon: "💊",
        image: require('../assets/11.png') // Adjust path if needed
    },
    {
        name: "cosmetics",
        phrase: "Beauty & Care",
        description: "Enhance your natural glow",
        colors: ['#3B82F6', '#60A5FA', '#93C5FD'],
        darkColor: '#2563EB',
        icon: "💅",
        image: require('../assets/22.png') // Adjust path if needed
    },
    {
        name: "food",
        phrase: "Fresh & Delicious",
        description: "Taste the goodness of life",
        colors: ['#EF4444', '#F87171', '#FCA5A5'],
        darkColor: '#DC2626',
        icon: "🍔",
        image: require('../assets/33.png') // Adjust path if needed
    },
    {
        name: "perfumes", // 👈 internal category key
        displayName: "Crown Perfumes", // 👈 what you want shown
        phrase: "Luxury Fragrances",
        description: "Captivate with every breath",
        colors: ['#F59E0B', '#FBBF24', '#FCD34D'],
        darkColor: '#D97706',
        icon: "💨",
        image: require('../assets/44.png') // Adjust path if needed
    }
];


export default function CategoryScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;
    const logoRotate = useRef(new Animated.Value(0)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;
    const { setCategory } = useContext(AuthContext);
    const navigation = useNavigation(); // <-- Get navigation object

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 700,
                useNativeDriver: true
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true
            }),
        ]).start();

        // Subtle rotation animation for logo
        Animated.loop(
            Animated.sequence([
                Animated.timing(logoRotate, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(logoRotate, {
                    toValue: 0,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Floating animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: 1,
                    duration: 2500,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 2500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // *** MODIFIED FUNCTION ***
    const handleCategoryPress = (item) => {
        setCategory(item.name); // Update the category context
        // Use setTimeout to ensure state update potentially finishes before navigating
        setTimeout(() => {
            navigation.navigate('AppNavigator'); // Navigate to the main app flow
        }, 0); // A timeout of 0ms pushes this to the next event loop tick
    };
    // *************************

    const CategoryCard = ({ item, index }) => {
        const cardAnim = useRef(new Animated.Value(0)).current;
        const pressAnim = useRef(new Animated.Value(1)).current;
        const shimmerAnim = useRef(new Animated.Value(0)).current;
        const glowAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            Animated.timing(cardAnim, {
                toValue: 1,
                duration: 600,
                delay: index * 150,
                useNativeDriver: true,
            }).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(shimmerAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
                    Animated.timing(shimmerAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
                ])
            ).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
                    Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
                ])
            ).start();
        }, []);

        const handlePressIn = () => {
            Animated.spring(pressAnim, { toValue: 0.96, useNativeDriver: true, tension: 100, friction: 7 }).start();
        };

        const handlePressOut = () => {
            Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 7 }).start();
        };

        const isLargeCard = index < 2;

        const shimmerTranslate = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [-300, 300] });
        const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

        return (
            <Animated.View
                style={[
                    isLargeCard ? styles.largeCardContainer : styles.smallCardContainer,
                    {
                        opacity: cardAnim,
                        transform: [
                            { translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) },
                            { scale: Animated.multiply(cardAnim, pressAnim) }
                        ],
                    },
                ]}
            >
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => handleCategoryPress(item)} // Pass item to handler
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={1}
                >
                    <Animated.View style={[styles.cardGlow, { opacity: glowOpacity }]}>
                        <LinearGradient colors={[...item.colors, 'transparent']} style={StyleSheet.absoluteFill} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />
                    </Animated.View>
                    <LinearGradient
                        colors={item.colors}
                        style={[styles.gradient, isLargeCard ? styles.largeGradient : styles.smallGradient]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.patternOverlay}>
                            <View style={styles.patternDot} /><View style={[styles.patternDot, { top: 30, left: 50, width: 50, height: 50 }]} /><View style={[styles.patternDot, { top: 60, left: 20, width: 30, height: 30 }]} /><View style={[styles.patternDot, { bottom: 20, right: 30, width: 45, height: 45 }]} /><View style={[styles.patternDot, { top: '40%', right: 10, width: 35, height: 35 }]} />
                        </View>
                        <View style={styles.stripesPattern}>
                            <View style={styles.stripe} /><View style={[styles.stripe, { left: 60 }]} /><View style={[styles.stripe, { left: 120 }]} /><View style={[styles.stripe, { left: 180 }]} />
                        </View>
                        <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]} />
                        <View style={styles.cardContent}>
                            <View style={styles.textSection}>
                                <Text style={[styles.categoryName, isLargeCard && styles.largeCategoryName]}>{item.displayName || item.name}</Text>
                                {!!item.phrase && (<Text style={[styles.categoryPhrase, isLargeCard && styles.largeCategoryPhrase]} numberOfLines={1} ellipsizeMode="tail">{item.phrase}</Text>)}
                                <View style={styles.arrowButton}><Text style={styles.arrowText}>→</Text></View>
                            </View>
                            <View style={styles.imageSection}>
                                <View style={styles.imageGlow}><Image source={item.image} style={[styles.productImage, isLargeCard && styles.largeProductImage]} resizeMode="contain" /></View>
                            </View>
                        </View>
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.15)']} style={styles.taglineContainer}><Text style={styles.taglineText}>{item.description}</Text></LinearGradient>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const logoRotateInterpolate = logoRotate.interpolate({ inputRange: [0, 1], outputRange: ['-5deg', '5deg'] });
    const floatTranslate = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#6366F1" translucent={Platform.OS === 'android'} />
                <LinearGradient colors={['#6366F1', '#7C3AED', '#8B5CF6']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <View style={styles.decorativeCircle1} /><View style={styles.decorativeCircle2} /><View style={styles.decorativeCircle3} /><View style={styles.decorativeCircle4} /><View style={styles.decorativeCircle5} />
                    <Animated.View style={[styles.headerContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={styles.headerRow}>
                            <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }, { rotate: logoRotateInterpolate }, { translateY: floatTranslate }] }]}>
                                <View style={styles.logoWrapper}>
                                    <View style={styles.logoInnerGlow} />
                                    <Image source={require('../assets/icon.png')} style={styles.logo} resizeMode="contain" />
                                </View>
                            </Animated.View>
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.welcomeText}>Welcome Back!</Text>
                                <Text style={styles.title}>Choose Your Category</Text>
                                <Text style={styles.subtitle}>Discover amazing products just for you</Text>
                            </View>
                        </View>
                    </Animated.View>
                </LinearGradient>
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {categories.slice(0, 2).map((item, index) => (<CategoryCard key={index} item={item} index={index} />))}
                    <View style={styles.smallCardsRow}>{categories.slice(2, 4).map((item, index) => (<CategoryCard key={index + 2} item={item} index={index + 2} />))}</View>
                    <View style={styles.footerSection}>
                        <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.footerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Text style={styles.footerTitle}>✨ Explore. Experience. Enjoy. ✨</Text>
                            <Text style={styles.footerSubtitle}>Find everything you love, all in one place!</Text>
                        </LinearGradient>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

// --- Styles (Keep the existing styles object as it was) ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#6366F1',
    },
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC'
    },
    header: {
        paddingTop: Platform.OS === 'android' ? 20 : 10,
        paddingBottom: 35,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
        overflow: 'hidden',
        position: 'relative'
    },
    decorativeCircle1: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(255,255,255,0.08)',
        top: -60,
        right: -60,
    },
    decorativeCircle2: {
        position: 'absolute',
        width: 170,
        height: 170,
        borderRadius: 85,
        backgroundColor: 'rgba(255,255,255,0.06)',
        bottom: -40,
        left: -50,
    },
    decorativeCircle3: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.05)',
        top: 40,
        left: 20,
    },
    decorativeCircle4: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.07)',
        top: 70,
        right: 80,
    },
    decorativeCircle5: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.04)',
        bottom: 50,
        right: 120,
    },
    headerContent: {
        zIndex: 10
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 10,
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: 16,
        alignItems: 'flex-start',
    },
    logoContainer: {
        marginBottom: 0,
    },
    logoWrapper: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 12,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        position: 'relative',
        overflow: 'hidden'
    },
    logoInnerGlow: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderRadius: 35,
    },
    logo: {
        width: 50,
        height: 50,
        zIndex: 2
    },
    welcomeText: {
        fontSize: 14,
        color: '#FFFFFF',
        marginBottom: 4,
        fontWeight: '600',
        letterSpacing: 0.5,
        textAlign: 'left',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 6,
        textAlign: 'left',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.15)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.85)',
        textAlign: 'left',
        fontWeight: '500',
        letterSpacing: 0.3
    },
    scrollContainer: {
        flex: 1
    },
    scrollContent: {
        padding: 18,
        paddingTop: 24,
        paddingBottom: 30
    },
    largeCardContainer: {
        marginBottom: 18,
        width: '100%'
    },
    smallCardContainer: {
        width: (width - 54) / 2,
        marginBottom: 18
    },
    smallCardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative'
    },
    cardGlow: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 28,
        zIndex: -1,
    },
    gradient: {
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 24,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 15
    },
    largeGradient: {
        minHeight: 160
    },
    smallGradient: {
        minHeight: 200
    },
    patternOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.12
    },
    patternDot: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        top: 10,
        left: 10
    },
    stripesPattern: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.08,
        overflow: 'hidden'
    },
    stripe: {
        position: 'absolute',
        width: 3,
        height: '200%',
        backgroundColor: 'rgba(255,255,255,0.4)',
        transform: [{ rotate: '25deg' }],
        left: 0,
        top: -50
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 150,
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        transform: [{ skewX: '-20deg' }],
    },
    cardContent: {
        flexDirection: 'row',
        padding: 20,
        paddingBottom: 12,
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    textSection: {
        flex: 1.2,
        paddingRight: 10
    },
    categoryName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 6,
        textTransform: 'capitalize',
        textAlign: 'left',
        letterSpacing: 0.4,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 5
    },
    largeCategoryName: {
        fontSize: 26,
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 5
    },
    categoryPhrase: {
        fontSize: 13,
        color: '#FFFFFF',
        marginBottom: 10,
        fontWeight: '600',
        opacity: 0.95,
        flexShrink: 1,
        textAlign: 'left',
        letterSpacing: 0.3,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3
    },
    largeCategoryPhrase: {
        fontSize: 16,
        marginBottom: 16
    },
    arrowButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
        alignSelf: 'flex-start'
    },
    arrowText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
    },
    imageSection: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 0.8
    },
    imageGlow: {
        padding: 4,
        borderRadius: 12,
    },
    productImage: {
        width: 95,
        height: 72
    },
    largeProductImage: {
        width: 115,
        height: 90
    },
    taglineContainer: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginTop: 'auto'
    },
    taglineText: {
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '600',
        textAlign: 'left',
        letterSpacing: 0.3
    },
    footerSection: {
        marginTop: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    footerGradient: {
        borderRadius: 20,
        paddingVertical: 24,
        paddingHorizontal: 20,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 }
    },
    footerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 6,
        textAlign: 'center',
        letterSpacing: 0.5
    },
    footerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        fontWeight: '500'
    }
});
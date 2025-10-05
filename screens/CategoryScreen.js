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
    Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AuthContext from '../auth/AuthContext';

const { width } = Dimensions.get('window');

const categories = [
    {
        name: "medicine",
        phrase: "Health & Wellness",
        description: "Your trusted pharmacy partner",
        colors: ['#4CAF50', '#81C784'],   // swapped from cosmetics
        darkColor: '#388E3C',
        icon: "💊",
        image: require('../assets/11.png')
    },
    {
        name: "cosmetics",
        phrase: "Beauty & Care",
        description: "Enhance your natural glow",
        colors: ['#2196F3', '#64B5F6'],   // swapped from medicine
        darkColor: '#1976D2',
        icon: "💅",
        image: require('../assets/22.png')
    },
    {
        name: "food",
        phrase: "Fresh & Delicious",
        description: "Taste the goodness of life",
        colors: ['#F44336', '#E57373'],
        darkColor: '#D32F2F',
        icon: "🍔",
        image: require('../assets/33.png')
    },
    {
        name: "perfumes",
        phrase: "Signature Scents",
        description: "Captivate with every breath",
        colors: ['#FFC107', '#FFD54F'],
        darkColor: '#FFA000',
        icon: "💨",
        image: require('../assets/4.webp')
    }
];


export default function CategoryScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const { setCategory } = useContext(AuthContext);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleCategoryPress = (item) => {
        setCategory(item.name);
    };

    const CategoryCard = ({ item, index }) => {
        const cardAnim = useRef(new Animated.Value(0)).current;
        const pressAnim = useRef(new Animated.Value(1)).current;

        useEffect(() => {
            Animated.timing(cardAnim, {
                toValue: 1,
                duration: 600,
                delay: index * 100,
                useNativeDriver: true,
            }).start();
        }, []);

        const handlePressIn = () => {
            Animated.spring(pressAnim, {
                toValue: 0.97,
                useNativeDriver: true,
                tension: 100,
                friction: 7
            }).start();
        };

        const handlePressOut = () => {
            Animated.spring(pressAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 7
            }).start();
        };

        const isLargeCard = index < 2;

        return (
            <Animated.View
                style={[
                    isLargeCard ? styles.largeCardContainer : styles.smallCardContainer,
                    {
                        opacity: cardAnim,
                        transform: [
                            {
                                translateY: cardAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [30, 0]
                                })
                            },
                            { scale: pressAnim }
                        ],
                    },
                ]}
            >
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => handleCategoryPress(item)}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={1}
                >
                    <LinearGradient
                        colors={item.colors}
                        style={[styles.gradient, isLargeCard ? styles.largeGradient : styles.smallGradient]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.textSection}>
                                <Text
                                    style={[styles.categoryName, isLargeCard && styles.largeCategoryName]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {item.name}
                                </Text>
                                <Text
                                    style={[styles.categoryPhrase, isLargeCard && styles.largeCategoryPhrase]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {item.phrase}
                                </Text>
                                <View style={styles.arrowButton}>
                                    <Text style={styles.arrowText}>→</Text>
                                </View>
                            </View>
                            <View style={styles.imageSection}>
                                <Image
                                    source={item.image}
                                    style={[styles.productImage, isLargeCard && styles.largeProductImage]}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                        <View style={[styles.taglineContainer, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
                            <Text style={styles.taglineText}>{item.description}</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#6366F1" />

            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
                <Animated.View style={[styles.headerContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.welcomeText}>Welcome!</Text>
                    <Text style={styles.title}>Choose Your Category</Text>
                    <Text style={styles.subtitle}>Discover amazing products just for you</Text>
                </Animated.View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {categories.slice(0, 2).map((item, index) => (
                    <CategoryCard key={index} item={item} index={index} />
                ))}

                <View style={styles.smallCardsRow}>
                    {categories.slice(2, 4).map((item, index) => (
                        <CategoryCard key={index + 2} item={item} index={index + 2} />
                    ))}
                </View>

                {/* Footer Section */}
                <View style={styles.footerSection}>
                    <LinearGradient
                        colors={['#8B5CF6', '#6366F1']}
                        style={styles.footerGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.footerTitle}>✨ Explore. Experience. Enjoy. ✨</Text>
                        <Text style={styles.footerSubtitle}>
                            Find everything you love, all in one place!
                        </Text>
                    </LinearGradient>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC'
    },
    header: {
        paddingTop: StatusBar.currentHeight + 20 || 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30
    },
    headerContent: {
        alignItems: 'center'
    },
    welcomeText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 5
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center'
    },
    scrollContainer: {
        flex: 1
    },
    scrollContent: {
        padding: 16,
        paddingTop: 20
    },
    largeCardContainer: {
        marginBottom: 16,
        width: '100%'
    },
    smallCardContainer: {
        width: (width - 48) / 2,
        marginBottom: 16
    },
    smallCardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12
    },
    gradient: {
        position: 'relative',
        overflow: 'hidden'
    },
    largeGradient: {
        minHeight: 180
    },
    smallGradient: {
        minHeight: 200
    },
    cardContent: {
        flexDirection: 'row',
        padding: 20,
        paddingBottom: 10,
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    textSection: {
        flex: 1,
        paddingRight: 10
    },
    categoryName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
        textTransform: 'capitalize',
        flexShrink: 1,
        textAlign: 'left'
    },
    largeCategoryName: {
        fontSize: 28,
        marginBottom: 8
    },
    categoryPhrase: {
        fontSize: 12,
        color: '#FFFFFF',
        marginBottom: 8,
        fontWeight: '600',
        opacity: 0.95,
        flexShrink: 1,
        textAlign: 'left'
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
        marginTop: 4
    },
    arrowText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937'
    },
    imageSection: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    productImage: {
        width: 120,
        height: 90
    },
    largeProductImage: {
        width: 140,
        height: 110
    },
    taglineContainer: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 'auto'
    },
    taglineText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
        textAlign: 'left'
    },

    // Footer Section
    footerSection: {
        marginTop: 10,
        marginBottom: 30,
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
        textAlign: 'center'
    },
    footerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center'
    }
});

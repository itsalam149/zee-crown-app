import React, { useRef, useEffect, useContext } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    ScrollView,
    StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Fixed for Expo
import AuthContext from '../auth/AuthContext'; // Make sure path is correct

const { width, height } = Dimensions.get('window');

export default function CategoryScreen({ navigation }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    const { setCategory } = useContext(AuthContext); // Use context to set category

    const categories = [
        {
            name: "Medicines",
            phrase: "Health & Wellness",
            description: "Your trusted pharmacy partner",
            colors: ['#4CAF50', '#81C784'],
            darkColor: '#388E3C',
            icon: "💊"
        },
        {
            name: "Cosmetics",
            phrase: "Beauty & Care",
            description: "Enhance your natural glow",
            colors: ['#87CEEB', '#B0E0E6'],
            darkColor: '#4682B4',
            icon: "💄"
        },
        {
            name: "Food",
            phrase: "Fresh & Delicious",
            description: "Taste the goodness of life",
            colors: ['#FF6B6B', '#FF8E8E'],
            darkColor: '#E53E3E',
            icon: "🍎"
        },
        {
            name: "Perfumes",
            phrase: "Signature Scents",
            description: "Captivate with every breath",
            colors: ['#FFD700', '#FFF176'],
            darkColor: '#F57C00',
            icon: "🌸"
        }
    ];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleCategoryPress = (item) => {
        setCategory(item.name); // Update context
    };

    const CategoryCard = ({ item, index }) => {
        const cardAnim = useRef(new Animated.Value(0)).current;
        const pressAnim = useRef(new Animated.Value(1)).current;

        useEffect(() => {
            Animated.timing(cardAnim, {
                toValue: 1,
                duration: 600,
                delay: index * 150,
                useNativeDriver: true,
            }).start();
        }, []);

        const handlePressIn = () => {
            Animated.spring(pressAnim, {
                toValue: 0.95,
                useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
            Animated.spring(pressAnim, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        };

        return (
            <Animated.View
                style={[
                    styles.cardContainer,
                    {
                        opacity: cardAnim,
                        transform: [
                            {
                                translateY: cardAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [50, 0],
                                }),
                            },
                            { scale: pressAnim },
                        ],
                    },
                ]}
            >
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => handleCategoryPress(item)}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={item.colors}
                        style={styles.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.imageContainer}>
                                <View style={[styles.imagePlaceholder, { backgroundColor: item.darkColor }]}>
                                    <Text style={styles.iconText}>{item.icon}</Text>
                                </View>
                            </View>

                            <View style={styles.textContainer}>
                                <Text style={styles.categoryName}>{item.name}</Text>
                                <Text style={styles.categoryPhrase}>{item.phrase}</Text>
                                <Text style={styles.categoryDescription}>{item.description}</Text>
                            </View>

                            <View style={styles.arrowContainer}>
                                <View style={[styles.arrow, { backgroundColor: item.darkColor }]}>
                                    <Text style={styles.arrowText}>→</Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.decorativeCircle1, { backgroundColor: `${item.darkColor}20` }]} />
                        <View style={[styles.decorativeCircle2, { backgroundColor: `${item.darkColor}10` }]} />
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#6366F1" />

            <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                style={styles.header}
            >
                <Animated.View
                    style={[
                        styles.headerContent,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { translateY: slideAnim },
                                { scale: scaleAnim },
                            ],
                        },
                    ]}
                >
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
                {categories.map((item, index) => (
                    <CategoryCard key={index} item={item} index={index} />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingTop: StatusBar.currentHeight + 20 || 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 30,
    },
    cardContainer: {
        marginBottom: 20,
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    gradient: {
        minHeight: 120,
        position: 'relative',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        zIndex: 2,
    },
    imageContainer: {
        marginRight: 20,
    },
    imagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
    },
    categoryName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    categoryPhrase: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 2,
        fontWeight: '600',
    },
    categoryDescription: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    arrowContainer: {
        marginLeft: 15,
    },
    arrow: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    decorativeCircle1: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        top: -20,
        right: -20,
        zIndex: 1,
    },
    decorativeCircle2: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        bottom: -10,
        left: 50,
        zIndex: 1,
    },
});

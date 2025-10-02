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
    StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AuthContext from '../auth/AuthContext'; // Make sure path is correct

const { width } = Dimensions.get('window');

// Define the categories with their colors directly in this screen
const categories = [
    {
        name: "medicine",
        phrase: "Health & Wellness",
        description: "Your trusted pharmacy partner",
        colors: ['#2196F3', '#64B5F6'], // Blue Gradient
        darkColor: '#1976D2',
        icon: "💊"
    },
    {
        name: "cosmetics",
        phrase: "Beauty & Care",
        description: "Enhance your natural glow",
        colors: ['#4CAF50', '#81C784'], // Green Gradient
        darkColor: '#388E3C',
        icon: "💅"
    },
    {
        name: "food",
        phrase: "Fresh & Delicious",
        description: "Taste the goodness of life",
        colors: ['#F44336', '#E57373'], // Red Gradient
        darkColor: '#D32F2F',
        icon: "🍔"
    },
    {
        name: "perfumes",
        phrase: "Signature Scents",
        description: "Captivate with every breath",
        colors: ['#FFC107', '#FFD54F'], // Golden Gradient
        darkColor: '#FFA000',
        icon: "💨"
    }
];


export default function CategoryScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    // Get the setCategory function from your AuthContext
    const { setCategory } = useContext(AuthContext);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    // When a category is pressed, update the global category state
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
                delay: index * 150,
                useNativeDriver: true,
            }).start();
        }, []);

        const handlePressIn = () => { Animated.spring(pressAnim, { toValue: 0.95, useNativeDriver: true }).start(); };
        const handlePressOut = () => { Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true }).start(); };

        return (
            <Animated.View
                style={[
                    styles.cardContainer,
                    {
                        opacity: cardAnim,
                        transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }, { scale: pressAnim }],
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
                    <LinearGradient colors={item.colors} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
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
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
                <Animated.View style={[styles.headerContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
                    <Text style={styles.welcomeText}>Welcome!</Text>
                    <Text style={styles.title}>Choose Your Category</Text>
                    <Text style={styles.subtitle}>Discover amazing products just for you</Text>
                </Animated.View>
            </LinearGradient>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {categories.map((item, index) => (
                    <CategoryCard key={index} item={item} index={index} />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingTop: StatusBar.currentHeight + 20 || 50, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerContent: { alignItems: 'center' },
    welcomeText: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 5 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' },
    scrollContainer: { flex: 1 },
    scrollContent: { padding: 20, paddingTop: 30 },
    cardContainer: { marginBottom: 20 },
    card: { borderRadius: 20, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
    gradient: { minHeight: 120, position: 'relative' },
    cardContent: { flexDirection: 'row', alignItems: 'center', padding: 20, zIndex: 2 },
    imageContainer: { marginRight: 20 },
    imagePlaceholder: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    iconText: { fontSize: 24 },
    textContainer: { flex: 1 },
    categoryName: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4, textTransform: 'capitalize' },
    categoryPhrase: { fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', marginBottom: 2, fontWeight: '600' },
    categoryDescription: { fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' },
    decorativeCircle1: { position: 'absolute', width: 80, height: 80, borderRadius: 40, top: -20, right: -20, zIndex: 1 },
    decorativeCircle2: { position: 'absolute', width: 40, height: 40, borderRadius: 20, bottom: -10, left: 50, zIndex: 1 },
});
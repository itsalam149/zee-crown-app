// app.config.js
import 'dotenv/config';

export default {
    expo: {
        name: 'Zee Crown',
        slug: 'ecommerce-app-ui',
        scheme: 'zeecrown', // Added this line
        version: '1.0.0',
        web: {
            favicon: './assets/favicon.png',
        },
        experiments: {
            tsconfigPaths: true,
        },
        plugins: ['expo-asset', 'expo-font'],
        orientation: 'portrait',
        icon: './assets/icon.png',
        userInterfaceStyle: 'light',
        splash: {
            image: './assets/splash.png',
            resizeMode: 'contain',
            backgroundColor: '#ffffff',
        },
        assetBundlePatterns: ['**/*'],
        ios: {
            supportsTablet: true,
        },
        android: {
            adaptiveIcon: {
                foregroundImage: './assets/adaptive-icon.png',
                backgroundColor: '#ffffff',
            },
        },
        newArchEnabled: true,
        extra: {
            supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
            supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        },
    },
};
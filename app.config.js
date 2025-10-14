// app.config.js
import 'dotenv/config';

export default {
    expo: {
        name: 'Zee Crown',
        slug: 'ecommerce-app-ui',
        scheme: 'zeecrown',
        version: '1.0.0',
        web: {
            favicon: './assets/favicon.png',
        },
        experiments: {
            tsconfigPaths: true,
        },
        // --- MODIFICATION: The correct plugin is now here ---
        plugins: [
            'expo-asset',
            'expo-font',
            '@react-native-firebase/app'
        ],
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
            package: 'com.alam.zeecrown',
            // --- This key is required by the @react-native-firebase/app plugin ---
            googleServicesFile: './google-services.json'
        },
        newArchEnabled: true,
        extra: {
            supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
            supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
            eas: {
                projectId: '375e529d-e973-4755-910f-5fed1f519a3c',
            },
        },
    },
};
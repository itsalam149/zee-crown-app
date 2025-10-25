// app.config.js
import 'dotenv/config';

// Read the environment variable passed by EAS CLI (if it exists)
// We won't use this directly in the config now, but it's good practice
// to be aware of it if other parts of your build process need it.
// const googleServicesJsonContent = process.env.GOOGLE_SERVICES_JSON;

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
        plugins: [
            'expo-asset',
            'expo-font',
            // Make sure this plugin is actually needed for your project.
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
            // Add googleServicesFile for iOS if you use Firebase there too
            // googleServicesFile: './GoogleService-Info.plist',
        },
        android: {
            adaptiveIcon: {
                foregroundImage: './assets/adaptive-icon.png',
                backgroundColor: '#ffffff',
            },
            package: 'com.alam.zeecrown',
            // --- MODIFICATION START ---
            // Always provide the path. EAS Build will create this file
            // using the GOOGLE_SERVICES_JSON secret before the plugin runs.
            googleServicesFile: './google-services.json',
            // Remove the googleServicesJson field, as the plugin
            // primarily looks for the file path during prebuild.
            // googleServicesJson: googleServicesJsonContent,
            // --- MODIFICATION END ---
        },
        // newArchEnabled: true, // Re-evaluate if needed, can sometimes cause issues. Consider disabling if problems persist.
        extra: {
            supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
            supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
            eas: {
                projectId: '375e529d-e973-4755-910f-5fed1f519a3c',
            },
        },
    },
};
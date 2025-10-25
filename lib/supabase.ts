// lib/supabase.ts
import 'react-native-url-polyfill/auto'; // Required for Supabase
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Get the environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Check if the variables are loaded correctly
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or Anon Key is missing. Check your .env file and app.config.js");
}

// --- THIS IS THE FIX ---
// Add type annotations (: string) to key and value
const ExpoSecureStoreAdapter = {
    getItem: (key: string) => { // <-- Added : string
        return SecureStore.getItemAsync(key);
    },
    setItem: (key: string, value: string) => { // <-- Added : string to both
        return SecureStore.setItemAsync(key, value);
    },
    removeItem: (key: string) => { // <-- Added : string
        return SecureStore.deleteItemAsync(key);
    },
};

// --- UPDATE THE CLIENT CREATION ---
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: ExpoSecureStoreAdapter, // Use the adapter
        autoRefreshToken: true,
        persistSession: true, // This is true by default, but good to be explicit
        detectSessionInUrl: false, // Required for React Native
    },
});
// lib/supabase.js
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get the Supabase credentials from the extra config in app.json
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl ?? '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Get the environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Check if the variables are loaded correctly
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or Anon Key is missing. Check your .env file and app.config.js");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
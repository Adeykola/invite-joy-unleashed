
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are defined
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables. Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',  // Fallback URL to prevent immediate crash
  supabaseKey || 'placeholder-key' // Fallback key to prevent immediate crash
);

// Create a function to check if the Supabase client is properly configured
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseKey;
};

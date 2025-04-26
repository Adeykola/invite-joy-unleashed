
import { createClient } from '@supabase/supabase-js';

// Using direct values instead of environment variables
const supabaseUrl = "https://ttlqxvpcjpxpbzkgbyod.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bHF4dnBjanB4cGJ6a2dieW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2OTExNTcsImV4cCI6MjA2MTI2NzE1N30.Z4xL_q3N4AkRSHgNE0py7ZPrDwxuo1ihHHkrL01CGoI";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Create a function to check if the Supabase client is properly configured
export const isSupabaseConfigured = () => {
  return true; // We're now using hardcoded values, so it's always configured
};

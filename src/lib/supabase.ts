
import { createClient } from '@supabase/supabase-js';
import { initStorageBuckets, checkStorageAvailability } from "./storage";

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

// Automatically create storage buckets if they don't exist
export const ensureStorageBuckets = async () => {
  console.log("Checking if storage buckets need to be created...");
  const isAvailable = await checkStorageAvailability();
  
  if (!isAvailable) {
    console.log("Storage buckets not found, attempting to create them...");
    
    // First check if user is authenticated
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      console.log("User not authenticated, cannot create storage buckets");
      return false;
    }
    
    const success = await initStorageBuckets();
    console.log("Storage bucket creation result:", success ? "Success" : "Failed");
    return success;
  }
  
  return true;
};

// Add a helper function to initialize storage when the app loads
// This function now has a "viewOnly" mode that doesn't try to initialize storage
export const initializeStorageOnStartup = async (options = { quietMode: false, viewOnly: false }) => {
  try {
    if (!options.quietMode) {
      console.log("Checking storage availability...");
    }
    
    // If in viewOnly mode, just check if storage is available but don't try to initialize it
    const isAvailable = await checkStorageAvailability();
    
    // In viewOnly mode, just return the availability status without trying to initialize
    if (options.viewOnly) {
      return isAvailable;
    }
    
    if (!isAvailable) {
      if (!options.quietMode) {
        console.log("Storage buckets not found on startup, initializing...");
      }
      
      // Use a timeout to avoid blocking the UI
      return new Promise((resolve) => {
        // Delay storage initialization to not block critical UI rendering
        setTimeout(async () => {
          try {
            const success = await initStorageBuckets();
            if (!options.quietMode) {
              console.log("Storage initialization result:", success ? "Success" : "Failed");
            }
            resolve(success);
          } catch (error) {
            console.error("Error in delayed storage initialization:", error);
            resolve(false);
          }
        }, 1000);
      });
    } else {
      if (!options.quietMode) {
        console.log("Storage buckets verified on startup");
      }
      return true;
    }
  } catch (error) {
    console.error("Error initializing storage on startup:", error);
    return false;
  }
};

// Helper function to check if a user is authenticated
export const isUserAuthenticated = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error("Error checking authentication status:", error);
    return false;
  }
};

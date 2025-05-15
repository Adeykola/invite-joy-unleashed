
import { supabase } from "@/integrations/supabase/client";

// Improved function to check if storage buckets exist with better error handling and authentication checks
export const checkStorageAvailability = async (retryCount = 1) => {
  console.log("Checking storage availability...");
  
  try {
    // First check if user is authenticated - this is required for storage access in many cases
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session;
    
    if (!isAuthenticated) {
      console.log("User not authenticated, storage may be limited");
      return false;
    }
    
    // Try to directly access files from event buckets to check if they exist
    const { data: logoFiles, error: logoError } = await supabase.storage
      .from('event-logos')
      .list('', { limit: 1 });
      
    const { data: bannerFiles, error: bannerError } = await supabase.storage
      .from('event-banners')
      .list('', { limit: 1 });
      
    // If both buckets return errors, they likely don't exist
    if (logoError && bannerError) {
      console.log("Storage buckets not found:", { logoError, bannerError });
      
      // Check if we need to retry
      if (retryCount > 0) {
        console.log(`Retrying storage check (${retryCount} attempts left)...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return checkStorageAvailability(retryCount - 1);
      }
      
      return false;
    }
    
    // At least one bucket is accessible
    console.log("Storage is accessible");
    return true;
  } catch (err) {
    console.error("Critical error checking storage:", err);
    
    if (retryCount > 0) {
      console.log(`Retrying after error (${retryCount} attempts left)...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return checkStorageAvailability(retryCount - 1);
    }
    
    return false;
  }
};

// Modified function to create storage buckets if they don't exist
export const initStorageBuckets = async (retries = 2) => {
  console.log("Initializing storage buckets...");
  
  try {
    // Check if user is authenticated with proper permissions
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session;
    
    if (!isAuthenticated) {
      console.log("Storage initialization requires authentication");
      return false;
    }
    
    // Try to create event-logos bucket
    const { data: logosData, error: logosError } = await supabase.storage.createBucket('event-logos', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']
    });
    
    // Try to create event-banners bucket
    const { data: bannersData, error: bannersError } = await supabase.storage.createBucket('event-banners', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']
    });
    
    // Check if operations succeeded or buckets already existed
    const logoSuccess = !logosError || (logosError.message && logosError.message.includes('already exists'));
    const bannerSuccess = !bannersError || (bannersError.message && bannersError.message.includes('already exists'));
    
    console.log("Bucket creation results:", {
      logoSuccess,
      bannerSuccess,
      logosError: logosError?.message,
      bannersError: bannersError?.message
    });
    
    return logoSuccess && bannerSuccess;
  } catch (error) {
    console.error("Error during storage initialization:", error);
    
    // Retry if attempts are left
    if (retries > 0) {
      console.log(`Retrying bucket creation (${retries} attempts left)...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return initStorageBuckets(retries - 1);
    }
    
    return false;
  }
};

// Improved helper function to validate an image file before upload
export const validateImageFile = (file: File): boolean => {
  if (!file) {
    console.error("No file provided for validation");
    return false;
  }
  
  // Check file type
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    console.error(`Invalid file type: ${file.type}. Allowed types: ${validTypes.join(', ')}`);
    return false;
  }
  
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    console.error(`File too large: ${file.size} bytes. Max size: ${maxSize} bytes (10MB)`);
    return false;
  }
  
  return true;
};

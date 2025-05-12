import { supabase } from "@/integrations/supabase/client";

// Improved function to check if storage buckets exist with better error handling
export const checkStorageAvailability = async (retryCount = 1) => {
  console.log("Checking storage availability...");
  try {
    // First check if we can access the storage API
    const { data: bucketsList, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Storage API access error:", listError);
      
      // Try a different approach for unauthenticated users or permission issues
      // Directly check if we can list objects in the public buckets
      try {
        // Try to access files from event-logos bucket
        const { data: logoFiles, error: logoError } = await supabase.storage
          .from('event-logos')
          .list('', { limit: 1 });
          
        if (!logoError && logoFiles) {
          console.log("Public bucket direct access successful");
          return true;
        }
        
        // Try to access files from event-banners bucket
        const { data: bannerFiles, error: bannerError } = await supabase.storage
          .from('event-banners')
          .list('', { limit: 1 });
          
        if (!bannerError && bannerFiles) {
          console.log("Public bucket direct access successful");
          return true;
        }
      } catch (e) {
        console.log("Failed to directly access bucket contents:", e);
      }
      
      // If retries are left, try again
      if (retryCount > 0) {
        console.log(`Retrying storage check (${retryCount} attempts left)...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return checkStorageAvailability(retryCount - 1);
      }
      
      return false;
    }
    
    if (!bucketsList || bucketsList.length === 0) {
      console.log("No storage buckets found");
      return false;
    }
    
    const requiredBuckets = ['event-logos', 'event-banners'];
    const foundBuckets = bucketsList.filter(b => requiredBuckets.includes(b.id));
    
    console.log(`Found ${foundBuckets.length} of ${requiredBuckets.length} required buckets:`, 
      foundBuckets.map(b => b.id));
    
    // Consider it a success if we find at least one required bucket
    return foundBuckets.length > 0;
  } catch (err) {
    console.error("Storage check critical error:", err);
    
    // If retries are left, try again
    if (retryCount > 0) {
      console.log(`Retrying after error (${retryCount} attempts left)...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return checkStorageAvailability(retryCount - 1);
    }
    
    return false;
  }
};

// Refactor initStorageBuckets to handle common edge cases
export const initStorageBuckets = async (retries = 2) => {
  console.log("Initializing storage buckets...");
  
  try {
    // Check if user is authenticated and has permissions
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session;
    
    if (!isAuthenticated) {
      console.log("Storage initialization requires authentication");
      return false;
    }
    
    // Verify buckets exist
    const isAvailable = await checkStorageAvailability();
    if (isAvailable) {
      console.log("Storage buckets already available");
      return true;
    }
    
    console.log("Storage buckets not found, but user is authenticated. This may indicate a permissions issue.");
    return false;
  } catch (error) {
    console.error("Error during storage initialization:", error);
    return false;
  }
};

// Helper function to validate an image file before upload
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
    console.error(`File too large: ${file.size} bytes. Max size: ${maxSize} bytes`);
    return false;
  }
  
  return true;
};


import { supabase } from "@/integrations/supabase/client";

// Improved function to check if storage buckets exist and are properly configured
// with better error handling and retry logic
export const checkStorageAvailability = async (retryCount = 1) => {
  console.log("Checking storage availability...");
  try {
    // First check if we can even access the storage API
    const { data: bucketsList, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Storage API access error:", listError);
      
      // Handle authentication related errors
      if (listError.message?.includes("JWT") || listError.message?.includes("token") || 
          listError.message?.includes("auth") || listError.message?.includes("permission")) {
        console.log("Authentication issue detected, may be normal for non-authenticated users");
        
        // For public access, we'll try to access the buckets directly without authentication
        // by checking if known buckets exist
        try {
          // Try to get a specific bucket that should be public
          const { data: bucket, error: bucketError } = await supabase.storage.getBucket('event-logos');
          if (!bucketError && bucket) {
            console.log("Public bucket access successful despite auth error");
            return true;
          }
        } catch (e) {
          console.log("Failed to access bucket directly:", e);
        }
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
    // This allows partial functionality instead of complete failure
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

// More robust function to initialize storage buckets with better error handling and retries
export const initStorageBuckets = async (retries = 2) => {
  console.log("Initializing storage buckets...");
  
  try {
    // Verify storage access first with authentication status check
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      console.log("User not authenticated, storage operations may be restricted");
      // Continue anyway - we'll let the actual bucket operations determine success
    }
    
    const { data: testBuckets, error: testError } = await supabase.storage.listBuckets();
    
    if (testError) {
      if (testError.message?.includes("JWT") || testError.message?.includes("token")) {
        console.error("Authentication issue detected:", testError);
        throw new Error("Authentication error. Please log in and try again.");
      }
      
      console.error("Storage API access error on init:", testError);
      if (retries > 0) {
        console.log(`Retrying initialization (${retries} attempts left)...`);
        // Wait a short delay before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await initStorageBuckets(retries - 1);
      }
      return false;
    }
    
    console.log("Storage API access verified");
    
    const buckets = [
      { id: 'event-logos', name: 'Event Logos', public: true },
      { id: 'event-banners', name: 'Event Banners', public: true }
    ];
    
    let successCount = 0;
    
    // Create or update each bucket
    for (const bucket of buckets) {
      try {
        // Check if bucket exists
        const { data, error: checkError } = await supabase.storage.getBucket(bucket.id);
        
        if (checkError) {
          console.log(`Bucket ${bucket.id} not found, creating...`);
          // Create the bucket
          const { data: createData, error: createError } = await supabase.storage.createBucket(
            bucket.id, 
            { public: true }
          );
          
          if (createError) {
            console.error(`Error creating bucket ${bucket.id}:`, createError);
            if (createError.message?.includes("already exists")) {
              console.log(`Bucket ${bucket.id} seems to exist despite check error`);
              successCount++;
            }
          } else {
            console.log(`Bucket ${bucket.id} created successfully`);
            successCount++;
          }
        } else if (data && !data.public) {
          // Update bucket to be public
          const { error: updateError } = await supabase.storage.updateBucket(
            bucket.id,
            { public: true }
          );
          
          if (updateError) {
            console.error(`Error updating bucket ${bucket.id} to public:`, updateError);
          } else {
            console.log(`Bucket ${bucket.id} updated to public`);
            successCount++;
          }
        } else {
          console.log(`Bucket ${bucket.id} already exists and is properly configured`);
          successCount++;
        }
      } catch (err) {
        console.error(`Bucket setup error for ${bucket.id}:`, err);
      }
    }
    
    // Consider it success if at least one bucket is properly set up
    // This allows partial functionality when only some buckets work
    return successCount > 0;
    
  } catch (error) {
    console.error("Critical error during storage initialization:", error);
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

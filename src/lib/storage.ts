
import { supabase } from "@/integrations/supabase/client";

// Improved function to check if storage buckets exist and are properly configured
export const checkStorageAvailability = async () => {
  console.log("Checking storage availability...");
  try {
    // First check if we can even access the storage API
    const { data: bucketsList, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Storage API access error:", listError);
      // Handle specific error codes that might indicate permissions issues
      if (listError.code === "PGRST116" || listError.message?.includes("permission denied")) {
        console.error("Permission denied accessing storage buckets. User may need to log in.");
        throw new Error("Permission denied accessing storage. Please log in and try again.");
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
    
    // Check if all the required buckets exist
    return foundBuckets.length === requiredBuckets.length;
  } catch (err) {
    console.error("Storage check critical error:", err);
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

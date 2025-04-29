
import { supabase } from "@/integrations/supabase/client";

// Improved function to check if storage buckets exist and are properly configured
export const checkStorageAvailability = async () => {
  console.log("Checking storage availability...");
  try {
    // First check if we can even access the storage API
    const { data: bucketsList, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Storage API access error:", listError);
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
    
    // Check if all the required buckets exist AND are public
    for (const bucket of foundBuckets) {
      const { data, error } = await supabase.storage.getBucket(bucket.id);
      
      if (error || !data?.public) {
        console.log(`Bucket ${bucket.id} exists but is not properly configured:`, data, error);
        return false;
      }
    }
    
    return foundBuckets.length === requiredBuckets.length;
  } catch (err) {
    console.error("Storage check critical error:", err);
    return false;
  }
};

// Improved function to initialize storage buckets with better error handling
export const initStorageBuckets = async () => {
  console.log("Initializing storage buckets...");
  
  const buckets = [
    { id: 'event-logos', name: 'Event Logos', public: true },
    { id: 'event-banners', name: 'Event Banners', public: true }
  ];
  
  try {
    // Verify storage access first
    const { data: testBuckets, error: testError } = await supabase.storage.listBuckets();
    
    if (testError) {
      console.error("Storage API access error on init:", testError);
      return false;
    }
    
    console.log("Storage API access verified");
    
    // Create each bucket and set to public
    for (const bucket of buckets) {
      try {
        // Check if bucket exists
        const { data, error: checkError } = await supabase.storage.getBucket(bucket.id);
        
        if (checkError && checkError.message.includes('not found')) {
          console.log(`Creating bucket: ${bucket.id}`);
          // Create the bucket if it doesn't exist
          const { data: newBucket, error: createError } = await supabase.storage.createBucket(
            bucket.id,
            {
              public: true,
              fileSizeLimit: 10485760, // 10MB
              allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp']
            }
          );
          
          if (createError) {
            console.error(`Error creating bucket ${bucket.id}:`, createError);
            return false;
          }
          
          console.log(`Bucket ${bucket.id} created successfully`);
        } else if (checkError) {
          console.error(`Error checking bucket ${bucket.id}:`, checkError);
          return false;
        } else {
          console.log(`Bucket ${bucket.id} already exists`);
          
          // Make sure the bucket is public
          const { data: updateData, error: updateError } = await supabase.storage.updateBucket(
            bucket.id,
            { public: true }
          );
          
          if (updateError) {
            console.error(`Error updating bucket ${bucket.id} to public:`, updateError);
            return false;
          } else {
            console.log(`Bucket ${bucket.id} updated to public`);
          }
        }
      } catch (err) {
        console.error(`Bucket setup error for ${bucket.id}:`, err);
        return false;
      }
    }
    
    // Verify all buckets were created successfully
    return await checkStorageAvailability();
    
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

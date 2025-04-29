
import { supabase } from "@/integrations/supabase/client";

// Improved function to check if storage buckets exist and are properly configured
export const checkStorageAvailability = async () => {
  console.log("Checking storage availability...");
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Storage availability check error:", error);
      return false;
    }
    
    const requiredBuckets = ['event-logos', 'event-banners'];
    const foundBuckets = buckets?.filter(b => requiredBuckets.includes(b.id)) || [];
    
    console.log(`Found ${foundBuckets.length} of ${requiredBuckets.length} required buckets:`, 
      foundBuckets.map(b => b.id));
    
    return foundBuckets.length === requiredBuckets.length;
  } catch (err) {
    console.error("Storage check error:", err);
    return false;
  }
};

// Improved function to initialize storage buckets with better error handling
export const initStorageBuckets = async () => {
  console.log("Initializing storage buckets...");
  
  const buckets = [
    {
      id: 'event-logos',
      name: 'Event Logos',
      public: true
    },
    {
      id: 'event-banners',
      name: 'Event Banners',
      public: true
    }
  ];
  
  const results = [];
  
  for (const bucket of buckets) {
    try {
      // Check if bucket exists
      const { data, error } = await supabase.storage.getBucket(bucket.id);
      
      if (error && error.message.includes('not found')) {
        console.log(`Creating bucket: ${bucket.id}`);
        // Create the bucket if it doesn't exist
        const { data: newBucket, error: createError } = await supabase.storage.createBucket(
          bucket.id,
          {
            public: bucket.public,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp']
          }
        );
        
        if (createError) {
          console.error(`Error creating bucket ${bucket.id}:`, createError);
          results.push({ bucket: bucket.id, success: false, error: createError });
          continue;
        }
        
        console.log(`Bucket ${bucket.id} created successfully`);
        
        // Try to update the public policy for the bucket
        try {
          const { data: policy, error: policyError } = await supabase.storage.updateBucket(
            bucket.id,
            { public: true }
          );
          
          if (policyError) {
            console.error(`Error setting public policy for bucket ${bucket.id}:`, policyError);
          } else {
            console.log(`Public policy set for bucket ${bucket.id}`);
          }
        } catch (policyErr) {
          console.error(`Error updating bucket policy: ${bucket.id}`, policyErr);
        }
        
        results.push({ bucket: bucket.id, success: true });
      } else if (error) {
        console.error(`Error checking bucket ${bucket.id}:`, error);
        results.push({ bucket: bucket.id, success: false, error });
      } else {
        console.log(`Bucket ${bucket.id} already exists`);
        
        // Make sure the bucket is public
        try {
          const { data: updateData, error: updateError } = await supabase.storage.updateBucket(
            bucket.id,
            { public: true }
          );
          
          if (updateError) {
            console.error(`Error updating bucket ${bucket.id}:`, updateError);
          } else {
            console.log(`Bucket ${bucket.id} updated to public`);
          }
        } catch (updateErr) {
          console.error(`Error ensuring bucket is public: ${bucket.id}`, updateErr);
        }
        
        results.push({ bucket: bucket.id, success: true });
      }
    } catch (err) {
      console.error(`Bucket setup error for ${bucket.id}:`, err);
      results.push({ bucket: bucket.id, success: false, error: err });
    }
  }
  
  // Check if all buckets were created successfully
  const allSuccessful = results.every(r => r.success);
  console.log("Storage buckets initialization complete. All successful:", allSuccessful);
  
  return allSuccessful;
};

// Helper function to validate an image file before upload
export const validateImageFile = (file: File): boolean => {
  // Check file type
  const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'];
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

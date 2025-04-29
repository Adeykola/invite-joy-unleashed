
import { supabase } from "@/integrations/supabase/client";

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
          }
        );
        
        if (createError) {
          console.error(`Error creating bucket ${bucket.id}:`, createError);
          throw createError;
        }
        
        console.log(`Bucket ${bucket.id} created successfully:`, newBucket);
      } else if (error) {
        console.error(`Error checking bucket ${bucket.id}:`, error);
        throw error;
      } else {
        console.log(`Bucket ${bucket.id} already exists:`, data);
      }
    } catch (err) {
      console.error(`Bucket setup error for ${bucket.id}:`, err);
      throw err;
    }
  }
  
  console.log("Storage buckets initialization complete");
};

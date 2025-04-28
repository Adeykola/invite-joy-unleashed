
import { supabase } from "@/lib/supabase";

// Create storage buckets if they don't exist
export const initStorageBuckets = async () => {
  try {
    // Check if event-logos bucket exists, if not create it
    const { data: logosExist } = await supabase.storage.getBucket("event-logos");
    
    if (!logosExist) {
      await supabase.storage.createBucket("event-logos", {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2, // 2MB limit
      });
      console.log("Created event-logos bucket");
    }
    
    // Check if event-banners bucket exists, if not create it
    const { data: bannersExist } = await supabase.storage.getBucket("event-banners");
    
    if (!bannersExist) {
      await supabase.storage.createBucket("event-banners", {
        public: true,
        fileSizeLimit: 1024 * 1024 * 5, // 5MB limit
      });
      console.log("Created event-banners bucket");
    }
    
    return true;
  } catch (error) {
    console.error("Error initializing storage buckets:", error);
    return false;
  }
};

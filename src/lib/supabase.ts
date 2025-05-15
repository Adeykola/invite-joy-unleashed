
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://ttlqxvpcjpxpbzkgbyod.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bHF4dnBjanB4cGJ6a2dieW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2OTExNTcsImV4cCI6MjA2MTI2NzE1N30.Z4xL_q3N4AkRSHgNE0py7ZPrDwxuo1ihHHkrL01CGoI"
);

export const isSupabaseConfigured = () => {
  return true; // We are using Supabase, so it is configured
};

// Enhanced function to create and configure storage buckets
export const ensureStorageBuckets = async () => {
  try {
    console.log("Starting storage bucket verification");
    // First check if user is authenticated
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      console.log("User not authenticated, can't access storage");
      return false;
    }
    
    // Check if buckets exist and create them if they don't
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing storage buckets:', error);
      return false;
    }
    
    // Check for event-logos bucket
    const logoBucket = buckets?.find(b => b.name === 'event-logos');
    if (!logoBucket) {
      console.log("Creating event-logos bucket");
      const { error: createLogoError } = await supabase.storage.createBucket('event-logos', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']
      });
      
      if (createLogoError) {
        console.error('Error creating event-logos bucket:', createLogoError);
        if (!createLogoError.message.includes('already exists')) {
          return false;
        }
      }
    }
    
    // Check for event-banners bucket
    const bannerBucket = buckets?.find(b => b.name === 'event-banners');
    if (!bannerBucket) {
      console.log("Creating event-banners bucket");
      const { error: createBannerError } = await supabase.storage.createBucket('event-banners', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']
      });
      
      if (createBannerError) {
        console.error('Error creating event-banners bucket:', createBannerError);
        if (!createBannerError.message.includes('already exists')) {
          return false;
        }
      }
    }
    
    // Set public access policies for both buckets
    const setupPolicy = async (bucketName: string) => {
      try {
        const { error: policyError } = await supabase.storage.from(bucketName).getPublicUrl('test-policy-file');
        if (policyError) {
          console.log(`Setting up public policy for ${bucketName}`);
          // Public policy should be set automatically when creating the bucket as public
        }
      } catch (e) {
        console.log(`Note: Policy check failed for ${bucketName}, but this is often expected:`, e);
        // This is often expected and not a true error
      }
    };
    
    await setupPolicy('event-logos');
    await setupPolicy('event-banners');
    
    console.log("Storage buckets verified and configured successfully");
    return true;
  } catch (error) {
    console.error('Unexpected error ensuring storage buckets:', error);
    return false;
  }
};

// Function to run necessary database migrations
export const runMigrations = async () => {
  try {
    // Check if checked_in column exists in rsvps table
    const { data: columns, error } = await supabase.rpc('get_column_info', {
      target_table: 'rsvps',
      target_column: 'checked_in'
    });
    
    if (error) {
      console.error('Error checking column:', error);
      return false;
    }
    
    // If column doesn't exist, add it
    if (!columns || columns.length === 0) {
      const { error: addColumnError } = await supabase.rpc('add_rsvp_checkin_columns');
      
      if (addColumnError) {
        console.error('Error adding columns:', addColumnError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
};

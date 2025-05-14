
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://ttlqxvpcjpxpbzkgbyod.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bHF4dnBjanB4cGJ6a2dieW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2OTExNTcsImV4cCI6MjA2MTI2NzE1N30.Z4xL_q3N4AkRSHgNE0py7ZPrDwxuo1ihHHkrL01CGoI"
);

export const ensureStorageBuckets = async () => {
  try {
    // Check if storage buckets exist
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error checking storage buckets:', error);
      return false;
    }
    
    // Check for event-images bucket
    const eventImagesBucket = buckets?.find(b => b.name === 'event-images');
    if (!eventImagesBucket) {
      // Create event-images bucket
      const { error: createError } = await supabase.storage.createBucket('event-images', {
        public: true
      });
      
      if (createError) {
        console.error('Error creating event-images bucket:', createError);
        return false;
      }
    }
    
    // Check for avatars bucket
    const avatarsBucket = buckets?.find(b => b.name === 'avatars');
    if (!avatarsBucket) {
      // Create avatars bucket
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true
      });
      
      if (createError) {
        console.error('Error creating avatars bucket:', createError);
        return false;
      }
    }
    
    // If we got here, buckets are created or already exist
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

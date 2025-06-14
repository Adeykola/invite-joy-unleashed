import { supabase } from "./supabase";

// Function to check if a storage bucket exists
export const checkStorageAvailability = async () => {
  try {
    const { data, error } = await supabase.storage.getBucket('avatars');
    if (error) {
      console.warn("Error checking storage availability:", error.message);
      return false;
    }
    return !!data;
  } catch (error) {
    console.error("Error checking storage availability:", error);
    return false;
  }
};

// Function to create the storage bucket
export const createStorageBucket = async () => {
  try {
    const { data, error } = await supabase.storage.createBucket('avatars', {
      public: false,
    });

    if (error && error.message !== 'Bucket already exists') {
      throw error;
    }

    console.log('Storage bucket created successfully');
    return true;
  } catch (error) {
    console.error('Error creating storage bucket:', error);
    return false;
  }
};

// Add WhatsApp media bucket creation
export const createWhatsAppMediaBucket = async () => {
  try {
    // Create the whatsapp-media bucket
    const { data, error } = await supabase.storage.createBucket('whatsapp-media', {
      public: false,
      allowedMimeTypes: [
        'image/jpeg',
        'image/png', 
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      fileSizeLimit: 52428800 // 50MB
    });

    if (error && error.message !== 'Bucket already exists') {
      throw error;
    }

    console.log('WhatsApp media bucket created successfully');
    return true;
  } catch (error) {
    console.error('Error creating WhatsApp media bucket:', error);
    return false;
  }
};

// Function to initialize storage buckets
export const initStorageBuckets = async () => {
  try {
    const results = await Promise.all([
      createStorageBucket(),
      createWhatsAppMediaBucket()
    ]);
    
    return results.every(result => result === true);
  } catch (error) {
    console.error('Error initializing storage buckets:', error);
    return false;
  }
};

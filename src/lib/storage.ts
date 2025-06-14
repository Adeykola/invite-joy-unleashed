
import { supabase } from "./supabase";

// Function to validate image files
export const validateImageFile = (file: File): boolean => {
  // Check file size (max 5MB for logos, 10MB for banners)
  const maxSize = file.name.includes('logo') ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return false;
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return false;
  }
  
  return true;
};

// Function to check if storage buckets exist and are accessible
export const checkStorageAvailability = async (retries: number = 1) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Check both event image buckets
      const { data: logoBucket, error: logoError } = await supabase.storage.getBucket('event-logos');
      const { data: bannerBucket, error: bannerError } = await supabase.storage.getBucket('event-banners');
      
      if (logoError || bannerError) {
        console.warn("Error checking storage availability:", logoError || bannerError);
        if (attempt === retries - 1) return false;
        continue;
      }
      
      return !!(logoBucket && bannerBucket);
    } catch (error) {
      console.error("Error checking storage availability:", error);
      if (attempt === retries - 1) return false;
    }
  }
  return false;
};

// Function to create the event image storage buckets
export const createEventStorageBuckets = async () => {
  try {
    // Create event-logos bucket
    const { error: logoError } = await supabase.storage.createBucket('event-logos', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (logoError && logoError.message !== 'Bucket already exists') {
      console.error('Error creating event-logos bucket:', logoError);
    }

    // Create event-banners bucket
    const { error: bannerError } = await supabase.storage.createBucket('event-banners', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 10485760 // 10MB
    });

    if (bannerError && bannerError.message !== 'Bucket already exists') {
      console.error('Error creating event-banners bucket:', bannerError);
    }

    console.log('Event storage buckets created successfully');
    return true;
  } catch (error) {
    console.error('Error creating event storage buckets:', error);
    return false;
  }
};

// Legacy function for backward compatibility
export const createStorageBucket = async () => {
  return createEventStorageBuckets();
};

// Legacy function for backward compatibility
export const createWhatsAppMediaBucket = async () => {
  try {
    const { error } = await supabase.storage.createBucket('whatsapp-media', {
      public: false,
      allowedMimeTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/quicktime', 'video/x-msvideo',
        'audio/mpeg', 'audio/wav', 'audio/ogg',
        'application/pdf', 'application/msword',
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
      createEventStorageBuckets(),
      createWhatsAppMediaBucket()
    ]);
    
    return results.every(result => result === true);
  } catch (error) {
    console.error('Error initializing storage buckets:', error);
    return false;
  }
};

// Function to upload a file to the appropriate bucket
export const uploadEventImage = async (
  file: File, 
  type: 'logo' | 'banner'
): Promise<{ url: string | null; error: string | null }> => {
  try {
    // Validate file
    if (!validateImageFile(file)) {
      return {
        url: null,
        error: `Invalid file: ${file.name}. Must be an image under ${type === 'logo' ? '5MB' : '10MB'}.`
      };
    }

    const bucket = type === 'logo' ? 'event-logos' : 'event-banners';
    
    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    console.log(`Uploading ${type} to ${bucket}/${fileName}`);
    
    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });
    
    if (error) {
      console.error(`Storage upload error:`, error);
      return {
        url: null,
        error: `Failed to upload ${type}: ${error.message}`
      };
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    if (!publicUrlData?.publicUrl) {
      return {
        url: null,
        error: "Failed to get public URL for uploaded file"
      };
    }
    
    console.log(`${type} uploaded successfully:`, publicUrlData.publicUrl);
    
    return {
      url: publicUrlData.publicUrl,
      error: null
    };
  } catch (error: any) {
    console.error(`Error uploading ${type}:`, error);
    return {
      url: null,
      error: error?.message || `Failed to upload ${type}`
    };
  }
};

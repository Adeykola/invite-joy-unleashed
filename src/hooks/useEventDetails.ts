
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define the event type with a more flexible meta type
export type EventType = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity?: number;
  host_id?: string;
  banner_image?: string;
  tags?: string[];
  meta?: Record<string, any> | null;
};

// Define the host profile type
export type HostProfile = {
  full_name?: string;
  email?: string;
};

export const useEventDetails = (id: string | undefined) => {
  const [event, setEvent] = useState<EventType | null>(null);
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!id) {
          throw new Error('Event ID is missing');
        }
        
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error('Event not found');
        }
        
        // Transform the data to match our EventType
        const eventData: EventType = {
          id: data.id,
          title: data.title,
          description: data.description,
          date: data.date,
          location: data.location,
          capacity: data.capacity,
          host_id: data.host_id,
          banner_image: data.banner_image,
          tags: data.tags,
          // Convert meta to a proper object if needed
          meta: typeof data.meta === 'string' 
            ? JSON.parse(data.meta) 
            : data.meta
        };
        
        setEvent(eventData);
        
        // Fetch host details if available
        if (data.host_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', data.host_id)
            .single();
            
          if (!profileError && profileData) {
            setHostProfile(profileData);
          }
        }
      } catch (err: any) {
        console.error('Error fetching event:', err);
        setError(err.message || 'Failed to load event details');
        toast({
          title: 'Error',
          description: 'Failed to load event details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [id, toast]);

  return { event, hostProfile, isLoading, error };
};

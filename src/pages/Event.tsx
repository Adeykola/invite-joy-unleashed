
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageLayout from '@/components/layouts/PageLayout';
import { RsvpDialog } from '@/components/events/RsvpDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define the event type with a more flexible meta type
type EventType = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity?: number;
  host_id?: string;
  meta?: Record<string, any> | null;
};

// Define the host profile type
type HostProfile = {
  full_name?: string;
  email?: string;
};

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventType | null>(null);
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showRsvpDialog, setShowRsvpDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
  
  const handleBack = () => {
    navigate(-1);
  };

  const getFormattedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: format(date, 'EEEE, MMMM d, yyyy'),
        time: format(date, 'h:mm a')
      };
    } catch (err) {
      return {
        date: 'Date not available',
        time: 'Time not available'
      };
    }
  };

  const getBannerStyle = () => {
    if (!event?.meta) return {};
    
    const { primaryColor, customBannerUrl } = event.meta as {
      primaryColor?: string;
      customBannerUrl?: string;
    };
    
    return {
      backgroundColor: primaryColor || '#4f46e5',
      backgroundImage: customBannerUrl ? `url(${customBannerUrl})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  };
  
  return (
    <PageLayout>
      <div className="container max-w-4xl py-8">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="flex-1"></div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold mb-4">Error Loading Event</h2>
                <p className="mb-4 text-muted-foreground">{error}</p>
                <Button asChild>
                  <Link to="/events">View All Events</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : event ? (
          <div className="space-y-6">
            <div
              className="rounded-lg h-48 md:h-64 w-full flex items-center justify-center text-white"
              style={getBannerStyle()}
            >
              {event.meta && (event.meta as any).customLogoUrl ? (
                <img 
                  src={(event.meta as any).customLogoUrl} 
                  alt={`${event.title} logo`}
                  className="max-h-24 max-w-xs"
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-bold px-6 text-center">
                  {event.title}
                </h1>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <Card>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-2">About This Event</h3>
                        <p className="text-muted-foreground">{event.description || 'No description provided.'}</p>
                      </div>
                      
                      {hostProfile && (
                        <div>
                          <h3 className="font-semibold mb-2">Hosted By</h3>
                          <p>{hostProfile.full_name || hostProfile.email || 'Event Host'}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="w-full md:w-80">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                        <div>
                          <h3 className="font-semibold">Date & Time</h3>
                          <p className="text-muted-foreground">{getFormattedDate(event.date).date}</p>
                          <p className="text-muted-foreground">{getFormattedDate(event.date).time}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                        <div>
                          <h3 className="font-semibold">Location</h3>
                          <p className="text-muted-foreground">{event.location || 'No location provided'}</p>
                        </div>
                      </div>
                      
                      {typeof event.capacity === 'number' && event.capacity > 0 && (
                        <div className="pt-2">
                          <p className="text-sm text-muted-foreground">
                            Capacity: {event.capacity} guests
                          </p>
                        </div>
                      )}
                      
                      <div className="pt-4">
                        <Button 
                          className="w-full" 
                          onClick={() => setShowRsvpDialog(true)}
                        >
                          RSVP to this Event
                        </Button>
                        {event.id && (
                          <RsvpDialog 
                            eventId={event.id} 
                            isOpen={showRsvpDialog}
                            onOpenChange={setShowRsvpDialog}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold mb-4">Event Not Found</h2>
                <p className="mb-4 text-muted-foreground">Sorry, we couldn't find the event you're looking for.</p>
                <Button asChild>
                  <Link to="/events">View All Events</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}

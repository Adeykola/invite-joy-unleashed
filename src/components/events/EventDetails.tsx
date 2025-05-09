
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RsvpDialog } from '@/components/events/RsvpDialog';
import { format } from 'date-fns';

interface EventDetailsProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    capacity?: number;
    host_id?: string;
  };
  hostProfile: {
    full_name?: string;
    email?: string;
  } | null;
  showRsvpDialog: boolean;
  setShowRsvpDialog: (show: boolean) => void;
}

export const EventDetails = ({ 
  event, 
  hostProfile, 
  showRsvpDialog, 
  setShowRsvpDialog 
}: EventDetailsProps) => {
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
  
  return (
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
  );
};

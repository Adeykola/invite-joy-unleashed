import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users, Tag, Image as ImageIcon, Check, HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface EventMeta {
  customBannerUrl?: string;
  customLogoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  mealOptions?: string[];
  virtualMeetingUrl?: string;
  virtualMeetingId?: string;
  tags?: string[];
  eventType?: string;
  [key: string]: unknown;
}

interface EventDetailsProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    capacity?: number;
    host_id?: string;
    banner_image?: string;
    meta?: EventMeta | string | null;
    tags?: string[];
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
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRsvpForm, setShowRsvpForm] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  
  // Parse meta data
  const meta: EventMeta = typeof event.meta === 'string' 
    ? JSON.parse(event.meta) 
    : (event.meta || {});
  
  const bannerImage = event.banner_image || meta.customBannerUrl;
  const logoImage = meta.customLogoUrl;
  const primaryColor = meta.primaryColor || 'hsl(var(--primary))';
  const tags = event.tags || meta.tags || [];

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

  const handleRsvp = async (status: 'confirmed' | 'maybe' | 'declined') => {
    if (!guestName.trim() || !guestEmail.trim()) {
      toast({
        title: "Required fields",
        description: "Please enter your name and email",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if RSVP already exists
      const { data: existingRsvp } = await supabase
        .from('rsvps')
        .select('id')
        .eq('event_id', event.id)
        .eq('guest_email', guestEmail)
        .maybeSingle();

      if (existingRsvp) {
        // Update existing RSVP
        const { error } = await supabase
          .from('rsvps')
          .update({ 
            response_status: status,
            guest_name: guestName
          })
          .eq('id', existingRsvp.id);

        if (error) throw error;
      } else {
        // Create new RSVP
        const { error } = await supabase
          .from('rsvps')
          .insert({
            event_id: event.id,
            guest_name: guestName,
            guest_email: guestEmail,
            response_status: status
          });

        if (error) throw error;
      }

      toast({
        title: "RSVP Submitted",
        description: status === 'confirmed' 
          ? "Great! You're going to this event." 
          : status === 'maybe' 
            ? "We've noted you might attend."
            : "We've recorded that you can't attend."
      });

      setShowRsvpForm(false);
      setGuestName('');
      setGuestEmail('');
    } catch (error: any) {
      console.error('RSVP error:', error);
      toast({
        title: "Error",
        description: "Failed to submit RSVP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Banner Image */}
      {bannerImage && (
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
          <img 
            src={bannerImage} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          {logoImage && (
            <div className="absolute bottom-4 left-4 bg-background/90 p-2 rounded-lg shadow-lg">
              <img 
                src={logoImage} 
                alt="Event logo"
                className="h-12 w-auto"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-2xl">{event.title}</CardTitle>
                {meta.eventType && (
                  <Badge variant="secondary" className="capitalize">
                    {meta.eventType}
                  </Badge>
                )}
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">About This Event</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {event.description || 'No description provided.'}
                  </p>
                </div>
                
                {meta.mealOptions && meta.mealOptions.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Meal Options</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {meta.mealOptions.map((option, index) => (
                        <li key={index}>{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
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
        
        <div className="w-full md:w-96">
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
                  <div className="flex items-start">
                    <Users className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                    <div>
                      <h3 className="font-semibold">Capacity</h3>
                      <p className="text-muted-foreground">{event.capacity} guests</p>
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t space-y-3">
                  <h3 className="font-semibold text-center mb-3">RSVP to this Event</h3>
                  
                  {!showRsvpForm ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant="default"
                          className="flex flex-col h-auto py-3"
                          onClick={() => setShowRsvpForm(true)}
                        >
                          <Check className="h-5 w-5 mb-1" />
                          <span className="text-xs">Going</span>
                        </Button>
                        <Button 
                          variant="secondary"
                          className="flex flex-col h-auto py-3"
                          onClick={() => setShowRsvpForm(true)}
                        >
                          <HelpCircle className="h-5 w-5 mb-1" />
                          <span className="text-xs">Maybe</span>
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex flex-col h-auto py-3"
                          onClick={() => setShowRsvpForm(true)}
                        >
                          <X className="h-5 w-5 mb-1" />
                          <span className="text-xs">Can't Go</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="guestName">Your Name</Label>
                        <Input
                          id="guestName"
                          placeholder="Enter your name"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guestEmail">Your Email</Label>
                        <Input
                          id="guestEmail"
                          type="email"
                          placeholder="Enter your email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant="default"
                          size="sm"
                          disabled={isSubmitting}
                          onClick={() => handleRsvp('confirmed')}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Going
                        </Button>
                        <Button 
                          variant="secondary"
                          size="sm"
                          disabled={isSubmitting}
                          onClick={() => handleRsvp('maybe')}
                        >
                          <HelpCircle className="h-4 w-4 mr-1" />
                          Maybe
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          disabled={isSubmitting}
                          onClick={() => handleRsvp('declined')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Can't Go
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setShowRsvpForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

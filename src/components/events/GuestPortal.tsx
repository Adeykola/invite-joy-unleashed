
import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RsvpForm } from "@/components/RsvpForm";
import { Calendar, MapPin, Clock, QrCode, Utensils, Users, MessageCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import QRCode from "../QRCode";

const GuestPortal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showQrCode, setShowQrCode] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  
  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ["event-details", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      return data;
    },
  });

  // Fetch rsvp status if user provided their info
  const { data: rsvpStatus, isLoading: rsvpLoading } = useQuery({
    queryKey: ["rsvp-status", id, guestEmail],
    queryFn: async () => {
      if (!guestEmail) return null;
      
      const { data, error } = await supabase
        .from("rsvps")
        .select("*")
        .eq("event_id", id)
        .eq("guest_email", guestEmail)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    },
    enabled: !!guestEmail && !!id,
  });

  if (eventLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>Event Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const meta = typeof event.meta === 'string' ? JSON.parse(event.meta) : event.meta || {};
  const hasVirtualDetails = meta?.virtualMeetingUrl || meta?.virtualMeetingId;
  const hasMealOptions = meta?.mealOptions && meta.mealOptions.length > 0;
  
  const handleShowQrCode = () => {
    if (!guestEmail) {
      toast({
        title: "Please enter your details first",
        description: "You need to RSVP to get your check-in QR code",
        variant: "destructive",
      });
      return;
    }
    
    if (!rsvpStatus || rsvpStatus?.response_status !== "confirmed") {
      toast({
        title: "RSVP Required",
        description: "You need to confirm your attendance to get a check-in QR code",
        variant: "destructive",
      });
      return;
    }
    
    setShowQrCode(true);
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="overflow-hidden">
        {/* Event Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{format(new Date(event.date), "PPP")}</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>{format(new Date(event.date), "p")}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              <span>{event.location}</span>
            </div>
            {event.capacity && (
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <span>Capacity: {event.capacity}</span>
              </div>
            )}
          </div>
        </div>
        
        <CardContent className="p-8">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-8 w-full justify-start">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="rsvp">RSVP</TabsTrigger>
              {hasVirtualDetails && (
                <TabsTrigger value="virtual">Virtual Access</TabsTrigger>
              )}
              <TabsTrigger value="checkin">Check-in</TabsTrigger>
            </TabsList>
            
            {/* Event Details Tab */}
            <TabsContent value="details">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">About this Event</h3>
                  <p className="text-gray-700">{event.description || "No description provided."}</p>
                </div>

                {hasMealOptions && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <Utensils className="mr-2 h-5 w-5" /> Meal Options
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {meta.mealOptions.map((option: string, index: number) => (
                        <li key={index}>{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <MessageCircle className="mr-2 h-5 w-5" /> Contact
                  </h3>
                  <p className="text-gray-700">
                    If you have any questions about this event, please contact the host.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            {/* RSVP Tab */}
            <TabsContent value="rsvp">
              {rsvpStatus ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-2">Your RSVP Status</h3>
                    <div className="flex items-center mb-4">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        rsvpStatus.response_status === 'confirmed' ? 'bg-green-500' : 
                        rsvpStatus.response_status === 'declined' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className="font-medium">
                        {rsvpStatus.response_status === 'confirmed' ? 'You are attending' :
                         rsvpStatus.response_status === 'declined' ? 'You are not attending' : 'You might attend'}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDialog(true)}
                    >
                      Update RSVP
                    </Button>
                  </div>
                </div>
              ) : (
                <RsvpForm eventId={event.id} mealOptions={meta?.mealOptions} />
              )}
            </TabsContent>
            
            {/* Virtual Access Tab */}
            {hasVirtualDetails && (
              <TabsContent value="virtual">
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Virtual Meeting Details</h3>
                    
                    {(!rsvpStatus || rsvpStatus.response_status !== "confirmed") ? (
                      <div className="text-center py-6">
                        <p className="text-gray-700 mb-4">
                          Please RSVP to this event to get access to the virtual meeting details.
                        </p>
                        <Button onClick={() => setShowDialog(true)}>
                          RSVP Now
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {meta.virtualMeetingUrl && (
                          <div>
                            <p className="font-medium text-gray-700">Meeting Link:</p>
                            <a 
                              href={meta.virtualMeetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline block mt-1"
                            >
                              {meta.virtualMeetingUrl}
                            </a>
                          </div>
                        )}
                        
                        {meta.virtualMeetingId && (
                          <div>
                            <p className="font-medium text-gray-700">Meeting ID:</p>
                            <p className="font-mono bg-white p-2 rounded border mt-1">
                              {meta.virtualMeetingId}
                            </p>
                          </div>
                        )}
                        
                        {meta.virtualMeetingPassword && (
                          <div>
                            <p className="font-medium text-gray-700">Password:</p>
                            <p className="font-mono bg-white p-2 rounded border mt-1">
                              {meta.virtualMeetingPassword}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            )}
            
            {/* Check-in Tab */}
            <TabsContent value="checkin">
              <div className="space-y-6">
                <div className="bg-gray-50 border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <QrCode className="mr-2 h-5 w-5" /> Event Check-in
                  </h3>
                  
                  {showQrCode ? (
                    <div className="text-center">
                      <div className="bg-white p-4 rounded-lg inline-block mb-4 shadow-sm">
                        <QRCode 
                          value={`${window.location.origin}/check-in/${event.id}/${rsvpStatus?.id}`}
                          size={200}
                        />
                      </div>
                      <p className="text-sm text-gray-600 max-w-md mx-auto">
                        Present this QR code at the event entrance for contactless check-in.
                        We recommend taking a screenshot for offline access.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 mb-4">
                        Get your personal QR code for seamless check-in at the event.
                      </p>
                      <Button onClick={handleShowQrCode}>
                        Generate Check-in QR Code
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestPortal;

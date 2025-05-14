
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert-custom";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Calendar, Clock, MapPin, Info, Loader2 } from "lucide-react";
import { format } from "date-fns";

export function GuestCheckIn() {
  const { eventId, rsvpId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  
  // Get event details
  const { data: event, isLoading: isEventLoading } = useQuery({
    queryKey: ["event-checkin", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();
        
      if (error) throw error;
      return data;
    },
  });
  
  // If we have an RSVP ID, get that specific RSVP
  const { data: rsvp, isLoading: isRsvpLoading } = useQuery({
    queryKey: ["rsvp-checkin", rsvpId],
    enabled: !!rsvpId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rsvps")
        .select("*")
        .eq("id", rsvpId)
        .single();
        
      if (error) throw error;
      return data;
    },
  });
  
  // Check if already checked in when RSVP loads
  useEffect(() => {
    if (rsvp && rsvp.checked_in) {
      setIsCheckedIn(true);
    }
  }, [rsvp]);
  
  // Handle email verification if we don't have an RSVP ID
  const handleVerifyEmail = async () => {
    if (!email || !eventId) return;
    
    setIsVerifying(true);
    
    try {
      // Find RSVP with matching email for this event
      const { data, error } = await supabase
        .from("rsvps")
        .select("*")
        .eq("event_id", eventId)
        .ilike("guest_email", email)
        .single();
        
      if (error) throw error;
      
      if (data) {
        navigate(`/check-in/${eventId}/${data.id}`);
      } else {
        toast({
          title: "Verification Failed",
          description: "No RSVP found with this email address",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Could not verify your email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Handle check-in
  const handleCheckIn = async () => {
    if (!rsvpId) return;
    
    try {
      const updateData: any = {
        checked_in: true,
        check_in_time: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from("rsvps")
        .update(updateData)
        .eq("id", rsvpId);
        
      if (error) throw error;
      
      setIsCheckedIn(true);
      toast({
        title: "Checked In",
        description: "You have successfully checked in to the event",
      });
      
    } catch (error) {
      console.error("Error checking in:", error);
      toast({
        title: "Check-in Error",
        description: "Failed to check you in. Please try again or ask for assistance.",
        variant: "destructive",
      });
    }
  };
  
  // Loading state
  if (isEventLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2">Loading event details...</p>
        </div>
      </div>
    );
  }
  
  // Event not found
  if (!event) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto mt-8">
        <AlertTitle>Event Not Found</AlertTitle>
        <AlertDescription>
          This event may have been cancelled or the link is invalid.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>Event Check-in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(event.date), "PPPP")}</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(event.date), "p")}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          </div>
          
          {rsvpId ? (
            isRsvpLoading ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="mt-2">Verifying your RSVP...</p>
              </div>
            ) : rsvp ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium">RSVP Details</h3>
                  <p className="mt-1">Name: {rsvp.guest_name}</p>
                  <p>Email: {rsvp.guest_email}</p>
                </div>
                
                {isCheckedIn ? (
                  <Alert variant="default" className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle className="text-green-700">Checked In</AlertTitle>
                    <AlertDescription className="text-green-600">
                      You have already checked in to this event {rsvp.check_in_time ? `at ${format(new Date(rsvp.check_in_time), "p")}` : ""}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Button onClick={handleCheckIn} className="w-full">Check In Now</Button>
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertTitle>RSVP Not Found</AlertTitle>
                <AlertDescription>
                  We couldn't find your RSVP details. Please verify your information.
                </AlertDescription>
              </Alert>
            )
          ) : (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Please enter the email address you used for your RSVP.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button 
                  onClick={handleVerifyEmail} 
                  className="w-full"
                  disabled={isVerifying || !email}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Check In"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-center text-muted-foreground">
            If you're having trouble checking in, please speak with an event staff member.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
